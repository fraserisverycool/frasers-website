import {Component, HostBinding, OnInit} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import {ActivatedRoute, RouterLink} from "@angular/router";
import { HttpClient } from "@angular/common/http";
import {Entry, Newsletter, NewsletterContent} from "../newsletter.interface";
import {ImageService} from "../../utils/services/image.service";

@Component({
    selector: 'app-newsletter',
    imports: [CommonModule, NgOptimizedImage, RouterLink],
    templateUrl: './newsletter.component.html',
    styleUrls: ['./newsletter.component.css']
})
export default class NewsletterComponent implements OnInit {
  @HostBinding('class') classes = 'brown-background';
  newsletter: any = null;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    protected imageService: ImageService
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
      case NewsletterContent.DAILY_SOUNDTRACK:
        return 'daily-soundtrack';
      default:
        return 'entry';
    }
  }

  getName(type: string) {
    if (type === NewsletterContent.GAME) {
      return "Game Review"
    }
    if (type === NewsletterContent.FILM) {
      return "Film Review"
    }
    if (type === NewsletterContent.ALBUM) {
      return "Album Review"
    }
    if (type === NewsletterContent.SOUNDTRACK) {
      return "Nintendo Soundtrack Review"
    }
    if (type === NewsletterContent.BOOK) {
      return "Book Review"
    }
    if (type === NewsletterContent.GALLERY) {
      return "New Photo in the Gallery"
    }
    if (type === NewsletterContent.VIDEO) {
      return "Fun video for your entertainment"
    }
    if (type === NewsletterContent.CD) {
      return "New CD"
    }
    if (type === NewsletterContent.DURSTLOESCHER) {
      return "Durstloescher Review from Anni"
    }
    if (type === NewsletterContent.MARIOKART) {
      return "Mario Kart Track Review"
    }
    if (type === NewsletterContent.STITCH) {
      return "New Cross Stitch"
    }
    if (type === NewsletterContent.MIX) {
      return "New Mix"
    }
    if (type === NewsletterContent.KK) {
      return "KK Song Review"
    }
    if (type === NewsletterContent.CHARACTER_DECO) {
      return "Smash character decoration in my house"
    }
    if (type === NewsletterContent.DAILY_SOUNDTRACK) {
      return "Soundtrack of the day"
    }
    return type;
  }
}
