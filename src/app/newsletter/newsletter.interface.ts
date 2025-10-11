export interface Newsletter {
  timestamp: string;
  title: string;
  description: string[];
  entries: Entry[];
  rating: number[];
  id: string;
}

export interface Entry {
  title: string;
  description: string;
  image: string;
  metadata: string;
  type: NewsletterContent;
}

export enum NewsletterContent {
  GAME = 'GAME',
  FILM = 'FILM',
  DURSTLOESCHER = 'DURSTLOESCHER',
  BOOK = 'BOOK',
  GALLERY = 'GALLERY',
  VIDEO = 'VIDEO',
  CHARACTER_DECO = 'CHARACTER_DECO',
  MARIOKART = 'MARIOKART',
  STITCH = 'STITCH',
  ALBUM = 'ALBUM',
  CD = 'CD',
  MIX = 'MIX',
  SOUNDTRACK = 'SOUNDTRACK',
  KK = 'KK',
  DAILY_SOUNDTRACK = 'DAILY_SOUNDTRACK'
}
