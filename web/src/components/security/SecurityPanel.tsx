import React, { useState } from 'react';
import { useBluetooth } from '../../context/BluetoothContext';
import { useSettings } from '../../context/SettingsContext';
import { PROTOCOL } from '../../protocol/byteMap';
import { Lock, MousePointer, Cpu, LayoutGrid, Smartphone, Activity, Play } from 'lucide-react';

export const SecurityPanel: React.FC = () => {
  const { sendByte, sendFramedAscii, triggerVibrate } = useBluetooth();
  const { settings, t } = useSettings();
  const [jigglerActive, setJigglerActive] = useState(false);

  const handleJigglerToggle = () => {
    const newState = !jigglerActive;
    setJigglerActive(newState);
    if (settings.protocolMode === 'framed_ascii') {
      sendFramedAscii(newState ? 'jiggler on' : 'jiggler off', 'toggle');
    } else {
      sendByte(PROTOCOL.SEC_JIGGLER_TOGGLE, 'toggle');
    }
  };

  const handleTestJigglePulse = () => {
    if (settings.protocolMode === 'framed_ascii') {
      sendFramedAscii('jiggler toggle', 'subtle');
    } else {
      sendByte(PROTOCOL.SEC_JIGGLER_TOGGLE, 'subtle');
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-4">
      {/* Lock Workstation Primary Card */}
      <button
        onClick={() => sendByte(PROTOCOL.SEC_LOCK_WORKSTATION, 'alert')}
        className="btn-tactile instrument-card hover:bg-rose-50 dark:hover:bg-rose-950/20 border-rose-500/30 rounded-xl p-5 sm:p-6 flex items-center justify-between text-left group"
      >
        <div className="flex items-center space-x-4">
          <div className="w-11 h-11 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:bg-rose-500/20 transition-colors">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-rose-700 dark:text-rose-200">{t('security.lockTitle')}</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {t('security.lockDesc')} ({settings.targetOs === 'macos' ? 'Ctrl + Cmd + Q' : 'Win + L'})
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-600 dark:text-zinc-400">
          0x31
        </span>
      </button>

      {/* Vibration Motor Haptics */}
      <div className="instrument-card rounded-xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center space-x-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center text-amber-500 dark:text-amber-400">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">{t('security.hapticsTitle')}</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{t('security.hapticsDesc')}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <button
            onClick={() => triggerVibrate(100)}
            className="btn-tactile p-3 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 text-center text-zinc-800 dark:text-zinc-200 group"
          >
            <Activity className="w-4 h-4 text-amber-500 dark:text-amber-400 mx-auto mb-1" />
            <span className="text-xs font-semibold block">{t('security.pulse100')}</span>
            <span className="text-[10px] text-zinc-500">{t('security.shortPulse')}</span>
          </button>

          <button
            onClick={() => triggerVibrate(300)}
            className="btn-tactile p-3 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 text-center text-zinc-800 dark:text-zinc-200 group"
          >
            <Activity className="w-4 h-4 text-amber-500 dark:text-amber-400 mx-auto mb-1" />
            <span className="text-xs font-semibold block">{t('security.pulse300')}</span>
            <span className="text-[10px] text-zinc-500">{t('security.mediumPulse')}</span>
          </button>

          <button
            onClick={() => triggerVibrate(500)}
            className="btn-tactile p-3 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 text-center text-zinc-800 dark:text-zinc-200 group"
          >
            <Activity className="w-4 h-4 text-amber-500 dark:text-amber-400 mx-auto mb-1" />
            <span className="text-xs font-semibold block">{t('security.pulse500')}</span>
            <span className="text-[10px] text-zinc-500">{t('security.longBurst')}</span>
          </button>
        </div>
      </div>

      {/* Mouse Jiggler Container */}
      <div className="instrument-card rounded-xl p-4 sm:p-5 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center text-otter-600 dark:text-otter-400">
              <MousePointer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">{t('security.jigglerTitle')}</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{t('security.jigglerDesc')}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleTestJigglePulse}
              className="btn-tactile px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 flex items-center space-x-1"
            >
              <Play className="w-3 h-3 text-otter-600 dark:text-otter-400" />
              <span>{t('security.testPulse')}</span>
            </button>

            {/* Custom Modern Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={jigglerActive}
                onChange={handleJigglerToggle}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-200 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-zinc-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-zinc-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-otter-500" />
            </label>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800/80 text-xs flex items-center justify-between text-zinc-500 dark:text-zinc-400 font-mono">
          <div className="flex items-center space-x-2">
            <span>{t('security.status')}</span>
            <span className={jigglerActive ? 'text-otter-600 dark:text-otter-400 font-semibold' : 'text-zinc-400 dark:text-zinc-500'}>
              {jigglerActive ? t('security.active') : t('security.disabled')}
            </span>
          </div>
          <span className={`w-2 h-2 rounded-full ${jigglerActive ? 'bg-otter-500 animate-pulse' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
        </div>
      </div>

      {/* Quick Shortcuts */}
      <div className="grid grid-cols-2 gap-3">
        {/* Task Manager / Force Quit */}
        <button
          onClick={() => sendByte(PROTOCOL.SEC_TASK_MANAGER, 'subtle')}
          className="btn-tactile instrument-card hover:bg-zinc-100 dark:hover:bg-zinc-850 rounded-xl p-4 flex items-center space-x-3 text-left border-zinc-200 dark:border-zinc-800"
        >
          <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">
              {settings.targetOs === 'macos' ? t('security.forceQuit') : t('security.taskMgr')}
            </h4>
            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
              {settings.targetOs === 'macos' ? 'Cmd+Opt+Esc' : 'Ctrl+Shift+Esc'}
            </p>
          </div>
        </button>

        {/* Show Desktop */}
        <button
          onClick={() => sendByte(PROTOCOL.SEC_SHOW_DESKTOP, 'subtle')}
          className="btn-tactile instrument-card hover:bg-zinc-100 dark:hover:bg-zinc-850 rounded-xl p-4 flex items-center space-x-3 text-left border-zinc-200 dark:border-zinc-800"
        >
          <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
            <LayoutGrid className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">{t('security.showDesktop')}</h4>
            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
              {settings.targetOs === 'macos' ? 'Cmd + F3' : 'Win + D'}
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
