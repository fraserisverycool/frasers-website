import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgClass, NgOptimizedImage } from '@angular/common';
import {ActivatedRoute, RouterLink} from "@angular/router";
import { catchError, filter, map, of, switchMap } from 'rxjs';
import {Entry, Newsletter} from "../newsletter.interface";
import {ImageUrlPipe} from "../../utils/pipes/image-url.pipe";
import {NewsletterService} from "../service/newsletter.service";
import {getNewsletterContentClass, getNewsletterContentName} from "../newsletter.config";

@Component({
    selector: 'app-newsletter',
    imports: [NgClass, NgOptimizedImage, RouterLink, ImageUrlPipe],
    templateUrl: './newsletter.component.html',
    styleUrls: ['./newsletter.component.css'],
    host: { 'class': 'brown-background' }
})
export default class NewsletterComponent {
  private route = inject(ActivatedRoute);
  private newsletterService = inject(NewsletterService);

  readonly newsletter = toSignal(
    this.route.paramMap.pipe(
      map(params => params.get('timestamp')),
      filter((timestamp): timestamp is string => !!timestamp),
      switchMap(timestamp => this.newsletterService.getNewsletterByTimestamp(timestamp)),
      catchError(err => {
        console.error('Failed to load newsletter:', err);
        return of(null);
      })
    ),
    { initialValue: null as Newsletter | null }
  );

  getClass(entry: Entry): string {
    return getNewsletterContentClass(entry.type);
  }

  getName(type: string): string {
    return getNewsletterContentName(type);
  }
}
