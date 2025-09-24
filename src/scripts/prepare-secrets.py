import json
import requests

def make_api_call(id, anecdote, answers, unmasked):
  url = "https://worldpeace.services/api/anecdote{}".format(id)
  #url = "http://localhost:3000/api/anecdote/{}".format(id)
  headers = {'Content-Type': 'application/json'}

  data = {
    "anecdote": anecdote,
    "answers": answers,
    "unmasked": unmasked
  }

  response = requests.put(url, headers=headers, json=data)

  if response.status_code == 204:
    print("Successfully updated anecdote with id: {}".format(id))
  else:
    print("Failed to update anecdote with id: {}".format(id))

with open('secrets.json', encoding='utf-8') as f:
  data = json.load(f)

for picture in data:
  make_api_call(picture['id'], picture['description'], picture['answer'], picture['unmasked'])

