import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {HttpClient} from "@angular/common/http";

interface Soundtrack {
  filename: string;
  name: string;
  description: string;
  topTracks: string[];
}

@Component({
  selector: 'app-nintendo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nintendo.component.html',
  styleUrls: ['./nintendo.component.css']
})
export default class NintendoComponent implements OnInit {
  soundtracks: Soundtrack[] = [];
  selectedSoundtrack: Soundtrack | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadSoundtracks();
  }

  loadSoundtracks(): void {
    this.http.get<{ soundtracks: Soundtrack[] }>('assets/music/nintendo/soundtracks.json').subscribe({
      next: (data) => {
        this.soundtracks = data.soundtracks;
      },
      error: (err) => {
        console.error('Failed to load soundtracks:', err);
      },
    });
  }

  showDescription(soundtrack: Soundtrack): void {
    this.selectedSoundtrack = soundtrack;
  }

  closeDescription(): void {
    this.selectedSoundtrack = null;
  }
}
