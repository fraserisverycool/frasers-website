import {Component, OnInit} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import {HttpClient} from "@angular/common/http";

interface Track {
  id: number;
  name: string;
  game: string;
  original: string;
  music: number;
  vibes: number;
  track: number;
  ranking: number;
  description: string;
  image: string;
  nextGame: string;
  previousGame: string;
}

@Component({
  selector: 'app-mariokart',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './mariokart.component.html',
  styleUrls: ['./mariokart.component.css']
})
export default class MariokartComponent implements OnInit{
  tracks: Track[] = [];
  originalTracks: Track[] = [];
  currentFilter: string = "";

  gameMap: { [key: string]: string } = {
    'snes': 'Super Mario Kart',
    'n64': 'Mario Kart 64',
    'gba': 'Mario Kart: Super Circuit',
    'gcn': 'Mario Kart: Double Dash!!',
    'ds': 'Mario Kart DS',
    'wii': 'Mario Kart Wii',
    '3ds': 'Mario Kart 7',
    'mk8': 'Mario Kart 8 Deluxe'
  };

  gameDescription: { [key: string]: string }  = {
    'snes': "The original and OG game! I never played this one as a child, instead just coming back to it as an adult. It's really hard but you can get the knack of it if you play for a bit. This is early days so they didn't have unique tracks, instead having Mario Circuit 1, 2 etc. In fact there are four Mario Circuits which is excessive. For this ranking I put all the themed circuits together even if there is some variation between the tracks because I wanted at least some level of consistency for this game that I have played the least out of all of the Mario Karts.",
    'n64': "The Nintendo 64 Mario Kart was so fucking iconic. It created the Mario Kart vibe as we know it today. It is so nostalgic and just being from this game makes most tracks instant classics. Seeing these tracks remade so many times is a total pleasure because they are so special.",
    'gba': "Super Circuit is lowkey a super fun game. It's hard to get used to when going on 150cc yes but it's still a lot of fun! They take the Super Mario Kart formula and modernise it, also creating some really inspired themed circuits. The latter half of the tracks tend to have a lot of difficult 90 degree turns and other bullshit, which makes it less fun. For some reason, there are four Bowser's Castles. I ended up ranking them together because their vibes are so similar but that fourth one is just ridiculous.",
    'gcn': "I borrowed this game from a friend when I was younger and played the shit out of it, but I never truly loved it like I love the other Mario Karts. Playing it back as an adult I realise that the drifting mechanics aren't up to scratch, and that playing multiplayer where you're just on the back throwing items is really boring. Nonetheless this game brought a new kind of vibe to the series, some although admittedly not many original tracks, and created what I lovingly call the Mario Kart Whistle, which features prominently in the soundtrack.",
    'ds': "I played the shit out this! We used to play it constantly at school, and on school trips we would use the free download play option to play with lots of people. This was awesome, but you were only allowed to play on 8 tracks, which eventually resulted in me hating those 8 tracks, just from having played them too much. This game mechanically was a bit fucked because of snaking, but the vibes were great.",
    'wii': "This one is my jam. I'll never forget the hype surrounding this game coming out. Playing with motion controls on the Wii Wheel was the best and WOW! All the new stages are so good. No Mario Kart even comes close to the quality of Mario Kart Wii when it comes to new stages. And the vibes and soundtrack are just on point. To be honest, any track that was in Mario Kart Wii is for me an instant classic because I played it so many times.",
    '3ds': "This is in my opinion the weakest Mario Kart. It doesn't bring much to the table in terms of gameplay, and definitely not when it comes to fun and unique racetracks. Music-wise we're working with an ugly, tinny-sounding set of instruments. I will admit that its selection of retro tracks is excellent though (as is reflected by this ranking). Full disclosure, I haven't played this one as much as other ones, in fact I never even owned it, but rather borrowed it from my friend Andrew for a few weeks.",
    'mk8': "Holy moly. This game took things to the next level! Not only does it have an insane number of racetracks in comparison to all the others, but unlike all previous editions, it completely reimagined its retro tracks! Especially when it comes to those GBA remakes, holy moly they are almost unrecognisable! In this list you will find serious improvements to previous iterations of the retro courses. It's also got a lot to do with the incredible soundtrack. They went full jazz band for this soundtrack, and remade all the old tracks as well! A couple of them are misses but the vast majority are huge hits. This game is everything and I'm so happy it exists. I'm even delighted about all the Mario Kart Tour tracks that made it in!",
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
        this.calculateNextAndPreviousTracks();
        this.filterTracks('mk8');
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
      this.currentFilter = criteria;
    } else {
      console.error('Invalid filtering criteria');
    }
  }

  getKeyByValue(object: Record<string, string>, value: string): string | undefined {
    if (value == 'Mario Kart Tour') {
      return 'Tour';
    }
    return Object.keys(object).find(key => object[key] === value)?.toUpperCase();
  }

  calculateNextAndPreviousTracks(): void {
    const orderedTracks = [...this.originalTracks].sort((a, b) => {
      if (a.id < b.id) return -1;
      if (a.id > b.id) return 1;

      const gameOrderIndexA = Object.values(this.gameMap).indexOf(a.game);
      const gameOrderIndexB = Object.values(this.gameMap).indexOf(b.game);
      return gameOrderIndexA - gameOrderIndexB;
    });

    this.originalTracks.forEach(track => {
      const correspondingOrderedTrack = orderedTracks.find(orderedTrack => orderedTrack.id === track.id && orderedTrack.game === track.game);
      if (correspondingOrderedTrack) {
        const indexInOrderedTracks = orderedTracks.indexOf(correspondingOrderedTrack);
        if (indexInOrderedTracks > 0 && orderedTracks[indexInOrderedTracks - 1].id === correspondingOrderedTrack.id) {
          track.previousGame = orderedTracks[indexInOrderedTracks - 1].game;
        }
        if (indexInOrderedTracks < orderedTracks.length - 1 && orderedTracks[indexInOrderedTracks + 1].id === correspondingOrderedTrack.id) {
          track.nextGame = orderedTracks[indexInOrderedTracks + 1].game;
        }
      }
    });
  }

  navigateToTrack(newGame: string, oldGame: string, id: number): void {
    const newTrack = this.originalTracks.find(track => track.id === id && track.game === newGame);
    const oldTrackIndex = this.tracks.findIndex(track => track.id === id && track.game === oldGame);

    if (newTrack) {

      this.tracks[oldTrackIndex] = newTrack;
      this.tracks = [...this.tracks];
    }
  }

  hasDuplicates(track: Track) {
    return this.originalTracks.filter(t => t.id === track.id).length > 1;
  }
}

