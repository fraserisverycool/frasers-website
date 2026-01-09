import {Component, ElementRef, HostListener, OnInit} from '@angular/core';
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
  selectedMonth: string | null = null;
  isRandomSort: boolean = false;
  isCalendarOpen: boolean = false;
  isFilterDropdownOpen: boolean = false;
  filters = ["I don't care about video game music!", "Gimme that sweet video game music!", "Show me it all!"];
  today: DailySoundtrack | null = null;
  audioPath: string = '/music/dailysoundtracks/';
  currentTrack: DailySoundtrack | null = null;
  playlist: DailySoundtrack[] = [];

  constructor(private http: HttpClient, private ratingService: RatingService, private sanitizer: DomSanitizer, protected imageService: ImageService, private eRef: ElementRef) {
  }

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    // If the click is outside the entire component, close all dropdowns
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isCalendarOpen = false;
      this.isFilterDropdownOpen = false;
    } else {
      // If the click is inside the component, we check if it was on a toggle button
      // or inside a dropdown. If it was neither, we might want to close them too.
      // But typically, clicking elsewhere in the same component should also close them
      // if it's not the button that toggles them.

      const clickedInsideCalendar = event.target.closest('.calendar-container');
      const clickedInsideFilter = event.target.closest('.filter-container');

      if (!clickedInsideCalendar) {
        this.isCalendarOpen = false;
      }
      if (!clickedInsideFilter) {
        this.isFilterDropdownOpen = false;
      }
    }
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
        this.filterDailySoundtracks(this.currentFilter);
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

  get availableMonths(): string[] {
    const months = new Set<string>();
    this.originalDailySoundtracks.forEach(track => {
      const date = parse(track.day, 'dd-MM-yyyy', new Date());
      months.add(format(date, 'MMMM yyyy'));
    });
    return Array.from(months).sort((a, b) => {
      const dateA = parse(a, 'MMMM yyyy', new Date());
      const dateB = parse(b, 'MMMM yyyy', new Date());
      return dateB.getTime() - dateA.getTime();
    });
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
        this.filterDailySoundtracks(this.currentFilter);
      });
  }

  groupSoundtracks(tracks: DailySoundtrack[]): void {
    let filteredByMonth = tracks;
    if (this.selectedMonth) {
      filteredByMonth = tracks.filter(track => {
        const date = parse(track.day, 'dd-MM-yyyy', new Date());
        return format(date, 'MMMM yyyy') === this.selectedMonth;
      });
    }

    if (this.isRandomSort) {
      this.groupedDailySoundtracks = [{
        month: 'Random',
        tracks: [...filteredByMonth].sort(() => Math.random() - 0.5)
      }];
    } else {
      const groups: { [key: string]: DailySoundtrack[] } = {};
      const sortedTracks = [...filteredByMonth].sort((a, b) => {
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

    this.updatePlaylist();
  }

  updatePlaylist(): void {
    this.playlist = this.groupedDailySoundtracks.flatMap(group => group.tracks).filter(track => track.filename);
  }

  playAll(): void {
    if (this.playlist.length > 0) {
      this.playTrack(this.playlist[0]);
    }
  }

  playTrack(track: DailySoundtrack): void {
    this.currentTrack = track;
  }

  nextTrack(): void {
    if (!this.currentTrack) return;
    const currentIndex = this.playlist.findIndex(t => t.id === this.currentTrack?.id);
    if (currentIndex !== -1 && currentIndex < this.playlist.length - 1) {
      this.playTrack(this.playlist[currentIndex + 1]);
    } else {
      this.currentTrack = null; // End of playlist
    }
  }

  previousTrack(): void {
    if (!this.currentTrack) return;
    const currentIndex = this.playlist.findIndex(t => t.id === this.currentTrack?.id);
    if (currentIndex > 0) {
      this.playTrack(this.playlist[currentIndex - 1]);
    }
  }

  onTrackEnded(): void {
    this.nextTrack();
  }

  filterDailySoundtracks(criteria: string): void {
    this.currentFilter = criteria;
    this.isFilterDropdownOpen = false;
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

  selectMonth(month: string | null): void {
    this.selectedMonth = month;
    this.isCalendarOpen = false;
    this.filterDailySoundtracks(this.currentFilter);
  }

  toggleCalendar(): void {
    this.isCalendarOpen = !this.isCalendarOpen;
    if (this.isCalendarOpen) this.isFilterDropdownOpen = false;
  }

  toggleFilterDropdown(): void {
    this.isFilterDropdownOpen = !this.isFilterDropdownOpen;
    if (this.isFilterDropdownOpen) this.isCalendarOpen = false;
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
