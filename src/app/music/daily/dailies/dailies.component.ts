import {Component, ElementRef, HostListener, OnInit, OnDestroy, ChangeDetectorRef, NgZone} from '@angular/core';
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

  private isAutoAdvancing = false;
  isFirstLoad = true;

  // Web Audio API
  private audioCtx: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private bufferCache = new Map<string, AudioBuffer>();
  private readonly PRELOAD_AHEAD = 5;

  // Custom player state
  isPlaying = false;
  currentTime = 0;
  duration = 0;
  private playbackStartWallTime = 0;
  private playbackStartOffset = 0;
  private progressInterval: any = null;
  volume = 1;

  constructor(private http: HttpClient, private ratingService: RatingService, private sanitizer: DomSanitizer, protected imageService: ImageService, private eRef: ElementRef, private cdr: ChangeDetectorRef, private ngZone: NgZone) {
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

  setVolume(value: number | string): void {
    this.volume = +value;
    if (this.gainNode) {
      this.gainNode.gain.value = this.volume;
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
      playlistIds: this.playlist.map(t => t.id),
      playbackPosition: this.currentTime
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
          if (state.playbackPosition) {
            this.playbackStartOffset = state.playbackPosition;
            this.currentTime = state.playbackPosition;
          }
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
    this.stopProgressTracking();
    this.stopCurrentSource();
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
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
    this.isFirstLoad = false;
    if (this.playlist.length > 0) {
      this.playTrack(this.playlist[0]);
    }
  }

  playTrack(track: DailySoundtrack): void {
    this.isFirstLoad = false;
    this.isAutoAdvancing = false;
    this.currentTrack = track;
    this.currentTime = 0;
    this.duration = 0;
    this.playbackStartOffset = 0;
    this.updateMediaSession(track);
    this.saveState();
    this.cdr.detectChanges();

    this.stopCurrentSource();
    this.stopProgressTracking();

    const ctx = this.ensureAudioContext();
    const startPlayback = (buffer: AudioBuffer) => {
      this.stopCurrentSource();
      this.duration = buffer.duration;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.gainNode!);
      this.playbackStartWallTime = performance.now();
      this.playbackStartOffset = 0;
      source.start(0);
      this.currentSource = source;
      this.isPlaying = true;
      source.onended = () => this.onSourceEnded(track);
      this.startProgressTracking();
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
      }
      const index = this.playlist.indexOf(track);
      this.preloadAhead(index);
      this.cdr.detectChanges();
    };

    const resume = ctx.state === 'suspended' ? ctx.resume() : Promise.resolve();
    resume.then(() =>
      this.fetchAndDecodeBuffer(track)
        .then(buffer => startPlayback(buffer))
        .catch(err => {
          console.error('[DEBUG_LOG] playTrack error:', err);
          this.isPlaying = false;
          this.cdr.detectChanges();
        })
    );
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

      if ('setPositionState' in navigator.mediaSession) {
        try {
          navigator.mediaSession.setPositionState({
            duration: isFinite(this.duration) ? this.duration : 0,
            playbackRate: 1,
            position: Math.min(this.currentTime, this.duration || 0)
          });
        } catch (e) {}
      }
    }
  }

  setupMediaSessionHandlers(): void {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => this.resumePlayback());
      navigator.mediaSession.setActionHandler('pause', () => this.pausePlayback());
      navigator.mediaSession.setActionHandler('previoustrack', () => this.previousTrack());
      navigator.mediaSession.setActionHandler('nexttrack', () => this.nextTrack());

      try {
        // @ts-ignore
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime !== undefined) {
            this.seekTo(details.seekTime);
          }
        });
      } catch (e) {}

      try {
        navigator.mediaSession.setActionHandler('seekbackward', (details) => {
          const skipTime = details.seekOffset || 10;
          this.seekTo(Math.max(this.currentTime - skipTime, 0));
        });
      } catch (e) {}

      try {
        navigator.mediaSession.setActionHandler('seekforward', (details) => {
          const skipTime = details.seekOffset || 10;
          this.seekTo(Math.min(this.currentTime + skipTime, this.duration));
        });
      } catch (e) {}
    }
  }

  nextTrack(): void {
    if (!this.currentTrack) return;
    const currentIndex = this.playlist.findIndex(t => t.id === this.currentTrack?.id);
    if (currentIndex !== -1 && currentIndex < this.playlist.length - 1) {
      this.isFirstLoad = false;
      this.isAutoAdvancing = true;
      this.playTrack(this.playlist[currentIndex + 1]);
    } else {
      this.isAutoAdvancing = false;
    }
  }

  previousTrack(): void {
    if (!this.currentTrack) return;
    const currentIndex = this.playlist.findIndex(t => t.id === this.currentTrack?.id);
    if (currentIndex > 0) {
      this.isFirstLoad = false;
      this.playTrack(this.playlist[currentIndex - 1]);
    }
  }

  private onSourceEnded(track: DailySoundtrack): void {
    if (!this.isPlaying) return;
    this.isAutoAdvancing = true;
    this.nextTrack();
  }

  togglePlayPause(): void {
    if (this.isPlaying) {
      this.pausePlayback();
    } else {
      this.resumePlayback();
    }
  }

  pausePlayback(): void {
    if (!this.audioCtx || !this.isPlaying) return;
    this.playbackStartOffset = this.currentTime;
    this.stopCurrentSource();
    this.stopProgressTracking();
    this.audioCtx.suspend();
    this.isPlaying = false;
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'paused';
    }
    this.cdr.detectChanges();
  }

  resumePlayback(): void {
    if (!this.currentTrack) return;
    const ctx = this.ensureAudioContext();
    const resume = ctx.state === 'suspended' ? ctx.resume() : Promise.resolve();
    resume.then(() => {
      const url = this.imageService.imageUrl(this.audioPath + this.currentTrack!.filename);
      const buffer = this.bufferCache.get(url);
      if (buffer) {
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(this.gainNode!);
        this.playbackStartWallTime = performance.now();
        source.start(0, this.playbackStartOffset);
        this.currentSource = source;
        this.isPlaying = true;
        source.onended = () => this.onSourceEnded(this.currentTrack!);
        this.startProgressTracking();
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'playing';
        }
        this.cdr.detectChanges();
      } else {
        this.fetchAndDecodeBuffer(this.currentTrack!).then(fetchedBuffer => {
          const source = ctx.createBufferSource();
          source.buffer = fetchedBuffer;
          source.connect(this.gainNode!);
          this.playbackStartWallTime = performance.now();
          source.start(0, this.playbackStartOffset);
          this.currentSource = source;
          this.isPlaying = true;
          source.onended = () => this.onSourceEnded(this.currentTrack!);
          this.startProgressTracking();
          if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'playing';
          }
          const index = this.playlist.indexOf(this.currentTrack!);
          this.preloadAhead(index);
          this.cdr.detectChanges();
        }).catch(err => {
          console.error('[DEBUG_LOG] resumePlayback fetch error:', err);
          this.isPlaying = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  seekTo(time: number): void {
    if (!this.currentTrack) return;
    this.stopCurrentSource();
    this.stopProgressTracking();
    this.playbackStartOffset = time;
    this.currentTime = time;
    const ctx = this.ensureAudioContext();
    const url = this.imageService.imageUrl(this.audioPath + this.currentTrack.filename);
    const buffer = this.bufferCache.get(url);
    if (!buffer) return;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.gainNode!);
    this.playbackStartWallTime = performance.now();
    source.start(0, time);
    this.currentSource = source;
    this.isPlaying = true;
    source.onended = () => this.onSourceEnded(this.currentTrack!);
    this.startProgressTracking();
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'playing';
    }
  }

  private ensureAudioContext(): AudioContext {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      this.audioCtx = new AudioContext();
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.connect(this.audioCtx.destination);
    }
    return this.audioCtx;
  }

  private async fetchAndDecodeBuffer(track: DailySoundtrack): Promise<AudioBuffer> {
    const url = this.imageService.imageUrl(this.audioPath + track.filename);
    if (this.bufferCache.has(url)) {
      return this.bufferCache.get(url)!;
    }
    const ctx = this.ensureAudioContext();
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    this.bufferCache.set(url, audioBuffer);
    return audioBuffer;
  }

  private preloadAhead(fromIndex: number): void {
    const end = Math.min(fromIndex + this.PRELOAD_AHEAD, this.playlist.length);
    for (let i = fromIndex + 1; i < end; i++) {
      const track = this.playlist[i];
      if (!track.filename) continue;
      const url = this.imageService.imageUrl(this.audioPath + track.filename);
      if (!this.bufferCache.has(url)) {
        this.fetchAndDecodeBuffer(track).catch(err =>
          console.error('[DEBUG_LOG] Preload error for', track.track, err)
        );
      }
    }
  }

  private stopCurrentSource(): void {
    if (this.currentSource) {
      try { this.currentSource.onended = null; this.currentSource.stop(); } catch (e) {}
      this.currentSource = null;
    }
  }

  private startProgressTracking(): void {
    this.stopProgressTracking();
    this.ngZone.runOutsideAngular(() => {
      this.progressInterval = setInterval(() => {
        if (this.isPlaying) {
          const elapsed = (performance.now() - this.playbackStartWallTime) / 1000;
          const newTime = Math.min(this.playbackStartOffset + elapsed, this.duration);
          this.ngZone.run(() => {
            this.currentTime = newTime;
            this.saveState();
            this.updateMediaSessionPosition();
            this.cdr.detectChanges();
          });
        }
      }, 500);
    });
  }

  private stopProgressTracking(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  private updateMediaSessionPosition(): void {
    if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
      try {
        navigator.mediaSession.setPositionState({
          duration: isFinite(this.duration) ? this.duration : 0,
          playbackRate: 1,
          position: Math.min(this.currentTime, this.duration || 0)
        });
      } catch (e) {}
    }
  }

  get currentTimeFormatted(): string {
    return this.formatTime(this.currentTime);
  }

  get durationFormatted(): string {
    return this.formatTime(this.duration);
  }

  get progressPercent(): number {
    if (!this.duration) return 0;
    return (this.currentTime / this.duration) * 100;
  }

  onProgressClick(event: MouseEvent): void {
    const bar = event.currentTarget as HTMLElement;
    const rect = bar.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    this.seekTo(ratio * this.duration);
  }

  private formatTime(seconds: number): string {
    if (!isFinite(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
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
