import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router} from "@angular/router";
import CharactersComponent from "./characters/characters.component";
import {ImageService} from "../utils/services/image.service";

@Component({
    selector: 'app-misc',
    imports: [CommonModule, CharactersComponent],
    templateUrl: './misc.component.html',
    styleUrls: ['./misc.component.css']
})
export default class MiscComponent {
    constructor(private router: Router, protected imageService: ImageService) {}

    handleClick(url: string) {
      this.router.navigate([url]);
    }

}
