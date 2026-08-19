import React, { useState } from 'react';
import { useBluetooth } from '../../context/BluetoothContext';
import { useSettings } from '../../context/SettingsContext';
import { Type, Send, CornerDownLeft, Trash2, Copy, Sparkles, Terminal } from 'lucide-react';

export const TextPanel: React.FC = () => {
  const { connectionState, sendFramedAscii, sendPacket } = useBluetooth();
  const { settings } = useSettings();

  const [text, setText] = useState('');
  const [autoEnter, setAutoEnter] = useState(true);
  const [clearOnSend, setClearOnSend] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);

  const presets = [
    { label: 'Notepad', text: 'notepad.exe' },
    { label: 'PowerShell', text: 'powershell.exe' },
    { label: 'Calc', text: 'calc.exe' },
    { label: 'Hello World', text: 'Hello World!' },
    { label: 'Terminal', text: 'gnome-terminal' },
  ];

  const handleSendText = async () => {
    if (!text.trim()) return;

    setIsSending(true);
    setStatusText('Sending text to host PC...');

    try {
      if (settings.protocolMode === 'framed_ascii') {
        const escaped = text.replace(/"/g, '\\"').replace(/\n/g, '\\n');
        let commandStr = `type "${escaped}"`;
        if (autoEnter) {
          commandStr += ' && enter';
        }
        const success = await sendFramedAscii(commandStr, 'confirm');
        if (success) {
          setStatusText('Text successfully transmitted!');
          if (clearOnSend) setText('');
        } else {
          setStatusText('Failed to transmit text.');
        }
      } else {
        const encoder = new TextEncoder();
        const bytes = encoder.encode(text);

        for (let i = 0; i < bytes.length; i++) {
          const b = bytes[i];
          const packet = new Uint8Array([0x80, b, 0]);
          await sendPacket(packet, 'subtle');
          await new Promise((r) => setTimeout(r, 10));
        }

        if (autoEnter) {
          await sendPacket(new Uint8Array([0x21]), 'confirm');
        }

        setStatusText('Text stream sent successfully!');
        if (clearOnSend) setText('');
      }
    } catch (err: any) {
      setStatusText('Transmission error: ' + err.message);
    } finally {
      setIsSending(false);
      setTimeout(() => setStatusText(null), 3000);
    }
  };

  const handlePresetClick = (presetText: string) => {
    setText((prev) => (prev ? `${prev}\n${presetText}` : presetText));
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(text);
    setStatusText('Copied to clipboard!');
    setTimeout(() => setStatusText(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col space-y-5">
      {/* Header Card */}
      <div className="glass-card rounded-2xl p-5 shadow-xl flex items-center justify-between border-brand-500/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
            <Type className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Text Keyboard Injector</h2>
            <p className="text-xs text-slate-400">Type or paste text to transmit via USB HID</p>
          </div>
        </div>

        {text && (
          <button
            onClick={() => setText('')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-colors"
            title="Clear Textarea"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Textarea Card */}
      <div className="glass-card rounded-2xl p-4 space-y-3 shadow-xl border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
          <span className="font-semibold text-slate-300 flex items-center space-x-1.5">
            <Terminal className="w-3.5 h-3.5 text-brand-400" />
            <span>Text Input Area</span>
          </span>
          <span className="font-mono text-[10px]">
            {text.length} chars • ~{Math.ceil(text.length * 0.05)}s est.
          </span>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste any text, commands, or code here..."
          rows={6}
          className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 resize-none transition-all placeholder:text-slate-600"
        />

        {/* Quick Utility Actions */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyText}
              disabled={!text}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-medium transition-colors flex items-center space-x-1 disabled:opacity-40"
            >
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </button>
          </div>

          {/* Options Toggles */}
          <div className="flex items-center space-x-3 text-xs">
            <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={autoEnter}
                onChange={(e) => setAutoEnter(e.target.checked)}
                className="rounded border-slate-700 text-brand-500 focus:ring-brand-500 bg-slate-900"
              />
              <span className="text-[11px] font-medium flex items-center space-x-1">
                <CornerDownLeft className="w-3 h-3 text-slate-400" />
                <span>+ Enter</span>
              </span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={clearOnSend}
                onChange={(e) => setClearOnSend(e.target.checked)}
                className="rounded border-slate-700 text-brand-500 focus:ring-brand-500 bg-slate-900"
              />
              <span className="text-[11px] font-medium">Clear on send</span>
            </label>
          </div>
        </div>
      </div>

      {/* Preset Quick Snippets */}
      <div className="glass-card rounded-2xl p-4 space-y-3 shadow-xl">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Quick Template Snippets</span>
        </h3>

        <div className="flex flex-wrap gap-2">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handlePresetClick(preset.text)}
              className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-brand-300 transition-all active:scale-95 flex items-center space-x-1.5"
            >
              <span>+</span>
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Status Feedback Toast */}
      {statusText && (
        <div className="glass-card rounded-xl p-3 text-center border-brand-500/30 bg-brand-500/10">
          <p className="text-xs font-medium text-brand-300">{statusText}</p>
        </div>
      )}

      {/* Primary Send Button */}
      <button
        onClick={handleSendText}
        disabled={!text.trim() || isSending || connectionState !== 'connected'}
        className={`w-full py-3.5 rounded-2xl font-bold text-sm shadow-xl transition-all duration-150 active:scale-98 flex items-center justify-center space-x-2 ${
          connectionState === 'connected' && text.trim()
            ? 'bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-400 hover:to-indigo-500 text-white shadow-brand-500/25'
            : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
        }`}
      >
        <Send className={`w-4 h-4 ${isSending ? 'animate-bounce' : ''}`} />
        <span>
          {connectionState !== 'connected'
            ? 'Connect BLE Device to Transmit'
            : isSending
            ? 'Transmitting Text...'
            : 'Send Text to Device'}
        </span>
      </button>
    </div>
  );
};
