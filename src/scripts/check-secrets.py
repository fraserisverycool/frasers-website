import requests

def get_anecdotes():
  #url = "https://worldpeace.services/api/anecdote"
  url = "http://localhost:3000/api/anecdote"

  response = requests.get(url)

  if response.status_code == 200:
    anecdotes = response.json()
    print(anecdotes)
  else:
    print(f"Request failed with status code: {response.status_code}, error message: {response.text}")

get_anecdotes()
