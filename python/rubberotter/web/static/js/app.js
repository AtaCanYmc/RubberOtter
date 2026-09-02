/**
 * Rubber Otter Web Dashboard Frontend Application Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const portSelect = document.getElementById('portSelect');
  const scanBtn = document.getElementById('scanBtn');
  const connectBtn = document.getElementById('connectBtn');
  const connectionStatusBadge = document.getElementById('connectionStatusBadge');
  const statusText = document.getElementById('statusText');
  const usbCount = document.getElementById('usbCount');
  const bleCount = document.getElementById('bleCount');
  
  const rawCheckbox = document.getElementById('rawCheckbox');
  const noAckCheckbox = document.getElementById('noAckCheckbox');

  const typeInput = document.getElementById('typeInput');
  const typeBtn = document.getElementById('typeBtn');
  const rawCmdInput = document.getElementById('rawCmdInput');
  const sendRawBtn = document.getElementById('sendRawBtn');
  
  const jigglerBtn = document.getElementById('jigglerBtn');
  const jigglerStatus = document.getElementById('jigglerStatus');
  
  const vibrateBtn = document.getElementById('vibrateBtn');
  const vibrateDuration = document.getElementById('vibrateDuration');
  const vibrateVal = document.getElementById('vibrateVal');
  
  const bleNameInput = document.getElementById('bleNameInput');
  const setBleNameBtn = document.getElementById('setBleNameBtn');

  const macroSlotsGrid = document.getElementById('macroSlotsGrid');
  const refreshMacrosBtn = document.getElementById('refreshMacrosBtn');

  const logConsole = document.getElementById('logConsole');
  const clearLogBtn = document.getElementById('clearLogBtn');
  const themeToggleBtn = document.getElementById('themeToggleBtn');

  let isConnected = false;
  let isJigglerActive = false;

  // Initialize
  initMacroSlots();
  performScan();
  checkStatus();
  setInterval(checkStatus, 3000);

  // Helper for Button Loader States
  function setButtonLoading(btn, isLoading, loadingText = '') {
    if (!btn) return;
    if (isLoading) {
      btn.disabled = true;
      if (!btn.dataset.originalText) {
        btn.dataset.originalText = btn.textContent;
      }
      const text = loadingText || btn.dataset.originalText;
      btn.innerHTML = `<span class="spinner"></span>${text}`;
    } else {
      btn.disabled = false;
      if (btn.dataset.originalText) {
        btn.textContent = btn.dataset.originalText;
      }
    }
  }

  // Theme Toggle
  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    document.body.classList.toggle('dark-theme');
  });

  // Logger
  function log(msg, type = 'info') {
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    const timestamp = new Date().toLocaleTimeString();
    entry.textContent = `[${timestamp}] ${msg}`;
    logConsole.appendChild(entry);
    logConsole.scrollTop = logConsole.scrollHeight;
  }

  clearLogBtn.addEventListener('click', () => {
    logConsole.innerHTML = '';
  });

  // Helper to get active mode flags
  function getModeFlags() {
    return {
      raw: rawCheckbox ? rawCheckbox.checked : false,
      no_ack: noAckCheckbox ? noAckCheckbox.checked : false,
    };
  }

  // Scan Devices
  async function performScan() {
    log('Scanning for BLE devices & USB Serial ports...', 'info');
    setButtonLoading(scanBtn, true, 'Scanning...');
    try {
      const res = await fetch('/api/scan?timeout=2.5');
      const data = await res.json();
      
      portSelect.innerHTML = '';
      const serials = data.serial_ports || [];
      const bles = data.ble_devices || [];

      usbCount.textContent = `USB: ${serials.length} found`;
      bleCount.textContent = `BLE: ${bles.length} found`;

      if (bles.length === 0 && serials.length === 0) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = 'No Rubber Otter devices found';
        portSelect.appendChild(opt);
      } else {
        // Add BLE devices first
        bles.forEach(d => {
          const opt = document.createElement('option');
          opt.value = `ble:${d.address}`;
          const matchLabel = d.is_target ? ' * [MATCH - BLE]' : '';
          opt.textContent = `BLE: ${d.name} (${d.address})${matchLabel}`;
          portSelect.appendChild(opt);
        });

        // Add Serial ports
        serials.forEach(p => {
          const opt = document.createElement('option');
          opt.value = `serial:${p.device}`;
          const matchLabel = p.candidate ? ` * [${p.board}]` : '';
          opt.textContent = `Serial: ${p.device}${matchLabel}`;
          portSelect.appendChild(opt);
        });
      }
      log(`Scan complete. Found ${bles.length} BLE devices and ${serials.length} USB serial ports.`, 'success');
    } catch (err) {
      log(`Scan error: ${err.message}`, 'error');
    } finally {
      setButtonLoading(scanBtn, false);
    }
  }

  scanBtn.addEventListener('click', performScan);

  // Check Status
  async function checkStatus() {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      isConnected = data.connected;

      if (isConnected) {
        connectionStatusBadge.className = 'status-badge status-connected';
        statusText.textContent = `Connected (${data.target || 'Device'})`;
        if (!connectBtn.disabled) {
          connectBtn.textContent = 'Disconnect';
          connectBtn.className = 'btn btn-secondary';
        }
      } else {
        connectionStatusBadge.className = 'status-badge status-disconnected';
        statusText.textContent = 'Disconnected';
        if (!connectBtn.disabled) {
          connectBtn.textContent = 'Connect';
          connectBtn.className = 'btn btn-primary';
        }
      }
    } catch (e) {
      // quiet poll failure
    }
  }

  // Connect / Disconnect
  connectBtn.addEventListener('click', async () => {
    if (isConnected) {
      log('Disconnecting from device...', 'info');
      setButtonLoading(connectBtn, true, 'Disconnecting...');
      try {
        await fetch('/api/disconnect', { method: 'POST' });
        await checkStatus();
      } finally {
        setButtonLoading(connectBtn, false);
        connectBtn.textContent = 'Connect';
        connectBtn.className = 'btn btn-primary';
      }
    } else {
      const selectedVal = portSelect.value;
      let bodyData = getModeFlags();

      if (selectedVal.startsWith('ble:')) {
        bodyData.ble_address = selectedVal.replace('ble:', '');
        log(`Connecting to BLE device: ${bodyData.ble_address}...`, 'info');
      } else if (selectedVal.startsWith('serial:')) {
        bodyData.port = selectedVal.replace('serial:', '');
        log(`Connecting to Serial port: ${bodyData.port}...`, 'info');
      } else {
        log(`Connecting via BLE auto-detection...`, 'info');
      }

      setButtonLoading(connectBtn, true, 'Connecting...');
      try {
        const res = await fetch('/api/connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyData),
        });
        const data = await res.json();
        if (data.success) {
          log(`Connected to ${data.target} successfully!`, 'success');
          await checkStatus();
        } else {
          log(`Connection failed: ${data.error}`, 'error');
        }
      } catch (err) {
        log(`Connection error: ${err.message}`, 'error');
      } finally {
        setButtonLoading(connectBtn, false);
      }
    }
  });

  // Send Command Helper
  async function sendCmd(cmdStr) {
    const modeFlags = getModeFlags();
    const modeInfo = modeFlags.raw ? ' [RAW]' : '';
    log(`Executing${modeInfo}: '${cmdStr}'...`, 'info');

    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cmd: cmdStr, ...modeFlags }),
      });
      const data = await res.json();
      if (data.success) {
        const note = data.note ? ` (${data.note})` : '';
        log(`[ACK] ACK Received!${note} (Seq: ${data.seq}, Status: ${data.status || 1})`, 'success');
        checkStatus();
        return true;
      } else {
        log(`[ERROR] Command failed: ${data.error || 'No ACK'}`, 'error');
        return false;
      }
    } catch (err) {
      log(`[ERROR] Execution error: ${err.message}`, 'error');
      return false;
    }
  }

  // Execute Typing
  typeBtn.addEventListener('click', async () => {
    const text = typeInput.value;
    if (!text) return;
    setButtonLoading(typeBtn, true, 'Executing...');
    try {
      const escaped = text.replace(/"/g, '\\"');
      await sendCmd(`type "${escaped}"`);
    } finally {
      setButtonLoading(typeBtn, false);
    }
  });

  // Typing Examples Preset Buttons
  document.querySelectorAll('.type-example-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const textToType = btn.getAttribute('data-type');
      if (textToType) {
        typeInput.value = textToType;
        setButtonLoading(btn, true, 'Typing...');
        try {
          const escaped = textToType.replace(/"/g, '\\"');
          await sendCmd(`type "${escaped}"`);
        } finally {
          setButtonLoading(btn, false);
        }
      }
    });
  });

  // Send Raw Frame
  sendRawBtn.addEventListener('click', async () => {
    const cmd = rawCmdInput.value.trim();
    if (!cmd) return;
    setButtonLoading(sendRawBtn, true, 'Sending...');
    try {
      await sendCmd(cmd);
    } finally {
      setButtonLoading(sendRawBtn, false);
    }
  });

  // Command Examples Preset Buttons
  document.querySelectorAll('.cmd-example-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const cmdStr = btn.getAttribute('data-cmd');
      if (cmdStr) {
        rawCmdInput.value = cmdStr;
        setButtonLoading(btn, true, 'Sending...');
        try {
          await sendCmd(cmdStr);
        } finally {
          setButtonLoading(btn, false);
        }
      }
    });
  });

  // Jiggler Toggle
  jigglerBtn.addEventListener('click', async () => {
    const ok = await sendCmd('jiggler toggle');
    if (ok) {
      isJigglerActive = !isJigglerActive;
      jigglerStatus.textContent = isJigglerActive ? 'ACTIVE' : 'OFF';
      jigglerBtn.style.borderColor = isJigglerActive ? 'var(--accent-green)' : 'var(--border-color)';
    }
  });

  // Vibration
  vibrateDuration.addEventListener('input', () => {
    vibrateVal.textContent = vibrateDuration.value;
  });

  vibrateBtn.addEventListener('click', () => {
    const dur = vibrateDuration.value;
    sendCmd(`vibrate ${dur}`);
  });

  // Mouse Controls
  document.querySelectorAll('.mouse-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action');
      if (action === 'click') {
        const button = btn.getAttribute('data-btn');
        fetch('/api/mouse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'click', button, ...getModeFlags() }),
        });
        log(`Triggered Mouse Click: ${button}`, 'info');
      } else if (action === 'wheel') {
        const wheel = parseInt(btn.getAttribute('data-val') || '1');
        fetch('/api/mouse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'wheel', wheel, ...getModeFlags() }),
        });
        log(`Triggered Mouse Wheel: ${wheel}`, 'info');
      }
    });
  });

  // Keyboard Shortcuts
  document.querySelectorAll('.key-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cmd = btn.getAttribute('data-cmd');
      sendCmd(cmd);
    });
  });

  // BLE Name Config
  if (setBleNameBtn) {
    setBleNameBtn.addEventListener('click', async () => {
      const newName = bleNameInput.value.trim();
      if (newName) {
        setButtonLoading(setBleNameBtn, true, 'Updating...');
        try {
          await sendCmd(`ble name "${newName}"`);
        } finally {
          setButtonLoading(setBleNameBtn, false);
        }
      }
    });
  }

  // Macro Reload
  if (refreshMacrosBtn) {
    refreshMacrosBtn.addEventListener('click', async () => {
      log('Fetching EEPROM macros from device...', 'info');
      setButtonLoading(refreshMacrosBtn, true, 'Loading...');
      try {
        await sendCmd('macro list');
      } finally {
        setButtonLoading(refreshMacrosBtn, false);
      }
    });
  }

  // Macro Slots Setup
  function initMacroSlots() {
    const slots = ['m0', 'm1', 'm2', 'm3', 'm4', 'm5'];
    const presetMacros = {
      m0: 'vibrate 150 && type "Hello Otter\\n"',
      m1: 'press GUI space && delay 150 && type "terminal\\n"',
    };
    macroSlotsGrid.innerHTML = '';

    slots.forEach(slot => {
      const card = document.createElement('div');
      card.className = 'macro-slot-card';
      const defaultBody = presetMacros[slot] || 'Click Edit to configure...';
      card.innerHTML = `
        <div class="macro-slot-title">Macro Slot ${slot}</div>
        <div class="macro-slot-body code-font" id="body_${slot}">${defaultBody}</div>
        <div class="macro-slot-actions">
          <button class="btn btn-sm btn-outline run-macro-btn" data-slot="${slot}">Run</button>
          <button class="btn btn-sm btn-secondary edit-macro-btn" data-slot="${slot}">Edit</button>
        </div>
      `;
      macroSlotsGrid.appendChild(card);
    });

    document.querySelectorAll('.run-macro-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const slot = btn.getAttribute('data-slot');
        setButtonLoading(btn, true, 'Running...');
        try {
          await sendCmd(`macro run ${slot}`);
        } finally {
          setButtonLoading(btn, false);
        }
      });
    });

    document.querySelectorAll('.edit-macro-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const slot = btn.getAttribute('data-slot');
        const bodyEl = document.getElementById(`body_${slot}`);
        const currentBody = bodyEl.textContent.includes('Click Edit') ? '' : bodyEl.textContent;
        const newCmd = prompt(`Enter command sequence for macro slot ${slot}:`, currentBody);
        if (newCmd !== null) {
          bodyEl.textContent = newCmd || 'Empty';
          sendCmd(`macro save ${slot} "${newCmd}"`);
        }
      });
    });
  }
});
