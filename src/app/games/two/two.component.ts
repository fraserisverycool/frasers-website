import { Component, inject, signal } from '@angular/core';
import { NgFor } from '@angular/common';
import GamesComponent from "../games.component";

@Component({
  selector: 'app-two',
  standalone: true,
    imports: [NgFor, GamesComponent],
  templateUrl: './two.component.html',
  styleUrls: ['./two.component.css']
})
export default class TwoComponent {
}
