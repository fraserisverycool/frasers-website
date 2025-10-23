import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {ClickedOutsideDirective} from "../../../utils/directives/clicked-outside.directive";
import StarMessageComponent from "../../../utils/star-message/star-message.component";
import {Durstloescher} from "../durstloescher.interface";
import {RatingBarComponent} from "../../../utils/rating-bar/rating-bar.component";
import {CloseButtonComponent} from "../../../utils/close-button/close-button.component";

@Component({
  selector: 'app-durstloescher-modal',
  standalone: true,
    imports: [CommonModule, ClickedOutsideDirective, NgOptimizedImage, StarMessageComponent, RatingBarComponent, CloseButtonComponent],
  templateUrl: './durstloescher-modal.component.html',
  styleUrls: ['./durstloescher-modal.component.css']
})
export class DurstloescherModalComponent {
  @Input() selectedDurstloescher: Durstloescher | undefined;
  @Output() close: EventEmitter<void> = new EventEmitter<void>();
}
