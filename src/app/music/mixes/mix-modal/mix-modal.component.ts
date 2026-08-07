import {Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ClickedOutsideDirective} from "../../../utils/directives/clicked-outside.directive";
import {RatingBarComponent} from "../../../utils/rating-bar/rating-bar.component";
import {CloseButtonComponent} from "../../../utils/close-button/close-button.component";
import {ImageService} from "../../../utils/services/image.service";

interface Mp3Info {
  filename: string;
  name: string;
  description: string;
  image: string;
  rating: number[];
  id: string;
  newsletter: boolean;
}

@Component({
  selector: 'app-mix-modal',
  imports: [ClickedOutsideDirective, RatingBarComponent, CloseButtonComponent],
  templateUrl: './mix-modal.component.html',
  standalone: true,
  styleUrls: ['./mix-modal.component.css']
})
export class MixModalComponent implements OnInit, OnDestroy {
  @Input() selectedMix: Mp3Info | undefined;
  @Input() color: string = "#000000";
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
