import { Component, inject, input, linkedSignal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import {RatingService} from "./service/rating.service";
import {Rating} from "./service/rating.interface";
import {ImageService} from "../services/image.service";

const EMPTY_RATINGS = [0, 0, 0, 0, 0, 0];

@Component({
  selector: 'app-rating-bar',
  imports: [NgOptimizedImage],
  templateUrl: './rating-bar.component.html',
  styleUrls: ['./rating-bar.component.css']
})
export class RatingBarComponent {
  private ratingService = inject(RatingService);
  protected imageService = inject(ImageService);

  readonly rating = input<Rating>({ id: '', ratings: EMPTY_RATINGS });

  /** Local copy of the counts; resets whenever the parent passes a new rating. */
  readonly counts = linkedSignal(() => [...(this.rating()?.ratings ?? EMPTY_RATINGS)]);

  readonly reactions = [
    { file: '/utils/reaction-wet.png', alt: 'wet for her', label: 'wet for her', color: '#d5006c' },
    { file: '/utils/reaction-poo.png', alt: 'poop poop fart', label: 'poop poop fart', color: '#7e4b1e' },
    { file: '/utils/reaction-hurr.png', alt: 'hurr hurr', label: 'hurr hurr', color: '#38a105' },
    { file: '/utils/reaction-peace.png', alt: 'useful', label: 'useful!', color: '#ff8900' },
    { file: '/utils/reaction-cool.png', alt: 'cool', label: 'cool', color: '#0090ff' },
    { file: '/utils/reaction-science.png', alt: 'science', label: 'science', color: '#912efc' },
  ];

  onSelect(index: number): void {
    this.counts.update(counts => counts.map((c, i) => (i === index && c < 999 ? c + 1 : c)));
    this.ratingService.updateRating({ id: this.rating().id, ratings: this.counts() });
  }
}
