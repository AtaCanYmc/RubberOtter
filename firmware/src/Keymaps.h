#pragma once
#include <stdint.h>

enum KeymapLayout : uint8_t {
  KEYMAP_LAYOUT_US = 0,
  KEYMAP_LAYOUT_TR_Q = 1,
  KEYMAP_LAYOUT_DE = 2,
  KEYMAP_LAYOUT_UK = 3,
};

#if defined(KEYMAP_TR_Q)
#define ACTIVE_KEYMAP KEYMAP_LAYOUT_TR_Q
#elif defined(KEYMAP_DE)
#define ACTIVE_KEYMAP KEYMAP_LAYOUT_DE
#elif defined(KEYMAP_UK)
#define ACTIVE_KEYMAP KEYMAP_LAYOUT_UK
#else
#define ACTIVE_KEYMAP KEYMAP_LAYOUT_US
#endif

// Translates an ASCII character into the US-HID keycode that produces it on the active host layout.
inline char translateKeymapChar(char c, KeymapLayout layout = ACTIVE_KEYMAP) {
  if (layout == KEYMAP_LAYOUT_TR_Q) {
    switch (c) {
      case '-': return '/';
      case '_': return '?';
      case '/': return '&';
      case ':': return '>';
      case ';': return '<';
      case '"': return '`';
      default: return c;
    }
  }
  if (layout == KEYMAP_LAYOUT_DE) {
    switch (c) {
      case 'y': return 'z';
      case 'z': return 'y';
      case 'Y': return 'Z';
      case 'Z': return 'Y';
      case '-': return '/';
      case '_': return '?';
      default: return c;
    }
  }
  if (layout == KEYMAP_LAYOUT_UK) {
    switch (c) {
      case '"': return '@';
      case '@': return '"';
      default: return c;
    }
  }
  return c;
}
