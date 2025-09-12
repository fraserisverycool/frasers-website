import { Component, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import {Character} from "./character.interface";
import {CharacterComponent} from "./character/character.component";
import {RatingService} from "../../utils/rating-bar/service/rating.service";

@Component({
  selector: 'app-characters',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, FormsModule, CharacterComponent],
  templateUrl: './characters.component.html',
  styleUrls: ['./characters.component.css'],
})
export default class CharactersComponent implements OnInit {
  characters: Character[] = [];
  selectedCharacter?: Character;
  password: string = '';
  pictureMode: number = 0;

  constructor(private http: HttpClient, private ratingService: RatingService) {}

  ngOnInit(): void {
    this.loadCharacters();
  }

  loadCharacters(): void {
    this.http.get<{ characters: Character[] }>('assets/misc/characters/characters.json').subscribe({
      next: (data) => {
        this.characters = data.characters;
        this.getRatings();
        this.calculateColors();
        this.reorderDecorations();
      },
      error: (err) => {
        console.error('Failed to load characters:', err);
      },
    });
  }

  getRatings(): void {
    this.ratingService.getRatingsById(this.characters.map(character => character.id))
      .subscribe(characterRatings => {
        this.characters = this.characters.map(character => {
          const ratingData = characterRatings.find(rating => rating.id === character.id);
          if (ratingData) {
            character.rating = ratingData.ratings;
          } else {
            character.rating = [0,0,0,0,0,0];
          }
          return character;
        });
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
  });}
}
