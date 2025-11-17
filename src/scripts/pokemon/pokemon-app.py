import json
import os
import random
from flask import Flask, render_template_string, request, send_from_directory

IMAGE_FOLDER = "pokemon_images"
DATA_FILE = "pokemon_data.json"
TIERS_FILE = "../../assets/data/pokemon.json"

TIER_LABELS = {
  "SS": "Best of the best",
  "S": "Stunning, beautiful",
  "A": "Love it",
  "B": "Actually a great Pokémon",
  "C": "It's alright, she's fine",
  "D": "Doesn't speak to me",
  "E": "Actively dislike this",
  "F": "Hate it, ugly"
}

TIERS = list(TIER_LABELS.keys())

with open(DATA_FILE, "r", encoding="utf-8") as f:
  pokemon_list = json.load(f)

if os.path.exists(TIERS_FILE):
  with open(TIERS_FILE, "r", encoding="utf-8") as f:
    pokemon_tiers = json.load(f)
else:
  pokemon_tiers = {tier: [] for tier in TIERS}

ranked_images = {p["image"] for tier in TIERS for p in pokemon_tiers[tier]}
unranked = [p for p in pokemon_list if p["image"] not in ranked_images]

random.shuffle(unranked)

app = Flask(__name__)


HTML = """
<!DOCTYPE html>
<html>
<head>
    <title>Pokémon Tier Maker</title>
    <style>
        body { text-align: center; font-family: Arial; margin-top: 30px; }
        img { max-height: 350px; margin: 20px; }
        button {
            font-size: 18px;
            padding: 10px 20px;
            margin: 6px;
            cursor: pointer;
        }
        h2 { margin-bottom: 0; }
        .subtitle { margin-top: 5px; color: #666; }
        .finished {
            font-size: 28px;
            margin-top: 40px;
        }
    </style>
</head>
<body>
    {% if pokemon %}
        <h2>#{{pokemon.number}} - {{pokemon.name}}</h2>
        <div class="subtitle">{{remaining}} Pokémon remaining</div>

        <img src="/image/{{pokemon.image}}">

        <div>
            {% for t in tiers %}
                <form method="POST" style="display:inline;">
                    <input type="hidden" name="image" value="{{pokemon.image}}">
                    <input type="hidden" name="tier" value="{{t}}">
                    <button type="submit">{{t}} - {{labels[t]}}</button>
                </form>
            {% endfor %}
        </div>

    {% else %}
        <div class="finished">
            <h1>🎉 All Pokémon Ranked!</h1>
            <p>Your results are saved in <b>pokemon.json</b></p>
        </div>
    {% endif %}
</body>
</html>
"""

@app.route("/", methods=["GET", "POST"])
def index():
  global unranked

  if request.method == "POST":
    image = request.form["image"]
    tier = request.form["tier"]

    poke = next(p for p in pokemon_list if p["image"] == image)
    pokemon_tiers[tier].append(poke)

    with open(TIERS_FILE, "w", encoding="utf-8") as f:
      json.dump(pokemon_tiers, f, indent=4, ensure_ascii=False)

    unranked = [p for p in unranked if p["image"] != image]

  pokemon = unranked[0] if unranked else None

  return render_template_string(
    HTML,
    pokemon=pokemon,
    tiers=TIERS,
    labels=TIER_LABELS,
    remaining=len(unranked)
  )

@app.route("/image/<path:filename>")
def image(filename):
  return send_from_directory(IMAGE_FOLDER, filename)

if __name__ == "__main__":
  app.run(debug=True, port=5000)
