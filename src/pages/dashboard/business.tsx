import { Auth, Meta } from "@contexts";
import { useParams } from "@solidjs/router";
import { Component, createEffect } from "solid-js";

const ucfirst = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
const ucwords = (str: string) =>
  str
    .replace(/-/g, " ")
    .toLowerCase()
    .split(" ")
    .map((word) => ucfirst(word))
    .join(" ");

const Business: Component = () => {
  const { user } = Auth.useAuth();
  const { changeTitle } = Meta.useMeta();
  const params = useParams<{ role: string; slug?: string }>();

  createEffect(() => {
    changeTitle(
      `${ucfirst(params.role)}${
        params.slug ? ` - ${ucwords(params.slug)}` : ""
      }`
    );
  });

  return (
    <>
      <h1 class="text-3xl font-bold mb-4">
        Halaman Usaha: {params.role}
        {params.slug ? ` - ${params.slug}` : ""}
      </h1>
      <p class="text-lg">
        Halo, {user()?.name}! Ini adalah halaman untuk usaha dengan peran{" "}
        {params.role}
        {params.slug ? ` dan slug ${params.slug}` : ""}.
      </p>
    </>
  );
};

export default Business;
