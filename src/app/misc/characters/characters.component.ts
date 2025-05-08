import { Component, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import {Character} from "./character.interface";
import {CharacterComponent} from "./character/character.component";

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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCharacters();
  }

  loadCharacters(): void {
    this.http.get<{ characters: Character[] }>('assets/misc/characters/characters.json').subscribe({
      next: (data) => {
        this.characters = data.characters;
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
}
