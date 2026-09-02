import React, { useState, useEffect } from 'react';
import { useBluetooth } from '../../context/BluetoothContext';
import { useSettings } from '../../context/SettingsContext';
import {
  Radar,
  Bluetooth,
  RefreshCw,
  Signal,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Radio,
  Cpu
} from 'lucide-react';

interface ScannedDevice {
  id: string;
  name: string;
  rssi?: number;
  serviceUuids: string[];
  lastSeen: string;
  isConnected: boolean;
}

export const ScannerPanel: React.FC = () => {
  const { connectionState, connect, disconnect } = useBluetooth();
  const { settings } = useSettings();

  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<ScannedDevice[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasLeScanSupport, setHasLeScanSupport] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'bluetooth' in navigator && 'requestLEScan' in (navigator.bluetooth as any)) {
      setHasLeScanSupport(true);
    }
  }, []);

  const handleStartScan = async () => {
    setErrorMessage(null);
    setIsScanning(true);

    try {
      if (typeof navigator === 'undefined' || !navigator.bluetooth) {
        throw new Error('Web Bluetooth API is not supported in this browser. Please use Chrome, Edge, or Opera.');
      }

      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: 'Otter' },
          { namePrefix: 'RubberOtter' },
          { namePrefix: 'HM-10' },
          { namePrefix: 'Master-Key' },
          { services: [settings.serviceUuid] }
        ],
        optionalServices: [
          settings.serviceUuid,
          '0000ffe0-0000-1000-8000-00805f9b34fb',
          '00001800-0000-1000-8000-00805f9b34fb'
        ]
      }).catch(async () => {
        return await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: [
            settings.serviceUuid,
            '0000ffe0-0000-1000-8000-00805f9b34fb',
            '00001800-0000-1000-8000-00805f9b34fb'
          ]
        });
      });

      if (device) {
        const newDevice: ScannedDevice = {
          id: device.id,
          name: device.name || 'Unnamed BLE Device',
          rssi: -62,
          serviceUuids: [settings.serviceUuid, '0000ffe0-0000-1000-8000-00805f9b34fb'],
          lastSeen: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          isConnected: connectionState === 'connected'
        };

        setDevices((prev) => {
          const filtered = prev.filter((d) => d.id !== newDevice.id);
          return [newDevice, ...filtered];
        });

        await connect();
      }
    } catch (err: any) {
      if (err.name !== 'NotFoundError') {
        setErrorMessage(err.message || 'Scanning failed');
      }
    } finally {
      setIsScanning(false);
    }
  };

  const getRssiColor = (rssi?: number) => {
    if (!rssi) return 'text-zinc-500';
    if (rssi >= -65) return 'text-emerald-400';
    if (rssi >= -78) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="flex-1 flex flex-col space-y-4">
      {/* Action Header Card */}
      <div className="instrument-card rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-700/60 flex items-center justify-center text-otter-400 shadow-subtle">
            <Radio className={`w-5 h-5 ${isScanning ? 'animate-spin text-otter-400' : ''}`} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-semibold text-zinc-100">BLE Device Scanner</h2>
              <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700/50 text-[10px] font-mono text-zinc-300">
                GATT 0xFFE0
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Discover and pair with HM-10, BT05, or ESP32 Bluetooth Low Energy modules
            </p>
          </div>
        </div>

        <button
          onClick={handleStartScan}
          disabled={isScanning}
          className="btn-tactile px-4 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Scanning...' : 'Start Scan'}</span>
        </button>
      </div>

      {/* Experimental Advertisements Banner */}
      {hasLeScanSupport && (
        <div className="rounded-lg p-3 flex items-center space-x-2.5 bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Web Bluetooth LE Advertisement Scanning API is supported in your browser.</span>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="rounded-lg p-3 flex items-center space-x-2.5 bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs font-medium">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Discovered Devices Container */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center space-x-2">
            <Bluetooth className="w-3.5 h-3.5 text-otter-400" />
            <span>Discovered Hardware ({devices.length})</span>
          </h3>
          {devices.length > 0 && (
            <button
              onClick={() => setDevices([])}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Clear List
            </button>
          )}
        </div>

        {devices.length === 0 && !isScanning ? (
          <div className="instrument-card rounded-xl p-8 text-center space-y-3">
            <div className="w-11 h-11 rounded-lg bg-zinc-900 border border-zinc-800 mx-auto flex items-center justify-center text-zinc-500">
              <Radar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-zinc-300">No BLE Devices Found Yet</h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
                Click <strong>Start Scan</strong> above to open the native Web Bluetooth picker and connect to your Rubber Otter microcontroller.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {devices.map((device) => {
              const isConnected = connectionState === 'connected';
              return (
                <div
                  key={device.id}
                  className={`instrument-card rounded-xl p-4 transition-all duration-150 border ${
                    isConnected
                      ? 'border-emerald-500/40 bg-emerald-950/10'
                      : 'border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center space-x-3.5">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          isConnected
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-zinc-850 text-zinc-300 border border-zinc-700/60'
                        }`}
                      >
                        <Cpu className="w-4 h-4" />
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xs font-semibold text-zinc-100">{device.name}</h4>
                          {isConnected && (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-medium text-emerald-400 flex items-center space-x-1">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>Connected</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-3 mt-1 text-[11px] text-zinc-400 font-mono">
                          <span className={`flex items-center space-x-1 ${getRssiColor(device.rssi)}`}>
                            <Signal className="w-3 h-3" />
                            <span>{device.rssi} dBm</span>
                          </span>
                          <span className="text-zinc-600">•</span>
                          <span>Seen: {device.lastSeen}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={isConnected ? disconnect : connect}
                      className={`btn-tactile px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 border ${
                        isConnected
                          ? 'bg-zinc-900 hover:bg-zinc-850 text-rose-400 border-rose-500/30'
                          : 'bg-zinc-800 hover:bg-zinc-750 text-zinc-100 border-zinc-700/60'
                      }`}
                    >
                      {isConnected ? (
                        <span>Disconnect</span>
                      ) : (
                        <>
                          <span>Connect</span>
                          <ArrowRight className="w-3 h-3 text-zinc-400" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
