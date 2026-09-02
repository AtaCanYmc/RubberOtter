#pragma once

#include <stdint.h>

constexpr uint8_t STX = 0x02;
constexpr uint8_t ETX = 0x03;
constexpr uint8_t VERSION = 0x01;

constexpr uint16_t RING_BUF_SIZE = 512;
constexpr uint16_t PAYLOAD_MAX = 384;

