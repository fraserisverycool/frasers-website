import {Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output} from '@angular/core';
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
  standalone: true,
  styleUrls: ['./cd-modal.component.css']
})
export class CdModalComponent implements OnInit, OnDestroy {
  @Input() selectedCd: CD | undefined;
  @Output() close: EventEmitter<void> = new EventEmitter<void>();

  constructor() {}

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
