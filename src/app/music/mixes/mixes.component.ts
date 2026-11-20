import { Component, OnInit, computed, inject, linkedSignal, signal } from '@angular/core';
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
    styleUrls: ['./mixes.component.css']
})
export default class MixesComponent implements OnInit {
  private musicService = inject(MusicService);

  readonly mp3Files = signal<Mix[]>([]);
  readonly color = signal(this.getRandomColor());
  readonly searchTerm = signal('');
  readonly selectedMix = signal<Mix | null>(null);

  readonly filteredMixes = computed(() => {
    const searchTerm = this.searchTerm();
    if (!searchTerm) {
      return this.mp3Files();
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return this.mp3Files().filter(mix =>
      mix.name.toLowerCase().includes(lowerCaseSearchTerm)
    );
  });

  private readonly pageSize = 20;
  /** Resets to one page whenever the filtered list changes (search, load). */
  readonly itemsToShow = linkedSignal({ source: this.filteredMixes, computation: () => this.pageSize });
  readonly visibleMixes = computed(() => this.filteredMixes().slice(0, this.itemsToShow()));

  ngOnInit(): void {
    this.loadMixes();
  }

  loadMore(): void {
    if (this.itemsToShow() < this.filteredMixes().length) {
      this.itemsToShow.update(n => n + this.pageSize);
    }
  }

  showMix(mix: Mix): void {
    // Deferred so the opening click is not treated as a click outside the modal.
    setTimeout(() => {
      this.selectedMix.set(mix);
    }, 0);
  }

  closeMix(): void {
    this.selectedMix.set(null);
  }

  loadMixes(): void {
    this.musicService.getMixes().subscribe({
      next: (mixes) => this.mp3Files.set(mixes),
      error: (err) => {
        console.error('Failed to load mixes:', err);
      },
    });
  }

  getRandomColor() {
    const r = Math.floor(Math.random() * 128);
    const g = Math.floor(Math.random() * 128);
    const b = Math.floor(Math.random() * 128);

    const toHex = (c: number) => c.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
}
