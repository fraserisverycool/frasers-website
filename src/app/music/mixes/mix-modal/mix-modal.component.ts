import {Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ClickedOutsideDirective} from "../../../utils/directives/clicked-outside.directive";
import {RatingBarComponent} from "../../../utils/rating-bar/rating-bar.component";
import {CloseButtonComponent} from "../../../utils/close-button/close-button.component";
import {ImageUrlPipe} from "../../../utils/pipes/image-url.pipe";
import {Mix} from "../mix.interface";

@Component({
  selector: 'app-mix-modal',
  imports: [ClickedOutsideDirective, RatingBarComponent, CloseButtonComponent, ImageUrlPipe],
  templateUrl: './mix-modal.component.html',
  standalone: true,
  styleUrls: ['./mix-modal.component.css']
})
export class MixModalComponent implements OnInit, OnDestroy {
  @Input() selectedMix: Mix | undefined;
  @Input() color: string = "#000000";
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
