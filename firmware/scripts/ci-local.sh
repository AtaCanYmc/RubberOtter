#!/usr/bin/env bash
set -euo pipefail

# Local helper script to reproduce CI builds for all defined environments.
# Usage: ./scripts/ci-local.sh

ENVS=(leonardo leonardo_hid pro_micro pro_micro_hid)

echo "Running local CI build for: ${ENVS[*]}"
for e in "${ENVS[@]}"; do
  echo "\n--- Building environment: $e ---"
  platformio run -e "$e"
  echo "Built $e -> .pio/build/$e/firmware.hex"
done

echo "\nAll builds succeeded."

