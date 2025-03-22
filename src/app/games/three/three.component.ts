import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import GamesComponent from "../games.component"
import { HttpClient } from "@angular/common/http";;

interface Game {
  name: string;
  vibes: string;
  gameplay: string;
  review: string[];
  image: string;
  platform: string;
  yearPlayed: string;
}

@Component({
  selector: 'app-three',
  standalone: true,
  imports: [CommonModule, GamesComponent],
  templateUrl: './three.component.html',
  styleUrls: ['./three.component.css']
})
export default class ThreeComponent implements OnInit {
  games: Game[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadGames();
  }

  loadGames(): void {
    this.http.get<{ games: Game[] }>('assets/games/2023.json').subscribe({
      next: (data) => {
        this.games = data.games;
      },
      error: (err) => {
        console.error('Failed to load games:', err);
      },
    });
  }
}
