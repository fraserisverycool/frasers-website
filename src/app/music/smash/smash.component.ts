import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, NgClass } from '@angular/common';
import { forkJoin, map, switchMap } from 'rxjs';
import { ImageService } from '../../utils/services/image.service';

import { SmashTrackComponent } from './smash-track/smash-track.component';

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
  imports: [CommonModule, NgClass, SmashTrackComponent],
  templateUrl: './smash.component.html',
  styleUrl: './smash.component.css',
})
export default class SmashComponent implements OnInit, AfterViewInit, OnDestroy {
  volumes: Volume[] = [];
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

    // Special case for ACE (TOMOri Kudo / CHiCO)
    const specialComposer = "ACE (TOMOri Kudo / CHiCO)";
    if (composerString.includes(specialComposer)) {
      const parts = composerString.split(specialComposer);
      const others = parts.flatMap(part => part.split(',').map(c => c.trim()).filter(c => c));
      return [specialComposer, ...others];
    }

    return composerString.split(',').map(c => c.trim()).filter(c => c);
  }

  ngOnInit(): void {
    this.setupMediaSessionHandlers();
    this.http.get<IndexData>('assets/data/smash/index.json').pipe(
      switchMap(indexData => {
        const volumeRequests = Object.keys(indexData).map(fullTitle => {
          const info = indexData[fullTitle];
          const file = info.file;
          // Extract series name: "Super Smash Bros. Anthology Vol. 17 - Pikmin (Wii...)" -> "Pikmin"
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

        this.filteredTracks = [...this.allTracks];
        this.playlist = [...this.filteredTracks];
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
    this.cdr.detectChanges();
  }

  selectType(type: string | null): void {
    this.selectedType = type;
    this.resetInfiniteScroll();
    this.applyFilter();
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
        this.selectedComposers.push(composer);
      }
    }
    this.resetInfiniteScroll();
    this.applyFilter();
    this.cdr.detectChanges();
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

      // Composer/Contributor filter
      if (this.selectedComposers.length > 0) {
        const matchesAnyComposer = this.selectedComposers.some(composer => {
          const trackContributors = this.getIndividualComposers(track.contributors);
          const trackComposers = this.getIndividualComposers(track.composers);
          return trackContributors.includes(composer) || trackComposers.includes(composer);
        });
        if (!matchesAnyComposer) return false;
      }

      return true;
    });

    this.playlist = [...this.filteredTracks];
  }

  playAll(): void {
    if (this.filteredTracks.length > 0) {
      this.playTrack(this.filteredTracks[0]);
    }
  }

  playTrack(track: Track): void {
    this.currentTrack = track;
    this.updateMediaSession(track);
    this.cdr.detectChanges();
    if (this.audioPlayer) {
      this.audioPlayer.nativeElement.load();
      this.audioPlayer.nativeElement.play().catch(e => console.error('Error playing track', e));
    }
  }

  updateMediaSession(track: Track): void {
    if ('mediaSession' in navigator) {
      const metadata: any = {
        title: track.title,
        artist: track.contributors || track.composers,
        album: track.album || track.volume,
        artwork: [
          { src: this.imageService.imageUrl('music/smash/album-art/' + (track.image || 'default.png')), sizes: '512x512', type: 'image/png' }
        ]
      };

      // @ts-ignore
      navigator.mediaSession.metadata = new MediaMetadata(metadata);
      navigator.mediaSession.playbackState = 'playing';
    }
  }

  setupMediaSessionHandlers(): void {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => {
        if (this.audioPlayer) {
          this.audioPlayer.nativeElement.play();
          navigator.mediaSession.playbackState = 'playing';
        }
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        if (this.audioPlayer) {
          this.audioPlayer.nativeElement.pause();
          navigator.mediaSession.playbackState = 'paused';
        }
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => this.previousTrack());
      navigator.mediaSession.setActionHandler('nexttrack', () => this.nextTrack());
    }
  }

  nextTrack(): void {
    if (!this.currentTrack) return;
    const index = this.playlist.indexOf(this.currentTrack);
    if (index < this.playlist.length - 1) {
      this.currentTrack = this.playlist[index + 1];
      this.updateMediaSession(this.currentTrack);
      this.cdr.detectChanges();
      if (this.audioPlayer) {
        this.audioPlayer.nativeElement.load();
        this.audioPlayer.nativeElement.play().catch(e => console.error('Error playing next track', e));
      }
    }
  }

  previousTrack(): void {
    if (!this.currentTrack) return;
    const index = this.playlist.indexOf(this.currentTrack);
    if (index > 0) {
      this.currentTrack = this.playlist[index - 1];
      this.updateMediaSession(this.currentTrack);
      this.cdr.detectChanges();
      if (this.audioPlayer) {
        this.audioPlayer.nativeElement.load();
        this.audioPlayer.nativeElement.play().catch(e => console.error('Error playing previous track', e));
      }
    }
  }

  onTrackEnded(): void {
    this.nextTrack();
  }
}
