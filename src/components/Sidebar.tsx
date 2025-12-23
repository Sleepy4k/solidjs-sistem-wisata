import { A } from "@solidjs/router";
import { For, Show } from "solid-js";

interface IMenuItem {
  id?: number;
  name: string;
  slug: string;
  is_spacer?: boolean;
  is_datatable?: boolean;
  order: number;
  meta?: {
    route?: string;
    icon?: string;
    permissions?: string[];
  };
  roles?: string[];
}

interface ISidebarProp {
  userRole?: string;
  userPermissions?: string[];
  userName?: string;
  userEmail?: string;
  sidebarData: IMenuItem[];
}

export default function Sidebar(props: ISidebarProp) {
  const hasPermission = (sidebar: IMenuItem): boolean => {
    if (!sidebar.meta?.permissions || !sidebar.roles) {
      return true;
    }

    if (sidebar.roles && sidebar.roles.length > 0) {
      if (!props.userRole || !sidebar.roles.includes(props.userRole)) {
        return false;
      }
    }

    if (sidebar.meta?.permissions && sidebar.meta.permissions.length > 0) {
      if (!props.userPermissions) return false;

      const hasPermission = sidebar.meta.permissions.some((perm) =>
        props.userPermissions?.includes(perm)
      );

      if (!hasPermission) return false;
    }

    return true;
  };

  const getMenuRole = (sidebar: IMenuItem): string => {
    return (
      sidebar.meta?.route?.split("/")[4] ||
      sidebar.name.toLowerCase().replace(/\s+/g, "-")
    );
  };

  return (
    <>
      <aside
        class="w-64 bg-white h-screen fixed left-0 top-0 shadow-lg border-r border-gray-200 z-40 transform -translate-x-full lg:translate-x-0 transition-all duration-300 ease-in-out flex flex-col"
        id="sidebar"
      >
        <div class="p-6 border-b border-gray-200 flex-shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg
                class="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                ></path>
              </svg>
            </div>
            <div>
              <h1 class="text-lg font-bold text-gray-900">Admin Panel</h1>
              <p class="text-sm text-gray-500" id="user-role-display">
                Sistem Wisata
              </p>
            </div>
          </div>
        </div>

        <nav
          class="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400"
          id="sidebar-nav"
        >
          <div class="p-4 space-y-2">
            <A
              href="/"
              class="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-700 hover:bg-blue-100 transition-all duration-200 group cursor-pointer"
              inactiveClass=""
              activeClass="bg-blue-600 text-white shadow-lg"
              end
            >
              <i class="fas fa-chart-line w-5 h-5"></i>
              <span>Dashboard</span>
            </A>

            <Show
              when={props.sidebarData.length > 0}
              fallback={
                <div class="flex items-center justify-center py-8">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              }
            >
              <For each={props.sidebarData}>
                {(item) => (
                  <Show
                    when={!item.is_spacer}
                    fallback={
                      <div class="my-4">
                        <div class="border-t border-gray-300"></div>
                        <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 mt-2">
                          {item.name}
                        </h3>
                      </div>
                    }
                  >
                    <Show when={hasPermission(item)}>
                      <A
                        href={`${
                          item.is_datatable
                            ? `/usaha/${getMenuRole(item)}/${item.name
                                .toLowerCase()
                                .replace(/\s+/g, "-")}`
                            : `/tambah-usaha/${getMenuRole(item)}`
                        }`}
                        class="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-700 hover:bg-blue-100 transition-all duration-200 group cursor-pointer"
                        inactiveClass="text-gray-700 hover:bg-gray-100"
                        activeClass="bg-blue-600 text-white shadow-lg"
                        title={item.name}
                      >
                        <i
                          class={`fas fa-${
                            item.meta?.icon || "folder"
                          } w-5 h-5`}
                        ></i>
                        <span>{item.name}</span>
                      </A>
                    </Show>
                  </Show>
                )}
              </For>
            </Show>

            <div id="sidebar-error" class="hidden p-4 text-center">
              <div class="text-red-500 mb-2">
                <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
                <p class="text-sm">Gagal memuat menu</p>
                <button class="mt-2 px-3 py-1 text-xs bg-red-100 text-red-600 rounded-md hover:bg-red-200">
                  <i class="fas fa-redo-alt mr-1"></i>
                  Coba Lagi
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div class="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
          <div class="flex items-center gap-3 mb-3">
            <div
              class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
              id="user-avatar"
            >
              <span class="text-white text-sm font-medium">
                {props.userName ? props.userName.charAt(0).toUpperCase() : "A"}
              </span>
            </div>
            <div class="flex-1">
              <p
                class="text-sm font-medium text-gray-900"
                id="user-name-display"
              >
                {props.userName || "Admin"}
              </p>
              <p class="text-xs text-gray-500" id="user-role-bottom">
                {props.userEmail || "admin@gmail.com"}
              </p>
            </div>
          </div>
        </div>
      </aside>

      <div
        class="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden hidden transition-opacity duration-300"
        id="sidebar-overlay"
      ></div>
    </>
  );
}
