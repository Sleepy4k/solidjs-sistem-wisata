import { Suspense, type Component } from "solid-js";
import { Auth, Meta } from "@contexts";
import { Route, Router, RouteSectionProps } from "@solidjs/router";
import { AuthLayout, DashboardLayout } from "@layouts";
import { guestRoutes, notfoundRoute, protectedRoutes } from "./routes";

const DashboardWrapper = (props: RouteSectionProps) => {
  return <DashboardLayout>{props.children}</DashboardLayout>;
};

const AuthWrapper = (props: RouteSectionProps) => {
  return <AuthLayout>{props.children}</AuthLayout>;
};

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
      <Route component={DashboardWrapper}>
        {protectedRoutes.map((route) => (
          <Route path={route.path} component={route.component} />
        ))}
      </Route>
      <Route component={AuthWrapper}>
        {guestRoutes.map((route) => (
          <Route path={route.path} component={route.component} />
        ))}
      </Route>
      <Route path={notfoundRoute.path} component={notfoundRoute.component} />
    </Router>
  );
};

export default App;
