#!/bin/bash
# display-image.sh - Display an image on the Pi framebuffer
# Usage: sudo ./display-image.sh /path/to/image.ext

IMAGE="$1"

# Kill any existing display processes
killall fbi 2>/dev/null || true

# Use fbi for all images
fbi -T 1 -a --noverbose "$IMAGE" 2>/dev/null &
