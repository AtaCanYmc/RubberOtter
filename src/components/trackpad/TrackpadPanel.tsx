import React, { useRef, useState, useEffect } from 'react';
import { useBluetooth } from '../../context/BluetoothContext';
import { useSettings } from '../../context/SettingsContext';
import { PROTOCOL } from '../../protocol/byteMap';
import { encodeTrackpadMove } from '../../protocol/packetEncoder';
import { MousePointer, Sliders, ArrowUp, ArrowDown } from 'lucide-react';

export const TrackpadPanel: React.FC = () => {
  const { sendByte, sendPacket } = useBluetooth();
  const { settings, updateSettings } = useSettings();
  const trackpadRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<HTMLDivElement>(null);

  const [pointerPos, setPointerPos] = useState<{ x: number; y: number } | null>(null);
  const [pointerVisible, setPointerVisible] = useState(false);

  // Touch Tracking Variables
  const lastTouchRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchStartTimeRef = useRef<number>(0);
  const totalMovedRef = useRef<number>(0);
  const isTouchingRef = useRef<boolean>(false);

  const handleSensitivityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ trackpadSensitivity: parseFloat(e.target.value) });
  };

  useEffect(() => {
    const el = trackpadRef.current;
    if (!el) return;

    const getSens = () => settings.trackpadSensitivity;

    // Touch Start
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
        touchStartTimeRef.current = Date.now();
        totalMovedRef.current = 0;
        isTouchingRef.current = true;

        const rect = el.getBoundingClientRect();
        setPointerPos({ x: touch.clientX - rect.left, y: touch.clientY - rect.top });
        setPointerVisible(true);
      }
    };

    // Touch Move
    const handleTouchMove = (e: TouchEvent) => {
      if (!isTouchingRef.current || e.touches.length !== 1) return;

      const touch = e.touches[0];
      const rawDx = touch.clientX - lastTouchRef.current.x;
      const rawDy = touch.clientY - lastTouchRef.current.y;

      lastTouchRef.current = { x: touch.clientX, y: touch.clientY };

      const sens = getSens();
      const dx = rawDx * sens;
      const dy = rawDy * sens;

      totalMovedRef.current += Math.hypot(rawDx, rawDy);

      const rect = el.getBoundingClientRect();
      setPointerPos({ x: touch.clientX - rect.left, y: touch.clientY - rect.top });

      if (dx !== 0 || dy !== 0) {
        const packet = encodeTrackpadMove(dx, dy);
        sendPacket(packet);
      }
    };

    // Touch End
    const handleTouchEnd = (e: TouchEvent) => {
      setPointerVisible(false);
      const touchDuration = Date.now() - touchStartTimeRef.current;

      if (touchDuration < 250 && totalMovedRef.current < 8) {
        if (e.changedTouches.length === 1 && e.touches.length === 0) {
          // Single tap -> Left Click
          sendByte(PROTOCOL.MOUSE_LEFT_CLICK, 'subtle');
        }
      } else if (e.touches.length === 0 && e.changedTouches.length === 2) {
        // 2-Finger tap -> Right Click
        sendByte(PROTOCOL.MOUSE_RIGHT_CLICK, 'confirm');
      }

      if (e.touches.length === 0) {
        isTouchingRef.current = false;
      }
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: true });
    el.addEventListener('touchend', handleTouchEnd);

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [settings.trackpadSensitivity, sendByte, sendPacket]);

  // Desktop Mouse Drag Fallback
  const isMouseDownRef = useRef(false);
  const handleMouseDown = (e: React.MouseEvent) => {
    isMouseDownRef.current = true;
    lastTouchRef.current = { x: e.clientX, y: e.clientY };
    touchStartTimeRef.current = Date.now();
    totalMovedRef.current = 0;

    const el = trackpadRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      setPointerPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setPointerVisible(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current) return;
    const rawDx = e.clientX - lastTouchRef.current.x;
    const rawDy = e.clientY - lastTouchRef.current.y;
    lastTouchRef.current = { x: e.clientX, y: e.clientY };

    const dx = rawDx * settings.trackpadSensitivity;
    const dy = rawDy * settings.trackpadSensitivity;
    totalMovedRef.current += Math.hypot(rawDx, rawDy);

    const el = trackpadRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      setPointerPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }

    if (dx !== 0 || dy !== 0) {
      sendPacket(encodeTrackpadMove(dx, dy));
    }
  };

  const handleMouseUp = () => {
    if (isMouseDownRef.current) {
      isMouseDownRef.current = false;
      setPointerVisible(false);
      if (Date.now() - touchStartTimeRef.current < 200 && totalMovedRef.current < 5) {
        sendByte(PROTOCOL.MOUSE_LEFT_CLICK, 'subtle');
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-4">
      {/* Dedicated Touch Trackpad Surface */}
      <div
        ref={trackpadRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="flex-1 glass-card trackpad-grid rounded-2xl border-brand-500/30 relative flex flex-col items-center justify-center touch-none overflow-hidden select-none min-h-[280px] shadow-2xl group cursor-crosshair"
      >
        <div className="text-center pointer-events-none space-y-1.5 opacity-40 group-hover:opacity-70 transition-opacity">
          <MousePointer className="w-10 h-10 mx-auto text-brand-400 animate-pulse" />
          <p className="text-xs font-bold text-slate-200">Touch & Drag to Control Mouse</p>
          <p className="text-[10px] text-slate-400">
            Tap = Left Click • 2-Finger Tap = Right Click
          </p>
        </div>

        {/* Cursor Indicator Circle */}
        {pointerVisible && pointerPos && (
          <div
            ref={pointerRef}
            style={{ left: `${pointerPos.x}px`, top: `${pointerPos.y}px` }}
            className="absolute w-7 h-7 rounded-full bg-brand-400/40 border-2 border-brand-400 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 shadow-lg shadow-brand-400/50 transition-transform duration-75"
          />
        )}
      </div>

      {/* Sensitivity Control Bar & Scroll Triggers */}
      <div className="glass-card rounded-xl px-4 py-3 flex items-center justify-between space-x-3">
        <div className="flex items-center space-x-2 flex-1">
          <Sliders className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">Speed:</span>
          <input
            type="range"
            min="1"
            max="5"
            step="0.5"
            value={settings.trackpadSensitivity}
            onChange={handleSensitivityChange}
            className="w-full accent-brand-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs font-mono font-bold text-brand-400 min-w-[32px]">
            {settings.trackpadSensitivity.toFixed(1)}x
          </span>
        </div>

        <div className="flex items-center space-x-1 border-l border-slate-800 pl-3">
          <button
            onClick={() => sendByte(PROTOCOL.MOUSE_SCROLL_UP, 'subtle')}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95"
            title="Scroll Up"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => sendByte(PROTOCOL.MOUSE_SCROLL_DOWN, 'subtle')}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95"
            title="Scroll Down"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Left / Right Click Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => sendByte(PROTOCOL.MOUSE_LEFT_CLICK, 'subtle')}
          className="glass-card hover:bg-slate-800/80 active:bg-brand-600/30 rounded-xl py-4 font-bold text-sm text-slate-200 active:scale-95 transition-all duration-150 shadow-lg border-brand-500/20"
        >
          Left Click
        </button>
        <button
          onClick={() => sendByte(PROTOCOL.MOUSE_RIGHT_CLICK, 'confirm')}
          className="glass-card hover:bg-slate-800/80 active:bg-brand-600/30 rounded-xl py-4 font-bold text-sm text-slate-200 active:scale-95 transition-all duration-150 shadow-lg border-brand-500/20"
        >
          Right Click
        </button>
      </div>
    </div>
  );
};
