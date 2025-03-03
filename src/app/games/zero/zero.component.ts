import { Component, inject, signal } from '@angular/core';
import { NgFor } from '@angular/common';
import GamesComponent from "../games.component";

@Component({
  selector: 'app-oranges',
  standalone: true,
    imports: [NgFor, GamesComponent],
  templateUrl: './zero.component.html',
  styleUrls: ['./zero.component.css']
})
export default class ZeroComponent {
}
