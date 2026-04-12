#pragma once

#include <Arduino.h>

void macro_store_init();
void macro_save(uint8_t slotIndex, const char* data);
void macro_read(uint8_t slotIndex, char* outBuf, size_t outLen);
bool macro_name_to_slot(const char* name, uint8_t* outSlot);

constexpr uint8_t MACRO_SLOTS = 6;
constexpr uint16_t MACRO_SLOT_SIZE = 256;

