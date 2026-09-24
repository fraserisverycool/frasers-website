import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ImageService } from '../../utils/services/image.service';

export interface PostEntry {
  id?: string;
  type: string;
  title?: string;
  description: string[];
  image?: string | null;
  metadata?: string | null;
  timestamp?: string;
}

@Component({
  selector: 'app-latest-posts',
  standalone: true,
  imports: [CommonModule, NgClass],
  templateUrl: './latest-posts.component.html',
  styleUrl: './latest-posts.component.css'
})
export class LatestPostsComponent implements OnInit {
  posts: PostEntry[] = [];

  constructor(
    private http: HttpClient,
    protected imageService: ImageService
  ) {}

  ngOnInit(): void {
    this.loadLatestPosts();
  }

  loadLatestPosts(): void {
    forkJoin({
      games: this.http.get<{ games: any[] }>('assets/data/games.json').pipe(catchError(() => of({ games: [] }))),
      films: this.http.get<{ films: any[] }>('assets/data/films.json').pipe(catchError(() => of({ films: [] }))),
      albums: this.http.get<{ albums: any[] }>('assets/data/albums.json').pipe(catchError(() => of({ albums: [] }))),
      playlists: this.http.get<{ playlists: any[] }>('assets/data/playlists.json').pipe(catchError(() => of({ playlists: [] }))),
      soundtracks: this.http.get<{ soundtracks: any[] }>('assets/data/soundtracks.json').pipe(catchError(() => of({ soundtracks: [] }))),
      concerts: this.http.get<{ concerts: any[] }>('assets/data/concerts.json').pipe(catchError(() => of({ concerts: [] }))),
      books: this.http.get<{ books: any[] }>('assets/data/books.json').pipe(catchError(() => of({ books: [] }))),
      photos: this.http.get<{ pictures: any[] }>('assets/data/photos.json').pipe(catchError(() => of({ pictures: [] }))),
      videos: this.http.get<{ videos: any[] }>('assets/data/videos.json').pipe(catchError(() => of({ videos: [] }))),
      cds: this.http.get<{ cds: any[] }>('assets/data/cds.json').pipe(catchError(() => of({ cds: [] }))),
      durstloescher: this.http.get<{ durstloescher: any[] }>('assets/data/durstloescher.json').pipe(catchError(() => of({ durstloescher: [] }))),
      characters: this.http.get<{ characters: any[] }>('assets/data/characters.json').pipe(catchError(() => of({ characters: [] }))),
      mariokart: this.http.get<{ tracks: any[] }>('assets/data/mariokart.json').pipe(catchError(() => of({ tracks: [] }))),
      stitches: this.http.get<{ stitches: any[] }>('assets/data/stitches.json').pipe(catchError(() => of({ stitches: [] }))),
      mixes: this.http.get<{ mixes: any[] }>('assets/data/mixes.json').pipe(catchError(() => of({ mixes: [] }))),
      kk: this.http.get<{ kkSongs: any[] }>('assets/data/kk.json').pipe(catchError(() => of({ kkSongs: [] })))
    }).subscribe(data => {
      const allPosts: PostEntry[] = [];

      // Games
      if (data.games?.games) {
        for (const item of data.games.games) {
          allPosts.push({
            id: item.id,
            type: 'GAME',
            title: item.name,
            description: this.normalizeDescription(item.review),
            image: item.image ? `games/${item.image}` : null,
            metadata: `Vibes: ${item.vibes}, Gameplay: ${item.gameplay}, Platform: ${item.platform}, Release: ${item.release}`,
            timestamp: item.timestamp
          });
        }
      }

      // Films
      if (data.films?.films) {
        for (const item of data.films.films) {
          allPosts.push({
            id: item.id,
            type: 'FILM',
            title: item.title,
            description: this.normalizeDescription(item.description),
            image: item.filename ? `films/${item.filename}` : null,
            metadata: `Release: ${item.release}${item.spoiler ? ', for the spoiler discussion please visit the films page!' : ''}`,
            timestamp: item.timestamp
          });
        }
      }

      // Albums
      if (data.albums?.albums) {
        for (const item of data.albums.albums) {
          allPosts.push({
            id: item.id,
            type: 'ALBUM',
            title: item.name,
            description: this.normalizeDescription(item.description),
            image: item.filename ? `music/albums/${item.filename}` : null,
            metadata: `Artist: ${item.artist}, Release: ${item.releaseyear}, for a list of favourite tracks, please visit the albums page!`,
            timestamp: item.timestamp
          });
        }
      }

      // Playlists
      if (data.playlists?.playlists) {
        for (const item of data.playlists.playlists) {
          allPosts.push({
            id: item.id,
            type: 'PLAYLIST',
            title: item.name,
            description: this.normalizeDescription(item.description),
            image: item.image ? `music/playlists/art/${item.image}` : null,
            metadata: 'For the tracklist, visit the playlists page!',
            timestamp: item.timestamp
          });
        }
      }

      // Soundtracks
      if (data.soundtracks?.soundtracks) {
        for (const item of data.soundtracks.soundtracks) {
          allPosts.push({
            id: item.id,
            type: 'SOUNDTRACK',
            title: item.name,
            description: this.normalizeDescription(item.description),
            image: item.filename ? `music/nintendo/${item.filename}` : null,
            metadata: `Platform: ${item.platform}, for a list of favourite tracks, please visit the nintendo soundtracks page!`,
            timestamp: item.timestamp
          });
        }
      }

      // Concerts
      if (data.concerts?.concerts) {
        for (const item of data.concerts.concerts) {
          allPosts.push({
            id: item.id,
            type: 'CONCERT',
            title: item.artist,
            description: this.normalizeDescription(item.description),
            image: item.image ? `music/concerts/${item.image}` : null,
            metadata: `Date: ${item.date}, Venue: ${item.venue}`,
            timestamp: item.timestamp
          });
        }
      }

      // Books
      if (data.books?.books) {
        for (const item of data.books.books) {
          allPosts.push({
            id: item.id,
            type: 'BOOK',
            title: item.title,
            description: this.normalizeDescription(item.description),
            image: item.filename ? `books/${item.filename}` : null,
            metadata: `Author: ${item.author}, Release: ${item.release}${item.spoiler ? ', for the spoiler discussion please visit the books page!' : ''}`,
            timestamp: item.timestamp
          });
        }
      }

      // Photos / Gallery
      if (data.photos?.pictures) {
        for (const item of data.photos.pictures) {
          allPosts.push({
            id: item.id,
            type: 'GALLERY',
            title: item.title,
            description: this.normalizeDescription(item.description),
            image: item.filename ? `gallery/${item.filename}` : null,
            metadata: 'For anecdotes about the pictures, please visit the gallery page!',
            timestamp: item.timestamp
          });
        }
      }

      // Videos
      if (data.videos?.videos) {
        for (const item of data.videos.videos) {
          allPosts.push({
            id: item.id,
            type: 'VIDEO',
            title: item.title,
            description: this.normalizeDescription(item.description),
            image: null,
            metadata: `Link: ${item.link}`,
            timestamp: item.timestamp
          });
        }
      }

      // CDs
      if (data.cds?.cds) {
        for (const item of data.cds.cds) {
          allPosts.push({
            id: item.id,
            type: 'CD',
            title: item.album,
            description: this.normalizeDescription(item.description),
            image: item.image ? `music/albums/${item.image}` : null,
            metadata: `Artist: ${item.artist}`,
            timestamp: item.timestamp
          });
        }
      }

      // Durstlöscher
      if (data.durstloescher?.durstloescher) {
        for (const item of data.durstloescher.durstloescher) {
          allPosts.push({
            id: item.id,
            type: 'DURSTLOESCHER',
            title: item.name,
            description: this.normalizeDescription(item.description),
            image: item.filename ? `community/durstloescher/${item.filename}` : null,
            metadata: `Score: ${item.score}`,
            timestamp: item.timestamp
          });
        }
      }

      // Characters (deco)
      if (data.characters?.characters) {
        for (const character of data.characters.characters) {
          if (character.deco && Array.isArray(character.deco)) {
            for (const deco of character.deco) {
              allPosts.push({
                id: deco.id || character.id,
                type: 'CHARACTER_DECO',
                title: character.name,
                description: this.normalizeDescription(deco.description),
                image: deco.filename ? `misc/characters/${deco.filename}` : null,
                metadata: null,
                timestamp: deco.timestamp || character.timestamp
              });
            }
          }
        }
      }

      // Mario Kart
      if (data.mariokart?.tracks) {
        for (const item of data.mariokart.tracks) {
          allPosts.push({
            id: item.id,
            type: 'MARIOKART',
            title: item.name,
            description: this.normalizeDescription(item.description),
            image: item.image ? `misc/mariokart/${item.image}` : null,
            metadata: `Game: ${item.game}, First Appearance: ${item.original}, Fraser's ranking - music/vibes/track: ${item.music}/${item.vibes}/${item.track}`,
            timestamp: item.timestamp
          });
        }
      }

      // Stitches
      if (data.stitches?.stitches) {
        for (const item of data.stitches.stitches) {
          allPosts.push({
            id: item.id,
            type: 'STITCH',
            title: item.title || null,
            description: this.normalizeDescription(item.comment || item.description),
            image: item.filename ? `misc/stitch/${item.filename}` : null,
            metadata: null,
            timestamp: item.timestamp
          });
        }
      }

      // Mixes
      if (data.mixes?.mixes) {
        for (const item of data.mixes.mixes) {
          allPosts.push({
            id: item.id,
            type: 'MIX',
            title: item.name,
            description: this.normalizeDescription(item.description),
            image: item.image ? `music/mixes/art/${item.image}` : null,
            metadata: 'For a download link, please visit the video game mixes page!',
            timestamp: item.timestamp
          });
        }
      }

      // KK Songs
      if (data.kk?.kkSongs) {
        for (const item of data.kk.kkSongs) {
          allPosts.push({
            id: item.id,
            type: 'KK',
            title: item.title,
            description: this.normalizeDescription(item.description),
            image: item.filename ? `music/nintendo/kk/${item.filename}` : null,
            metadata: `Tier: ${item.tier}`,
            timestamp: item.timestamp
          });
        }
      }

      // Filter items with timestamps and sort descending
      this.posts = allPosts
        .filter(post => !!post.timestamp)
        .sort((a, b) => this.parseDate(b.timestamp).getTime() - this.parseDate(a.timestamp).getTime())
        .slice(0, 15);
    });
  }

