import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import {Router, RouterLink} from "@angular/router";
import {CustomMarqueeComponent} from "./custom-marquee/custom-marquee.component";
import {ChangelogComponent} from "./changelog-page/changelog/changelog.component";
import ColorPickerComponent from "../utils/color-picker/color-picker.component";
import {FormsModule} from "@angular/forms";
import {HomepageColorService} from "./service/homepage-color.service";
import {DailyComponent} from "../music/daily/daily.component";
import { WelcomeImageComponent } from "./welcome-image/welcome-image.component";
import { LatestPostsComponent } from "./latest-posts/latest-posts.component";
import { ImageUrlPipe } from "../utils/pipes/image-url.pipe";

@Component({
    selector: 'app-homepage',
  imports: [RouterLink, CustomMarqueeComponent, NgOptimizedImage, ChangelogComponent, ColorPickerComponent, FormsModule, DailyComponent, WelcomeImageComponent, LatestPostsComponent, ImageUrlPipe],
    templateUrl: './homepage.component.html',
    styleUrls: ['./homepage.component.css']
})
export default class HomepageComponent {
  private router = inject(Router);
  private homepageColorService = inject(HomepageColorService);

  readonly images = [
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
  readonly randomImage = signal('/homepage/fraser.PNG');
  readonly homepageColor = signal('#ffffff');
  readonly colorSelection = signal('#ffffff');
  readonly colorChanges = signal(0);
  readonly errorMessage = signal('');
  readonly textColorValue = computed(() => this.textColor(this.homepageColor()));

  private errorTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.errorTimer));
  }

  handleClick(url: string) {
    this.router.navigate([url]);
  }

  ngOnInit(): void {
    this.pickRandomImage();
    this.loadColor();
  }

  pickRandomImage(): void {
    const randomIndex = Math.floor(Math.random() * this.images.length);
    this.randomImage.set(this.images[randomIndex]);
  }

  loadColor(): void {
    this.homepageColorService.getLatestColor().subscribe({
      next: (data) => {
        this.homepageColor.set(data.latest);
        this.colorChanges.set(data.total);
      },
      error: () => {
        this.showError('Error loading colour');
        this.homepageColor.set('#ffffff');
      }
    });
  }

  submitColor(): void {
    const color = this.colorSelection();
    if (color) {
      this.homepageColorService.postColor({ color }).subscribe({
        next: (response) => {
          this.homepageColor.set(response.color);
          this.colorChanges.update(n => n + 1);
        },
        error: (error) => {
          console.error('Error posting colour:', error);
          if (error.error && error.error.errors) {
            this.showError(error.error.errors.map((e: { msg: any; }) => e.msg).join(', '));
          } else {
            this.showError('Error submitting colour');
          }
        }
      });
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
    this.errorMessage.set(message);
    clearTimeout(this.errorTimer);
    this.errorTimer = setTimeout(() => {
      this.errorMessage.set('');
    }, 5000);
  }
}
