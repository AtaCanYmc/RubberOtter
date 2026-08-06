import React, { useState } from 'react';
import { useBluetooth } from '../../context/BluetoothContext';
import { useSettings } from '../../context/SettingsContext';
import { PROTOCOL } from '../../protocol/byteMap';
import { CustomMacro } from '../../@types/bluetooth';
import { Gamepad2, Zap, Plus, Trash2, ShieldCheck, Play } from 'lucide-react';

export const GamingPanel: React.FC = () => {
  const { sendByte } = useBluetooth();
  const { macros, addMacro, deleteMacro } = useSettings();

  const [showAddModal, setShowAddModal] = useState(false);
  const [macroName, setMacroName] = useState('');
  const [macroHex, setMacroHex] = useState('0x41');
  const [macroDelay, setMacroDelay] = useState(100);

  const handleExecuteCustomMacro = async (macro: CustomMacro) => {
    for (const b of macro.bytes) {
      await sendByte(b, 'confirm');
      if (macro.delayMs > 0) {
        await new Promise((res) => setTimeout(res, macro.delayMs));
      }
    }
  };

  const handleCreateMacro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!macroName) return;

    const byteVal = parseInt(macroHex, 16);
    if (isNaN(byteVal)) return;

    const newMacro: CustomMacro = {
      id: `macro_${Date.now()}`,
      name: macroName,
      description: `Custom sequence (0x${byteVal.toString(16).toUpperCase()})`,
      category: 'User Custom',
      bytes: [byteVal],
      delayMs: macroDelay,
    };

    addMacro(newMacro);
    setMacroName('');
    setShowAddModal(false);
  };

  return (
    <div className="flex-1 flex flex-col space-y-5">
      <div className="glass-card rounded-2xl p-5 text-center shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h2 className="text-base font-bold text-slate-100">Gaming Macros</h2>
            <p className="text-xs text-slate-400">Automated key & buy sequences</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(!showAddModal)}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold border border-amber-500/30 flex items-center space-x-1 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Macro</span>
        </button>
      </div>

      {/* Out-of-the-box CS Buy Sequence Card */}
      <div className="glass-card rounded-2xl p-6 space-y-4 border-amber-500/30 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-200">CS Armor & Helmet Buy Macro</h3>
              <p className="text-xs text-slate-400">Buy ('b') → Armor (4) → Helmet (2)</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-500/40 text-xs font-mono text-amber-300">
            0x41
          </span>
        </div>

        <button
          onClick={() => sendByte(PROTOCOL.GAME_CS_BUY, 'confirm')}
          className="w-full glass-card bg-gradient-to-r from-amber-600/40 to-orange-600/40 hover:from-amber-600/60 hover:to-orange-600/60 border-amber-500/50 active:scale-98 rounded-xl py-3.5 flex items-center justify-center space-x-2 transition-all duration-150 shadow-lg shadow-amber-500/20 group"
        >
          <Zap className="w-4 h-4 text-amber-300 group-hover:animate-bounce" />
          <span className="text-xs font-bold text-amber-200">Execute CS Buy Macro (0x41)</span>
        </button>
      </div>

      {/* Add Macro Form Modal */}
      {showAddModal && (
        <form onSubmit={handleCreateMacro} className="glass-card rounded-2xl p-5 space-y-4 border-brand-500/40 animate-fade-in">
          <h3 className="text-xs font-bold text-slate-200">Create Custom Macro</h3>
          <div className="space-y-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Macro Name</label>
              <input
                type="text"
                value={macroName}
                onChange={(e) => setMacroName(e.target.value)}
                placeholder="e.g. Quick Heal Macro"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Hex Byte Code</label>
                <input
                  type="text"
                  value={macroHex}
                  onChange={(e) => setMacroHex(e.target.value)}
                  placeholder="0x41"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Delay (ms)</label>
                <input
                  type="number"
                  value={macroDelay}
                  onChange={(e) => setMacroDelay(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
            >
              Save Macro
            </button>
          </div>
        </form>
      )}

      {/* Saved Custom Macros List */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 px-1">Saved User Macros ({macros.length})</h3>
        {macros.map((m) => (
          <div key={m.id} className="glass-card rounded-2xl p-4 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-200">{m.name}</h4>
              <p className="text-[10px] text-slate-400">{m.description}</p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleExecuteCustomMacro(m)}
                className="px-3 py-1.5 rounded-xl bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 border border-brand-500/30 text-xs font-bold flex items-center space-x-1 transition-all active:scale-95"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Run</span>
              </button>
              {m.category === 'User Custom' && (
                <button
                  onClick={() => deleteMacro(m.id)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
