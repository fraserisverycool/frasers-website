import {Component, Input} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {Film} from "../film.interface";
import {RatingBarComponent} from "../../utils/rating-bar/rating-bar.component";

@Component({
  selector: 'app-film',
  standalone: true,
    imports: [CommonModule, NgOptimizedImage, RatingBarComponent],
  templateUrl: './film.component.html',
  styleUrls: ['./film.component.css']
})
export class FilmComponent {
  @Input() film: Film = {} as Film;
}
