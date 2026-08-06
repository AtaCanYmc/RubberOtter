import React, { useState } from 'react';
import { useBluetooth } from '../../context/BluetoothContext';
import { useSettings } from '../../context/SettingsContext';
import { PROTOCOL } from '../../protocol/byteMap';
import { Lock, MousePointer, Cpu, LayoutGrid } from 'lucide-react';

export const SecurityPanel: React.FC = () => {
  const { sendByte } = useBluetooth();
  const { settings } = useSettings();
  const [jigglerActive, setJigglerActive] = useState(false);

  const handleJigglerToggle = () => {
    const newState = !jigglerActive;
    setJigglerActive(newState);
    sendByte(PROTOCOL.SEC_JIGGLER_TOGGLE, 'toggle');
  };

  return (
    <div className="flex-1 flex flex-col space-y-5">
      <div className="glass-card rounded-2xl p-5 text-center shadow-xl">
        <h2 className="text-base font-bold text-slate-100">Security & Utilities</h2>
        <p className="text-xs text-slate-400">Lock workstation or prevent system sleep</p>
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
            <p className="text-xs text-rose-400/80">Sends Win + L Shortcut (0x31)</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-lg bg-rose-950/60 border border-rose-500/30 text-xs font-mono text-rose-300">
          0x31
        </span>
      </button>

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

        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs flex items-center justify-between text-slate-400">
          <div className="flex items-center space-x-2">
            <span>Status:</span>
            <strong className={jigglerActive ? 'text-emerald-400 font-bold' : 'text-slate-400 font-normal'}>
              {jigglerActive ? `Active (${settings.jiggleIntervalSec}s interval)` : 'Disabled'}
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
            <h4 className="text-xs font-bold text-slate-200">Task Manager</h4>
            <p className="text-[10px] text-slate-400">Ctrl+Shift+Esc</p>
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
            <p className="text-[10px] text-slate-400">Win + D</p>
          </div>
        </button>
      </div>
    </div>
  );
};
