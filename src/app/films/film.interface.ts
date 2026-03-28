export interface Film {
  filename: string;
  title: string;
  description: string;
  spoiler?: string;
  year: string;
  release: number;
  tv: boolean;
  seasons: number[];
  rating: number[];
  id: string;
  newsletter: boolean;
}
