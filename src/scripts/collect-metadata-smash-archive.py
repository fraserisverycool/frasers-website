import os
import json
import uuid
from mutagen import File
from mutagen.id3 import ID3TimeStamp

# --------------------------------------------------
# Config
# --------------------------------------------------
ROOT_MUSIC_DIR = "../assets/music/smash"
OUTPUT_DIR = "../assets/data/smash"

PATH_PREFIX_TO_STRIP = "../assets/"
PATH_PREFIX_TO_ADD = "music/"

# --------------------------------------------------
# ID3 → clean schema mapping
# --------------------------------------------------
ID3_MAP = {
  "TRCK": "track",
  "TIT2": "title",
  "TCOM": "composers",
  "TPE1": "contributors",
  "TALB": "album",
  "TXXX:CONTENTGROUP": "original-game",
  "TXXX:COMMENT": "comment",
  "TPOS": "volume",
  "TDRC": "release",
}

# --------------------------------------------------
# Serialization helpers
# --------------------------------------------------
def serialize_value(value):
  if isinstance(value, ID3TimeStamp):
    return str(value)

  if isinstance(value, bytes):
    return value.decode("utf-8", errors="replace")

  if isinstance(value, (list, tuple)):
    return [serialize_value(v) for v in value]

  if hasattr(value, "text"):
    return [serialize_value(v) for v in value.text]

  if isinstance(value, dict):
    return {k: serialize_value(v) for k, v in value.items()}

  return str(value)


def first_or_none(value):
  if isinstance(value, list) and value:
    return value[0]
  return value

# --------------------------------------------------
# Process one series directory
# --------------------------------------------------
def process_series(series_dir):
  tracks = []

  for root, _, files in os.walk(series_dir):
    for file in files:
      if not file.lower().endswith(".mp3"):
        continue

      full_path = os.path.join(root, file)

      # Rewrite path exactly as requested
      path = full_path
      if path.startswith(PATH_PREFIX_TO_STRIP):
        path = PATH_PREFIX_TO_ADD + path[len(PATH_PREFIX_TO_STRIP):]

      audio = File(full_path, easy=False)
      if audio is None or audio.tags is None:
        continue

      raw_tags = {}
      for tag, value in audio.tags.items():
        if tag.startswith("APIC"):
          continue
        raw_tags[tag] = serialize_value(value)

      track = {
        "id": str(uuid.uuid4()),
        "filename": file,
        "path": path,
        "description": "",
        "stars": "",
        "duration": None,
      }

      # Duration in seconds (rounded)
      if audio.info and hasattr(audio.info, "length"):
        track["duration"] = round(audio.info.length)

      for id3_key, output_key in ID3_MAP.items():
        if id3_key in raw_tags:
          track[output_key] = first_or_none(raw_tags[id3_key])

      tracks.append(track)

  return tracks

# --------------------------------------------------
# Main pipeline
# --------------------------------------------------
def main():
  os.makedirs(OUTPUT_DIR, exist_ok=True)

  index = {}

  for entry in sorted(os.listdir(ROOT_MUSIC_DIR)):
    series_path = os.path.join(ROOT_MUSIC_DIR, entry)
    if not os.path.isdir(series_path):
      continue

    print(f"Processing: {entry}")

    tracks = process_series(series_path)
    if not tracks:
      continue

    series_filename = f"{entry}.json"
    series_output_path = os.path.join(OUTPUT_DIR, series_filename)

    with open(series_output_path, "w", encoding="utf-8") as f:
      json.dump(tracks, f, indent=2, ensure_ascii=False)

    index[entry] = {
      "count": len(tracks),
      "file": series_filename,
    }

  # Write index.json
  with open(os.path.join(OUTPUT_DIR, "index.json"), "w", encoding="utf-8") as f:
    json.dump(index, f, indent=2, ensure_ascii=False)

  print("Done! Metadata generated successfully.")

# --------------------------------------------------
# Entry point
# --------------------------------------------------
if __name__ == "__main__":
  main()
