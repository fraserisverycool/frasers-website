import {Component, OnInit} from '@angular/core';
import {Newsletter} from "./newsletter.interface";
import {RouterLink} from "@angular/router";
import {ImageUrlPipe} from "../utils/pipes/image-url.pipe";
import {NewsletterService} from "./service/newsletter.service";

@Component({
    selector: 'app-newsletters',
    imports: [RouterLink, ImageUrlPipe],
    templateUrl: './newsletters.component.html',
    styleUrls: ['./newsletters.component.css']
})
export default class NewslettersComponent implements OnInit {
  newsletters: Newsletter[] = [];

  constructor(private newsletterService: NewsletterService) {}

  ngOnInit(): void {
    this.newsletterService.getNewsletters().subscribe({
      next: (newsletters) => {
        this.newsletters = newsletters;
      },
      error: (err) => {
        console.error('Failed to load newsletters:', err);
      }
    });
  }
}
