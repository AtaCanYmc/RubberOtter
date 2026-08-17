#!/usr/bin/env python3
"""
Rubber Otter Unified CLI Tool
Complete device discovery, command execution, macro management, and interactive REPL console.

Usage:
    python3 scripts/cli.py [subcommand] [options]

Subcommands:
    scan        Discover USB Serial ports & Bluetooth LE (BLE) devices
    send        Send framed command payload to Rubber Otter
    type        Type raw text payload via USB HID keyboard
    macro       Manage EEPROM macros (list, save, run)
    jiggler     Control mouse jiggler mode (toggle, start, stop)
    vibrate     Trigger vibration motor haptics (duration in ms)
    ble-name    Configure HM-10 advertised Bluetooth name
    shell       Launch interactive REPL command shell
"""

import argparse
import asyncio
import json
import os
import readline
import sys
import time

# Protocol Constants
STX = 0x02
ETX = 0x03
VERSION = 0x01
PAYLOAD_MAX = 384

# Import scanner utilities if available
try:
    from scripts.scan_devices import scan_serial_ports, scan_ble_devices
except ImportError:
    # Handle direct execution from scripts directory
    try:
        from scan_devices import scan_serial_ports, scan_ble_devices
    except ImportError:
        scan_serial_ports = None
        scan_ble_devices = None


# ANSI Color Codes for terminal formatting
class Colors:
    HEADER = "\033[95m"
    OKBLUE = "\033[94m"
    OKCYAN = "\033[96m"
    OKGREEN = "\033[92m"
    WARNING = "\033[93m"
    FAIL = "\033[91m"
    ENDC = "\033[0m"
    BOLD = "\033[1m"
    UNDERLINE = "\033[4m"


def colorize(text, color, disable_color=False):
    if disable_color or not sys.stdout.isatty():
        return text
    return f"{color}{text}{Colors.ENDC}"


def build_frame(seq: int, payload: bytes) -> bytes:
    """Builds a binary frame according to the Rubber Otter framing protocol."""
    length = len(payload)
    if length > PAYLOAD_MAX:
        raise ValueError(f"Payload too large ({length} > max {PAYLOAD_MAX} bytes)")
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
    """Parses a 6-byte ACK response frame from Rubber Otter."""
    for i in range(len(data)):
        if data[i] == STX and i + 6 <= len(data):
            if data[i + 5] == ETX:
                ver = data[i + 1]
                seq = data[i + 2]
                status = data[i + 3]
                code = data[i + 4]
                return {
                    "version": ver,
                    "seq": seq,
                    "status": status,
                    "code": code,
                    "success": (status == 1 or status == 0) and code == 0,
                }
    return None


def auto_detect_port():
    """Auto-detects the first candidate Rubber Otter USB Serial port."""
    if not scan_serial_ports:
        return None
    # Quiet scan for candidate ports
    old_stdout = sys.stdout
    sys.stdout = open(os.devnull, "w")
    try:
        ports = scan_serial_ports()
    finally:
        sys.stdout.close()
        sys.stdout = old_stdout

    for p in ports:
        if p.get("candidate"):
            return p.get("device")
    if ports:
        return ports[0].get("device")
    return None


def send_command(port: str, cmd_str: str, seq: int = 1, baud: int = 9600, timeout: float = 1.0, retries: int = 2):
    """Sends a framed command string over Serial and waits for ACK response."""
    try:
        import serial
    except ImportError:
        return {"error": "pyserial is not installed. Run: pip install pyserial", "success": False}

    payload = cmd_str.encode("utf-8")
    frame = build_frame(seq & 0xFF, payload)

    try:
        s = serial.Serial(port, baud, timeout=0.05)
        s.dtr = True
        s.rts = True
        time.sleep(0.3)
    except Exception as e:
        return {"error": f"Failed to open serial port '{port}': {e}", "success": False}

    try:
        for attempt in range(1, retries + 2):
            s.write(frame)
            s.flush()

            start = time.time()
            buf = bytearray()
            while time.time() - start < timeout:
                chunk = s.read(128)
                if chunk:
                    buf.extend(chunk)
                    ack = parse_ack(buf)
                    if ack:
                        ack["attempt"] = attempt
                        ack["port"] = port
                        return ack
                else:
                    time.sleep(0.01)
        return {"error": f"Timeout waiting for ACK after {retries + 1} attempts", "success": False}
    finally:
        s.close()


