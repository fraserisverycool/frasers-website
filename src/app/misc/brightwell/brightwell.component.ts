import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from "../../../environments/environment";

@Component({
  selector: 'app-brightwell',
  imports: [],
  templateUrl: './brightwell.component.html',
  styleUrl: './brightwell.component.css',
})
export default class BrightwellComponent {
  path: string = `${environment.imageBaseUrl}/misc/brightwell/Brightwell.html`;
  safePath: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    this.safePath = this.sanitizer.bypassSecurityTrustResourceUrl(this.path);
  }
}
