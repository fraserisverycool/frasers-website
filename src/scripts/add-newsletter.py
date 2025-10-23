import json
import os

# Files to process
FILES = ["data/games.json",
         "data/films.json",
         "data/durstloescher.json",
         "data/books.json",
         "data/photos.json",
         "data/videos.json",
         "data/characters.json",
         "data/mariokart.json",
         "data/stitches.json",
         "data/albums.json",
         "data/cds.json",
         "data/mixes.json",
         "data/soundtracks.json",
         "data/kk.json",
         "data/daily-soundtracks.json"]

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

def process_file(filename):
  """Process a single JSON file, assigning IDs where missing."""
  data = load_json(filename)
  if not data:
    return

  # The top-level key should be "books", "films", or "games"
  for key, items in data.items():
    for item in items:
      item["newsletter"] = True

  # Save updated JSON back to file
  save_json(filename, data)
  print(f"Processed and updated {filename}")

def main():
  for file in FILES:
    process_file("../assets/" + file)

  print(f"Finished processing")

if __name__ == "__main__":
  main()
