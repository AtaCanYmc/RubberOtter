"""Model Context Protocol (MCP) Server for Rubber Otter.

Provides standard JSON-RPC 2.0 stdio MCP server for Claude Desktop, Cursor,
Windsurf, Antigravity, and autonomous AI agents.
"""

from __future__ import annotations

import asyncio
import json
import logging
import sys
from typing import Any, Dict, List, Optional

from rubberotter.ai.tools import RubberOtterToolRegistry, ToolDefinition
from rubberotter.client import RubberOtter

logger = logging.getLogger("rubberotter.mcp")

SERVER_NAME = "rubberotter-mcp"
SERVER_VERSION = "1.2.0"
PROTOCOL_VERSION = "2024-11-05"


class RubberOtterMcpServer:
    """Standard Model Context Protocol (MCP) Server for Rubber Otter."""

    def __init__(self, client: Optional[RubberOtter] = None) -> None:
        self.registry = RubberOtterToolRegistry(client=client)
        self._prompts = self._init_prompts()
        self._resources = self._init_resources()

    def _init_prompts(self) -> Dict[str, Dict[str, Any]]:
        return {
            "automate_terminal_task": {
                "name": "automate_terminal_task",
                "description": "Template prompt for writing and executing a terminal shell automation workflow via Rubber Otter.",
                "arguments": [
                    {
                        "name": "task_description",
                        "description": "Description of the terminal task or script to execute.",
                        "required": True
                    },
                    {
                        "name": "target_os",
                        "description": "Target computer OS ('macos', 'windows', or 'linux').",
                        "required": False
                    }
                ]
            },
            "emergency_screen_lock": {
                "name": "emergency_screen_lock",
                "description": "Template prompt for immediate workstation security lockdown.",
                "arguments": []
            },
            "mouse_jiggler_routine": {
                "name": "mouse_jiggler_routine",
                "description": "Template prompt to start non-blocking periodic mouse jiggling.",
                "arguments": []
            }
        }

    def _init_resources(self) -> Dict[str, Dict[str, Any]]:
        return {
            "rubberotter://status": {
                "uri": "rubberotter://status",
                "name": "Rubber Otter Hardware Status",
                "description": "Live JSON state snapshot of connection status, port, and protocol telemetry.",
                "mimeType": "application/json"
            }
        }

    async def handle_request(self, message: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Processes a single JSON-RPC 2.0 message."""
        msg_id = message.get("id")
        method = message.get("method")
        params = message.get("params", {})

        if not method:
            return self._error_response(msg_id, -32600, "Invalid Request: missing method")

        try:
            # 1. Lifecycle: Initialize
            if method == "initialize":
                return self._success_response(msg_id, {
                    "protocolVersion": PROTOCOL_VERSION,
                    "serverInfo": {
                        "name": SERVER_NAME,
                        "version": SERVER_VERSION
                    },
                    "capabilities": {
                        "tools": {},
                        "prompts": {},
                        "resources": {}
                    }
                })

            # 2. Lifecycle: Initialized Notification
            elif method == "notifications/initialized":
                logger.info("MCP Client initialized successfully.")
                return None

            # 3. Ping
            elif method == "ping":
                return self._success_response(msg_id, {})

            # 4. Tools: List
            elif method == "tools/list":
                tools = [tool.to_mcp_tool() for tool in self.registry.list_tools()]
                return self._success_response(msg_id, {"tools": tools})

            # 5. Tools: Call
            elif method == "tools/call":
                tool_name = params.get("name")
                tool_args = params.get("arguments", {})

                if not tool_name:
                    return self._error_response(msg_id, -32602, "Missing tool name in tools/call")

                try:
                    result = self.registry.execute(tool_name, tool_args)
                    formatted_text = json.dumps(result, indent=2) if isinstance(result, (dict, list)) else str(result)
                    return self._success_response(msg_id, {
                        "content": [
                            {
                                "type": "text",
                                "text": formatted_text
                            }
                        ],
                        "isError": False
                    })
                except Exception as ex:
                    return self._success_response(msg_id, {
                        "content": [
                            {
                                "type": "text",
                                "text": f"Error executing tool '{tool_name}': {str(ex)}"
                            }
                        ],
                        "isError": True
                    })

            # 6. Prompts: List
            elif method == "prompts/list":
                return self._success_response(msg_id, {
                    "prompts": list(self._prompts.values())
                })

            # 7. Prompts: Get
            elif method == "prompts/get":
                name = params.get("name")
                args = params.get("arguments", {})
                if name == "automate_terminal_task":
                    task = args.get("task_description", "Execute automated script")
                    target_os = args.get("target_os", "target OS")
                    text = f"You are controlling a {target_os} computer via Rubber Otter USB HID.\nTask: {task}\nUse `rubberotter_type` to inject terminal commands."
                elif name == "emergency_screen_lock":
                    text = "Immediately lock the workstation screen using `rubberotter_lock` and trigger a short haptic pulse with `rubberotter_vibrate`."
                elif name == "mouse_jiggler_routine":
                    text = "Activate the background mouse jiggler using `rubberotter_jiggler` to prevent system sleep."
                else:
                    return self._error_response(msg_id, -32602, f"Unknown prompt: {name}")

                return self._success_response(msg_id, {
                    "description": self._prompts[name]["description"],
                    "messages": [
                        {
                            "role": "user",
                            "content": {
                                "type": "text",
                                "text": text
                            }
                        }
                    ]
                })

            # 8. Resources: List
            elif method == "resources/list":
                return self._success_response(msg_id, {
                    "resources": list(self._resources.values())
                })

            # 9. Resources: Read
            elif method == "resources/read":
                uri = params.get("uri")
                if uri == "rubberotter://status":
                    status_data = self.registry.execute("rubberotter_status", {})
                    return self._success_response(msg_id, {
                        "contents": [
                            {
                                "uri": uri,
                                "mimeType": "application/json",
                                "text": json.dumps(status_data, indent=2)
                            }
                        ]
                    })
                else:
                    return self._error_response(msg_id, -32602, f"Resource not found: {uri}")

            else:
                return self._error_response(msg_id, -32601, f"Method not found: {method}")

        except Exception as ex:
            logger.exception("Error processing MCP message: %s", ex)
            return self._error_response(msg_id, -32603, f"Internal error: {str(ex)}")

    def _success_response(self, msg_id: Any, result: Any) -> Dict[str, Any]:
        return {
            "jsonrpc": "2.0",
            "id": msg_id,
            "result": result
        }

    def _error_response(self, msg_id: Any, code: int, message: str) -> Dict[str, Any]:
        return {
            "jsonrpc": "2.0",
            "id": msg_id,
            "error": {
                "code": code,
                "message": message
            }
        }


async def run_stdio_server(client: Optional[RubberOtter] = None) -> None:
    """Runs the MCP server reading from standard input and writing to standard output."""
    server = RubberOtterMcpServer(client=client)

    loop = asyncio.get_running_loop()
    reader = asyncio.StreamReader()
    protocol = asyncio.StreamReaderProtocol(reader)
    await loop.connect_read_pipe(lambda: protocol, sys.stdin)

    while True:
        try:
            line = await reader.readline()
            if not line:
                break
            raw_text = line.decode("utf-8").strip()
            if not raw_text:
                continue

            try:
                message = json.loads(raw_text)
            except json.JSONDecodeError:
                err_resp = {"jsonrpc": "2.0", "id": None, "error": {"code": -32700, "message": "Parse error"}}
                sys.stdout.write(json.dumps(err_resp) + "\n")
                sys.stdout.flush()
                continue

            response = await server.handle_request(message)
            if response is not None:
                sys.stdout.write(json.dumps(response) + "\n")
                sys.stdout.flush()
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error("Unexpected error in stdio server: %s", e)
            break
