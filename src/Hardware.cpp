#include "Hardware.h"
#include <Arduino.h>

#ifdef USE_SOFTSERIAL
// define pins and instance when using SoftwareSerial
const uint8_t RX_PIN_SOFT = 8; // HM-10 TX -> Arduino RX (soft)
const uint8_t TX_PIN_SOFT = 9; // HM-10 RX <- Arduino TX (soft)
static SoftwareSerial softSerial(RX_PIN_SOFT, TX_PIN_SOFT);
#endif

// Define global BLE serial pointer
Stream* BLE_SERIAL = nullptr;

void initHardware() {
  pinMode(VIB_PIN, OUTPUT);
  digitalWrite(VIB_PIN, LOW);

#ifndef USE_SOFTSERIAL
  BLE_SERIAL = &Serial1;
#else
  BLE_SERIAL = &softSerial;
  softSerial.begin(9600);
#endif

  // If hardware serial is used, we'll init it here at default HM-10 baud
#ifndef USE_SOFTSERIAL
  Serial1.begin(9600);
#endif
}

