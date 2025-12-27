import { createEffect } from "solid-js";
import { useIsRouting } from "@solidjs/router";
import NProgress from "nprogress";
import "@assets/styles/nprogress.css";

NProgress.configure({
  easing: "ease",
  speed: 500,
  trickle: true,
  trickleSpeed: 200,
  showSpinner: false,
});

export default function TopLoader() {
  const isRouting = useIsRouting();

  createEffect(() => {
    if (isRouting()) {
      NProgress.start();
    } else {
      NProgress.done();
    }
  });

  return null;
}
