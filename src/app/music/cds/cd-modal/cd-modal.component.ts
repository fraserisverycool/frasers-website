import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {CD} from "../cd.interface";
import {ClickedOutsideDirective} from "../../../utils/directives/clicked-outside.directive";
import {RatingBarComponent} from "../../../utils/rating-bar/rating-bar.component";

@Component({
  selector: 'app-cd-modal',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, ClickedOutsideDirective, RatingBarComponent],
  templateUrl: './cd-modal.component.html',
  styleUrls: ['./cd-modal.component.css']
})
export class CdModalComponent {
  @Input() selectedCd: CD | undefined;
  @Output() close: EventEmitter<void> = new EventEmitter<void>();
}
