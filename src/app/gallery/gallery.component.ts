import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {HttpClient} from "@angular/common/http";
import {RouterLink} from "@angular/router";
import PhotoComponent from "./photo/photo.component";
import {Photo} from "./photo.interface";

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, RouterLink, PhotoComponent],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export default class GalleryComponent implements OnInit {
  photos: Photo[] = [];

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

}
