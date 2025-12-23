import { Auth, Meta } from "@contexts";
import { useNavigate } from "@solidjs/router";
import { createEffect, onMount } from "solid-js";

interface IDashboardLayoutProp {
  title?: string;
  children: any;
}

export default function DashboardLayout(props: IDashboardLayoutProp) {
  const navigate = useNavigate();
  const { isLogged } = Auth.useAuth();
  const { changeTitle } = Meta.useMeta();

  onMount(() => {
    if (!isLogged()) navigate("/", { replace: true });
  });

  createEffect(() => {
    if (props.title) changeTitle(props.title);
    else changeTitle();
  });

  return (
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
      <div class="text-center">
        {props.children}
      </div>
    </div>
  );
}
