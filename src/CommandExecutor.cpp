#include "CommandExecutor.h"
#include "Utils.h"
#include "MacroStore.h"
#include "Hardware.h"
#include "InputHelpers.h"
#ifdef USE_HID_PROJECT
#include <HID-Project.h>
#else
#include <Keyboard.h>
#include <Mouse.h>
#endif
#include <ctype.h>
#include <string.h>

void initCommandExecutor() {
  Mouse.begin();
}

// Command executor processing commands sequentially
void execute_command(const char* payload, uint8_t seq) {
  if (!payload) return;
  
  // Make a modifiable copy
  char buf[PAYLOAD_MAX + 1];
  strncpy(buf, payload, sizeof(buf) - 1);
  buf[sizeof(buf) - 1] = '\0';
  char* s = trim_inplace(buf);
  if (!s || !*s) { sendAck(seq, false, 1); return; }

  if (iequals(s, "help") || iequals(s, "?")) {
    sendHelp();
    sendAck(seq, true, 0);
    return;
  }

  // BLE Name Configuration
  if (strncmp(s, "ble name ", 9) == 0) {
    char* p = s + 9;
    while (*p && isspace((unsigned char)*p)) p++;
    if (*p == '"') {
      p++;
      char nameBuf[64]; size_t ni = 0;
      while (*p && *p != '"' && ni < sizeof(nameBuf) - 1) {
        nameBuf[ni++] = *p++;
      }
      nameBuf[ni] = '\0';
      if (ni > 0) {
        configureBleName(nameBuf);
        sendAck(seq, true, 0);
        return;
      }
    }
    sendAck(seq, false, 1);
    return;
  }

  // Type Command: type "..."
  if (strncmp(s, "type \"", 6) == 0) {
    char* p = s + 6;
    char outBuf[PAYLOAD_MAX + 1]; size_t oi = 0;
    while (*p && *p != '\"' && oi < PAYLOAD_MAX) { outBuf[oi++] = *p++; }
    outBuf[oi] = '\0';
    keyboard_type_text(outBuf);
    sendAck(seq, true, 0);
    return;
  }

  // Delay Command: delay N
  if (strncmp(s, "delay ", 6) == 0) {
    int d = parse_int(s + 6);
    if (d > 0) { delay(d); sendAck(seq, true, 0); }
    else sendAck(seq, false, 1);
    return;
  }

  // Key Triggers
  if (strcmp(s, "enter") == 0) { Keyboard.write(KEY_RETURN); sendAck(seq, true, 0); return; }
  if (strcmp(s, "tab") == 0) { Keyboard.write(KEY_TAB); sendAck(seq, true, 0); return; }
  if (strcmp(s, "backspace") == 0) { Keyboard.write(KEY_BACKSPACE); sendAck(seq, true, 0); return; }

  // Modifiers: press, hold, release
  if (strncmp(s, "press ", 6) == 0) {
    char* p = s + 6; char mod[16]; size_t mi = 0;
    while (*p && !isspace((unsigned char)*p) && mi < sizeof(mod) - 1) mod[mi++] = *p++;
    mod[mi] = '\0';
    uint16_t ms = 50; if (*p) ms = parse_int(p);
    press_modifier_by_name(mod, ms);
    sendAck(seq, true, 0);
    return;
  }

  if (strncmp(s, "hold ", 5) == 0) {
    char* p = s + 5; char mod[16]; size_t mi = 0;
    while (*p && !isspace((unsigned char)*p) && mi < sizeof(mod) - 1) mod[mi++] = *p++;
    mod[mi] = '\0';
    hold_modifier(mod);
    sendAck(seq, true, 0);
    return;
  }

  if (strncmp(s, "release ", 8) == 0) {
    char* p = s + 8; char mod[16]; size_t mi = 0;
    while (*p && !isspace((unsigned char)*p) && mi < sizeof(mod) - 1) mod[mi++] = *p++;
    mod[mi] = '\0';
    release_modifier(mod);
    sendAck(seq, true, 0);
    return;
  }

  // Vibration Motor
  if (strncmp(s, "vibrate ", 8) == 0) {
    uint16_t ms = parse_int(s + 8);
    vibrate_pulse_hw(ms);
    sendAck(seq, true, 0);
    return;
  }

  // Media Commands
  if (strncmp(s, "media ", 6) == 0) {
    consumer_command(s + 6);
    sendAck(seq, true, 0);
    return;
  }

  // Mouse Move: mouse move <dx> <dy>
  if (strncmp(s, "mouse move ", 11) == 0) {
    char* p = s + 11;
    int dx = parse_int(p);
    while (*p && !isspace((unsigned char)*p)) p++;
    while (*p && isspace((unsigned char)*p)) p++;
    int dy = parse_int(p);
    mouse_move((int8_t)dx, (int8_t)dy);
    sendAck(seq, true, 0);
    return;
  }

  // Mouse Click: mouse click left|right|middle
  if (strncmp(s, "mouse click ", 12) == 0) {
    mouse_click(s + 12);
    sendAck(seq, true, 0);
    return;
  }

  // Mouse Scroll: mouse scroll <amount>
  if (strncmp(s, "mouse scroll ", 13) == 0) {
    int amount = parse_int(s + 13);
    mouse_scroll((int8_t)amount);
    sendAck(seq, true, 0);
    return;
  }

  // Jiggler Commands: jiggler on|off|toggle
  if (strncmp(s, "jiggler ", 8) == 0) {
    const char* sub = s + 8;
    if (strcmp(sub, "on") == 0) jiggler_set(true);
    else if (strcmp(sub, "off") == 0) jiggler_set(false);
    else if (strcmp(sub, "toggle") == 0) jiggler_set(!jiggler_get());
    sendAck(seq, true, 0);
    return;
  }

  // Macro Definition: macro define mX { ... }
  if (strncmp(s, "macro define ", 13) == 0) {
    const char* p = s + 13;
    while (*p && isspace((unsigned char)*p)) p++;
    if (p[0] == 'm' && isdigit((unsigned char)p[1])) {
      uint8_t slot = p[1] - '0';
      const char* brace = strchr(p, '{');
      const char* endb = brace ? strrchr(p, '}') : nullptr;
      if (brace && endb && endb > brace) {
        size_t len = (size_t)(endb - brace - 1);
        if (len >= MACRO_SLOT_SIZE) len = MACRO_SLOT_SIZE - 1;
        char body[MACRO_SLOT_SIZE];
        memcpy(body, brace + 1, len);
        body[len] = '\0';
        macro_save(slot, body);
        sendAck(seq, true, 0);
        return;
      }
    }
    sendAck(seq, false, 1);
    return;
  }

  // Macro Run: macro run mX
  if (strncmp(s, "macro run ", 10) == 0) {
    const char* p = s + 10;
    while (*p && isspace((unsigned char)*p)) p++;
    uint8_t slotIndex;
    if (macro_name_to_slot(p, &slotIndex)) {
      char macroBody[MACRO_SLOT_SIZE + 1];
      macro_read(slotIndex, macroBody, sizeof(macroBody));
      execute_command(macroBody, seq);
      sendAck(seq, true, 0);
      return;
    } else {
      sendAck(seq, false, 1);
      return;
    }
  }

  // Unknown Command
  sendAck(seq, false, 1);
}
