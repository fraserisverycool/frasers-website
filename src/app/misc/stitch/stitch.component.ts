import {Component, OnInit} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import {HttpClient} from "@angular/common/http";

interface Stitch {
    filename: string;
    comment: string;
    id: string;
}

@Component({
  selector: 'app-stitch',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './stitch.component.html',
  styleUrls: ['./stitch.component.css']
})
export default class StitchComponent implements OnInit {
  stitches: Stitch[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadStitches();
  }

  loadStitches(): void {
    this.http.get<{ stitches: Stitch[] }>('assets/misc/stitch/stitches.json').subscribe({
      next: (data) => {
        this.stitches = data.stitches;
      },
      error: (err) => {
        console.error('Failed to load stitches:', err);
      },
    });
  }
}
