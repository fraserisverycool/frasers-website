import json

with open('../assets/gallery/gallery.json', encoding='utf-8') as f:
  data = json.load(f)

new_data = []
for picture in data['pictures']:
  new_data.append({
    'unmasked': picture['unmasked'],
    'description': picture['description'],
    'answer': picture['answer'],
    'id': picture['id']
  })

with open('secrets.json', 'w', encoding='utf-8') as f:
  json.dump(new_data, f, ensure_ascii=False, indent=4)
