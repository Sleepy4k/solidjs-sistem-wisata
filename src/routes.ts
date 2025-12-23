import { lazy } from 'solid-js';
import type { RouteDefinition } from '@solidjs/router';

export const routes: RouteDefinition[] = [
  {
    path: '/',
    component: lazy(() => import('@pages/dashboard/home')),
  },
  {
    path: '/login',
    component: lazy(() => import('@pages/auth/login')),
  },
  {
    path: '/*all',
    component: lazy(() => import('@pages/error/notfound'))
  }
];