import os
import datetime
import json
import glob
from xml.dom.minidom import parseString

import pytz

RSS_FILENAME = "../assets/newsletter.rss"
NEWSLETTERS_DIR = "../assets/newsletter"

def prettify_xml(xml_str):
  dom = parseString(xml_str)
  return dom.toprettyxml(indent="  ")


def create_feed_entry(newsletter):
  entries = []
  for entry in newsletter['entries']:
    if isinstance(entry.get('description', []), list):
      description = '<br>'.join(entry.get('description', []))
    else:
      description = entry.get('description', '')
    img_tag = f'<img src="https://worldpeace.services/{entry.get("image", "")}" alt="{entry.get("title")}">' if entry.get('image') else ''
    entries.append(f'''
            <h2>{entry['title']}</h2>
            <p><em>{entry.get('metadata', '')}</em></p>
            <p>{description}</p>
            {img_tag}
        ''')

  newsletter_description = '<br>'.join(newsletter.get('description', []))

  description = f'<p>{newsletter_description}</p>' + '\n'.join(entries)

  pubdate = datetime.datetime.strptime(newsletter['timestamp'], "%d-%m-%Y")

  description = f"<![CDATA[{description}]]>"

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
  rss_header = '<?xml version="1.0"?><rss xmlns:atom="http://www.w3.org/2005/Atom" version="2.0"><channel>'
  rss_header += '<title>Fraser\'s Newsletter</title>'
  rss_header += '<link>https://worldpeace.services/newsletter</link>'
  rss_header += '<description>Welcome to my newsletter! I started making this website at the start of 2025 and I\'ve enjoyed growing it to where it is today. I get that it\'s hard to constantly check the site for updates, so to make things easier for you guys, I\'ve prepared a newsletter which features all the new content from the website whenever I update it. If you\'re struggling to read the RSS feed it\s fine, I get it. You can just read it directly on my website! https://worldpeace.services/newsletter</description>'
  rss_header += '<language>en</language>'

  rss_body = ""
  tz = pytz.timezone('Europe/Berlin')

  for newsletter in newsletters:
    rss_body += '<item>'
    rss_body += f'<title>{newsletter["title"]}</title>'
    rss_body += f'<link>{newsletter["link"]}</link>'
    rss_body += f'<description>{newsletter["description"]}</description>'
    rss_body += f'<pubDate>{newsletter["pubdate"].replace(tzinfo=tz).strftime("%a, %d %b %Y %H:%M:%S %z")}</pubDate>'
    rss_body += '</item>'

  rss_footer = '</channel></rss>'

  rss_feed = rss_header + rss_body + rss_footer

  with open(RSS_FILENAME, 'w', encoding='utf-8') as f:
    f.write(rss_feed)


def main():
  newsletters = get_newsletters()
  generate_rss_file(newsletters)


if __name__ == "__main__":
  main()
