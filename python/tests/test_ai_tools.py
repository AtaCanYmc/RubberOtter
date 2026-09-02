"""Tests for Rubber Otter AI Tool Registry and Schema Exporters."""

import unittest
from unittest.mock import MagicMock, patch

from rubberotter.ai.tools import RubberOtterToolRegistry, ToolDefinition
from rubberotter.protocol import KEY_ENTER, KEY_GUI_L, KEY_F5


class TestAiTools(unittest.TestCase):

    def setUp(self):
        self.mock_client = MagicMock()
        self.registry = RubberOtterToolRegistry(client=self.mock_client)

    def test_list_default_tools(self):
        tools = self.registry.list_tools()
        self.assertGreaterEqual(len(tools), 13)
        names = [t.name for t in tools]
        self.assertIn("rubberotter_type", names)
        self.assertIn("rubberotter_key_combo", names)
        self.assertIn("rubberotter_mouse_move", names)
        self.assertIn("rubberotter_mouse_click", names)
        self.assertIn("rubberotter_mouse_scroll", names)
        self.assertIn("rubberotter_media", names)
        self.assertIn("rubberotter_presenter", names)
        self.assertIn("rubberotter_lock", names)
        self.assertIn("rubberotter_jiggler", names)
        self.assertIn("rubberotter_vibrate", names)
        self.assertIn("rubberotter_macro", names)
        self.assertIn("rubberotter_scan", names)
        self.assertIn("rubberotter_status", names)

    def test_tool_schema_export_mcp(self):
        tool = self.registry.get_tool("rubberotter_type")
        self.assertIsNotNone(tool)
        mcp_schema = tool.to_mcp_tool()
        self.assertEqual(mcp_schema["name"], "rubberotter_type")
        self.assertIn("properties", mcp_schema["inputSchema"])
        self.assertIn("text", mcp_schema["inputSchema"]["properties"])
        self.assertIn("auto_enter", mcp_schema["inputSchema"]["properties"])

    def test_tool_schema_export_openai(self):
        tool = self.registry.get_tool("rubberotter_type")
        self.assertIsNotNone(tool)
        openai_schema = tool.to_openai_tool()
        self.assertEqual(openai_schema["type"], "function")
        self.assertEqual(openai_schema["function"]["name"], "rubberotter_type")
        self.assertIn("parameters", openai_schema["function"])

    def test_tool_schema_export_anthropic(self):
        tool = self.registry.get_tool("rubberotter_mouse_move")
        self.assertIsNotNone(tool)
        anthropic_schema = tool.to_anthropic_tool()
        self.assertEqual(anthropic_schema["name"], "rubberotter_mouse_move")
        self.assertIn("input_schema", anthropic_schema)

    def test_execute_type(self):
        res = self.registry.execute("rubberotter_type", {"text": "hello world", "auto_enter": True})
        self.assertTrue(res["success"])
        self.mock_client.type.assert_called_once_with("hello world")
        self.mock_client.press_key.assert_called_once_with(KEY_ENTER)

    def test_execute_key_combo(self):
        res = self.registry.execute("rubberotter_key_combo", {"key": "f5"})
        self.assertTrue(res["success"])
        self.mock_client.press_key.assert_called_once_with(KEY_F5)

    def test_execute_mouse_move(self):
        res = self.registry.execute("rubberotter_mouse_move", {"dx": 50, "dy": -30})
        self.assertTrue(res["success"])
        self.mock_client.mouse_move.assert_called_once_with(50, -30)

    def test_execute_mouse_click(self):
        res = self.registry.execute("rubberotter_mouse_click", {"button": "right"})
        self.assertTrue(res["success"])
        self.mock_client.mouse_right_click.assert_called_once()

    def test_execute_mouse_scroll(self):
        res = self.registry.execute("rubberotter_mouse_scroll", {"direction": "down", "steps": 3})
        self.assertTrue(res["success"])
        self.assertEqual(self.mock_client.mouse_scroll_down.call_count, 3)

    def test_execute_media(self):
        res = self.registry.execute("rubberotter_media", {"action": "vol_up"})
        self.assertTrue(res["success"])
        self.mock_client.media_vol_up.assert_called_once()

    def test_execute_presenter(self):
        res = self.registry.execute("rubberotter_presenter", {"action": "next_slide"})
        self.assertTrue(res["success"])
        self.mock_client.pres_next_slide.assert_called_once()

    def test_execute_lock_and_jiggler(self):
        res_lock = self.registry.execute("rubberotter_lock", {})
        self.assertTrue(res_lock["success"])
        self.mock_client.sec_lock.assert_called_once()

        res_jig = self.registry.execute("rubberotter_jiggler", {})
        self.assertTrue(res_jig["success"])
        self.mock_client.jiggler_toggle.assert_called_once()

    def test_execute_vibrate(self):
        res = self.registry.execute("rubberotter_vibrate", {"duration_ms": 250})
        self.assertTrue(res["success"])
        self.mock_client.vibrate.assert_called_once_with(250)

    def test_execute_macro(self):
        res = self.registry.execute("rubberotter_macro", {"macro_name": "cs_buy"})
        self.assertTrue(res["success"])
        self.mock_client.game_cs_buy.assert_called_once()

    def test_execute_status(self):
        self.mock_client.is_connected = True
        self.mock_client.port = "/dev/cu.usbmodem1101"
        res = self.registry.execute("rubberotter_status", {})
        self.assertTrue(res["connected"])
        self.assertEqual(res["port"], "/dev/cu.usbmodem1101")

    def test_unknown_tool_raises_error(self):
        with self.assertRaises(ValueError):
            self.registry.execute("non_existent_tool", {})


if __name__ == "__main__":
    unittest.main()
