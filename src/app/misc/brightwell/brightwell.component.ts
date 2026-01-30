import { Component, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from "../../../environments/environment";
import {ImageService} from "../../utils/services/image.service";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-brightwell',
  imports: [
    CommonModule
  ],
  templateUrl: './brightwell.component.html',
  styleUrl: './brightwell.component.css',
})
export default class BrightwellComponent implements OnInit, OnDestroy {
  path: string = `${environment.imageBaseUrl}/misc/brightwell/Brightwell.html`;
  safePath: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer, protected imageService: ImageService) {
    this.safePath = this.sanitizer.bypassSecurityTrustResourceUrl(this.path);
  }

  private messageHandler = (event: MessageEvent) => {
    if (!event.data || event.data.type !== 'TWINE_EVENT') return;
    this.updateBackend(event.data.event);
  };

  private updateBackend(ending: string) {
    fetch(`${environment.apiUrl}/brightwell/ending`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ending }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('Successfully updated ending stats:', data);
    })
    .catch(error => console.error('Error updating ending stats:', error));
  }

  ngOnInit() {
    window.addEventListener('message', this.messageHandler);
  }

  ngOnDestroy() {
    window.removeEventListener('message', this.messageHandler);
  }
}
