import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { NgClass, NgOptimizedImage } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap } from 'rxjs';
import {Character} from "./character.interface";
import {CharacterComponent} from "./character/character.component";
import {RatingHydrationService} from "../../utils/rating-bar/service/rating-hydration.service";
import {ImageUrlPipe} from "../../utils/pipes/image-url.pipe";

@Component({
    selector: 'app-characters',
    imports: [NgClass, NgOptimizedImage, FormsModule, CharacterComponent, ImageUrlPipe],
    templateUrl: './characters.component.html',
    styleUrls: ['./characters.component.css']
})
export default class CharactersComponent {
  private http = inject(HttpClient);
  private ratingHydration = inject(RatingHydrationService);

  readonly characters = toSignal(
    this.http.get<{ characters: Character[] }>('assets/data/characters.json').pipe(
      switchMap(data => this.ratingHydration.hydrateRatings(data.characters)),
      map(hydrated => this.prepareCharacters(hydrated as Character[])),
      catchError(err => {
        console.error('Failed to load characters:', err);
        return of([] as Character[]);
      })
    ),
    { initialValue: [] as Character[] }
  );
  readonly selectedCharacter = signal<Character | undefined>(undefined);
  readonly password = signal('');
  readonly pictureMode = computed(() => {
    const password = this.password();
    if (password === 'wtf') {
      return 1;
    } else if (password === 'fat') {
      return 2;
    }
    return 0;
  });

  private selectTimeout?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.selectTimeout));
  }

  selectCharacter(character: Character): void {
    clearTimeout(this.selectTimeout);
    this.selectTimeout = setTimeout(() => {
      this.selectedCharacter.set(character);
    }, 0);
  }

  closeDetail(): void {
    this.selectedCharacter.set(undefined);
  }

  /** Sets each character's border colour and sorts its decorations by order. */
  private prepareCharacters(characters: Character[]): Character[] {
    return characters.map(character => ({
      ...character,
      color: this.calculateColor(character),
      deco: [...character.deco].sort((a, b) => a.order - b.order),
    }));
  }

  calculateColor(character: Character): string {
    if (!character.played) {
      return 'red';
    }
    if (!character.completed) {
      return 'orange';
    }
    if (!character.understood) {
      return 'yellow';
    }
    return 'green';
  }

  getBorderColor(color: string): string {
    return "0 0 25px " + color;
  }
}
