import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, HostListener, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, NgClass } from '@angular/common';
import { forkJoin, map, switchMap } from 'rxjs';
import { ImageService } from '../../utils/services/image.service';

import { SmashTrackComponent } from './smash-track/smash-track.component';
import {RouterLink} from "@angular/router";

interface Track {
  id: string;
  filename: string;
  path: string;
  image: string;
  description: string;
  stars: string;
  duration: number;
  track: string;
  title: string;
  composers: string;
  contributors: string;
  album: string;
  'original-game': string;
  comment: string;
  removed: boolean;
  volume: string;
  release: string;
}

interface VolumeInfo {
  count: number;
  file: string;
  notes?: string;
}

interface IndexData {
  [key: string]: VolumeInfo;
}

interface Volume {
  title: string;
  tracks: Track[];
  expanded: boolean;
  notes?: string;
}

@Component({
  selector: 'app-smash',
  standalone: true,
  imports: [CommonModule, NgClass, SmashTrackComponent, RouterLink],
  templateUrl: './smash.component.html',
  styleUrl: './smash.component.css',
})
export default class SmashComponent implements OnInit, AfterViewInit, OnDestroy {
  volumes: Volume[] = [];
  composersMetadata: { [key: string]: { image: string, source: string, notes: string } } = {};
  allTracks: Track[] = [];
  filteredTracks: Track[] = [];
  categories: string[] = [];
  selectedCategories: string[] = [];
  selectedGames: string[] = [];
  selectedStars: number[] = [];
  selectedType: string | null = null; // 'Remix' | 'Original' | null
  selectedComposers: string[] = [];
  isFilterDropdownOpen = false;
  isGameDropdownOpen = false;
  isStarsDropdownOpen = false;
  isComposerDropdownOpen = false;
  composerImageFailed = false;
  currentTrack: Track | null = null;
  playlist: Track[] = [];
  loading = true;

  games: string[] = ['64', 'Melee', 'Brawl', 'Smash 4', 'Ultimate'];
  stars: number[] = [0, 1, 2, 3, 4, 5];
  composersList: string[] = [];

  // Infinite scroll
  itemsToShow = 20;
  pageSize = 20;

  private _scrollAnchor!: ElementRef;
  @ViewChild('scrollAnchor') set scrollAnchor(value: ElementRef) {
    if (value) {
      this._scrollAnchor = value;
      this.setupIntersectionObserver();
    }
  }

  private observer: IntersectionObserver | null = null;
  private isAutoAdvancing = false;
  isFirstLoad = true;

  // Web Audio API
  private audioCtx: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private bufferCache = new Map<string, AudioBuffer>();
  private scheduledTracks: { track: Track; source: AudioBufferSourceNode; startTime: number; duration: number }[] = [];
  private readonly PRELOAD_AHEAD = 3;

  // Custom player state
  isPlaying = false;
  currentTime = 0;
  duration = 0;
  private playbackStartWallTime = 0;
  private playbackStartOffset = 0;
  private progressInterval: any = null;
  volume = 1;

  constructor(private http: HttpClient, protected imageService: ImageService, private cdr: ChangeDetectorRef, private eRef: ElementRef, private ngZone: NgZone) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const filterContainers = this.eRef.nativeElement.querySelectorAll('.filter-container');
    let isInsideAnyFilter = false;

    filterContainers.forEach((container: HTMLElement) => {
      if (container.contains(target)) {
        isInsideAnyFilter = true;
      }
    });

