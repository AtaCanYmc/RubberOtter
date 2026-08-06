import React, { useState, useEffect } from 'react';
import { useBluetooth } from '../../context/BluetoothContext';
import { PROTOCOL } from '../../protocol/byteMap';
import { ChevronLeft, ChevronRight, Maximize, Play, RotateCcw, Clock } from 'lucide-react';

export const PresentationPanel: React.FC = () => {
  const { sendByte } = useBluetooth();
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((sec) => sec + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0 && interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNextSlide = () => {
    if (!isActive && seconds === 0) setIsActive(true);
    sendByte(PROTOCOL.PRES_NEXT_SLIDE, 'confirm');
  };

  const handlePrevSlide = () => {
    sendByte(PROTOCOL.PRES_PREV_SLIDE, 'subtle');
  };

  return (
    <div className="flex-1 flex flex-col space-y-5">
      {/* Presentation Timer Card */}
      <div className="glass-card rounded-2xl p-5 flex items-center justify-between shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-slate-400">Presentation Timer</h2>
            <p className="text-xl font-mono font-bold text-purple-300">{formatTime(seconds)}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsActive(!isActive)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all active:scale-95"
          >
            {isActive ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={() => {
              setIsActive(false);
              setSeconds(0);
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Slide Navigation Grid */}
      <div className="flex-1 grid grid-rows-2 gap-4">
        {/* Prev Slide */}
        <button
          onClick={handlePrevSlide}
          className="glass-card hover:bg-slate-800/80 active:bg-brand-600/30 rounded-2xl p-6 flex items-center justify-between transition-all duration-150 active:scale-98 group shadow-lg"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-brand-400 group-hover:bg-brand-500/20 transition-colors">
              <ChevronLeft className="w-7 h-7" />
            </div>
            <div className="text-left">
              <h3 className="text-base font-bold text-slate-200">Previous Slide</h3>
              <p className="text-xs text-slate-400">Sends Left Arrow (←)</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-lg bg-slate-800 text-xs font-mono text-slate-400 border border-slate-700/50">
            0x22
          </span>
        </button>

        {/* Next Slide */}
        <button
          onClick={handleNextSlide}
          className="glass-card bg-gradient-to-r from-brand-900/30 to-indigo-900/30 hover:from-brand-900/50 hover:to-indigo-900/50 border-brand-500/40 rounded-2xl p-6 flex items-center justify-between transition-all duration-150 active:scale-98 group shadow-xl shadow-brand-500/10"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-400 group-hover:bg-brand-500/30 transition-colors">
              <ChevronRight className="w-7 h-7" />
            </div>
            <div className="text-left">
              <h3 className="text-base font-bold text-brand-300">Next Slide</h3>
              <p className="text-xs text-brand-400/80">Sends Right Arrow (→)</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-lg bg-brand-900/60 border border-brand-500/40 text-xs font-mono text-brand-300">
            0x21
          </span>
        </button>
      </div>

      {/* Presentation Utility Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => sendByte(PROTOCOL.PRES_FULLSCREEN, 'toggle')}
          className="glass-card hover:bg-slate-800/80 active:bg-purple-600/30 border-purple-500/20 rounded-2xl p-4 flex items-center justify-center space-x-2 transition-all duration-150 group"
        >
          <Maximize className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-semibold text-slate-200 group-hover:text-purple-300">
            Fullscreen (F5)
          </span>
        </button>

        <button
          onClick={() => sendByte(PROTOCOL.PRES_BLANK_SCREEN, 'toggle')}
          className="glass-card hover:bg-slate-800/80 active:bg-amber-600/30 border-amber-500/20 rounded-2xl p-4 flex items-center justify-center space-x-2 transition-all duration-150 group"
        >
          <Play className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-slate-200 group-hover:text-amber-300">
            Blank Screen ('B')
          </span>
        </button>
      </div>
    </div>
  );
};
