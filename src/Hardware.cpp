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

  // If a compile-time BLE_NAME is provided, attempt to configure HM-10 name on boot
#ifdef BLE_NAME
  configureBleName(BLE_NAME);
#endif
}

void configureBleName(const char* name) {
  if (!BLE_SERIAL) return;

  // HM-10 usually responds to AT commands at 9600 when not connected. Make a simple attempt.
  // Send an "AT" first to wake it and check response.
  const unsigned long timeout = 800;
  while (BLE_SERIAL->available()) BLE_SERIAL->read();

  BLE_SERIAL->print("AT\r\n");
  unsigned long start = millis();
  bool ok = false;
  // read any response for a short window
  while (millis() - start < timeout) {
    while (BLE_SERIAL->available()) {
      int c = BLE_SERIAL->read();
      (void)c;
      ok = true;
    }
  }

  // Now send AT+NAME<name>
  // HM-10 expects: AT+NAMEyourname (no quotes)
  String cmd = String("AT+NAME") + String(name) + "\r\n";
  BLE_SERIAL->print(cmd);

  // wait for response
  start = millis();
  String resp;
  while (millis() - start < 1200) {
    while (BLE_SERIAL->available()) {
      char c = (char)BLE_SERIAL->read();
      resp += c;
    }
    if (resp.length() > 0) break;
  }

  if (Serial) {
    Serial.print(F("configureBleName: sent '"));
    Serial.print(cmd);
    Serial.print(F("' response: "));
    Serial.println(resp);
  }

  // If BLE_SERIAL is the same physical HM-10 connection and also connected to host, echo response
  if (BLE_SERIAL && BLE_SERIAL != &Serial) {
    // print a short status to BLE serial as well (but avoid flooding)
    if (resp.length() > 0) {
      BLE_SERIAL->print(F("OK"));
    }
  }
}
