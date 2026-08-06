/*
  RubberOtter.ino
  Main Arduino sketch for Rubber Otter firmware project.
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
  delay(500);
}

void loop() {
  packetParser_poll();
  jiggler_poll();
  delay(1);
}
