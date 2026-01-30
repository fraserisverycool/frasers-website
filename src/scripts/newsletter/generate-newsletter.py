import json
import uuid
from datetime import datetime
from enum import Enum


class ContentType(Enum):
    GAME = 'data/games.json'
    FILM = 'data/films.json'
    ALBUM = "data/albums.json"
    SOUNDTRACK = "data/soundtracks.json"
    CONCERT = "data/concerts.json"
    BOOK = "data/books.json"
    GALLERY = "data/photos.json"
    VIDEO = "data/videos.json"
    CD = "data/cds.json"
    DURSTLOESCHER = "data/durstloescher.json"
    CHARACTER_DECO = "data/characters.json"
    MARIOKART = "data/mariokart.json"
    STITCH = "data/stitches.json"
    MIX = "data/mixes.json"
    KK = "data/kk.json"
    #DAILY_SOUNDTRACK = "data/daily-soundtracks.json"

class ContentTypeMapping:
    def __init__(self):
        self.map = {}

    def register(self, content_type, mapper_function):
        self.map[content_type] = mapper_function

    def get_mapper(self, content_type):
        return self.map[content_type]

def mapper_games(json_item):
    return json_item["name"], json_item["review"], "games/" + json_item["image"], "Vibes: " + json_item["vibes"] + ", Gameplay: " + json_item["gameplay"] + ", Platform: " + json_item["platform"] + ", Release: " + json_item["release"]

def mapper_films(json_item):
    return json_item["title"], [json_item["description"]], "films/" + json_item["filename"], "Release: " + json_item["release"]

def mapper_concerts(json_item):
    return json_item["artist"], [json_item["description"]], "music/concerts/" + json_item["image"], "Date: " + json_item["date"] + ", Venue: " + json_item["venue"]

def mapper_durstloescher(json_item):
    return json_item["name"], [json_item["description"]], "community/durstloescher/" + json_item["filename"], "Score: " + json_item["score"]

def mapper_books(json_item):
    return json_item["title"], [json_item["description"]], "books/" + json_item["filename"], "Author: " + json_item["author"] + ", Release: " + json_item["release"] + ", for the spoiler discussion please visit the books page!"

def mapper_gallery(json_item):
    return json_item["title"], None, "gallery/" + json_item["filename"], "For anecdotes about the pictures, please visit the gallery page!"

def mapper_videos(json_item):
    return json_item["title"], [json_item["description"]], None, "Link: " + json_item["link"]

def mapper_character_deco(json_item):
    return None, [json_item["description"]], "misc/characters/deco/" + json_item["filename"], None

def mapper_mariokart(json_item):
    return json_item["name"], [json_item["description"]], "misc/mariokart/" + json_item["image"], "Game: " + json_item["game"] + ", First Appearance: " + json_item["original"] + ", Fraser's ranking - music/vibes/track: " + json_item["music"] + "/" + json_item["vibes"] + "/" + json_item["track"]

def mapper_stitches(json_item):
    return None, [json_item["comment"]], "misc/stitch/" + json_item["filename"], None

def mapper_albums(json_item):
    return json_item["name"], json_item["description"], "music/albums/" + json_item["filename"], "Artist: " + json_item["artist"] + ", Release: " + json_item["releaseyear"] + ", for a list of favourite tracks, please visit the albums page!"

def mapper_cds(json_item):
    return json_item["album"], [json_item["description"]], "music/albums/" + json_item["image"], "Artist: " + json_item["artist"]

def mapper_mixes(json_item):
    return json_item["name"], [json_item["description"]], None, "For a download link, please visit the video game mixes page!"

def mapper_soundtracks(json_item):
    return json_item["name"], json_item["description"], "music/nintendo/" + json_item["filename"], "Platform: " + json_item["platform"] + ", for a list of favourite tracks, please visit the nintendo soundtracks page!"

def mapper_kk(json_item):
    return json_item["title"], [json_item["description"]], "music/nintendo/kk/" + json_item["filename"], "Tier: " + json_item["tier"]

