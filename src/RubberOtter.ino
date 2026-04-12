/*
  RubberOtter.ino
  Main Arduino sketch for Rubber Otter project.

  Features implemented:
  - Framed packet parser (STX/VER/SEQ/LEN/PAYLOAD/CHK/ETX)
  - Memory-safe ring buffer and bounded payload handling (no dynamic allocations)
  - Command executor supporting: type "...", delay N, enter, tab, backspace,
    press <modifier> <ms>, hold/release <modifier>, vibrate N, media commands (optional),
    macro define/run (EEPROM-backed), chaining with && and ;
  - ACK replies to host with small frame
  - Config options to use Serial1 (hardware) or SoftwareSerial

  Hardware notes:
  - Prefer Serial1 (hardware UART) for HM-10; if using 5V Pro Micro you MUST use a level shifter
    between TX from Pro Micro (if 5V) and RX of HM-10 (3.3V) or run Pro Micro at 3.3V.
  - Vibration motor pin should drive a transistor/MOSFET; do NOT drive motor directly from the MCU pin.

  Compile flags (optional):
  - Define USE_SOFTSERIAL to use SoftwareSerial on pins RX_PIN_SOFT/TX_PIN_SOFT
  - Define USE_HID_PROJECT to enable multimedia consumer keys (requires HID-Project library)

  Author: Generated for Rubber Otter
*/

#include <Arduino.h>
#include "Hardware.h"
#include "MacroStore.h"
#include "PacketParser.h"
#include "CommandExecutor.h"
#include "InputHelpers.h"

void setup() {
  Serial.begin(115200);
  initHardware();
  macro_store_init();
  initPacketParser();
  initCommandExecutor();

  Serial.println(F("Rubber Otter ready"));
  if (BLE_SERIAL) BLE_SERIAL->println(F("Rubber Otter ready"));
  delay(1000);
}

void loop() {
  packetParser_poll();
  // background tasks could be added here
  delay(1);
}
