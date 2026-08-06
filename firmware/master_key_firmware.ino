/*
 * Master-Key Bluetooth HID Bridge Firmware
 * Target Microcontroller: Arduino Pro Micro (ATmega32U4) / Leonardo
 * Bluetooth Module: HM-10 BLE connected to Hardware Serial (Serial1) @ 9600 Baud
 * 
 * Hardware Wiring:
 *   Arduino Pro Micro Pin 0 (RX1) <---> HM-10 TX
 *   Arduino Pro Micro Pin 1 (TX1) <---> HM-10 RX (via 5V to 3.3V voltage divider if needed)
 *   Arduino Pro Micro VCC         <---> HM-10 VCC (3.3V or 5V depending on HM-10 breakout)
 *   Arduino Pro Micro GND         <---> HM-10 GND
 */

#include <Keyboard.h>
#include <Mouse.h>

// Fallback Media Key Definitions for compatibility across Arduino core versions
#ifndef KEY_MEDIA_PLAY_PAUSE
  #define KEY_MEDIA_PLAY_PAUSE 0xE8
#endif
#ifndef KEY_MEDIA_VOLUME_UP
  #define KEY_MEDIA_VOLUME_UP 0xE9
#endif
#ifndef KEY_MEDIA_VOLUME_DOWN
  #define KEY_MEDIA_VOLUME_DOWN 0xEA
#endif
#ifndef KEY_MEDIA_NEXT_TRACK
  #define KEY_MEDIA_NEXT_TRACK 0xEB
#endif
#ifndef KEY_MEDIA_PREVIOUS_TRACK
  #define KEY_MEDIA_PREVIOUS_TRACK 0xEC
#endif
#ifndef KEY_MEDIA_MUTE
  #define KEY_MEDIA_MUTE 0xED
#endif

// Status & State Variables
bool jigglerActive = false;
unsigned long lastJiggleTime = 0;
const unsigned long JIGGLE_INTERVAL_MS = 20000; // Jiggle mouse every 20 seconds when active

// Serial Communication Timeout for Multi-Byte Packets
const unsigned long PACKET_TIMEOUT_MS = 50;

void setup() {
  // Initialize Hardware UART for HM-10 Bluetooth Module
  Serial1.begin(9600);
  
  // Optional USB CDC Serial Debug Output
  Serial.begin(115200);

  // Initialize HID Drivers
  Keyboard.begin();
  Mouse.begin();

  // Onboard LED indicator (Pin 17 / RX LED on Pro Micro)
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, LOW); // LED Off initially
}

void loop() {
  // 1. Process Incoming Commands from HM-10 BLE over Serial1
  if (Serial1.available() > 0) {
    uint8_t commandByte = Serial1.read();
    
    // Pulse builtin LED to visually indicate command reception
    digitalWrite(LED_BUILTIN, HIGH);
    
    handleCommand(commandByte);
    
    digitalWrite(LED_BUILTIN, LOW);
  }

  // 2. Non-blocking Mouse Jiggler State Management (using millis())
  if (jigglerActive) {
    unsigned long currentMillis = millis();
    if (currentMillis - lastJiggleTime >= JIGGLE_INTERVAL_MS) {
      lastJiggleTime = currentMillis;
      
      // Perform subtle micro-movements to reset system idle timer
      Mouse.move(1, 0, 0);
      delay(30);
      Mouse.move(-1, 0, 0);

      if (Serial) {
        Serial.println(F("[Jiggler] Micro-movement executed."));
      }
    }
  }
}

/**
 * Single-Byte Protocol Handler (0x00 - 0xFF)
 */
void handleCommand(uint8_t cmd) {
  if (Serial) {
    Serial.print(F("[Protocol] Received Command Byte: 0x"));
    Serial.println(cmd, HEX);
  }

  switch (cmd) {
    // ----------------------------------------------------
    // 1. MEDIA MODE (0x10 - 0x1F)
    // ----------------------------------------------------
    case 0x11: // Play / Pause
      Keyboard.write(KEY_MEDIA_PLAY_PAUSE);
      break;

    case 0x12: // Next Track
      Keyboard.write(KEY_MEDIA_NEXT_TRACK);
      break;

    case 0x13: // Previous Track
      Keyboard.write(KEY_MEDIA_PREVIOUS_TRACK);
      break;

    case 0x14: // Volume Up
      Keyboard.write(KEY_MEDIA_VOLUME_UP);
      break;

    case 0x15: // Volume Down
      Keyboard.write(KEY_MEDIA_VOLUME_DOWN);
      break;

    case 0x16: // Mute
      Keyboard.write(KEY_MEDIA_MUTE);
      break;


    // ----------------------------------------------------
    // 2. PRESENTATION / READER MODE (0x20 - 0x2F)
    // ----------------------------------------------------
    case 0x21: // Next Slide (Right Arrow)
      Keyboard.write(KEY_RIGHT_ARROW);
      break;

    case 0x22: // Prev Slide (Left Arrow)
      Keyboard.write(KEY_LEFT_ARROW);
      break;

    case 0x23: // Fullscreen Toggle (F5)
      Keyboard.write(KEY_F5);
      break;


    // ----------------------------------------------------
    // 3. SECURITY & UTILITIES (0x30 - 0x3F)
    // ----------------------------------------------------
    case 0x31: // Lock Workstation (Windows + L)
      Keyboard.press(KEY_LEFT_GUI);
      Keyboard.press('l');
      delay(50);
      Keyboard.releaseAll();
      break;

    case 0x32: // Mouse Jiggler Toggle
      jigglerActive = !jigglerActive;
      lastJiggleTime = millis(); // Reset timer on toggle
      if (Serial) {
        Serial.print(F("[Security] Mouse Jiggler State: "));
        Serial.println(jigglerActive ? F("ENABLED") : F("DISABLED"));
      }
      break;


    // ----------------------------------------------------
    // 4. GAMING / MACRO MODE (0x40 - 0x4F)
    // ----------------------------------------------------
    case 0x41: // Quick CS Buy Sequence ('b' -> delay -> '4' -> delay -> '2')
      Keyboard.write('b');
      delay(120);
      Keyboard.write('4');
      delay(120);
      Keyboard.write('2');
      delay(50);
      break;


    // ----------------------------------------------------
    // 5. VIRTUAL TRACKPAD / MOUSE CONTROL (0x80 - 0x8F)
    // ----------------------------------------------------
    case 0x80: // Relative X/Y Movement Packet [0x80, deltaX, deltaY]
      readAndExecuteTrackpadMove();
      break;

    case 0x81: // Mouse Left Click
      Mouse.click(MOUSE_LEFT);
      break;

    case 0x82: // Mouse Right Click
      Mouse.click(MOUSE_RIGHT);
      break;

    default:
      if (Serial) {
        Serial.print(F("[Warning] Unknown Protocol Command: 0x"));
        Serial.println(cmd, HEX);
      }
      break;
  }
}

/**
 * Reads 2 payload bytes (signed deltaX, signed deltaY) following 0x80 command byte
 */
void readAndExecuteTrackpadMove() {
  unsigned long startWait = millis();
  
  // Wait until 2 bytes (deltaX and deltaY) arrive in UART buffer
  while (Serial1.available() < 2) {
    if (millis() - startWait > PACKET_TIMEOUT_MS) {
      if (Serial) Serial.println(F("[Error] Trackpad Move Packet Timeout"));
      return;
    }
  }

  int8_t deltaX = (int8_t)Serial1.read();
  int8_t deltaY = (int8_t)Serial1.read();

  // Execute relative USB Mouse HID movement
  Mouse.move(deltaX, deltaY, 0);
}
