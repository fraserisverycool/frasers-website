export interface Mix {
  filename: string;
  name: string;
  description: string;
  image: string;
  rating: number[];
  id: string;
  newsletter: boolean;
  timestamp?: string;
  tracklist?: string[];
}
