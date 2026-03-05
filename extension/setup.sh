#!/bin/bash
# Setup script for Blink Chrome Extension
# Downloads required dependencies and generates icons

set -e

EXTENSION_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Setting up Blink Chrome Extension..."

# ── Download TensorFlow.js and Face Landmarks Detection ──────────
echo "Downloading TensorFlow.js libraries..."

# TF.js core + backend
curl -sL "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.17.0/dist/tf.min.js" \
  -o "$EXTENSION_DIR/lib/tf.min.js"

# Face landmarks detection (includes MediaPipe FaceMesh)
curl -sL "https://cdn.jsdelivr.net/npm/@tensorflow-models/face-landmarks-detection@1.0.5/dist/face-landmarks-detection.min.js" \
  -o "$EXTENSION_DIR/lib/face-landmarks-detection.js"

echo "Libraries downloaded."

# ── Generate icons from existing app icon ────────────────────────
echo "Generating extension icons..."

ICON_SRC="$EXTENSION_DIR/../gui/img/icon.png"

if command -v convert &> /dev/null && [ -f "$ICON_SRC" ]; then
  convert "$ICON_SRC" -resize 16x16 "$EXTENSION_DIR/icons/icon16.png"
  convert "$ICON_SRC" -resize 48x48 "$EXTENSION_DIR/icons/icon48.png"
  convert "$ICON_SRC" -resize 128x128 "$EXTENSION_DIR/icons/icon128.png"
  echo "Icons generated from existing app icon."
else
  # Copy the existing icon as fallback
  if [ -f "$ICON_SRC" ]; then
    cp "$ICON_SRC" "$EXTENSION_DIR/icons/icon16.png"
    cp "$ICON_SRC" "$EXTENSION_DIR/icons/icon48.png"
    cp "$ICON_SRC" "$EXTENSION_DIR/icons/icon128.png"
    echo "Copied existing icon (resize manually for best results)."
    echo "Tip: Install ImageMagick (apt install imagemagick) for auto-resizing."
  else
    echo "Warning: No source icon found at $ICON_SRC"
    echo "Please add icon16.png, icon48.png, icon128.png to the icons/ directory."
  fi
fi

echo ""
echo "Setup complete! To load the extension:"
echo "  1. Open Chrome and navigate to chrome://extensions"
echo "  2. Enable 'Developer mode' (top right)"
echo "  3. Click 'Load unpacked' and select: $EXTENSION_DIR"
echo "  4. Click the Blink icon in your toolbar and hit 'Start'"
