import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () =>
      import('./home/home.page').then(m => m.HomePage),
  },
  {
    path: 'authorization',
    loadComponent: () =>
      import('./authorization/authorization.page').then(m => m.AuthorizationPage),
  },
  {
    path: 'posten',
    loadComponent: () =>
      import('./posten/posten.page').then(m => m.PostenPage),
  },
  {
    path: 'posten1',
    loadComponent: () =>
      import('./posten/posten1/posten1.page').then(m => m.Posten1Page),
  },
  {
    path: 'posten2',
    loadComponent: () =>
      import('./posten/posten2/posten2.page').then(m => m.Posten2Page),
  },
  {
    path: 'posten3',
    loadComponent: () =>
      import('./posten/posten3/posten3.page').then(m => m.Posten3Page),
  },
  {
    path: 'posten4',
    loadComponent: () =>
      import('./posten/posten4/posten4.page').then(m => m.Posten4Page),
  },
  {
    path: 'posten5',
    loadComponent: () =>
      import('./posten/posten5/posten5.page').then(m => m.Posten5Page),
  },
  {
    path: 'posten6',
    loadComponent: () =>
      import('./posten/posten6/posten6.page').then(m => m.Posten6Page),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
