/**
 * Packet Encoder Utilities
 */

export function encodeSingleByte(byteCode: number): Uint8Array {
  return new Uint8Array([byteCode & 0xFF]);
}

export function encodeTrackpadMove(dx: number, dy: number): Uint8Array {
  // Clamp to signed int8 (-128 to 127)
  const clampedX = Math.max(-128, Math.min(127, Math.round(dx)));
  const clampedY = Math.max(-128, Math.min(127, Math.round(dy)));
  
  return new Uint8Array([
    0x80,
    clampedX & 0xFF,
    clampedY & 0xFF
  ]);
}

export function bytesToHex(bytes: Uint8Array | number[]): string {
  return Array.from(bytes)
    .map(b => '0x' + b.toString(16).padStart(2, '0').toUpperCase())
    .join(' ');
}
