import { type Component } from "solid-js";
import { Auth, Meta } from "@contexts";
import { Route, Router, RouteSectionProps } from "@solidjs/router";
import { AuthLayout, DashboardLayout, ErrorLayout } from "@layouts";
import { guestRoutes, notfoundRoute, protectedRoutes } from "./routes";
import TopLoader from "@components/TopLoader";

const DashboardWrapper = (props: RouteSectionProps) => {
  return <DashboardLayout>{props.children}</DashboardLayout>;
};

const AuthWrapper = (props: RouteSectionProps) => {
  return <AuthLayout>{props.children}</AuthLayout>;
};

const ErrorWrapper = (props: RouteSectionProps) => {
  return <ErrorLayout title="Not Found">{props.children}</ErrorLayout>;
};

const App: Component = () => {
  return (
    <Router
      root={(props) => (
        <Meta.MetaProvider>
          <Auth.AuthProvider>
            <>
              <TopLoader />
              {props.children}
            </>
          </Auth.AuthProvider>
        </Meta.MetaProvider>
      )}
    >
      <Route component={ErrorWrapper}>
        <Route path={notfoundRoute.path} component={notfoundRoute.component} />
      </Route>
      <Route component={AuthWrapper}>
        {guestRoutes.map((route) => (
          <Route path={route.path} component={route.component} />
        ))}
      </Route>
      <Route component={DashboardWrapper}>
        {protectedRoutes.map((route) => (
          <Route path={route.path} component={route.component} />
        ))}
      </Route>
    </Router>
  );
};

export default App;
