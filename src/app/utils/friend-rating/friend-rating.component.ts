import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {FriendRating} from "./friend-rating.interface";
import {ImageService} from "../services/image.service";

@Component({
  selector: 'app-friend-rating',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './friend-rating.component.html',
  styleUrls: ['./friend-rating.component.css']
})
export class FriendRatingComponent implements OnInit {
  @Input() currentId: string = "";

  originalFriendRatings: FriendRating[] = [];
  friendRatings: FriendRating[] = [];

  friendImages: Record<string, string> = {
    Victor: '/utils/friends/victor.png',
    Diego: '/utils/friends/diego.png'
  };

  constructor(private http: HttpClient, protected imageService: ImageService) {}

  ngOnInit(): void {
    this.loadFriendRatings();
  }

  loadFriendRatings(): void {
    this.http.get<{ ratings: FriendRating[] }>('assets/data/friend-ratings.json').subscribe({
      next: (data) => {
        this.originalFriendRatings = data.ratings;
        this.friendRatings = this.originalFriendRatings.filter(
          (rating) => rating.id === this.currentId
        );
      },
      error: (err) => {
        console.error('Failed to load ratings:', err);
      },
    });
  }
}
