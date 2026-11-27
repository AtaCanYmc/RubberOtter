#include <unity.h>
#include <stdint.h>
#include <string.h>

static uint8_t calc_xor(const uint8_t* data, size_t len) {
    uint8_t x = 0;
    for (size_t i = 0; i < len; ++i) x ^= data[i];
    return x;
}

static size_t split_commands(const char* input, char out[][64], size_t max_cmds) {
    size_t count = 0;
    const char* p = input;
    while (*p && count < max_cmds) {
        const char* sep_semi = strchr(p, ';');
        const char* sep_amp = strstr(p, "&&");
        const char* next = nullptr;
        size_t adv = 0;
        if (sep_semi && (!sep_amp || sep_semi < sep_amp)) {
            next = sep_semi;
            adv = 1;
        } else if (sep_amp) {
            next = sep_amp;
            adv = 2;
        }
        size_t len = next ? (size_t)(next - p) : strlen(p);
        if (len >= 64) len = 63;
        memcpy(out[count], p, len);
        out[count][len] = '\0';
        count++;
        if (!next) break;
        p = next + adv;
    }
    return count;
}

void test_packet_parser_xor_and_framing(void) {
    const uint8_t payload[] = {'t', 'y', 'p', 'e', ' ', 'o', 'k'};
    uint8_t ver = 0x01, seq = 0x02;
    uint16_t len = sizeof(payload);
    uint8_t x = ver ^ seq ^ (uint8_t)(len >> 8) ^ (uint8_t)(len & 0xFF) ^ calc_xor(payload, len);
    TEST_ASSERT_EQUAL_UINT8(0x01 ^ 0x02 ^ 0x00 ^ 0x07 ^ ('t'^'y'^'p'^'e'^' '^'o'^'k'), x);
    TEST_ASSERT_TRUE(len <= 384);
}

void test_command_executor_chaining(void) {
    char cmds[4][64];
    size_t n = split_commands("type hi&&enter;delay 50", cmds, 4);
    TEST_ASSERT_EQUAL_UINT(3, n);
    TEST_ASSERT_EQUAL_STRING("type hi", cmds[0]);
    TEST_ASSERT_EQUAL_STRING("enter", cmds[1]);
    TEST_ASSERT_EQUAL_STRING("delay 50", cmds[2]);
}

int main(void) {
    UNITY_BEGIN();
    RUN_TEST(test_packet_parser_xor_and_framing);
    RUN_TEST(test_command_executor_chaining);
    return UNITY_END();
}
