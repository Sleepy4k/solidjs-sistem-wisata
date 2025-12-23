import { Meta } from "@contexts";
import { createEffect } from "solid-js";

interface IAuthLayoutProp {
  title?: string;
  children: any;
}

export default function AuthLayout(props: IAuthLayoutProp) {
  const { changeTitle } = Meta.useMeta();

  createEffect(() => {
    if (props.title) changeTitle(props.title);
    else changeTitle();
  });

  return (
    <>
      <div class="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        {props.children}
      </div>
    </>
  );
}
