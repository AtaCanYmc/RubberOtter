#include "Utils.h"
#include <ctype.h>
#include <string.h>
#include "Protocol.h"
#include "Hardware.h"

char* trim_inplace(char* s) {
  if (!s) return s;
  // left trim
  while (*s && isspace((unsigned char)*s)) s++;
  if (!*s) return s;
  // right trim
  char* end = s + strlen(s) - 1;
  while (end > s && isspace((unsigned char)*end)) { *end = '\0'; end--; }
  return s;
}

int parse_int(const char* s) {
  if (!s) return 0;
  return atoi(s);
}

bool iequals(const char* a, const char* b) {
  if (!a||!b) return false;
  while (*a && *b) {
    char ca = (char)tolower((unsigned char)*a);
    char cb = (char)tolower((unsigned char)*b);
    if (ca!=cb) return false;
    a++; b++;
  }
  return *a=='\0' && *b=='\0';
}

bool startsWithIgnoreCase(const char* s, const char* prefix) {
  if (!s||!prefix) return false;
  while (*prefix) {
    if (!*s) return false;
    if ((char)tolower((unsigned char)*s) != (char)tolower((unsigned char)*prefix)) return false;
    s++; prefix++;
  }
  return true;
}

void sendAck(uint8_t seq, bool ok, uint8_t code) {
  uint8_t ack[6];
  ack[0] = STX;
  ack[1] = VERSION;
  ack[2] = seq;
  ack[3] = ok ? 1 : 0;
  ack[4] = code;
  ack[5] = ETX;
  if (BLE_SERIAL) BLE_SERIAL->write(ack, sizeof(ack));
}
