import { Component } from '@angular/core';
import { NgFor} from '@angular/common';
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [NgFor, RouterLink],
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.css']
})
export default class GamesComponent {
  years = [2025, 2024, 2023, 2022, 2021, 2020];

  goToYear(year: number) {
    window.location.href = `/games/${year}`;
  }
}
