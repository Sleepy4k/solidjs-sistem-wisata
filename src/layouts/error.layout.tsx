import { Meta } from "@contexts";
import { createEffect } from "solid-js";

interface IErrorLayoutProp {
  title?: string;
  children: any;
}

export default function ErrorLayout(props: IErrorLayoutProp) {
  const { changeTitle } = Meta.useMeta();

  createEffect(() => {
    if (props.title) changeTitle(props.title);
    else changeTitle();
  });

  return (
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
      <div class="text-center">{props.children}</div>
    </div>
  );
}
