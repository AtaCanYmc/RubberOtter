#include "InputHelpers.h"
#include "Hardware.h"
#include <Keyboard.h>
#ifdef USE_HID_PROJECT
#include <HID-Project.h>
#endif
#include <ctype.h>
#include <string.h>
#include "Utils.h"

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

  Serial.println(F("  media <cmd>             - media play/pause/volume_up/volume_down (requires HID-Project)"));
  if (BLE_SERIAL) BLE_SERIAL->println(F("  media <cmd>             - media play/pause/volume_up/volume_down (requires HID-Project)"));

  Serial.println(F("  macro define mX { ... } - save macro to slot m0..m5"));
  if (BLE_SERIAL) BLE_SERIAL->println(F("  macro define mX { ... } - save macro to slot m0..m5"));

  Serial.println(F("  macro run mX            - run macro slot m0..m5"));
  if (BLE_SERIAL) BLE_SERIAL->println(F("  macro run mX            - run macro slot m0..m5"));

  Serial.println(F("  Commands may be chained with && or ;"));
  if (BLE_SERIAL) BLE_SERIAL->println(F("  Commands may be chained with && or ;"));

  Serial.println(F("  Framing: STX VERSION SEQ LEN(2) PAYLOAD CHK ETX"));
  if (BLE_SERIAL) BLE_SERIAL->println(F("  Framing: STX VERSION SEQ LEN(2) PAYLOAD CHK ETX"));

  Serial.println(F("  ACK: STX VERSION SEQ STATUS CODE ETX"));
  if (BLE_SERIAL) BLE_SERIAL->println(F("  ACK: STX VERSION SEQ STATUS CODE ETX"));

  delay(2);
}

void sendHelpFor(const char* cmd) {
  if (!cmd || !*cmd) { sendHelp(); return; }
  char token[32]; size_t i = 0; const char* p = cmd;
  while (*p && isspace((unsigned char)*p)) p++;
  while (*p && !isspace((unsigned char)*p) && i < sizeof(token)-1) { char c = *p++; token[i++] = (char)tolower((unsigned char)c); }
  token[i] = '\0';
  #define P(x) do { Serial.println(F(x)); if (BLE_SERIAL) BLE_SERIAL.println(F(x)); } while(0)
  if (strcmp(token, "type") == 0) { P("type \"...\"  — Send literal text. Supports escapes: \\n -> newline, \\t -> tab, \\\" -> quote. Example: type \"Hello\\nWorld\""); P("Max length per payload is limited; for long text, consider chunking or macros."); }
  else if (strcmp(token, "delay") == 0) { P("delay N  — Pause execution for N milliseconds. Example: delay 250"); }
  else if (strcmp(token, "enter") == 0) { P("enter  — Sends the Enter/Return key."); }
  else if (strcmp(token, "tab") == 0) { P("tab  — Sends the Tab key."); }
  else if (strcmp(token, "backspace") == 0) { P("backspace  — Sends Backspace."); }
  else if (strcmp(token, "press") == 0) { P("press <mod> <ms>  — Temporarily holds a modifier (shift, ctrl, alt, gui) for <ms> milliseconds. Example: press shift 50"); }
  else if (strcmp(token, "hold") == 0) { P("hold <mod>  — Holds a modifier key until release <mod> is called. Example: hold ctrl"); }
  else if (strcmp(token, "release") == 0) { P("release <mod>  — Releases a previously held modifier. Example: release ctrl"); }
  else if (strcmp(token, "vibrate") == 0) { P("vibrate N  — Triggers vibration motor for N milliseconds (uses VIB_PIN via MOSFET). Example: vibrate 100"); }
  else if (strcmp(token, "media") == 0) { P("media <cmd>  — Multimedia commands (requires HID-Project). Supported: play_pause, volume_up, volume_down, next"); }
  else if (strcmp(token, "macro") == 0) { P("macro define mX { ... }  — Save macro to slot m0..m5. Example: macro define m0 { type \"Hi\" && enter }"); P("macro run mX  — Run macro slot m0..m5. Example: macro run m0"); }
  else if (strcmp(token, "framing") == 0 || strcmp(token, "packet") == 0) { P("Framing: STX(0x02) VERSION(0x01) SEQ(1) LEN(2 BE) PAYLOAD CHECKSUM(1 XOR) ETX(0x03)"); P("ACK: STX VERSION SEQ STATUS(1=OK) CODE ETX. Host must retry on timeout."); }
  else { Serial.print(F("No detailed help for: ")); Serial.println(token); if (BLE_SERIAL) { BLE_SERIAL.print(F("No detailed help for: ")); BLE_SERIAL.println(token); } delay(2); sendHelp(); }
  #undef P
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
#ifdef USE_HID_PROJECT
  if (!cmd) return;
  if (strcmp(cmd, "volume_up") == 0) Consumer.write(MEDIA_VOLUME_UP);
  else if (strcmp(cmd, "volume_down") == 0) Consumer.write(MEDIA_VOLUME_DOWN);
  else if (strcmp(cmd, "play_pause") == 0) Consumer.write(MEDIA_PLAY_PAUSE);
  else if (strcmp(cmd, "next") == 0) Consumer.write(MEDIA_NEXT);
#else
  (void)cmd;
#endif
}

