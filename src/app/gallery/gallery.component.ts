import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {HttpClient} from "@angular/common/http";
import {RouterLink} from "@angular/router";
import PhotoComponent from "./photo.component";

interface Photo {
  filename: string;
  title: string;
  description: string;
  month: string;
  question: string;
  answer: string;
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, RouterLink, PhotoComponent],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export default class GalleryComponent implements OnInit {
  photos: Photo[] = [];
  modalImage: Photo | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<{ pictures: Photo[] }>('assets/gallery/gallery.json').subscribe({
      next: (data) => {
        this.photos = data.pictures;
      },
      error: (err) => {
        console.error('Failed to load albums:', err);
      },
    });
  }

  openModal(item: Photo) {
    this.modalImage = item;
  }

  closeModal() {
    this.modalImage = null;
  }


}
