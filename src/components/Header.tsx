import { createEffect, createSignal } from "solid-js";

export default function Header() {
  let currentDate: string = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  createEffect(() => {
    const interval = setInterval(() => {
      currentDate = new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }, 60000);

    return () => clearInterval(interval);
  });

  return (
    <header class="lg:sticky top-0 z-30 bg-gray-50">
      <div class="bg-white border-b border-gray-200 shadow-sm">
        <div class="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <button class="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </button>

            {/* {showBreadcrumb && (
          <nav class="flex items-center text-sm text-gray-500">
            <a href="/" class="hover:text-gray-700 transition-colors">Dashboard</a>
            <svg class="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
            <span class="text-gray-900">{title}</span>
          </nav>
        )} */}
          </div>

          <div class="flex items-center gap-3">
            <div class="hidden sm:flex items-center gap-2 text-sm text-gray-700 bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg">
              <svg
                class="w-4 h-4 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 
                  00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
              <span class="font-medium">{currentDate}</span>
            </div>

            <div class="relative bg-gray-50 border border-gray-200 rounded-lg p-1">
              <button class="flex items-center gap-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-md transition-all duration-200">
                <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span class="text-white text-sm font-medium">A</span>
                </div>
              </button>

              <div
                class="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 hidden"
                id="profile-dropdown"
              >
                <div class="px-4 py-2 border-b border-gray-100">
                  <p class="text-sm font-medium text-gray-900" id="user-name">
                    Admin
                  </p>
                  <p class="text-xs text-gray-500" id="user-email">
                    admin@gmail.com
                  </p>
                </div>
                <a
                  href="/profile"
                  class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Profile
                </a>
                <div class="border-t border-gray-100 mt-2 pt-2">
                  <a
                    href="#"
                    class="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
