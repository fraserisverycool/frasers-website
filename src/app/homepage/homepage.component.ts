import {Component} from '@angular/core';
import {NgFor} from '@angular/common';
import {Router, RouterLink} from "@angular/router";
import {CustomMarqueeComponent} from "./custom-marquee/custom-marquee.component";

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [NgFor, RouterLink, CustomMarqueeComponent],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export default class HomepageComponent {
  constructor(private router: Router) {}

  handleClick(url: string) {
    this.router.navigate([url]);
  }
}
