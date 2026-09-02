"""
Rubber Otter Protocol Module
Implements binary framing (STX/ETX), XOR checksums, ACK packet parsing, and HID keycodes.
"""

STX = 0x02
ETX = 0x03
VERSION = 0x01
PAYLOAD_MAX = 384

# HID Special Key Modifiers & Codes
KEY_ENTER = 0xB0
KEY_ESC = 0xB1
KEY_BACKSPACE = 0xB2
KEY_TAB = 0xB3
KEY_RIGHT_ARROW = 0xD7
KEY_LEFT_ARROW = 0xD8
KEY_DOWN_ARROW = 0xD9
KEY_UP_ARROW = 0xDA
KEY_GUI_L = 0x83
KEY_F5 = 0xC6

# Single-Byte Protocol Hex Map
PROTOCOL_SINGLE_BYTE_MAP = {
    0x11: "MEDIA_PLAY_PAUSE",
    0x12: "MEDIA_NEXT_TRACK",
    0x13: "MEDIA_PREV_TRACK",
    0x14: "MEDIA_VOL_UP",
    0x15: "MEDIA_VOL_DOWN",
    0x16: "MEDIA_MUTE",
    0x21: "PRES_NEXT_SLIDE",
    0x22: "PRES_PREV_SLIDE",
    0x23: "PRES_FULLSCREEN",
    0x24: "PRES_BLANK_SCREEN",
    0x31: "SEC_LOCK_WORKSTATION",
    0x32: "SEC_JIGGLER_TOGGLE",
    0x33: "SEC_TASK_MANAGER",
    0x34: "SEC_SHOW_DESKTOP",
    0x35: "SEC_VIBRATE_PULSE",
    0x41: "GAME_CS_BUY",
    0x80: "MOUSE_MOVE",
    0x81: "MOUSE_LEFT_CLICK",
    0x82: "MOUSE_RIGHT_CLICK",
    0x83: "MOUSE_MIDDLE_CLICK",
    0x84: "MOUSE_SCROLL_UP",
    0x85: "MOUSE_SCROLL_DOWN",
}


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
