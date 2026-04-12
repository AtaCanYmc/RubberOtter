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

// Helper: read available data into String for up to timeout ms
static String readResponse(Stream* s, unsigned long timeout_ms) {
  String resp;
  unsigned long start = millis();
  while (millis() - start < timeout_ms) {
    while (s->available()) {
      char c = (char)s->read();
      resp += c;
    }
    if (resp.length() > 0) return resp;
    delay(5);
  }
  return resp;
}

void configureBleName(const char* name) {
  if (!BLE_SERIAL) return;

  // Flush any pending bytes
  while (BLE_SERIAL->available()) BLE_SERIAL->read();

  // Wake module with AT
  BLE_SERIAL->print("AT\r\n");
  String wake = readResponse(BLE_SERIAL, 300);

  if (Serial) {
    Serial.print(F("configureBleName: wake response: "));
    Serial.println(wake);
  }

  // Try two common syntaxes for HM-10 variants
  String cmd1 = String("AT+NAME") + String(name) + "\r\n";   // AT+NAMEname
  String cmd2 = String("AT+NAME=") + String(name) + "\r\n";  // AT+NAME=name

  // Attempt cmd1
  BLE_SERIAL->print(cmd1);
  String resp1 = readResponse(BLE_SERIAL, 800);
  if (Serial) {
    Serial.print(F("configureBleName: sent '")); Serial.print(cmd1); Serial.print(F("' response: ")); Serial.println(resp1);
  }

  bool ok = false;
  if (resp1.length() > 0) ok = true;

  // If not ok, try cmd2
  if (!ok) {
    BLE_SERIAL->print(cmd2);
    String resp2 = readResponse(BLE_SERIAL, 800);
    if (Serial) {
      Serial.print(F("configureBleName: sent '")); Serial.print(cmd2); Serial.print(F("' response: ")); Serial.println(resp2);
    }
    if (resp2.length() > 0) ok = true;
  }

  // Query the name to verify (some modules respond to AT+NAME?)
  BLE_SERIAL->print(String("AT+NAME?\r\n"));
  String verify = readResponse(BLE_SERIAL, 800);
  if (Serial) {
    Serial.print(F("configureBleName: verify response: ")); Serial.println(verify);
  }

  // Optionally echo short status back on BLE serial
  if (BLE_SERIAL && BLE_SERIAL != &Serial) {
    if (ok) BLE_SERIAL->print(F("OK\r\n"));
    else BLE_SERIAL->print(F("ERR\r\n"));
  }
}
