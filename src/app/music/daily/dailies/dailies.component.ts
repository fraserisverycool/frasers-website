import {Component, ElementRef, HostListener, OnInit, ViewChild, OnDestroy, ChangeDetectorRef} from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
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
export default class DailiesComponent implements OnInit, OnDestroy {
  allDailySoundtracks: DailySoundtrack[] = [];
  originalDailySoundtracks: DailySoundtrack[] = [];
  groupedDailySoundtracks: GroupedDailySoundtracks[] = [];
  currentFilter: string = '';
  selectedMonth: string | null = null;
  selectedTag: string | null = null;
  selectedFranchise: string | null = null;
  selectedGenre: string | null = null;
  showFuture: boolean = false;
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

  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;
  private _lastUpdateSec: number = -1;
  private isAutoAdvancing = false;

  constructor(private http: HttpClient, private ratingService: RatingService, private sanitizer: DomSanitizer, protected imageService: ImageService, private eRef: ElementRef, private cdr: ChangeDetectorRef) {
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

  private saveState(): void {
    const state = {
      currentFilter: this.currentFilter,
      selectedMonth: this.selectedMonth,
      selectedTag: this.selectedTag,
      selectedFranchise: this.selectedFranchise,
      selectedGenre: this.selectedGenre,
      showFuture: this.showFuture,
      isRandomSort: this.isRandomSort,
      currentTrackId: this.currentTrack?.id,
      playlistIds: this.playlist.map(t => t.id)
    };
    localStorage.setItem('dailies_player_state', JSON.stringify(state));
  }

  private loadState(): void {
    const saved = localStorage.getItem('dailies_player_state');
    if (!saved) return;

    try {
      const state = JSON.parse(saved);
      this.currentFilter = state.currentFilter || '';
      this.selectedMonth = state.selectedMonth || null;
      this.selectedTag = state.selectedTag || null;
      this.selectedFranchise = state.selectedFranchise || null;
      this.selectedGenre = state.selectedGenre || null;
      this.showFuture = state.showFuture || false;
      this.isRandomSort = state.isRandomSort || false;

      // Re-apply filters based on the restored state
      this.applyDateFilter();

      if (state.playlistIds && state.playlistIds.length > 0) {
        const trackMap = new Map(this.allDailySoundtracks.map(t => [t.id, t]));
        this.playlist = state.playlistIds.map((id: string) => trackMap.get(id)).filter((t: any) => t) as DailySoundtrack[];
      }

      if (state.currentTrackId) {
        const track = this.allDailySoundtracks.find(t => t.id === state.currentTrackId);
        if (track) {
          this.currentTrack = track;
          this.updateMediaSession(track);
        }
      }
    } catch (e) {
      console.error('Error loading saved state', e);
    }
  }

  ngOnInit(): void {
    this.setupMediaSessionHandlers();
    this.loadDailySoundtracks();
  }

  ngOnDestroy(): void {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
      try {
        // @ts-ignore
        navigator.mediaSession.setActionHandler('seekto', null);
      } catch (e) {}
    }
  }

  loadDailySoundtracks(): void {
    this.http.get<{ dailysoundtracks: DailySoundtrack[] }>('assets/data/daily-soundtracks.json').subscribe({
      next: (data) => {
        this.allDailySoundtracks = data.dailysoundtracks;
        this.allDailySoundtracks.forEach(ds => {
          if (typeof ds.link === 'string') {
            ds.link = this.sanitizer.bypassSecurityTrustResourceUrl(ds.link) as string;
          }
        });
        this.applyDateFilter();
        this.getRatings();
        this.today = this.allDailySoundtracks.find(dailySoundtrack => dailySoundtrack.day === this.todaysDate()) || null;

        // Restore state if available
        this.loadState();
      },
      error: (err) => {
        console.error('Failed to load daily Soundtracks:', err);
      },
    });
  }

  applyDateFilter(): void {
    const now = new Date();
    if (this.showFuture) {
      this.originalDailySoundtracks = [...this.allDailySoundtracks];
    } else {
      this.originalDailySoundtracks = this.allDailySoundtracks.filter(
        ds => isBefore(parse(ds.day, 'dd-MM-yyyy', new Date()), now)
      );
    }
    this.filterDailySoundtracks(this.currentFilter);
  }

