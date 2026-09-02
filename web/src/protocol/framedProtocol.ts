/**
 * RubberOtter Framed Protocol Encoder & Decoder (STX/ETX with XOR Checksum)
 */

export const STX = 0x02;
export const ETX = 0x03;
export const VERSION = 0x01;

let sequenceCounter = 0;

export function getNextSeq(): number {
  sequenceCounter = (sequenceCounter + 1) % 256;
  return sequenceCounter;
}

export function encodeFramedPacket(payloadText: string, seqNum?: number): Uint8Array {
  const seq = seqNum !== undefined ? seqNum : getNextSeq();
  const encoder = new TextEncoder();
  const payloadBytes = encoder.encode(payloadText);
  const len = payloadBytes.length;

  // Calculate XOR Checksum across all payload bytes
  let checksum = 0;
  for (let i = 0; i < len; i++) {
    checksum ^= payloadBytes[i];
  }

  // Frame structure: STX (1) + VER (1) + SEQ (1) + LEN_HI (1) + LEN_LO (1) + PAYLOAD (N) + CHECKSUM (1) + ETX (1)
  const packetLen = 1 + 1 + 1 + 2 + len + 1 + 1;
  const frame = new Uint8Array(packetLen);

  frame[0] = STX;
  frame[1] = VERSION;
  frame[2] = seq & 0xff;
  frame[3] = (len >> 8) & 0xff;
  frame[4] = len & 0xff;

  frame.set(payloadBytes, 5);

  frame[5 + len] = checksum & 0xff;
  frame[6 + len] = ETX;

  return frame;
}

export interface AckFrame {
  seq: number;
  statusOk: boolean;
  errorCode: number;
}

export function parseAckPacket(ackBytes: Uint8Array): AckFrame | null {
  if (ackBytes.length < 6) return null;
  if (ackBytes[0] !== STX || ackBytes[ackBytes.length - 1] !== ETX) return null;
  if (ackBytes[1] !== VERSION) return null;

  return {
    seq: ackBytes[2],
    statusOk: ackBytes[3] === 1,
    errorCode: ackBytes[4],
  };
}
