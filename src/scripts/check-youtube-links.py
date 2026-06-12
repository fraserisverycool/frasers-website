import json
import os
import sys
import time

try:
    import yt_dlp
except ImportError:
    print("Error: yt-dlp library not found. Please install it using: pip install yt-dlp")
    sys.exit(1)

# Define paths relative to the script location
# SCRIPT_DIR: .../src/scripts
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
# PROJECT_ROOT: .../
PROJECT_ROOT = os.path.dirname(os.path.dirname(SCRIPT_DIR))
# DATA_DIR: .../src/assets/data
DATA_DIR = os.path.join(PROJECT_ROOT, 'src', 'assets', 'data')

VIDEOS_FILE = os.path.join(DATA_DIR, 'videos.json')
SOUNDTRACKS_FILE = os.path.join(DATA_DIR, 'daily-soundtracks.json')
STATE_FILE = os.path.join(SCRIPT_DIR, '.youtube-check-state.json')

def load_state():
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_state(state):
    try:
        with open(STATE_FILE, 'w', encoding='utf-8') as f:
            json.dump(state, f, indent=2)
    except Exception as e:
        print(f"Error saving state: {e}")

def check_link(url, ydl):
    """Returns True if the link is active, False if dead, and None if it should be ignored."""
    try:
        # extract_info with download=False is a good way to check if a video is available
        ydl.extract_info(url, download=False)
        return True
    except yt_dlp.utils.DownloadError as e:
        error_msg = str(e)
        # Videos that require sign-in for age verification are considered "alive" for our purposes
        if "Sign in to confirm your age" in error_msg:
            return True

        # Specific "dead" indicators
        if any(msg in error_msg for msg in ["Video unavailable", "Private video", "This video has been removed", "The Video ID is invalid"]):
            return False

        # If it's a rate limit error, we should probably stop or wait, but here we report it
        if "Too Many Requests" in error_msg or "429" in error_msg:
            print(f"\n[RATE LIMITED] YouTube is rate limiting requests. Consider waiting or using a different IP.")
            return None # Special value to indicate rate limiting

        # For other errors, we'll be conservative and call it dead if we can't extract info,
        # but the user might want to manually check.
        return False
    except Exception:
        return False

def main():
    files_to_check = [
        {'path': VIDEOS_FILE, 'key': 'videos', 'name': 'videos.json'},
        {'path': SOUNDTRACKS_FILE, 'key': 'dailysoundtracks', 'name': 'daily-soundtracks.json'}
    ]

    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'simulate': True,
    }

    state = load_state()
    dead_links = state.get('dead_links', [])
    checked_urls = state.get('checked_urls', {}) # url -> timestamp

    new_dead_links = []

    # Check if we should resume or start fresh
    resume = False
    if checked_urls:
        ans = input(f"Found existing state with {len(checked_urls)} checked links. Resume? (y/n): ").strip().lower()
        if ans == 'y':
            resume = True
        else:
            checked_urls = {}
            dead_links = []

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        for file_info in files_to_check:
            path = file_info['path']
            if not os.path.exists(path):
                print(f"Warning: File not found: {path}")
                continue

            print(f"Checking {file_info['name']}...")
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    data = json.load(f)

                items = data.get(file_info['key'], [])
                total = len(items)

                for i, item in enumerate(items):
                    url = item.get('link')
                    if not url:
                        continue

                    if resume and url in checked_urls:
                        continue

                    title = item.get('title') or item.get('track') or "Unknown"
                    artist = item.get('artist', "")
                    display_name = f"{artist} - {title}" if artist else title

                    print(f"[{i+1}/{total}] Checking: {display_name} ({url})", end='\r')

                    result = check_link(url, ydl)

                    if result is None: # Rate limited
                        print("\nRate limit hit. Saving progress and exiting...")
                        save_state({'checked_urls': checked_urls, 'dead_links': dead_links})
                        sys.exit(1)

                    checked_urls[url] = time.time()

                    if not result:
                        print(f"\n[DEAD] {display_name}: {url}")
                        link_info = {
                            'file': file_info['name'],
                            'name': display_name,
                            'url': url
                        }
                        if link_info not in dead_links:
                            dead_links.append(link_info)
                            new_dead_links.append(link_info)

                    # Save state every 50 links to avoid losing too much progress
                    if len(checked_urls) % 50 == 0:
                        save_state({'checked_urls': checked_urls, 'dead_links': dead_links})

                    # Small delay to help with rate limiting
                    time.sleep(0.5)

                print(f"\nFinished checking {file_info['name']}.\n")

            except Exception as e:
                print(f"Error processing {file_info['name']}: {e}")

            # Save state after each file
            save_state({'checked_urls': checked_urls, 'dead_links': dead_links})

    if dead_links:
        print("--- SUMMARY OF ALL DEAD LINKS FOUND SO FAR ---")
        for link in dead_links:
            print(f"[{link['file']}] {link['name']} - {link['url']}")
        print(f"\nTotal dead links: {len(dead_links)}")
    else:
        print("No dead links found! Everything looks good.")

    # Optionally clear state if everything was checked and no new dead links?
    # No, better keep it so user can run it again later and only check new ones if they want.
    # But maybe we should have an option to clear it.
    print(f"\nProgress saved to {STATE_FILE}")
