import {Component, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Mix} from "./mix.interface";
import {MixModalComponent} from "./mix-modal/mix-modal.component";
import {MusicService} from "../service/music.service";
import {InfiniteScrollDirective} from "../../utils/directives/infinite-scroll.directive";
import {ImageUrlPipe} from "../../utils/pipes/image-url.pipe";

@Component({
    selector: 'app-mixes',
    imports: [MixModalComponent, FormsModule, InfiniteScrollDirective, ImageUrlPipe],
    templateUrl: './mixes.component.html',
    standalone: true,
    styleUrls: ['./mixes.component.css']
})
export default class MixesComponent implements OnInit {
  mp3Files: Mix[] = [];
  originalMixes: Mix[] = [];
  filteredMixes: Mix[] = [];
  color: string = "#000000"

  private _searchTerm: string = '';
  get searchTerm(): string {
    return this._searchTerm;
  }
  set searchTerm(value: string) {
    this._searchTerm = value;
    this.applyFilters();
  }

  pageSize = 20;
  itemsToShow = 20;

  selectedMix: Mix | null = null;

  constructor(private musicService: MusicService) {}

  ngOnInit(): void {
    this.loadMixes();
    this.color = this.getRandomColor();
  }

  loadMore(): void {
    if (this.itemsToShow < this.filteredMixes.length) {
      this.itemsToShow += this.pageSize;
    }
  }

  resetInfiniteScroll(): void {
    this.itemsToShow = this.pageSize;
  }

  showMix(mix: Mix): void {
    setTimeout(() => {
      this.selectedMix = mix;
    }, 0);
  }

  closeMix(): void {
    this.selectedMix = null;
  }

  loadMixes(): void {
    this.musicService.getMixes().subscribe({
      next: (mixes) => {
        this.originalMixes = mixes;
        this.mp3Files = mixes;
        this.applyFilters();
      },
      error: (err) => {
        console.error('Failed to load mixes:', err);
      },
    });
  }

  applyFilters(): void {
    this.resetInfiniteScroll();
    let filtered = [...this.mp3Files];

    if (this.searchTerm) {
      const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
      filtered = filtered.filter(mix =>
        mix.name.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    this.filteredMixes = filtered;
  }

  getRandomColor() {
    const r = Math.floor(Math.random() * 128);
    const g = Math.floor(Math.random() * 128);
    const b = Math.floor(Math.random() * 128);

    const toHex = (c: number) => c.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
}
