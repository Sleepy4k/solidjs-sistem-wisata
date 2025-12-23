import { For, Show } from "solid-js";

interface IMenuItem {
  id?: number;
  name: string;
  slug: string;
  is_spacer?: boolean;
  is_datatable?: boolean;
  order: number;
  badge?: string;
  meta?: {
    route?: string;
    icon?: string;
    permissions?: string[];
  };
  roles?: string[];
}

interface ISidebarProp {
  data: IMenuItem[];
}

export default function Sidebar(props: ISidebarProp) {
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
              <h1 class="text-lg font-bold text-gray-900">
                Admin Panel
              </h1>
              <p
                class="text-sm text-gray-500"
                id="user-role-display"
              >
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
            <a
              href="/"
              class="sidebar-item flex items-center gap-3 px-4 py-3 rounded-xl text-blue-700 hover:bg-blue-100 transition-all duration-200 group"
              data-active-class="bg-blue-600 text-white shadow-lg"
            >
              <i class="fas fa-chart-line w-5 h-5"></i>
              <span>Dashboard</span>
            </a>

            <Show when={props.data.length > 0} fallback={
              <div
              id="sidebar-loader"
              class="flex items-center justify-center py-8"
            >
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            }>
              <div>
              <For each={props.data}>{(item) => (
                <Show when={!item.is_spacer} fallback={
                  <div class="border-t border-gray-200 my-2"></div>
                }>
                  <a
                    href={item.meta?.route || "#"}
                    class="sidebar-item flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-all duration-200 group"
                    data-active-class="bg-blue-600 text-white shadow-lg"
                  >
                    <i class={item.meta?.icon + " w-5 h-5"}></i>
                    <span>{item.name}</span>
                    <Show when={item.badge}>
                      <span class="ml-auto inline-block px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-800 rounded-full">
                        {item.badge}
                      </span>
                    </Show>
                  </a>
                </Show>
              )}</For>
              </div>
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
              <span class="text-white text-sm font-medium">A</span>
            </div>
            <div class="flex-1">
              <p
                class="text-sm font-medium text-gray-900"
                id="user-name-display"
              >
                Admin
              </p>
              <p
                class="text-xs text-gray-500"
                id="user-role-bottom"
              >
                Administrator
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
