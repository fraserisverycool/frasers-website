import {Component, Input} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import {Game} from "../game.interface";
import {RatingBarComponent} from "../../utils/rating-bar/rating-bar.component";
import {FriendRatingComponent} from "../../utils/friend-rating/friend-rating.component";
import {ImageService} from "../../utils/services/image.service";
import {ReadMoreComponent} from "../../utils/read-more/read-more.component";

@Component({
  selector: 'app-game',
  imports: [CommonModule, NgOptimizedImage, RatingBarComponent, FriendRatingComponent, ReadMoreComponent],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent {
  @Input() game: Game = {} as Game;

  constructor(protected imageService: ImageService) {
  }
}
