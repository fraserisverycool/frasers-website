import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router, RouterLink} from "@angular/router";
import {CharactersComponent} from "./characters/characters.component";

@Component({
  selector: 'app-smash',
  standalone: true,
  imports: [CommonModule, CharactersComponent],
  templateUrl: './smash.component.html',
  styleUrls: ['./smash.component.css']
})
export default class SmashComponent {
    constructor(private router: Router) {}

    handleClick(url: string) {
      this.router.navigate([url]);
    }

}
