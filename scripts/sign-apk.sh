#!/usr/bin/env bash

set -e

BASE_DIR=$(dirname "$0")
TMP_DIR=/tmp/lfreader

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <key>"
  exit 1
fi

APK="$BASE_DIR/../frontend/src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release-unsigned.apk"

mkdir -p $TMP_DIR

zipalign -v -p 4 "$APK" $TMP_DIR/aligned.apk
apksigner sign --ks "$1" --out $TMP_DIR/lfreader.apk $TMP_DIR/aligned.apk

mv $TMP_DIR/lfreader.apk .
rm -rf $TMP_DIR

