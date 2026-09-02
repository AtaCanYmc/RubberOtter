"""Rubber Otter AI Agent Tools & Schema Exporters.

Provides typed, modular tool definitions compatible with Model Context Protocol (MCP),
OpenAI Function Calling, Anthropic Claude Tools, and LangChain/CrewAI agent frameworks.
"""

from __future__ import annotations

import inspect
from typing import Any, Callable, Dict, List, Optional
from dataclasses import dataclass, field

from rubberotter.client import RubberOtter
from rubberotter.protocol import PROTOCOL_SINGLE_BYTE_MAP, KEY_ENTER, KEY_GUI_L, KEY_LEFT_ARROW, KEY_RIGHT_ARROW, KEY_F5


@dataclass
class ToolDefinition:
    """Descriptor for an AI-invocable tool."""
    name: str
    description: str
    parameters: Dict[str, Any]
    handler: Callable[..., Any]
    required: List[str] = field(default_factory=list)

    def to_mcp_tool(self) -> Dict[str, Any]:
        """Export tool description in Model Context Protocol (MCP) format."""
        return {
            "name": self.name,
            "description": self.description,
            "inputSchema": {
                "type": "object",
                "properties": self.parameters,
                "required": self.required,
            }
        }

    def to_openai_tool(self) -> Dict[str, Any]:
        """Export tool description in OpenAI function calling format."""
        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description,
                "parameters": {
                    "type": "object",
                    "properties": self.parameters,
                    "required": self.required,
                }
            }
        }

    def to_anthropic_tool(self) -> Dict[str, Any]:
        """Export tool description in Anthropic Claude tool format."""
        return {
            "name": self.name,
            "description": self.description,
            "input_schema": {
                "type": "object",
                "properties": self.parameters,
                "required": self.required,
            }
        }