    if (!isInsideAnyFilter && (this.isFilterDropdownOpen || this.isGameDropdownOpen || this.isStarsDropdownOpen || this.isComposerDropdownOpen)) {
      this.isFilterDropdownOpen = false;
      this.isGameDropdownOpen = false;
      this.isStarsDropdownOpen = false;
      this.isComposerDropdownOpen = false;
      this.cdr.detectChanges();
    }
  }

  private getIndividualComposers(composerString: string | undefined): string[] {
    if (!composerString) return [];

    return composerString.split(',').map(c => c.trim()).filter(c => c);
  }

  setVolume(value: number | string): void {
    this.volume = +value;
    if (this.gainNode) {
      this.gainNode.gain.value = this.volume;
    }
  }

  private saveState(): void {
    const state = {
      selectedCategories: this.selectedCategories,
      selectedGames: this.selectedGames,
      selectedStars: this.selectedStars,
      selectedType: this.selectedType,
      selectedComposers: this.selectedComposers,
      currentTrackId: this.currentTrack?.id,
      playlistIds: this.playlist.map(t => t.id),
      playbackPosition: this.currentTime
    };
    localStorage.setItem('smash_player_state', JSON.stringify(state));
  }

  private loadState(): void {
    const saved = localStorage.getItem('smash_player_state');
    if (!saved) return;

    try {
      const state = JSON.parse(saved);
      this.selectedCategories = state.selectedCategories || [];
      this.selectedGames = state.selectedGames || [];
      this.selectedStars = state.selectedStars || [];
      this.selectedType = state.selectedType || null;
      this.selectedComposers = state.selectedComposers || [];

      this.applyFilter();

      if (state.playlistIds && state.playlistIds.length > 0) {
        // Map saved IDs back to track objects
        const trackMap = new Map(this.allTracks.map(t => [t.id, t]));
        this.playlist = state.playlistIds.map((id: string) => trackMap.get(id)).filter((t: any) => t) as Track[];
      }

      if (state.currentTrackId) {
        const track = this.allTracks.find(t => t.id === state.currentTrackId);
        if (track) {
          this.currentTrack = track;
          if (state.playbackPosition) {
            this.playbackStartOffset = state.playbackPosition;
            this.currentTime = state.playbackPosition;
          }
          // Don't auto-play on load, just restore the info
          this.updateMediaSession(track);
        }
      }
    } catch (e) {
      console.error('Error loading saved state', e);
    }
  }

  ngOnInit(): void {
    this.setupMediaSessionHandlers();

    // Load composer metadata
    this.http.get<{ [key: string]: { image: string, source: string, notes: string } }>('assets/data/smash/composers.json').subscribe({
      next: (data) => this.composersMetadata = data,
      error: () => console.log('No composer metadata found')
    });

    this.http.get<IndexData>('assets/data/smash/index.json').pipe(
      switchMap(indexData => {
        const volumeRequests = Object.keys(indexData).map(fullTitle => {
          const info = indexData[fullTitle];
          const file = info.file;
          const titleParts = fullTitle.split(' - ');
          let displayTitle = fullTitle;
          if (titleParts.length > 1) {
            displayTitle = titleParts[1].split(' (')[0];
          }

          return this.http.get<Track[]>(`assets/data/smash/${file}`).pipe(
            map(tracks => ({
              title: displayTitle,
              tracks: tracks.map(t => ({...t, path: t.path.replace(/\\/g, '/'), volume: displayTitle})),
              expanded: false,
              notes: info.notes
            }))
          );
        });
        return forkJoin(volumeRequests);
      })
    ).subscribe({
      next: (volumes) => {
        this.volumes = volumes;
        this.allTracks = volumes.flatMap(v => v.tracks);

        // Derive categories from the 'album' property for better accuracy as requested
        const categorySet = new Set<string>();
        const composerSet = new Set<string>();
        this.allTracks.forEach(track => {
          if (track.album && track.album.includes(': ')) {
            const category = track.album.split(': ')[1].trim();
            categorySet.add(category);
          } else if (track.volume) {
            categorySet.add(track.volume);
          }

          if (track.contributors) {
            const individualContributors = this.getIndividualComposers(track.contributors);
            const individualComposers = this.getIndividualComposers(track.composers);
            const isRemix = track.comment && track.comment.includes('Remix');

            individualContributors.forEach(c => {
              if (c) {
                const isDifferentFromComposers = !individualComposers.includes(c);
                if (isRemix || isDifferentFromComposers) {
                  composerSet.add(c);
                }
              }
            });
          }
        });
        this.categories = Array.from(categorySet);
        this.composersList = Array.from(composerSet).sort();

        // Restore state if available
        this.loadState();

        // If no state was loaded, use defaults
        if (this.filteredTracks.length === 0 && this.allTracks.length > 0 && this.selectedCategories.length === 0 && this.selectedGames.length === 0 && this.selectedStars.length === 0 && this.selectedType === null && this.selectedComposers.length === 0) {
          this.filteredTracks = [...this.allTracks];
          this.playlist = [...this.filteredTracks];
        }

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading smash data', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  ngAfterViewInit(): void {
    // Observer setup is handled by the scrollAnchor setter
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
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

  setupIntersectionObserver(): void {
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        this.loadMore();
      }
    }, {
      rootMargin: '200px'
    });

    if (this._scrollAnchor) {
      this.observer.observe(this._scrollAnchor.nativeElement);
    }
  }

  loadMore(): void {
    if (this.itemsToShow < this.filteredTracks.length) {
      this.itemsToShow += this.pageSize;
      this.cdr.detectChanges();
    }
  }

  resetInfiniteScroll(): void {
    this.itemsToShow = this.pageSize;
  }

  toggleFilterDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.isFilterDropdownOpen = !this.isFilterDropdownOpen;
    this.isGameDropdownOpen = false;
    this.isStarsDropdownOpen = false;
    this.isComposerDropdownOpen = false;
    this.cdr.detectChanges();
  }

  toggleGameDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.isGameDropdownOpen = !this.isGameDropdownOpen;
    this.isFilterDropdownOpen = false;
    this.isStarsDropdownOpen = false;
    this.isComposerDropdownOpen = false;
    this.cdr.detectChanges();
  }

  toggleStarsDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.isStarsDropdownOpen = !this.isStarsDropdownOpen;
    this.isFilterDropdownOpen = false;
    this.isGameDropdownOpen = false;
    this.isComposerDropdownOpen = false;
    this.cdr.detectChanges();
  }

  toggleComposerDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.isComposerDropdownOpen = !this.isComposerDropdownOpen;
    this.isFilterDropdownOpen = false;
    this.isGameDropdownOpen = false;
    this.isStarsDropdownOpen = false;
    this.cdr.detectChanges();
  }

  selectCategory(category: string | null): void {
    if (category === null) {
      this.selectedCategories = [];
    } else {
      const index = this.selectedCategories.indexOf(category);
      if (index > -1) {
        this.selectedCategories.splice(index, 1);
      } else {
        this.selectedCategories.push(category);
      }
    }
    this.resetInfiniteScroll();
    this.applyFilter();
    this.saveState();
    this.cdr.detectChanges();
  }

  selectGame(game: string | null): void {
    if (game === null) {
      this.selectedGames = [];
    } else {
      const index = this.selectedGames.indexOf(game);
      if (index > -1) {
        this.selectedGames.splice(index, 1);
      } else {
        this.selectedGames.push(game);
      }
    }
    this.resetInfiniteScroll();
    this.applyFilter();
    this.saveState();
    this.cdr.detectChanges();
  }

  selectStars(star: number | null): void {
    if (star === null) {
      this.selectedStars = [];
    } else {
      const index = this.selectedStars.indexOf(star);
      if (index > -1) {
        this.selectedStars.splice(index, 1);
      } else {
        this.selectedStars.push(star);
      }
    }
    this.resetInfiniteScroll();
    this.applyFilter();
    this.saveState();
    this.cdr.detectChanges();
  }

  selectType(type: string | null): void {
    this.selectedType = type;
    this.resetInfiniteScroll();
    this.applyFilter();
    this.saveState();
    this.cdr.detectChanges();
  }

  selectComposer(composer: string | null): void {
    if (composer === null) {
      this.selectedComposers = [];
    } else {
      const index = this.selectedComposers.indexOf(composer);
      if (index > -1) {
        this.selectedComposers.splice(index, 1);
      } else {
        this.selectedComposers = [composer];
      }
    }
    this.composerImageFailed = false;
    this.resetInfiniteScroll();
    this.applyFilter();
    this.saveState();
    this.cdr.detectChanges();
  }

  onComposerImageError(): void {
    this.composerImageFailed = true;
    this.cdr.detectChanges();
  }

  get selectedFranchiseNotes(): string | null {
    if (this.selectedCategories.length !== 1) {
      return null;
    }

    const selectedCategory = this.selectedCategories[0];
    const volume = this.volumes.find(v => {
      // Check if volume title matches selected category
      if (v.title === selectedCategory) return true;
      // Or check if any track in the volume belongs to this category
      return v.tracks.some(t => {
        let category: string;
        if (t.album && t.album.includes(': ')) {
          category = t.album.split(': ')[1].trim();
        } else {
          category = t.volume;
        }
        return category === selectedCategory;
      });
    });

    return volume?.notes || null;
  }

  get selectedComposerInfo(): { name: string, image: string, notes: string } | null {
    if (this.selectedComposers.length !== 1) {
      return null;
    }
    const name = this.selectedComposers[0];
    const metadata = this.composersMetadata[name];
    if (metadata) {
      return {
        name: name,
        image: `music/smash/composers/${metadata.image}`,
        notes: metadata.notes
      };
    }
    return null;
  }

  shuffleTracks(): void {
    if (this.filteredTracks.length === 0) return;

    // Fisher-Yates shuffle algorithm
    const tracks = [...this.filteredTracks];
    for (let i = tracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tracks[i], tracks[j]] = [tracks[j], tracks[i]];
    }
    this.filteredTracks = tracks;
    this.playlist = [...this.filteredTracks];
    this.saveState();
    this.resetInfiniteScroll();
    this.cdr.detectChanges();
  }

  applyFilter(): void {
    this.filteredTracks = this.allTracks.filter(track => {
      // Category filter (OR logic within categories)
      if (this.selectedCategories.length > 0) {
        let category: string;
        if (track.album && track.album.includes(': ')) {
          category = track.album.split(': ')[1].trim();
        } else {
          category = track.volume;
        }
        if (!this.selectedCategories.includes(category)) return false;
      }

      // Game filter (comment field)
      if (this.selectedGames.length > 0) {
        const matchesAnyGame = this.selectedGames.some(game => track.comment.includes(game));
        if (!matchesAnyGame) return false;
      }

      // Stars filter
      if (this.selectedStars.length > 0) {
        const trackStars = parseInt(track.stars, 10);
        if (!this.selectedStars.includes(trackStars)) return false;
      }

      // Remix/Original filter (type)
      if (this.selectedType) {
        if (!track.comment.includes(this.selectedType)) return false;
      }

      // Special case for "Original" to exclude "Remix" in comment
      if (this.selectedType === 'Original' && track.comment.includes('Remix')) {
        return false;
      }

      // Composer/Contributor filter
      if (this.selectedComposers.length > 0) {
        const matchesAnyComposer = this.selectedComposers.some(composer => {
          const trackContributors = this.getIndividualComposers(track.contributors);
          const trackComposers = this.getIndividualComposers(track.composers);

          if (this.selectedType === 'Remix') {
            return trackContributors.includes(composer);
          } else if (this.selectedType === 'Original') {
            return trackComposers.includes(composer);
          } else {
            // "All" is selected or selectedType is null
            return trackContributors.includes(composer) || trackComposers.includes(composer);
          }
        });
        if (!matchesAnyComposer) return false;
      }

      return true;
    });

    this.playlist = [...this.filteredTracks];
  }

  playAll(): void {
    this.isFirstLoad = false;
    if (this.filteredTracks.length > 0) {
      this.playTrack(this.filteredTracks[0]);
    }
  }

  playTrack(track: Track): void {
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
    // Resume context if suspended (required after user gesture on mobile)
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
      // Pre-load next tracks
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

  updateMediaSession(track: Track): void {
    if ('mediaSession' in navigator) {
      const metadata: any = {
        title: track.title,
        artist: (track.contributors || track.composers || '').replace(/,\s*/g, ' & '),
        album: track.album || track.volume,
        artwork: [
          { src: this.imageService.imageUrl('music/smash/album-art/' + (track.image || 'default.png')), sizes: '512x512', type: 'image/png' }
        ]
      };

      // @ts-ignore
      navigator.mediaSession.metadata = new MediaMetadata(metadata);
      navigator.mediaSession.playbackState = 'playing';

      // Update position state for better background handling
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

  private ensureAudioContext(): AudioContext {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      this.audioCtx = new AudioContext();
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.connect(this.audioCtx.destination);
    }
    return this.audioCtx;
  }

  private async fetchAndDecodeBuffer(track: Track): Promise<AudioBuffer> {
    const url = this.imageService.imageUrl(track.path);
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
      const url = this.imageService.imageUrl(track.path);
      if (!this.bufferCache.has(url)) {
        this.fetchAndDecodeBuffer(track).catch(err =>
          console.error('[DEBUG_LOG] Preload error for', track.title, err)
        );
      }
    }
  }

  private stopCurrentSource(): void {
    if (this.currentSource) {
      try { this.currentSource.onended = null; this.currentSource.stop(); } catch (e) {}
      this.currentSource = null;
    }
    this.scheduledTracks = [];
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

  seekTo(time: number): void {
    if (!this.currentTrack) return;
    this.stopCurrentSource();
    this.stopProgressTracking();
    this.playbackStartOffset = time;
    this.currentTime = time;
    const ctx = this.ensureAudioContext();
    const url = this.imageService.imageUrl(this.currentTrack.path);
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
      const url = this.imageService.imageUrl(this.currentTrack!.path);
      const buffer = this.bufferCache.get(url);
      if (buffer) {
        // Buffer already in cache — start from saved offset
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
        // Buffer was not loaded (e.g. mobile browser suspended before preload finished)
        // Fetch and decode it now, then start playback from the saved offset
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
          // Also kick off preloading for upcoming tracks
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

  togglePlayPause(): void {
    if (this.isPlaying) {
      this.pausePlayback();
    } else {
      this.resumePlayback();
    }
  }

  private onSourceEnded(track: Track): void {
    // Only advance if this ended naturally (not stopped manually)
    if (!this.isPlaying) return;
    this.ngZone.run(() => {
      this.isAutoAdvancing = true;
      this.nextTrack();
    });
  }

  nextTrack(): void {
    if (!this.currentTrack) return;
    const nextIndex = this.playlist.indexOf(this.currentTrack) + 1;
    if (nextIndex < this.playlist.length) {
      this.isFirstLoad = false;
      this.isAutoAdvancing = true;
      this.playTrack(this.playlist[nextIndex]);
    } else {
      this.isAutoAdvancing = false;
      this.isPlaying = false;
      this.stopProgressTracking();
      this.cdr.detectChanges();
    }
  }

  previousTrack(): void {
    if (!this.currentTrack) return;
    const index = this.playlist.indexOf(this.currentTrack);
    if (index > 0) {
      this.isFirstLoad = false;
      this.playTrack(this.playlist[index - 1]);
    }
  }

  get progressPercent(): number {
    if (!this.duration) return 0;
    return (this.currentTime / this.duration) * 100;
  }

  get currentTimeFormatted(): string {
    return this.formatTime(this.currentTime);
  }

  get durationFormatted(): string {
    return this.formatTime(this.duration);
  }

  private formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  onProgressClick(event: MouseEvent): void {
    const bar = event.currentTarget as HTMLElement;
    const rect = bar.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    this.seekTo(ratio * this.duration);
  }
}
