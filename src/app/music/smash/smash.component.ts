import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, HostListener } from '@angular/core';
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
  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;
  private _lastUpdateSec: number = -1;
  private isAutoAdvancing = false;
  isFirstLoad = true;

  constructor(private http: HttpClient, protected imageService: ImageService, private cdr: ChangeDetectorRef, private eRef: ElementRef) {}

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

  private saveState(): void {
    const state = {
      selectedCategories: this.selectedCategories,
      selectedGames: this.selectedGames,
      selectedStars: this.selectedStars,
      selectedType: this.selectedType,
      selectedComposers: this.selectedComposers,
      currentTrackId: this.currentTrack?.id,
      playlistIds: this.playlist.map(t => t.id)
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
    this.updateMediaSession(track);
    this.saveState();
    // Explicitly play in case this was called from a non-gesture (though usually it is)
    if (this.audioPlayer) {
      this.audioPlayer.nativeElement.play().catch(err => {
        console.error('[DEBUG_LOG] playTrack error:', err);
      });
    }
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
    const nextIndex = this.playlist.indexOf(this.currentTrack) + 1;
    if (nextIndex < this.playlist.length) {
      this.isFirstLoad = false;
      this.isAutoAdvancing = true;
      this.playTrack(this.playlist[nextIndex]);
    } else {
      this.isAutoAdvancing = false;
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

  onTrackEnded(): void {
    console.log('[DEBUG_LOG] Track ended, advancing...');
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
      // Avoid setting 'paused' if we are just transitioning between tracks
      if (!this.isAutoAdvancing) {
        navigator.mediaSession.playbackState = 'paused';
      }
    }
  }

  onAudioError(event: any): void {
    const error = this.audioPlayer.nativeElement.error;
    console.error('[DEBUG_LOG] Audio element error:', error, event);

    // If it's a transient error, try to recover
    if (this.currentTrack && (error?.code === 2 || error?.code === 3 || error?.code === 4)) {
      console.warn('[DEBUG_LOG] Attempting to recover from audio error...');
      setTimeout(() => {
        if (this.currentTrack) {
          this.playTrack(this.currentTrack);
        }
      }, 2000);
    }
  }

  onTimeUpdate(): void {
    if (this.currentTrack && 'mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
      const audio = this.audioPlayer.nativeElement;
      // Use the actual time to throttle to approximately once per second
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
}
