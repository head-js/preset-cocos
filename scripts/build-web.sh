#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG_PATH="./build-config/web-mobile.json"
STAGING_DIR="$ROOT_DIR/build/docs"
TARGET_DIR="$ROOT_DIR/docs"
CREATOR_BIN="${COCOS_CREATOR_BIN:-/Applications/Cocos/Creator/3.8.6/CocosCreator.app/Contents/MacOS/CocosCreator}"

if [[ ! -x "$CREATOR_BIN" ]]; then
  echo "Cocos Creator executable not found: $CREATOR_BIN" >&2
  echo "Set COCOS_CREATOR_BIN to the CocosCreator executable path." >&2
  exit 1
fi

rm -rf "$STAGING_DIR"

set +e
(cd "$ROOT_DIR" && "$CREATOR_BIN" --project "$ROOT_DIR" --build "configPath=$CONFIG_PATH")
CREATOR_STATUS=$?
set -e

if [[ ! -f "$STAGING_DIR/index.html" ]]; then
  echo "Cocos build did not produce $STAGING_DIR/index.html (exit $CREATOR_STATUS)." >&2
  exit "${CREATOR_STATUS:-1}"
fi

rm -rf "$TARGET_DIR"
cp -R "$STAGING_DIR" "$TARGET_DIR"

# GitHub Pages/Jekyll otherwise skips Cocos' generated files whose names begin
# with an underscore, such as cocos-js/_virtual_*.js.
touch "$TARGET_DIR/.nojekyll"

if [[ "$CREATOR_STATUS" -ne 0 ]]; then
  echo "Cocos reported exit $CREATOR_STATUS after producing a complete build; copied output to $TARGET_DIR." >&2
fi

echo "Web build available at $TARGET_DIR/index.html"
