import {
  faBuilding,
  faChartLine,
  faPlusCircle,
  faShop,
  faStore,
} from "@fortawesome/free-solid-svg-icons";
import { getSidebarItems } from "@services";
import { A } from "@solidjs/router";
import { firstChar, toSlug } from "@utils";
import Fa from "solid-fa";
import { createResource, For, onCleanup, onMount, Show } from "solid-js";

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
  isLoading?: boolean;
}

const generateIcon = (index: number) => {
  const icons = [faStore, faBuilding, faShop];
  return icons[index % icons.length];
};

export default function Sidebar(props: ISidebarProp) {
  const [sidebarData, _] = createResource(
    () => props.isLoading,
    getSidebarItems
  );

  const hasPermission = (sidebar: IMenuItem): boolean => {
    if (!sidebar.meta?.permissions) {
      return true;
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
      toSlug(sidebar.name)
    );
  };

  const handleOverlayClick = (overlay: HTMLDivElement) => {
    const sidebar = document.getElementById("sidebar") as HTMLDivElement;

    if (sidebar) {
      sidebar.classList.add("-translate-x-full");
      overlay.classList.add("hidden");
      document.body.classList.remove("overflow-hidden");
    }
  };

  onMount(() => {
    const overlay = document.getElementById(
      "sidebar-overlay"
    ) as HTMLDivElement;

    if (overlay) {
      overlay.addEventListener("click", () => handleOverlayClick(overlay));
    }

    onCleanup(() => {
      if (overlay) {
        overlay.removeEventListener("click", () => handleOverlayClick(overlay));
      }
    });
  });

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
              inactiveClass="text-gray-700 hover:bg-gray-100 hover:text-blue-700"
              activeClass="bg-blue-600 text-white shadow-lg hover:text-blue-700"
              end
            >
              <Fa icon={faChartLine} class="w-5 h-5" />
              <span>Dashboard</span>
            </A>

            <Show
              when={sidebarData()}
              fallback={
                <>
                  <div class="my-4">
                    <div class="border-t border-gray-300"></div>
                    <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 mt-2">
                      <div class="w-24 h-4 bg-gray-200 animate-pulse rounded-md"></div>
                    </h3>
                  </div>
                  <div class="px-4 py-3 rounded-xl bg-gray-200 animate-pulse h-10"></div>
                  <div class="px-4 py-3 rounded-xl bg-gray-200 animate-pulse h-10"></div>
                  <div class="px-4 py-3 rounded-xl bg-gray-200 animate-pulse h-10"></div>
                  <div class="px-4 py-3 rounded-xl bg-gray-200 animate-pulse h-10"></div>
                  <div class="px-4 py-3 rounded-xl bg-gray-200 animate-pulse h-10"></div>
                  <div class="px-4 py-3 rounded-xl bg-gray-200 animate-pulse h-10"></div>
                  <div class="my-4">
                    <div class="border-t border-gray-300"></div>
                    <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 mt-2">
                      <div class="w-24 h-4 bg-gray-200 animate-pulse rounded-md"></div>
                    </h3>
                  </div>
                  <div class="px-4 py-3 rounded-xl bg-gray-200 animate-pulse h-10"></div>
                  <div class="px-4 py-3 rounded-xl bg-gray-200 animate-pulse h-10"></div>
                  <div class="px-4 py-3 rounded-xl bg-gray-200 animate-pulse h-10"></div>
                </>
              }
            >
              <For each={sidebarData()}>
                {(item, index) => (
                  <Show
                    when={!item.is_spacer}
                    fallback={
                      <Show when={hasPermission(item)}>
                        <div class="my-4">
                          <div class="border-t border-gray-300"></div>
                          <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 mt-2">
                            {item.name}
                          </h3>
                        </div>
                      </Show>
                    }
                  >
                    <Show when={hasPermission(item)}>
                      <A
                        href={`${
                          item.is_datatable
                            ? `/usaha/${getMenuRole(item)}/${toSlug(item.name)}`
                            : `/tambah-usaha/${getMenuRole(item)}`
                        }`}
                        class="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-700 hover:bg-blue-100 transition-all duration-200 group cursor-pointer"
                        inactiveClass="text-gray-700 hover:bg-gray-100 hover:text-blue-700"
                        activeClass="bg-blue-600 text-white shadow-lg hover:text-blue-700"
                        title={item.name}
                      >
                        <Show
                          when={item.is_datatable}
                          fallback={<Fa icon={faPlusCircle} class="w-5 h-5" />}
                        >
                          <Fa icon={generateIcon(index())} class="w-5 h-5" />
                        </Show>
                        <span>{item.name}</span>
                      </A>
                    </Show>
                  </Show>
                )}
              </For>
            </Show>
          </div>
        </nav>

        <div class="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
          <div class="flex items-center gap-3 mb-3">
            <div
              class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
              id="user-avatar"
            >
              <span class="text-white text-sm font-medium">
                {firstChar(props.userName || "A", true)}
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
        class="fixed inset-0 bg-transparent z-30 lg:hidden hidden transition-opacity duration-300 backdrop-blur-sm"
        id="sidebar-overlay"
      ></div>
    </>
  );
}
