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
            <div class="flex justify-center items-center h-screen">
              <span class="loading loading-ring loading-lg h-32 w-32 border-t-2 border-b-2" />
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
