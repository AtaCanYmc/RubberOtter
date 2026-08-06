#include "InputHelpers.h"
#include "Hardware.h"
#ifdef USE_HID_PROJECT
#include <HID-Project.h>
#else
#include <Keyboard.h>
#include <Mouse.h>
#endif
#include <ctype.h>
#include <string.h>
#include "Utils.h"

// Fallback Media Key Definitions
#ifndef KEY_MEDIA_PLAY_PAUSE
  #define KEY_MEDIA_PLAY_PAUSE 0xE8
#endif
#ifndef KEY_MEDIA_VOLUME_UP
  #define KEY_MEDIA_VOLUME_UP 0xE9
#endif
#ifndef KEY_MEDIA_VOLUME_DOWN
  #define KEY_MEDIA_VOLUME_DOWN 0xEA
#endif
#ifndef KEY_MEDIA_NEXT_TRACK
  #define KEY_MEDIA_NEXT_TRACK 0xEB
#endif
#ifndef KEY_MEDIA_PREVIOUS_TRACK
  #define KEY_MEDIA_PREVIOUS_TRACK 0xEC
#endif
#ifndef KEY_MEDIA_MUTE
  #define KEY_MEDIA_MUTE 0xED
#endif

static bool jigglerActiveState = false;
static unsigned long lastJiggleMillis = 0;
const unsigned long JIGGLE_INTERVAL_MS = 20000;

void sendHelp() {
  Serial.println(F("Rubber Otter - Available commands:"));
  if (BLE_SERIAL) BLE_SERIAL->println(F("Rubber Otter - Available commands:"));

  Serial.println(F("  help, ?                 - show this help"));
  if (BLE_SERIAL) BLE_SERIAL->println(F("  help, ?                 - show this help"));

  Serial.println(F("  type \"...\"            - type text (escapes: \\n, \\t, \\\")"));
  if (BLE_SERIAL) BLE_SERIAL->println(F("  type \"...\"            - type text (escapes: \\n, \\t, \\\")"));

  Serial.println(F("  delay N                 - delay N ms"));
  if (BLE_SERIAL) BLE_SERIAL->println(F("  delay N                 - delay N ms"));

  Serial.println(F("  enter, tab, backspace   - simple keys"));
  if (BLE_SERIAL) BLE_SERIAL->println(F("  enter, tab, backspace   - simple keys"));

  Serial.println(F("  press <mod> <ms>        - press modifier for ms (shift, ctrl, alt, gui)"));
  if (BLE_SERIAL) BLE_SERIAL->println(F("  press <mod> <ms>        - press modifier for ms (shift, ctrl, alt, gui)"));

  Serial.println(F("  hold <mod> / release <mod> - hold or release modifier"));
  if (BLE_SERIAL) BLE_SERIAL->println(F("  hold <mod> / release <mod> - hold or release modifier"));

  Serial.println(F("  vibrate N               - vibrate motor for N ms"));
  if (BLE_SERIAL) BLE_SERIAL->println(F("  vibrate N               - vibrate motor for N ms"));

  Serial.println(F("  media <cmd>             - media play_pause/volume_up/volume_down/next/mute"));
  if (BLE_SERIAL) BLE_SERIAL->println(F("  media <cmd>             - media play_pause/volume_up/volume_down/next/mute"));

  Serial.println(F("  mouse move <dx> <dy>    - relative mouse move"));
  if (BLE_SERIAL) BLE_SERIAL->println(F("  mouse move <dx> <dy>    - relative mouse move"));

  Serial.println(F("  mouse click left/right/middle - mouse click"));
  if (BLE_SERIAL) BLE_SERIAL->println(F("  mouse click left/right/middle - mouse click"));

  Serial.println(F("  jiggler on/off/toggle   - toggle mouse jiggler"));
  if (BLE_SERIAL) BLE_SERIAL->println(F("  jiggler on/off/toggle   - toggle mouse jiggler"));

  Serial.println(F("  macro define mX { ... } - save macro to slot m0..m5"));
  if (BLE_SERIAL) BLE_SERIAL->println(F("  macro define mX { ... } - save macro to slot m0..m5"));

  Serial.println(F("  macro run mX            - run macro slot m0..m5"));
  if (BLE_SERIAL) BLE_SERIAL->println(F("  macro run mX            - run macro slot m0..m5"));

  Serial.println(F("  Commands may be chained with && or ;"));
  if (BLE_SERIAL) BLE_SERIAL->println(F("  Commands may be chained with && or ;"));

  delay(2);
}

void sendHelpFor(const char* cmd) {
  if (!cmd || !*cmd) { sendHelp(); return; }
  sendHelp();
}

