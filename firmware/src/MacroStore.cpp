#include "MacroStore.h"
#include <EEPROM.h>
#include <stdint.h>

constexpr uint16_t EEPROM_MAGIC_ADDR = 0; // 2 bytes magic
constexpr uint16_t EEPROM_SLOTS_ADDR = 2; // 1 byte: slot count
constexpr uint16_t EEPROM_BASE = 16;

static uint16_t macro_slot_addr(uint8_t slotIndex) {
  return EEPROM_BASE + (uint16_t)slotIndex * MACRO_SLOT_SIZE;
}

void macro_store_init() {
  uint16_t magic = EEPROM.read(EEPROM_MAGIC_ADDR) | (EEPROM.read(EEPROM_MAGIC_ADDR+1) << 8);
  if (magic != 0xABCD) {
    EEPROM.write(EEPROM_MAGIC_ADDR, 0xCD);
    EEPROM.write(EEPROM_MAGIC_ADDR+1, 0xAB);
    for (uint8_t i = 0; i < MACRO_SLOTS; i++) {
      macro_save(i, "");
    }
  }
}

void macro_save(uint8_t slotIndex, const char* data) {
  if (slotIndex >= MACRO_SLOTS) return;
  uint16_t addr = macro_slot_addr(slotIndex);
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

bool macro_name_to_slot(const char* name, uint8_t* outSlot) {
  if (!name || !outSlot) return false;
  if (name[0] == 'm' && isdigit((unsigned char)name[1])) {
    int idx = name[1] - '0';
    if (idx >= 0 && idx < MACRO_SLOTS) { *outSlot = (uint8_t)idx; return true; }
  }
  return false;
}

