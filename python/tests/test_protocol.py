"""
Unit tests for RubberOtterPy protocol framing, XOR checksums, and ACK parser.
"""

import unittest
from rubberotter.protocol import STX, ETX, VERSION, PAYLOAD_MAX, build_frame, parse_ack, PayloadTooLargeError


class TestProtocolModule(unittest.TestCase):

    def test_build_frame_valid(self):
        payload = b'delay 500'
        seq = 42
        frame = build_frame(seq, payload)

        self.assertEqual(frame[0], STX)
        self.assertEqual(frame[1], VERSION)
        self.assertEqual(frame[2], seq)
        self.assertEqual(frame[3], 0)
        self.assertEqual(frame[4], len(payload))
        self.assertEqual(frame[5:5 + len(payload)], payload)
        self.assertEqual(frame[-1], ETX)

        # XOR checksum validation
        chk = 0
        for b in payload:
            chk ^= b
        self.assertEqual(frame[-2], chk)

    def test_build_frame_overflow(self):
        large_payload = b'X' * (PAYLOAD_MAX + 1)
        with self.assertRaises(PayloadTooLargeError):
            build_frame(1, large_payload)

    def test_parse_ack_success(self):
        raw = bytes([STX, VERSION, 5, 1, 0, ETX])
        ack = parse_ack(raw)
        self.assertIsNotNone(ack)
        self.assertEqual(ack["seq"], 5)
        self.assertEqual(ack["status"], 1)
        self.assertEqual(ack["code"], 0)
        self.assertTrue(ack["success"])

    def test_parse_ack_error_code(self):
        raw = bytes([STX, VERSION, 12, 0, 3, ETX])
        ack = parse_ack(raw)
        self.assertIsNotNone(ack)
        self.assertEqual(ack["seq"], 12)
        self.assertFalse(ack["success"])

    def test_parse_ack_noise(self):
        raw = b'NOISE_PREFIX\n' + bytes([STX, VERSION, 99, 1, 0, ETX])
        ack = parse_ack(raw)
        self.assertIsNotNone(ack)
        self.assertEqual(ack["seq"], 99)
        self.assertTrue(ack["success"])


if __name__ == "__main__":
    unittest.main()
