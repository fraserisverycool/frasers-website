import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import GamesComponent from "../games.component";

@Component({
  selector: 'app-five',
  standalone: true,
  imports: [CommonModule, GamesComponent],
  templateUrl: './five.component.html',
  styleUrls: ['./five.component.css']
})
export default class FiveComponent {

}
