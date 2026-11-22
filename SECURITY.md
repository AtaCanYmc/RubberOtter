# Security Policy

## Supported Versions

Security fixes apply to the current unified release line (`v1.4.x`) across all components in this repository.

| Component | Path | Active Version | Supported |
| :--- | :--- | :--- | :--- |
| ATmega32U4 Firmware | `firmware/` | `1.4.x` | Yes |
| Web Serial Flasher Site | `site/` | `1.4.x` | Yes |
| Python SDK, CLI, and MCP | `python/` | `1.4.x` | Yes |
| Legacy Releases | All | `< 1.4.0` | No |

Security issues in the standalone control PWA or Capacitor mobile apps should be reported in [AtaCanYmc/RubberDeck](https://github.com/AtaCanYmc/RubberDeck).

## Threat Model and Boundaries

RubberOtter emulates a wired USB Human Interface Device (HID) that accepts commands over BLE GATT (`0xFFE0`/`0xFFE1`) via an HM-10 or ESP32 bridge and over USB CDC Serial. Actionable vulnerabilities include:

- Buffer overflow or memory corruption in the ATmega32U4 UART ring buffer or packet parser.
- Command injection or state corruption from malformed STX/ETX frames.
- Remote denial-of-service causing MCU lockups without physical reset.
- Code execution or exception information exposure in the Python SDK, MCP server, or local Flask API (`python/rubberotter/web/server.py`).

Unencrypted BLE pairing on stock HM-10 modules is a known hardware constraint. Physical proximity controls or authenticated ESP32 bridges are required in untrusted RF environments.

## Reporting a Vulnerability

Do not open public GitHub issues for security vulnerabilities.

Use one of these private channels:

1. **GitHub Security Advisories (Preferred):** https://github.com/AtaCanYmc/RubberOtter/security/advisories/new
2. **Email:** `atacanymc@gmail.com` with subject `[SECURITY] RubberOtter Vulnerability Report`

Include:

- Affected component and version.
- Minimal reproduction steps, raw frame bytes, or Python proof-of-concept script.
- Expected versus observed behavior and impact assessment.

## Response SLA

| Milestone | Target Window |
| :--- | :--- |
| Initial Acknowledgement | Within 48 hours |
| Triage and Assessment | Within 5 business days |
| Patch Development and Verification | Within 14 calendar days |
| Coordinated Release | Next Release Please tag |