# Subcommand Handlers
def handle_scan(args):
    """Handles device discovery scanning."""
    result = {"serial_ports": [], "ble_devices": []}

    if args.json:
        old_stdout = sys.stdout
        sys.stdout = open(os.devnull, "w")

    try:
        if scan_serial_ports and args.mode in ["serial", "all"]:
            if not args.json:
                print(colorize("\n🔌 SCANNING USB / SERIAL PORTS...", Colors.HEADER))
            ports = scan_serial_ports()
            result["serial_ports"] = ports

        if scan_ble_devices and args.mode in ["ble", "all"]:
            scan_time = getattr(args, "scan_timeout", 5.0)
            if not args.json:
                print(colorize(f"\n📡 SCANNING BLUETOOTH LE (BLE) DEVICES (Timeout: {scan_time}s)...", Colors.HEADER))
            try:
                ble_devs = asyncio.run(scan_ble_devices(target_name=args.target, timeout=scan_time))
                result["ble_devices"] = ble_devs
            except Exception as e:
                result["ble_error"] = str(e)
    finally:
        if args.json:
            sys.stdout.close()
            sys.stdout = old_stdout

    if args.json:
        print(json.dumps(result, indent=2))
    elif not result.get("serial_ports") and not result.get("ble_devices"):
        print(colorize("\n[!] No Rubber Otter devices detected.", Colors.WARNING))


def handle_send(args):
    """Handles sending framed payloads."""
    port = args.port or auto_detect_port()
    if not port:
        err = {"error": "No USB Serial port specified or auto-detected. Connect a device or use --port.", "success": False}
        if args.json:
            print(json.dumps(err))
        else:
            print(colorize(f"[!] {err['error']}", Colors.FAIL))
        sys.exit(1)

    if not args.json:
        print(colorize(f"Sending payload to {port}: ", Colors.OKBLUE) + f"'{args.cmd}' (seq={args.seq})")

    res = send_command(port, args.cmd, seq=args.seq, baud=args.baud, timeout=args.timeout, retries=args.retries)

    if args.json:
        print(json.dumps(res, indent=2))
    else:
        if res.get("success"):
            print(colorize(f"✔ ACK Received! (Seq: {res.get('seq')}, Status: {res.get('status')}, Code: {res.get('code')})", Colors.OKGREEN))
        else:
            print(colorize(f"✖ Error: {res.get('error') or 'Command failed'}", Colors.FAIL))
            sys.exit(1)


def handle_type(args):
    """Handles typing raw text payload."""
    escaped_text = args.text.replace('"', '\\"')
    cmd = f'type "{escaped_text}"'
    args.cmd = cmd
    handle_send(args)


def handle_macro(args):
    """Handles EEPROM macro actions (list, save, run)."""
    if args.action == "list":
        # List active macro slots
        cmd = "macro list"
    elif args.action == "save":
        if not args.slot or not args.body:
            print(colorize("[!] Usage: otter macro save mX \"<body_command>\"", Colors.FAIL))
            sys.exit(1)
        cmd = f'macro save {args.slot} "{args.body}"'
    elif args.action == "run":
        if not args.slot:
            print(colorize("[!] Usage: otter macro run mX", Colors.FAIL))
            sys.exit(1)
        cmd = f"macro run {args.slot}"

    args.cmd = cmd
    handle_send(args)


def handle_jiggler(args):
    """Handles mouse jiggler commands."""
    action = args.action.lower()
    if action not in ["start", "stop", "toggle"]:
        print(colorize("[!] Invalid jiggler action. Use: start, stop, or toggle", Colors.FAIL))
        sys.exit(1)

    if action == "toggle":
        cmd = "jiggler toggle"
    else:
        cmd = f"jiggler {action}"

    args.cmd = cmd
    handle_send(args)


def handle_vibrate(args):
    """Handles vibration motor control."""
    if args.duration <= 0:
        print(colorize("[!] Duration must be a positive integer in milliseconds.", Colors.FAIL))
        sys.exit(1)

    cmd = f"vibrate {args.duration}"
    args.cmd = cmd
    handle_send(args)


def handle_blename(args):
    """Handles changing the advertised BLE name."""
    if not args.name:
        print(colorize("[!] Please specify a new BLE name.", Colors.FAIL))
        sys.exit(1)

    cmd = f'ble name "{args.name}"'
    args.cmd = cmd
    handle_send(args)


