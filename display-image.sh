#!/bin/bash
# display-image.sh - Display an image or animated GIF on the Pi framebuffer
# Usage: sudo ./display-image.sh /path/to/image.ext

IMAGE="$1"
EXT="${IMAGE##*.}"
EXT_LOWER=$(echo "$EXT" | tr '[:upper:]' '[:lower:]')

# Kill any existing display processes
killall fbi 2>/dev/null || true
killall ffmpeg 2>/dev/null || true

if [ "$EXT_LOWER" = "gif" ]; then
  # Use ffmpeg to decode GIF frames and write to framebuffer in a loop
  # -vf scale sets the output to match the framebuffer resolution (1920x1080 typical)
  # -pix_fmt bgra matches the Pi framebuffer pixel format
  # Loop indefinitely with -stream_loop -1
  ffmpeg -stream_loop -1 -i "$IMAGE" \
    -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" \
    -pix_fmt bgra \
    -f rawvideo - > /dev/fb0 2>/dev/null &
else
  # Use fbi for static images
  fbi -T 1 -a --noverbose "$IMAGE" 2>/dev/null &
fi
