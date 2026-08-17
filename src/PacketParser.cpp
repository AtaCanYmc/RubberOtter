#include "PacketParser.h"
#include "Protocol.h"
#include "Hardware.h"
#include "Utils.h"
#include "CommandExecutor.h"
#include <string.h>
#ifdef USE_HID_PROJECT
#include <HID-Project.h>
#else
#include <Keyboard.h>
#include <Mouse.h>
#endif

static uint8_t ringBuf[RING_BUF_SIZE];
static uint16_t ringHead = 0, ringTail = 0;

inline bool ringAvailable() { return ringHead != ringTail; }
inline uint16_t ringFree() { if (ringHead >= ringTail) return RING_BUF_SIZE - (ringHead - ringTail) - 1; return ringTail - ringHead - 1; }
inline void ringWrite(uint8_t b) { ringBuf[ringHead] = b; ringHead = (ringHead + 1) % RING_BUF_SIZE; }
inline uint8_t ringRead() { uint8_t v = ringBuf[ringTail]; ringTail = (ringTail + 1) % RING_BUF_SIZE; return v; }

enum ParserState { WAIT_STX, READ_HDR, READ_PAYLOAD, READ_CHECK, WAIT_ETX };
static ParserState state = WAIT_STX;
static uint8_t headerBuf[4];
static uint8_t hdrIdx = 0;
static uint16_t payloadLen = 0;
static uint16_t payloadIdx = 0;
static uint8_t seqNum = 0;
static uint8_t payloadBuf[PAYLOAD_MAX + 1];

void initPacketParser() {
  state = WAIT_STX;
  ringHead = ringTail = 0;
  hdrIdx = 0;
  payloadLen = 0;
  payloadIdx = 0;
}

// Fallback single-byte protocol handler (for direct byte commands 0x11 - 0x85)
static void handleSingleByteCommand(uint8_t cmd) {
  switch (cmd) {
    case 0x11: Keyboard.write(0xE8); break; // Play/Pause
    case 0x12: Keyboard.write(0xEB); break; // Next
    case 0x13: Keyboard.write(0xEC); break; // Prev
    case 0x14: Keyboard.write(0xE9); break; // Vol Up
    case 0x15: Keyboard.write(0xEA); break; // Vol Down
    case 0x16: Keyboard.write(0xED); break; // Mute
    case 0x21: Keyboard.write(KEY_RIGHT_ARROW); break;
    case 0x22: Keyboard.write(KEY_LEFT_ARROW); break;
    case 0x23: Keyboard.write(KEY_F5); break;
    case 0x24: Keyboard.write('b'); break;
    case 0x31:
      Keyboard.press(KEY_LEFT_GUI); Keyboard.press('l'); delay(50); Keyboard.releaseAll();
      break;
    case 0x32:
      // Jiggler toggle
      execute_command("jiggler toggle", 0);
      break;
    case 0x33:
      Keyboard.press(KEY_LEFT_CTRL); Keyboard.press(KEY_LEFT_SHIFT); Keyboard.press(KEY_ESC); delay(50); Keyboard.releaseAll();
      break;
    case 0x34:
      Keyboard.press(KEY_LEFT_GUI); Keyboard.press('d'); delay(50); Keyboard.releaseAll();
      break;
    case 0x41:
      execute_command("type \"b\" && delay 120 && type \"4\" && delay 120 && type \"2\"", 0);
      break;
    case 0x81: Mouse.click(MOUSE_LEFT); break;
    case 0x82: Mouse.click(MOUSE_RIGHT); break;
    case 0x83: Mouse.click(MOUSE_MIDDLE); break;
    case 0x84: Mouse.move(0, 0, 1); break;
    case 0x85: Mouse.move(0, 0, -1); break;
  }
}

void packetParser_poll() {
  // Fill ring buffer from BLE serial
  if (BLE_SERIAL) {
    while (BLE_SERIAL->available() && ringFree() > 0) {
      int v = BLE_SERIAL->read();
      if (v < 0) break;
      ringWrite((uint8_t)v);
    }
  }

  // Fill ring buffer from USB Serial
  while (Serial && Serial.available() && ringFree() > 0) {
    int v = Serial.read();
    if (v < 0) break;
    ringWrite((uint8_t)v);
  }

  while (ringAvailable()) {
    uint8_t b = ringRead();
    switch (state) {
      case WAIT_STX:
        if (b == STX) {
          hdrIdx = 0;
          payloadLen = 0;
          payloadIdx = 0;
          state = READ_HDR;
        } else if (b >= 0x10 && b <= 0x8F) {
          // Process fallback single-byte command
          handleSingleByteCommand(b);
        }
        break;

      case READ_HDR:
        headerBuf[hdrIdx++] = b;
        if (hdrIdx == 4) {
          // Header: VERSION, SEQ, LEN_HI, LEN_LO
          if (headerBuf[0] != VERSION) {
            seqNum = headerBuf[1];
            sendAck(seqNum, false, 1);
            state = WAIT_STX;
          } else {
            seqNum = headerBuf[1];
            payloadLen = ((uint16_t)headerBuf[2] << 8) | (uint16_t)headerBuf[3];
            if (payloadLen > PAYLOAD_MAX) {
              sendAck(seqNum, false, 2);
              state = WAIT_STX;
            } else {
              payloadIdx = 0;
              state = (payloadLen == 0) ? READ_CHECK : READ_PAYLOAD;
            }
          }
        }
        break;

      case READ_PAYLOAD:
        if (payloadIdx < PAYLOAD_MAX) payloadBuf[payloadIdx++] = b;
        if (payloadIdx == payloadLen) {
          state = READ_CHECK;
        }
        break;

      case READ_CHECK: {
        uint8_t computed = 0;
        for (uint16_t i = 0; i < payloadLen; ++i) computed ^= payloadBuf[i];
        if (computed != b) {
          sendAck(seqNum, false, 3);
          state = WAIT_STX;
        } else {
          payloadBuf[payloadLen] = '\0';
          execute_command((const char*)payloadBuf, seqNum);
          state = WAIT_ETX;
        }
        break;
      }

      case WAIT_ETX:
        if (b == ETX) {
          state = WAIT_STX;
        } else if (b == STX) {
          // Next frame starts immediately
          hdrIdx = 0;
          payloadLen = 0;
          payloadIdx = 0;
          state = READ_HDR;
        } else {
          // Reset to WAIT_STX on corrupt ETX to prevent parser lockup
          state = WAIT_STX;
        }
        break;
    }
  }
}
