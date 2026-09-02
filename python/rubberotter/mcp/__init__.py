"""Model Context Protocol (MCP) Server for Rubber Otter."""

from rubberotter.mcp.server import (
    RubberOtterMcpServer,
    run_stdio_server,
)

__all__ = [
    "RubberOtterMcpServer",
    "run_stdio_server",
]