  private normalizeDescription(desc: any): string[] {
    if (!desc) return [];
    if (Array.isArray(desc)) {
      return desc.filter(p => typeof p === 'string' && p.trim().length > 0);
    }
    if (typeof desc === 'string') {
      return desc.trim().length > 0 ? [desc] : [];
    }
    return [];
  }

  private parseDate(dateStr?: string): Date {
    if (!dateStr) return new Date(0);
    const parts = dateStr.trim().split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? new Date(0) : parsed;
  }

  getName(type: string): string {
    switch (type) {
      case 'GAME':
        return 'Game Review';
      case 'FILM':
        return 'Film Review';
      case 'TVSHOW':
        return 'TV Show Review';
      case 'ALBUM':
        return 'Album Review';
      case 'PLAYLIST':
        return 'New Playlist';
      case 'SOUNDTRACK':
        return 'Nintendo Soundtrack Review';
      case 'BOOK':
        return 'Book Review';
      case 'GALLERY':
        return 'New Photo in the Gallery';
      case 'VIDEO':
        return 'Fun video for your entertainment';
      case 'CD':
        return 'New CD';
      case 'DURSTLOESCHER':
        return 'Durstloescher Review from Anni';
      case 'MARIOKART':
        return 'Mario Kart Track Review';
      case 'STITCH':
        return 'New Cross Stitch';
      case 'MIX':
        return 'New Mix';
      case 'CONCERT':
        return 'Concert Review';
      case 'KK':
        return 'KK Song Review';
      case 'CHARACTER_DECO':
        return 'Smash character decoration in my house';
      case 'DAILY_SOUNDTRACK':
        return 'Soundtrack of the day';
      default:
        return type;
    }
  }

  getClass(entry: { type: string }): string {
    switch (entry.type) {
      case 'GAME':
        return 'game';
      case 'FILM':
        return 'film';
      case 'PLAYLIST':
        return 'playlist';
      case 'TVSHOW':
        return 'tvshow';
      case 'DURSTLOESCHER':
        return 'durstloescher';
      case 'BOOK':
        return 'book';
      case 'GALLERY':
        return 'gallery';
      case 'VIDEO':
        return 'video';
      case 'CHARACTER_DECO':
        return 'character-deco';
      case 'MARIOKART':
        return 'mariokart';
      case 'STITCH':
        return 'stitch';
      case 'ALBUM':
        return 'album';
      case 'CONCERT':
        return 'concert';
      case 'CD':
        return 'cd';
      case 'MIX':
        return 'mix';
      case 'SOUNDTRACK':
        return 'soundtrack';
      case 'KK':
        return 'kk';
      case 'DAILY_SOUNDTRACK':
        return 'daily-soundtrack';
      default:
        return 'entry';
    }
  }
}
