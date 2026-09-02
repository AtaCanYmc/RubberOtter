#pragma once

#include <Arduino.h>

void initCommandExecutor();
void execute_command(const char* payload, uint8_t seq);

