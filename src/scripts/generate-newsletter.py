import json
import uuid
from datetime import datetime
from enum import Enum


class ContentType(Enum):
    GAME = 'games/games.json'
    FILM = 'films/films.json'
    ALBUM = "music/albums/albums.json"
    SOUNDTRACK = "music/nintendo/soundtracks.json"
    BOOK = "books/books.json"
    GALLERY = "gallery/gallery.json"
    VIDEO = "gallery/videos/videos.json"
    CD = "music/albums/cds.json"
    DURSTLOESCHER = "community/durstloescher/durstloescher.json"
    CHARACTER_DECO = "misc/characters/characters.json"
    MARIOKART = "misc/mariokart/mariokart.json"
    STITCH = "misc/stitch/stitches.json"
    MIX = "music/mixes/mixes.json"
    KK = "music/nintendo/kk/kk.json"
    DAILY_SOUNDTRACK = "music/daily/daily-soundtracks.json"

class ContentTypeMapping:
    def __init__(self):
        self.map = {}

    def register(self, content_type, mapper_function):
        self.map[content_type] = mapper_function

    def get_mapper(self, content_type):
        return self.map[content_type]

def mapper_games(json_item):
    return json_item["name"], json_item["review"], "assets/games/" + json_item["image"], "Vibes: " + json_item["vibes"] + ", Gameplay: " + json_item["gameplay"] + ", Platform: " + json_item["platform"] + ", Release: " + json_item["release"]

def mapper_films(json_item):
    return json_item["title"], [json_item["description"]], "assets/films/" + json_item["filename"], "Release: " + json_item["release"]

def mapper_durstloescher(json_item):
    return json_item["name"], [json_item["description"]], "assets/community/durstloescher/" + json_item["filename"], "Score: " + json_item["score"]

def mapper_books(json_item):
    return json_item["title"], [json_item["description"]], "assets/books/" + json_item["filename"], "Author: " + json_item["author"] + ", Release: " + json_item["release"] + ", for the spoiler discussion please visit the books page!"

def mapper_gallery(json_item):
    return json_item["title"], None, "assets/gallery/" + json_item["filename"], "For anecdotes about the pictures, please visit the gallery page!"

def mapper_videos(json_item):
    return json_item["title"], [json_item["description"]], None, "Link: " + json_item["link"]

def mapper_character_deco(json_item):
    return None, [json_item["description"]], "assets/misc/characters/deco/" + json_item["filename"], None

def mapper_mariokart(json_item):
    return json_item["name"], [json_item["description"]], "assets/misc/mariokart/" + json_item["image"], "Game: " + json_item["game"] + ", First Appearance: " + json_item["original"] + ", Fraser's ranking - music/vibes/track: " + json_item["music"] + "/" + json_item["vibes"] + "/" + json_item["track"]

def mapper_stitches(json_item):
    return None, [json_item["comment"]], "assets/misc/stitch/" + json_item["filename"], None

def mapper_albums(json_item):
    return json_item["name"], json_item["description"], "assets/music/albums/" + json_item["filename"], "Artist: " + json_item["artist"] + ", Release: " + json_item["releaseyear"] + ", for a list of favourite tracks, please visit the albums page!"

def mapper_cds(json_item):
    return json_item["album"], [json_item["description"]], "assets/music/albums/" + json_item["image"], "Artist: " + json_item["artist"]

def mapper_mixes(json_item):
    return json_item["name"], [json_item["description"]], None, "For a download link, please visit the video game mixes page!"

def mapper_soundtracks(json_item):
    return json_item["name"], json_item["description"], "assets/music/nintendo/" + json_item["filename"], "Platform: " + json_item["platform"] + ", for a list of favourite tracks, please visit the nintendo soundtracks page!"

def mapper_kk(json_item):
    return json_item["title"], [json_item["description"]], "assets/music/nintendo/kk/" + json_item["filename"], "Tier: " + json_item["tier"]

def mapper_daily_soundtracks(json_item):
  metadata = "Day: " + json_item["day"] + ", Link: " + json_item["link"]
  if json_item["game"]:
    metadata = "Composer: " + json_item["artist"] + ", Game: " + json_item["album"] + ", " + metadata
  else:
    metadata = "Artist: " + json_item["artist"] + ", Album: " + json_item["album"] + ", " + metadata
  return json_item["track"], [json_item["description"]], None, metadata

def get_content_data(content_type, content_data):
  if content_type == ContentType.GAME:
    return content_data['games']
  elif content_type == ContentType.FILM:
    return content_data['films']
  elif content_type == ContentType.DURSTLOESCHER:
    return content_data['durstloescher']
  elif content_type == ContentType.BOOK:
    return content_data['books']
  elif content_type == ContentType.GALLERY:
    return content_data['pictures']
  elif content_type == ContentType.MARIOKART:
    return content_data['tracks']
  elif content_type == ContentType.STITCH:
    return content_data['stitches']
  elif content_type == ContentType.ALBUM:
    return content_data['albums']
  elif content_type == ContentType.CD:
    return content_data['cds']
  elif content_type == ContentType.MIX:
    return content_data['mixes'][0],
  elif content_type == ContentType.SOUNDTRACK:
    return content_data['soundtracks']
  elif content_type == ContentType.KK:
    return content_data['kkSongs']
  elif content_type == ContentType.VIDEO:
    return content_data['videos']
  elif content_type == ContentType.CHARACTER_DECO:
    decos = []
    for character in content_data['characters']:
      decos.extend(character["deco"])
    return decos
  elif content_type == ContentType.DAILY_SOUNDTRACK:
    return content_data['dailysoundtracks']

