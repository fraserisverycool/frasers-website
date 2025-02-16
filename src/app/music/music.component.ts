import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router} from "@angular/router";

@Component({
  selector: 'app-music',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './music.component.html',
  styleUrls: ['./music.component.css']
})
export default class MusicComponent {
  constructor(private router: Router) {}

  handleClick(url: string) {
    this.router.navigate([url]);
  }
}
