from xml.dom.minidom import parseString

from feedgenerator import Rss201rev2Feed
import os
import datetime
import json
import glob

RSS_FILENAME = "../assets/newsletter.rss"
NEWSLETTERS_DIR = "../assets/newsletter"

def prettify_xml(xml_str):
  dom = parseString(xml_str)
  return dom.toprettyxml(indent="  ")


def create_feed_entry(newsletter):
  description = '\n'.join(newsletter['description'])
  for entry in newsletter['entries']:
    description += f"\n{entry['title']}\n{entry.get('metadata', '')}\n{' '.join(entry.get('description', []))}\n{entry.get('image', '')}"

  pubdate = datetime.datetime.strptime(newsletter['timestamp'], "%d-%m-%Y")

  return {
    "title": newsletter['title'],
    "link": "https://your.newsletter.site/newsletters/newsletter-" + str(newsletter['timestamp']),
    "description": description,
    "pubdate": pubdate
  }


def get_newsletters():
  newsletter_files = glob.glob(os.path.join(NEWSLETTERS_DIR, "newsletter-*.json"))

  newsletters = []
  for file in newsletter_files:
    with open(file, "r") as f:
      newsletter = json.load(f)
      newsletters.append(create_feed_entry(newsletter))

  newsletters.sort(key=lambda x: x['pubdate'], reverse=True)

  return newsletters


def generate_rss_file(newsletters):
  feed = Rss201rev2Feed(
    title="Fraser's Newsletter",
    link="https://worldpeace.services/newsletter",
    description="Welcome to my newsletter! I started making this website at the start of 2025 and I've enjoyed growing it to where it is today. I get that it's hard to constantly check the site for updates, so to make things easier for you guys, I've prepared a newsletter which features all the new content from the website whenever I update it",
    language="en",
  )

  for newsletter in newsletters:
    feed.add_item(
      title=newsletter["title"],
      link=newsletter["link"],
      description=newsletter["description"],
      pubdate=newsletter["pubdate"])

  xml_string = feed.writeString('utf-8')
  pretty_xml_string = prettify_xml(xml_string)

  with open(RSS_FILENAME, 'w', encoding='utf-8') as f:
    f.write(pretty_xml_string)


def main():
  newsletters = get_newsletters()
  generate_rss_file(newsletters)


if __name__ == "__main__":
  main()
