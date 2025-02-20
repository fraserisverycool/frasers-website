import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {HttpClient} from "@angular/common/http";

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
  selectedAlbum: Album | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAlbums();
  }

  loadAlbums(): void {
    this.http.get<{ albums: Album[] }>('assets/music/albums/albums.json').subscribe({
      next: (data) => {
        this.albums = data.albums;
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
}
