#!/usr/bin/env python3
"""
Simple helper to send a framed command to Rubber Otter and wait for an ACK.
Usage:
  python3 scripts/send_packet.py /dev/tty.usbmodemXXXX --cmd 'type "Hello\\n"' --seq 1

This script builds the frame: STX(0x02) VERSION(0x01) SEQ(1) LEN(2BE) PAYLOAD CHECK XOR ETX(0x03)
It then sends it over serial and waits for the ACK frame: STX VERSION SEQ STATUS CODE ETX
"""
import argparse
import sys
import time

STX = 0x02
ETX = 0x03
VERSION = 0x01


def build_frame(seq: int, payload: bytes) -> bytes:
    length = len(payload)
    if length >= 0x10000:
        raise ValueError("payload too large")
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
    # minimal parser: find STX then read expected 6 bytes total
    for i in range(len(data)):
        if data[i] == STX and i + 6 <= len(data):
            if data[i+5] == ETX:
                ver = data[i+1]
                seq = data[i+2]
                status = data[i+3]
                code = data[i+4]
                return {'version': ver, 'seq': seq, 'status': status, 'code': code}
    return None


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('port', help='serial device (e.g. /dev/cu.usbmodemXXXX)')
    parser.add_argument('--baud', type=int, default=9600, help='serial baud (default 9600)')
    parser.add_argument('--cmd', required=True, help='command payload string, raw ASCII')
    parser.add_argument('--seq', type=int, default=1, help='sequence number 0-255')
    parser.add_argument('--timeout', type=float, default=1.0, help='ACK wait timeout in seconds')
    parser.add_argument('--retries', type=int, default=2, help='retries on timeout')
    args = parser.parse_args()

    try:
        import serial
    except Exception as e:
        print('pyserial is required. Install with: pip3 install pyserial', file=sys.stderr)
        sys.exit(2)

    payload = args.cmd.encode('utf-8')
    frame = build_frame(args.seq & 0xFF, payload)

    s = serial.Serial(args.port, args.baud, timeout=0.05)
    s.dtr = True
    s.rts = True
    time.sleep(0.3)
    try:
        attempts = 0
        while attempts <= args.retries:
            attempts += 1
            print(f"Sending frame (seq={args.seq}) attempt {attempts}")
            s.write(frame)
            s.flush()

            start = time.time()
            buf = bytearray()
            while time.time() - start < args.timeout:
                chunk = s.read(128)
                if chunk:
                    buf.extend(chunk)
                    ack = parse_ack(buf)
                    if ack:
                        print('ACK received:', ack)
                        return 0
                else:
                    time.sleep(0.01)

            print('Timeout waiting for ACK, retrying...' if attempts <= args.retries else 'Timeout, no ACK')
        return 1
    finally:
        s.close()


if __name__ == '__main__':
    sys.exit(main())

