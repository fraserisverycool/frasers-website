import { Component, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from "../../../environments/environment";
import {ImageService} from "../../utils/services/image.service";

@Component({
  selector: 'app-brightwell',
  imports: [],
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

    switch (event.data.event) {
      case 'ending1':
        this.onEnding(event.data.data);
        break;
    }
  };

  ngOnInit() {
    window.addEventListener('message', this.messageHandler);
  }

  ngOnDestroy() {
    window.removeEventListener('message', this.messageHandler);
  }

  onEnding(data: any) {
    console.log('Test', data);
  }
}
