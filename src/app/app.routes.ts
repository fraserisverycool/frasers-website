import {Routes} from '@angular/router';

export const routes: Routes = [
  // Homepage & Brand
  {
    path: '',
    loadComponent: () => import('./homepage/homepage.component'),
    data: { title: 'Fraser\'s Website' }
  },
  {
    path: 'party',
    loadComponent: () => import('./homepage/party/party.component'),
    data: { title: 'Party - Fraser\'s Website' }
  },
  {
    path: 'changelog',
    loadComponent: () => import('./homepage/changelog-page/changelog-page.component'),
    data: { title: 'Changelog - Fraser\'s Website' }
  },
  {
    path: 'philosophy',
    loadComponent: () => import('./homepage/philosophy/philosophy.component'),
    data: { title: 'Philosophy - Fraser\'s Website' }
  },

  // Games domain
  {
    path: 'games',
    loadComponent: () => import('./games/games.component'),
    data: { title: 'Games - Fraser\'s Website' }
  },
  {
    path: 'games/next',
    loadComponent: () => import('./games/next/next-game.component'),
    data: { title: 'Games To Play - Fraser\'s Website\'' }
  },

  // Films domain
  {
    path: 'films',
    loadComponent: () => import('./films/films.component'),
    data: { title: 'Films - Fraser\'s Website' }
  },
  {
    path: 'films/next',
    loadComponent: () => import('./films/next/next-film.component'),
    data: { title: 'Films To Watch - Fraser\'s Website\'' }
  },

  // Books domain
  {
    path: 'books',
    loadComponent: () => import('./books/books.component'),
    data: { title: 'Books - Fraser\'s Website' }
  },

  // Music domain
  {
    path: 'music',
    loadComponent: () => import('./music/music.component'),
    data: { title: 'Music - Fraser\'s Website' }
  },
  {
    path: 'music/albums',
    loadComponent: () => import('./music/albums/albums.component'),
    data: { title: 'Albums - Fraser\'s Website' }
  },
  {
    path: 'music/spotify',
    loadComponent: () => import('./music/spotify/spotify.component'),
    data: { title: 'Spotify Playlists - Fraser\'s Website' }
  },
  {
    path: 'music/nintendo',
    loadComponent: () => import('./music/nintendo/soundtracks.component'),
    data: { title: 'Nintendo Soundtracks - Fraser\'s Website' }
  },
  {
    path: 'music/nintendo/playlists',
    loadComponent: () => import('./music/nintendo/playlists/nintendo-playlists.component'),
    data: { title: 'Nintendo Playlists - Fraser\'s Website' }
  },
  {
    path: 'music/nintendo/kk',
    loadComponent: () => import('./music/nintendo/kk/kk.component'),
    data: { title: 'KK Songs - Fraser\'s Website' }
  },
  {
    path: 'music/concerts',
    loadComponent: () => import('./music/concerts/concerts.component'),
    data: { title: 'Concerts - Fraser\'s Website' }
  },
  {
    path: 'music/mixes',
    loadComponent: () => import('./music/mixes/mixes.component'),
    data: { title: 'Video Game Mixes - Fraser\'s Website' }
  },
  {
    path: 'music/playlists',
    loadComponent: () => import('./music/playlists/playlists.component'),
    data: { title: 'Playlists - Fraser\'s Website' }
  },
  {
    path: 'music/cds',
    loadComponent: () => import('./music/cds/cds.component'),
    data: { title: 'CDs - Fraser\'s Website' }
  },
  {
    path: 'music/daily-soundtracks',
    loadComponent: () => import('./music/daily/dailies/dailies.component'),
    data: { title: 'Daily Soundtracks - Fraser\'s Website' }
  },
  {
    path: 'music/worldpeace',
    loadComponent: () => import('./music/worldpeace/worldpeace.component'),
    data: { title: 'DJ World Peace - Fraser\'s Website' }
  },
  {
    path: 'music/smash',
    loadComponent: () => import('./music/smash/smash.component'),
    data: { title: 'Super Smash Bros. Soundtrack - Fraser\'s Website' }
  },
  {
    path: 'music/smash/about',
    loadComponent: () => import('./music/smash/about/about.component'),
    data: { title: 'Super Smash Bros. Soundtrack - Fraser\'s Website' }
  },

  // Gallery domain
  {
    path: 'gallery',
    loadComponent: () => import('./gallery/photos.component'),
    data: { title: 'Music - Fraser\'s Website' }
  },
  {
    path: 'gallery/videos',
    loadComponent: () => import('./gallery/videos/videos.component'),
    data: { title: 'Videos - Fraser\'s Website' }
  },

  // Community domain
  {
    path: 'community',
    loadComponent: () => import('./community/community.component'),
    data: { title: 'Community - Fraser\'s Website' }
  },
  {
    path: 'community/durstloescher',
    loadComponent: () => import('./community/durstloescher/durstloescher.component'),
    data: { title: 'Durstlöscher - Fraser\'s Website' }
  },
  {
    path: 'community/game-of-life',
    loadComponent: () => import('./community/game-of-life/game-of-life.component'),
    data: { title: 'Game of Life - Fraser\'s Website' }
  },

  // Miscellaneous domain
  {
    path: 'misc',
    loadComponent: () => import('./misc/misc.component'),
    data: { title: 'Miscellaneous - Fraser\'s Website' }
  },
  {
    path: 'misc/brexitsummit',
    loadComponent: () => import('./misc/brexit/brexit.component'),
    data: { title: 'BREXIT SUMMIT - Fraser\'s Website' }
  },
  {
    path: 'misc/characters',
    loadComponent: () => import('./misc/characters/characters.component'),
    data: { title: 'Smash Characters - Fraser\'s Website' }
  },
  {
    path: 'misc/mariokart',
    loadComponent: () => import('./misc/mariokart/mariokart.component'),
    data: { title: 'Music - Fraser\'s Website' }
  },
  {
    path: 'misc/stitch',
    loadComponent: () => import('./misc/stitch/stitch.component'),
    data: { title: 'Cross Stitches - Fraser\'s Website' }
  },
  {
    path: 'misc/writing',
    loadComponent: () => import('./misc/writing/writing.component'),
    data: { title: 'Old Posts - Fraser\'s Website' }
  },
  {
    path: 'misc/pokemon',
    loadComponent: () => import('./misc/pokemon/pokemon.component'),
    data: { title: 'Pokemon Ranking - Fraser\'s Website' }
  },
  {
    path: 'misc/back-to-brightwell',
    loadComponent: () => import('./misc/brightwell/brightwell.component'),
    data: { title: 'Back to Brightwell - Fraser\'s Website' }
  },
  {
    path: 'misc/back-to-brightwell/stats',
    loadComponent: () => import('./misc/brightwell/brightwell-stats/brightwell-stats.component'),
    data: { title: 'Back to Brightwell Stats - Fraser\'s Website' }
  },

  // Guestbook
  {
    path: 'guestbook',
    loadComponent: () => import('./guestbook/guestbook.component'),
    data: { title: 'Guestbook - Fraser\'s Website' }
  },

  // Newsletter
  {
    path: 'newsletter',
    loadComponent: () => import('./newsletter/newsletters.component'),
    data: { title: 'Newsletters - Fraser\'s Website' }
  },
  {
    path: 'newsletter/:timestamp',
    loadComponent: () => import('./newsletter/newsletter/newsletter.component'),
    data: { title: 'Newsletter - Fraser\'s Website' }
  },

  // Contact
  {
    path: 'contact',
    loadComponent: () => import('./contact/contact.component'),
    data: { title: 'Contact - Fraser\'s Website' }
  },
];
