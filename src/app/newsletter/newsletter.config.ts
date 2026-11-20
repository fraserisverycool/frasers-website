import { NewsletterContent } from './newsletter.interface';

export const NEWSLETTER_CONTENT_CLASS_MAP: Record<NewsletterContent | string, string> = {
  [NewsletterContent.GAME]: 'game',
  [NewsletterContent.FILM]: 'film',
  [NewsletterContent.PLAYLIST]: 'playlist',
  [NewsletterContent.TVSHOW]: 'tvshow',
  [NewsletterContent.DURSTLOESCHER]: 'durstloescher',
  [NewsletterContent.BOOK]: 'book',
  [NewsletterContent.GALLERY]: 'gallery',
  [NewsletterContent.VIDEO]: 'video',
  [NewsletterContent.CHARACTER_DECO]: 'character-deco',
  [NewsletterContent.MARIOKART]: 'mariokart',
  [NewsletterContent.STITCH]: 'stitch',
  [NewsletterContent.ALBUM]: 'album',
  [NewsletterContent.CONCERT]: 'concert',
  [NewsletterContent.CD]: 'cd',
  [NewsletterContent.MIX]: 'mix',
  [NewsletterContent.SOUNDTRACK]: 'soundtrack',
  [NewsletterContent.KK]: 'kk',
  [NewsletterContent.DAILY_SOUNDTRACK]: 'daily-soundtrack',
  [NewsletterContent.NINTENDO_PLAYLIST]: 'nintendo-playlist',
};

export const NEWSLETTER_CONTENT_NAME_MAP: Record<NewsletterContent | string, string> = {
  [NewsletterContent.GAME]: 'Game Review',
  [NewsletterContent.FILM]: 'Film Review',
  [NewsletterContent.TVSHOW]: 'TV Show Review',
  [NewsletterContent.ALBUM]: 'Album Review',
  [NewsletterContent.PLAYLIST]: 'New Playlist',
  [NewsletterContent.SOUNDTRACK]: 'Nintendo Soundtrack Review',
  [NewsletterContent.BOOK]: 'Book Review',
  [NewsletterContent.GALLERY]: 'New Photo in the Gallery',
  [NewsletterContent.VIDEO]: 'Fun video for your entertainment',
  [NewsletterContent.CD]: 'New CD',
  [NewsletterContent.DURSTLOESCHER]: 'Durstloescher Review from Anni',
  [NewsletterContent.MARIOKART]: 'Mario Kart Track Review',
  [NewsletterContent.STITCH]: 'New Cross Stitch',
  [NewsletterContent.MIX]: 'New Mix',
  [NewsletterContent.CONCERT]: 'Concert Review',
  [NewsletterContent.KK]: 'KK Song Review',
  [NewsletterContent.CHARACTER_DECO]: 'Smash character decoration in my house',
  [NewsletterContent.DAILY_SOUNDTRACK]: 'Soundtrack of the day',
  [NewsletterContent.NINTENDO_PLAYLIST]: 'New Nintendo Playlist',
};

export function getNewsletterContentClass(type: NewsletterContent | string): string {
  return NEWSLETTER_CONTENT_CLASS_MAP[type] || 'entry';
}

export function getNewsletterContentName(type: NewsletterContent | string): string {
  return NEWSLETTER_CONTENT_NAME_MAP[type] || type;
}
