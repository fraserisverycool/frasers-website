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
    positions: { top: string; left: string }[];

    constructor(private router: Router, protected imageService: ImageService) {
      const cols = 4;
      const rows = 4;
      const cells = Array.from({ length: cols * rows }, (_, i) => i);
      // Fisher-Yates shuffle
      for (let i = cells.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cells[i], cells[j]] = [cells[j], cells[i]];
      }
      this.positions = cells.slice(0, 13).map(cell => {
        const col = cell % cols;
        const row = Math.floor(cell / cols);
        const cellW = 100 / cols;
        const cellH = 100 / rows;
        const jitterX = Math.random() * (cellW * 0.5);
        const jitterY = Math.random() * (cellH * 0.5);
        return {
          left: `${col * cellW + jitterX}%`,
          top: `${row * cellH + jitterY}%`,
        };
      });
    }

    handleClick(url: string) {
      this.router.navigate([url]);
    }

}
