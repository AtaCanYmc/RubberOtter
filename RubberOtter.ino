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
#include <Keyboard.h>
#include <EEPROM.h>
#ifdef USE_SOFTSERIAL
#include <SoftwareSerial.h>
#endif
#ifdef USE_HID_PROJECT
#include <HID-Project.h>
#endif

// ----------------------- Configuration -----------------------
// HM-10 serial settings
#ifndef USE_SOFTSERIAL
// Use hardware Serial1 by default (Pro Micro / ATmega32U4)
#define BLE_SERIAL Serial1
#else
#define BLE_SERIAL softSerial
#endif

#ifdef USE_SOFTSERIAL
// Adjust pins if you're using SoftwareSerial
const uint8_t RX_PIN_SOFT = 8; // HM-10 TX -> Arduino RX (soft)
const uint8_t TX_PIN_SOFT = 9; // HM-10 RX <- Arduino TX (soft)
static SoftwareSerial softSerial(RX_PIN_SOFT, TX_PIN_SOFT);
#endif

// Vibration motor control pin (use MOSFET/transistor)
const uint8_t VIB_PIN = 2;

// Ring buffer and payload sizing
const uint16_t RING_BUF_SIZE = 512;
static uint8_t ringBuf[RING_BUF_SIZE];
static uint16_t ringHead = 0, ringTail = 0;

// Packet framing
const uint8_t STX = 0x02;
const uint8_t ETX = 0x03;
const uint8_t VERSION = 0x01;

enum ParserState { WAIT_STX, READ_HDR, READ_PAYLOAD, READ_CHECK, WAIT_ETX };
static ParserState state = WAIT_STX;

// Header: version, seq, lenHi, lenLo
static uint8_t headerBuf[4];
static uint16_t hdrIdx = 0;
static uint16_t payloadLen = 0;
static uint16_t payloadReceived = 0;
static uint8_t seqNum = 0;
static uint8_t checksum = 0;

// Payload storage (bounded)
const uint16_t PAYLOAD_MAX = 384;
static char payloadBuf[PAYLOAD_MAX + 1]; // null-terminated

// EEPROM macros
const uint16_t EEPROM_MAGIC_ADDR = 0; // 2 bytes magic
const uint16_t EEPROM_SLOTS_ADDR = 2; // 1 byte: slot count
const uint8_t MACRO_SLOTS = 6;
const uint16_t MACRO_SLOT_SIZE = 256; // bytes per slot
const uint16_t EEPROM_BASE = 16;

// ACK codes
// sendAck(seq, ok, code)
// code 0 = ok, 1 = unknown, 2 = payload too big, 3 = checksum error, 4 = framing error

// ----------------------- Utilities -----------------------
inline bool ringAvailable() { return ringHead != ringTail; }
inline uint16_t ringFree() {
  if (ringHead >= ringTail) return RING_BUF_SIZE - (ringHead - ringTail) - 1;
  return ringTail - ringHead - 1;
}
inline void ringWrite(uint8_t b) {
  ringBuf[ringHead] = b;
  ringHead = (ringHead + 1) % RING_BUF_SIZE;
}
inline uint8_t ringRead() {
  uint8_t v = ringBuf[ringTail];
  ringTail = (ringTail + 1) % RING_BUF_SIZE;
  return v;
}

static uint8_t globalSeq = 0;

void sendAck(uint8_t seq, bool ok, uint8_t code) {
  uint8_t ack[6];
  ack[0] = STX;
  ack[1] = VERSION;
  ack[2] = seq;
  ack[3] = ok ? 1 : 0;
  ack[4] = code;
  ack[5] = ETX;
  BLE_SERIAL.write(ack, sizeof(ack));
}

// trim leading/trailing whitespace in-place, returns pointer to trimmed string
char* trim_inplace(char* s) {
  if (!s) return s;
  // left trim
  while (*s && isspace((unsigned char)*s)) s++;
  // if empty
  if (!*s) return s;
  // right trim
  char* end = s + strlen(s) - 1;
  while (end > s && isspace((unsigned char)*end)) { *end = '\0'; end--; }
  return s;
}

// parse integer from cstring with basic error handling
int parse_int(const char* s) {
  if (!s) return 0;
  return atoi(s);
}

// vibrate motor
void vibrate_pulse(uint16_t ms) {
  if (ms == 0) return;
  digitalWrite(VIB_PIN, HIGH);
  delay(ms);
  digitalWrite(VIB_PIN, LOW);
}

// ----------------------- EEPROM macro helpers -----------------------
uint16_t macro_slot_addr(uint8_t slotIndex) {
  return EEPROM_BASE + (uint16_t)slotIndex * MACRO_SLOT_SIZE;
}

