import {Component, HostBinding, OnInit} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {ActivatedRoute} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {Entry, Newsletter, NewsletterContent} from "../newsletter.interface";
import {RatingBarComponent} from "../../utils/rating-bar/rating-bar.component";

@Component({
  selector: 'app-newsletter',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, RatingBarComponent],
  templateUrl: './newsletter.component.html',
  styleUrls: ['./newsletter.component.css']
})
export default class NewsletterComponent implements OnInit {
  @HostBinding('class') classes = 'brown-background';
  newsletter: any = null;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.http.get<Newsletter>('assets/newsletter/newsletter-' + params.get('timestamp') + '.json').subscribe(data => {
        this.newsletter = data;
      });
    });
  }

  getClass(entry: Entry) {
    switch(entry.type) {
      case NewsletterContent.GAME:
        return 'game';
      case NewsletterContent.FILM:
        return 'film';
      case NewsletterContent.DURSTLOESCHER:
        return 'durstloescher';
      case NewsletterContent.BOOK:
        return 'book';
      case NewsletterContent.GALLERY:
        return 'gallery';
      case NewsletterContent.VIDEO:
        return 'video';
      case NewsletterContent.CHARACTER_DECO:
        return 'character-deco';
      case NewsletterContent.MARIOKART:
        return 'mariokart';
      case NewsletterContent.STITCH:
        return 'stitch';
      case NewsletterContent.ALBUM:
        return 'album';
      case NewsletterContent.CD:
        return 'cd';
      case NewsletterContent.MIX:
        return 'mix';
      case NewsletterContent.SOUNDTRACK:
        return 'soundtrack';
      case NewsletterContent.KK:
        return 'kk';
      default:
        return 'entry';
    }
  }

  getName(type: string) {
    if (type === NewsletterContent.CHARACTER_DECO) {
      return "SMASH CHARACTER DECORATION"
    }
    return type;
  }
}
