import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgOptimizedImage } from '@angular/common';
import {ImageService} from "../../utils/services/image.service";

@Component({
  selector: 'app-brexit',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './brexit.component.html',
  styleUrls: ['./brexit.component.css']
})
export default class BrexitComponent implements OnInit {
  images: string[] = [];
  selectedImage: string | null = null;

  constructor(private http: HttpClient, protected imageService: ImageService) {}

  ngOnInit(): void {
    this.loadImages();
  }

  loadImages(): void {
    this.http.get<{ filenames: string[] }>('assets/data/brexit-summits.json').subscribe({
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
