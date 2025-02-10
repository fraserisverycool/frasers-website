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
    path: 'brexitsummit', loadComponent: () => import('./brexit/brexit.component')
  }
];
