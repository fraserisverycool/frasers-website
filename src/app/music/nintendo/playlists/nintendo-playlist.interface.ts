export interface NintendoPlaylist {
  id: string;
  name: string;
  description: string;
  image: string;
  link: string;
  newsletter?: boolean;
  timestamp?: string;
  rating: number[];
}
