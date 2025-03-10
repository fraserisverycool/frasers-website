import { Component } from '@angular/core';
import {NgFor} from '@angular/common';
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-films',
  standalone: true,
  imports: [NgFor, RouterLink],
  templateUrl: './films.component.html',
  styleUrls: ['./films.component.css']
})
export default class FilmsComponent {
  years = ["next", '2025', '2024', '2023'];

  goToYear(year: string) {
    window.location.href = `/films/${year}`;
  }
}
