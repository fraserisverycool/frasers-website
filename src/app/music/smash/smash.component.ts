import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, NgClass } from '@angular/common';
import { forkJoin, map, switchMap } from 'rxjs';
import { ImageService } from '../../utils/services/image.service';

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
  imports: [CommonModule, NgClass],
  templateUrl: './smash.component.html',
  styleUrl: './smash.component.css',
})
export default class SmashComponent implements OnInit, AfterViewInit, OnDestroy {
  volumes: Volume[] = [];
  allTracks: Track[] = [];
  filteredTracks: Track[] = [];
  categories: string[] = [];
  selectedCategory: string | null = null;
  selectedGame: string | null = null;
  selectedStars: number | null = null;
  selectedType: string | null = null; // 'Remix' | 'Original' | null
  selectedComposer: string | null = null;
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

  constructor(private http: HttpClient, protected imageService: ImageService, private cdr: ChangeDetectorRef, private eRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if ((this.isFilterDropdownOpen || this.isGameDropdownOpen || this.isStarsDropdownOpen || this.isComposerDropdownOpen) && !this.eRef.nativeElement.contains(target)) {
      this.isFilterDropdownOpen = false;
      this.isGameDropdownOpen = false;
      this.isStarsDropdownOpen = false;
      this.isComposerDropdownOpen = false;
      this.cdr.detectChanges();
    }
  }

  ngOnInit(): void {
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
            const individualContributors = track.contributors.split(',').map(c => c.trim());
            individualContributors.forEach(c => {
              if (c) composerSet.add(c);
            });
          }

          if (track.composers) {
            const individualComposers = track.composers.split(',').map(c => c.trim());
            individualComposers.forEach(c => {
              if (c) composerSet.add(c);
            });
          }
        });
        this.categories = Array.from(categorySet).sort();
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
    this.selectedCategory = category;
    this.isFilterDropdownOpen = false;
    this.resetInfiniteScroll();
    this.applyFilter();
    this.cdr.detectChanges();
  }

  selectGame(game: string | null): void {
    this.selectedGame = game;
    this.isGameDropdownOpen = false;
    this.resetInfiniteScroll();
    this.applyFilter();
    this.cdr.detectChanges();
  }

  selectStars(star: number | null): void {
    this.selectedStars = star;
    this.isStarsDropdownOpen = false;
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
    this.selectedComposer = composer;
    this.isComposerDropdownOpen = false;
    this.resetInfiniteScroll();
    this.applyFilter();
    this.cdr.detectChanges();
  }

  applyFilter(): void {
    this.filteredTracks = this.allTracks.filter(track => {
      // Category filter
      if (this.selectedCategory) {
        let category: string;
        if (track.album && track.album.includes(': ')) {
          category = track.album.split(': ')[1].trim();
        } else {
          category = track.volume;
        }
        if (category !== this.selectedCategory) return false;
      }

      // Game filter (comment field)
      if (this.selectedGame) {
        if (!track.comment.includes(this.selectedGame)) return false;
      }

      // Stars filter
      if (this.selectedStars !== null) {
        const trackStars = parseInt(track.stars, 10);
        if (trackStars !== this.selectedStars) return false;
      }

      // Remix/Original filter (type)
      if (this.selectedType) {
        if (!track.comment.includes(this.selectedType)) return false;
      }

      // Composer/Contributor filter
      if (this.selectedComposer) {
        const inContributors = track.contributors.includes(this.selectedComposer);
        const inComposers = track.composers.includes(this.selectedComposer);
        if (!inContributors && !inComposers) return false;
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
  }

  nextTrack(): void {
    if (!this.currentTrack) return;
    const index = this.playlist.indexOf(this.currentTrack);
    if (index < this.playlist.length - 1) {
      this.currentTrack = this.playlist[index + 1];
    }
  }

  previousTrack(): void {
    if (!this.currentTrack) return;
    const index = this.playlist.indexOf(this.currentTrack);
    if (index > 0) {
      this.currentTrack = this.playlist[index - 1];
    }
  }

  onTrackEnded(): void {
    this.nextTrack();
  }

  getFranchiseIcon(comment: string): string | null {
    if (!comment) return null;
    if (comment.includes('64')) return 'ssb.png';
    if (comment.includes('Melee')) return 'ssbm.png';
    if (comment.includes('Brawl')) return 'ssbb.png';
    if (comment.includes('Smash 4')) return 'ssb4.png';
    if (comment.includes('Ultimate')) return 'ssbu.png';
    return null;
  }

  getTrackClass(comment: string): string {
    if (!comment) return '';
    if (comment.includes('64')) return 'bg-64';
    if (comment.includes('Melee')) return 'bg-melee';
    if (comment.includes('Brawl')) return 'bg-brawl';
    if (comment.includes('3DS')) return 'bg-3ds';
    if (comment.includes('Smash 4')) return 'bg-smash4';
    if (comment.includes('Ultimate')) return 'bg-ultimate';
    return '';
  }

  getStars(stars: string): number[] {
    const count = parseInt(stars, 10);
    return isNaN(count) ? [] : Array(count).fill(0);
  }
}
