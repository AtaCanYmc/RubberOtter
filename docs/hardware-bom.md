# Hardware Bill of Materials (BOM) & 3D Enclosure

[Back to Repository Root](../README.md) · [Hardware Wiring](hardware-wiring.md)

## Bill of Materials

| Qty | Component | Specification | Notes |
| :---: | :--- | :--- | :--- |
| 1 | **ATmega32U4 Board** | SparkFun Pro Micro (5V / 16 MHz) or Arduino Leonardo | Native USB HID + Serial1 UART |
| 1 | **BLE Module** | HM-10 or BT05 (CC2541, 3.3V logic) | Default 9600 baud; GATT `0xFFE0`/`0xFFE1` |
| 1 | **Resistor (R1)** | 1 kΩ, 1/4 W | 5V TX1 → HM-10 RX voltage divider |
| 1 | **Resistor (R2)** | 2 kΩ, 1/4 W | 5V TX1 → HM-10 RX voltage divider |
| 1 | **Vibration Motor** | 3V–5V Coin Vibration Motor (10 mm × 2.7 mm) | Optional haptic feedback on Pin 2 |
| 1 | **Driver Transistor** | 2N2222 NPN or logic-level N-MOSFET | Drives motor from GPIO Pin 2 |
| 1 | **USB Cable** | Micro-USB or USB-C (data-capable) | Matches Pro Micro connector |

## 3D-Printable Enclosure (`hardware/enclosure/`)

| Part | File | Print Settings |
| :--- | :--- | :--- |
| Top Shell | [otter-top.stl](../hardware/enclosure/otter-top.stl) | PLA/PETG, 0.2 mm layer height, 20% infill |
| Bottom Base | [ro-bottom.stl](../hardware/enclosure/ro-bottom.stl) | PLA/PETG, 0.2 mm layer height, 20% infill |
