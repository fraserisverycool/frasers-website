import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '', loadComponent: () => import('./homepage/homepage.component')
  },
  {
    path: 'party', loadComponent: () => import('./homepage/party/party.component')
  },
  {
    path: 'changelog', loadComponent: () => import('./homepage/changelog/changelog.component')
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
    path: 'links', loadComponent: () => import('./links/links.component')
  },
  {
    path: 'links/durstloescher', loadComponent: () => import('./links/durstloescher/durstloescher.component')
  },
  {
    path: 'smash', loadComponent: () => import('./smash/smash.component')
  },
  {
    path: 'smash/brexitsummit', loadComponent: () => import('./smash/brexit/brexit.component')
  },
  {
    path: 'smash/mariokart', loadComponent: () => import('./smash/mariokart/mariokart.component')
  },
  {
    path: 'guestbook', loadComponent: () => import('./guestbook/guestbook.component')
  }
];
