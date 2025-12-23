import { Auth } from "@contexts";
import { DashboardLayout } from "@layouts";
import { Component } from "solid-js";

const Home: Component = () => {
  const { user } = Auth.useAuth();

  return (
    <DashboardLayout>
      <h1 class="text-3xl font-bold mb-4">Selamat Datang, {user()?.name}!</h1>
      <p class="text-lg">Ini adalah halaman dashboard utama.</p>
    </DashboardLayout>
  );
};

export default Home;
