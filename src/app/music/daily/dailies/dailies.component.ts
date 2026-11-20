import { Component, ElementRef, OnInit, OnDestroy, computed, inject, signal } from '@angular/core';
import { NgClass, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {DailySoundtrack} from "../daily-soundtrack.interface";
import {DomSanitizer} from "@angular/platform-browser";
import { HttpClient } from "@angular/common/http";
import {RatingService} from "../../../utils/rating-bar/service/rating.service";
import {RatingBarComponent} from "../../../utils/rating-bar/rating-bar.component";
import {isBefore, parse, format} from "date-fns";
import {ImageService} from "../../../utils/services/image.service";
import {InfiniteScrollDirective} from "../../../utils/directives/infinite-scroll.directive";
import {ImageUrlPipe} from "../../../utils/pipes/image-url.pipe";

interface GroupedDailySoundtracks {
  month: string;
  tracks: DailySoundtrack[];
}

@Component({
    selector: 'app-dailies',
    imports: [NgClass, TitleCasePipe, FormsModule, RatingBarComponent, InfiniteScrollDirective, ImageUrlPipe],
    templateUrl: './dailies.component.html',
    styleUrls: ['./dailies.component.css'],
    host: {
      '(document:click)': 'clickout($event)'
    }
})
export default class DailiesComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private ratingService = inject(RatingService);
  private sanitizer = inject(DomSanitizer);
  protected imageService = inject(ImageService);
  private eRef = inject(ElementRef);

  private allDailySoundtracks: DailySoundtrack[] = [];
  private readonly originalDailySoundtracks = signal<DailySoundtrack[]>([]);
  private readonly groupedDailySoundtracks = signal<GroupedDailySoundtracks[]>([]);
  readonly currentFilter = signal('');
  readonly selectedMonth = signal<string | null>(null);
  readonly selectedTag = signal<string | null>(null);
  readonly selectedFranchise = signal<string | null>(null);
  readonly selectedGenre = signal<string | null>(null);
  /** Free-text search over artist, album and track name. */
  readonly searchTerm = signal('');
  private showFuture = false;
  readonly isRandomSort = signal(false);
  readonly isCalendarOpen = signal(false);
  readonly isFilterDropdownOpen = signal(false);
  readonly isTagDropdownOpen = signal(false);
  readonly isFranchiseDropdownOpen = signal(false);
  readonly isGenreDropdownOpen = signal(false);
  readonly filters = ["I don't care about video game music!", "Gimme that sweet video game music!", "Show me it all!"];
  readonly tags = ["chill", "party", "intense", "funky"];
  readonly franchises = ["mario", "zelda", "donkey kong", "yoshi", "pokemon", "animal crossing", "metroid", "indie", "other"];
  readonly genres = ["singer-songwriter", "pop", "soul", "rock", "indie", "sad songs", "from the heart"];
  today: DailySoundtrack | null = null;
  readonly audioPath: string = '/music/dailysoundtracks/';
  readonly currentTrack = signal<DailySoundtrack | null>(null);
  readonly playlist = signal<DailySoundtrack[]>([]);
  /** Index of the current track in the playlist, matched by id (track objects are re-created when ratings load). */
  readonly currentIndex = computed(() => {
    const current = this.currentTrack();
    return current ? this.playlist().findIndex(t => t.id === current.id) : -1;
  });

  private readonly pageSize = 10;
  private readonly itemsToShow = signal(10);

  private isAutoAdvancing = false;
  isFirstLoad = true;

  // Web Audio API
  private audioCtx: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private bufferCache = new Map<string, AudioBuffer>();
  private readonly PRELOAD_AHEAD = 3;

  // Custom player state
  readonly isPlaying = signal(false);
  readonly currentTime = signal(0);
  readonly duration = signal(0);
  private playbackStartWallTime = 0;
  private playbackStartOffset = 0;
  private progressInterval: ReturnType<typeof setInterval> | null = null;
  readonly volume = signal(1);

  clickout(event: any) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isCalendarOpen.set(false);
      this.isFilterDropdownOpen.set(false);
      this.isTagDropdownOpen.set(false);
      this.isFranchiseDropdownOpen.set(false);
      this.isGenreDropdownOpen.set(false);
    } else {
      const clickedInsideCalendar = event.target.closest('.calendar-container');
      const clickedInsideFilter = event.target.closest('.filter-container');
      const clickedInsideTag = event.target.closest('.tag-container');
      const clickedInsideFranchise = event.target.closest('.franchise-container');
      const clickedInsideGenre = event.target.closest('.genre-container');

      if (!clickedInsideCalendar) {
        this.isCalendarOpen.set(false);
      }
      if (!clickedInsideFilter) {
        this.isFilterDropdownOpen.set(false);
      }
      if (!clickedInsideTag) {
        this.isTagDropdownOpen.set(false);
      }
      if (!clickedInsideFranchise) {
        this.isFranchiseDropdownOpen.set(false);
      }
      if (!clickedInsideGenre) {
        this.isGenreDropdownOpen.set(false);
      }
    }
  }

  setVolume(value: number | string): void {
    this.volume.set(+value);
    if (this.gainNode) {
      this.gainNode.gain.value = this.volume();
    }
  }

  private saveState(): void {
    const state = {
      currentFilter: this.currentFilter(),
      selectedMonth: this.selectedMonth(),
      selectedTag: this.selectedTag(),
      selectedFranchise: this.selectedFranchise(),
      selectedGenre: this.selectedGenre(),
      searchTerm: this.searchTerm(),
      showFuture: this.showFuture,
      isRandomSort: this.isRandomSort(),
      currentTrackId: this.currentTrack()?.id,
      playlistIds: this.playlist().map(t => t.id),
      playbackPosition: this.currentTime()
    };
    localStorage.setItem('dailies_player_state', JSON.stringify(state));
  }

  private loadState(): void {
    const saved = localStorage.getItem('dailies_player_state');
    if (!saved) return;

    try {
      const state = JSON.parse(saved);
      this.currentFilter.set(state.currentFilter || '');
      this.selectedMonth.set(state.selectedMonth || null);
      this.selectedTag.set(state.selectedTag || null);
      this.selectedFranchise.set(state.selectedFranchise || null);
      this.selectedGenre.set(state.selectedGenre || null);
      this.searchTerm.set(state.searchTerm || '');
      this.showFuture = state.showFuture || false;
      this.isRandomSort.set(state.isRandomSort || false);

      // Re-apply filters based on the restored state
      this.applyDateFilter();

      if (state.playlistIds && state.playlistIds.length > 0) {
        const trackMap = new Map(this.allDailySoundtracks.map(t => [t.id, t]));
        this.playlist.set(state.playlistIds.map((id: string) => trackMap.get(id)).filter((t: any) => t) as DailySoundtrack[]);
      }

      if (state.currentTrackId) {
        const track = this.allDailySoundtracks.find(t => t.id === state.currentTrackId);
        if (track) {
          this.currentTrack.set(track);
          if (state.playbackPosition) {
            this.playbackStartOffset = state.playbackPosition;
            this.currentTime.set(state.playbackPosition);
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
      try {
        navigator.mediaSession.setActionHandler('seekbackward', null);
        navigator.mediaSession.setActionHandler('seekforward', null);
      } catch (e) {}
    }
  }

  loadDailySoundtracks(): void {
    this.http.get<{ dailysoundtracks: DailySoundtrack[] }>('assets/data/daily-soundtracks.json').subscribe({
      next: (data) => {
        this.allDailySoundtracks = data.dailysoundtracks.map(ds =>
          typeof ds.link === 'string'
            ? { ...ds, link: this.sanitizer.bypassSecurityTrustResourceUrl(ds.link) as string }
            : ds
        );
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
      this.originalDailySoundtracks.set([...this.allDailySoundtracks]);
    } else {
      this.originalDailySoundtracks.set(this.allDailySoundtracks.filter(
        ds => isBefore(parse(ds.day, 'dd-MM-yyyy', new Date()), now)
      ));
    }
    this.filterDailySoundtracks(this.currentFilter());
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

  readonly availableMonths = computed(() => {
    const months = new Set<string>();
    this.originalDailySoundtracks().forEach(track => {
      const date = parse(track.day, 'dd-MM-yyyy', new Date());
      months.add(format(date, 'MMMM yyyy'));
    });
    return Array.from(months).sort((a, b) => {
      const dateA = parse(a, 'MMMM yyyy', new Date());
      const dateB = parse(b, 'MMMM yyyy', new Date());
      return dateB.getTime() - dateA.getTime();
    });
  });

  getRatings(): void {
    this.ratingService.getRatingsById(this.allDailySoundtracks.map(dailySoundtrack => dailySoundtrack.id))
      .subscribe({
        next: dailySoundtrackRatings => {
          this.allDailySoundtracks = this.allDailySoundtracks.map(dailySoundtrack => {
            const ratingData = dailySoundtrackRatings.find(rating => rating.id === dailySoundtrack.id);
            return { ...dailySoundtrack, rating: ratingData ? ratingData.ratings : [0,0,0,0,0,0] };
          });
          this.applyDateFilter();
        },
        error: (err) => console.error('Failed to load daily soundtrack ratings:', err)
      });
  }

  groupSoundtracks(tracks: DailySoundtrack[]): void {
    const selectedMonth = this.selectedMonth();
    const selectedTag = this.selectedTag();
    const selectedFranchise = this.selectedFranchise();
    const selectedGenre = this.selectedGenre();

    let filteredTracks = tracks;
    if (selectedMonth) {
      filteredTracks = filteredTracks.filter(track => {
        const date = parse(track.day, 'dd-MM-yyyy', new Date());
        return format(date, 'MMMM yyyy') === selectedMonth;
      });
    }

    if (selectedTag) {
      filteredTracks = filteredTracks.filter(track => track.tags && track.tags.includes(selectedTag));
    }

    if (selectedFranchise) {
      filteredTracks = filteredTracks.filter(track => track.tags && track.tags.includes(selectedFranchise));
    }

    if (selectedGenre) {
      filteredTracks = filteredTracks.filter(track => track.tags && track.tags.includes(selectedGenre));
    }

    const searchTerm = this.searchTerm().trim().toLowerCase();
    if (searchTerm) {
      filteredTracks = filteredTracks.filter(track =>
        [track.artist, track.album, track.track].some(field => (field ?? '').toLowerCase().includes(searchTerm))
      );
    }

    if (this.isRandomSort()) {
      this.groupedDailySoundtracks.set([{
        month: 'Random',
        tracks: [...filteredTracks].sort(() => Math.random() - 0.5)
      }]);
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

      this.groupedDailySoundtracks.set(monthOrder.map(month => ({
        month,
        tracks: groups[month]
      })));
    }

    this.updatePlaylist();
  }

  updatePlaylist(): void {
    this.playlist.set(this.groupedDailySoundtracks().flatMap(group => group.tracks).filter(track => track.filename));
  }

  playAll(): void {
    this.isFirstLoad = false;
    const playlist = this.playlist();
    if (playlist.length > 0) {
      this.playTrack(playlist[0]);
    }
  }

  playTrack(track: DailySoundtrack): void {
    this.isFirstLoad = false;
    this.isAutoAdvancing = false;
    this.currentTrack.set(track);
    this.currentTime.set(0);
    this.duration.set(0);
    this.playbackStartOffset = 0;
    this.updateMediaSession(track);
    this.saveState();

    this.stopCurrentSource();
    this.stopProgressTracking();

    const ctx = this.ensureAudioContext();
    const startPlayback = (buffer: AudioBuffer) => {
      this.stopCurrentSource();
      this.duration.set(buffer.duration);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.gainNode!);
      this.playbackStartWallTime = performance.now();
      this.playbackStartOffset = 0;
      source.start(0);
      this.currentSource = source;
      this.isPlaying.set(true);
      source.onended = () => this.onSourceEnded(track);
      this.startProgressTracking();
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
      }
      const index = this.playlist().findIndex(t => t.id === track.id);
      this.preloadAhead(index);
    };

    const resume = ctx.state === 'suspended' ? ctx.resume() : Promise.resolve();
    resume.then(() =>
      this.fetchAndDecodeBuffer(track)
        .then(buffer => startPlayback(buffer))
        .catch(err => {
          console.error('[DEBUG_LOG] playTrack error:', err);
          this.isPlaying.set(false);
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

      this.updateMediaSessionPosition();
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
          this.seekTo(Math.max(this.currentTime() - skipTime, 0));
        });
      } catch (e) {}

      try {
        navigator.mediaSession.setActionHandler('seekforward', (details) => {
          const skipTime = details.seekOffset || 10;
          this.seekTo(Math.min(this.currentTime() + skipTime, this.duration()));
        });
      } catch (e) {}
    }
  }

  nextTrack(): void {
    if (!this.currentTrack()) return;
    const playlist = this.playlist();
    const currentIndex = this.currentIndex();
    if (currentIndex !== -1 && currentIndex < playlist.length - 1) {
      this.isFirstLoad = false;
      this.isAutoAdvancing = true;
      this.playTrack(playlist[currentIndex + 1]);
    } else {
      this.isAutoAdvancing = false;
    }
  }

  previousTrack(): void {
    if (!this.currentTrack()) return;
    const currentIndex = this.currentIndex();
    if (currentIndex > 0) {
      this.isFirstLoad = false;
      this.playTrack(this.playlist()[currentIndex - 1]);
    }
  }

  private onSourceEnded(track: DailySoundtrack): void {
    if (!this.isPlaying()) return;
    this.isAutoAdvancing = true;
    this.nextTrack();
  }

  togglePlayPause(): void {
    if (this.isPlaying()) {
      this.pausePlayback();
    } else {
      this.resumePlayback();
    }
  }

  pausePlayback(): void {
    if (!this.audioCtx || !this.isPlaying()) return;
    this.playbackStartOffset = this.currentTime();
    this.stopCurrentSource();
    this.stopProgressTracking();
    this.audioCtx.suspend();
    this.isPlaying.set(false);
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'paused';
    }
  }

  resumePlayback(): void {
    const currentTrack = this.currentTrack();
    if (!currentTrack) return;
    const ctx = this.ensureAudioContext();
    const resume = ctx.state === 'suspended' ? ctx.resume() : Promise.resolve();
    resume.then(() => {
      const url = this.imageService.imageUrl(this.audioPath + currentTrack.filename);
      const buffer = this.bufferCache.get(url);
      if (buffer) {
        this.startSourceAtOffset(ctx, buffer);
      } else {
        this.fetchAndDecodeBuffer(currentTrack).then(fetchedBuffer => {
          this.startSourceAtOffset(ctx, fetchedBuffer);
          this.preloadAhead(this.currentIndex());
        }).catch(err => {
          console.error('[DEBUG_LOG] resumePlayback fetch error:', err);
          this.isPlaying.set(false);
        });
      }
    });
  }

  /** Starts the given buffer from the saved playback offset (used when resuming). */
  private startSourceAtOffset(ctx: AudioContext, buffer: AudioBuffer): void {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.gainNode!);
    this.playbackStartWallTime = performance.now();
    source.start(0, this.playbackStartOffset);
    this.currentSource = source;
    this.isPlaying.set(true);
    source.onended = () => this.onSourceEnded(this.currentTrack()!);
    this.startProgressTracking();
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'playing';
    }
  }

  seekTo(time: number): void {
    const currentTrack = this.currentTrack();
    if (!currentTrack) return;
    this.stopCurrentSource();
    this.stopProgressTracking();
    this.playbackStartOffset = time;
    this.currentTime.set(time);
    const ctx = this.ensureAudioContext();
    const url = this.imageService.imageUrl(this.audioPath + currentTrack.filename);
    const buffer = this.bufferCache.get(url);
    if (!buffer) return;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.gainNode!);
    this.playbackStartWallTime = performance.now();
    source.start(0, time);
    this.currentSource = source;
    this.isPlaying.set(true);
    source.onended = () => this.onSourceEnded(this.currentTrack()!);
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
    const playlist = this.playlist();
    const end = Math.min(fromIndex + this.PRELOAD_AHEAD, playlist.length);
    for (let i = fromIndex + 1; i < end; i++) {
      const track = playlist[i];
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

  readonly paginatedGroups = computed(() => {
    const itemsToShow = this.itemsToShow();
    let count = 0;
    const result: GroupedDailySoundtracks[] = [];

    for (const group of this.groupedDailySoundtracks()) {
      if (count >= itemsToShow) break;

      const remaining = itemsToShow - count;
      if (group.tracks.length <= remaining) {
        result.push(group);
        count += group.tracks.length;
      } else {
        result.push({
          month: group.month,
          tracks: group.tracks.slice(0, remaining)
        });
        count += remaining;
      }
    }
    return result;
  });

  loadMore(): void {
    const totalTracks = this.groupedDailySoundtracks().reduce((sum, g) => sum + g.tracks.length, 0);
    if (this.itemsToShow() < totalTracks) {
      this.itemsToShow.update(n => n + this.pageSize);
    }
  }

  resetInfiniteScroll(): void {
    this.itemsToShow.set(this.pageSize);
  }

  private startProgressTracking(): void {
    this.stopProgressTracking();
    this.progressInterval = setInterval(() => {
      if (this.isPlaying()) {
        const elapsed = (performance.now() - this.playbackStartWallTime) / 1000;
        this.currentTime.set(Math.min(this.playbackStartOffset + elapsed, this.duration()));
        this.saveState();
        this.updateMediaSessionPosition();
      }
    }, 500);
  }

  private stopProgressTracking(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  private updateMediaSessionPosition(): void {
    if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
      const duration = this.duration();
      try {
        navigator.mediaSession.setPositionState({
          duration: isFinite(duration) ? duration : 0,
          playbackRate: 1,
          position: Math.min(this.currentTime(), duration || 0)
        });
      } catch (e) {}
    }
  }

  readonly currentTimeFormatted = computed(() => this.formatTime(this.currentTime()));
  readonly durationFormatted = computed(() => this.formatTime(this.duration()));
  readonly progressPercent = computed(() => {
    const duration = this.duration();
    if (!duration) return 0;
    return (this.currentTime() / duration) * 100;
  });

  onProgressClick(event: MouseEvent): void {
    const bar = event.currentTarget as HTMLElement;
    const rect = bar.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    this.seekTo(ratio * this.duration());
  }

  private formatTime(seconds: number): string {
    if (!isFinite(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  filterDailySoundtracks(criteria: string): void {
    this.currentFilter.set(criteria);
    this.isFilterDropdownOpen.set(false);
    this.resetInfiniteScroll();

    if (criteria !== 'Gimme that sweet video game music!') {
      this.selectedFranchise.set(null);
    }

    if (criteria !== "I don't care about video game music!") {
      this.selectedGenre.set(null);
    }

    const original = this.originalDailySoundtracks();
    let filteredTracks: DailySoundtrack[];
    switch (criteria) {
      case 'Gimme that sweet video game music!':
        filteredTracks = original.filter(soundtrack => soundtrack.game);
        break;
      case "I don't care about video game music!":
        filteredTracks = original.filter(soundtrack => !soundtrack.game);
        break;
      default:
        filteredTracks = original;
        break;
    }
    this.groupSoundtracks(filteredTracks);
    this.saveState();
  }

  search(term: string): void {
    this.searchTerm.set(term);
    this.resetInfiniteScroll();
    this.filterDailySoundtracks(this.currentFilter());
  }

  selectMonth(month: string | null): void {
    this.selectedMonth.set(month);
    this.isCalendarOpen.set(false);
    this.resetInfiniteScroll();
    this.filterDailySoundtracks(this.currentFilter());
    this.saveState();
  }

  selectTag(tag: string | null): void {
    this.selectedTag.set(tag);
    this.isTagDropdownOpen.set(false);
    this.resetInfiniteScroll();
    this.filterDailySoundtracks(this.currentFilter());
    this.saveState();
  }

  selectFranchise(franchise: string | null): void {
    this.selectedFranchise.set(franchise);
    this.isFranchiseDropdownOpen.set(false);
    this.resetInfiniteScroll();
    this.filterDailySoundtracks(this.currentFilter());
    this.saveState();
  }

  selectGenre(genre: string | null): void {
    this.selectedGenre.set(genre);
    this.isGenreDropdownOpen.set(false);
    this.resetInfiniteScroll();
    this.filterDailySoundtracks(this.currentFilter());
    this.saveState();
  }

  toggleCalendar(): void {
    this.isCalendarOpen.update(open => !open);
    if (this.isCalendarOpen()) {
      this.isFilterDropdownOpen.set(false);
      this.isTagDropdownOpen.set(false);
      this.isFranchiseDropdownOpen.set(false);
      this.isGenreDropdownOpen.set(false);
    }
  }

  toggleFilterDropdown(): void {
    this.isFilterDropdownOpen.update(open => !open);
    if (this.isFilterDropdownOpen()) {
      this.isCalendarOpen.set(false);
      this.isTagDropdownOpen.set(false);
      this.isFranchiseDropdownOpen.set(false);
      this.isGenreDropdownOpen.set(false);
    }
  }

  toggleTagDropdown(): void {
    this.isTagDropdownOpen.update(open => !open);
    if (this.isTagDropdownOpen()) {
      this.isCalendarOpen.set(false);
      this.isFilterDropdownOpen.set(false);
      this.isFranchiseDropdownOpen.set(false);
      this.isGenreDropdownOpen.set(false);
    }
  }

  toggleFranchiseDropdown(): void {
    this.isFranchiseDropdownOpen.update(open => !open);
    if (this.isFranchiseDropdownOpen()) {
      this.isCalendarOpen.set(false);
      this.isFilterDropdownOpen.set(false);
      this.isTagDropdownOpen.set(false);
      this.isGenreDropdownOpen.set(false);
    }
  }

  toggleGenreDropdown(): void {
    this.isGenreDropdownOpen.update(open => !open);
    if (this.isGenreDropdownOpen()) {
      this.isCalendarOpen.set(false);
      this.isFilterDropdownOpen.set(false);
      this.isTagDropdownOpen.set(false);
      this.isFranchiseDropdownOpen.set(false);
    }
  }

  randomize(): void {
    this.isRandomSort.set(true);
    this.resetInfiniteScroll();
    this.filterDailySoundtracks(this.currentFilter());
    this.saveState();
  }

  chronological(): void {
    this.isRandomSort.set(false);
    this.resetInfiniteScroll();
    this.filterDailySoundtracks(this.currentFilter());
    this.saveState();
  }
}
