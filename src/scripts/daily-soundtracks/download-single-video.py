import os
import sys
import argparse

try:
    import yt_dlp
except ImportError:
    print("Error: yt-dlp library not found. Please install it using: pip install yt-dlp")
    sys.exit(1)

# Define paths relative to the script location
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(os.path.dirname(SCRIPT_DIR))
DEFAULT_OUTPUT_DIR = os.path.join(PROJECT_ROOT, 'assets', 'music', 'dailysoundtracks')

# If ffmpeg is not in your PATH, you can specify its location here
# Example: FFMPEG_LOCATION = r'C:\ffmpeg\bin'
# Work computer: C:\Users\FBowen\Documents\ffmpeg-2026-01-07-git-af6a1dd0b2-essentials_build\bin
FFMPEG_LOCATION = r'C:\Users\Brexit\Documents\ffmpeg-2026-01-14-git-6c878f8b82-essentials_build\bin'

def download_and_convert(url, filename, output_dir):
    # Ensure filename ends with .mp3
    if not filename.lower().endswith('.mp3'):
        filename += '.mp3'

    # Output path without extension, yt-dlp will add .mp3
    output_path_base = os.path.join(output_dir, os.path.splitext(filename)[0])
    final_output_path = os.path.join(output_dir, filename)

    # Check if file already exists
    if os.path.exists(final_output_path):
        print(f"Skipping {filename}, already exists in {output_dir}.")
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
    parser = argparse.ArgumentParser(description='Download a single YouTube video as an MP3.')
    parser.add_argument('url', nargs='?', help='The YouTube URL to download')
    parser.add_argument('filename', nargs='?', help='The desired filename (e.g., song-name.mp3)')
    parser.add_argument('--dir', default=DEFAULT_OUTPUT_DIR, help='The output directory (optional)')

    args = parser.parse_args()

    url = args.url
    filename = args.filename
    output_dir = args.dir

    # If arguments are missing, prompt for them
    if not url:
        url = input("Enter YouTube URL: ").strip()
    if not filename:
        filename = input("Enter desired filename (e.g. my-song.mp3): ").strip()

    if not url or not filename:
        print("Error: Both URL and filename are required.")
        return

    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"Created directory: {output_dir}")

    # Basic validation of URL (should be a youtube link)
    if 'youtube.com' in url or 'youtu.be' in url:
        download_and_convert(url, filename, output_dir)
    else:
        print(f"Error: Provided link does not appear to be a YouTube link: {url}")

if __name__ == "__main__":
    main()
