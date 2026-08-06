/**
 * Master-Key Single-Byte Protocol Map (0x00 - 0xFF)
 */

export const PROTOCOL = {
  // Media Mode (0x10 - 0x1F)
  MEDIA_PLAY_PAUSE: 0x11,
  MEDIA_NEXT_TRACK: 0x12,
  MEDIA_PREV_TRACK: 0x13,
  MEDIA_VOL_UP: 0x14,
  MEDIA_VOL_DOWN: 0x15,
  MEDIA_MUTE: 0x16,

  // Presentation / Reader Mode (0x20 - 0x2F)
  PRES_NEXT_SLIDE: 0x21,  // Right Arrow
  PRES_PREV_SLIDE: 0x22,  // Left Arrow
  PRES_FULLSCREEN: 0x23,  // F5 Toggle
  PRES_BLANK_SCREEN: 0x24,// 'b' / Esc

  // Security & Utilities (0x30 - 0x3F)
  SEC_LOCK_WORKSTATION: 0x31, // Win + L
  SEC_JIGGLER_TOGGLE: 0x32,   // Toggle periodic mouse jiggle
  SEC_TASK_MANAGER: 0x33,     // Ctrl + Shift + Esc
  SEC_SHOW_DESKTOP: 0x34,     // Win + D

  // Gaming & Macro Mode (0x40 - 0x4F)
  GAME_CS_BUY: 0x41, // 'b' -> delay -> '4' -> delay -> '2'

  // Virtual Trackpad & Mouse Control (0x80 - 0x8F)
  MOUSE_MOVE_PACKET: 0x80, // [0x80, deltaX, deltaY]
  MOUSE_LEFT_CLICK: 0x81,
  MOUSE_RIGHT_CLICK: 0x82,
  MOUSE_MIDDLE_CLICK: 0x83,
  MOUSE_SCROLL_UP: 0x84,
  MOUSE_SCROLL_DOWN: 0x85,
} as const;

export const PROTOCOL_NAMES: Record<number, string> = {
  0x11: 'Media: Play/Pause',
  0x12: 'Media: Next Track',
  0x13: 'Media: Prev Track',
  0x14: 'Media: Volume Up',
  0x15: 'Media: Volume Down',
  0x16: 'Media: Mute',
  0x21: 'Presentation: Next Slide',
  0x22: 'Presentation: Prev Slide',
  0x23: 'Presentation: Fullscreen (F5)',
  0x24: 'Presentation: Blank Screen',
  0x31: 'Security: Lock Workstation (Win+L)',
  0x32: 'Security: Toggle Mouse Jiggler',
  0x33: 'Security: Task Manager',
  0x34: 'Security: Show Desktop',
  0x41: 'Gaming: CS Buy Armor Sequence',
  0x80: 'Trackpad: Mouse Move Packet',
  0x81: 'Trackpad: Left Click',
  0x82: 'Trackpad: Right Click',
  0x83: 'Trackpad: Middle Click',
  0x84: 'Trackpad: Scroll Up',
  0x85: 'Trackpad: Scroll Down',
};
