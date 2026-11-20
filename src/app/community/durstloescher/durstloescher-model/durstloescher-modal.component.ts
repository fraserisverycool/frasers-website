import { Component, OnDestroy, OnInit, input, output } from '@angular/core';
import { NgOptimizedImage, NgStyle } from '@angular/common';
import {ClickedOutsideDirective} from "../../../utils/directives/clicked-outside.directive";
import StarMessageComponent from "../../../utils/star-message/star-message.component";
import {Durstloescher} from "../durstloescher.interface";
import {RatingBarComponent} from "../../../utils/rating-bar/rating-bar.component";
import {CloseButtonComponent} from "../../../utils/close-button/close-button.component";
import {ImageUrlPipe} from "../../../utils/pipes/image-url.pipe";

@Component({
    selector: 'app-durstloescher-modal',
    imports: [NgStyle, ClickedOutsideDirective, NgOptimizedImage, StarMessageComponent, RatingBarComponent, CloseButtonComponent, ImageUrlPipe],
    templateUrl: './durstloescher-modal.component.html',
    styleUrls: ['./durstloescher-modal.component.css'],
    host: { '(window:popstate)': 'onPopState()' }
})
export class DurstloescherModalComponent implements OnInit, OnDestroy {
  readonly selectedDurstloescher = input<Durstloescher | undefined>(undefined);
  readonly close = output<void>();

  ngOnInit() {
    history.pushState({ modal: true }, '');
  }

  onPopState() {
    this.close.emit();
  }

  ngOnDestroy() {
    if (window.history.state?.modal) {
      history.back();
    }
  }
}
