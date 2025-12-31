import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {Character, Decoration} from "../character.interface";
import {ClickedOutsideDirective} from "../../../utils/directives/clicked-outside.directive";
import {RatingBarComponent} from "../../../utils/rating-bar/rating-bar.component";
import {CloseButtonComponent} from "../../../utils/close-button/close-button.component";
import {ImageService} from "../../../utils/services/image.service";

@Component({
    selector: 'app-character',
    imports: [CommonModule, NgOptimizedImage, ClickedOutsideDirective, RatingBarComponent, CloseButtonComponent],
    templateUrl: './character.component.html',
    styleUrls: ['./character.component.css']
})
export class CharacterComponent {
  @Input() selectedCharacter: Character | undefined;
  @Input() pictureMode: number = 0;
  @Output() close: EventEmitter<void> = new EventEmitter<void>();

  constructor(protected imageService: ImageService) {
  }

  getBadge(ratingType: string, value: boolean) {
    let badgeText = ratingType + ' ';
    if (value) {
      badgeText += '\u2713';
    } else {
      badgeText += '\u274C';
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

  getButtonText(character: Character): string {
    return !character.showMain ? "Show me the truth" : "I can't handle the truth";
  }

  isEmpty(deco: Decoration[]): boolean {
    return deco.length == 0;
  }
}
