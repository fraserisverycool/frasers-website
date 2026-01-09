import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {DailySoundtrack} from "../daily-soundtrack.interface";
import {DomSanitizer} from "@angular/platform-browser";
import { HttpClient } from "@angular/common/http";
import {RatingService} from "../../../utils/rating-bar/service/rating.service";
import {RatingBarComponent} from "../../../utils/rating-bar/rating-bar.component";
import {isBefore, parse, format} from "date-fns";
import {ImageService} from "../../../utils/services/image.service";

interface GroupedDailySoundtracks {
  month: string;
  tracks: DailySoundtrack[];
}

@Component({
    selector: 'app-dailies',
    imports: [CommonModule, RatingBarComponent],
    templateUrl: './dailies.component.html',
    styleUrls: ['./dailies.component.css']
})
export default class DailiesComponent implements OnInit {
  originalDailySoundtracks: DailySoundtrack[] = [];
  groupedDailySoundtracks: GroupedDailySoundtracks[] = [];
  currentFilter: string = '';
  isRandomSort: boolean = false;
  filters = ["I don't care about video game music!", "Gimme that sweet video game music!", "Show me it all!"];
  today: DailySoundtrack | null = null;
  audioPath: string = '/music/dailysoundtracks/';

  constructor(private http: HttpClient, private ratingService: RatingService, private sanitizer: DomSanitizer, protected imageService: ImageService) {
  }

  ngOnInit(): void {
    this.loadDailySoundtracks();
  }

  loadDailySoundtracks(): void {
    this.http.get<{ dailysoundtracks: DailySoundtrack[] }>('assets/data/daily-soundtracks.json').subscribe({
      next: (data) => {
        const now = new Date();
        this.originalDailySoundtracks = data.dailysoundtracks.filter(
          ds => isBefore(parse(ds.day, 'dd-MM-yyyy', new Date()), now)
        );
        this.originalDailySoundtracks.forEach(ds => ds.link = this.sanitizer.bypassSecurityTrustResourceUrl(ds.link) as string);
        this.getRatings();
        this.today = this.originalDailySoundtracks.find(dailySoundtrack => dailySoundtrack.day === this.todaysDate()) || null;
        this.groupSoundtracks(this.originalDailySoundtracks);
      },
      error: (err) => {
        console.error('Failed to load daily Soundtracks:', err);
      },
    });
  }

  todaysDate(): string {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();

    return `${day}-${month}-${year}`;
  }

  getRatings(): void {
    this.ratingService.getRatingsById(this.originalDailySoundtracks.map(dailySoundtrack => dailySoundtrack.id))
      .subscribe(dailySoundtrackRatings => {
        this.originalDailySoundtracks = this.originalDailySoundtracks.map(dailySoundtrack => {
          const ratingData = dailySoundtrackRatings.find(rating => rating.id === dailySoundtrack.id);
          if (ratingData) {
            dailySoundtrack.rating = ratingData.ratings;
          } else {
            dailySoundtrack.rating = [0,0,0,0,0,0];
          }
          return dailySoundtrack;
        });
        this.groupSoundtracks(this.originalDailySoundtracks);
      });
  }

  groupSoundtracks(tracks: DailySoundtrack[]): void {
    if (this.isRandomSort) {
      this.groupedDailySoundtracks = [{
        month: 'Random',
        tracks: [...tracks].sort(() => Math.random() - 0.5)
      }];
      return;
    }

    const groups: { [key: string]: DailySoundtrack[] } = {};
    const sortedTracks = [...tracks].sort((a, b) => {
      const dateA = parse(a.day, 'dd-MM-yyyy', new Date());
      const dateB = parse(b.day, 'dd-MM-yyyy', new Date());
      return dateB.getTime() - dateA.getTime();
    });

    const monthOrder: string[] = [];

    sortedTracks.forEach(track => {
      const date = parse(track.day, 'dd-MM-yyyy', new Date());
      const monthYear = format(date, 'MMMM yyyy');
      if (!groups[monthYear]) {
        groups[monthYear] = [];
        monthOrder.push(monthYear);
      }
      groups[monthYear].push(track);
    });

    this.groupedDailySoundtracks = monthOrder.map(month => ({
      month,
      tracks: groups[month]
    }));
  }

  filterDailySoundtracks(criteria: string): void {
    console.log(criteria);
    this.currentFilter = criteria;
    let filteredTracks = this.originalDailySoundtracks;
    switch (criteria) {
      case 'Gimme that sweet video game music!':
        filteredTracks = this.originalDailySoundtracks.filter(soundtrack => soundtrack.game);
        break;
      case 'I don\'t care about video game music!':
        filteredTracks = this.originalDailySoundtracks.filter(soundtrack => !soundtrack.game);
        break;
      default:
        filteredTracks = this.originalDailySoundtracks;
        break;
    }
    this.groupSoundtracks(filteredTracks);
  }

  randomize(): void {
    this.isRandomSort = true;
    this.filterDailySoundtracks(this.currentFilter);
  }

  chronological(): void {
    this.isRandomSort = false;
    this.filterDailySoundtracks(this.currentFilter);
  }
}
