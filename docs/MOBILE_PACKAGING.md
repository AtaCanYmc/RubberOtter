# 📱 Rubber Otter Native Mobile Packaging Guide (Ionic Capacitor)

Rubber Otter features full native packaging support via **Ionic Capacitor**, allowing the React PWA to be distributed as native applications on **Apple iOS (App Store)** and **Google Android (Google Play Store)** with native Bluetooth Low Energy and hardware haptic engine integration.

---

## 🏗️ Architecture & Native Capabilities

| Feature | Web Browser (PWA) | iOS Native (Capacitor) | Android Native (Capacitor) |
| :--- | :--- | :--- | :--- |
| **Bluetooth Engine** | Web Bluetooth API (Chrome/Edge) | Native CoreBluetooth (`@capacitor-community/bluetooth-le`) | Native Android Bluetooth LE API |
| **Haptics** | Web Vibration API (`navigator.vibrate`) | iOS Taptic Engine (`@capacitor/haptics`) | Android Vibrator Service |
| **Status Bar** | Browser Chrome | Safe-Area Native Edge-to-Edge (`@capacitor/status-bar`) | Adaptive Translucent Navigation Bar |
| **Store Distribution** | Web Link / PWA Install | Apple App Store / TestFlight | Google Play Store / APK / AAB |

---

## ⚡ Quick Start

### 1. Build and Sync Web Assets
```bash
# From root repository directory:
make mobile-sync

# Or from web directory:
cd web
npm run cap:sync
```

---

## 🍎 iOS Setup & App Store Release

### Prerequisites
- macOS machine with **Xcode 15+** installed.
- Apple Developer Account (for device deployment and App Store submission).
- CocoaPods / Swift Package Manager (managed automatically by Capacitor).

### Local Development & Simulator
```bash
# Open native iOS workspace in Xcode
make mobile-ios
# or: cd web && npm run cap:open:ios
```
1. In Xcode, select your target device or iOS Simulator (e.g. *iPhone 16 Pro*).
2. Click **Run** (`Cmd + R`).

### App Store / TestFlight Release Steps
1. In Xcode, select **App** in the project navigator.
2. Under **Signing & Capabilities**, select your Apple Developer Team.
3. Verify Bundle Identifier: `com.rubberotter.app`.
4. Go to menu **Product** → **Archive**.
5. When the Organizer window appears, select the archive and click **Distribute App** → **App Store Connect**.

---

## 🤖 Android Setup & Google Play Release

### Prerequisites
- **Android Studio Iguana / Jellyfish+** installed.
- Android SDK Platform 34+ and Build-Tools.

### Local Development & Emulator
```bash
# Open native Android project in Android Studio
make mobile-android
# or: cd web && npm run cap:open:android
```
1. Android Studio will automatically index and sync Gradle dependencies.
2. Select your connected Android device or Android Virtual Device (AVD).
3. Click **Run** (`Shift + F10`).

### Production Release (APK & Google Play AAB)
```bash
cd web/android
./gradlew bundleRelease # Generates Google Play .aab bundle
# or
./gradlew assembleRelease # Generates standalone .apk
```
Output files will be generated under:
- `web/android/app/build/outputs/bundle/release/app-release.aab` (For Google Play Store Console)
- `web/android/app/build/outputs/apk/release/app-release-unsigned.apk`

---

## 🔐 Permissions Reference

### iOS (`Info.plist`)
- `NSBluetoothAlwaysUsageDescription`: Required for CoreBluetooth discovery and background communication.
- `NSBluetoothPeripheralUsageDescription`: Required for peripheral connection.

### Android (`AndroidManifest.xml`)
- `android.permission.BLUETOOTH_SCAN`: Bluetooth scanning on Android 12+ (API 31+).
- `android.permission.BLUETOOTH_CONNECT`: Connecting to paired BLE devices on Android 12+.
- `android.permission.ACCESS_FINE_LOCATION`: Required on Android 6.0 - 11 for Bluetooth scanning.
- `android.permission.VIBRATE`: Tactile haptic feedback pulses.
