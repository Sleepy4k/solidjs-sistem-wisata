import { A } from "@solidjs/router";
import { createEffect, onMount } from "solid-js";

interface IHeaderProp {
  name?: string;
  email?: string;
}

export default function Header(props: IHeaderProp) {
  let profileDropdown: HTMLDivElement,
    profileButton: HTMLButtonElement,
    logoutButton: HTMLButtonElement;
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

  onMount(() => {
    profileButton.addEventListener("click", () => {
      profileDropdown.classList.toggle("hidden");
    });

    logoutButton.addEventListener("click", () => {
      const logoutModal = document.getElementById(
        "logout-modal"
      ) as HTMLDivElement;
      logoutModal.classList.remove("hidden");
    });
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

            <div class="relative p-1">
              <button
                class="flex items-center gap-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-md transition-all duration-200 cursor-pointer"
                ref={(el) => (profileButton = el)}
              >
                <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span class="text-white text-sm font-medium">
                    {props.name ? props.name.charAt(0).toUpperCase() : "A"}
                  </span>
                </div>
              </button>

              <div
                class="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-1 hidden transition-all duration-200"
                ref={(el) => (profileDropdown = el)}
              >
                <div class="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                  <p class="text-sm font-semibold text-gray-900">
                    {props.name || "User"}
                  </p>
                  <p class="text-xs text-gray-600 mt-1">
                    {props.email || "user@example.com"}
                  </p>
                </div>

                <div class="py-2">
                  <A
                    href="/profile"
                    class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-lg mx-2"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      ></path>
                    </svg>
                    <span>Profil Saya</span>
                  </A>
                </div>

                <div class="border-t border-gray-300 py-2">
                  <button
                    ref={(el) => (logoutButton = el)}
                    class="w-[92%] flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-lg mx-2 cursor-pointer"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      ></path>
                    </svg>
                    <span>Keluar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
