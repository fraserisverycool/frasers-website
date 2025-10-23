import json
import uuid
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
         "data/kk.json"]

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

def generate_unique_id(existing_ids):
  """Generate a unique UUID4 string not in existing_ids."""
  new_id = str(uuid.uuid4())
  while new_id in existing_ids:
    new_id = str(uuid.uuid4())
  return new_id

def process_file(filename, existing_ids):
  """Process a single JSON file, assigning IDs where missing."""
  data = load_json(filename)
  if not data:
    return existing_ids

  # The top-level key should be "books", "films", or "games"
  for key, items in data.items():
    for item in items:
      if "id" in item and item["id"]:
        # Already has an ID
        existing_ids.add(item["id"])
      else:
        # Assign new unique ID
        new_id = generate_unique_id(existing_ids)
        item["id"] = new_id
        existing_ids.add(new_id)

  # Save updated JSON back to file
  save_json(filename, data)
  print(f"Processed and updated {filename}")
  return existing_ids

def main():
  all_ids = set()  # store all unique IDs

  for file in FILES:
    all_ids = process_file("../assets/" + file, all_ids)

  print(f"Finished processing. Total unique IDs: {len(all_ids)}")

if __name__ == "__main__":
  main()
