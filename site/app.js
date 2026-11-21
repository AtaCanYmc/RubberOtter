(() => {
  const isSupported = typeof navigator !== 'undefined' && 'serial' in navigator;

  const connectBtn = document.getElementById('connectBtn');
  const disconnectBtn = document.getElementById('disconnectBtn');
  const bootloaderBtn = document.getElementById('bootloaderBtn');
  const flashBtn = document.getElementById('flashBtn');
  const clearLogBtn = document.getElementById('clearLogBtn');
  const boardSelect = document.getElementById('boardSelect');
  const firmwareFile = document.getElementById('firmwareFile');
  const progressBar = document.getElementById('progressBar');
  const statusLine = document.getElementById('statusLine');
  const logOutput = document.getElementById('logOutput');
  const unsupportedBanner = document.getElementById('unsupportedBanner');

  let port = null;
  let firmwareBytes = null;

  function log(level, message) {
    const ts = new Date().toLocaleTimeString('en-GB', { hour12: false });
    logOutput.textContent += `[${ts}] [${level}] ${message}\n`;
    logOutput.scrollTop = logOutput.scrollHeight;
  }

  function setStatus(text, progress) {
    statusLine.textContent = text;
    if (typeof progress === 'number') {
      progressBar.style.width = `${progress}%`;
    }
  }

  function refreshButtons() {
    connectBtn.hidden = Boolean(port);
    disconnectBtn.hidden = !port;
    flashBtn.disabled = !port || !firmwareBytes;
  }

  function getBaudRate() {
    return boardSelect.value === 'esp32' ? 115200 : 57600;
  }

  if (!isSupported) {
    unsupportedBanner.hidden = false;
    connectBtn.disabled = true;
    bootloaderBtn.disabled = true;
    log('WARN', 'Web Serial API unavailable in this browser.');
  } else {
    log('INFO', 'RubberOtter Caterina 1200 bps Web Serial Flasher ready.');
  }

  connectBtn.addEventListener('click', async () => {
    try {
      const baudRate = getBaudRate();
      const selected = await navigator.serial.requestPort();
      await selected.open({ baudRate });
      port = selected;
      setStatus(`CONNECTED @ ${baudRate} BAUD`, 0);
      log('OK', `Serial port opened at ${baudRate} baud.`);
      refreshButtons();
    } catch (err) {
      log('ERROR', err instanceof Error ? err.message : String(err));
    }
  });

  disconnectBtn.addEventListener('click', async () => {
    if (!port) return;
    try {
      await port.close();
      log('INFO', 'Serial port closed.');
    } catch (err) {
      log('ERROR', err instanceof Error ? err.message : String(err));
    } finally {
      port = null;
      setStatus('DISCONNECTED', 0);
      refreshButtons();
    }
  });

  bootloaderBtn.addEventListener('click', async () => {
    try {
      const targetPort = port || (await navigator.serial.requestPort());
      if (port) {
        await port.close();
        port = null;
      }
      log('INFO', 'Opening port at 1200 bps to trigger Caterina bootloader reset...');
      await targetPort.open({ baudRate: 1200 });
      await new Promise((resolve) => setTimeout(resolve, 200));
      await targetPort.close();
      setStatus('BOOTLOADER ACTIVE (8s WINDOW)', 0);
      log('OK', '1200 bps reset pulse sent. Reconnect to the bootloader port within 8 seconds.');
      refreshButtons();
    } catch (err) {
      log('ERROR', `Bootloader reset failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  });

  firmwareFile.addEventListener('change', async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      firmwareBytes = null;
      refreshButtons();
      return;
    }
    firmwareBytes = new Uint8Array(await file.arrayBuffer());
    log('INFO', `Loaded ${file.name} (${(firmwareBytes.length / 1024).toFixed(1)} KB).`);
    refreshButtons();
  });

  flashBtn.addEventListener('click', async () => {
    if (!port || !firmwareBytes || !port.writable) {
      return;
    }
    flashBtn.disabled = true;
    setStatus('WRITING FIRMWARE...', 10);
    const writer = port.writable.getWriter();
    try {
      const chunkSize = 256;
      for (let offset = 0; offset < firmwareBytes.length; offset += chunkSize) {
        const chunk = firmwareBytes.slice(offset, offset + chunkSize);
        await writer.write(chunk);
        const pct = Math.min(100, Math.round(((offset + chunk.length) / firmwareBytes.length) * 100));
        setStatus(`WRITING ${pct}%`, pct);
      }
      log('OK', `Transmitted ${firmwareBytes.length} bytes to ${boardSelect.value.toUpperCase()}.`);
      setStatus('COMPLETE', 100);
    } catch (err) {
      log('ERROR', `Flash failed: ${err instanceof Error ? err.message : String(err)}`);
      setStatus('ERROR', 0);
    } finally {
      writer.releaseLock();
      refreshButtons();
    }
  });

  clearLogBtn.addEventListener('click', () => {
    logOutput.textContent = '';
  });
})();
