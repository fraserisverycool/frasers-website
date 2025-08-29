import { Component, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import {Album} from "./albums/album.interface";
import {Soundtrack} from "./nintendo/soundtrack.interface";
import {CD} from "./cds/cd.interface";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-music',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, NgOptimizedImage],
  templateUrl: './music.component.html',
  styleUrls: ['./music.component.css']
})
export default class MusicComponent implements OnInit {
  albums: Album[] = [];
  soundtracks: Soundtrack[] = [];
  cds: CD[] = [];
  randomAlbum: Album | null = null;
  randomSoundtrack: Soundtrack | null = null;
  randomCd: CD | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadRandomAlbum();
    this.loadRandomSoundtrack();
    this.loadRandomCds();
  }

  handleClick(url: string) {
    this.router.navigate([url]);
  }

  loadRandomAlbum(): void {
    this.http.get<{ albums: Album[] }>('assets/music/albums/albums.json').subscribe({
      next: (data) => {
      this.randomAlbum = data.albums[Math.floor(Math.random() * data.albums.length)];
      },
      error: (err) => {
        console.error('Failed to load albums:', err);
      },
    });
  }

  loadRandomSoundtrack(): void {
    this.http.get<{ soundtracks: Soundtrack[] }>('assets/music/nintendo/soundtracks.json').subscribe({
      next: (data) => {
      this.randomSoundtrack = data.soundtracks[Math.floor(Math.random() * data.soundtracks.length)];
      },
      error: (err) => {
        console.error('Failed to load soundtracks:', err);
      },
    });
  }

  loadRandomCds(): void {
    this.http.get<{ cds: CD[] }>('assets/music/albums/cds.json').subscribe({
      next: (data) => {
        console.log(data.cds);
        this.randomCd = data.cds[Math.floor(Math.random() * data.cds.length)];
      },
      error: (err) => {
        console.error('Failed to load CDs:', err);
      },
    });
  }
}