void macro_save(uint8_t slotIndex, const char* data) {
  if (slotIndex >= MACRO_SLOTS) return;
  uint16_t addr = macro_slot_addr(slotIndex);
  // write up to MACRO_SLOT_SIZE bytes
  for (uint16_t i = 0; i < MACRO_SLOT_SIZE; ++i) {
    uint8_t b = data[i] ? (uint8_t)data[i] : 0;
    EEPROM.update(addr + i, b);
    if (b == 0) break;
  }
}

void macro_read(uint8_t slotIndex, char* outBuf, size_t outLen) {
  if (slotIndex >= MACRO_SLOTS || outLen == 0) return;
  uint16_t addr = macro_slot_addr(slotIndex);
  size_t i = 0;
  for (; i < outLen - 1 && i < MACRO_SLOT_SIZE; ++i) {
    uint8_t b = EEPROM.read(addr + i);
    outBuf[i] = (char)b;
    if (b == 0) break;
  }
  outBuf[i] = '\0';
}

// simple macro name->slot mapping (in EEPROM or fixed): for simplicity map names "m0","m1" -> slot
bool macro_name_to_slot(const char* name, uint8_t* outSlot) {
  if (!name || !outSlot) return false;
  if (name[0] == 'm' && isdigit((unsigned char)name[1])) {
    int idx = name[1] - '0';
    if (idx >= 0 && idx < MACRO_SLOTS) { *outSlot = (uint8_t)idx; return true; }
  }
  return false;
}

// ----------------------- Command execution -----------------------

