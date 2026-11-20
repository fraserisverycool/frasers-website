import {Component, Input} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import {Film} from "../film.interface";
import {RatingBarComponent} from "../../utils/rating-bar/rating-bar.component";
import {SpoilerDiscussionComponent} from "../../utils/spoiler-discussion/spoiler-discussion.component";
import {ImageUrlPipe} from "../../utils/pipes/image-url.pipe";

@Component({
    selector: 'app-film',
    imports: [CommonModule, NgOptimizedImage, RatingBarComponent, SpoilerDiscussionComponent, ImageUrlPipe],
    templateUrl: './film.component.html',
    styleUrls: ['./film.component.css']
})
export class FilmComponent {
  @Input() film: Film = {} as Film;
}
