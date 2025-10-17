import {SafeUrl} from "@angular/platform-browser";

export interface DailySoundtrack {
  artist: string;
  album: string;
  track: string;
  description: string;
  link: string;
  embed: SafeUrl;
  day: string;
  game: boolean;
  rating: number[];
  id: string;
  newsletter: boolean;
}
