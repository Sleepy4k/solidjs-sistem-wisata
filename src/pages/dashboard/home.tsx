import { DashboardLayout } from "@layouts";
import { Component } from "solid-js";

const Home: Component = () => {
  return (
    <DashboardLayout title="Not Found">
      <h1 class="text-6xl font-bold text-gray-800 mb-4">404</h1>
    </DashboardLayout>
  );
};

export default Home;
