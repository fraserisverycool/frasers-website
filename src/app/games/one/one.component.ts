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
  selector: 'app-one',
  standalone: true,
  imports: [CommonModule, GamesComponent],
  templateUrl: './one.component.html',
  styleUrls: ['./one.component.css']
})
export default class OneComponent implements OnInit {
  games: Game[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadGames();
  }

  loadGames(): void {
    this.http.get<{ games: Game[] }>('assets/games/2021.json').subscribe({
      next: (data) => {
        this.games = data.games;
      },
      error: (err) => {
        console.error('Failed to load games:', err);
      },
    });
  }
}
