import {Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import {CloseButtonComponent} from "../../../../utils/close-button/close-button.component";
import {RatingBarComponent} from "../../../../utils/rating-bar/rating-bar.component";
import {KKSong} from "../kk-song.interface";
import {ImageService} from "../../../../utils/services/image.service";
import {ClickedOutsideDirective} from "../../../../utils/directives/clicked-outside.directive";

@Component({
    selector: 'app-kk-modal',
    imports: [CloseButtonComponent, NgOptimizedImage, RatingBarComponent, ClickedOutsideDirective],
    templateUrl: './kk-modal.component.html',
    styleUrls: ['./kk-modal.component.css']
})
export class KkModalComponent implements OnInit, OnDestroy {
  @Input() selectedKkSong: KKSong | undefined;
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
