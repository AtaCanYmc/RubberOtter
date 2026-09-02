import React, { useState } from 'react';
import { useBluetooth } from '../../context/BluetoothContext';
import { useSettings } from '../../context/SettingsContext';
import { PROTOCOL } from '../../protocol/byteMap';
import { Lock, MousePointer, Cpu, LayoutGrid, Smartphone, Activity, Play } from 'lucide-react';

export const SecurityPanel: React.FC = () => {
  const { sendByte, sendFramedAscii, triggerVibrate } = useBluetooth();
  const { settings } = useSettings();
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
    <div className="flex-1 flex flex-col space-y-5">
      <div className="glass-card rounded-2xl p-5 text-center shadow-xl">
        <h2 className="text-base font-bold text-slate-100">Security & Utilities</h2>
        <p className="text-xs text-slate-400">Lock workstation, prevent sleep & trigger haptics</p>
      </div>

      {/* Lock Workstation Card */}
      <button
        onClick={() => sendByte(PROTOCOL.SEC_LOCK_WORKSTATION, 'alert')}
        className="glass-card hover:bg-rose-950/30 border-rose-500/30 active:scale-98 rounded-2xl p-6 flex items-center justify-between transition-all duration-150 group shadow-lg"
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:bg-rose-500/20 transition-colors">
            <Lock className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h3 className="text-base font-bold text-rose-200">Lock Workstation</h3>
            <p className="text-xs text-rose-400/80">Sends Lock Shortcut ({settings.targetOs === 'macos' ? 'Ctrl+Cmd+Q' : 'Win+L'})</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-lg bg-rose-950/60 border border-rose-500/30 text-xs font-mono text-rose-300">
          0x31
        </span>
      </button>

      {/* Vibration Motor & Haptic Trigger Card */}
      <div className="glass-card rounded-2xl p-5 space-y-4 shadow-xl border-amber-500/20">
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200">Vibration Haptics</h3>
            <p className="text-xs text-slate-400">Triggers mobile & MCU hardware vibration motor</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => triggerVibrate(100)}
            className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-center transition-all active:scale-95 group"
          >
            <Activity className="w-4 h-4 text-amber-400 mx-auto mb-1 group-hover:animate-bounce" />
            <h4 className="text-xs font-bold text-slate-200">100ms Pulse</h4>
            <p className="text-[9px] text-slate-400 mt-0.5">Short Haptic</p>
          </button>

          <button
            onClick={() => triggerVibrate(300)}
            className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-center transition-all active:scale-95 group"
          >
            <Activity className="w-4 h-4 text-amber-400 mx-auto mb-1 group-hover:animate-bounce" />
            <h4 className="text-xs font-bold text-slate-200">300ms Pulse</h4>
            <p className="text-[9px] text-slate-400 mt-0.5">Medium Haptic</p>
          </button>

          <button
            onClick={() => triggerVibrate(500)}
            className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-center transition-all active:scale-95 group"
          >
            <Activity className="w-4 h-4 text-amber-400 mx-auto mb-1 group-hover:animate-bounce" />
            <h4 className="text-xs font-bold text-slate-200">500ms Pulse</h4>
            <p className="text-[9px] text-slate-400 mt-0.5">Long Burst</p>
          </button>
        </div>
      </div>

      {/* Mouse Jiggler Container */}
      <div className="glass-card rounded-2xl p-6 space-y-4 shadow-xl border-emerald-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <MousePointer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-200">Mouse Jiggler</h3>
              <p className="text-xs text-slate-400">Prevents OS display sleep automatically</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleTestJigglePulse}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-bold text-emerald-300 transition-all active:scale-95 flex items-center space-x-1"
              title="Test 20px Square Pulse"
            >
              <Play className="w-3 h-3 text-emerald-400" />
              <span>Test Pulse</span>
            </button>

            {/* Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={jigglerActive}
                onChange={handleJigglerToggle}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
            </label>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs flex items-center justify-between text-slate-400">
          <div className="flex items-center space-x-2">
            <span>Status:</span>
            <strong className={jigglerActive ? 'text-emerald-400 font-bold' : 'text-slate-400 font-normal'}>
              {jigglerActive ? `Active (5s 20px Square Pulse)` : 'Disabled'}
            </strong>
          </div>
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              jigglerActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'
            }`}
          />
        </div>
      </div>

      {/* Quick Utility Shortcuts Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Task Manager */}
        <button
          onClick={() => sendByte(PROTOCOL.SEC_TASK_MANAGER, 'subtle')}
          className="glass-card hover:bg-slate-800/80 active:scale-95 rounded-2xl p-4 flex items-center space-x-3 transition-all duration-150 group"
        >
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h4 className="text-xs font-bold text-slate-200">
              {settings.targetOs === 'macos' ? 'Force Quit' : 'Task Manager'}
            </h4>
            <p className="text-[10px] text-slate-400">
              {settings.targetOs === 'macos' ? 'Cmd+Opt+Esc' : 'Ctrl+Shift+Esc'}
            </p>
          </div>
        </button>

        {/* Show Desktop */}
        <button
          onClick={() => sendByte(PROTOCOL.SEC_SHOW_DESKTOP, 'subtle')}
          className="glass-card hover:bg-slate-800/80 active:scale-95 rounded-2xl p-4 flex items-center space-x-3 transition-all duration-150 group"
        >
          <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 group-hover:bg-brand-500/20">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h4 className="text-xs font-bold text-slate-200">Show Desktop</h4>
            <p className="text-[10px] text-slate-400">
              {settings.targetOs === 'macos' ? 'Cmd + F3' : 'Win + D'}
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
