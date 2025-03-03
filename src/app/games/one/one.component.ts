import { Component, inject, signal } from '@angular/core';
import { NgFor } from '@angular/common';
import GamesComponent from "../games.component";

@Component({
  selector: 'app-one',
  standalone: true,
    imports: [NgFor, GamesComponent],
  templateUrl: './one.component.html',
  styleUrls: ['./one.component.css']
})
export default class OneComponent {
}
