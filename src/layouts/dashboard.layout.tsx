import Header from "@components/Header";
import Sidebar from "@components/Sidebar";
import { Auth, Meta } from "@contexts";
import { EDebugType } from "@enums";
import { api } from "@services";
import { useNavigate } from "@solidjs/router";
import { println } from "@utils";
import { createEffect, createSignal, onMount, Show } from "solid-js";

interface IDashboardLayoutProp {
  title?: string;
  children: any;
}

export default function DashboardLayout(props: IDashboardLayoutProp) {
  const navigate = useNavigate();
  const { isLogged, checked } = Auth.useAuth();
  const { changeTitle } = Meta.useMeta();
  const [sidebarData, setSidebarData] = createSignal<any[]>([]);

  onMount(() => {
    if (checked() && !isLogged()) navigate("/login", { replace: true });
  });

  createEffect(() => {
    if (props.title) changeTitle(props.title);
    else changeTitle();
  });

  createEffect(() => {
    const loadSidebarData = async () => {
      await api
        .get("/dashboard/sidebar")
        .then((response) => {
          setSidebarData(response.data.data);
        })
        .catch((error) => {
          println(
            "DashboardLayout",
            `Gagal memuat data sidebar: ${error.message}`,
            EDebugType.ERROR
          );
        });
    };

    loadSidebarData();
  });

  return checked() && isLogged() ? (
    <div id="mainContent" class="min-h-screen bg-gray-50">
      <Sidebar data={sidebarData()} />
      <div class="lg:ml-64">
        <Header />
        <main class="p-4 sm:p-6 lg:p-8">{props.children}</main>
      </div>
    </div>
  ) : null;
}
