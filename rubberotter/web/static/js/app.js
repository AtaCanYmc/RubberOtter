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
  
  const typeInput = document.getElementById('typeInput');
  const typeBtn = document.getElementById('typeBtn');
  const rawCmdInput = document.getElementById('rawCmdInput');
  const sendRawBtn = document.getElementById('sendRawBtn');
  
  const jigglerBtn = document.getElementById('jigglerBtn');
  const jigglerStatus = document.getElementById('jigglerStatus');
  
  const vibrateBtn = document.getElementById('vibrateBtn');
  const vibrateDuration = document.getElementById('vibrateDuration');
  const vibrateVal = document.getElementById('vibrateVal');
  
  const macroSlotsGrid = document.getElementById('macroSlotsGrid');
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

  // Theme Toggle
  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    document.body.classList.toggle('dark-theme');
  });

  // Log Logger
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

  // Scan Devices
  async function performScan() {
    log('Scanning for BLE devices & USB Serial ports...', 'info');
    scanBtn.disabled = true;
    try {
      const res = await fetch('/api/scan?timeout=2.0');
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
          const matchLabel = d.is_target ? ' ★ [MATCH - BLE]' : '';
          opt.textContent = `📡 BLE: ${d.name} (${d.address})${matchLabel}`;
          portSelect.appendChild(opt);
        });

        // Add Serial ports
        serials.forEach(p => {
          const opt = document.createElement('option');
          opt.value = `serial:${p.device}`;
          const matchLabel = p.candidate ? ` ★ [${p.board}]` : '';
          opt.textContent = `🔌 Serial: ${p.device}${matchLabel}`;
          portSelect.appendChild(opt);
        });
      }
      log(`Scan complete. Found ${bles.length} BLE devices and ${serials.length} USB serial ports.`, 'success');
    } catch (err) {
      log(`Scan error: ${err.message}`, 'error');
    } finally {
      scanBtn.disabled = false;
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
        connectBtn.textContent = 'Disconnect';
        connectBtn.className = 'btn btn-secondary';
      } else {
        connectionStatusBadge.className = 'status-badge status-disconnected';
        statusText.textContent = 'Disconnected';
        connectBtn.textContent = 'Connect';
        connectBtn.className = 'btn btn-primary';
      }
    } catch (e) {
      // quiet poll failure
    }
  }

  // Connect / Disconnect
  connectBtn.addEventListener('click', async () => {
    if (isConnected) {
      log('Disconnecting from device...', 'info');
      await fetch('/api/disconnect', { method: 'POST' });
      checkStatus();
    } else {
      const selectedVal = portSelect.value;
      let bodyData = {};
      if (selectedVal.startsWith('ble:')) {
        bodyData.ble_address = selectedVal.replace('ble:', '');
        log(`Connecting to BLE device: ${bodyData.ble_address}...`, 'info');
      } else if (selectedVal.startsWith('serial:')) {
        bodyData.port = selectedVal.replace('serial:', '');
        log(`Connecting to Serial port: ${bodyData.port}...`, 'info');
      } else {
        log(`Connecting via BLE auto-detection...`, 'info');
      }
      try {
        const res = await fetch('/api/connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyData),
        });
        const data = await res.json();
        if (data.success) {
          log(`Connected to ${data.target} successfully!`, 'success');
          checkStatus();
        } else {
          log(`Connection failed: ${data.error}`, 'error');
        }
      } catch (err) {
        log(`Connection error: ${err.message}`, 'error');
      }
    }
  });

  // Send Command Helper
  async function sendCmd(cmdStr) {
    log(`Executing: '${cmdStr}'...`, 'info');
    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cmd: cmdStr }),
      });
      const data = await res.json();
      if (data.success) {
        log(`✔ ACK Received! (Seq: ${data.seq}, Status: ${data.status})`, 'success');
        checkStatus();
        return true;
      } else {
        log(`✖ Command failed: ${data.error || 'No ACK'}`, 'error');
        return false;
      }
    } catch (err) {
      log(`✖ Execution error: ${err.message}`, 'error');
      return false;
    }
  }

  // Execute Typing
  typeBtn.addEventListener('click', () => {
    const text = typeInput.value;
    if (!text) return;
    const escaped = text.replace(/"/g, '\\"');
    sendCmd(`type "${escaped}"`);
  });

  // Send Raw Frame
  sendRawBtn.addEventListener('click', () => {
    const cmd = rawCmdInput.value.trim();
    if (cmd) sendCmd(cmd);
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

  // Keyboard Shortcuts
  document.querySelectorAll('.key-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cmd = btn.getAttribute('data-cmd');
      sendCmd(cmd);
    });
  });

  // Macro Slots Setup
  function initMacroSlots() {
    const slots = ['m0', 'm1', 'm2', 'm3', 'm4', 'm5'];
    macroSlotsGrid.innerHTML = '';

    slots.forEach(slot => {
      const card = document.createElement('div');
      card.className = 'macro-slot-card';
      card.innerHTML = `
        <div class="macro-slot-title">Macro Slot ${slot}</div>
        <div class="macro-slot-body code-font" id="body_${slot}">Click Edit to configure...</div>
        <div class="macro-slot-actions">
          <button class="btn btn-sm btn-outline run-macro-btn" data-slot="${slot}">▶ Run</button>
          <button class="btn btn-sm btn-secondary edit-macro-btn" data-slot="${slot}">✏️ Edit</button>
        </div>
      `;
      macroSlotsGrid.appendChild(card);
    });

    document.querySelectorAll('.run-macro-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const slot = btn.getAttribute('data-slot');
        sendCmd(`macro run ${slot}`);
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
