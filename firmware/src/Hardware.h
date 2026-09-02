#pragma once

#include <Arduino.h>

// Hardware abstraction for BLE serial and vibration pin

#ifdef USE_SOFTSERIAL
#include <SoftwareSerial.h>
#endif

extern Stream* BLE_SERIAL;

void initHardware();
void configureBleName(const char* name); // send AT+NAME to BLE module (HM-10)

constexpr uint8_t VIB_PIN = 2;

inline void vibrate_pulse_hw(uint16_t ms) {
  if (ms == 0) return;
  digitalWrite(VIB_PIN, HIGH);
  delay(ms);
  digitalWrite(VIB_PIN, LOW);
}
