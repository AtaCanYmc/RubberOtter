import React from 'react';
import { useBluetooth } from '../../context/BluetoothContext';
import { PROTOCOL } from '../../protocol/byteMap';
import { Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX, Disc } from 'lucide-react';

export const MediaPanel: React.FC = () => {
  const { sendByte } = useBluetooth();
  const [isPlaying, setIsPlaying] = React.useState(false);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    sendByte(PROTOCOL.MEDIA_PLAY_PAUSE, 'confirm');
  };

  return (
    <div className="flex-1 flex flex-col justify-between space-y-6">
      {/* Media Header Card */}
      <div className="glass-card rounded-2xl p-6 text-center shadow-xl space-y-4 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-brand-600/30 to-indigo-600/30 border border-brand-500/40 flex items-center justify-center text-brand-400 shadow-lg shadow-brand-500/10 relative">
          <Disc className={`w-10 h-10 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-100">Media Controller</h2>
          <p className="text-xs text-slate-400">System audio & media playback</p>
        </div>

        {/* Equalizer animation bars */}
        <div className="flex items-center justify-center space-x-1 pt-1 h-6">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className={`w-1 bg-brand-400 rounded-full transition-all duration-300 ${
                isPlaying ? 'animate-pulse' : 'h-1 opacity-30'
              }`}
              style={{
                height: isPlaying ? `${Math.floor(Math.random() * 18) + 6}px` : '4px',
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Media Main Controls */}
      <div className="grid grid-cols-3 gap-4">
        {/* Prev Track */}
        <button
          onClick={() => sendByte(PROTOCOL.MEDIA_PREV_TRACK, 'subtle')}
          className="glass-card hover:bg-slate-800/80 active:bg-brand-600/30 rounded-2xl p-5 flex flex-col items-center justify-center space-y-2 transition-all duration-150 active:scale-95 group shadow-lg"
        >
          <SkipBack className="w-7 h-7 text-slate-300 group-hover:text-brand-400" />
          <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200">Prev</span>
        </button>

        {/* Play / Pause */}
        <button
          onClick={handlePlayPause}
          className="glass-card bg-gradient-to-tr from-brand-600/40 to-indigo-600/40 hover:from-brand-600/60 hover:to-indigo-600/60 border-brand-500/50 active:scale-95 rounded-2xl p-5 flex flex-col items-center justify-center space-y-2 transition-all duration-150 group shadow-xl shadow-brand-500/20"
        >
          {isPlaying ? (
            <Pause className="w-8 h-8 text-brand-300 group-hover:scale-110 transition-transform" />
          ) : (
            <Play className="w-8 h-8 text-brand-300 group-hover:scale-110 transition-transform ml-0.5" />
          )}
          <span className="text-xs font-bold text-brand-200">Play/Pause</span>
        </button>

        {/* Next Track */}
        <button
          onClick={() => sendByte(PROTOCOL.MEDIA_NEXT_TRACK, 'subtle')}
          className="glass-card hover:bg-slate-800/80 active:bg-brand-600/30 rounded-2xl p-5 flex flex-col items-center justify-center space-y-2 transition-all duration-150 active:scale-95 group shadow-lg"
        >
          <SkipForward className="w-7 h-7 text-slate-300 group-hover:text-brand-400" />
          <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200">Next</span>
        </button>
      </div>

      {/* Volume Controls */}
      <div className="grid grid-cols-3 gap-4">
        {/* Vol Down */}
        <button
          onClick={() => sendByte(PROTOCOL.MEDIA_VOL_DOWN, 'subtle')}
          className="glass-card hover:bg-slate-800/80 active:bg-slate-700/50 rounded-2xl p-4 flex flex-col items-center justify-center space-y-1 transition-all duration-150 active:scale-95 group"
        >
          <Volume1 className="w-5 h-5 text-slate-300 group-hover:text-amber-400" />
          <span className="text-xs font-medium text-slate-400">Vol -</span>
        </button>

        {/* Mute */}
        <button
          onClick={() => sendByte(PROTOCOL.MEDIA_MUTE, 'alert')}
          className="glass-card hover:bg-rose-950/40 border-rose-500/30 active:scale-95 rounded-2xl p-4 flex flex-col items-center justify-center space-y-1 transition-all duration-150 group"
        >
          <VolumeX className="w-5 h-5 text-slate-300 group-hover:text-rose-400" />
          <span className="text-xs font-medium text-slate-400 group-hover:text-rose-300">Mute</span>
        </button>

        {/* Vol Up */}
        <button
          onClick={() => sendByte(PROTOCOL.MEDIA_VOL_UP, 'subtle')}
          className="glass-card hover:bg-slate-800/80 active:bg-slate-700/50 rounded-2xl p-4 flex flex-col items-center justify-center space-y-1 transition-all duration-150 active:scale-95 group"
        >
          <Volume2 className="w-5 h-5 text-slate-300 group-hover:text-emerald-400" />
          <span className="text-xs font-medium text-slate-400">Vol +</span>
        </button>
      </div>
    </div>
  );
};
