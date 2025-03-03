import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import GamesComponent from "../games.component";

@Component({
  selector: 'app-three',
  standalone: true,
    imports: [CommonModule, GamesComponent],
  templateUrl: './three.component.html',
  styleUrls: ['./three.component.css']
})
export default class ThreeComponent {

}
