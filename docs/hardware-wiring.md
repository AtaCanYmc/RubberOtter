# 🔌 Rubber Otter — Hardware Wiring & Schematics

This document describes the circuit design and wiring pinout for building a Rubber Otter HID device using an **ATmega32U4** board (SparkFun Pro Micro 5V/16MHz or Arduino Leonardo), **HM-10 / BT05 BLE Module**, and an optional **Vibration Motor**.

---

## 📐 Circuit Schematic

```mermaid
graph LR
    subgraph HM10["HM-10 / BT05 BLE Module"]
        HM_TX["TX Pin"]
        HM_RX["RX Pin"]
        HM_VCC["VCC (3.3V)"]
        HM_GND["GND"]
    end

    subgraph Divider["Resistor Voltage Divider (5V -> 3.3V)"]
        R1["Resistor 1kΩ"]
        R2["Resistor 2kΩ"]
    end

    subgraph MCU["ATmega32U4 (Pro Micro / Leonardo)"]
        MCU_RX1["Pin 0 (RX1)"]
        MCU_TX1["Pin 1 (TX1)"]
        MCU_VIB["Pin 2 (GPIO)"]
        MCU_VCC["VCC (5V / RAW)"]
        MCU_3V3["3.3V Pin"]
        MCU_GND["GND"]
        MCU_USB["Micro USB Port"]
    end

    subgraph Haptic["Haptic Vibration Motor"]
        VIB_SIG["Base / Gate Driver"]
        VIB_MOTOR["Coin Vibration Motor"]
    end

    subgraph HostPC["Target Host Computer"]
        PC_USB["USB Port (Emulated HID)"]
    end

    MCU_3V3 -->|"Power 3.3V"| HM_VCC
    MCU_GND -->|"Ground"| HM_GND
    HM_TX -->|"3.3V Logic directly"| MCU_RX1
    MCU_TX1 -->|"5V Signal"| R1
    R1 -->|"3.3V Divided"| HM_RX
    R1 --> R2
    R2 --> MCU_GND

    MCU_VIB -->|"GPIO Pulse"| VIB_SIG
    VIB_SIG --> VIB_MOTOR

    MCU_USB <-->|"USB HID + 5V Power"| PC_USB

    style HM10 fill:#0f172a,stroke:#06b6d4,stroke-width:2px,color:#f8fafc
    style Divider fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#f8fafc
    style MCU fill:#064e3b,stroke:#34d399,stroke-width:2px,color:#f8fafc
    style Haptic fill:#4c1d95,stroke:#c084fc,stroke-width:2px,color:#f8fafc
    style HostPC fill:#701a75,stroke:#f472b6,stroke-width:2px,color:#f8fafc
```

---

## 📌 Pinout Mapping Table

| Component | Pin | Pro Micro / Leonardo Pin | Notes |
| :--- | :--- | :--- | :--- |
| **HM-10 BLE** | `VCC` | `3.3V` (or `VCC` if 5V tolerant) | Ensure module voltage compatibility |
| **HM-10 BLE** | `GND` | `GND` | Common ground |
| **HM-10 BLE** | `TX` | `Pin 0 (RX1)` | Direct connection (3.3V logic is read reliably by 5V ATmega32U4) |
| **HM-10 BLE** | `RX` | `Pin 1 (TX1)` via Divider | **Must protect HM-10 RX pin** with $1\text{k}\Omega / 2\text{k}\Omega$ divider from 5V TX1 |
| **Haptic Motor**| `SIG` | `Pin 2` | Active HIGH digital output (use 2N2222 NPN or MOSFET) |
| **Status LED** | `Built-in` | `Pin 17 (RXLED) / Pin 30 (TXLED)` | Hardware activity indication |

---

## ⚠️ Safety Guidelines

> [!CAUTION]
> **5V Logic Warning**: ATmega32U4 outputs 5V signals on digital pins. Directly connecting Pro Micro Pin 1 (TX1) to HM-10 RX pin without a voltage divider can permanently damage the Bluetooth module's receiver IC.
