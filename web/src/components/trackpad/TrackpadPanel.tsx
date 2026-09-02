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

    const handleTouchEnd = (e: TouchEvent) => {
      setPointerVisible(false);
      const touchDuration = Date.now() - touchStartTimeRef.current;

      if (touchDuration < 250 && totalMovedRef.current < 8) {
        if (e.changedTouches.length === 1 && e.touches.length === 0) {
          sendByte(PROTOCOL.MOUSE_LEFT_CLICK, 'subtle');
        }
      } else if (e.touches.length === 0 && e.changedTouches.length === 2) {
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
      {/* Precision Touch Trackpad Surface */}
      <div
        ref={trackpadRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="flex-1 instrument-card trackpad-surface rounded-xl border-zinc-800 relative flex flex-col items-center justify-center touch-none overflow-hidden select-none min-h-[260px] sm:min-h-[320px] cursor-crosshair group"
      >
        <div className="text-center pointer-events-none space-y-1.5 opacity-40 group-hover:opacity-70 transition-opacity">
          <MousePointer className="w-8 h-8 mx-auto text-otter-400" />
          <p className="text-xs font-semibold text-zinc-300">Touch & Drag to Navigate Host Cursor</p>
          <p className="text-[11px] text-zinc-500 font-mono">
            Tap = Left Click • 2-Finger Tap = Right Click
          </p>
        </div>

        {/* Cursor Indicator Circle */}
        {pointerVisible && pointerPos && (
          <div
            ref={pointerRef}
            style={{ left: `${pointerPos.x}px`, top: `${pointerPos.y}px` }}
            className="absolute w-6 h-6 rounded-full bg-otter-400/30 border-2 border-otter-400 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 shadow-subtle transition-transform duration-75"
          />
        )}
      </div>

      {/* Sensitivity Slider & Scroll Steppers */}
      <div className="instrument-card rounded-xl px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5 flex-1">
          <Sliders className="w-4 h-4 text-zinc-400 flex-shrink-0" />
          <span className="text-xs font-medium text-zinc-400 whitespace-nowrap">Sensitivity:</span>
          <input
            type="range"
            min="1"
            max="5"
            step="0.5"
            value={settings.trackpadSensitivity}
            onChange={handleSensitivityChange}
            className="w-full accent-otter-400 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs font-mono font-semibold text-otter-400 min-w-[32px]">
            {settings.trackpadSensitivity.toFixed(1)}x
          </span>
        </div>

        <div className="flex items-center space-x-1.5 border-l border-zinc-800 pl-3">
          <button
            onClick={() => sendByte(PROTOCOL.MOUSE_SCROLL_UP, 'subtle')}
            className="btn-tactile p-2 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800"
            title="Scroll Up"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => sendByte(PROTOCOL.MOUSE_SCROLL_DOWN, 'subtle')}
            className="btn-tactile p-2 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800"
            title="Scroll Down"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Left / Right Click Trigger Pads */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => sendByte(PROTOCOL.MOUSE_LEFT_CLICK, 'subtle')}
          className="btn-tactile instrument-card hover:bg-zinc-850 rounded-xl py-4 font-semibold text-xs text-zinc-200 border-zinc-800"
        >
          Left Click
        </button>
        <button
          onClick={() => sendByte(PROTOCOL.MOUSE_RIGHT_CLICK, 'confirm')}
          className="btn-tactile instrument-card hover:bg-zinc-850 rounded-xl py-4 font-semibold text-xs text-zinc-200 border-zinc-800"
        >
          Right Click
        </button>
      </div>
    </div>
  );
};
