# RubberOtter Caterina Web Serial Flasher (`site/`)

[Back to Repository Root](../README.md)

Zero-build static HTML, CSS, and JavaScript application deployed to GitHub Pages (`https://atacanymc.github.io/RubberOtter/`).

## Capabilities

- Triggers the 1200 bps Caterina bootloader reset over the browser Web Serial API (Chromium-based browsers).
- Streams compiled `.hex` firmware files to ATmega32U4 boards (Arduino Leonardo, SparkFun Pro Micro).
- Provides an offline RubberOtter v1 packet simulator.

## Local Preview

```bash
python3 -m http.server 8080 --directory site
```
