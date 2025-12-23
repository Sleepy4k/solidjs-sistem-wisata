import { Auth, Meta } from "@contexts";
import { useNavigate } from "@solidjs/router";
import { createEffect, onMount, Show } from "solid-js";

interface IAuthLayoutProp {
  title?: string;
  children: any;
}

export default function AuthLayout(props: IAuthLayoutProp) {
  const navigate = useNavigate();
  const { isLogged, checked } = Auth.useAuth();
  const { changeTitle } = Meta.useMeta();

  onMount(() => {
    if (checked() && isLogged()) navigate("/", { replace: true });
  });

  createEffect(() => {
    if (props.title) changeTitle(props.title);
    else changeTitle();
  });

  return checked() && !isLogged() ? (
    <div class="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {props.children}
    </div>
  ) : null;
}
