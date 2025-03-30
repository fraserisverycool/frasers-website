import { Component, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface Character {
  name: string;
  icon: string;
  picture: string[];
  description: string;
}

@Component({
  selector: 'app-characters',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './characters.component.html',
  styleUrls: ['./characters.component.css']
})
export class CharactersComponent implements OnInit {
  characters: Character[] = [];
  selectedCharacter?: Character;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCharacters();
  }

  loadCharacters(): void {
    this.http.get<{ characters: Character[] }>('assets/smash/characters/characters.json').subscribe({
      next: (data) => {
        this.characters = data.characters;
      },
      error: (err) => {
        console.error('Failed to load characters:', err);
      },
    });
  }

  selectCharacter(character: Character): void {
    this.selectedCharacter = character;
  }

  closeDetail(): void {
    this.selectedCharacter = undefined;
  }
}
