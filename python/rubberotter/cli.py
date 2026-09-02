"""
Rubber Otter Package CLI Module
Provides subcommands for device scanning, payload transmission, macro management, interactive shell, and Web App server launch.
"""

import argparse
import asyncio
import json
import os
import readline
import sys
import time

from .client import RubberOtter, RubberOtterConnectionError
from .scanner import scan_serial_ports, scan_ble_devices


class Colors:
    HEADER = "\033[95m"
    OKBLUE = "\033[94m"
    OKCYAN = "\033[96m"
    OKGREEN = "\033[92m"
    WARNING = "\033[93m"
    FAIL = "\033[91m"
    ENDC = "\033[0m"
    BOLD = "\033[1m"


def colorize(text: str, color: str, disable_color: bool = False) -> str:
    if disable_color or not sys.stdout.isatty():
        return text
    return f"{color}{text}{Colors.ENDC}"


def handle_scan(args):
    """Handles device discovery scanning."""
    result = {"serial_ports": [], "ble_devices": []}

    if args.json:
        old_stdout = sys.stdout
        sys.stdout = open(os.devnull, "w")

    try:
        if args.mode in ["ble", "all"]:
            scan_time = getattr(args, "scan_timeout", 5.0)
            if not args.json:
                print(colorize(f"\n📡 SCANNING BLUETOOTH LE (BLE) DEVICES (Timeout: {scan_time}s)...", Colors.HEADER))
            ble_res = scan_ble_devices(target_name=args.target, timeout=scan_time)
            result["ble_devices"] = ble_res.get("devices", [])
            if ble_res.get("error"):
                result["ble_error"] = ble_res["error"]

            if not args.json:
                for d in result["ble_devices"]:
                    tag = " ★ [MATCH - Rubber Otter BLE]" if d.get("is_target") else ""
                    print(f" Device: {d['name']}")
                    print(f"   - Address: {d['address']}")
                    print(f"   - RSSI:    {d['rssi']} dBm{tag}")
                    print("-" * 50)

        if args.mode in ["serial", "all"]:
            if not args.json:
                print(colorize("\n🔌 SCANNING USB / SERIAL PORTS...", Colors.HEADER))
            ports = scan_serial_ports()
            result["serial_ports"] = ports
            if not args.json:
                for p in ports:
                    match_str = f" ★ [MATCH: {p['board']}]" if p.get("candidate") else ""
                    print(f" Port: {p['device']} {match_str}")
                    print(f"   - Desc: {p['description']}")
                    print(f"   - HWID: {p['hwid']}")
                    print("-" * 50)

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
    try:
        otter = RubberOtter(
            port=args.port,
            ble_address=args.ble_address,
            ble_target=args.target,
            baud=args.baud,
            timeout=args.timeout,
            retries=args.retries,
            raw=getattr(args, "raw", False),
            no_ack=getattr(args, "no_ack", False),
        )
        if not args.json:
            mode_str = " (RAW)" if args.raw else ""
            print(colorize(f"Sending payload to {otter.connection_target}{mode_str}: ", Colors.OKBLUE) + f"'{args.cmd}' (seq={args.seq})")

        res = otter.send(args.cmd, seq=args.seq)
        otter.disconnect()

        if args.json:
            print(json.dumps(res, indent=2))
        else:
            if res.get("success"):
                note = f" ({res.get('note')})" if res.get("note") else ""
                print(colorize(f"✔ ACK Received!{note} (Seq: {res.get('seq')}, Status: {res.get('status')}, Code: {res.get('code')})", Colors.OKGREEN))
            else:
                print(colorize(f"✖ Error: {res.get('error') or 'Command execution failed'}", Colors.FAIL))
                sys.exit(1)
    except RubberOtterConnectionError as e:
        err = {"error": str(e), "success": False}
        if args.json:
            print(json.dumps(err))
        else:
            print(colorize(f"[!] {e}", Colors.FAIL))
        sys.exit(1)


def handle_type(args):
    escaped = args.text.replace('"', '\\"')
    args.cmd = f'type "{escaped}"'
    handle_send(args)


def handle_macro(args):
    if args.action == "list":
        cmd = "macro list"
    elif args.action == "save":
        if not args.slot or not args.body:
            print(colorize("[!] Usage: rubberotter macro save mX \"<body_command>\"", Colors.FAIL))
            sys.exit(1)
        cmd = f'macro save {args.slot} "{args.body}"'
    elif args.action == "run":
        if not args.slot:
            print(colorize("[!] Usage: rubberotter macro run mX", Colors.FAIL))
            sys.exit(1)
        cmd = f"macro run {args.slot}"

    args.cmd = cmd
    handle_send(args)


def handle_jiggler(args):
    action = args.action.lower()
    if action == "toggle":
        cmd = "jiggler toggle"
    else:
        cmd = f"jiggler {action}"
    args.cmd = cmd
    handle_send(args)


