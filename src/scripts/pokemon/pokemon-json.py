import os
import json
import re

IMAGE_FOLDER = "pokemon_images"
OUTPUT_FILE = "pokemon_data.json"

def parse_filename(filename):
  # Expecting something like: 250px-0001Bulbasaur.png
  match = re.match(r".*?-(\d{4})([A-Za-z0-9_.-]+)\.png$", filename)
  if not match:
    return None

  number = match.group(1)
  raw_name = match.group(2)

  # Clean name (remove extra characters if any — usually unnecessary)
  name = raw_name.replace("_", " ").replace("-", " ")

  return {
    "name": name,
    "number": number,
    "image": filename
  }

def main():
  pokemon_list = []

  for filename in os.listdir(IMAGE_FOLDER):
    if filename.lower().endswith(".png"):
      parsed = parse_filename(filename)
      if parsed:
        pokemon_list.append(parsed)

  # Sort by Pokédex number (numeric)
  pokemon_list.sort(key=lambda x: int(x["number"]))

  with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(pokemon_list, f, indent=4, ensure_ascii=False)

  print(f"Saved {len(pokemon_list)} entries to {OUTPUT_FILE}")

if __name__ == "__main__":
  main()
