import {Component, OnDestroy, OnInit, input, output} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import {CD} from "../cd.interface";
import {ClickedOutsideDirective} from "../../../utils/directives/clicked-outside.directive";
import {RatingBarComponent} from "../../../utils/rating-bar/rating-bar.component";
import {CloseButtonComponent} from "../../../utils/close-button/close-button.component";
import {ImageUrlPipe} from "../../../utils/pipes/image-url.pipe";

@Component({
  selector: 'app-cd-modal',
  imports: [NgOptimizedImage, ClickedOutsideDirective, RatingBarComponent, CloseButtonComponent, ImageUrlPipe],
  templateUrl: './cd-modal.component.html',
  styleUrls: ['./cd-modal.component.css'],
  host: { '(window:popstate)': 'onPopState()' }
})
export class CdModalComponent implements OnInit, OnDestroy {
  readonly selectedCd = input<CD | undefined>();
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
