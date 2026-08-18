# 🔌 Rubber Otter Arduino C++ Firmware Guide (`RubberOtter.ino`)

Complete, ready-to-flash Arduino C++ sketch for ATmega32U4 (SparkFun Pro Micro / Arduino Leonardo) with BT05 / HM-10 Bluetooth LE module and Vibration Motor.

---

## 🛠️ Pin Connections

| Component | Pin on Pro Micro / Leonardo | Pin on Module |
|---|---|---|
| **BT05 BLE Module TX** | **Pin 8 (SoftwareSerial RX)** | TX |
| **BT05 BLE Module RX** | **Pin 9 (SoftwareSerial TX)** | RX |
| **Vibration Motor** | **Pin 2 (PWM / Digital Output)** | Signal / VCC (+) |
| **GND** | GND | GND |
| **VCC (5V / 3.3V)** | VCC / 5V | VCC |

---

## 📄 Complete Arduino Sketch (`RubberOtter.ino`)

```cpp
#include <SoftwareSerial.h>
#include <Keyboard.h>
#include <Mouse.h>

// Pin Definitions
const int VIB_MOTOR_PIN = 2;
const int BLE_RX_PIN = 8;
const int BLE_TX_PIN = 9;

// SoftwareSerial instance for HM-10 / BT05 BLE module
SoftwareSerial ble(BLE_RX_PIN, BLE_TX_PIN);

// Mouse Jiggler State
bool isJigglerActive = false;
unsigned long lastJiggleTime = 0;
const unsigned long JIGGLE_INTERVAL = 15000; // Jiggle every 15 seconds

void setup() {
  // Initialize Serial for USB debugging
  Serial.begin(9600);

  // Initialize Bluetooth LE serial communication (default BT05 rate: 9600)
  ble.begin(9600);
  ble.listen();

  // Initialize Hardware Output Pins
  pinMode(VIB_MOTOR_PIN, OUTPUT);
  digitalWrite(VIB_MOTOR_PIN, LOW);

  // Initialize USB HID Keyboard & Mouse emulation
  Keyboard.begin();
  Mouse.begin();

  Serial.println("🦦 Rubber Otter BLE Firmware Ready!");
}

void loop() {
  // 1. Process Incoming Commands from Bluetooth LE
  if (ble.available()) {
    String input = ble.readStringUntil('\n');
    input.trim();
    if (input.length() > 0) {
      processCommand(input);
    }
  }

  // 2. Background Non-Blocking Mouse Jiggler Task
  if (isJigglerActive && (millis() - lastJiggleTime >= JIGGLE_INTERVAL)) {
    lastJiggleTime = millis();
    Mouse.move(2, 0, 0);
    delay(50);
    Mouse.move(-2, 0, 0);
  }
}

void processCommand(String cmd) {
  Serial.print("Received Command: ");
  Serial.println(cmd);

  // ----------------------------------------------------
  // Command 1: VIBRATE (e.g., "vibrate 200")
  // ----------------------------------------------------
  if (cmd.startsWith("vibrate")) {
    int duration = 200; // default duration in ms
    int spaceIndex = cmd.indexOf(' ');
    if (spaceIndex != -1) {
      duration = cmd.substring(spaceIndex + 1).toInt();
      if (duration <= 0) duration = 200;
    }
    digitalWrite(VIB_MOTOR_PIN, HIGH);
    delay(duration);
    digitalWrite(VIB_MOTOR_PIN, LOW);
    sendACK();
  }

  // ----------------------------------------------------
  // Command 2: TYPE (e.g., 'type "Hello World\n"')
  // ----------------------------------------------------
  else if (cmd.startsWith("type")) {
    String textToType = "";
    int firstQuote = cmd.indexOf('"');
    int lastQuote = cmd.lastIndexOf('"');
    if (firstQuote != -1 && lastQuote > firstQuote) {
      textToType = cmd.substring(firstQuote + 1, lastQuote);
    } else {
      int spaceIndex = cmd.indexOf(' ');
      if (spaceIndex != -1) textToType = cmd.substring(spaceIndex + 1);
    }

    // Unescape newlines (\n) and tabs (\t)
    textToType.replace("\\n", "\n");
    textToType.replace("\\t", "\t");
    Keyboard.print(textToType);
    sendACK();
  }

  // ----------------------------------------------------
  // Command 3: JIGGLER (e.g., "jiggler toggle", "jiggler start")
  // ----------------------------------------------------
  else if (cmd.startsWith("jiggler")) {
    if (cmd.endsWith("start")) {
      isJigglerActive = true;
    } else if (cmd.endsWith("stop")) {
      isJigglerActive = false;
    } else { // toggle
      isJigglerActive = !isJigglerActive;
    }
    sendACK();
  }

  // ----------------------------------------------------
  // Command 4: KEY PRESSES (e.g., "enter", "tab", "backspace")
  // ----------------------------------------------------
  else if (cmd == "enter") {
    Keyboard.write(KEY_RETURN);
    sendACK();
  }
  else if (cmd == "tab") {
    Keyboard.write(KEY_TAB);
    sendACK();
  }
  else if (cmd == "backspace") {
    Keyboard.write(KEY_BACKSPACE);
    sendACK();
  }

  // ----------------------------------------------------
  // Command 5: DELAY (e.g., "delay 500")
  // ----------------------------------------------------
  else if (cmd.startsWith("delay")) {
    int ms = cmd.substring(6).toInt();
    if (ms > 0) delay(ms);
    sendACK();
  }

  // Unknown command fallback
  else {
    sendACK();
  }
}

// Sends ACK Response Back Over Bluetooth LE
void sendACK() {
  ble.println("OK");
}
```
