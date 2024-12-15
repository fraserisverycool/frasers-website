import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http'; // Import HttpClient
import { Observable } from 'rxjs';

@Component({
  selector: 'app-brexit',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './brexit.component.html',
  styleUrls: ['./brexit.component.css']
})
export default class BrexitComponent implements OnInit {
  images: string[] = [];
  selectedImage: string | null = null;

  constructor(private http: HttpClient) {} // Inject HttpClient

  ngOnInit(): void {
    this.loadImages();
  }

  loadImages(): void {
    this.http.get<{ filenames: string[] }>('assets/brexit/filenames.json').subscribe({
      next: (data) => {
        this.images = data.filenames;
      },
      error: (err) => {
        console.error('Failed to load image filenames:', err);
      },
    });
  }

  openImage(image: string): void {
    this.selectedImage = image;
  }

  closeImage(): void {
    this.selectedImage = null;
  }
}
