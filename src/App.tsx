import { Suspense, type Component } from "solid-js";
import { Auth, Meta } from "@contexts";
import { Router } from "@solidjs/router";
import { routes } from "./routes";

const App: Component = () => {
  return (
    <Router
      root={(props) => (
        <Suspense
          fallback={
            <div class="flex justify-center items-center h-screen bg-gray-100">
              <div class="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          }
        >
          <Meta.MetaProvider>
            <Auth.AuthProvider>{props.children}</Auth.AuthProvider>
          </Meta.MetaProvider>
        </Suspense>
      )}
    >
      {routes}
    </Router>
  );
};

export default App;
