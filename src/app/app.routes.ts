import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '', loadComponent: () => import('./homepage/homepage.component')
  },
  {
    path: 'games', loadComponent: () => import('./games/games.component')
  },
  {
    path: 'games/2025', loadComponent: () => import('./games/five/five.component')
  },
  {
    path: 'games/2024', loadComponent: () => import('./games/four/four.component')
  },
  {
    path: 'games/2023', loadComponent: () => import('./games/three/three.component')
  },
  {
    path: 'games/2022', loadComponent: () => import('./games/two/two.component')
  },
  {
    path: 'games/2021', loadComponent: () => import('./games/one/one.component')
  },
  {
    path: 'games/2020', loadComponent: () => import('./games/zero/zero.component')
  },
  {
    path: 'films', loadComponent: () => import('./films/films.component')
  },
  {
    path: 'films/2025', loadComponent: () => import('./films/five/five.component')
  },
  {
    path: 'films/2024', loadComponent: () => import('./films/four/four.component')
  },
  {
    path: 'films/2023', loadComponent: () => import('./films/three/three.component')
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
    path: 'smash', loadComponent: () => import('./smash/smash.component')
  },
  {
    path: 'smash/brexitsummit', loadComponent: () => import('./smash/brexit/brexit.component')
  }
];
