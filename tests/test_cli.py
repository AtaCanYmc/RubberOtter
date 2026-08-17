#!/usr/bin/env python3
"""
Unit tests for Rubber Otter CLI tool framing protocol, ACK parsing, and utilities.
"""

import sys
import unittest
from pathlib import Path

# Add scripts directory to Python path
sys.path.insert(0, str(Path(__file__).parent.parent / "scripts"))

from cli import STX, ETX, VERSION, PAYLOAD_MAX, build_frame, parse_ack


class TestFramingProtocol(unittest.TestCase):

    def test_build_frame_basic(self):
        payload = b'delay 100'
        seq = 5
        frame = build_frame(seq, payload)

        self.assertEqual(frame[0], STX)
        self.assertEqual(frame[1], VERSION)
        self.assertEqual(frame[2], seq)
        self.assertEqual(frame[3], 0)
        self.assertEqual(frame[4], len(payload))
        self.assertEqual(frame[5:5 + len(payload)], payload)
        self.assertEqual(frame[-1], ETX)

        # Check XOR checksum calculation
        expected_chk = 0
        for b in payload:
            expected_chk ^= b
        self.assertEqual(frame[-2], expected_chk)

    def test_build_frame_checksum(self):
        payload = b'type "hello"'
        frame = build_frame(1, payload)
        chk = 0
        for b in payload:
            chk ^= b
        self.assertEqual(frame[-2], chk)

    def test_build_frame_payload_max_limit(self):
        overflow_payload = b'A' * (PAYLOAD_MAX + 1)
        with self.assertRaises(ValueError):
            build_frame(1, overflow_payload)

    def test_parse_ack_valid_success(self):
        # ACK frame structure: STX VERSION SEQ STATUS CODE ETX
        # STATUS 1 or 0, CODE 0
        raw_ack = bytes([STX, VERSION, 1, 1, 0, ETX])
        res = parse_ack(raw_ack)

        self.assertIsNotNone(res)
        self.assertEqual(res["version"], VERSION)
        self.assertEqual(res["seq"], 1)
        self.assertEqual(res["status"], 1)
        self.assertEqual(res["code"], 0)
        self.assertTrue(res["success"])

    def test_parse_ack_valid_error(self):
        # STATUS 0, CODE 3 (checksum error)
        raw_ack = bytes([STX, VERSION, 2, 0, 3, ETX])
        res = parse_ack(raw_ack)

        self.assertIsNotNone(res)
        self.assertEqual(res["seq"], 2)
        self.assertFalse(res["success"])

    def test_parse_ack_with_noise_prefix(self):
        noise = b'RO_READY\n'
        raw_ack = noise + bytes([STX, VERSION, 10, 1, 0, ETX])
        res = parse_ack(raw_ack)

        self.assertIsNotNone(res)
        self.assertEqual(res["seq"], 10)
        self.assertTrue(res["success"])

    def test_parse_ack_incomplete(self):
        incomplete = bytes([STX, VERSION, 1, 1])
        res = parse_ack(incomplete)
        self.assertIsNone(res)


if __name__ == "__main__":
    unittest.main()
