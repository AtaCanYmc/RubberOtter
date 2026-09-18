# Security Policy

## Supported Versions

Security updates are applied to active release lines across repository components.

| Component | Active Version | Supported |
| :--- | :--- | :--- |
| Firmware (`firmware/`) | 1.0.x | Supported |
| Web Workstation (`web/`) | 2.4.x | Supported |
| Android App (`android/`) | 1.0.x | Supported |
| iOS App (`ios/`) | 1.0.x | Supported |
| Python SDK (`python/`) | 1.3.x | Supported |
| Legacy Builds | < 1.0.0 | Unsupported |

## Threat Model and Boundaries

Rubber Otter operates as an emulated USB Human Interface Device (HID) receiving commands via Bluetooth Low Energy (HM-10 or ESP32) and USB CDC Serial. Maintainers treat the following scenarios as actionable security vulnerabilities:

- Buffer overflow or memory corruption in the firmware ring buffer or packet parser.
- Arbitrary command injection or state corruption via malformed STX/ETX frames.
- Remote denial-of-service affecting MCU responsiveness without physical access.
- Code execution flaws within the Python SDK or OtterDeck local web service.

Physical proximity attacks stemming from unencrypted BLE pairing on default HM-10 hardware are documented architectural trade-offs. Hardening guidance is detailed in repository documentation.

## Reporting a Vulnerability

Do not report security vulnerabilities through public GitHub issues or discussions.

Report vulnerabilities through one of the following private channels:

1. **GitHub Security Advisories (Preferred)**: Submit a private advisory report at [https://github.com/AtaCanYmc/RubberOtter/security/advisories/new](https://github.com/AtaCanYmc/RubberOtter/security/advisories/new).
2. **Direct Email**: Send reports to `atacanymc@gmail.com` with the subject line `[SECURITY] RubberOtter Vulnerability Report`.

### Report Requirements

Please include the following information in your report:

- Affected component and version.
- Detailed reproduction steps, including raw byte sequences or Python proof-of-concept scripts.
- Expected versus observed behavior.
- Assessment of impact and exploitability.

## Response SLA

Maintainers adhere to the following disclosure timeline:

| Milestone | Target Window |
| :--- | :--- |
| Initial Acknowledgement | Within 48 hours |
| Vulnerability Assessment and Triage | Within 5 business days |
| Patch Development and Verification | Within 14 calendar days |
| Coordinated Public Release | Upon release deployment via Release Please |
