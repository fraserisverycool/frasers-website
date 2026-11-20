import { Component, computed, inject, input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import {FriendRating} from "./friend-rating.interface";
import {ImageService} from "../services/image.service";

@Component({
    selector: 'app-friend-rating',
    templateUrl: './friend-rating.component.html',
    styleUrls: ['./friend-rating.component.css']
})
export class FriendRatingComponent {
  private http = inject(HttpClient);
  protected imageService = inject(ImageService);

  readonly currentId = input<string>("");

  private readonly allFriendRatings = toSignal(
    this.http.get<{ ratings: FriendRating[] }>('assets/data/friend-ratings.json').pipe(
      map(data => data.ratings),
      catchError(err => {
        console.error('Failed to load ratings:', err);
        return of([] as FriendRating[]);
      })
    ),
    { initialValue: [] as FriendRating[] }
  );

  readonly friendRatings = computed(() =>
    this.allFriendRatings().filter(rating => rating.id === this.currentId())
  );

  readonly friendImages: Record<string, string> = {
    Victor: '/utils/friends/victor.png',
    Diego: '/utils/friends/diego.png'
  };
}
