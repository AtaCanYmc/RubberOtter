import React, { useState, useEffect } from 'react';
import { useBluetooth } from '../../context/BluetoothContext';
import { PROTOCOL } from '../../protocol/byteMap';
import { ChevronLeft, ChevronRight, Maximize, Play, Pause, RotateCcw, Clock, Monitor } from 'lucide-react';

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
    <div className="flex-1 flex flex-col space-y-4">
      {/* Stopwatch & Elapsed Timer Card */}
      <div className="instrument-card rounded-xl p-4 sm:p-5 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center text-otter-600 dark:text-otter-400 shadow-subtle">
            <Clock className="w-5 h-5 text-otter-600 dark:text-otter-400" />
          </div>
          <div>
            <h2 className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Presentation Timer</h2>
            <p className="text-xl font-mono font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{formatTime(seconds)}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsActive(!isActive)}
            className="btn-tactile px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 text-xs font-semibold border border-zinc-200 dark:border-zinc-700/60 flex items-center space-x-1.5"
          >
            {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isActive ? 'Pause' : 'Start'}</span>
          </button>
          <button
            onClick={() => {
              setIsActive(false);
              setSeconds(0);
            }}
            className="btn-tactile p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-800"
            title="Reset Timer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Large Slide Advance Triggers (Ergonomic Clicker) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 min-h-[180px]">
        {/* Previous Slide Button */}
        <button
          onClick={handlePrevSlide}
          className="btn-tactile instrument-card hover:bg-zinc-100 dark:hover:bg-zinc-850 rounded-xl p-6 flex flex-col justify-between text-left group border-zinc-200 dark:border-zinc-800"
        >
          <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Previous Slide</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Left Arrow (←) keystroke</p>
          </div>
        </button>

        {/* Next Slide Button */}
        <button
          onClick={handleNextSlide}
          className="btn-tactile rounded-xl p-6 flex flex-col justify-between text-left bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 font-semibold border border-zinc-800 dark:border-zinc-200 shadow-sm group"
        >
          <div className="w-10 h-10 rounded-lg bg-zinc-800 dark:bg-zinc-950 flex items-center justify-center text-white dark:text-zinc-100 transition-colors">
            <ChevronRight className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Next Slide</h3>
            <p className="text-xs text-zinc-300 dark:text-zinc-700 mt-0.5">Right Arrow (→) keystroke</p>
          </div>
        </button>
      </div>

      {/* Utility Presentation Controls */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => sendByte(PROTOCOL.PRES_FULLSCREEN, 'toggle')}
          className="btn-tactile instrument-card hover:bg-zinc-100 dark:hover:bg-zinc-850 rounded-xl p-3.5 flex items-center justify-center space-x-2 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white border-zinc-200 dark:border-zinc-800"
        >
          <Maximize className="w-4 h-4 text-otter-600 dark:text-otter-400" />
          <span className="text-xs font-medium">Fullscreen (F5)</span>
        </button>

        <button
          onClick={() => sendByte(PROTOCOL.PRES_BLANK_SCREEN, 'toggle')}
          className="btn-tactile instrument-card hover:bg-zinc-100 dark:hover:bg-zinc-850 rounded-xl p-3.5 flex items-center justify-center space-x-2 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white border-zinc-200 dark:border-zinc-800"
        >
          <Monitor className="w-4 h-4 text-otter-600 dark:text-otter-400" />
          <span className="text-xs font-medium">Black Screen (B)</span>
        </button>
      </div>
    </div>
  );
};