def write_to_file(newsletter, filename):
    with open('../assets/newsletter/' + filename, 'w') as f:
        json.dump(newsletter, f, indent=4)
    with open('../assets/newsletter/newsletters.json', 'r') as f:
        data = json.load(f)
    if filename not in data['newsletters']:
        data['newsletters'].append(filename)
        with open('../assets/newsletter/newsletters.json', 'w') as f:
            json.dump(data, f, indent=4)
    else:
        print(f"The file '{filename}' is already in the list.")

def generate_newsletter(title, description):
    id = str(uuid.uuid4())
    time = datetime.now().strftime("%d-%m-%Y")
    newsletter = {
        "timestamp": time,
        "title": title,
        "description": description,
        "entries": [],
        "id": id
    }

    mappings = ContentTypeMapping()
    mappings.register(ContentType.GAME, mapper_games)
    mappings.register(ContentType.FILM, mapper_films)
    mappings.register(ContentType.ALBUM, mapper_albums)
    mappings.register(ContentType.SOUNDTRACK, mapper_soundtracks)
    mappings.register(ContentType.BOOK, mapper_books)
    mappings.register(ContentType.GALLERY, mapper_gallery)
    mappings.register(ContentType.VIDEO, mapper_videos)
    mappings.register(ContentType.CD, mapper_cds)
    mappings.register(ContentType.DURSTLOESCHER, mapper_durstloescher)
    mappings.register(ContentType.CHARACTER_DECO, mapper_character_deco)
    mappings.register(ContentType.MARIOKART, mapper_mariokart)
    mappings.register(ContentType.STITCH, mapper_stitches)
    mappings.register(ContentType.MIX, mapper_mixes)
    mappings.register(ContentType.KK, mapper_kk)
    mappings.register(ContentType.DAILY_SOUNDTRACK, mapper_daily_soundtracks)

    for content_type in ContentType:
        with open("../assets/" + content_type.value, 'r', encoding='utf-8', errors='ignore') as f:
            data = json.load(f)
        data = get_content_data(content_type, data)
        mapper = mappings.get_mapper(content_type)
        for item in data:
            if item["newsletter"] is False and no_future_daily_soundtrack(content_type, item):
                title, description, image, metadata = mapper(item)
                print(title)
                entry = {
                    "title": title,
                    "description": description,
                    "image": image,
                    "metadata": metadata,
                    "type": content_type.name
                }
                newsletter["entries"].append(entry)

    filename = "newsletter-" + time + ".json"
    write_to_file(newsletter, filename)

def no_future_daily_soundtrack(content_type, item):
    if content_type == ContentType.DAILY_SOUNDTRACK:
        item_date = datetime.strptime(item["day"], '%d-%m-%Y').date()
        today = datetime.today().date()
        if item_date > today:
            return False
    return True


def main():
    generate_newsletter("Fantasy holiday in Mallorca",
                        [
                          "Hello friends and family, welcome to my second newsletter! If you are receiving a notification about this via RSS, do let me know! I'm curious to see if anyone actually subscribed. So far nobody I've spoken to actually wants to do that.",
                          "First I want to tell you guys about a cool new thing on my website. I've now got a section on the homepage with a daily music recommendation! I wanted to make something that changes every day so visiting the site becomes more interesting. I love music so I figured it would be great to give you guys specific tracks for you to listen to. I already have the very extensive 'Albums' and 'Nintendo Soundtracks' sections for your perusal, but this will focus on individual tracks. If you like them, don't be afraid to react to them with the new reactions feature.",
                          "My plan is to write them all in advance, and hopefully I'll be able to keep on top of them. If I run out of juice eventually I'll think of something else. As always I love it when you give me feedback about this kind of stuff.",
                          "What's been happening in my life lately? Victor and I had a beautiful holiday in Mallorca just this past week and it was incredible. If you know me, you know I talk about Mexico a lot, but the Mexican beaches have nothing on these beaches. Victor took me to all his favourite spots and it was stunning - I'm talking Super Mario Odyssey Seaside Kingdom vibes. One thing I struggled with there was presence of Germans on the island. They are causing many problems there and it was hard to admit that I live in Germany and love it there. I felt quite embarrassed for Germany when hanging out with the Mallorcans.",
                          "Otherwise my busy summer is hopefully coming to an end. I regret that I haven't made time for DJing with Weyes this summer, but I've been confronted with being unable to have it all many times this year. But at least I started a new book (Ursula K Le Guin's Earthsea). I look forward to spending more time this Autumn getting into that, completing Hollow Knight: Silksong, and listening to the crap out of the Paper Mario soundtrack. I've also randomly gotten really into doing the daily crossword on the Guardian news app. I've learned so many new words already!"
                        ])

if __name__ == "__main__":
    main()
