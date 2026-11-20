import {Component, HostBinding, OnInit} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import {ActivatedRoute, RouterLink} from "@angular/router";
import {Entry, Newsletter} from "../newsletter.interface";
import {ImageUrlPipe} from "../../utils/pipes/image-url.pipe";
import {NewsletterService} from "../service/newsletter.service";
import {getNewsletterContentClass, getNewsletterContentName} from "../newsletter.config";

@Component({
    selector: 'app-newsletter',
    imports: [CommonModule, NgOptimizedImage, RouterLink, ImageUrlPipe],
    templateUrl: './newsletter.component.html',
    styleUrls: ['./newsletter.component.css']
})
export default class NewsletterComponent implements OnInit {
  @HostBinding('class') classes = 'brown-background';
  newsletter: Newsletter | null = null;

  constructor(
    private route: ActivatedRoute,
    private newsletterService: NewsletterService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const timestamp = params.get('timestamp');
      if (timestamp) {
        this.newsletterService.getNewsletterByTimestamp(timestamp).subscribe(data => {
          this.newsletter = data;
        });
      }
    });
  }

  getClass(entry: Entry): string {
    return getNewsletterContentClass(entry.type);
  }

  getName(type: string): string {
    return getNewsletterContentName(type);
  }
}
