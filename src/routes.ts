import { lazy } from "solid-js";
import type { RouteDefinition } from "@solidjs/router";

export const protectedRoutes: RouteDefinition[] = [
  {
    path: "/",
    component: lazy(() => import("@pages/dashboard/home")),
  },
  {
    path: "/usaha/:role/:slug",
    component: lazy(() => import("@pages/dashboard/business")),
  },
  {
    path: "/profile",
    component: lazy(() => import("@pages/dashboard/profile/home")),
  },
  {
    path: "/profile/edit",
    component: lazy(() => import("@pages/dashboard/profile/edit")),
  },
];

export const guestRoutes: RouteDefinition[] = [
  {
    path: "/login",
    component: lazy(() => import("@pages/auth/login")),
  },
];

export const notfoundRoute: RouteDefinition = {
  path: "/*all",
  component: lazy(() => import("@pages/error/notfound")),
};
