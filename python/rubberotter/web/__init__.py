"""
Rubber Otter Web Application Package
Provides embedded Web Dashboard and REST API server.
"""

from .server import create_app, run_server

__all__ = ["create_app", "run_server"]
