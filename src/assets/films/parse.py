import json
from bs4 import BeautifulSoup

# Your HTML content
html_content = """
  <div class='film-review mt-4'>
    <h2>In from the Side</h2>
    <p>Fun film about a gay rugby team, but which featured absolutely no homophobia. It gets a high score from me because the main dude is so hot</p>
    <img src='../../../assets/films/in-from-the-side.jpg' width='600'>
  </div>

  <div class='film-review mt-4'>
    <h2>Lonesome</h2>
    <p>A bit over the top gay film set in Australia. This was my second ever Kino-cumshot</p>
    <img src='../../../assets/films/lonesome.jpeg' width='600'>
  </div>

  <div class='film-review mt-4'>
    <h2>The Banshees of Inisherin</h2>
    <p>Deeply upsetting film about depression in rural Ireland. Very beautiful</p>
    <img src='../../../assets/films/banshees.webp' width='600'>
  </div>

  <div class='film-review mt-4'>
    <h2>The Menu</h2>
    <p>Didn't understand the point of this film. Why did she order a burger and why was it such a big deal</p>
    <img src='../../../assets/films/the-menu.jpg' width='600'>
  </div>

  <div class='film-review mt-4'>
    <h2>The Blue Caftan</h2>
    <p>Lovely film set in Morocco about embroidery. Just lovely. Quite long</p>
    <img src='../../../assets/films/blue-caftan.webp' width='600'>
  </div>

  <div class='film-review mt-4'>
    <h2>Futur Drei</h2>
    <p>Delightful film about second generation Iranian kids in Germany. Eye opening</p>
    <img src='../../../assets/films/futur-drei.jpg' width='600'>
  </div>

  <div class='film-review mt-4'>
    <h2>Past Lives</h2>
    <p>Great opening scene. Loved humanising the American ‘villain’ character. Memorable film</p>
    <img src='../../../assets/films/past-lives.jpg' width='600'>
  </div>

  <div class='film-review mt-4'>
    <h2>Dipped in Black</h2>
    <p>Kinda boring depiction of transness in native American communities</p>
    <img src='../../../assets/films/dipped-in-black.jpg' width='600'>
  </div>

  <div class='film-review mt-4'>
    <h2>Orlando</h2>
    <p>So boring, a theatre type film about Virginia Woolf and trans people</p>
    <img src='../../../assets/films/orlando.jpg' width='600'>
  </div>

  <div class='film-review mt-4'>
    <h2>Tár</h2>
    <p>Great music, compelling story. Weird and uncomfortable world of conducting orchestras. The film is way too long</p>
    <img src='../../../assets/films/tar.jpg' width='600'>
  </div>

  <div class='film-review mt-4'>
    <h2>Lucky Strike</h2>
    <p>Korean thriller, it was good but I was sleepy on a plane watching it. Not very memorable</p>
    <img src='../../../assets/films/lucky-strike.jpg' width='600'>
  </div>

  <div class='film-review mt-4'>
    <h2>The Unbearable Weight of Massive Talent</h2>
    <p>So cringe but I have to admit that I laughed a lot. It's a film about Nick Cage.</p>
    <img src='../../../assets/films/unbearable-weight.webp' width='600'>
  </div>

  <div class='film-review mt-4'>
    <h2>The Whale</h2>
    <p>Devastating film. Ugly sobbing in the aeroplane. Watching him shovel in the food in such a self destructive way as a response to his self hatred is so painful </p>
    <img src='../../../assets/films/the-whale.png' width='600'>
  </div>

  <div class='film-review mt-4'>
    <h2>Roter Himmel</h2>
    <p>Mongay film where the main dude is so unlikeable and so rude to the other characters that it affects the enjoyment of the film </p>
    <img src='../../../assets/films/roter-himmel.jpg' width='600'>
  </div>

  <div class='film-review mt-4'>
    <h2>The Super Mario Movie</h2>
    <p>Loved it. As a Nintendo fan this was a must watch. Why the fuck did they have licensed music in it</p>
    <img src='../../../assets/films/super-mario.webp' width='600'>
  </div>

  <div class='film-review mt-4'>
    <h2>El Houb</h2>
    <p>Devastating esposé on homophobic Arabic culture in Morocco. A strong willed man is determined to make his family understand that gay is fine </p>
    <img src='../../../assets/films/el-houb.jpg' width='600'>
  </div>

  <div class='film-review mt-4'>
    <h2>The Swimmer</h2>
    <p>What's it like being gay in an Israeli swimming team? Not that inspiring</p>
    <img src='../../../assets/films/swimmer.jpg' width='600'>
  </div>

  <div class='film-review mt-4'>
    <h2>Große Freiheit</h2>
    <p>This film totally stayed with me, even though the Austrian characters were hard to understand without subtitles. At the end when he goes cruising is very hard hitting</p>
    <img src='../../../assets/films/grosse-freiheit.webp' width='600'>
  </div>

  <div class='film-review mt-4'>
    <h2>Bis ans Ende der Nacht</h2>
    <p>Cool film about a trans woman and an interesting plot. Also quite forgettable</p>
    <img src='../../../assets/films/bis-ans-ende.webp' width='600'>
  </div>

  <div class='film-review mt-4'>
    <h2>Mon Crime</h2>
    <p>Fantastic lesbian nonsense! Delicious french film about women being successful</p>
    <img src='../../../assets/films/mon-crime.jpg' width='600'>
  </div>

  <div class='film-review mt-4'>
    <h2>Asteroid City</h2>
    <p>Silly film leaning heavily into the vibes but was actually kinda boring to watch</p>
    <img src='../../../assets/films/asteroid-city.jpg' width='600'>
  </div>

  <div class='film-review mt-4'>
    <h2>Firebird</h2>
    <p>What's it like to be gay in the Russian military, except they don't even speak Russian!</p>
    <img src='../../../assets/films/firebird.jpg' width='600'>
  </div>

  <div class='film-review mt-4'>
    <h2>Concerned Citizen</h2>
    <p>A film about gay men gentrifying a poor neighbourhood in Israel which hit me hard because I feel strongly about this topic</p>
    <img src='../../../assets/films/concerned-citizen.jpg' width='600'>
  </div>

  <div class='film-review mt-4'>
    <h2>Heartbeats</h2>
    <p>Film about a gay guy and a girl falling in love with the same hot guy. Some hilarious moments, highly enjoyable </p>
    <img src='../../../assets/films/heartbeats.png' width='600'>
  </div>

  <div class='film-review mt-4'>
    <h2>Drifter</h2>
    <p>This is about a boring countryside gay man becoming a Berlin queer. I really saw myself in him</p>
    <img src='../../../assets/films/drifter.jpg' width='600'>
  </div>

  <div class='film-review mt-4'>
    <h2>Passages</h2>
    <p>Like it's good, but I didn't enjoy it. Something about films with unlikeable main characters</p>
    <img src='../../../assets/films/passages.webp' width='600'>
  </div>

  <div class='film-review mt-4'>
    <h2>Rotting in the Sun</h2>
    <p>Film about gay expats in Mexico, definitely saw myself in it. It was hilarious and wild. Loses tension a bit in the second half</p>
    <img src='../../../assets/films/rotting.webp' width='600'>
  </div>

  <div class='film-review mt-4'>
    <h2>Fallen Leaves</h2>
    <p>Beautiful film about poverty in Finland. Has a heavy 60s/70s vibe but is in the present day</p>
    <img src='../../../assets/films/fallen-leaves.jpg' width='600'>
  </div>

  <div class='film-review mt-4'>
    <h2>Burning Days</h2>
    <p>Small town Turkey with a pretty interesting plot. I enjoyed it. Gay themes</p>
    <img src='../../../assets/films/burning-days.png' width='600'>
  </div>

  <div class='film-review mt-4'>
    <h2>The Beast in the Jungle</h2>
    <p>Cool view into a Paris nightclub over the years but didn't take away much else from this film</p>
    <img src='../../../assets/films/beast-in-the-jungle.webp' width='600'>
  </div>

  <div class='film-review mt-4'>
    <h2>Where Butterflies Don't Fly</h2>
    <p>Gay schoolteacher and pupil trapped in a cave together. Really well handled and suspenseful, enjoyable film</p>
    <img src='../../../assets/films/where-butterflies.webp' width='600'>
  </div>

  <div class='film-review mt-4'>
    <h2>Golden Delicious</h2>
    <p>Cheesy American gay film nonsense</p>
    <img src='../../../assets/films/golden-delicious.jpg' width='600'>
  </div>

  <div class='film-review mt-4'>
    <h2>Arrête Avec tes Mensonges</h2>
    <p>Boring film about an old french famous person who used to love a man</p>
    <img src='../../../assets/films/arrete.jpg' width='600'>
  </div>

  <div class='film-review mt-4'>
    <h2>Wir Werden Unsterblich Sein</h2>
    <p>Hilariously bad film from Saarland. A gay thriller with terrible acting and editing</p>
    <img src='../../../assets/films/unsterblich.jpg' width='600'>
  </div>

  <div class='film-review mt-4'>
    <h2>Horseplay</h2>
    <p>Deeply harrowing film about lads on holiday. Explains the deep rooted homophobia in Argentina</p>
    <img src='../../../assets/films/horseplay.jpg' width='600'>
  </div>

  <div class='film-review mt-4'>
    <h2>In Bed</h2>
    <p>Really good film set almost entirely in a bedroom during a dramatic time about a hot gay guy who spirals downwards</p>
    <img src='../../../assets/films/in-bed.jpg' width='600'>
  </div>
"""

# Parse HTML content
soup = BeautifulSoup(html_content, 'html.parser')

# Find all film reviews
film_reviews = soup.find_all('div', class_='film-review')

# Initialize JSON data structure
json_data = {
  "films": []
}

# Loop through each film review
for review in film_reviews:
  title = review.find('h2').text
  description = review.find('p').text
  filename = review.find('img')['src'].split('/')[-1]

  # Add film data to JSON
  json_data['films'].append({
    "filename": filename,
    "title": title,
    "description": description
  })

# Save JSON data to file
print(json.dumps(json_data, file, indent=2, ensure_ascii=False))

print("JSON file saved successfully.")
