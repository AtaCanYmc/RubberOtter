"""
Rubber Otter Web Application Flask Server & REST API Endpoints.
Provides complete HTTP REST API for discovering, connecting, and controlling Rubber Otter devices.
"""

import os
from flask import Flask, jsonify, request, render_template

from ..client import RubberOtter, RubberOtterConnectionError
from ..scanner import scan_serial_ports, scan_ble_devices, scan_all

# Global active client instance
active_otter = None
active_target = None


def create_app():
    template_dir = os.path.join(os.path.dirname(__file__), "templates")
    static_dir = os.path.join(os.path.dirname(__file__), "static")

    app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)

    @app.route("/")
    def index():
        return render_template("index.html")

    @app.route("/api/scan", methods=["GET"])
    def api_scan():
        timeout = request.args.get("timeout", default=3.0, type=float)
        ble_target = request.args.get("target", default="Otter", type=str)
        res = scan_all(target_ble_name=ble_target, ble_timeout=timeout)
        return jsonify(res)

    @app.route("/api/status", methods=["GET"])
    def api_status():
        global active_otter, active_target
        connected = False
        if active_otter:
            connected = True
        return jsonify({
            "connected": connected,
            "target": active_target or (active_otter.connection_target if active_otter else None),
            "connection_type": active_otter.connection_type if active_otter else None,
            "auto_ble": RubberOtter.auto_detect_ble(),
            "auto_port": RubberOtter.auto_detect_port(),
        })

    @app.route("/api/connect", methods=["POST"])
    def api_connect():
        global active_otter, active_target
        data = request.get_json() or {}
        ble_address = data.get("ble_address")
        port = data.get("port")
        raw = data.get("raw", False)
        no_ack = data.get("no_ack", False)

        if active_otter:
            try:
                active_otter.disconnect()
            except Exception:
                pass

        try:
            if ble_address:
                otter = RubberOtter(ble_address=ble_address, use_ble=True, raw=raw, no_ack=no_ack)
            elif port:
                otter = RubberOtter(port=port, use_ble=False, raw=raw, no_ack=no_ack)
            else:
                otter = RubberOtter(use_ble=True, raw=raw, no_ack=no_ack)

            otter.connect()
            active_otter = otter
            active_target = otter.connection_target
            return jsonify({
                "success": True,
                "target": active_target,
                "connection_type": otter.connection_type,
                "message": f"Connected to {active_target}",
            })
        except Exception as e:
            active_otter = None
            active_target = None
            return jsonify({"success": False, "error": str(e)}), 400

    @app.route("/api/disconnect", methods=["POST"])
    def api_disconnect():
        global active_otter, active_target
        if active_otter:
            try:
                active_otter.disconnect()
            except Exception:
                pass
        active_otter = None
        active_target = None
        return jsonify({"success": True, "message": "Disconnected"})

    @app.route("/api/send", methods=["POST"])
    def api_send():
        global active_otter, active_target
        data = request.get_json() or {}
        cmd = data.get("cmd")

        if not cmd:
            return jsonify({"success": False, "error": "No command payload specified"}), 400

        ble_address = data.get("ble_address")
        port = data.get("port")
        raw = data.get("raw")
        no_ack = data.get("no_ack")

        try:
            if not active_otter:
                if ble_address:
                    active_otter = RubberOtter(ble_address=ble_address, use_ble=True)
                elif port:
                    active_otter = RubberOtter(port=port, use_ble=False)
                else:
                    active_otter = RubberOtter(use_ble=True)
                active_otter.connect()
                active_target = active_otter.connection_target

            res = active_otter.send(cmd, raw=raw, no_ack=no_ack)
            return jsonify(res)
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500

    @app.route("/api/type", methods=["POST"])
    def api_type():
        data = request.get_json() or {}
        text = data.get("text", "")
        escaped = text.replace('"', '\\"')
        return api_send_internal(f'type "{escaped}"', raw=data.get("raw"), no_ack=data.get("no_ack"))

    @app.route("/api/press", methods=["POST"])
    def api_press():
        data = request.get_json() or {}
        key = data.get("key", "enter")
        return api_send_internal(key, raw=data.get("raw"), no_ack=data.get("no_ack"))

    @app.route("/api/combo", methods=["POST"])
    def api_combo():
        data = request.get_json() or {}
        keys = data.get("keys", [])
        combo_str = " ".join(keys) if isinstance(keys, list) else str(keys)
        if not combo_str.startswith("press"):
            combo_str = f"press {combo_str}"
        return api_send_internal(combo_str, raw=data.get("raw"), no_ack=data.get("no_ack"))

    @app.route("/api/mouse", methods=["POST"])
    def api_mouse():
        data = request.get_json() or {}
        action = data.get("action", "click")
        if action == "click":
            button = data.get("button", "left")
            cmd = f"mouse {button}"
        elif action == "move":
            dx = data.get("dx", 0)
            dy = data.get("dy", 0)
            cmd = f"mouse move {dx} {dy}"
        elif action == "wheel":
            wheel = data.get("wheel", 1)
            cmd = f"mouse wheel {wheel}"
        else:
            cmd = "mouse left"
        return api_send_internal(cmd, raw=data.get("raw"), no_ack=data.get("no_ack"))

    @app.route("/api/jiggler", methods=["POST"])
    def api_jiggler():
        data = request.get_json() or {}
        action = data.get("action", "toggle")
        cmd = f"jiggler {action}" if action != "toggle" else "jiggler toggle"
        return api_send_internal(cmd, raw=data.get("raw"), no_ack=data.get("no_ack"))

    @app.route("/api/vibrate", methods=["POST"])
    def api_vibrate():
        data = request.get_json() or {}
        duration = data.get("duration", 100)
        return api_send_internal(f"vibrate {duration}", raw=data.get("raw"), no_ack=data.get("no_ack"))

    @app.route("/api/ble-name", methods=["POST"])
    def api_ble_name():
        data = request.get_json() or {}
        name = data.get("name", "Otter")
        return api_send_internal(f'ble name "{name}"', raw=data.get("raw"), no_ack=data.get("no_ack"))

    @app.route("/api/macro/list", methods=["GET", "POST"])
    def api_macro_list():
        return api_send_internal("macro list")

    @app.route("/api/macro/run", methods=["POST"])
    def api_macro_run():
        data = request.get_json() or {}
        slot = data.get("slot", "m0")
        return api_send_internal(f"macro run {slot}", raw=data.get("raw"), no_ack=data.get("no_ack"))

    @app.route("/api/macro/save", methods=["POST"])
    def api_macro_save():
        data = request.get_json() or {}
        slot = data.get("slot", "m0")
        body = data.get("body", "")
        return api_send_internal(f'macro save {slot} "{body}"', raw=data.get("raw"), no_ack=data.get("no_ack"))

    def api_send_internal(cmd_str, raw=None, no_ack=None):
        global active_otter, active_target
        try:
            if not active_otter:
                active_otter = RubberOtter(use_ble=True)
                active_otter.connect()
                active_target = active_otter.connection_target
            res = active_otter.send(cmd_str, raw=raw, no_ack=no_ack)
            return jsonify(res)
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500

    return app


def run_server(host: str = "127.0.0.1", port: int = 8080, debug: bool = False):
    app = create_app()
    print(f"\n[OtterDeck] Rubber Otter Web Dashboard running at: http://{host}:{port}/\n")
    app.run(host=host, port=port, debug=debug)
