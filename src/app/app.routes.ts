import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '', loadComponent: () => import('./home/home.component')
  },
  {
    path: '2023', loadComponent: () => import('./about/about.component')
  },
  {
    path: '2022', loadComponent: () => import('./todos/todos.component')
  },
  {
    path: '2021', loadComponent: () => import('./bananas/bananas.component')
  },
  {
    path: '2020', loadComponent: () => import('./oranges/oranges.component')
  },
  {
    path: 'brexitsummit', loadComponent: () => import('./brexit/brexit.component')
  }
];
