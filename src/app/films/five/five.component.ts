import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import FilmsComponent from "../films.component";

@Component({
  selector: 'app-five',
  standalone: true,
  imports: [CommonModule, FilmsComponent],
  templateUrl: './five.component.html',
  styleUrls: ['./five.component.css']
})
export default class FiveComponent {

}
