"""
Rubber Otter Protocol Module
Implements binary framing (STX/ETX), XOR checksums, and ACK packet parsing.
"""

STX = 0x02
ETX = 0x03
VERSION = 0x01
PAYLOAD_MAX = 384


class ProtocolError(Exception):
    """Base exception for Rubber Otter framing & protocol errors."""
    pass


class PayloadTooLargeError(ProtocolError):
    """Raised when command payload exceeds maximum allowed size."""
    pass


def build_frame(seq: int, payload: bytes) -> bytes:
    """
    Encapsulates a payload byte string into a binary frame:
    [STX(0x02), VERSION(0x01), SEQ(1B), LEN_HI(1B), LEN_LO(1B), PAYLOAD(NB), CHK(1B), ETX(0x03)]
    """
    length = len(payload)
    if length > PAYLOAD_MAX:
        raise PayloadTooLargeError(f"Payload size {length} exceeds maximum limit of {PAYLOAD_MAX} bytes")

    chk = 0
    for b in payload:
        chk ^= b

    frame = bytearray()
    frame.append(STX)
    frame.append(VERSION)
    frame.append(seq & 0xFF)
    frame.append((length >> 8) & 0xFF)
    frame.append(length & 0xFF)
    frame.extend(payload)
    frame.append(chk & 0xFF)
    frame.append(ETX)
    return bytes(frame)


def parse_ack(data: bytes):
    """
    Parses a 6-byte ACK response frame from Rubber Otter:
    [STX(0x02), VERSION(0x01), SEQ(1B), STATUS(1B), CODE(1B), ETX(0x03)]
    Returns dict if valid frame found, else None.
    """
    for i in range(len(data)):
        if data[i] == STX and i + 6 <= len(data):
            if data[i + 5] == ETX:
                ver = data[i + 1]
                seq = data[i + 2]
                status = data[i + 3]
                code = data[i + 4]
                # Status 1 or 0 indicates response received; code 0 = success
                success = (status == 1 or status == 0) and code == 0
                return {
                    "version": ver,
                    "seq": seq,
                    "status": status,
                    "code": code,
                    "success": success,
                }
    return None
