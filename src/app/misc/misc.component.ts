import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router} from "@angular/router";
import CharactersComponent from "./characters/characters.component";

@Component({
  selector: 'app-misc',
  standalone: true,
  imports: [CommonModule, CharactersComponent],
  templateUrl: './misc.component.html',
  styleUrls: ['./misc.component.css']
})
export default class MiscComponent {
    constructor(private router: Router) {}

    handleClick(url: string) {
      this.router.navigate([url]);
    }

}
