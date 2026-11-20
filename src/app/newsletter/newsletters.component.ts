import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
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
export default class NewslettersComponent {
  private newsletterService = inject(NewsletterService);

  readonly newsletters = toSignal(
    this.newsletterService.getNewsletters().pipe(
      catchError(err => {
        console.error('Failed to load newsletters:', err);
        return of([] as Newsletter[]);
      })
    ),
    { initialValue: [] as Newsletter[] }
  );
}
