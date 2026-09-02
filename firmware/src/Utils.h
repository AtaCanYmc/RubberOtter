#pragma once

#include <Arduino.h>
#include "Hardware.h"
#include "Protocol.h"

char* trim_inplace(char* s);
int parse_int(const char* s);

bool iequals(const char* a, const char* b);
bool startsWithIgnoreCase(const char* s, const char* prefix);

void sendAck(uint8_t seq, bool ok, uint8_t code);
