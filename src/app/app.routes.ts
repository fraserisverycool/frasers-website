import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '', loadComponent: () => import('./homepage/homepage.component')
  },
  {
    path: 'party', loadComponent: () => import('./homepage/party/party.component')
  },
  {
    path: 'changelog', loadComponent: () => import('./homepage/changelog-page/changelog-page.component')
  },
  {
    path: 'games', loadComponent: () => import('./games/games.component')
  },
  {
    path: 'games/next', loadComponent: () => import('./games/next/next.component')
  },
  {
    path: 'films', loadComponent: () => import('./films/films.component')
  },
  {
    path: 'films/next', loadComponent: () => import('./films/next/next.component')
  },
  {
    path: 'music', loadComponent: () => import('./music/music.component')
  },
  {
    path: 'music/albums', loadComponent: () => import('./music/albums/albums.component')
  },
  {
    path: 'music/spotify', loadComponent: () => import('./music/spotify/spotify.component')
  },
  {
    path: 'music/nintendo', loadComponent: () => import('./music/nintendo/nintendo.component')
  },
  {
    path: 'music/nintendo/kk', loadComponent: () => import('./music/nintendo/kk/kk.component')
  },
  {
    path: 'music/mixes', loadComponent: () => import('./music/mixes/mixes.component')
  },
  {
    path: 'music/cds', loadComponent: () => import('./music/cds/cds.component')
  },
  {
    path: 'music/worldpeace', loadComponent: () => import('./music/worldpeace/worldpeace.component')
  },
  {
    path: 'gallery', loadComponent: () => import('./gallery/gallery.component')
  },
  {
    path: 'gallery/videos', loadComponent: () => import('./gallery/videos/videos.component')
  },
  {
    path: 'community', loadComponent: () => import('./community/community.component')
  },
  {
    path: 'community/durstloescher', loadComponent: () => import('./community/durstloescher/durstloescher.component')
  },
  {
    path: 'community/game-of-life', loadComponent: () => import('./community/game-of-life/game-of-life.component')
  },
  {
    path: 'misc', loadComponent: () => import('./misc/misc.component')
  },
  {
    path: 'misc/brexitsummit', loadComponent: () => import('./misc/brexit/brexit.component')
  },
  {
    path: 'misc/characters', loadComponent: () => import('./misc/characters/characters.component')
  },
  {
    path: 'misc/mariokart', loadComponent: () => import('./misc/mariokart/mariokart.component')
  },
  {
    path: 'guestbook', loadComponent: () => import('./guestbook/guestbook.component')
  }
];
