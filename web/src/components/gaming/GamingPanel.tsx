import React, { useState } from 'react';
import { useBluetooth } from '../../context/BluetoothContext';
import { useSettings } from '../../context/SettingsContext';
import { PROTOCOL } from '../../protocol/byteMap';
import { CustomMacro } from '../../@types/bluetooth';
import { Gamepad2, Zap, Plus, Trash2, ShieldCheck, Play, X } from 'lucide-react';

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
      description: `Custom macro sequence (0x${byteVal.toString(16).toUpperCase()})`,
      category: 'User Custom',
      bytes: [byteVal],
      delayMs: macroDelay,
    };

    addMacro(newMacro);
    setMacroName('');
    setShowAddModal(false);
  };

  return (
    <div className="flex-1 flex flex-col space-y-4">
      {/* Header Card */}
      <div className="instrument-card rounded-xl p-4 sm:p-5 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-700/60 flex items-center justify-center text-otter-400 shadow-subtle">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">Gaming & Macro Sequences</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Automated key combo chains and game buy sequences</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(!showAddModal)}
          className="btn-tactile px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-100 text-xs font-semibold border border-zinc-700/60 flex items-center space-x-1.5"
        >
          {showAddModal ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          <span>{showAddModal ? 'Close' : 'New Macro'}</span>
        </button>
      </div>

      {/* Built-in CS Buy Sequence Card */}
      <div className="instrument-card rounded-xl p-5 space-y-3.5 border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-700/60 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-zinc-200">CS Armor & Helmet Buy Macro</h3>
              <p className="text-xs text-zinc-400">Buy ('b') → Armor (4) → Helmet (2)</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400">
            0x41
          </span>
        </div>

        <button
          onClick={() => sendByte(PROTOCOL.GAME_CS_BUY, 'confirm')}
          className="btn-tactile w-full py-2.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs flex items-center justify-center space-x-2 border border-zinc-200 shadow-sm"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Execute CS Buy Sequence</span>
        </button>
      </div>

      {/* Add Macro Form */}
      {showAddModal && (
        <form onSubmit={handleCreateMacro} className="instrument-card rounded-xl p-4 sm:p-5 space-y-3.5 border-zinc-700">
          <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">Create Custom Macro</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Macro Name</label>
              <input
                type="text"
                value={macroName}
                onChange={(e) => setMacroName(e.target.value)}
                placeholder="e.g. Quick Heal Macro"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-otter-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Hex Byte Code</label>
                <input
                  type="text"
                  value={macroHex}
                  onChange={(e) => setMacroHex(e.target.value)}
                  placeholder="0x41"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-otter-500"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Delay (ms)</label>
                <input
                  type="number"
                  value={macroDelay}
                  onChange={(e) => setMacroDelay(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-otter-500"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="btn-tactile px-3 py-1.5 rounded-lg bg-zinc-900 text-zinc-400 text-xs font-medium border border-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-tactile px-3.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold"
            >
              Save Macro
            </button>
          </div>
        </form>
      )}

      {/* Saved Custom Macros */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1">
          Saved Macros ({macros.length})
        </h3>
        <div className="grid grid-cols-1 gap-2.5">
          {macros.map((m) => (
            <div key={m.id} className="instrument-card rounded-xl p-3.5 flex items-center justify-between border-zinc-800">
              <div>
                <h4 className="text-xs font-semibold text-zinc-200">{m.name}</h4>
                <p className="text-[11px] text-zinc-500 font-mono mt-0.5">{m.description}</p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleExecuteCustomMacro(m)}
                  className="btn-tactile px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-semibold border border-zinc-700/60 flex items-center space-x-1.5"
                >
                  <Play className="w-3 h-3 text-otter-400" />
                  <span>Run</span>
                </button>
                {m.category === 'User Custom' && (
                  <button
                    onClick={() => deleteMacro(m.id)}
                    className="btn-tactile p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950/40 text-zinc-500 hover:text-rose-400 border border-zinc-800 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
