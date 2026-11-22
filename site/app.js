(() => {
  const REPO = "AtaCanYmc/RubberOtter";
  const motionQuery = window.matchMedia("(prefers-reduced-motion: no-preference)");
  const isSerialSupported = typeof navigator !== "undefined" && "serial" in navigator;

  // 1. Target board selector (Pro Micro / Leonardo / ESP32 Bridge)
  let selectedBoard = "pro_micro";
  let selectedBaud = 57600;

  const boardSpec = document.getElementById("boardSpec");
  const baudReadout = document.getElementById("baudReadout");

  document.getElementById("boardSelector").addEventListener("click", (e) => {
    const btn = e.target.closest(".board-btn");
    if (!btn) return;
    document.querySelectorAll(".board-btn").forEach((b) => {
      const active = b === btn;
      b.classList.toggle("active", active);
      b.setAttribute("aria-pressed", String(active));
    });
    selectedBoard = btn.dataset.board;
    selectedBaud = Number(btn.dataset.baud) || 57600;
    boardSpec.textContent = btn.dataset.spec;
    baudReadout.textContent = `${selectedBaud} BAUD`;
    log("INFO", `Target board switched to ${selectedBoard.toUpperCase()} (${selectedBaud} baud).`);
  });

  // 2. Fetch latest GitHub Release tag and date
  async function loadLatestRelease() {
    const tagEl = document.getElementById("releaseTag");
    const metaEl = document.getElementById("releaseMeta");

    try {
      const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`);
      if (!res.ok) throw new Error("Release fetch failed");
      const data = await res.json();
      const date = new Date(data.published_at).toISOString().slice(0, 10);

      tagEl.textContent = data.tag_name;
      metaEl.textContent = `${data.tag_name} (${date})`;
    } catch {
      metaEl.textContent = "Latest on GitHub";
    }
  }
  loadLatestRelease();

  // 3. Interactive PCB 3D tilt (reduced-motion safe) and keyboard-accessible hotspots
  const pcbCard = document.getElementById("pcbCard");
  const hotspotStatus = document.getElementById("hotspotStatus");
  const hotspotDetail = document.getElementById("hotspotDetail");
  const DEFAULT_HOTSPOT_DETAIL = "Hover or focus a hardware block to inspect signal path.";

  pcbCard.addEventListener("mousemove", (e) => {
    if (!motionQuery.matches) return;
    const rect = pcbCard.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    pcbCard.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
  });

  pcbCard.addEventListener("mouseleave", () => {
    pcbCard.style.transform = "";
  });

  function showHotspot(el) {
    hotspotStatus.textContent = el.dataset.name;
    hotspotStatus.style.color = "var(--accent)";
    hotspotDetail.textContent = el.dataset.detail;
  }

  function resetHotspot() {
    hotspotStatus.textContent = "INSPECT MODULE";
    hotspotStatus.style.color = "var(--muted)";
    hotspotDetail.textContent = DEFAULT_HOTSPOT_DETAIL;
  }

  document.querySelectorAll(".hotspot").forEach((el) => {
    el.addEventListener("mouseenter", () => showHotspot(el));
    el.addEventListener("mouseleave", resetHotspot);
    el.addEventListener("focus", () => showHotspot(el));
    el.addEventListener("blur", resetHotspot);
  });

  // 4. Caterina 1200 bps Web Serial Flasher Workbench
  const connectBtn = document.getElementById("connectBtn");
  const disconnectBtn = document.getElementById("disconnectBtn");
  const bootloaderBtn = document.getElementById("bootloaderBtn");
  const flashBtn = document.getElementById("flashBtn");
  const clearLogBtn = document.getElementById("clearLogBtn");
  const firmwareFile = document.getElementById("firmwareFile");
  const fileHint = document.getElementById("fileHint");
  const progressBar = document.getElementById("progressBar");
  const progressTrack = document.getElementById("progressTrack");
  const progressPct = document.getElementById("progressPct");
  const statusLine = document.getElementById("statusLine");
  const logOutput = document.getElementById("logOutput");
  const unsupportedBanner = document.getElementById("unsupportedBanner");

  let port = null;
  let firmwareBytes = null;

  function log(level, message) {
    const ts = new Date().toLocaleTimeString("en-GB", { hour12: false });
    logOutput.textContent += `[${ts}] [${level}] ${message}\n`;
    logOutput.scrollTop = logOutput.scrollHeight;
  }

  function setStatus(text, progress) {
    statusLine.textContent = text;
    if (typeof progress === "number") {
      progressBar.style.width = `${progress}%`;
      progressTrack.setAttribute("aria-valuenow", String(progress));
      progressPct.textContent = `${progress}%`;
    }
  }

  function refreshButtons() {
    connectBtn.hidden = Boolean(port);
    disconnectBtn.hidden = !port;
    flashBtn.disabled = !port || !firmwareBytes;
  }

  if (!isSerialSupported) {
    unsupportedBanner.hidden = false;
    connectBtn.disabled = true;
    bootloaderBtn.disabled = true;
    log("WARN", "Web Serial API unavailable in this browser.");
  } else {
    log("INFO", "RubberOtter Caterina 1200 bps Web Serial Flasher ready.");
  }

  connectBtn.addEventListener("click", async () => {
    try {
      const selected = await navigator.serial.requestPort();
      await selected.open({ baudRate: selectedBaud });
      port = selected;
      setStatus(`CONNECTED @ ${selectedBaud} BAUD`, 0);
      log("OK", `Serial port opened at ${selectedBaud} baud for ${selectedBoard.toUpperCase()}.`);
      refreshButtons();
    } catch (err) {
      log("ERROR", err instanceof Error ? err.message : String(err));
    }
  });

  disconnectBtn.addEventListener("click", async () => {
    if (!port) return;
    try {
      await port.close();
      log("INFO", "Serial port closed.");
    } catch (err) {
      log("ERROR", err instanceof Error ? err.message : String(err));
    } finally {
      port = null;
      setStatus("DISCONNECTED", 0);
      refreshButtons();
    }
  });

  bootloaderBtn.addEventListener("click", async () => {
    try {
      const targetPort = port || (await navigator.serial.requestPort());
      if (port) {
        await port.close();
        port = null;
      }
      log("INFO", "Opening port at 1200 bps to trigger Caterina bootloader reset...");
      await targetPort.open({ baudRate: 1200 });
      await new Promise((resolve) => setTimeout(resolve, 200));
      await targetPort.close();
      setStatus("BOOTLOADER ACTIVE (8s WINDOW)", 0);
      log("OK", "1200 bps reset pulse sent. Reconnect to the bootloader port within 8 seconds.");
      refreshButtons();
    } catch (err) {
      log("ERROR", `Bootloader reset failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  });

  firmwareFile.addEventListener("change", async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      firmwareBytes = null;
      fileHint.textContent = "No firmware loaded. Select a .hex release image.";
      refreshButtons();
      return;
    }
    firmwareBytes = new Uint8Array(await file.arrayBuffer());
    const kb = (firmwareBytes.length / 1024).toFixed(1);
    fileHint.textContent = `Loaded ${file.name} (${kb} KB)`;
    log("INFO", `Loaded ${file.name} (${kb} KB).`);
    refreshButtons();
  });

  flashBtn.addEventListener("click", async () => {
    if (!port || !firmwareBytes || !port.writable) return;
    flashBtn.disabled = true;
    setStatus("WRITING FIRMWARE...", 5);
    const writer = port.writable.getWriter();
    try {
      const chunkSize = 256;
      for (let offset = 0; offset < firmwareBytes.length; offset += chunkSize) {
        const chunk = firmwareBytes.slice(offset, offset + chunkSize);
        await writer.write(chunk);
        const pct = Math.min(100, Math.round(((offset + chunk.length) / firmwareBytes.length) * 100));
        setStatus(`WRITING ${pct}%`, pct);
      }
      log("OK", `Transmitted ${firmwareBytes.length} bytes to ${selectedBoard.toUpperCase()}.`);
      setStatus("COMPLETE", 100);
    } catch (err) {
      log("ERROR", `Flash failed: ${err instanceof Error ? err.message : String(err)}`);
      setStatus("ERROR", 0);
    } finally {
      writer.releaseLock();
      refreshButtons();
    }
  });

  clearLogBtn.addEventListener("click", () => {
    logOutput.textContent = "";
    log("INFO", "Serial log cleared.");
  });

  // 5. Accessible keyboard helper for tablists (selection follows focus)
  function wireTablistKeyboard(container, onSelect) {
    container.addEventListener("keydown", (e) => {
      const tabs = Array.from(container.querySelectorAll('[role="tab"]'));
      const current = tabs.indexOf(document.activeElement);
      if (current === -1) return;

      let next = -1;
      if (e.key === "ArrowRight") next = (current + 1) % tabs.length;
      else if (e.key === "ArrowLeft") next = (current - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = tabs.length - 1;

      if (next !== -1) {
        e.preventDefault();
        tabs[next].focus();
        tabs[next].scrollIntoView({ block: "nearest", inline: "nearest" });
        onSelect(tabs[next]);
      }
    });
  }

  // 6. Interactive RubberOtter v1 Payload Simulator
  const PRESETS = {
    chain: {
      script: `press gui 50 && delay 250 && type "terminal" && delay 150 && enter\ndelay 350 && type "echo \\"RubberOtter HID active\\"" && enter`,
      events: [
        { delay: 240, type: "hid", text: "[BLE 0xFFE1] RX STX VER=0x01 SEQ=0x01 LEN=112 XOR=OK" },
        { delay: 300, type: "hid", text: "[ATmega32U4] PRESS: LEFT_GUI (50ms)" },
        { delay: 340, type: "hid", text: "[ATmega32U4] TYPE: terminal + KEY_RETURN" },
        { delay: 400, type: "host", text: 'zsh % echo "RubberOtter HID active"' },
        { delay: 260, type: "host", text: "RubberOtter HID active" },
        { delay: 200, type: "hid", text: "[BLE 0xFFE1] TX ACK [0x02 0x01 0x01 0x01 0x00 0x03]" }
      ]
    },
    haptic: {
      script: `vibrate 150 && type "make test" && enter\nmacro save m0 "vibrate 100 && type \\"git status\\" && enter"`,
      events: [
        { delay: 240, type: "hid", text: "[BLE 0xFFE1] RX STX VER=0x01 SEQ=0x02 XOR=OK" },
        { delay: 280, type: "hid", text: "[GPIO PIN 2] HAPTIC PULSE HIGH (150ms)" },
        { delay: 320, type: "hid", text: "[ATmega32U4] TYPE: make test + KEY_RETURN" },
        { delay: 340, type: "host", text: "Ran 18 tests in 0.14s: OK" },
        { delay: 260, type: "hid", text: "[EEPROM] Saved macro slot m0" },
        { delay: 200, type: "hid", text: "[BLE 0xFFE1] TX ACK [0x02 0x01 0x02 0x01 0x00 0x03]" }
      ]
    },
    jiggler: {
      script: `jiggler toggle\nmouse move 24 -12 && mouse click left`,
      events: [
        { delay: 240, type: "hid", text: "[BLE 0xFFE1] RX STX VER=0x01 SEQ=0x03 XOR=OK" },
        { delay: 300, type: "hid", text: "[ATmega32U4] JIGGLER STATE -> ENABLED" },
        { delay: 320, type: "hid", text: "[HID MOUSE] RELATIVE 0x80 dx=+24 dy=-12" },
        { delay: 280, type: "hid", text: "[HID MOUSE] CLICK LEFT" },
        { delay: 200, type: "hid", text: "[BLE 0xFFE1] TX ACK [0x02 0x01 0x03 0x01 0x00 0x03]" }
      ]
    }
  };

  let activePreset = "chain";
  let simRunning = false;

  const simPresetsEl = document.getElementById("simPresets");
  const simCode = document.getElementById("simCode");
  const termOutput = document.getElementById("termOutput");
  const simState = document.getElementById("simState");
  const runSimBtn = document.getElementById("runSimBtn");

  function renderPreset(key) {
    activePreset = key;
    simCode.textContent = PRESETS[key].script;
    simPresetsEl.querySelectorAll('[role="tab"]').forEach((tab) => {
      const selected = tab.dataset.preset === key;
      tab.setAttribute("aria-selected", String(selected));
    });
  }

  simPresetsEl.addEventListener("click", (e) => {
    const tab = e.target.closest('[role="tab"]');
    if (tab && !simRunning) {
      renderPreset(tab.dataset.preset);
      tab.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  });

  wireTablistKeyboard(simPresetsEl, (tab) => {
    if (!simRunning) renderPreset(tab.dataset.preset);
  });

  runSimBtn.addEventListener("click", async () => {
    if (simRunning) return;
    simRunning = true;
    runSimBtn.disabled = true;
    simState.textContent = "INJECTING";
    termOutput.innerHTML = `<div class="dim">// USB HID endpoint active (ATmega32U4 + HM-10)...</div>`;

    for (const evt of PRESETS[activePreset].events) {
      const wait = motionQuery.matches ? evt.delay : 40;
      await new Promise((r) => setTimeout(r, wait));
      const line = document.createElement("div");
      line.className = evt.type === "hid" ? "hid-evt" : "";
      line.textContent = evt.text;
      termOutput.appendChild(line);
      termOutput.scrollTop = termOutput.scrollHeight;
    }

    const done = document.createElement("div");
    done.className = "dim";
    done.textContent = "// Payload completed.";
    termOutput.appendChild(done);

    simState.textContent = "COMPLETE";
    simRunning = false;
    runSimBtn.disabled = false;
  });

  renderPreset(activePreset);

  // 7. CLI / MCP / Python SDK Usage Tabs + Invoker Command Copy Button
  const USAGE_SNIPPETS = {
    cli: {
      code: `# Install Python SDK, CLI, and MCP server
pip install rubberotter

# Scan nearby BLE 0xFFE0 peripherals and USB serial ports
rubberotter scan

# Type text via ATmega32U4 USB HID
rubberotter type "Hello from RubberOtter\\n"

# Trigger 150ms haptic pulse on Pin 2
rubberotter vibrate 150

# Toggle background mouse jiggler
rubberotter jiggler toggle`,
      meta: "Install via pip install rubberotter. Supports BLE 0xFFE0 via Bleak and USB CDC via PySerial."
    },
    mcp: {
      code: `// Add to Claude Desktop, Cursor, or Antigravity MCP config
{
  "mcpServers": {
    "rubberotter": {
      "command": "rubberotter",
      "args": ["mcp"]
    }
  }
}

// Inspect tools or print config snippets:
// rubberotter mcp --list-tools
// rubberotter mcp --config-claude`,
      meta: "Runs a JSON-RPC 2.0 stdio MCP server exposing HID keyboard, mouse, haptic, and macro tools."
    },
    sdk: {
      code: `from rubberotter import RubberOtter

# Auto-discovers HM-10 BLE 0xFFE0 or USB CDC serial port
with RubberOtter() as otter:
    otter.vibrate(150)
    otter.type("git status\\n")
    otter.delay(100)
    otter.mouse_click("left")
    otter.jiggler_toggle()
    otter.macro_save("m0", 'vibrate 100 && type "echo done\\n"')
    otter.macro_run("m0")`,
      meta: "Also provides AsyncRubberOtter for asyncio workflows and RubberOtterToolRegistry for OpenAI/Anthropic schemas."
    }
  };

  let activeUsage = "cli";
  const usageTabsEl = document.getElementById("usageTabs");
  const usageCode = document.getElementById("usageCode");
  const usageMeta = document.getElementById("usageMeta");

  function renderUsage(key) {
    activeUsage = key;
    usageCode.textContent = USAGE_SNIPPETS[key].code;
    usageMeta.textContent = USAGE_SNIPPETS[key].meta;
    usageTabsEl.querySelectorAll('[role="tab"]').forEach((tab) => {
      const selected = tab.dataset.usage === key;
      tab.setAttribute("aria-selected", String(selected));
    });
  }

  usageTabsEl.addEventListener("click", (e) => {
    const tab = e.target.closest('[role="tab"]');
    if (tab) {
      renderUsage(tab.dataset.usage);
      tab.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  });

  wireTablistKeyboard(usageTabsEl, (tab) => renderUsage(tab.dataset.usage));
  renderUsage(activeUsage);

  // Copy button using Invoker Commands + progressive click fallback
  const copyTimers = new WeakMap();
  let lastAnnouncement = "";

  function reportCopy(button, ok) {
    const tip = button.nextElementSibling;
    clearTimeout(copyTimers.get(button));
    button.removeAttribute("data-copied");
    button.removeAttribute("data-failed");
    let message = ok ? "Copied" : "Copy failed";
    if (message === lastAnnouncement) message += "\u00A0";
    lastAnnouncement = message;
    tip.textContent = "";
    void button.offsetWidth;
    button.setAttribute(ok ? "data-copied" : "data-failed", "");
    requestAnimationFrame(() => {
      tip.textContent = message;
    });
    copyTimers.set(
      button,
      setTimeout(() => {
        button.removeAttribute("data-copied");
        button.removeAttribute("data-failed");
        tip.textContent = "";
      }, 2000)
    );
  }

  async function copyTarget(button, target) {
    const text = target.innerText.trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      reportCopy(button, true);
    } catch {
      reportCopy(button, false);
    }
  }

  document.addEventListener(
    "command",
    (event) => {
      if (event.command === "--copy") copyTarget(event.source, event.target);
    },
    true
  );

  if (!("CommandEvent" in window)) {
    document.addEventListener("click", (event) => {
      const button = event.target.closest('button[command="--copy"]');
      if (!button) return;
      const target = document.getElementById(button.getAttribute("commandfor"));
      if (target) copyTarget(button, target);
    });
  }
})();
