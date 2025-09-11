export interface Character {
  name: string;
  icon: string;
  picture: string[];
  playedDescription: string;
  played: boolean;
  completed: boolean;
  understood: boolean;
  color: string;
  showMain: boolean;
  main: string;
  deco: Decoration[];
  rating: number[];
  id: string;
}

export interface Decoration {
  filename: string;
  description: string;
  order: number;
}
