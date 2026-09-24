import os
import sys
import json
import subprocess
import argparse
from concurrent.futures import ThreadPoolExecutor

# Default files to process (relative to assets directory)
DEFAULT_FILES = [
    "data/games.json",
    "data/films.json",
    "data/durstloescher.json",
    "data/books.json",
    "data/photos.json",
    "data/videos.json",
    "data/characters.json",
    "data/mariokart.json",
    "data/stitches.json",
    "data/albums.json",
    "data/concerts.json",
    "data/cds.json",
    "data/mixes.json",
    "data/soundtracks.json",
    "data/kk.json",
    "data/daily-soundtracks.json",
    "data/playlists.json"
]

def get_git_root():
    """Find the root directory of the git repository."""
    try:
        res = subprocess.run(
            ["git", "rev-parse", "--show-toplevel"],
            capture_output=True,
            text=True,
            check=True
        )
        return res.stdout.strip()
    except Exception:
        # Fallback to current working directory or directory containing src
        script_dir = os.path.dirname(os.path.abspath(__file__))
        return os.path.abspath(os.path.join(script_dir, "..", ".."))

def resolve_file_path(file_path):
    """Resolve file path whether called from project root, src/scripts, or anywhere else."""
    if os.path.isabs(file_path) and os.path.exists(file_path):
        return file_path
    if os.path.exists(file_path):
        return os.path.abspath(file_path)

    # Check relative to script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    candidate1 = os.path.abspath(os.path.join(script_dir, "..", "assets", file_path))
    if os.path.exists(candidate1):
        return candidate1

    candidate2 = os.path.abspath(os.path.join(script_dir, file_path))
    if os.path.exists(candidate2):
        return candidate2

    # Check relative to git root
    git_root = get_git_root()
    candidate3 = os.path.abspath(os.path.join(git_root, "src", "assets", file_path))
    if os.path.exists(candidate3):
        return candidate3

    candidate4 = os.path.abspath(os.path.join(git_root, file_path))
    if os.path.exists(candidate4):
        return candidate4

    return os.path.abspath(file_path)

def load_json(filename):
    """Load a JSON file, return its content."""
    if not os.path.exists(filename):
        print(f"Warning: {filename} not found, skipping.")
        return None
    with open(filename, "r", encoding="utf-8") as f:
        return json.load(f)

def save_json(filename, data):
    """Save JSON data back to file with indentation."""
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")

def get_search_candidates(item):
    """Generate search candidates in priority order for an item."""
    candidates = []
    
    # Priority 1: Primary text identifiers (with quotes for exact JSON key match)
    for key in ["title", "name", "filename", "image", "picture", "album", "artist", "track", "link", "comment"]:
        val = item.get(key)
        if val and isinstance(val, str) and val.strip():
            # JSON-escaped key-value snippet
            candidates.append(f'"{key}": "{val.strip()}"')
            
    # Priority 2: Fallback to ID
    if "id" in item and item["id"]:
        candidates.append(f'"id": "{item["id"]}"')
        
    return candidates

def find_earliest_commit_date(file_path, item, git_root):
    """Query git history for earliest commit date of item in DD-MM-YYYY format."""
    candidates = get_search_candidates(item)
    repo_rel_path = os.path.relpath(file_path, git_root).replace("\\", "/")

    for query in candidates:
        cmd = [
            "git", "log", "--follow", "-S", query,
            "--format=%cd", "--date=format:%d-%m-%Y",
            "--", repo_rel_path
        ]
        res = subprocess.run(cmd, cwd=git_root, capture_output=True, text=True, encoding="utf-8")
        if res.returncode == 0 and res.stdout.strip():
            lines = [l.strip() for l in res.stdout.strip().split("\n") if l.strip()]
            if lines:
                return lines[-1]

    # Fallback to whole file earliest commit if item-specific search returned nothing
    cmd_fallback = [
        "git", "log", "--follow",
        "--format=%cd", "--date=format:%d-%m-%Y",
        "--", repo_rel_path
    ]
    res_fb = subprocess.run(cmd_fallback, cwd=git_root, capture_output=True, text=True, encoding="utf-8")
    if res_fb.returncode == 0 and res_fb.stdout.strip():
        lines = [l.strip() for l in res_fb.stdout.strip().split("\n") if l.strip()]
        if lines:
            return lines[-1]

    return None

def process_file(file_path, git_root, dry_run=False, overwrite=False, max_workers=16):
    """Process a single JSON file, adding timestamp to each item."""
    resolved_path = resolve_file_path(file_path)
    data = load_json(resolved_path)
    if data is None:
        return

    items_to_query = []
    preserved_count = 0

    if isinstance(data, dict):
        for key, items in data.items():
            if isinstance(items, list):
                for item in items:
                    if isinstance(item, dict):
                        if "timestamp" in item and item["timestamp"] and not overwrite:
                            preserved_count += 1
                        else:
                            items_to_query.append(item)
    elif isinstance(data, list):
        for item in data:
            if isinstance(item, dict):
                if "timestamp" in item and item["timestamp"] and not overwrite:
                    preserved_count += 1
                else:
                    items_to_query.append(item)

    updated_count = 0

    def query_worker(item):
        return item, find_earliest_commit_date(resolved_path, item, git_root)

    if items_to_query:
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            results = executor.map(query_worker, items_to_query)
            for item, date in results:
                if date:
                    item["timestamp"] = date
                    updated_count += 1

    if not dry_run:
        save_json(resolved_path, data)
        print(f"Processed and updated {os.path.basename(resolved_path)} (Updated: {updated_count}, Preserved: {preserved_count})")
    else:
        print(f"[DRY-RUN] Would update {os.path.basename(resolved_path)} (To update: {updated_count}, Preserved: {preserved_count})")

def main():
    parser = argparse.ArgumentParser(description="Add git timestamps to JSON data files.")
    parser.add_argument("--file", "-f", type=str, help="Specific JSON file to process")
    parser.add_argument("--dry-run", action="store_true", help="Perform a dry run without modifying files")
    parser.add_argument("--overwrite", action="store_true", help="Overwrite existing timestamps")
    args = parser.parse_args()

    git_root = get_git_root()

    if args.file:
        process_file(args.file, git_root, dry_run=args.dry_run, overwrite=args.overwrite)
    else:
        for f in DEFAULT_FILES:
            process_file(f, git_root, dry_run=args.dry_run, overwrite=args.overwrite)

    print("Finished processing timestamps.")

if __name__ == "__main__":
    main()
