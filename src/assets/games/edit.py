import json

def filter_games_by_year(data, year):
  filtered_games = [game for game in data["games"] if game["year"] == year]
  return {"games": filtered_games}

with open('games.json', 'r', encoding='utf-8') as file:
  data = json.load(file)

with open('order.txt', 'r', encoding='utf-8') as file:
  order = [name.strip() for name in file.readlines()]

filtered_data = filter_games_by_year(data, '2020')

gamess = [game["name"] for game in filtered_data["games"]]
print("\n".join(gamess))

for idx, game in enumerate(filtered_data["games"]):
    game['score'] = len(filtered_data["games"]) - idx

name_to_game = {game["name"]: game for game in filtered_data["games"]}

reordered_games = []
for name in order:
    if name in name_to_game:
        reordered_games.append(name_to_game[name])

filtered_data["games"] = reordered_games

print(json.dumps(filtered_data, indent=2))
