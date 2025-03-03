import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import GamesComponent from "../games.component";

@Component({
  selector: 'app-four',
  standalone: true,
    imports: [CommonModule, GamesComponent],
  templateUrl: './four.component.html',
  styleUrls: ['./four.component.css']
})
export default class FourComponent {

}
