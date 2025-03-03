import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import FilmsComponent from "../films.component";

@Component({
  selector: 'app-three',
  standalone: true,
    imports: [CommonModule, FilmsComponent],
  templateUrl: './three.component.html',
  styleUrls: ['./three.component.css']
})
export default class ThreeComponent {

}
