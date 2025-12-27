import DataTable from "@components/DataTable";
import { Auth, Meta } from "@contexts";
import { useParams } from "@solidjs/router";
import { ucFirst, ucWords } from "@utils";
import { Component, createEffect } from "solid-js";

const Business: Component = () => {
  const { user } = Auth.useAuth();
  const { changeTitle } = Meta.useMeta();
  const params = useParams<{ role: string; slug?: string }>();

  createEffect(() => {
    changeTitle(
      `${ucFirst(params.role)}${
        params.slug ? ` - ${ucWords(params.slug)}` : ""
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
      <DataTable
        endpoint={`https://be-siswis.burunghantu.id/dashboard/${params.role}${
          params.slug ? `/${params.slug}` : ""
        }`}
      />
    </>
  );
};

export default Business;