# def mapper_daily_soundtracks(json_item):
#   metadata = "Day: " + json_item["day"] + ", Link: " + json_item["link"]
#   if json_item["game"]:
#     metadata = "Composer: " + json_item["artist"] + ", Game: " + json_item["album"] + ", " + metadata
#   else:
#     metadata = "Artist: " + json_item["artist"] + ", Album: " + json_item["album"] + ", " + metadata
#   return json_item["track"], [json_item["description"]], None, metadata

def get_content_data(content_type, content_data):
  if content_type == ContentType.GAME:
    return content_data['games']
  elif content_type == ContentType.FILM:
    return content_data['films']
  elif content_type == ContentType.CONCERT:
    return content_data['concerts']
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
  # elif content_type == ContentType.DAILY_SOUNDTRACK:
  #   return content_data['dailysoundtracks']

def write_to_file(newsletter, filename):
    with open('../../assets/newsletter/' + filename, 'w') as f:
        json.dump(newsletter, f, indent=4)
    with open('../../assets/data/newsletters.json', 'r') as f:
        data = json.load(f)
    if filename not in data['newsletters']:
        data['newsletters'].append(filename)
        with open('../../assets/data/newsletters.json', 'w') as f:
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
    mappings.register(ContentType.CONCERT, mapper_concerts)
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
    #mappings.register(ContentType.DAILY_SOUNDTRACK, mapper_daily_soundtracks)

    for content_type in ContentType:
        with open("../../assets/" + content_type.value, 'r', encoding='utf-8', errors='ignore') as f:
            data = json.load(f)
        data = get_content_data(content_type, data)
        mapper = mappings.get_mapper(content_type)
        for item in data:
            if item["newsletter"] is False:
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

# def no_future_daily_soundtrack(content_type, item):
#     if content_type == ContentType.DAILY_SOUNDTRACK:
#         item_date = datetime.strptime(item["day"], '%d-%m-%Y').date()
#         today = datetime.today().date()
#         if item_date > today:
#             return False
#     return True


def main():
  generate_newsletter("Moved by music",
                      [
                        "As I listen to all my favourite songs, working hard on the 'daily soundtracks' part of this website, I am once again reminded that I am moved by music so easily and so regularly. I've already prepared song recommendations all the way up until July and it has been an utter delight. Whenever I remember a great song, I go down a rabbit hole and fill up the page with more and more of my favourite music. I've also realised that making the music player has been great for me, because it's a way I can listen to all my favourite tracks in a way that I would like. I have every intention of going crazy with this and letting hundreds of amazing songs and tracks fill up this raspberry pi, if nothing else for me, so that I can listen to it whenever I want.",
                        "I nice thing about this website is that it's largely separated from the wider internet (with the exception of Cloudflare - they do my DNS and security and it's simply not worth doing that myself). People are talking about doomsday scenarios where services like Spotify disappear and suddenly all the music files are gone. We will be fine, there are cool initiatives (check out Anna's Archive, recently sued by Spotify) who are scraping the company data for public use. But it just feels nice to be starting my own little collection of beautiful little music, which will always be there for me. And if the internet goes down, I will just host it raw on my raspberry pi for anyone who's in my apartment. It'll be like a CD collection.",
                        "This week, Victor broke up with me. It's been a real emotional rollercoaster. But I've listened to a lot of music, and feeling more sensitive than usual, have found myself ultra-connecting with it all. Any remotely sad song, even if it's completely unrelated to my life, I've been shedding tears. On the day of dumping it was 'To Be Loved' by Adele. The next day it was 'Lord Let That Tesla Crash' by my new obsession CMAT, which isn't even about love and relationships, but I still cried. Today I cried to 'The Linden Trees Are Still In Blosson' from Jens Lekman which is entirely unrelated but god. It hits.",
                        "My main coping mechanism for bad times is to be very productive and do many things, which is why I'm happy to say that I finished a text-based adventure that I've been working on since forever! I finally got round to writing all the various endings and trying to bring it all together. It was tough and I don't think I'm a good writer, but it's quite short, and it might be a fun 15 minute read for you! It's available on the 'miscellaneous' section of my website. If you spot some typos, please let me know. If anyone is interested in also making one, I used a program called 'Twine 2' which is great, I really recommend it."
                      ])

if __name__ == "__main__":
    main()
