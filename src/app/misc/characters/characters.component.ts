import { Component, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import {Character} from "./character.interface";
import {CharacterComponent} from "./character/character.component";
import {RatingHydrationService} from "../../utils/rating-bar/service/rating-hydration.service";
import {ImageUrlPipe} from "../../utils/pipes/image-url.pipe";

@Component({
    selector: 'app-characters',
    imports: [CommonModule, NgOptimizedImage, FormsModule, CharacterComponent, ImageUrlPipe],
    templateUrl: './characters.component.html',
    styleUrls: ['./characters.component.css']
})
export default class CharactersComponent implements OnInit {
  characters: Character[] = [];
  selectedCharacter?: Character;
  password: string = '';
  pictureMode: number = 0;

  constructor(
    private http: HttpClient,
    private ratingHydration: RatingHydrationService
  ) {}

  ngOnInit(): void {
    this.loadCharacters();
  }

  loadCharacters(): void {
    this.http.get<{ characters: Character[] }>('assets/data/characters.json').subscribe({
      next: (data) => {
        this.ratingHydration.hydrateRatings(data.characters).subscribe(hydrated => {
          this.characters = hydrated as Character[];
          this.calculateColors();
          this.reorderDecorations();
        });
      },
      error: (err) => {
        console.error('Failed to load characters:', err);
      },
    });
  }

  selectCharacter(character: Character): void {
    setTimeout(() => {
      this.selectedCharacter = character;
    }, 0);
  }

  closeDetail(): void {
    this.selectedCharacter = undefined;
  }

  updatePictureMode(): void {
    if (this.password === 'wtf') {
      this.pictureMode = 1;
    } else if (this.password === 'fat') {
      this.pictureMode = 2;
    } else {
      this.pictureMode = 0;
    }
  }

  calculateColors(): void {
    this.characters.forEach((character) => {
      const color = this.calculateColor(character);
      character.color = color;
    });
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

  reorderDecorations(): void {
    this.characters.forEach(character => {
      character.deco.sort((a, b) => a.order - b.order);
    });
  }
}
