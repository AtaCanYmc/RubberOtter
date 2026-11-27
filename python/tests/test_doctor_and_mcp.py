import json

from rubberotter.mcp.server import MCPServer


def test_mcp_structured_error_response():
    srv = MCPServer(client=None)
    resp = srv._error_response(1, -32602, "Invalid param", error_code="ERR_INVALID_PARAMS", retryable=False)
    assert resp["error"]["code"] == -32602
    assert resp["error"]["data"]["error_code"] == "ERR_INVALID_PARAMS"
    assert resp["error"]["data"]["retryable"] is False


def test_mcp_retryable_error_response():
    srv = MCPServer(client=None)
    resp = srv._error_response(2, -32000, "Timeout", error_code="ERR_TIMEOUT", retryable=True)
    assert resp["error"]["data"]["retryable"] is True
    assert json.dumps(resp)
