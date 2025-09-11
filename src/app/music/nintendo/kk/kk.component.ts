import { Component, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { HttpClient } from "@angular/common/http";

interface KKSong {
  filename: string;
  title: string;
  tier: string;
  description: string;
  rating: number[];
  id: string;
}

@Component({
  selector: 'app-kk',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './kk.component.html',
  styleUrls: ['./kk.component.css']
})
export default class KkComponent implements OnInit {
  kkSongs: KKSong[] = [];
  selectedKkSong: KKSong | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadKkSongs();
  }

  loadKkSongs(): void {
    this.http.get<{ kkSongs: KKSong[] }>('assets/music/nintendo/kk/kk.json').subscribe({
      next: (data) => {
        this.kkSongs = data.kkSongs;
        this.kkSongs = this.kkSongs.sort(() => Math.random() - 0.5);
      },
      error: (err) => {
        console.error('Failed to load KK songs:', err);
      },
    });
  }

  showDescription(kkSong: KKSong): void {
    this.selectedKkSong = kkSong;
  }

  closeDescription(): void {
    this.selectedKkSong = null;
  }
}
