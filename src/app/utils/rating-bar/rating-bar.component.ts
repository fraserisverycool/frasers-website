import {Component, Input} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {RatingService} from "./service/rating.service";
import {Rating} from "./service/rating.interface";

@Component({
  selector: 'app-rating-bar',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './rating-bar.component.html',
  styleUrls: ['./rating-bar.component.css']
})
export class RatingBarComponent {
  @Input() rating: Rating = {
    id: '',
    ratings: [0,0,0,0,0,0]
  }
  filenames: string[] = ['reaction-wet.png', 'reaction-poo.png', 'reaction-hurr.png', 'reaction-peace.png', 'reaction-cool.png', 'reaction-science.png'];
  colors: string[] = ['#d5006c', '#7e4b1e', '#38a105', '#ff8900', '#0090ff', '#912efc'];

  constructor(private ratingService: RatingService) {
  }

  onSelect(index: number): void {
    if (this.rating.ratings[index] < 999) {
      this.rating.ratings[index] += 1;
    }
    this.ratingService.updateRating(this.rating);
  }
}
