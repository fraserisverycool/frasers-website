import {Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import {ClickedOutsideDirective} from "../../../utils/directives/clicked-outside.directive";
import StarMessageComponent from "../../../utils/star-message/star-message.component";
import {Durstloescher} from "../durstloescher.interface";
import {RatingBarComponent} from "../../../utils/rating-bar/rating-bar.component";
import {CloseButtonComponent} from "../../../utils/close-button/close-button.component";
import {ImageService} from "../../../utils/services/image.service";

@Component({
    selector: 'app-durstloescher-modal',
    imports: [CommonModule, ClickedOutsideDirective, NgOptimizedImage, StarMessageComponent, RatingBarComponent, CloseButtonComponent],
    templateUrl: './durstloescher-modal.component.html',
    styleUrls: ['./durstloescher-modal.component.css']
})
export class DurstloescherModalComponent implements OnInit, OnDestroy {
  @Input() selectedDurstloescher: Durstloescher | undefined;
  @Output() close: EventEmitter<void> = new EventEmitter<void>();

  constructor(protected imageService: ImageService) {
  }

  ngOnInit() {
    history.pushState({ modal: true }, '');
  }

  @HostListener('window:popstate')
  onPopState() {
    this.close.emit();
  }

  ngOnDestroy() {
    if (window.history.state?.modal) {
      history.back();
    }
  }
}
