import {Component} from '@angular/core';
import {NgFor, NgOptimizedImage} from '@angular/common';
import {Router, RouterLink} from "@angular/router";
import {CustomMarqueeComponent} from "./custom-marquee/custom-marquee.component";
import {ChangelogComponent} from "./changelog-page/changelog/changelog.component";

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [NgFor, RouterLink, CustomMarqueeComponent, NgOptimizedImage, ChangelogComponent],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export default class HomepageComponent {
  images = [
    '../../../assets/homepage/fraser.PNG',
    '../../../assets/homepage/fraser2.jpg',
    '../../../assets/homepage/fraser3.jpg',
    '../../../assets/homepage/fraser4.jpg',
    '../../../assets/homepage/fraser5.jpg',
  ];
  randomImage: string = '../../../assets/homepage/fraser.PNG';

  constructor(private router: Router) {}

  handleClick(url: string) {
    this.router.navigate([url]);
  }

  ngOnInit(): void {
    this.pickRandomImage();
  }

  pickRandomImage(): void {
    const randomIndex = Math.floor(Math.random() * this.images.length);
    this.randomImage = this.images[randomIndex];
  }
}
