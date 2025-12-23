import Header from "@components/Header";
import LogoutModal from "@components/LogoutModal";
import Sidebar from "@components/Sidebar";
import { Auth } from "@contexts";
import { EDebugType } from "@enums";
import { api } from "@services";
import { useNavigate } from "@solidjs/router";
import { println } from "@utils";
import { createSignal, onMount } from "solid-js";

interface IDashboardLayoutProp {
  title?: string;
  children: any;
}

export default function DashboardLayout(props: IDashboardLayoutProp) {
  const navigate = useNavigate();
  const { isLogged, checked, user, logoutUser } = Auth.useAuth();
  const [sidebarData, setSidebarData] = createSignal([]);

  onMount(() => {
    if (checked() && !isLogged()) navigate("/login", { replace: true });
  });

  onMount(() => {
    if (checked() && !isLogged()) return;

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
      <Sidebar
        userPermissions={user()?.permissions}
        userRole={user()?.role}
        userName={user()?.name}
        userEmail={user()?.email}
        sidebarData={sidebarData()}
      />
      <div class="lg:ml-64">
        <Header name={user()?.name} email={user()?.email} />
        <LogoutModal logoutHandler={logoutUser} />
        <main class="p-4 sm:p-6 lg:p-8">{props.children}</main>
      </div>
    </div>
  ) : null;
}
