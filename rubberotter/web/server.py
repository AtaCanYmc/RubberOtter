"""
Rubber Otter Web Application Flask Server & REST API Endpoints.
"""

import os
from flask import Flask, jsonify, request, render_template

from ..client import RubberOtter, RubberOtterConnectionError
from ..scanner import scan_serial_ports, scan_ble_devices, scan_all

# Global active client instance
active_otter = None
active_port = None


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
        global active_otter, active_port
        connected = False
        if active_otter and active_otter._serial and active_otter._serial.is_open:
            connected = True
        return jsonify({
            "connected": connected,
            "port": active_port or (active_otter.port if active_otter else None),
            "auto_port": RubberOtter.auto_detect_port(),
        })

    @app.route("/api/connect", methods=["POST"])
    def api_connect():
        global active_otter, active_port
        data = request.get_json() or {}
        port = data.get("port") or RubberOtter.auto_detect_port()

        if active_otter:
            try:
                active_otter.disconnect()
            except Exception:
                pass

        try:
            otter = RubberOtter(port=port)
            otter.connect()
            active_otter = otter
            active_port = port
            return jsonify({"success": True, "port": port, "message": f"Connected to {port}"})
        except Exception as e:
            active_otter = None
            active_port = None
            return jsonify({"success": False, "error": str(e)}), 400

    @app.route("/api/disconnect", methods=["POST"])
    def api_disconnect():
        global active_otter, active_port
        if active_otter:
            try:
                active_otter.disconnect()
            except Exception:
                pass
        active_otter = None
        active_port = None
        return jsonify({"success": True, "message": "Disconnected"})

    @app.route("/api/send", methods=["POST"])
    def api_send():
        global active_otter, active_port
        data = request.get_json() or {}
        cmd = data.get("cmd")

        if not cmd:
            return jsonify({"success": False, "error": "No command payload specified"}), 400

        target_port = data.get("port") or active_port or RubberOtter.auto_detect_port()

        try:
            if not active_otter or active_otter.port != target_port:
                active_otter = RubberOtter(port=target_port)
                active_otter.connect()
                active_port = target_port

            res = active_otter.send(cmd)
            return jsonify(res)
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500

    @app.route("/api/jiggler", methods=["POST"])
    def api_jiggler():
        data = request.get_json() or {}
        action = data.get("action", "toggle")
        cmd = f"jiggler {action}" if action != "toggle" else "jiggler toggle"
        return api_send_internal(cmd)

    @app.route("/api/vibrate", methods=["POST"])
    def api_vibrate():
        data = request.get_json() or {}
        duration = data.get("duration", 100)
        return api_send_internal(f"vibrate {duration}")

    @app.route("/api/macro/run", methods=["POST"])
    def api_macro_run():
        data = request.get_json() or {}
        slot = data.get("slot", "m0")
        return api_send_internal(f"macro run {slot}")

    @app.route("/api/macro/save", methods=["POST"])
    def api_macro_save():
        data = request.get_json() or {}
        slot = data.get("slot", "m0")
        body = data.get("body", "")
        return api_send_internal(f'macro save {slot} "{body}"')

    def api_send_internal(cmd_str):
        global active_otter, active_port
        target_port = active_port or RubberOtter.auto_detect_port()
        try:
            if not active_otter or active_otter.port != target_port:
                active_otter = RubberOtter(port=target_port)
                active_otter.connect()
                active_port = target_port
            res = active_otter.send(cmd_str)
            return jsonify(res)
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500

    return app


def run_server(host: str = "127.0.0.1", port: int = 8080, debug: bool = False):
    app = create_app()
    print(f"\n🦦 Rubber Otter Web Dashboard running at: http://{host}:{port}/\n")
    app.run(host=host, port=port, debug=debug)
