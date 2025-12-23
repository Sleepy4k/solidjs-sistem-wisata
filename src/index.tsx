/* @refresh reload */
import "@assets/styles/globals.css";
import { render } from 'solid-js/web';
import 'solid-devtools';

import '@fortawesome/fontawesome-free/css/all.min.css';
import '@fortawesome/fontawesome-free/js/fontawesome.min.js';
import "@fortawesome/fontawesome-free/js/brands.min.js";
import "@fortawesome/fontawesome-free/js/solid.min.js";

import App from './App';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

render(() => <App />, root!);

