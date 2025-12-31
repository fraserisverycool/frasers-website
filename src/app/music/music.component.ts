import { Component, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import {Album} from "./albums/album.interface";
import {Soundtrack} from "./nintendo/soundtrack.interface";
import {CD} from "./cds/cd.interface";
import { HttpClient } from "@angular/common/http";
import {DailyComponent} from "./daily/daily.component";
import {Concert} from "./concerts/concert.interface";
import {ImageService} from "../utils/services/image.service";

@Component({
  selector: 'app-music',
  standalone: true,
    imports: [CommonModule, RouterLink, RouterOutlet, NgOptimizedImage, DailyComponent],
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
  randomConcert: Concert | null = null;

  constructor(private http: HttpClient, private router: Router, protected imageService: ImageService) {}

  ngOnInit(): void {
    this.loadRandomAlbum();
    this.loadRandomSoundtrack();
    this.loadRandomCd();
    this.loadRandomConcert();
  }

  handleClick(url: string) {
    this.router.navigate([url]);
  }

  loadRandomAlbum(): void {
    this.http.get<{ albums: Album[] }>('assets/data/albums.json').subscribe({
      next: (data) => {
      this.randomAlbum = data.albums[Math.floor(Math.random() * data.albums.length)];
      },
      error: (err) => {
        console.error('Failed to load albums:', err);
      },
    });
  }

  loadRandomSoundtrack(): void {
    this.http.get<{ soundtracks: Soundtrack[] }>('assets/data/soundtracks.json').subscribe({
      next: (data) => {
      this.randomSoundtrack = data.soundtracks[Math.floor(Math.random() * data.soundtracks.length)];
      },
      error: (err) => {
        console.error('Failed to load soundtracks:', err);
      },
    });
  }

  loadRandomCd(): void {
    this.http.get<{ cds: CD[] }>('assets/data/cds.json').subscribe({
      next: (data) => {
        this.randomCd = data.cds[Math.floor(Math.random() * data.cds.length)];
      },
      error: (err) => {
        console.error('Failed to load CDs:', err);
      },
    });
  }

  loadRandomConcert(): void {
    this.http.get<{ concerts: Concert[] }>('assets/data/concerts.json').subscribe({
      next: (data) => {
        const concerts = data.concerts.filter(concert => concert.artist !== '')
        this.randomConcert = concerts[Math.floor(Math.random() * concerts.length)];
      },
      error: (err) => {
        console.error('Failed to load concerts:', err);
      },
    });
  }
}
