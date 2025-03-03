import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import FilmsComponent from "../films.component";

@Component({
  selector: 'app-four',
  standalone: true,
    imports: [CommonModule, FilmsComponent],
  templateUrl: './four.component.html',
  styleUrls: ['./four.component.css']
})
export default class FourComponent {

}