def handle_shell(args):
    """Launches an interactive REPL shell for Rubber Otter."""
    port = args.port or auto_detect_port()
    if not port:
        print(colorize("[!] No device port specified or auto-detected.", Colors.FAIL))
        sys.exit(1)

    print(colorize("=" * 60, Colors.OKCYAN))
    print(colorize(" 🦦 Rubber Otter Interactive Console", Colors.BOLD + Colors.HEADER))
    print(colorize(f" Connected Port: {port}", Colors.OKBLUE))
    print(colorize(" Type commands directly or 'help' for options. Type 'exit' to quit.", Colors.OKCYAN))
    print(colorize("=" * 60, Colors.OKCYAN))

    seq = 1

    # Setup autocomplete
    commands = ["type ", "delay ", "enter", "tab", "backspace", "vibrate ", "jiggler toggle", "macro list", "macro run ", "help", "exit"]

    def completer(text, state):
        options = [c for c in commands if c.startswith(text)]
        if state < len(options):
            return options[state]
        return None

    readline.set_completer(completer)
    readline.parse_and_bind("tab: complete")

    while True:
        try:
            line = input(colorize("otter> ", Colors.BOLD + Colors.OKGREEN)).strip()
            if not line:
                continue
            if line.lower() in ["exit", "quit"]:
                print(colorize("Goodbye!", Colors.OKCYAN))
                break
            if line.lower() == "clear":
                os.system("clear")
                continue

            res = send_command(port, line, seq=seq, baud=args.baud, timeout=args.timeout)
            seq = (seq + 1) % 255

            if res.get("success"):
                print(colorize(f" ✔ ACK (seq={res.get('seq')})", Colors.OKGREEN))
            else:
                print(colorize(f" ✖ Error: {res.get('error') or 'Execution failed'}", Colors.FAIL))

        except (KeyboardInterrupt, EOFError):
            print(colorize("\nGoodbye!", Colors.OKCYAN))
            break


def main():
    parent_parser = argparse.ArgumentParser(add_help=False)
    parent_parser.add_argument("--port", help="Target USB Serial port (auto-detected if omitted)")
    parent_parser.add_argument("--baud", type=int, default=9600, help="Serial baud rate (default: 9600)")
    parent_parser.add_argument("--seq", type=int, default=1, help="Sequence number (0-255)")
    parent_parser.add_argument("--timeout", type=float, default=1.0, help="ACK timeout in seconds (default: 1.0)")
    parent_parser.add_argument("--retries", type=int, default=2, help="Number of retry attempts (default: 2)")
    parent_parser.add_argument("--json", action="store_true", help="Output machine-readable JSON format")

    parser = argparse.ArgumentParser(
        prog="otter",
        description="Rubber Otter Device Discovery & Management CLI",
        parents=[parent_parser],
        formatter_class=argparse.RawTextHelpFormatter,
    )

    subparsers = parser.add_subparsers(dest="subcommand", help="Subcommands")

    # scan
    p_scan = subparsers.add_parser("scan", parents=[parent_parser], help="Scan for connected USB Serial ports & BLE devices")
    p_scan.add_argument("--mode", choices=["serial", "ble", "all"], default="all", help="Scan mode (default: all)")
    p_scan.add_argument("--target", default="Otter", help="Target BLE advertised name filter (default: Otter)")
    p_scan.add_argument("--scan-timeout", type=float, default=5.0, help="BLE scan timeout in seconds")

    # send
    p_send = subparsers.add_parser("send", parents=[parent_parser], help="Send framed payload command string")
    p_send.add_argument("cmd", help="Command string (e.g. 'type \"Hello\\n\"' or 'vibrate 200')")

    # type
    p_type = subparsers.add_parser("type", parents=[parent_parser], help="Send typing command payload")
    p_type.add_argument("text", help="Text payload string to type")

    # macro
    p_macro = subparsers.add_parser("macro", parents=[parent_parser], help="Manage EEPROM macros")
    p_macro.add_argument("action", choices=["list", "save", "run"], help="Macro action")
    p_macro.add_argument("slot", nargs="?", help="Macro slot name (e.g. m0, m1)")
    p_macro.add_argument("body", nargs="?", help="Command string to store in macro slot (for save)")

    # jiggler
    p_jiggler = subparsers.add_parser("jiggler", parents=[parent_parser], help="Control mouse jiggler mode")
    p_jiggler.add_argument("action", choices=["start", "stop", "toggle"], default="toggle", nargs="?")

    # vibrate
    p_vibrate = subparsers.add_parser("vibrate", parents=[parent_parser], help="Trigger vibration motor haptics")
    p_vibrate.add_argument("duration", type=int, help="Duration in milliseconds")

    # ble-name
    p_blename = subparsers.add_parser("ble-name", parents=[parent_parser], help="Change HM-10 advertised BLE name")
    p_blename.add_argument("name", help="New advertised BLE name string")

    # shell
    subparsers.add_parser("shell", parents=[parent_parser], help="Launch interactive REPL command prompt")

    args = parser.parse_args()

    if not args.subcommand:
        parser.print_help()
        sys.exit(0)

    handlers = {
        "scan": handle_scan,
        "send": handle_send,
        "type": handle_type,
        "macro": handle_macro,
        "jiggler": handle_jiggler,
        "vibrate": handle_vibrate,
        "ble-name": handle_blename,
        "shell": handle_shell,
    }

    handler = handlers.get(args.subcommand)
    if handler:
        handler(args)


if __name__ == "__main__":
    main()
