import {Component, OnDestroy, OnInit, computed, input, output, signal} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import {Character, Decoration} from "../character.interface";
import {ClickedOutsideDirective} from "../../../utils/directives/clicked-outside.directive";
import {RatingBarComponent} from "../../../utils/rating-bar/rating-bar.component";
import {CloseButtonComponent} from "../../../utils/close-button/close-button.component";
import {ImageUrlPipe} from "../../../utils/pipes/image-url.pipe";

@Component({
    selector: 'app-character',
    imports: [NgOptimizedImage, ClickedOutsideDirective, RatingBarComponent, CloseButtonComponent, ImageUrlPipe],
    templateUrl: './character.component.html',
    styleUrls: ['./character.component.css'],
    host: { '(window:popstate)': 'onPopState()' }
})
export class CharacterComponent implements OnInit, OnDestroy {
  readonly selectedCharacter = input<Character | undefined>(undefined);
  readonly pictureMode = input<number>(0);
  readonly close = output<void>();

  /** "Show the truth" toggles per character, remembered while this page is open (the input is never mutated). */
  private readonly showMainToggles = signal<ReadonlyMap<Character, boolean>>(new Map());

  readonly showMain = computed(() => {
    const character = this.selectedCharacter();
    if (!character) {
      return false;
    }
    return this.showMainToggles().get(character) ?? character.showMain;
  });

  readonly buttonText = computed(() =>
    !this.showMain() ? "Show me the truth" : "I can't handle the truth"
  );

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

  toggleShowMain(): void {
    const character = this.selectedCharacter();
    if (!character) {
      return;
    }
    const next = !this.showMain();
    this.showMainToggles.update(toggles => new Map(toggles).set(character, next));
  }

  getBadge(ratingType: string, value: boolean) {
    let badgeText = ratingType + ' ';
    if (value) {
      badgeText += '✓';
    } else {
      badgeText += '❌';
    }
    return badgeText;
  }

  getColor(value: boolean) {
    return value ? 'green' : 'red';
  }

  getColorBorder(value: boolean) {
    return "2px solid " + this.getColor(value);
  }

  getBorder(color: string) {
    return "0 0 10px " + color;
  }

  isEmpty(deco: Decoration[]): boolean {
    return deco.length == 0;
  }
}
