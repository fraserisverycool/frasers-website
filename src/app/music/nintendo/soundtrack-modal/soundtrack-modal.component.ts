import {Component, OnDestroy, OnInit, input, output, signal} from '@angular/core';
import { LowerCasePipe, NgClass, NgOptimizedImage } from '@angular/common';
import {Soundtrack} from "../soundtrack.interface";
import {ClickedOutsideDirective} from "../../../utils/directives/clicked-outside.directive";
import {RatingBarComponent} from "../../../utils/rating-bar/rating-bar.component";
import {CloseButtonComponent} from "../../../utils/close-button/close-button.component";
import {ImageUrlPipe} from "../../../utils/pipes/image-url.pipe";

@Component({
  selector: 'app-soundtrack-modal',
  imports: [NgClass, LowerCasePipe, NgOptimizedImage, ClickedOutsideDirective, RatingBarComponent, CloseButtonComponent, ImageUrlPipe],
  templateUrl: './soundtrack-modal.component.html',
  styleUrls: ['./soundtrack-modal.component.css'],
  host: { '(window:popstate)': 'onPopState()' }
})
export class SoundtrackModalComponent implements OnInit, OnDestroy {
  readonly selectedSoundtrack = input<Soundtrack | undefined>();
  readonly close = output<void>();

  readonly currentRandomColor = signal("#ffffff");

  ngOnInit() {
    this.getRandomColor();
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

  getRandomColor() {
    const r = Math.floor(Math.random() * 128);
    const g = Math.floor(Math.random() * 128);
    const b = Math.floor(Math.random() * 128);

    const toHex = (c: number) => c.toString(16).padStart(2, '0');
    this.currentRandomColor.set(`#${toHex(r)}${toHex(g)}${toHex(b)}`);
  }
}
