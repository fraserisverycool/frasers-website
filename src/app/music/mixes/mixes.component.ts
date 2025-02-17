import {Component} from '@angular/core';
import { CommonModule } from '@angular/common';
import {HttpClient} from "@angular/common/http";

interface Mp3Info {
  filename: string;
  name: string;
  description: string;
}

@Component({
  selector: 'app-mixes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mixes.component.html',
  styleUrls: ['./mixes.component.css']
})
export default class MixesComponent {
  mp3Files: Mp3Info[] = [];
  selectedMp3File: Mp3Info | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadMixes();
  }

  loadMixes(): void {
    this.http.get<{ mixes: Mp3Info[] }>('assets/music/mixes/mixes.json').subscribe({
      next: (data) => {
        this.mp3Files = data.mixes;
      },
      error: (err) => {
        console.error('Failed to load mixes:', err);
      },
    });
  }

  getRandomColor() {
    const r = Math.floor(Math.random() * 128);
    const g = Math.floor(Math.random() * 128);
    const b = Math.floor(Math.random() * 128);

    const toHex = (c: number) => c.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
}
