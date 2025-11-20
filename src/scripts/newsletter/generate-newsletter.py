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
  generate_newsletter("Entitled to Nintendo Music",
                      [
                        "Hey everyone, it's me again. Quick update about the website: I added some TV shows to the Films section. I also made a tierlist of every pokemon! It was a lot of fun and it took me a whole morning. I'm thinking about slowly ranking the pokemon within the tiers later, but we'll see. Interestingly, for that page I added over 1000 images to the website and it hit me that this website in total has around 3000 images, and a bunch of mp3s on the music page. I then spent an entire afternoon and evening reorganising my images and assets and now the website is lightweight again! Even myself I feel a little spring in my step, like a burden has been lifted from my shoulders. Anyway, on to today's main topic...",
                        "As regular visitors of this site might know, my year has been drastically improved by the appearance of the new Nintendo Music App. One of the biggest parts of this site is my weekly reviews of each new release. I love it so much, I've even started observing a strange kind of mysticism in which the kind of soundtrack released on a Tuesday dictates what kind of week I'm going to have. As somebody who doesn't tolerate astrology I know that it's bullshit but I can't help but think about it whenever I am delighted or disappointed by a particular release.",
                        "It's a very niche interest. Not many people I know love Nintendo music to the extent that I do. It means it's a struggle to find people to be enthusiastic about the release on Tuesday with. That's why I'm eternally grateful to my two mates from home, Oscar and Andrew who are actually willing to discuss and rate each soundtrack when it comes! We have a little Whatsapp group for it and I honestly love it so much. As I write this, I'm listening to the Wii Fit soundtrack, which is full of surprising bangers, thinking that my week has the potential to be 'surprisingly good' and in general appreciating this era of Nintendo music vibes. It's so good.",
                        "Recently I found myself wondering if anyone else out there is living their lives week to week like me, just waiting for the next release. Surely there are others who have spend the last decades lamenting the lack of official releases of these classic soundtracks? Surely other people are as excited as me by having a full on feature-rich app with a bunch of these OSTs on them, having them drip-fed to us? So I went onto reddit.com.",
                        "I've been on reddit.com a couple of times and I almost always have a bad time. I get that it has real people on there, one of the few places left that does. But everytime I visit I'm reminded how they're all Americans there, and they're all Negative Nancies. They just complain! I found a subreddit r/nintendomusic where there is a bunch of spam, and then each week a thread about the week's release in the app. Excited I clicked on Wii Fit's release and all I see are a bunch of sarky comments about they don't get a real soundtrack like Mario or Zelda, how shit the app is, etc. etc.",
                        "This bothers me so much because a) the app comes free with the already insanely cheap Nintendo Switch Online subscription. They were paying for this thing already and then bam, free music app to go with it. Then with each release, they go onto reddit.com and complain! They feel entitled to more. Why not release the app with all the soundtracks on it already? How dare they release Wii Fit when Majora's Mask isn't even on there yet? These keyboard warriors need to calm down, do some deep breathing and just enjoy the Wii Fit soundtrack.",
                        "I mean I too have been disappointed by the initial catalog and certain releases (looking at you OOT 3D and Metroid 2) but I've learned to appreciate what I'm given. Occassionally there is an amazing release (Paper Mario, TOTK) which catapults me into two weeks of reliving those games and I love it so much. If they gave us everything from the beginning for free, I don't think I would be as hooked on the app as I am. Also, I have to say that as an app developer myself I get it. Making features takes ages and writing content takes ages. These soundtracks all have screenshots as artwork, playlists associated with each track, and all the work behind getting the soundtracks themselves. It's a bunch of work and I get it.",
                        "Maybe people feel entitled to this music because it's all available on Youtube for free already. That's fair enough, and to be fair, only on this one subreddit I actually found any discussion on it. I think most people completely ignore this app. Anyway, at least on this website you can read largely positive reviews of each soundtrack. This isn't social media so I'm allowed to say nice things!",
                        "Here's hoping that it continues, becoming an exhaustive bank of great music over the coming years. I'll be there every step of the way. Love live the Nintendo Music App!"
                      ])

if __name__ == "__main__":
    main()
