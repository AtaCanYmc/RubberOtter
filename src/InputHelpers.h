#pragma once

#include <Arduino.h>

void sendHelp();
void sendHelpFor(const char* cmd);

void keyboard_type_text(const char* s);
void press_modifier_by_name(const char* name, uint16_t ms);
void hold_modifier(const char* name);
void release_modifier(const char* name);
void consumer_command(const char* cmd);

void vibrate_pulse_hw(uint16_t ms); // from Hardware

