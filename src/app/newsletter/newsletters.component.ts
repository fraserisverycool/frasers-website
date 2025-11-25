import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Newsletter} from "./newsletter.interface";
import {HttpClient} from "@angular/common/http";
import {RatingService} from "../utils/rating-bar/service/rating.service";
import {RouterLink} from "@angular/router";
import {ImageService} from "../utils/services/image.service";

@Component({
  selector: 'app-newsletters',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './newsletters.component.html',
  styleUrls: ['./newsletters.component.css']
})
export default class NewslettersComponent {
  newsletters: Newsletter[] = [];

  constructor(private http: HttpClient, private ratingService: RatingService, protected imageService: ImageService) {}

  ngOnInit(): void {
    this.http
      .get<{ newsletters: string[] }>('assets/data/newsletters.json')
      .subscribe({
        next: (data) => {
          const loaded: Newsletter[] = [];
          const total = data.newsletters.length;
          let count = 0;

          for (const filename of data.newsletters) {
            this.http
              .get<Newsletter>('assets/newsletter/' + filename)
              .subscribe({
                next: (newsletterData: Newsletter) => {
                  loaded.push(newsletterData);
                  count++;

                  // When all newsletters are loaded, sort & assign
                  if (count === total) {
                    loaded.sort((a, b) => {
                      const parse = (s: string) => {
                        const [d, m, y] = s.split('-').map(Number);
                        return new Date(y, m - 1, d);
                      };
                      return parse(b.timestamp).getTime() - parse(a.timestamp).getTime();
                    });

                    this.newsletters = loaded;
                    this.getRatings();
                  }
                },
                error: (err: unknown) => {
                  console.error('Failed to load newsletter:', err);
                },
              });
          }
        },
        error: (err: unknown) => {
          console.error('Failed to load newsletters list:', err);
        },
      });
  }

  getRatings(): void {
    this.ratingService.getRatingsById(this.newsletters.map(newsletter => newsletter.id))
      .subscribe(newsletterRatings => {
        this.newsletters = this.newsletters.map(newsletter => {
          const ratingData = newsletterRatings.find(rating => rating.id === newsletter.id);
          if (ratingData) {
            newsletter.rating = ratingData.ratings;
          } else {
            newsletter.rating = [0,0,0,0,0,0];
          }
          return newsletter;
        });
      });
  }
}
