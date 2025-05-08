import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {Character} from "../character.interface";
import {ClickedOutsideDirective} from "../../../utils/directives/clicked-outside.directive";

@Component({
  selector: 'app-character',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, ClickedOutsideDirective],
  templateUrl: './character.component.html',
  styleUrls: ['./character.component.css']
})
export class CharacterComponent {
  @Input() selectedCharacter: Character | undefined;
  @Input() pictureMode: number = 0;
  @Output() close: EventEmitter<void> = new EventEmitter<void>();
}
