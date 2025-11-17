import os
import time
import requests
from urllib.parse import urljoin
from bs4 import BeautifulSoup

BASE_URL = "https://bulbapedia.bulbagarden.net"
LIST_URL = BASE_URL + "/wiki/List_of_Pok%C3%A9mon_by_National_Pok%C3%A9dex_number"

HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
}

def get_soup(url):
  r = requests.get(url, headers=HEADERS)
  r.raise_for_status()
  return BeautifulSoup(r.text, "html.parser")

def normalize_url(url):
  """Convert Bulbapedia/Archive weird URLs into proper absolute URLs."""
  if url.startswith("//"):
    return "https:" + url
  if url.startswith("http://") or url.startswith("https://"):
    return url
  return urljoin(BASE_URL, url)

def main():
  os.makedirs("../../assets/misc/pokemon", exist_ok=True)

  print("Fetching Pokémon list page...")
  soup = get_soup(LIST_URL)

  pokemon_links = []
  for a in soup.select("table.roundy a"):
    href = a.get("href", "")
    if href.startswith("/wiki/") and "(Pok%C3%A9mon)" in href:
      full = urljoin(BASE_URL, href)
      if full not in pokemon_links:
        pokemon_links.append(full)

  print(f"Found {len(pokemon_links)} Pokémon pages.")

  for idx, poke_url in enumerate(pokemon_links, 1):
    print(f"[{idx}/{len(pokemon_links)}] Fetching {poke_url}")

    try:
      poke_soup = get_soup(poke_url)

      img_tag = poke_soup.select_one(".infobox img")
      if not img_tag:
        print("  ❌ No image found. Skipping.")
        continue

      raw_src = img_tag.get("src")
      if not raw_src:
        print("  ❌ Image tag missing src.")
        continue

      img_url = normalize_url(raw_src)
      filename = os.path.join("../../assets/misc/pokemon", os.path.basename(img_url))

      if not os.path.exists(filename):
        print(f"  ⬇️ Downloading {filename}")
        img_data = requests.get(img_url, headers=HEADERS).content
        with open(filename, "wb") as f:
          f.write(img_data)
      else:
        print("  Already exists, skipping.")

      time.sleep(1.0)

    except Exception as e:
      print(f"  ❌ Error: {e}")

  print("Done!")

if __name__ == "__main__":
  main()
