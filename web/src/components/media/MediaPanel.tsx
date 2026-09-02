import React, { useState } from 'react';
import { useBluetooth } from '../../context/BluetoothContext';
import { PROTOCOL } from '../../protocol/byteMap';
import { Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX, Music } from 'lucide-react';

export const MediaPanel: React.FC = () => {
  const { sendByte } = useBluetooth();
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    sendByte(PROTOCOL.MEDIA_PLAY_PAUSE, 'confirm');
  };

  return (
    <div className="flex-1 flex flex-col space-y-4">
      {/* Header Deck Card */}
      <div className="instrument-card rounded-xl p-6 text-center space-y-3">
        <div className="w-14 h-14 mx-auto rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center text-otter-600 dark:text-otter-400 shadow-subtle">
          <Music className={`w-7 h-7 ${isPlaying ? 'animate-pulse text-otter-500 dark:text-otter-400' : 'text-zinc-600 dark:text-zinc-300'}`} />
        </div>

        <div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Media & Volume Deck</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Control host OS audio playback, tracks, and sound levels</p>
        </div>

        {/* Tactile Audio Bars */}
        <div className="flex items-center justify-center space-x-1.5 pt-1 h-5">
          {[4, 8, 14, 18, 10, 16, 12, 6].map((h, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-300 ${
                isPlaying ? 'bg-otter-500 dark:bg-otter-400' : 'bg-zinc-300 dark:bg-zinc-700 h-1.5'
              }`}
              style={{
                height: isPlaying ? `${h}px` : '4px',
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Playback Deck */}
      <div className="grid grid-cols-3 gap-3">
        {/* Prev Track */}
        <button
          onClick={() => sendByte(PROTOCOL.MEDIA_PREV_TRACK, 'subtle')}
          className="btn-tactile instrument-card hover:bg-zinc-100 dark:hover:bg-zinc-850 rounded-xl p-5 flex flex-col items-center justify-center space-y-2 group border-zinc-200 dark:border-zinc-800"
        >
          <SkipBack className="w-6 h-6 text-zinc-700 dark:text-zinc-200 group-hover:text-zinc-950 dark:group-hover:text-white" />
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300 group-hover:text-zinc-950 dark:group-hover:text-zinc-100">Previous</span>
        </button>

        {/* Play / Pause Primary Button */}
        <button
          onClick={handlePlayPause}
          className="btn-tactile rounded-xl p-5 flex flex-col items-center justify-center space-y-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 font-semibold border border-zinc-800 dark:border-zinc-200 shadow-sm"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-0.5" />
          )}
          <span className="text-xs font-semibold">{isPlaying ? 'Pause' : 'Play'}</span>
        </button>

        {/* Next Track */}
        <button
          onClick={() => sendByte(PROTOCOL.MEDIA_NEXT_TRACK, 'subtle')}
          className="btn-tactile instrument-card hover:bg-zinc-100 dark:hover:bg-zinc-850 rounded-xl p-5 flex flex-col items-center justify-center space-y-2 group border-zinc-200 dark:border-zinc-800"
        >
          <SkipForward className="w-6 h-6 text-zinc-700 dark:text-zinc-200 group-hover:text-zinc-950 dark:group-hover:text-white" />
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300 group-hover:text-zinc-950 dark:group-hover:text-zinc-100">Next</span>
        </button>
      </div>

      {/* Volume Controls Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Vol Down */}
        <button
          onClick={() => sendByte(PROTOCOL.MEDIA_VOL_DOWN, 'subtle')}
          className="btn-tactile instrument-card hover:bg-zinc-100 dark:hover:bg-zinc-850 rounded-xl p-4 flex flex-col items-center justify-center space-y-1.5 text-zinc-700 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white border-zinc-200 dark:border-zinc-800"
        >
          <Volume1 className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
          <span className="text-xs font-medium">Vol Down</span>
        </button>

        {/* Mute */}
        <button
          onClick={() => sendByte(PROTOCOL.MEDIA_MUTE, 'alert')}
          className="btn-tactile instrument-card hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:border-rose-500/30 rounded-xl p-4 flex flex-col items-center justify-center space-y-1.5 text-zinc-700 dark:text-zinc-200 hover:text-rose-600 dark:hover:text-rose-400 border-zinc-200 dark:border-zinc-800"
        >
          <VolumeX className="w-5 h-5 text-zinc-600 dark:text-zinc-300 hover:text-rose-500" />
          <span className="text-xs font-medium">Mute Toggle</span>
        </button>

        {/* Vol Up */}
        <button
          onClick={() => sendByte(PROTOCOL.MEDIA_VOL_UP, 'subtle')}
          className="btn-tactile instrument-card hover:bg-zinc-100 dark:hover:bg-zinc-850 rounded-xl p-4 flex flex-col items-center justify-center space-y-1.5 text-zinc-700 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white border-zinc-200 dark:border-zinc-800"
        >
          <Volume2 className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
          <span className="text-xs font-medium">Vol Up</span>
        </button>
      </div>
    </div>
  );
};
