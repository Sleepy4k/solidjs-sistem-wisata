import { Auth, Meta } from "@contexts";
import { Component, onMount } from "solid-js";

const Home: Component = () => {
  const { user } = Auth.useAuth();
  const { changeTitle } = Meta.useMeta();

  onMount(() => {
    changeTitle("Dashboard");
  });

  return (
    <>
      <h1 class="text-3xl font-bold mb-4">Selamat Datang, {user()?.name}!</h1>
      <p class="text-lg">Ini adalah halaman dashboard utama.</p>
    </>
  );
};

export default Home;
