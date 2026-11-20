import {Component, OnInit} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import {Concert} from "./concert.interface";
import {RatingBarComponent} from "../../utils/rating-bar/rating-bar.component";
import {MusicService} from "../service/music.service";
import {InfiniteScrollDirective} from "../../utils/directives/infinite-scroll.directive";
import {ImageUrlPipe} from "../../utils/pipes/image-url.pipe";

@Component({
  selector: 'app-concerts',
  imports: [CommonModule, NgOptimizedImage, RatingBarComponent, InfiniteScrollDirective, ImageUrlPipe],
  templateUrl: './concerts.component.html',
  standalone: true,
  styleUrls: ['./concerts.component.css']
})
export default class ConcertsComponent implements OnInit {
  concerts: Concert[] = [];

  pageSize = 5;
  itemsToShow = 5;

  constructor(private musicService: MusicService) {}

  ngOnInit(): void {
    this.loadConcerts();
  }

  loadMore(): void {
    if (this.itemsToShow < this.concerts.length) {
      this.itemsToShow += this.pageSize;
    }
  }

  loadConcerts(): void {
    this.musicService.getConcerts().subscribe({
      next: (concerts) => {
        this.concerts = concerts.filter(concert => concert.artist !== '');
      },
      error: (err) => {
        console.error('Failed to load concerts:', err);
      },
    });
  }
}
