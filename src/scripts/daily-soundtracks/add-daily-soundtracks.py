import os
import json
import uuid
from datetime import datetime, timedelta

def load_json(filename):
  if not os.path.exists(filename):
    print(f"Warning: {filename} not found, skipping.")
    return None
  with open(filename, "r", encoding="utf-8") as f:
    return json.load(f)

def save_json(filename, data):
  with open(filename, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

def generate_unique_id(existing_ids):
  new_id = str(uuid.uuid4())
  while new_id in existing_ids:
    new_id = str(uuid.uuid4())
  return new_id

def get_latest_date(entries):
  date_format = "%d-%m-%Y"
  dates = [datetime.strptime(entry["day"], date_format) for entry in entries if "day" in entry]
  return max(dates) if dates else datetime.today()

def get_next_month_dates(start_date):
  # Get the first day of the next month
  next_month = start_date.replace(day=1) + timedelta(days=32)
  first_day_next_month = next_month.replace(day=1)
  # Generate all dates in the next month
  dates = []
  current = first_day_next_month
  while current.month == first_day_next_month.month:
    dates.append(current)
    current += timedelta(days=1)
  return dates

def create_placeholder_entry(date, existing_ids):
  return {
    "artist": "",
    "album": "",
    "track": "",
    "description": "",
    "link": "",
    "game": False,
    "day": date.strftime("%d-%m-%Y"),
    "id": generate_unique_id(existing_ids),
    "newsletter": False,
    "filename": "",
    "tags": "[]"
  }

def process_file(filename):
  data = load_json(filename)
  if data is None or "dailysoundtracks" not in data:
    print(f"Invalid or missing data in {filename}")
    return

  soundtrack_list = data["dailysoundtracks"]

  # Get existing IDs to avoid duplicates
  existing_ids = {entry["id"] for entry in soundtrack_list if "id" in entry}

  # Get the latest date
  latest_date = get_latest_date(soundtrack_list)

  # Get the list of dates for the following month
  new_dates = get_next_month_dates(latest_date)

  # Create new entries
  for date in new_dates:
    new_entry = create_placeholder_entry(date, existing_ids)
    soundtrack_list.append(new_entry)
    existing_ids.add(new_entry["id"])

  # Sort all entries in descending date order (latest first, like your app)
  soundtrack_list.sort(key=lambda x: datetime.strptime(x["day"], "%d-%m-%Y"), reverse=True)

  save_json(filename, data)

def main():
  process_file("../assets/data/daily-soundtracks.json")
  print(f"Finished processing.")

if __name__ == "__main__":
  main()
