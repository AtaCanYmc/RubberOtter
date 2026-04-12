#include "PacketParser.h"
#include "Protocol.h"
#include "Hardware.h"
#include "Utils.h"
#include "CommandExecutor.h"
#include <cstring>

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

void packetParser_poll() {
  // fill ring buffer from BLE serial
  if (BLE_SERIAL) {
    while (BLE_SERIAL->available() && ringFree() > 0) {
      int v = BLE_SERIAL->read();
      if (v < 0) break;
      ringWrite((uint8_t)v);
    }
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
        }
        break;

      case READ_HDR:
        headerBuf[hdrIdx++] = b;
        if (hdrIdx == 4) {
          // header: VERSION, SEQ, LEN_HI, LEN_LO
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
        }
        break;
    }
  }
}
