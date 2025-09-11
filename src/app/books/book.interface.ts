export interface Book {
  filename: string;
  title: string;
  author: string;
  description: string;
  spoiler: string;
  release: number;
  showSpoiler?: boolean;
  rating: number[];
  id: string;
}
