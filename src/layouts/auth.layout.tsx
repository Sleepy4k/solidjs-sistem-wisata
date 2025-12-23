import { Auth } from "@contexts";
import { useNavigate } from "@solidjs/router";
import { onMount } from "solid-js";

interface IAuthLayoutProp {
  title?: string;
  children: any;
}

export default function AuthLayout(props: IAuthLayoutProp) {
  const navigate = useNavigate();
  const { isLogged, checked } = Auth.useAuth();

  onMount(() => {
    if (checked() && isLogged()) navigate("/", { replace: true });
  });

  return checked() && !isLogged() ? (
    <div class="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {props.children}
    </div>
  ) : null;
}
