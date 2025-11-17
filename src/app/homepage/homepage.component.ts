import {Component} from '@angular/core';
import {NgFor, NgIf, NgOptimizedImage} from '@angular/common';
import {Router, RouterLink} from "@angular/router";
import {CustomMarqueeComponent} from "./custom-marquee/custom-marquee.component";
import {ChangelogComponent} from "./changelog-page/changelog/changelog.component";
import ColorPickerComponent from "../utils/color-picker/color-picker.component";
import {FormsModule} from "@angular/forms";
import {HomepageColorService} from "./service/homepage-color.service";
import {catchError, tap} from "rxjs/operators";
import {of} from "rxjs";
import {DailyComponent} from "../music/daily/daily.component";
import {ImageService} from "../utils/services/image.service";

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [NgFor, RouterLink, CustomMarqueeComponent, NgOptimizedImage, ChangelogComponent, ColorPickerComponent, FormsModule, NgIf, DailyComponent],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export default class HomepageComponent {
  images = [
    '/homepage/random/fraser.PNG',
    '/homepage/random/fraser2.jpg',
    '/homepage/random/fraser3.jpg',
    '/homepage/random/fraser4.jpg',
    '/homepage/random/fraser5.jpg',
    '/homepage/random/hola.jpg',
    '/homepage/random/brock.avif',
    '/homepage/random/bruxish.avif',
    '/homepage/random/lickilicky.webp',
    '/homepage/random/kiff.jpg',
    '/homepage/random/that.PNG',
    '/homepage/random/rocket.jpg',
  ];
  randomImage: string = '/homepage/fraser.PNG';
  homepageColor: string = '#ffffff';
  colorSelection = { color: '#ffffff' };
  colorChanges: number = 0;
  errorMessage: string = '';

  constructor(private router: Router, private homepageColorService: HomepageColorService, protected imageService: ImageService) {}

  handleClick(url: string) {
    this.router.navigate([url]);
  }

  ngOnInit(): void {
    this.pickRandomImage();
    this.loadColor();
  }

  pickRandomImage(): void {
    const randomIndex = Math.floor(Math.random() * this.images.length);
    this.randomImage = this.images[randomIndex];
  }

  loadColor(): void {
    this.homepageColorService.getLatestColor().pipe(
      tap({next: (data) => {
          this.homepageColor = data.latest;
          this.colorChanges = data.total;
        }}),
      catchError(error => {
        this.showError('Error loading colour');
        this.homepageColor = "#ffffff"
        return of();
      })
    ).subscribe();
  }

  submitColor(): void {
    if (this.colorSelection.color) {
      this.homepageColorService.postColor(this.colorSelection).pipe(
        tap({next: (response) => {
            this.homepageColor = response.color;
            this.colorChanges = this.colorChanges + 1;
          }}),
        catchError((error) => {
          console.error('Error posting colour:', error);
          if (error.error && error.error.errors) {
            this.showError(error.error.errors.map((e: { msg: any; }) => e.msg).join(', '));
          } else {
            this.showError('Error submitting colour');
          }
          return of();
        })
      ).subscribe();
    }
  }

  textColor(color: string): string {
    return this.isLightColor(color) ? 'black' : 'white';
  }

  isLightColor(hexColor: string): boolean {
    // Convert hex to RGB
    const hex = hexColor.replace(/^#/, '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Calculate perceived brightness
    const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    // If brightness is greater than or equal to 128, the color is light
    return brightness >= 128;
  }

  showError(message: string): void {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = '';
    }, 5000);
  }
}
