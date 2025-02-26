import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from "@angular/common/http";

interface Album {
  filename: string;
  artist: string;
  name: string;
  releaseyear: string;
  description: string;
}

@Component({
  selector: 'app-albums',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './albums.component.html',
  styleUrls: ['./albums.component.css']
})
export default class AlbumsComponent implements OnInit {
  albums: Album[] = [];
  originalAlbums: Album[] = []; // Store original data
  selectedAlbum: Album | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAlbums();
  }

  loadAlbums(): void {
    this.http.get<{ albums: Album[] }>('assets/music/albums/albums.json').subscribe({
      next: (data) => {
        this.originalAlbums = data.albums;
        this.sortAlbums('random');
      },
      error: (err) => {
        console.error('Failed to load albums:', err);
      },
    });
  }

  showDescription(album: Album): void {
    this.selectedAlbum = album;
  }

  closeDescription(): void {
    this.selectedAlbum = null;
  }

  // Function to sort albums based on the selected criteria
  sortAlbums(criteria: 'random' | 'alphabeticalName' | 'alphabeticalArtist' | 'releaseDate'): void {
    switch (criteria) {
      case 'random':
        this.albums = [...this.originalAlbums].sort(() => Math.random() - 0.5);
        break;
      case 'alphabeticalName':
        this.albums = [...this.originalAlbums].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'alphabeticalArtist':
        this.albums = [...this.originalAlbums].sort((a, b) => a.artist.localeCompare(b.artist));
        break;
      case 'releaseDate':
        this.albums = [...this.originalAlbums].sort((a, b) => parseInt(a.releaseyear) - parseInt(b.releaseyear));
        break;
      default:
        console.error('Invalid sorting criteria');
    }
  }
}
