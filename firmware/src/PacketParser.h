#pragma once

#include <Arduino.h>

void initPacketParser();
void packetParser_poll();

// configure a small API: parser will call CommandExecutor::execute_command when a valid frame is received


