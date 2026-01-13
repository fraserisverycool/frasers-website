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
  selectedTag: string | null = null;
  selectedFranchise: string | null = null;
  selectedGenre: string | null = null;
  isRandomSort: boolean = false;
  isCalendarOpen: boolean = false;
  isFilterDropdownOpen: boolean = false;
  isTagDropdownOpen: boolean = false;
  isFranchiseDropdownOpen: boolean = false;
  isGenreDropdownOpen: boolean = false;
  filters = ["I don't care about video game music!", "Gimme that sweet video game music!", "Show me it all!"];
  tags = ["chill", "party", "intense", "funky"];
  franchises = ["mario", "zelda", "donkey kong", "yoshi", "pokemon", "animal crossing", "metroid", "indie", "other"];
  genres = ["singer-songwriter", "pop", "soul", "rock", "indie", "sad songs", "from the heart"];
  today: DailySoundtrack | null = null;
  audioPath: string = '/music/dailysoundtracks/';
  currentTrack: DailySoundtrack | null = null;
  playlist: DailySoundtrack[] = [];

  constructor(private http: HttpClient, private ratingService: RatingService, private sanitizer: DomSanitizer, protected imageService: ImageService, private eRef: ElementRef) {
  }

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isCalendarOpen = false;
      this.isFilterDropdownOpen = false;
      this.isTagDropdownOpen = false;
      this.isFranchiseDropdownOpen = false;
      this.isGenreDropdownOpen = false;
    } else {
      const clickedInsideCalendar = event.target.closest('.calendar-container');
      const clickedInsideFilter = event.target.closest('.filter-container');
      const clickedInsideTag = event.target.closest('.tag-container');
      const clickedInsideFranchise = event.target.closest('.franchise-container');
      const clickedInsideGenre = event.target.closest('.genre-container');

      if (!clickedInsideCalendar) {
        this.isCalendarOpen = false;
      }
      if (!clickedInsideFilter) {
        this.isFilterDropdownOpen = false;
      }
      if (!clickedInsideTag) {
        this.isTagDropdownOpen = false;
      }
      if (!clickedInsideFranchise) {
        this.isFranchiseDropdownOpen = false;
      }
      if (!clickedInsideGenre) {
        this.isGenreDropdownOpen = false;
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
    let filteredTracks = tracks;
    if (this.selectedMonth) {
      filteredTracks = filteredTracks.filter(track => {
        const date = parse(track.day, 'dd-MM-yyyy', new Date());
        return format(date, 'MMMM yyyy') === this.selectedMonth;
      });
    }

    if (this.selectedTag) {
      filteredTracks = filteredTracks.filter(track => track.tags && track.tags.includes(this.selectedTag!));
    }

    if (this.selectedFranchise) {
      filteredTracks = filteredTracks.filter(track => track.tags && track.tags.includes(this.selectedFranchise!));
    }

    if (this.selectedGenre) {
      filteredTracks = filteredTracks.filter(track => track.tags && track.tags.includes(this.selectedGenre!));
    }

    if (this.isRandomSort) {
      this.groupedDailySoundtracks = [{
        month: 'Random',
        tracks: [...filteredTracks].sort(() => Math.random() - 0.5)
      }];
    } else {
      const groups: { [key: string]: DailySoundtrack[] } = {};
      const sortedTracks = [...filteredTracks].sort((a, b) => {
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

    if (criteria !== 'Gimme that sweet video game music!') {
      this.selectedFranchise = null;
    }

    if (criteria !== "I don't care about video game music!") {
      this.selectedGenre = null;
    }

    let filteredTracks = this.originalDailySoundtracks;
    switch (criteria) {
      case 'Gimme that sweet video game music!':
        filteredTracks = this.originalDailySoundtracks.filter(soundtrack => soundtrack.game);
        break;
      case "I don't care about video game music!":
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

  selectTag(tag: string | null): void {
    this.selectedTag = tag;
    this.isTagDropdownOpen = false;
    this.filterDailySoundtracks(this.currentFilter);
  }

  selectFranchise(franchise: string | null): void {
    this.selectedFranchise = franchise;
    this.isFranchiseDropdownOpen = false;
    this.filterDailySoundtracks(this.currentFilter);
  }

  selectGenre(genre: string | null): void {
    this.selectedGenre = genre;
    this.isGenreDropdownOpen = false;
    this.filterDailySoundtracks(this.currentFilter);
  }

  toggleCalendar(): void {
    this.isCalendarOpen = !this.isCalendarOpen;
    if (this.isCalendarOpen) {
      this.isFilterDropdownOpen = false;
      this.isTagDropdownOpen = false;
      this.isFranchiseDropdownOpen = false;
      this.isGenreDropdownOpen = false;
    }
  }

  toggleFilterDropdown(): void {
    this.isFilterDropdownOpen = !this.isFilterDropdownOpen;
    if (this.isFilterDropdownOpen) {
      this.isCalendarOpen = false;
      this.isTagDropdownOpen = false;
      this.isFranchiseDropdownOpen = false;
      this.isGenreDropdownOpen = false;
    }
  }

  toggleTagDropdown(): void {
    this.isTagDropdownOpen = !this.isTagDropdownOpen;
    if (this.isTagDropdownOpen) {
      this.isCalendarOpen = false;
      this.isFilterDropdownOpen = false;
      this.isFranchiseDropdownOpen = false;
      this.isGenreDropdownOpen = false;
    }
  }

  toggleFranchiseDropdown(): void {
    this.isFranchiseDropdownOpen = !this.isFranchiseDropdownOpen;
    if (this.isFranchiseDropdownOpen) {
      this.isCalendarOpen = false;
      this.isFilterDropdownOpen = false;
      this.isTagDropdownOpen = false;
      this.isGenreDropdownOpen = false;
    }
  }

  toggleGenreDropdown(): void {
    this.isGenreDropdownOpen = !this.isGenreDropdownOpen;
    if (this.isGenreDropdownOpen) {
      this.isCalendarOpen = false;
      this.isFilterDropdownOpen = false;
      this.isTagDropdownOpen = false;
      this.isFranchiseDropdownOpen = false;
    }
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
