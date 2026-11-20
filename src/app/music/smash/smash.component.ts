import { Component, OnInit, OnDestroy, ElementRef, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgClass } from '@angular/common';
import { forkJoin, map, switchMap } from 'rxjs';
import { ImageService } from '../../utils/services/image.service';

import { SmashTrackComponent } from './smash-track/smash-track.component';
import {RouterLink} from "@angular/router";
import {InfiniteScrollDirective} from "../../utils/directives/infinite-scroll.directive";
import {ImageUrlPipe} from "../../utils/pipes/image-url.pipe";

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
  imports: [NgClass, SmashTrackComponent, RouterLink, InfiniteScrollDirective, ImageUrlPipe],
  templateUrl: './smash.component.html',
  styleUrl: './smash.component.css',
  host: {
    '(document:click)': 'onDocumentClick($event)'
  }
})
export default class SmashComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  protected imageService = inject(ImageService);
  private eRef = inject(ElementRef);

  private readonly volumes = signal<Volume[]>([]);
  private readonly composersMetadata = signal<{ [key: string]: { image: string, source: string, notes: string } }>({});
  private allTracks: Track[] = [];
  readonly filteredTracks = signal<Track[]>([]);
  readonly categories = signal<string[]>([]);
  readonly selectedCategories = signal<string[]>([]);
  readonly selectedGames = signal<string[]>([]);
  readonly selectedStars = signal<number[]>([]);
  readonly selectedType = signal<string | null>(null); // 'Remix' | 'Original' | null
  readonly selectedComposers = signal<string[]>([]);
  readonly isFilterDropdownOpen = signal(false);
  readonly isGameDropdownOpen = signal(false);
  readonly isStarsDropdownOpen = signal(false);
  readonly isComposerDropdownOpen = signal(false);
  readonly composerImageFailed = signal(false);
  readonly currentTrack = signal<Track | null>(null);
  readonly playlist = signal<Track[]>([]);
  readonly currentIndex = computed(() => {
    const current = this.currentTrack();
    return current ? this.playlist().indexOf(current) : -1;
  });
  readonly loading = signal(true);

  readonly games: string[] = ['64', 'Melee', 'Brawl', 'Smash 4', 'Ultimate'];
  readonly stars: number[] = [0, 1, 2, 3, 4, 5];
  readonly composersList = signal<string[]>([]);

  // Infinite scroll
  private readonly itemsToShow = signal(20);
  private readonly pageSize = 20;
  readonly visibleTracks = computed(() => this.filteredTracks().slice(0, this.itemsToShow()));

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
  readonly isPlaying = signal(false);
  readonly currentTime = signal(0);
  readonly duration = signal(0);
  private playbackStartWallTime = 0;
  private playbackStartOffset = 0;
  private progressInterval: ReturnType<typeof setInterval> | null = null;
  readonly volume = signal(1);

  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const filterContainers = this.eRef.nativeElement.querySelectorAll('.filter-container');
    let isInsideAnyFilter = false;

    filterContainers.forEach((container: HTMLElement) => {
      if (container.contains(target)) {
        isInsideAnyFilter = true;
      }
    });

    if (!isInsideAnyFilter && (this.isFilterDropdownOpen() || this.isGameDropdownOpen() || this.isStarsDropdownOpen() || this.isComposerDropdownOpen())) {
      this.isFilterDropdownOpen.set(false);
      this.isGameDropdownOpen.set(false);
      this.isStarsDropdownOpen.set(false);
      this.isComposerDropdownOpen.set(false);
    }
  }

  private getIndividualComposers(composerString: string | undefined): string[] {
    if (!composerString) return [];

    return composerString.split(',').map(c => c.trim()).filter(c => c);
  }

  setVolume(value: number | string): void {
    this.volume.set(+value);
    if (this.gainNode) {
      this.gainNode.gain.value = this.volume();
    }
  }

  private saveState(): void {
    const state = {
      selectedCategories: this.selectedCategories(),
      selectedGames: this.selectedGames(),
      selectedStars: this.selectedStars(),
      selectedType: this.selectedType(),
      selectedComposers: this.selectedComposers(),
      currentTrackId: this.currentTrack()?.id,
      playlistIds: this.playlist().map(t => t.id),
      playbackPosition: this.currentTime()
    };
    localStorage.setItem('smash_player_state', JSON.stringify(state));
  }

  private loadState(): void {
    const saved = localStorage.getItem('smash_player_state');
    if (!saved) return;

    try {
      const state = JSON.parse(saved);
      this.selectedCategories.set(state.selectedCategories || []);
      this.selectedGames.set(state.selectedGames || []);
      this.selectedStars.set(state.selectedStars || []);
      this.selectedType.set(state.selectedType || null);
      this.selectedComposers.set(state.selectedComposers || []);

      this.applyFilter();

      if (state.playlistIds && state.playlistIds.length > 0) {
        // Map saved IDs back to track objects
        const trackMap = new Map(this.allTracks.map(t => [t.id, t]));
        this.playlist.set(state.playlistIds.map((id: string) => trackMap.get(id)).filter((t: any) => t) as Track[]);
      }

      if (state.currentTrackId) {
        const track = this.allTracks.find(t => t.id === state.currentTrackId);
        if (track) {
          this.currentTrack.set(track);
          if (state.playbackPosition) {
            this.playbackStartOffset = state.playbackPosition;
            this.currentTime.set(state.playbackPosition);
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
      next: (data) => this.composersMetadata.set(data),
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
        this.volumes.set(volumes);
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
        this.categories.set(Array.from(categorySet));
        this.composersList.set(Array.from(composerSet).sort());

        // Restore state if available
        this.loadState();

        // If no state was loaded, use defaults
        if (this.filteredTracks().length === 0 && this.allTracks.length > 0 && this.selectedCategories().length === 0 && this.selectedGames().length === 0 && this.selectedStars().length === 0 && this.selectedType() === null && this.selectedComposers().length === 0) {
          this.filteredTracks.set([...this.allTracks]);
          this.playlist.set([...this.allTracks]);
        }

        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading smash data', err);
        this.loading.set(false);
      }
    });
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

  loadMore(): void {
    if (this.itemsToShow() < this.filteredTracks().length) {
      this.itemsToShow.update(n => n + this.pageSize);
    }
  }

  resetInfiniteScroll(): void {
    this.itemsToShow.set(this.pageSize);
  }

  toggleFilterDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.isFilterDropdownOpen.update(open => !open);
    this.isGameDropdownOpen.set(false);
    this.isStarsDropdownOpen.set(false);
    this.isComposerDropdownOpen.set(false);
  }

  toggleGameDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.isGameDropdownOpen.update(open => !open);
    this.isFilterDropdownOpen.set(false);
    this.isStarsDropdownOpen.set(false);
    this.isComposerDropdownOpen.set(false);
  }

  toggleStarsDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.isStarsDropdownOpen.update(open => !open);
    this.isFilterDropdownOpen.set(false);
    this.isGameDropdownOpen.set(false);
    this.isComposerDropdownOpen.set(false);
  }

  toggleComposerDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.isComposerDropdownOpen.update(open => !open);
    this.isFilterDropdownOpen.set(false);
    this.isGameDropdownOpen.set(false);
    this.isStarsDropdownOpen.set(false);
  }

  /** Returns a copy of the list with the value added, or removed if it was already present. */
  private toggleValue<T>(list: T[], value: T): T[] {
    return list.includes(value) ? list.filter(v => v !== value) : [...list, value];
  }

  selectCategory(category: string | null): void {
    this.selectedCategories.update(list => category === null ? [] : this.toggleValue(list, category));
    this.resetInfiniteScroll();
    this.applyFilter();
    this.saveState();
  }

  selectGame(game: string | null): void {
    this.selectedGames.update(list => game === null ? [] : this.toggleValue(list, game));
    this.resetInfiniteScroll();
    this.applyFilter();
    this.saveState();
  }

  selectStars(star: number | null): void {
    this.selectedStars.update(list => star === null ? [] : this.toggleValue(list, star));
    this.resetInfiniteScroll();
    this.applyFilter();
    this.saveState();
  }

  selectType(type: string | null): void {
    this.selectedType.set(type);
    this.resetInfiniteScroll();
    this.applyFilter();
    this.saveState();
  }

  selectComposer(composer: string | null): void {
    // Single-select: picking the selected composer again removes it, otherwise it replaces the selection
    this.selectedComposers.update(list => {
      if (composer === null) return [];
      return list.includes(composer) ? list.filter(c => c !== composer) : [composer];
    });
    this.composerImageFailed.set(false);
    this.resetInfiniteScroll();
    this.applyFilter();
    this.saveState();
  }

  onComposerImageError(): void {
    this.composerImageFailed.set(true);
  }

  readonly selectedFranchiseNotes = computed(() => {
    const selectedCategories = this.selectedCategories();
    if (selectedCategories.length !== 1) {
      return null;
    }

    const selectedCategory = selectedCategories[0];
    const volume = this.volumes().find(v => {
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
  });

  readonly selectedComposerInfo = computed<{ name: string, image: string, notes: string } | null>(() => {
    const selectedComposers = this.selectedComposers();
    if (selectedComposers.length !== 1) {
      return null;
    }
    const name = selectedComposers[0];
    const metadata = this.composersMetadata()[name];
    if (metadata) {
      return {
        name: name,
        image: `music/smash/composers/${metadata.image}`,
        notes: metadata.notes
      };
    }
    return null;
  });

  shuffleTracks(): void {
    if (this.filteredTracks().length === 0) return;

    // Fisher-Yates shuffle algorithm
    const tracks = [...this.filteredTracks()];
    for (let i = tracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tracks[i], tracks[j]] = [tracks[j], tracks[i]];
    }
    this.filteredTracks.set(tracks);
    this.playlist.set([...tracks]);
    this.saveState();
    this.resetInfiniteScroll();
  }

  applyFilter(): void {
    const selectedCategories = this.selectedCategories();
    const selectedGames = this.selectedGames();
    const selectedStars = this.selectedStars();
    const selectedType = this.selectedType();
    const selectedComposers = this.selectedComposers();
    const filtered = this.allTracks.filter(track => {
      // Category filter (OR logic within categories)
      if (selectedCategories.length > 0) {
        let category: string;
        if (track.album && track.album.includes(': ')) {
          category = track.album.split(': ')[1].trim();
        } else {
          category = track.volume;
        }
        if (!selectedCategories.includes(category)) return false;
      }

      // Game filter (comment field)
      if (selectedGames.length > 0) {
        const matchesAnyGame = selectedGames.some(game => track.comment.includes(game));
        if (!matchesAnyGame) return false;
      }

      // Stars filter
      if (selectedStars.length > 0) {
        const trackStars = parseInt(track.stars, 10);
        if (!selectedStars.includes(trackStars)) return false;
      }

      // Remix/Original filter (type)
      if (selectedType) {
        if (!track.comment.includes(selectedType)) return false;
      }

      // Special case for "Original" to exclude "Remix" in comment
      if (selectedType === 'Original' && track.comment.includes('Remix')) {
        return false;
      }

      // Composer/Contributor filter
      if (selectedComposers.length > 0) {
        const matchesAnyComposer = selectedComposers.some(composer => {
          const trackContributors = this.getIndividualComposers(track.contributors);
          const trackComposers = this.getIndividualComposers(track.composers);

          if (selectedType === 'Remix') {
            return trackContributors.includes(composer);
          } else if (selectedType === 'Original') {
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

    this.filteredTracks.set(filtered);
    this.playlist.set([...filtered]);
  }

  playAll(): void {
    this.isFirstLoad = false;
    const filteredTracks = this.filteredTracks();
    if (filteredTracks.length > 0) {
      this.playTrack(filteredTracks[0]);
    }
  }

  playTrack(track: Track): void {
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
    // Resume context if suspended (required after user gesture on mobile)
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
      // Pre-load next tracks
      const index = this.playlist().indexOf(track);
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
    const playlist = this.playlist();
    const end = Math.min(fromIndex + this.PRELOAD_AHEAD, playlist.length);
    for (let i = fromIndex + 1; i < end; i++) {
      const track = playlist[i];
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

  seekTo(time: number): void {
    const currentTrack = this.currentTrack();
    if (!currentTrack) return;
    this.stopCurrentSource();
    this.stopProgressTracking();
    this.playbackStartOffset = time;
    this.currentTime.set(time);
    const ctx = this.ensureAudioContext();
    const url = this.imageService.imageUrl(currentTrack.path);
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
      const url = this.imageService.imageUrl(currentTrack.path);
      const buffer = this.bufferCache.get(url);
      if (buffer) {
        // Buffer already in cache — start from saved offset
        this.startSourceAtOffset(ctx, buffer);
      } else {
        // Buffer was not loaded (e.g. mobile browser suspended before preload finished)
        // Fetch and decode it now, then start playback from the saved offset
        this.fetchAndDecodeBuffer(currentTrack).then(fetchedBuffer => {
          this.startSourceAtOffset(ctx, fetchedBuffer);
          // Also kick off preloading for upcoming tracks
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

  togglePlayPause(): void {
    if (this.isPlaying()) {
      this.pausePlayback();
    } else {
      this.resumePlayback();
    }
  }

  private onSourceEnded(track: Track): void {
    // Only advance if this ended naturally (not stopped manually)
    if (!this.isPlaying()) return;
    this.isAutoAdvancing = true;
    this.nextTrack();
  }

  nextTrack(): void {
    if (!this.currentTrack()) return;
    const playlist = this.playlist();
    const nextIndex = this.currentIndex() + 1;
    if (nextIndex < playlist.length) {
      this.isFirstLoad = false;
      this.isAutoAdvancing = true;
      this.playTrack(playlist[nextIndex]);
    } else {
      this.isAutoAdvancing = false;
      this.isPlaying.set(false);
      this.stopProgressTracking();
    }
  }

  previousTrack(): void {
    if (!this.currentTrack()) return;
    const index = this.currentIndex();
    if (index > 0) {
      this.isFirstLoad = false;
      this.playTrack(this.playlist()[index - 1]);
    }
  }

  readonly progressPercent = computed(() => {
    const duration = this.duration();
    if (!duration) return 0;
    return (this.currentTime() / duration) * 100;
  });

  readonly currentTimeFormatted = computed(() => this.formatTime(this.currentTime()));
  readonly durationFormatted = computed(() => this.formatTime(this.duration()));

  private formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  onProgressClick(event: MouseEvent): void {
    const bar = event.currentTarget as HTMLElement;
    const rect = bar.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    this.seekTo(ratio * this.duration());

  }
}
