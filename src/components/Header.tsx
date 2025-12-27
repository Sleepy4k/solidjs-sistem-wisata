import { Meta } from "@contexts";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { A } from "@solidjs/router";
import { convertToTitle, firstChar } from "@utils";
import Fa from "solid-fa";
import { onCleanup, onMount, Show } from "solid-js";

interface IHeaderProp {
  name?: string;
  email?: string;
}

export default function Header(props: IHeaderProp) {
  const { title } = Meta.useMeta();

  const currentDate: string = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let profileDropdown: HTMLDivElement,
    profileButton: HTMLButtonElement,
    logoutButton: HTMLButtonElement;

  const handleBurgerClick = () => {
    const sidebar = document.getElementById("sidebar") as HTMLDivElement;
    const overlay = document.getElementById(
      "sidebar-overlay"
    ) as HTMLDivElement;
    const nav = document.getElementById("sidebar-nav") as HTMLDivElement;

    if (sidebar && overlay) {
      const isOpen = !sidebar.classList.contains("-translate-x-full");

      if (isOpen) {
        if (nav) {
          sidebar.setAttribute("data-scroll-pos", nav.scrollTop.toString());
        }

        sidebar.classList.add("-translate-x-full");
        overlay.classList.add("hidden");
        document.body.classList.remove("overflow-hidden");
      } else {
        sidebar.classList.remove("-translate-x-full");
        overlay.classList.remove("hidden");
        document.body.classList.add("overflow-hidden");

        if (nav) {
          const scrollPos = parseInt(
            sidebar.getAttribute("data-scroll-pos") || "0"
          );
          nav.scrollTop = scrollPos;
        }
      }
    }
  };

  const handleProfileClick = () => {
    profileDropdown.classList.toggle("hidden");
  };

  const handleLogoutClick = () => {
    const logoutModal = document.getElementById(
      "logout-modal"
    ) as HTMLDivElement;
    logoutModal.classList.remove("hidden");
  };

  const handleWindowClick = (event: MouseEvent) => {
    if (
      !profileDropdown.classList.contains("hidden") &&
      !profileDropdown.contains(event.target as Node) &&
      !profileButton.contains(event.target as Node)
    ) {
      profileDropdown.classList.add("hidden");
    }
  };

  onMount(() => {
    profileButton.addEventListener("click", handleProfileClick);
    logoutButton.addEventListener("click", handleLogoutClick);
    window.addEventListener("click", handleWindowClick);

    onCleanup(() => {
      profileButton.removeEventListener("click", handleProfileClick);
      logoutButton.removeEventListener("click", handleLogoutClick);
      window.removeEventListener("click", handleWindowClick);
    });
  });

  return (
    <header class="lg:sticky top-0 z-30 bg-gray-50">
      <div class="bg-white border-b border-gray-200 shadow-sm">
        <div class="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <button
              class="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={handleBurgerClick}
            >
              <Fa icon={faBars} class="text-gray-600 text-lg" />
            </button>
            <Show
              when={title()}
              fallback={
                <div class="px-4 py-3 rounded-xl bg-gray-200 animate-pulse h-10"></div>
              }
            >
              <h1 class="text-lg font-semibold text-gray-900">
                {convertToTitle(title())}
              </h1>
            </Show>
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
                    {firstChar(props.name || "A", true)}
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