class RubberOtterToolRegistry:
    """Registry of AI tools that execute commands on Rubber Otter hardware."""

    def __init__(self, client: Optional[RubberOtter] = None) -> None:
        self._client = client
        self._tools: Dict[str, ToolDefinition] = {}
        self._register_default_tools()

    @property
    def client(self) -> RubberOtter:
        if self._client is None:
            self._client = RubberOtter()
        return self._client

    def set_client(self, client: RubberOtter) -> None:
        self._client = client

    def register(self, tool: ToolDefinition) -> None:
        self._tools[tool.name] = tool

    def get_tool(self, name: str) -> Optional[ToolDefinition]:
        return self._tools.get(name)

    def list_tools(self) -> List[ToolDefinition]:
        return list(self._tools.values())

    def execute(self, tool_name: str, arguments: Dict[str, Any]) -> Any:
        tool = self.get_tool(tool_name)
        if not tool:
            raise ValueError(f"Unknown tool: {tool_name}")
        return tool.handler(**arguments)

    def _register_default_tools(self) -> None:
        # 1. Type Text
        self.register(ToolDefinition(
            name="rubberotter_type",
            description="Types text strings, automated shell commands, or source code directly to the target computer as USB HID keystrokes.",
            parameters={
                "text": {
                    "type": "string",
                    "description": "The exact text payload or command to type."
                },
                "auto_enter": {
                    "type": "boolean",
                    "description": "Whether to automatically press the Enter key after typing the text (default: false).",
                    "default": False
                }
            },
            required=["text"],
            handler=lambda text, auto_enter=False: self._tool_type(text, auto_enter)
        ))

        # 2. Key Combo / Shortcut
        self.register(ToolDefinition(
            name="rubberotter_key_combo",
            description="Sends specialized key combinations or single keys (e.g. enter, tab, escape, backspace, gui_l, ctrl_c).",
            parameters={
                "key": {
                    "type": "string",
                    "description": "The target key name (e.g. 'enter', 'tab', 'escape', 'space', 'backspace', 'gui_l', 'right_arrow', 'left_arrow', 'f5')."
                }
            },
            required=["key"],
            handler=lambda key: self._tool_key_combo(key)
        ))

        # 3. Mouse Movement
        self.register(ToolDefinition(
            name="rubberotter_mouse_move",
            description="Performs relative mouse pointer movements on the target host screen.",
            parameters={
                "dx": {
                    "type": "integer",
                    "description": "Relative horizontal displacement in pixels (-127 to 127, positive = right, negative = left)."
                },
                "dy": {
                    "type": "integer",
                    "description": "Relative vertical displacement in pixels (-127 to 127, positive = down, negative = up)."
                }
            },
            required=["dx", "dy"],
            handler=lambda dx, dy: self._tool_mouse_move(dx, dy)
        ))

        # 4. Mouse Click
        self.register(ToolDefinition(
            name="rubberotter_mouse_click",
            description="Triggers a virtual USB mouse click (left, right, or middle button).",
            parameters={
                "button": {
                    "type": "string",
                    "enum": ["left", "right", "middle"],
                    "description": "The mouse button to click (default: 'left').",
                    "default": "left"
                }
            },
            required=[],
            handler=lambda button="left": self._tool_mouse_click(button)
        ))

        # 5. Mouse Scroll
        self.register(ToolDefinition(
            name="rubberotter_mouse_scroll",
            description="Scrolls the virtual mouse wheel up or down.",
            parameters={
                "direction": {
                    "type": "string",
                    "enum": ["up", "down"],
                    "description": "Scroll direction ('up' or 'down')."
                },
                "steps": {
                    "type": "integer",
                    "description": "Number of scroll steps (default: 1).",
                    "default": 1
                }
            },
            required=["direction"],
            handler=lambda direction, steps=1: self._tool_mouse_scroll(direction, steps)
        ))

        # 6. Media Control
        self.register(ToolDefinition(
            name="rubberotter_media",
            description="Controls media playback, tracks, and audio volume on the target computer.",
            parameters={
                "action": {
                    "type": "string",
                    "enum": ["play_pause", "next", "prev", "vol_up", "vol_down", "mute"],
                    "description": "Media command to execute."
                }
            },
            required=["action"],
            handler=lambda action: self._tool_media(action)
        ))

        # 7. Presentation Controls
        self.register(ToolDefinition(
            name="rubberotter_presenter",
            description="Navigates presentation slides (PowerPoint, Keynote, Google Slides).",
            parameters={
                "action": {
                    "type": "string",
                    "enum": ["next_slide", "prev_slide", "fullscreen", "black_screen"],
                    "description": "Presentation action to execute."
                }
            },
            required=["action"],
            handler=lambda action: self._tool_presenter(action)
        ))

        # 8. Security & Screen Lock
        self.register(ToolDefinition(
            name="rubberotter_lock",
            description="Instantly locks the workstation screen (Windows + L on PC, Ctrl + Cmd + Q on Mac).",
            parameters={},
            required=[],
            handler=lambda: self._tool_lock()
        ))

        # 9. Mouse Jiggler
        self.register(ToolDefinition(
            name="rubberotter_jiggler",
            description="Toggles the non-blocking periodic mouse jiggler mode to prevent system sleep / screen timeout.",
            parameters={},
            required=[],
            handler=lambda: self._tool_jiggler()
        ))

        # 10. Haptic Pulse
        self.register(ToolDefinition(
            name="rubberotter_vibrate",
            description="Triggers a physical haptic vibration pulse on the Rubber Otter hardware microcontroller (Pin 2).",
            parameters={
                "duration_ms": {
                    "type": "integer",
                    "description": "Vibration pulse duration in milliseconds (default: 100).",
                    "default": 100
                }
            },
            required=[],
            handler=lambda duration_ms=100: self._tool_vibrate(duration_ms)
        ))

        # 11. Execute Macro
        self.register(ToolDefinition(
            name="rubberotter_macro",
            description="Executes a predefined macro or game buy chain on the hardware.",
            parameters={
                "macro_name": {
                    "type": "string",
                    "description": "Name or hex code of the macro (e.g. 'cs_buy', 'task_mgr', 'show_desktop', '0x41')."
                }
            },
            required=["macro_name"],
            handler=lambda macro_name: self._tool_macro(macro_name)
        ))

        # 12. Scan BLE Devices
        self.register(ToolDefinition(
            name="rubberotter_scan",
            description="Scans for nearby Rubber Otter Bluetooth Low Energy (HM-10 / ESP32) hardware devices.",
            parameters={
                "timeout": {
                    "type": "number",
                    "description": "Scan timeout in seconds (default: 3.0).",
                    "default": 3.0
                }
            },
            required=[],
            handler=lambda timeout=3.0: self._tool_scan(timeout)
        ))

        # 13. Status / Telemetry
        self.register(ToolDefinition(
            name="rubberotter_status",
            description="Retrieves live telemetry, connection state, and packet transmission metrics from Rubber Otter.",
            parameters={},
            required=[],
            handler=lambda: self._tool_status()
        ))

    # --- Tool Execution Handlers ---

    def _tool_type(self, text: str, auto_enter: bool = False) -> Dict[str, Any]:
        self.client.type(text)
        if auto_enter:
            self.client.press_key(KEY_ENTER)
        return {
            "success": True,
            "action": "type",
            "characters_sent": len(text),
            "auto_enter": auto_enter,
            "message": f"Successfully typed {len(text)} characters to target PC."
        }

    def _tool_key_combo(self, key: str) -> Dict[str, Any]:
        key_map = {
            "enter": KEY_ENTER,
            "return": KEY_ENTER,
            "gui_l": KEY_GUI_L,
            "win": KEY_GUI_L,
            "cmd": KEY_GUI_L,
            "right_arrow": KEY_RIGHT_ARROW,
            "left_arrow": KEY_LEFT_ARROW,
            "f5": KEY_F5,
        }
        k = key.lower().strip()
        code = key_map.get(k)
        if code is not None:
            self.client.press_key(code)
        else:
            self.client.type(key)
        return {
            "success": True,
            "action": "key_combo",
            "key": key,
            "message": f"Successfully sent key '{key}' to target PC."
        }

    def _tool_mouse_move(self, dx: int, dy: int) -> Dict[str, Any]:
        dx_clamped = max(-127, min(127, int(dx)))
        dy_clamped = max(-127, min(127, int(dy)))
        self.client.mouse_move(dx_clamped, dy_clamped)
        return {
            "success": True,
            "action": "mouse_move",
            "dx": dx_clamped,
            "dy": dy_clamped,
            "message": f"Mouse moved relative dx={dx_clamped}, dy={dy_clamped}."
        }

    def _tool_mouse_click(self, button: str = "left") -> Dict[str, Any]:
        btn = button.lower()
        if btn == "right":
            self.client.mouse_right_click()
        elif btn == "middle":
            self.client.mouse_middle_click()
        else:
            self.client.mouse_left_click()
        return {
            "success": True,
            "action": "mouse_click",
            "button": btn,
            "message": f"Executed {btn} mouse click."
        }

    def _tool_mouse_scroll(self, direction: str, steps: int = 1) -> Dict[str, Any]:
        d = direction.lower()
        count = max(1, min(20, int(steps)))
        for _ in range(count):
            if d == "down":
                self.client.mouse_scroll_down()
            else:
                self.client.mouse_scroll_up()
        return {
            "success": True,
            "action": "mouse_scroll",
            "direction": d,
            "steps": count,
            "message": f"Scrolled mouse wheel {d} by {count} steps."
        }

    def _tool_media(self, action: str) -> Dict[str, Any]:
        act = action.lower()
        if act == "play_pause":
            self.client.media_play_pause()
        elif act == "next":
            self.client.media_next_track()
        elif act == "prev":
            self.client.media_prev_track()
        elif act == "vol_up":
            self.client.media_vol_up()
        elif act == "vol_down":
            self.client.media_vol_down()
        elif act == "mute":
            self.client.media_mute()
        else:
            raise ValueError(f"Unknown media action: {action}")
        return {
            "success": True,
            "action": "media",
            "media_command": act,
            "message": f"Executed media command: {act}."
        }

    def _tool_presenter(self, action: str) -> Dict[str, Any]:
        act = action.lower()
        if act == "next_slide":
            self.client.pres_next_slide()
        elif act == "prev_slide":
            self.client.pres_prev_slide()
        elif act == "fullscreen":
            self.client.pres_fullscreen()
        elif act == "black_screen":
            self.client.pres_blank_screen()
        else:
            raise ValueError(f"Unknown presenter action: {action}")
        return {
            "success": True,
            "action": "presenter",
            "presenter_command": act,
            "message": f"Executed presenter command: {act}."
        }

    def _tool_lock(self) -> Dict[str, Any]:
        self.client.sec_lock()
        return {
            "success": True,
            "action": "lock",
            "message": "Sent workstation lock command."
        }

    def _tool_jiggler(self) -> Dict[str, Any]:
        self.client.jiggler_toggle()
        return {
            "success": True,
            "action": "jiggler_toggle",
            "message": "Toggled non-blocking periodic mouse jiggler."
        }

    def _tool_vibrate(self, duration_ms: int = 100) -> Dict[str, Any]:
        self.client.vibrate(duration_ms)
        return {
            "success": True,
            "action": "vibrate",
            "duration_ms": duration_ms,
            "message": f"Triggered {duration_ms}ms hardware vibration pulse."
        }

    def _tool_macro(self, macro_name: str) -> Dict[str, Any]:
        m = macro_name.lower().strip()
        if m in ("cs_buy", "cs", "0x41"):
            self.client.game_cs_buy()
        elif m in ("task_mgr", "task_manager", "0x33"):
            self.client.sec_task_mgr()
        elif m in ("show_desktop", "desktop", "0x34"):
            self.client.sec_show_desktop()
        elif m.startswith("0x"):
            val = int(m, 16)
            self.client.send_byte(val)
        else:
            raise ValueError(f"Unknown macro: {macro_name}")
        return {
            "success": True,
            "action": "macro",
            "macro": macro_name,
            "message": f"Executed macro '{macro_name}'."
        }

    def _tool_scan(self, timeout: float = 3.0) -> Dict[str, Any]:
        from rubberotter.scanner import scan_ble_devices
        devices = scan_ble_devices(timeout=timeout)
        return {
            "success": True,
            "action": "scan",
            "devices_found": len(devices),
            "devices": [
                {
                    "address": d.address,
                    "name": d.name,
                    "rssi": d.rssi,
                    "is_rubber_otter": d.is_rubber_otter
                }
                for d in devices
            ]
        }

    def _tool_status(self) -> Dict[str, Any]:
        client = self.client
        is_conn = bool(client.is_connected)
        port = str(client.port) if client.port is not None else None
        return {
            "connected": is_conn,
            "port": port,
            "protocol_mode": "framed_ascii",
            "device_type": "ATmega32U4 BLE HID",
            "status": "ready" if is_conn else "standby"
        }
