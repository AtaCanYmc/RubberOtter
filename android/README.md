[← Back to Root Repository](../README.md)

# Rubber Otter Android Application

Native Android wrapper and build target for the Rubber Otter workstation, packaged using Ionic Capacitor 8 and Gradle.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Build Instructions](#build-instructions)
- [Permissions and Native Services](#permissions-and-native-services)
- [Syncing Web Assets](#syncing-web-assets)
- [Troubleshooting](#troubleshooting)

## Overview

The Android package wraps the Progressive Web App distribution in an optimized WebView while delegating Bluetooth Low Energy transport and haptic vibrations to native Android services:

- **Bluetooth Low Energy**: Uses `@capacitor-community/bluetooth-le` to access native Android BLE GATT client APIs.
- **Haptic Engine**: Uses `@capacitor/haptics` to interface with the Android `Vibrator` system service.
- **Status Bar**: Uses `@capacitor/status-bar` to provide edge-to-edge styling matching active application themes.

## Prerequisites

- JDK 21 (required by Gradle 8.11.1 and Android Gradle Plugin 8.7.2).
- Android SDK with API Level 35 (compileSdk) and minimum API Level 23 (minSdk).
- Android Studio Ladybug or later (optional, for GUI development and debugging).

## Build Instructions

### 1. Build Debug APK via Command Line

```bash
# From the repository root
make build-android

# Or directly within this directory
./gradlew assembleDebug
```

The compiled APK is placed at `app/build/outputs/apk/debug/app-debug.apk` and copied to `../dist/android/RubberOtter-debug.apk`.

### 2. Build Release APK

```bash
./gradlew assembleRelease
```

Release builds require signing credentials configured in `gradle.properties` or environment variables before store deployment.

### 3. Open in Android Studio

```bash
# From repository root
make mobile-android

# Or launch Android Studio directly
open -a "Android Studio" android
```

## Permissions and Native Services

The application declares the following permissions in `app/src/main/AndroidManifest.xml`:

| Permission | Purpose | Target SDK Scope |
| :--- | :--- | :--- |
| `android.permission.BLUETOOTH_SCAN` | Discover nearby HM-10 and ESP32 BLE peripherals. | Android 12+ (API 31+) |
| `android.permission.BLUETOOTH_CONNECT` | Establish GATT connection and subscribe to characteristics. | Android 12+ (API 31+) |
| `android.permission.ACCESS_FINE_LOCATION` | Required for BLE beacon discovery on legacy Android versions. | Android 11 and lower |
| `android.permission.VIBRATE` | Trigger tactile feedback pulses on command execution. | All versions |
| `android.permission.INTERNET` | Load local WebView assets and external firmware metadata. | All versions |

## Syncing Web Assets

When changes are made to the web interface in `../web/`, regenerate the web distribution and sync the native assets:

```bash
cd ../web
npm run cap:sync
```

## Troubleshooting

### JDK Version Incompatibility
Gradle 8.7+ requires Java 21. If compilation errors cite `Unsupported class file major version`, verify your active Java runtime:

```bash
java -version
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
```

### BLE Device Scan Returns Empty
Ensure Location and Nearby Devices permissions are granted in Android System Settings under **Apps > Rubber Otter > Permissions**.
