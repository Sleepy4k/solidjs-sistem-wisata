import Header from "@components/Header";
import LogoutModal from "@components/LogoutModal";
import Sidebar from "@components/Sidebar";
import { Auth } from "@contexts";
import { useNavigate } from "@solidjs/router";
import { onMount } from "solid-js";

interface IDashboardLayoutProp {
  title?: string;
  children: any;
}

export default function DashboardLayout(props: IDashboardLayoutProp) {
  const navigate = useNavigate();
  const { isLogged, checked, user, logoutUser } = Auth.useAuth();

  onMount(() => {
    if (checked() && !isLogged()) navigate("/login", { replace: true });
  });

  return checked() && isLogged() ? (
    <div class="min-h-screen bg-gray-50">
      <Sidebar
        userPermissions={user()?.permissions}
        userRole={user()?.role}
        userName={user()?.name}
        userEmail={user()?.email}
        isLoading={checked() && isLogged()}
      />
      <div class="lg:ml-64">
        <Header name={user()?.name} email={user()?.email} />
        <LogoutModal logoutHandler={logoutUser} />
        <main class="p-4 sm:p-6 lg:p-8">{props.children}</main>
      </div>
    </div>
  ) : null;
}
