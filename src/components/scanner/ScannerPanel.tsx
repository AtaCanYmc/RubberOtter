import React, { useState, useEffect } from 'react';
import { useBluetooth } from '../../context/BluetoothContext';
import { useSettings } from '../../context/SettingsContext';
import { Radar, Bluetooth, RefreshCw, Signal, CheckCircle2, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react';

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
    // Check if experimental requestLEScan is available in browser
    if (typeof navigator !== 'undefined' && 'bluetooth' in navigator && 'requestLEScan' in (navigator.bluetooth as any)) {
      setHasLeScanSupport(true);
    }
  }, []);

  const handleStartScan = async () => {
    setErrorMessage(null);
    setIsScanning(true);

    try {
      if (typeof navigator === 'undefined' || !navigator.bluetooth) {
        throw new Error('Web Bluetooth API is not supported in this browser.');
      }

      // 1. Trigger Native Web Bluetooth Picker Scan
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
        // Fallback scan accepting all devices
        return await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: [
            settings.serviceUuid,
            '0000ffe0-0000-1000-8000-00805f9b34fb',
            'ffe0',
            '00001800-0000-1000-8000-00805f9b34fb'
          ]
        });
      });

      if (device) {
        const newDevice: ScannedDevice = {
          id: device.id,
          name: device.name || 'Unnamed BLE Device',
          rssi: -65, // Typical indoor BLE RSSI estimate
          serviceUuids: [settings.serviceUuid, '0000ffe0-0000-1000-8000-00805f9b34fb'],
          lastSeen: new Date().toLocaleTimeString(),
          isConnected: connectionState === 'connected'
        };

        setDevices((prev) => {
          const filtered = prev.filter((d) => d.id !== newDevice.id);
          return [newDevice, ...filtered];
        });

        // Trigger connection
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
    if (!rssi) return 'text-slate-400';
    if (rssi >= -60) return 'text-emerald-400';
    if (rssi >= -75) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getRssiLabel = (rssi?: number) => {
    if (!rssi) return 'Unknown';
    if (rssi >= -60) return 'Excellent (-60 dBm)';
    if (rssi >= -75) return 'Good (-75 dBm)';
    return 'Weak (-90 dBm)';
  };

  return (
    <div className="flex-1 flex flex-col space-y-5">
      {/* Header Banner */}
      <div className="glass-card rounded-2xl p-5 shadow-xl flex items-center justify-between border-brand-500/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
            <Radar className={`w-5 h-5 ${isScanning ? 'animate-spin text-brand-400' : ''}`} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">BLE Device Scanner</h2>
            <p className="text-xs text-slate-400">Scan surrounding Bluetooth LE hardware</p>
          </div>
        </div>

        <button
          onClick={handleStartScan}
          disabled={isScanning}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-brand-500/20 active:scale-95 transition-all flex items-center space-x-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Scanning...' : 'Start Scan'}</span>
        </button>
      </div>

      {/* Experimental Scanner Banner */}
      {hasLeScanSupport && (
        <div className="glass-card rounded-xl p-3 flex items-center space-x-3 border-emerald-500/30 bg-emerald-500/5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <p className="text-[11px] text-emerald-300">
            Web Bluetooth LE Advertisement Scanning API is supported in your browser!
          </p>
        </div>
      )}

      {/* Error Message Alert */}
      {errorMessage && (
        <div className="glass-card rounded-xl p-3 flex items-center space-x-3 border-rose-500/30 bg-rose-500/10">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <p className="text-xs text-rose-300">{errorMessage}</p>
        </div>
      )}

      {/* Radar Visual Animation Area */}
      {isScanning && (
        <div className="glass-card rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-4 border-brand-500/30 relative overflow-hidden">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-brand-500/40 animate-ping" />
            <div className="absolute inset-2 rounded-full border border-indigo-500/30 animate-pulse" />
            <div className="w-12 h-12 rounded-full bg-brand-500/20 border border-brand-400/50 flex items-center justify-center text-brand-300 shadow-xl">
              <Bluetooth className="w-6 h-6 animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200">Searching Nearby Devices...</h3>
            <p className="text-xs text-slate-400 mt-1">Listening for HM-10, Otter & ESP32 BLE beacons</p>
          </div>
        </div>
      )}

      {/* Discovered Devices List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
            <Bluetooth className="w-3.5 h-3.5 text-brand-400" />
            <span>Discovered Devices ({devices.length})</span>
          </h3>
          {devices.length > 0 && (
            <button
              onClick={() => setDevices([])}
              className="text-[10px] text-slate-400 hover:text-slate-200 transition-colors"
            >
              Clear List
            </button>
          )}
        </div>

        {devices.length === 0 && !isScanning ? (
          <div className="glass-card rounded-2xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 mx-auto flex items-center justify-center text-slate-500">
              <Radar className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-300">No BLE Devices Discovered Yet</h4>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-1">
                Tap <strong>Start Scan</strong> above to discover surrounding HM-10, Otter or ESP32 Bluetooth modules.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {devices.map((device) => {
              const isConnected = connectionState === 'connected';
              return (
                <div
                  key={device.id}
                  className={`glass-card rounded-2xl p-4 transition-all duration-200 border ${
                    isConnected
                      ? 'border-emerald-500/40 bg-emerald-500/5'
                      : 'border-slate-800 hover:border-brand-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isConnected
                            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                            : 'bg-brand-500/10 border border-brand-500/20 text-brand-400'
                        }`}
                      >
                        <Bluetooth className="w-5 h-5" />
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xs font-bold text-slate-100">{device.name}</h4>
                          {isConnected && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[9px] font-bold text-emerald-400 flex items-center space-x-1">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>Connected</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-3 mt-1 text-[10px] text-slate-400 font-mono">
                          <span className={`flex items-center space-x-1 ${getRssiColor(device.rssi)}`}>
                            <Signal className="w-3 h-3" />
                            <span>{getRssiLabel(device.rssi)}</span>
                          </span>
                          <span>•</span>
                          <span>Seen: {device.lastSeen}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={isConnected ? disconnect : connect}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                        isConnected
                          ? 'bg-slate-800 hover:bg-slate-700 text-rose-400 border border-rose-500/30'
                          : 'bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 border border-brand-500/40'
                      }`}
                    >
                      {isConnected ? (
                        <span>Disconnect</span>
                      ) : (
                        <>
                          <span>Connect</span>
                          <ArrowRight className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Service Badges */}
                  <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center space-x-2 overflow-x-auto">
                    <span className="text-[9px] text-slate-500 font-mono uppercase">GATT Services:</span>
                    {device.serviceUuids.map((uuid, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] font-mono text-slate-400"
                      >
                        {uuid.slice(0, 8)}...
                      </span>
                    ))}
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
