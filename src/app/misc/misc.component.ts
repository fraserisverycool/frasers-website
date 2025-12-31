import { Component } from '@angular/core';

import {Router} from "@angular/router";
import {ImageService} from "../utils/services/image.service";

@Component({
    selector: 'app-misc',
    imports: [],
    templateUrl: './misc.component.html',
    styleUrls: ['./misc.component.css']
})
export default class MiscComponent {
    constructor(private router: Router, protected imageService: ImageService) {}

    handleClick(url: string) {
      this.router.navigate([url]);
    }

}
