import { A } from "@solidjs/router";
import { Component } from "solid-js";

const NotFound: Component = () => {
  return (
    <>
      <h1 class="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p class="text-2xl font-semibold text-gray-600 mb-4">Page Not Found</p>
      <p class="text-gray-500 mb-8">
        Sorry, the page you're looking for doesn't exist.
      </p>
      <A
        href="/"
        class="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
      >
        Go Home
      </A>
    </>
  );
};

export default NotFound;
