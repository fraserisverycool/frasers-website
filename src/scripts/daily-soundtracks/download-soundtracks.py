import os
import json
import sys

try:
    import yt_dlp
except ImportError:
    print("Error: yt-dlp library not found. Please install it using: pip install yt-dlp")
    sys.exit(1)

# Define paths relative to the script location
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(os.path.dirname(SCRIPT_DIR))
DATA_FILE = os.path.join(PROJECT_ROOT, 'assets', 'data', 'daily-soundtracks.json')
OUTPUT_DIR = os.path.join(PROJECT_ROOT, 'assets', 'music', 'dailysoundtracks')

# If ffmpeg is not in your PATH, you can specify its location here
# Example: FFMPEG_LOCATION = r'C:\ffmpeg\bin'
# Work computer: C:\Users\FBowen\Documents\ffmpeg-2026-01-07-git-af6a1dd0b2-essentials_build\bin
# Home computer: C:\Users\Brexit\Documents\ffmpeg-2026-01-14-git-6c878f8b82-essentials_build\bin
FFMPEG_LOCATION = r'C:\Users\Brexit\Documents\ffmpeg-2026-01-14-git-6c878f8b82-essentials_build\bin'

def download_and_convert(url, filename):
    # Output path without extension, yt-dlp will add .mp3
    output_path_base = os.path.join(OUTPUT_DIR, os.path.splitext(filename)[0])
    final_output_path = os.path.join(OUTPUT_DIR, filename)

    # Check if file already exists
    if os.path.exists(final_output_path):
        print(f"Skipping {filename}, already exists.")
        return

    print(f"Downloading {url} to {filename}...")

    ydl_opts = {
        'format': 'bestaudio/best',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'outtmpl': output_path_base + '.%(ext)s',
        'quiet': False,
        'no_warnings': True,
    }

    if FFMPEG_LOCATION:
        ydl_opts['ffmpeg_location'] = FFMPEG_LOCATION

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
        print(f"Successfully downloaded and converted {filename}")
    except Exception as e:
        print(f"Error downloading {url}: {e}")

def main():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        print(f"Created directory: {OUTPUT_DIR}")

    if not os.path.exists(DATA_FILE):
        print(f"Error: Data file not found at {DATA_FILE}")
        return

    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    soundtracks = data.get('dailysoundtracks', [])

    print(f"Found {len(soundtracks)} soundtracks in data file.")

    for entry in soundtracks:
        url = entry.get('link')
        filename = entry.get('filename')

        if url and filename:
            # Basic validation of URL (should be a youtube link)
            if 'youtube.com' in url or 'youtu.be' in url:
                download_and_convert(url, filename)
            else:
                print(f"Skipping non-YouTube link: {url}")
        else:
            print(f"Skipping entry missing link or filename: {entry.get('track', 'Unknown')}")

if __name__ == "__main__":
    main()
