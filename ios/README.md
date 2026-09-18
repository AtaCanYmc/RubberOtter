[← Back to Root Repository](../README.md)

# Rubber Otter iOS Application

Native iOS wrapper and build target for the Rubber Otter workstation, packaged using Ionic Capacitor 8, Swift Package Manager (SPM), and Xcode.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Build Instructions](#build-instructions)
- [Entitlements and Permissions](#entitlements-and-permissions)
- [Syncing Web Assets](#syncing-web-assets)
- [Sideloading and Deployment](#sideloading-and-deployment)

## Overview

The iOS package bundles the Progressive Web App distribution in an optimized WKWebView while bridging Bluetooth Low Energy transport and haptics to native iOS frameworks:

- **CoreBluetooth**: Bypasses Safari Web Bluetooth limitations by establishing direct CoreBluetooth GATT communication with HM-10 and ESP32 peripherals.
- **Taptic Engine**: Uses `@capacitor/haptics` to interface with `UIFeedbackGenerator` for tactile input feedback.
- **Status Bar**: Configured via `@capacitor/status-bar` to support dark mode transition and notch styling.

## Prerequisites

- macOS Sonoma 14+ or Sequoia 15+.
- Xcode 15.0 or later with iOS 17+ SDK.
- Swift Package Manager (managed automatically through Xcode project).
- CocoaPods is not required; dependencies use Capacitor Swift Package Manager (`CapApp-SPM`).

## Build Instructions

### 1. Build Unsigned Application Bundle via CLI

```bash
# From repository root
make build-ios

# Direct xcodebuild invocation
xcodebuild -project ios/App/App.xcodeproj \
  -scheme App \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -derivedDataPath ios/build \
  build CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO
```

The resulting application bundle is staged at `build/Build/Products/Release-iphoneos/App.app` and copied to `../dist/ios/RubberOtter.app`.

### 2. Package for Sideloading (ZIP and IPA)

```bash
# From repository root
make package-ios
```

This generates:
- `../dist/ios/RubberOtter-iOS.app.zip`: Unsigned raw application bundle.
- `../dist/ios/RubberOtter-iOS-unsigned.ipa`: Packaged unsigned IPA ready for sideloading tools.

### 3. Open in Xcode

```bash
# From repository root
make mobile-ios

# Or launch directly
open App/App.xcodeproj
```

## Entitlements and Permissions

The application configures the following permissions in `App/App/Info.plist`:

| Key | Purpose |
| :--- | :--- |
| `NSBluetoothAlwaysUsageDescription` | Required to communicate with HM-10 and ESP32 BLE modules for HID command injection. |
| `NSBluetoothPeripheralUsageDescription` | Legacy fallback for peripheral role negotiation. |

## Syncing Web Assets

When modifying interface components in `../web/`, recompile the web bundle and sync native Capacitor assets:

```bash
cd ../web
npm run cap:sync
```

## Sideloading and Deployment

### Sideloading Tools
The unsigned `.ipa` can be signed and installed onto physical devices using:
- **AltStore / AltServer**: Personal Apple ID certificate signing.
- **Sideloadly**: Direct sideloading over USB or local Wi-Fi.
- **TrollStore**: Persistent installation on compatible iOS versions.

### iOS Simulator Installation
To run on a booted iOS simulator without code signing:

```bash
xcrun simctl install booted ../dist/ios/RubberOtter.app
xcrun simctl launch booted com.rubberotter.app
```
