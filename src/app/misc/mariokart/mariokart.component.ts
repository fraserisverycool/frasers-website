import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {HttpClient} from "@angular/common/http";

interface Track {
  id: number;
  name: string;
  game: string;
  originalgame: string;
  music: number;
  vibes: number;
  track: number;
  ranking: number;
  description: string;
  image: string;
}

@Component({
  selector: 'app-mariokart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mariokart.component.html',
  styleUrls: ['./mariokart.component.css']
})
export default class MariokartComponent implements OnInit{
  tracks: Track[] = [];
  originalTracks: Track[] = [];
  currentFilter: string = "";

  gameMap = {
    'snes': 'Super Mario Kart',
    'n64': 'Mario Kart 64',
    'gba': 'Mario Kart: Super Circuit',
    'gcn': 'Mario Kart: Double Dash!!',
    'ds': 'Mario Kart DS',
    'wii': 'Mario Kart Wii',
    '3ds': 'Mario Kart 7',
    'mk8': 'Mario Kart 8 Deluxe',
  };

  gameDescription = {
    'snes': "The original and OG game! I never played this one as a child, instead just coming back to it as an adult. It's really hard but you can get the knack of it if you play for a bit. This is early days so they didn't have unique tracks, instead having Mario Circuit 1, 2 etc. In fact there are four Mario Circuits which is excessive. For this ranking I put all the themed circuits together even if there is some variation between the tracks because I wanted at least some level of consistency for this game that I have played the least out of all of the Mario Karts.",
    'n64': "The Nintendo 64 Mario Kart was so fucking iconic. It created the Mario Kart vibe as we know it today. It is so nostalgic and just being from this game makes most tracks instant classics. Seeing these tracks remade so many times is a total pleasure because they are so special.",
    'gba': "Super Circuit is lowkey a super fun game. It's hard to get used to when going on 150cc yes but it's still a lot of fun! They take the Super Mario Kart formula and modernise it, also creating some really inspired themed circuits. The latter half of the tracks tend to have a lot of difficult 90 degree turns and other bullshit, which makes it less fun. For some reason, there are four Bowser's Castles. I ended up ranking them together because their vibes are so similar but that fourth one is just ridiculous.",
    'gcn': 'Mario Kart: Double Dash!!',
    'ds': 'Mario Kart DS',
    'wii': 'Mario Kart Wii',
    '3ds': "This is in my opinion the weakest Mario Kart. It doesn't bring much to the table in terms of gameplay, and definitely not when it comes to fun and unique racetracks. Music-wise we're working with an ugly, tinny-sounding set of instruments. I will admit that its selection of retro tracks is excellent though (as is reflected by this ranking). Full disclosure, I haven't played this one as much as other ones, in fact I never even owned it, but rather borrowed it from my friend Andrew for a few weeks.",
    'mk8': 'Mario Kart 8 Deluxe',
  };

  pageDescription = "Welcome to my ranking of every Mario Kart track ever. This is an exhaustive list featuring everything because I love it when lists are complete. What's that, I hear you say? Mario Kart Tour and Mario Kart Arcade GP aren't represented? Fuck you! Those aren't real games. If it means that Piranha Plant Pipeline gets forgotten to history, so be it! A quick note about these rankings, you might notice that the order doesn't correspond with the number of stars I give to each track. That's fine. These rankings come from the heart, and won't necessarily follow the rules. You've been warned!"

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadTracks();
  }

  loadTracks(): void {
    this.http.get<{ tracks: Track[] }>('assets/misc/mariokart/mariokart.json').subscribe({
      next: (data) => {
        this.originalTracks = data.tracks;
        this.filterTracks('gba');
      },
      error: (err) => {
        console.error('Failed to load tracks:', err);
      },
    });
  }

  orderUnchanged = (): number => {
    return 0;
  }

  filterTracks(criteria: string): void {
    let gameName = this.gameMap[criteria as keyof typeof this.gameMap];
    if (gameName) {
      this.tracks = [...this.originalTracks]
        .filter((track) => track.game === gameName)
        .sort((a, b) => a.ranking - b.ranking);
        //.sort((a, b) => a.name.localeCompare(b.name));
      this.currentFilter = criteria;
      this.tracks.forEach(track => console.log(track.name));
    } else {
      console.error('Invalid filtering criteria');
    }
  }

  getKeyByValue(object: Record<string, string>, value: string): string | undefined {
    return Object.keys(object).find(key => object[key] === value)?.toUpperCase();
  }
}

