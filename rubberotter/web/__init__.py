"""
Rubber Otter Web Application Package
Provides embedded Web Dashboard and REST API server.
"""

from .server import run_server, create_app

__all__ = ["run_server", "create_app"]
