import React, { useState } from 'react';
import { useBluetooth } from '../../context/BluetoothContext';
import { useSettings } from '../../context/SettingsContext';
import { Type, Send, CornerDownLeft, Trash2, Copy, Sparkles, Terminal, Check } from 'lucide-react';

export const TextPanel: React.FC = () => {
  const { connectionState, sendFramedAscii, sendPacket } = useBluetooth();
  const { settings, t } = useSettings();

  const [text, setText] = useState('');
  const [autoEnter, setAutoEnter] = useState(true);
  const [clearOnSend, setClearOnSend] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const presets = [
    { label: 'Spotlight', text: settings.targetOs === 'macos' ? 'open -a Terminal' : 'powershell.exe' },
    { label: 'Notepad / Editor', text: settings.targetOs === 'macos' ? 'open -a TextEdit' : 'notepad.exe' },
    { label: 'System Info', text: settings.targetOs === 'macos' ? 'system_profiler SPSoftwareDataType' : 'systeminfo' },
    { label: 'Hello World', text: 'Hello from Rubber Otter!' },
  ];

  const handleSendText = async () => {
    if (!text.trim()) return;

    setIsSending(true);
    setStatusText(t('text.transmitting'));

    try {
      if (settings.protocolMode === 'framed_ascii') {
        const escaped = text.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
        let commandStr = `type "${escaped}"`;
        if (autoEnter) {
          commandStr += ' && enter';
        }
        const success = await sendFramedAscii(commandStr, 'confirm');
        if (success) {
          setStatusText(t('text.success'));
          if (clearOnSend) setText('');
        } else {
          setStatusText(t('text.failed'));
        }
      } else {
        const encoder = new TextEncoder();
        const bytes = encoder.encode(text);

        for (let i = 0; i < bytes.length; i++) {
          const b = bytes[i];
          const packet = new Uint8Array([0x80, b, 0]);
          await sendPacket(packet, 'subtle');
          await new Promise((r) => setTimeout(r, 12));
        }

        if (autoEnter) {
          await sendPacket(new Uint8Array([0x21]), 'confirm');
        }

        setStatusText(t('text.success'));
        if (clearOnSend) setText('');
      }
    } catch (err: any) {
      setStatusText('Error: ' + err.message);
    } finally {
      setIsSending(false);
      setTimeout(() => setStatusText(null), 2500);
    }
  };

  const handlePresetClick = (presetText: string) => {
    setText(presetText);
  };

  const handleCopyText = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex-1 flex flex-col space-y-4">
      {/* Header Info Card */}
      <div className="instrument-card rounded-xl p-4 sm:p-5 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center text-otter-600 dark:text-otter-400 shadow-subtle">
            <Type className="w-5 h-5 text-otter-600 dark:text-otter-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t('text.title')}</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {t('text.description')}
            </p>
          </div>
        </div>

        {text && (
          <button
            onClick={() => setText('')}
            className="btn-tactile p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-500 hover:text-rose-500 dark:text-zinc-400 dark:hover:text-rose-400 border border-zinc-200 dark:border-zinc-800 transition-colors"
            title={t('text.clear')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Editor & Payload Input Card */}
      <div className="instrument-card rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pb-1">
          <span className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center space-x-1.5">
            <Terminal className="w-3.5 h-3.5 text-otter-600 dark:text-otter-400" />
            <span>{t('text.payloadContent')}</span>
          </span>
          <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500">
            {text.length} {t('text.chars')} • ~{Math.max(1, Math.ceil(text.length * 0.04))}s {t('text.duration')}
          </span>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('text.placeholder')}
          rows={5}
          className="w-full bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-xs font-mono text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-otter-500 focus:ring-1 focus:ring-otter-500/30 resize-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
        />

        {/* Toolbar & Options */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-zinc-200 dark:border-zinc-800/80">
          <button
            onClick={handleCopyText}
            disabled={!text}
            className="btn-tactile px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-xs font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 flex items-center space-x-1.5 disabled:opacity-40"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />}
            <span>{copied ? t('text.copied') : t('text.copy')}</span>
          </button>

          <div className="flex items-center space-x-4 text-xs">
            <label className="flex items-center space-x-1.5 cursor-pointer text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={autoEnter}
                onChange={(e) => setAutoEnter(e.target.checked)}
                className="rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-otter-500 focus:ring-otter-500"
              />
              <span className="text-xs font-medium flex items-center space-x-1">
                <span>{t('text.autoEnter')}</span>
                <CornerDownLeft className="w-3 h-3 text-zinc-400" />
              </span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={clearOnSend}
                onChange={(e) => setClearOnSend(e.target.checked)}
                className="rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-otter-500 focus:ring-otter-500"
              />
              <span className="text-xs font-medium">{t('text.clearOnSend')}</span>
            </label>
          </div>
        </div>
      </div>

      {/* Quick Macro Presets */}
      <div className="instrument-card rounded-xl p-4 space-y-2.5">
        <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-otter-600 dark:text-otter-400" />
          <span>{t('text.quickSnippets')}</span>
        </h3>

        <div className="flex flex-wrap gap-2">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handlePresetClick(preset.text)}
              className="btn-tactile px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100 flex items-center space-x-1.5"
            >
              <span className="text-zinc-400 dark:text-zinc-500">+</span>
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Status Feedback */}
      {statusText && (
        <div className="rounded-lg p-2.5 text-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300">
          <span>{statusText}</span>
        </div>
      )}

      {/* Main Transmit Button */}
      <button
        onClick={handleSendText}
        disabled={!text.trim() || isSending || connectionState !== 'connected'}
        className={`btn-tactile w-full py-3 rounded-xl font-semibold text-xs flex items-center justify-center space-x-2 border shadow-sm ${
          connectionState === 'connected' && text.trim()
            ? 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 border-zinc-900 dark:border-zinc-200'
            : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-500 border-zinc-200 dark:border-zinc-800 cursor-not-allowed'
        }`}
      >
        <Send className={`w-3.5 h-3.5 ${isSending ? 'animate-bounce' : ''}`} />
        <span>
          {connectionState !== 'connected'
            ? t('text.connectToTransmit')
            : isSending
            ? t('text.transmittingBtn')
            : t('text.transmitBtn')}
        </span>
      </button>
    </div>
  );
};
