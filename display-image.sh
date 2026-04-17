#!/bin/bash
# display-image.sh - Display an image or animated GIF on the Pi framebuffer
# Usage: sudo ./display-image.sh /path/to/image.ext

IMAGE="$1"
EXT="${IMAGE##*.}"
EXT_LOWER=$(echo "$EXT" | tr '[:upper:]' '[:lower:]')

# Kill any existing display processes
killall fbi 2>/dev/null || true
killall ffmpeg 2>/dev/null || true

# Auto-detect framebuffer resolution and bit depth
FB_WIDTH=$(cat /sys/class/graphics/fb0/virtual_size 2>/dev/null | cut -d',' -f1)
FB_HEIGHT=$(cat /sys/class/graphics/fb0/virtual_size 2>/dev/null | cut -d',' -f2)
FB_BITS=$(cat /sys/class/graphics/fb0/bits_per_pixel 2>/dev/null)

# Fallback defaults if detection fails
FB_WIDTH=${FB_WIDTH:-1920}
FB_HEIGHT=${FB_HEIGHT:-1080}
FB_BITS=${FB_BITS:-16}

# Choose pixel format based on bit depth
if [ "$FB_BITS" = "32" ]; then
  PIX_FMT="bgra"
else
  # 16-bit: rgb565le is standard for Pi framebuffer
  PIX_FMT="rgb565le"
fi

if [ "$EXT_LOWER" = "gif" ]; then
  # Use ffmpeg to decode GIF frames and write to framebuffer in a loop
  ffmpeg -stream_loop -1 -re -i "$IMAGE" \
    -vf "scale=${FB_WIDTH}:${FB_HEIGHT}:force_original_aspect_ratio=decrease,pad=${FB_WIDTH}:${FB_HEIGHT}:(ow-iw)/2:(oh-ih)/2" \
    -pix_fmt "$PIX_FMT" \
    -f rawvideo - > /dev/fb0 2>/dev/null &
else
  # Use fbi for static images
  fbi -T 1 -a --noverbose "$IMAGE" 2>/dev/null &
fi
