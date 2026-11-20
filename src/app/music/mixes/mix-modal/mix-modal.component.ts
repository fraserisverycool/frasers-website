import {Component, OnDestroy, OnInit, input, output} from '@angular/core';
import {ClickedOutsideDirective} from "../../../utils/directives/clicked-outside.directive";
import {RatingBarComponent} from "../../../utils/rating-bar/rating-bar.component";
import {CloseButtonComponent} from "../../../utils/close-button/close-button.component";
import {ImageUrlPipe} from "../../../utils/pipes/image-url.pipe";
import {Mix} from "../mix.interface";

@Component({
  selector: 'app-mix-modal',
  imports: [ClickedOutsideDirective, RatingBarComponent, CloseButtonComponent, ImageUrlPipe],
  templateUrl: './mix-modal.component.html',
  styleUrls: ['./mix-modal.component.css'],
  host: { '(window:popstate)': 'onPopState()' }
})
export class MixModalComponent implements OnInit, OnDestroy {
  readonly selectedMix = input<Mix | undefined>();
  readonly color = input<string>("#000000");
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