// helper: send a sequence of characters as keyboard typing
void keyboard_type_text(const char* s) {
  if (!s) return;
  while (*s) {
    char c = *s;
    if (c == '\\') {
      // simple escape handling \n \t \\\" etc.
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

// press modifier for ms milliseconds
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

#ifdef USE_HID_PROJECT
void consumer_command(const char* cmd) {
  if (!cmd) return;
  if (strcmp(cmd, "volume_up") == 0) Consumer.write(MEDIA_VOLUME_UP);
  else if (strcmp(cmd, "volume_down") == 0) Consumer.write(MEDIA_VOLUME_DOWN);
  else if (strcmp(cmd, "play_pause") == 0) Consumer.write(MEDIA_PLAY_PAUSE);
  else if (strcmp(cmd, "next") == 0) Consumer.write(MEDIA_NEXT);
}
#else
void consumer_command(const char* cmd) {
  // HID-Project not enabled: ignore or implement basic fallback
  (void)cmd;
}
#endif

// send help text to both debug USB Serial and BLE serial
void sendHelp() {
  Serial.println(F("Rubber Otter - Available commands:"));
  BLE_SERIAL.println(F("Rubber Otter - Available commands:"));

  Serial.println(F("  help, ?                 - show this help"));
  BLE_SERIAL.println(F("  help, ?                 - show this help"));

  Serial.println(F("  type \"...\"            - type text (escapes: \\n, \\t, \\\")"));
  BLE_SERIAL.println(F("  type \"...\"            - type text (escapes: \\n, \\t, \\\")"));

  Serial.println(F("  delay N                 - delay N ms"));
  BLE_SERIAL.println(F("  delay N                 - delay N ms"));

  Serial.println(F("  enter, tab, backspace   - simple keys"));
  BLE_SERIAL.println(F("  enter, tab, backspace   - simple keys"));

  Serial.println(F("  press <mod> <ms>        - press modifier for ms (shift, ctrl, alt, gui)"));
  BLE_SERIAL.println(F("  press <mod> <ms>        - press modifier for ms (shift, ctrl, alt, gui)"));

  Serial.println(F("  hold <mod> / release <mod> - hold or release modifier"));
  BLE_SERIAL.println(F("  hold <mod> / release <mod> - hold or release modifier"));

  Serial.println(F("  vibrate N               - vibrate motor for N ms"));
  BLE_SERIAL.println(F("  vibrate N               - vibrate motor for N ms"));

  Serial.println(F("  media <cmd>             - media play/pause/volume_up/volume_down (requires HID-Project)"));
  BLE_SERIAL.println(F("  media <cmd>             - media play/pause/volume_up/volume_down (requires HID-Project)"));

  Serial.println(F("  macro define mX { ... } - save macro to slot m0..m5"));
  BLE_SERIAL.println(F("  macro define mX { ... } - save macro to slot m0..m5"));

  Serial.println(F("  macro run mX            - run macro slot m0..m5"));
  BLE_SERIAL.println(F("  macro run mX            - run macro slot m0..m5"));

  Serial.println(F("  Commands may be chained with && or ;"));
  BLE_SERIAL.println(F("  Commands may be chained with && or ;"));

  Serial.println(F("  Framing: STX VERSION SEQ LEN(2) PAYLOAD CHK ETX"));
  BLE_SERIAL.println(F("  Framing: STX VERSION SEQ LEN(2) PAYLOAD CHK ETX"));

  Serial.println(F("  ACK: STX VERSION SEQ STATUS CODE ETX"));
  BLE_SERIAL.println(F("  ACK: STX VERSION SEQ STATUS CODE ETX"));

  delay(2); // small spacing to avoid flooding BLE
}

// send detailed help for a specific command
void sendHelpFor(const char* cmd) {
  if (!cmd || !*cmd) { sendHelp(); return; }
  // copy and lowercase a small token buffer
  char token[32];
  size_t i = 0;
  const char* p = cmd;
  // skip leading spaces
  while (*p && isspace((unsigned char)*p)) p++;
  while (*p && !isspace((unsigned char)*p) && i < sizeof(token)-1) {
    char c = *p++;
    token[i++] = (char)tolower((unsigned char)c);
  }
  token[i] = '\0';

  // helper macros to print to both outputs
  #define P(x) do { Serial.println(F(x)); BLE_SERIAL.println(F(x)); } while(0)
  #define P_FMT(s) do { Serial.println(s); BLE_SERIAL.println(s); } while(0)

  if (strcmp(token, "type") == 0) {
    P("type \"...\"  — Send literal text. Supports escapes: \\n -> newline, \\t -> tab, \\\\" -> quote. Example: type \"Hello\\nWorld\"");
    P("Max length per payload is limited; for long text, consider chunking or macros.");
  } else if (strcmp(token, "delay") == 0) {
    P("delay N  — Pause execution for N milliseconds. Example: delay 250");
  } else if (strcmp(token, "enter") == 0) {
    P("enter  — Sends the Enter/Return key.");
  } else if (strcmp(token, "tab") == 0) {
    P("tab  — Sends the Tab key.");
  } else if (strcmp(token, "backspace") == 0) {
    P("backspace  — Sends Backspace.");
  } else if (strcmp(token, "press") == 0) {
    P("press <mod> <ms>  — Temporarily holds a modifier (shift, ctrl, alt, gui) for <ms> milliseconds. Example: press shift 50");
  } else if (strcmp(token, "hold") == 0) {
    P("hold <mod>  — Holds a modifier key until release <mod> is called. Example: hold ctrl");
  } else if (strcmp(token, "release") == 0) {
    P("release <mod>  — Releases a previously held modifier. Example: release ctrl");
  } else if (strcmp(token, "vibrate") == 0) {
    P("vibrate N  — Triggers vibration motor for N milliseconds (uses VIB_PIN via MOSFET). Example: vibrate 100");
  } else if (strcmp(token, "media") == 0) {
    P("media <cmd>  — Multimedia commands (requires HID-Project). Supported: play_pause, volume_up, volume_down, next");
  } else if (strcmp(token, "macro") == 0) {
    P("macro define mX { ... }  — Save macro to slot m0..m5. Example: macro define m0 { type \"Hi\" && enter }");
    P("macro run mX  — Run macro slot m0..m5. Example: macro run m0");
  } else if (strcmp(token, "framing") == 0 || strcmp(token, "packet") == 0) {
    P("Framing: STX(0x02) VERSION(0x01) SEQ(1) LEN(2 BE) PAYLOAD CHECKSUM(1 XOR) ETX(0x03)");
    P("ACK: STX VERSION SEQ STATUS(1=OK) CODE ETX. Host must retry on timeout.");
  } else {
    // unknown token: print generic help line
    Serial.print(F("No detailed help for: "));
    Serial.println(token);
    BLE_SERIAL.print(F("No detailed help for: "));
    BLE_SERIAL.println(token);
    delay(2);
    sendHelp();
  }

  #undef P
  #undef P_FMT
}

// execute a single trimmed command (no chaining). Input is modified in-place safe.
void execute_single_command(char* cmd) {
  if (!cmd) return;
  char* s = trim_inplace(cmd);
  if (!*s) return;

  // Show help
  if (strcmp(s, "help") == 0 || strcmp(s, "?") == 0) {
    sendHelp();
    return;
  }
  // help <command>
  if (strncmp(s, "help ", 5) == 0) {
    char* q = s + 5;
    char tmp[32];
    strncpy(tmp, q, sizeof(tmp)-1);
    tmp[sizeof(tmp)-1] = '\0';
    char* t = trim_inplace(tmp);
    if (t && *t) sendHelpFor(t);
    else sendHelp();
    return;
  }

  // Commands: type "..."  | delay N | enter | tab | backspace | press <name> <ms> | hold <name> | release <name> | vibrate N | macro define <name> { ... } | macro run <name> | media <cmd>

  // type "..."
  if (strncmp(s, "type \"", 6) == 0) {
    // find closing quote
    char* p = s + 6;
    char outBuf[PAYLOAD_MAX + 1];
    size_t oi = 0;
    while (*p && *p != '"' && oi < sizeof(outBuf)-1) {
      if (*p == '\\' && *(p+1)) {
        p++;
        char esc = *p;
        if (esc == 'n') outBuf[oi++] = '\n';
        else if (esc == 't') outBuf[oi++] = '\t';
        else outBuf[oi++] = esc;
      } else {
        outBuf[oi++] = *p;
      }
      p++;
    }
    outBuf[oi] = '\0';
    keyboard_type_text(outBuf);
    return;
  }

  // delay N
  if (strncmp(s, "delay ", 6) == 0) {
    int ms = parse_int(s + 6);
    if (ms > 0) delay(ms);
    return;
  }

  if (strcmp(s, "enter") == 0) { Keyboard.write(KEY_RETURN); return; }
  if (strcmp(s, "tab") == 0) { Keyboard.write(KEY_TAB); return; }
  if (strcmp(s, "backspace") == 0) { Keyboard.write(KEY_BACKSPACE); return; }

  // press <modifier> <ms>
  if (strncmp(s, "press ", 6) == 0) {
    // parse modifier and ms
    char* p = s + 6;
    char token[32];
    size_t ti = 0;
    while (*p && !isspace((unsigned char)*p) && ti < sizeof(token)-1) token[ti++] = *p++;
    token[ti] = '\0';
    while (*p && isspace((unsigned char)*p)) p++;
    int ms = parse_int(p);
    if (ms <= 0) ms = 50;
    press_modifier_by_name(token, (uint16_t)ms);
    return;
  }

  // hold <modifier> | release <modifier>
  if (strncmp(s, "hold ", 5) == 0) { hold_modifier(s+5); return; }
  if (strncmp(s, "release ", 8) == 0) { release_modifier(s+8); return; }

  // vibrate N
  if (strncmp(s, "vibrate ", 8) == 0) { int ms = parse_int(s+8); if (ms>0) vibrate_pulse((uint16_t)ms); return; }

  // macro define name { ... }
  if (strncmp(s, "macro define ", 13) == 0) {
    char* p = s + 13;
    // parse name
    char name[16]; size_t ni=0;
    while (*p && !isspace((unsigned char)*p) && *p!='{' && ni < sizeof(name)-1) name[ni++] = *p++;
    name[ni] = '\0';
    // find '{' and '}'
    char* start = strchr(s, '{');
    char* end = s ? strrchr(s, '}') : NULL;
    if (start && end && end > start) {
      start++;
      // copy macro body trimmed
      char body[MACRO_SLOT_SIZE];
      size_t bi = 0;
      while (start < end && bi < sizeof(body)-1) { body[bi++] = *start++; }
      body[bi] = '\0';
      // map name to slot if possible
      uint8_t slot;
      if (macro_name_to_slot(name, &slot)) {
        macro_save(slot, body);
      }
    }
    return;
  }

  // macro run name
  if (strncmp(s, "macro run ", 10) == 0) {
    char* name = trim_inplace(s + 10);
    uint8_t slot;
    if (macro_name_to_slot(name, &slot)) {
      char buf[MACRO_SLOT_SIZE];
      macro_read(slot, buf, sizeof(buf));
      if (buf[0]) {
        // execute body which might contain chaining
        // naive: call execute_command_chain on buf
        // we'll reuse the top-level chain splitter by copying into payload and stepping
        char tmp[PAYLOAD_MAX+1];
        strncpy(tmp, buf, sizeof(tmp)-1);
        tmp[sizeof(tmp)-1] = '\0';
        // execute chain
        char* token = tmp;
        while (token && *token) {
          // find && or ;
          char* next = strstr(token, "&&");
          char* semi = strchr(token, ';');
          if (!next || (semi && semi < next)) next = semi;
          char save = 0;
          if (next) { save = *next; *next = '\0'; }
          execute_single_command(token);
          if (next) { *next = save; token = next + (save=='&'?2:1); }
          else break;
        }
      }
    }
    return;
  }

  // media <cmd>
  if (strncmp(s, "media ", 6) == 0) {
    char* cmd = s + 6;
    consumer_command(cmd);
    return;
  }

  // fallback: unknown command
}

// Split chained commands in a payload and execute sequentially
void execute_command_chain(char* buf) {
  char* p = buf;
  while (*p) {
    // find next && or ;
    char* next = strstr(p, "&&");
    char* semi = strchr(p, ';');
    if (!next || (semi && semi < next)) next = semi;
    char save = 0;
    if (next) { save = *next; *next = '\0'; }
    // execute trimmed single command
    char temp[PAYLOAD_MAX+1];
    strncpy(temp, p, PAYLOAD_MAX);
    temp[PAYLOAD_MAX] = '\0';
    execute_single_command(temp);
    if (next) {
      *next = save;
      if (save == '&') p = next + 2; else p = next + 1;
    } else break;
    // skip whitespace
    while (*p && isspace((unsigned char)*p)) p++;
  }
}

// ----------------------- Setup & Loop -----------------------

void setup() {
  // Serial for debug over USB
  Serial.begin(115200);
#ifndef USE_SOFTSERIAL
  // hardware serial for HM-10
  Serial1.begin(9600);
#else
  softSerial.begin(9600);
#endif

#ifdef USE_HID_PROJECT
  Consumer.begin();
#endif
  Keyboard.begin();
  pinMode(VIB_PIN, OUTPUT);
  digitalWrite(VIB_PIN, LOW);

  // Indicate ready
  Serial.println("Rubber Otter ready");
  BLE_SERIAL.write((const uint8_t*)"RO_READY\n", 8);

  // initialize EEPROM magic if empty
  uint16_t magic = EEPROM.read(EEPROM_MAGIC_ADDR) | (EEPROM.read(EEPROM_MAGIC_ADDR+1) << 8);
  if (magic != 0xA55A) {
    EEPROM.update(EEPROM_MAGIC_ADDR, 0x5A);
    EEPROM.update(EEPROM_MAGIC_ADDR+1, 0xA5);
  }
}

void loop() {
  // read bytes from BLE serial into ring buffer
  while (BLE_SERIAL.available()) {
    uint8_t b = BLE_SERIAL.read();
    size_t free = ringFree();
    if (free == 0) {
      // overflow: drop oldest by advancing tail
      ringTail = (ringTail + 1) % RING_BUF_SIZE;
    }
    ringWrite(b);
  }

#ifdef USE_USB_DEBUG
  // Optional: also accept framed test packets over USB Serial when enabled
  while (Serial.available()) {
    uint8_t b = Serial.read();
    size_t free = ringFree();
    if (free == 0) {
      ringTail = (ringTail + 1) % RING_BUF_SIZE;
    }
    ringWrite(b);
  }
#endif

  // parse state machine
  while (ringAvailable()) {
    uint8_t b = ringRead();
    switch (state) {
      case WAIT_STX:
        if (b == STX) {
          state = READ_HDR;
          hdrIdx = 0;
          checksum = 0;
        }
        break;
      case READ_HDR:
        headerBuf[hdrIdx++] = b;
        if (hdrIdx == 4) {
          if (headerBuf[0] != VERSION) {
            state = WAIT_STX; break;
          }
          seqNum = headerBuf[1];
          payloadLen = ((uint16_t)headerBuf[2] << 8) | headerBuf[3];
          if (payloadLen > PAYLOAD_MAX) {
            sendAck(seqNum, false, 2);
            state = WAIT_STX; break;
          }
          payloadReceived = 0;
          checksum = 0;
          state = READ_PAYLOAD;
        }
        break;
      case READ_PAYLOAD:
        payloadBuf[payloadReceived++] = (char)b;
        checksum ^= b;
        if (payloadReceived >= payloadLen) {
          payloadBuf[payloadReceived] = '\0';
          state = READ_CHECK;
        }
        break;
      case READ_CHECK:
        if (b == checksum) {
          state = WAIT_ETX;
        } else {
          sendAck(seqNum, false, 3);
          state = WAIT_STX;
        }
        break;
      case WAIT_ETX:
        if (b == ETX) {
          // complete packet: execute
          // make a local copy to work on
          char local[PAYLOAD_MAX+1];
          strncpy(local, payloadBuf, PAYLOAD_MAX);
          local[PAYLOAD_MAX] = '\0';
          execute_command_chain(local);
          sendAck(seqNum, true, 0);
        } else {
          sendAck(seqNum, false, 4);
        }
        state = WAIT_STX;
        break;
    }
  }

  // small idle
  delay(1);
}