void keyboard_type_text(const char* s) {
  if (!s) return;
  while (*s) {
    char c = *s;
    if (c == '\\') {
      s++;
      char esc = *s;
      if (!esc) break;
      if (esc == 'n') Keyboard.write('\n');
      else if (esc == 't') Keyboard.write('\t');
      else Keyboard.write(esc);
    } else {
      Keyboard.write(c);
    }
    s++;
  }
}

void press_modifier_by_name(const char* name, uint16_t ms) {
  if (!name) return;
  if (strcmp(name, "shift") == 0) {
    Keyboard.press(KEY_LEFT_SHIFT);
    delay(ms);
    Keyboard.release(KEY_LEFT_SHIFT);
  } else if (strcmp(name, "ctrl") == 0) {
    Keyboard.press(KEY_LEFT_CTRL);
    delay(ms);
    Keyboard.release(KEY_LEFT_CTRL);
  } else if (strcmp(name, "alt") == 0) {
    Keyboard.press(KEY_LEFT_ALT);
    delay(ms);
    Keyboard.release(KEY_LEFT_ALT);
  } else if (strcmp(name, "gui") == 0 || strcmp(name, "win") == 0) {
    Keyboard.press(KEY_LEFT_GUI);
    delay(ms);
    Keyboard.release(KEY_LEFT_GUI);
  }
}

void hold_modifier(const char* name) {
  if (!name) return;
  if (strcmp(name, "shift") == 0) Keyboard.press(KEY_LEFT_SHIFT);
  else if (strcmp(name, "ctrl") == 0) Keyboard.press(KEY_LEFT_CTRL);
  else if (strcmp(name, "alt") == 0) Keyboard.press(KEY_LEFT_ALT);
  else if (strcmp(name, "gui") == 0 || strcmp(name, "win") == 0) Keyboard.press(KEY_LEFT_GUI);
}

void release_modifier(const char* name) {
  if (!name) return;
  if (strcmp(name, "shift") == 0) Keyboard.release(KEY_LEFT_SHIFT);
  else if (strcmp(name, "ctrl") == 0) Keyboard.release(KEY_LEFT_CTRL);
  else if (strcmp(name, "alt") == 0) Keyboard.release(KEY_LEFT_ALT);
  else if (strcmp(name, "gui") == 0 || strcmp(name, "win") == 0) Keyboard.release(KEY_LEFT_GUI);
}

void consumer_command(const char* cmd) {
  if (!cmd) return;
#ifdef USE_HID_PROJECT
  if (strcmp(cmd, "volume_up") == 0) Consumer.write(MEDIA_VOLUME_UP);
  else if (strcmp(cmd, "volume_down") == 0) Consumer.write(MEDIA_VOLUME_DOWN);
  else if (strcmp(cmd, "play_pause") == 0) Consumer.write(MEDIA_PLAY_PAUSE);
  else if (strcmp(cmd, "next") == 0) Consumer.write(MEDIA_NEXT);
  else if (strcmp(cmd, "prev") == 0) Consumer.write(MEDIA_PREVIOUS);
#else
  if (strcmp(cmd, "volume_up") == 0) Keyboard.write(KEY_MEDIA_VOLUME_UP);
  else if (strcmp(cmd, "volume_down") == 0) Keyboard.write(KEY_MEDIA_VOLUME_DOWN);
  else if (strcmp(cmd, "play_pause") == 0) Keyboard.write(KEY_MEDIA_PLAY_PAUSE);
  else if (strcmp(cmd, "next") == 0) Keyboard.write(KEY_MEDIA_NEXT_TRACK);
  else if (strcmp(cmd, "prev") == 0) Keyboard.write(KEY_MEDIA_PREVIOUS_TRACK);
  else if (strcmp(cmd, "mute") == 0) Keyboard.write(KEY_MEDIA_MUTE);
#endif
}

void mouse_move(int8_t dx, int8_t dy) {
  Mouse.move(dx, dy, 0);
}

void mouse_click(const char* button) {
  if (!button) { Mouse.click(MOUSE_LEFT); return; }
  if (strcmp(button, "right") == 0) Mouse.click(MOUSE_RIGHT);
  else if (strcmp(button, "middle") == 0) Mouse.click(MOUSE_MIDDLE);
  else Mouse.click(MOUSE_LEFT);
}

void mouse_scroll(int8_t amount) {
  Mouse.move(0, 0, amount);
}

void jiggler_set(bool active) {
  jigglerActiveState = active;
  lastJiggleMillis = millis();
}

bool jiggler_get() {
  return jigglerActiveState;
}

void jiggler_poll() {
  if (jigglerActiveState) {
    unsigned long currentMillis = millis();
    if (currentMillis - lastJiggleMillis >= JIGGLE_INTERVAL_MS) {
      lastJiggleMillis = currentMillis;
      Mouse.move(1, 0, 0);
      delay(30);
      Mouse.move(-1, 0, 0);
    }
  }
}