  toggleFuture(): void {
    this.showFuture = !this.showFuture;
    this.applyDateFilter();
    this.saveState();
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
    this.ratingService.getRatingsById(this.allDailySoundtracks.map(dailySoundtrack => dailySoundtrack.id))
      .subscribe(dailySoundtrackRatings => {
        this.allDailySoundtracks = this.allDailySoundtracks.map(dailySoundtrack => {
          const ratingData = dailySoundtrackRatings.find(rating => rating.id === dailySoundtrack.id);
          if (ratingData) {
            dailySoundtrack.rating = ratingData.ratings;
          } else {
            dailySoundtrack.rating = [0,0,0,0,0,0];
          }
          return dailySoundtrack;
        });
        this.applyDateFilter();
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
    this.isAutoAdvancing = false;
    this.currentTrack = track;
    this.updateMediaSession(track);
    this.saveState();
    if (this.audioPlayer) {
      this.audioPlayer.nativeElement.play().catch(err => {
        console.error('[DEBUG_LOG] playTrack error:', err);
      });
    }
  }

  updateMediaSession(track: DailySoundtrack): void {
    if ('mediaSession' in navigator) {
      const metadata: any = {
        title: track.track,
        artist: track.artist,
        album: track.album,
        artwork: [
          { src: this.imageService.imageUrl('homepage/daily.gif'), sizes: '512x512', type: 'image/gif' }
        ]
      };

      // @ts-ignore
      navigator.mediaSession.metadata = new MediaMetadata(metadata);
      navigator.mediaSession.playbackState = 'playing';

      if (this.audioPlayer && 'setPositionState' in navigator.mediaSession) {
        const audio = this.audioPlayer.nativeElement;
        navigator.mediaSession.setPositionState({
          duration: isFinite(audio.duration) ? audio.duration : 0,
          playbackRate: audio.playbackRate || 1,
          position: audio.currentTime || 0
        });
      }
    }
  }

  setupMediaSessionHandlers(): void {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => {
        if (this.audioPlayer) {
          this.audioPlayer.nativeElement.play().catch(err => {
            console.error('[DEBUG_LOG] MediaSession play error:', err);
          });
        }
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        if (this.audioPlayer) {
          this.audioPlayer.nativeElement.pause();
        }
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => this.previousTrack());
      navigator.mediaSession.setActionHandler('nexttrack', () => this.nextTrack());

      try {
        // @ts-ignore
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (this.audioPlayer && details.seekTime !== undefined) {
            this.audioPlayer.nativeElement.currentTime = details.seekTime;
          }
        });
      } catch (e) {}

      try {
        navigator.mediaSession.setActionHandler('seekbackward', (details) => {
          if (this.audioPlayer) {
            const skipTime = details.seekOffset || 10;
            this.audioPlayer.nativeElement.currentTime = Math.max(this.audioPlayer.nativeElement.currentTime - skipTime, 0);
          }
        });
      } catch (e) {}

      try {
        navigator.mediaSession.setActionHandler('seekforward', (details) => {
          if (this.audioPlayer) {
            const skipTime = details.seekOffset || 10;
            this.audioPlayer.nativeElement.currentTime = Math.min(this.audioPlayer.nativeElement.currentTime + skipTime, this.audioPlayer.nativeElement.duration);
          }
        });
      } catch (e) {}
    }
  }

  nextTrack(): void {
    if (!this.currentTrack) return;
    const currentIndex = this.playlist.findIndex(t => t.id === this.currentTrack?.id);
    if (currentIndex !== -1 && currentIndex < this.playlist.length - 1) {
      this.isAutoAdvancing = true;
      this.playTrack(this.playlist[currentIndex + 1]);
    } else {
      this.isAutoAdvancing = false;
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
    this.isAutoAdvancing = true;
    this.nextTrack();
  }

  onPlay(): void {
    this.isAutoAdvancing = false;
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'playing';
    }
  }

  onPause(): void {
    if ('mediaSession' in navigator) {
      if (!this.isAutoAdvancing) {
        navigator.mediaSession.playbackState = 'paused';
      }
    }
  }

  onTimeUpdate(): void {
    if (this.currentTrack && 'mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
      const audio = this.audioPlayer.nativeElement;
      const currentSec = Math.floor(audio.currentTime);
      if (this._lastUpdateSec !== currentSec) {
        this._lastUpdateSec = currentSec;
        navigator.mediaSession.setPositionState({
          duration: isFinite(audio.duration) ? audio.duration : 0,
          playbackRate: audio.playbackRate || 1,
          position: audio.currentTime || 0
        });
      }
    }
  }

  onAudioError(event: any): void {
    const error = this.audioPlayer.nativeElement.error;
    console.error('[DEBUG_LOG] Audio element error:', error, event);

    if (this.currentTrack && (error?.code === 2 || error?.code === 3 || error?.code === 4)) {
      console.warn('[DEBUG_LOG] Attempting to recover from audio error...');
      setTimeout(() => {
        if (this.currentTrack) {
          this.playTrack(this.currentTrack);
        }
      }, 2000);
    }
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
    this.saveState();
  }

  selectMonth(month: string | null): void {
    this.selectedMonth = month;
    this.isCalendarOpen = false;
    this.filterDailySoundtracks(this.currentFilter);
    this.saveState();
  }

  selectTag(tag: string | null): void {
    this.selectedTag = tag;
    this.isTagDropdownOpen = false;
    this.filterDailySoundtracks(this.currentFilter);
    this.saveState();
  }

  selectFranchise(franchise: string | null): void {
    this.selectedFranchise = franchise;
    this.isFranchiseDropdownOpen = false;
    this.filterDailySoundtracks(this.currentFilter);
    this.saveState();
  }

  selectGenre(genre: string | null): void {
    this.selectedGenre = genre;
    this.isGenreDropdownOpen = false;
    this.filterDailySoundtracks(this.currentFilter);
    this.saveState();
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
    this.saveState();
  }

  chronological(): void {
    this.isRandomSort = false;
    this.filterDailySoundtracks(this.currentFilter);
    this.saveState();
  }
}