def handle_vibrate(args):
    if args.duration <= 0:
        print(colorize("[!] Duration must be positive in milliseconds.", Colors.FAIL))
        sys.exit(1)
    args.cmd = f"vibrate {args.duration}"
    handle_send(args)


def handle_blename(args):
    if not args.name:
        print(colorize("[!] Please specify a new BLE name.", Colors.FAIL))
        sys.exit(1)
    args.cmd = f'ble name "{args.name}"'
    handle_send(args)


def handle_shell(args):
    """Launches interactive REPL command prompt."""
    try:
        otter = RubberOtter(
            port=args.port,
            ble_address=args.ble_address,
            ble_target=args.target,
            baud=args.baud,
            timeout=args.timeout,
            retries=args.retries,
            raw=getattr(args, "raw", False),
            no_ack=getattr(args, "no_ack", False),
        )
        otter.connect()
    except RubberOtterConnectionError as e:
        print(colorize(f"[!] {e}", Colors.FAIL))
        sys.exit(1)

    print(colorize("=" * 60, Colors.OKCYAN))
    print(colorize(" 🦦 Rubber Otter Interactive Console", Colors.BOLD + Colors.HEADER))
    print(colorize(f" Connected Target: {otter.connection_target}", Colors.OKBLUE))
    print(colorize(" Type commands directly or 'help' for options. Type 'exit' to quit.", Colors.OKCYAN))
    print(colorize("=" * 60, Colors.OKCYAN))

    commands = ["type ", "delay ", "enter", "tab", "backspace", "vibrate ", "jiggler toggle", "macro list", "macro run ", "help", "exit"]

    def completer(text, state):
        options = [c for c in commands if c.startswith(text)]
        if state < len(options):
            return options[state]
        return None

    readline.set_completer(completer)
    readline.parse_and_bind("tab: complete")

    seq = 1
    try:
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

                res = otter.send(line, seq=seq)
                seq = (seq % 254) + 1

                if res.get("success"):
                    print(colorize(f" ✔ ACK (seq={res.get('seq')})", Colors.OKGREEN))
                else:
                    print(colorize(f" ✖ Error: {res.get('error') or 'Execution failed'}", Colors.FAIL))

            except (KeyboardInterrupt, EOFError):
                print(colorize("\nGoodbye!", Colors.OKCYAN))
                break
    finally:
        otter.disconnect()


def handle_serve(args):
    """Launches the Rubber Otter Web App Dashboard."""
    try:
        from .web.server import run_server
        web_p = getattr(args, "web_port", 8080)
        run_server(host=args.host, port=web_p, debug=args.debug)
    except ImportError as e:
        print(colorize(f"[!] Failed to launch Web Server: {e}", Colors.FAIL))
        sys.exit(1)


def main():
    parent_parser = argparse.ArgumentParser(add_help=False)
    parent_parser.add_argument("--ble-address", "-b", help="Target Bluetooth LE (BLE) device MAC or UUID address")
    parent_parser.add_argument("--target", default="Otter", help="Target BLE advertised name filter (default: Otter)")
    parent_parser.add_argument("--port", help="Target USB Serial port (if explicitly connecting over USB)")
    parent_parser.add_argument("--baud", type=int, default=9600, help="Serial baud rate (default: 9600)")
    parent_parser.add_argument("--seq", type=int, default=1, help="Sequence number (0-255)")
    parent_parser.add_argument("--timeout", type=float, default=3.0, help="ACK timeout in seconds (default: 3.0)")
    parent_parser.add_argument("--retries", type=int, default=2, help="Number of retry attempts (default: 2)")
    parent_parser.add_argument("--raw", action="store_true", help="Send un-framed raw string payload (for custom/simple MCU sketches)")
    parent_parser.add_argument("--no-ack", action="store_true", help="Transmit payload without waiting for ACK response")
    parent_parser.add_argument("--json", action="store_true", help="Output machine-readable JSON format")

    parser = argparse.ArgumentParser(
        prog="rubberotter",
        description="Rubber Otter Device Discovery, Management & Web Dashboard CLI",
        parents=[parent_parser],
        formatter_class=argparse.RawTextHelpFormatter,
    )

    subparsers = parser.add_subparsers(dest="subcommand", help="Subcommands")

    # scan
    p_scan = subparsers.add_parser("scan", parents=[parent_parser], help="Scan for connected USB Serial ports & BLE devices")
    p_scan.add_argument("--mode", choices=["serial", "ble", "all"], default="all", help="Scan mode (default: all)")
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

    # serve
    p_serve = subparsers.add_parser("serve", parents=[parent_parser], help="Launch Rubber Otter Web Dashboard Server")
    p_serve.add_argument("--host", default="127.0.0.1", help="Server host address (default: 127.0.0.1)")
    p_serve.add_argument("--web-port", type=int, default=8080, help="Web Server HTTP port (default: 8080)")
    p_serve.add_argument("--debug", action="store_true", help="Enable Flask debug mode")

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
        "serve": handle_serve,
    }

    handler = handlers.get(args.subcommand)
    if handler:
        handler(args)


if __name__ == "__main__":
    main()
