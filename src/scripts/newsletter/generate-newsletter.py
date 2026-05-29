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
    spoiler = ""
    if json_item["spoiler"]:
        spoiler = ", for the spoiler discussion please visit the films page!"
    return json_item["title"], [json_item["description"]], "films/" + json_item["filename"], "Release: " + json_item["release"] + spoiler

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
  generate_newsletter("Landlords",
                      [
                        "Hello and welcome to another newsletter, this time it's landlord edition. I've been struggling to get my head around how some people in a place like Germany have enough money to buy property, and yes, even though you spend your whole life paying off a mortgage, you own that property and can rent it out, or live there and pay no rent yourself.",
                        "If you're one of those lucky people, and you choose to rent out your flat, then someone is paying you hundreds of euros a month, simply because you own the thing. You're not even providing a service to that person, it's just because you own it and they don't. Sure, rents these days consist of many things, and lots of Nebenkosten are involved, but ultimately, the Kaltmiete that is being transferred is only happening because someone else got to that point where they could buy the flat.",
                        "I reckon most homeowners are just privileged motherfuckers who aren't inherently better than renters. I reckon we've reached such a point in capitalism in western Europe that this is mainly old money that is buying property. It's not the case that people who work the hardest get to own property. Also, once you pay off your mortgage, then suddenly you have passive income and can just work less! It doesn't seem fair. And that's because it isn't, because capitalism.",
                        "Anyway, I've decided to become a landlord. The last 8 years of working as a software developer as well as living pretty frugally has led to enough Eigenkapital to put down a down payment for a 2 room flat. I've decided to do it as a 'Kapitalanlage', somewhere safe to put my money, and hopefully the value of the property will appreciate and resist the inevitable inflation nonsense that will hit when various world crises happen. It was either this or speculate on stocks and shares, something which I'm fundamentally struggling with. Like, do I have do that?",
                        "A friend of mine is moving into the flat, and I'll stay in my cheap rental flat. I think it's best money-wise this way, and it means I don't have to leave my lovely flat. All I have to do is concentrate really hard and not be a dickhead landlord. It turns out it's really easy to do that: you just follow the rules and do Mietspiegel price and give an unlimited contract. I will start receiving passive income from the tenant, but I will also be paying off the mortgage for like 20 years so I'm not going to feel like a true capitalist for a while, I don't think.",
                        "In other news, I added a fun feature to the website's homepage. You can upload an image there, and it will display in my house! I attached a tiny monitor to the raspberry pi that this website is running on. I think it could lead to some fun shenanigans. All you need is my wifi password (you can just ask me for that)."
                      ])

if __name__ == "__main__":
    main()
