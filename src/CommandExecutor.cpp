#include "CommandExecutor.h"
#include "Utils.h"
#include "MacroStore.h"
#include "Hardware.h"
#include "InputHelpers.h"
#ifdef USE_HID_PROJECT
#include <HID-Project.h>
#else
#include <Keyboard.h>
#endif
#include <ctype.h>
#include <string.h>

void initCommandExecutor() {
  // nothing for now
}

// Simple command executor adapted from original sketch; keeps one-command-per-payload behavior
void execute_command(const char* payload, uint8_t seq) {
  if (!payload) return;
  // make a modifiable copy
  char buf[PAYLOAD_MAX + 1];
  strncpy(buf, payload, sizeof(buf)-1);
  buf[sizeof(buf)-1] = '\0';
  char* s = trim_inplace(buf);
  if (!s || !*s) { sendAck(seq, false, 1); return; }

  if (iequals(s, "help") || iequals(s, "?")) {
    sendHelp();
    sendAck(seq, true, 0);
    return;
  }

  if (strncmp(s, "type \"", 6) == 0) {
    char* p = s + 6;
    char outBuf[PAYLOAD_MAX+1]; size_t oi=0;
    while (*p && *p!='\"' && oi < PAYLOAD_MAX) { outBuf[oi++] = *p++; }
    outBuf[oi] = '\0';
    // type
    const char* t = outBuf;
    while (*t) {
      char c = *t;
      if (c == '\\') {
        t++;
        char esc = *t;
        if (!esc) break;
        if (esc == 'n') Keyboard.write('\n');
        else if (esc == 't') Keyboard.write('\t');
        else Keyboard.write(esc);
      } else {
        Keyboard.write(c);
      }
      t++;
    }
    sendAck(seq, true, 0);
    return;
  }

  if (strncmp(s, "delay ", 6) == 0) {
    int d = parse_int(s + 6);
    if (d > 0) { delay(d); sendAck(seq, true, 0); }
    else sendAck(seq, false, 1);
    return;
  }

  if (strcmp(s, "enter") == 0) { Keyboard.write(KEY_RETURN); sendAck(seq, true, 0); return; }
  if (strcmp(s, "tab") == 0) { Keyboard.write(KEY_TAB); sendAck(seq, true, 0); return; }
  if (strcmp(s, "backspace") == 0) { Keyboard.write(KEY_BACKSPACE); sendAck(seq, true, 0); return; }

  if (strncmp(s, "press ", 6) == 0) {
    char* p = s + 6; char mod[16]; size_t mi=0;
    while (*p && !isspace((unsigned char)*p) && mi < sizeof(mod)-1) mod[mi++] = *p++;
    mod[mi] = '\0';
    uint16_t ms = 50; if (*p) ms = parse_int(p);
    press_modifier_by_name(mod, ms);
    sendAck(seq, true, 0);
    return;
  }

  if (strncmp(s, "hold ", 5) == 0) { char* p = s + 5; char mod[16]; size_t mi=0; while (*p && !isspace((unsigned char)*p) && mi < sizeof(mod)-1) mod[mi++] = *p++; mod[mi]='\0'; hold_modifier(mod); sendAck(seq, true, 0); return; }
  if (strncmp(s, "release ", 8) == 0) { char* p = s + 8; char mod[16]; size_t mi=0; while (*p && !isspace((unsigned char)*p) && mi < sizeof(mod)-1) mod[mi++] = *p++; mod[mi]='\0'; release_modifier(mod); sendAck(seq, true, 0); return; }

  if (strncmp(s, "vibrate ", 8) == 0) { uint16_t ms = parse_int(s + 8); vibrate_pulse_hw(ms); sendAck(seq, true, 0); return; }

  if (strncmp(s, "media ", 6) == 0) { consumer_command(s + 6); sendAck(seq, true, 0); return; }

  if (strncmp(s, "macro define ", 13) == 0) {
    const char* p = s + 13;
    while (*p && isspace((unsigned char)*p)) p++;
    // expect mX { ... }
    if (p[0]=='m' && isdigit((unsigned char)p[1])) {
      uint8_t slot = p[1]-'0';
      // find '{'
      const char* brace = strchr(p, '{');
      const char* endb = brace ? strrchr(p, '}') : nullptr;
      if (brace && endb && endb > brace) {
        size_t len = (size_t)(endb - brace - 1);
        if (len >= MACRO_SLOT_SIZE) len = MACRO_SLOT_SIZE-1;
        char body[MACRO_SLOT_SIZE];
        memcpy(body, brace+1, len);
        body[len] = '\0';
        macro_save(slot, body);
        if (Serial) { Serial.print(F("Macro saved to slot ")); Serial.println(slot); }
        if (BLE_SERIAL) { BLE_SERIAL->print(F("Macro saved to slot ")); BLE_SERIAL->println(slot); }
        sendAck(seq, true, 0);
        return;
      }
    }

    if (Serial) { Serial.println(F("Invalid macro define syntax")); }
    if (BLE_SERIAL) { BLE_SERIAL->println(F("Invalid macro define syntax")); }
    sendAck(seq, false, 1);
    return;
  }

  if (strncmp(s, "macro run ", 10) == 0) {
    const char* p = s + 10;
    while (*p && isspace((unsigned char)*p)) p++;
    uint8_t slotIndex;
    if (macro_name_to_slot(p, &slotIndex)) {
      char macroBody[MACRO_SLOT_SIZE+1];
      macro_read(slotIndex, macroBody, sizeof(macroBody));
      if (Serial) { Serial.print(F("Running macro from slot ")); Serial.println(slotIndex); }
      if (BLE_SERIAL) { BLE_SERIAL->print(F("Running macro from slot ")); BLE_SERIAL->println(slotIndex); }
      // execute macro body as a single command payload
      execute_command(macroBody, seq);
      sendAck(seq, true, 0);
      return;
    } else {
      if (Serial) { Serial.println(F("Invalid macro slot")); }
      if (BLE_SERIAL) { BLE_SERIAL->println(F("Invalid macro slot")); }
      sendAck(seq, false, 1);
      return;
    }
  }

  // unknown
  if (Serial) { Serial.print(F("Unknown command: ")); Serial.println(s); }
  if (BLE_SERIAL) { BLE_SERIAL->print(F("Unknown command: ")); BLE_SERIAL->println(s); }
  sendAck(seq, false, 1);
}
