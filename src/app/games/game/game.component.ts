import {Component, Input} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {Game} from "../game.interface";

@Component({
  selector: 'app-game',
  standalone: true,
    imports: [CommonModule, NgOptimizedImage],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent {
  @Input() game: Game = {} as Game;
}
