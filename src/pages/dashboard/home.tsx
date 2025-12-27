import { Auth, Meta } from "@contexts";
import {
  faClock,
  faCreditCard,
  faCube,
  faEnvelope,
  faServer,
  faSignal,
  faUser,
  faUsers,
  faUserTag,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";
import { getSummaryData, getSystemInformation } from "@services";
import { formatCurrency, getObjectLength, pluralize } from "@utils";
import Fa from "solid-fa";
import { Component, createResource, For, onMount, Show } from "solid-js";

const guideSteps = [
  {
    title: "🚀 Memulai",
    dynamic: false,
    steps: [
      "Navigasi menggunakan sidebar di sebelah kiri untuk mengakses berbagai fitur",
      "Dashboard menampilkan ringkasan data dan statistik terkini",
      "Setiap modul memiliki fitur CRUD (Create, Read, Update, Delete)",
    ],
  },
  {
    title: "🏪 Mengelola Usaha",
    dynamic: true,
    steps: [],
  },
  {
    title: "📊 Laporan",
    dynamic: false,
    steps: [
      "Akses laporan keuangan POKDARWIS dan BUMDES secara terpisah",
      "Export data dalam format Excel atau PDF",
      "Filter laporan berdasarkan tanggal, jenis usaha, atau periode tertentu",
      "Grafik dan visualisasi data untuk analisis yang lebih mudah",
    ],
  },
];

const Home: Component = () => {
  const { user } = Auth.useAuth();
  const { changeTitle } = Meta.useMeta();
  const [sysInfo, _] = createResource(getSystemInformation);
  const [summaryData, __] = createResource(getSummaryData);

  onMount(() => {
    changeTitle("Dashboard");
  });

  return (
    <>
      <Show
        when={user()?.role === "admin" && summaryData()}
        fallback={
          <Show when={user()?.role === "admin"}>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
              <For each={Array.from({ length: 4 })}>
                {() => (
                  <div class="card h-24 sm:h-28 lg:h-26 bg-gray-200 rounded-lg animate-pulse" />
                )}
              </For>
            </div>
          </Show>
        }
      >
        <div
          class="grid grid-cols-1 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8"
          classList={{
            "sm:grid-cols-1": getObjectLength(summaryData()?.roles || {}) === 1,
            "sm:grid-cols-2": getObjectLength(summaryData()?.roles || {}) >= 2,
            "lg:grid-cols-3": getObjectLength(summaryData()?.roles || {}) === 3,
            "lg:grid-cols-4": getObjectLength(summaryData()?.roles || {}) >= 4,
          }}
        >
          <For each={Object.entries(summaryData()?.roles || {})}>
            {([roleName, roleCount]) => {
              const count = String(roleCount);
              const userLabel = pluralize(count, "User", "Users");
              const capitalizedRole =
                roleName.charAt(0).toUpperCase() + roleName.slice(1);

              return (
                <div class="card p-4 sm:p-5 lg:p-6">
                  <div class="flex items-center justify-between gap-3">
                    <div class="flex-1 min-w-0">
                      <p class="text-xs sm:text-sm text-gray-600 mb-1 truncate">
                        Total {capitalizedRole}
                      </p>
                      <p class="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                        {count} {userLabel}
                      </p>
                    </div>
                    <div class="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Fa
                        icon={faUsers}
                        class="text-lg sm:text-xl text-green-600"
                      />
                    </div>
                  </div>
                </div>
              );
            }}
          </For>
        </div>
      </Show>

      <Show
        when={summaryData()}
        fallback={
          <div
            class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8"
            classList={{
              "lg:grid-cols-2": user()?.role === "pokdarwis",
              "lg:grid-cols-4": user()?.role !== "pokdarwis",
            }}
          >
            <For
              each={Array.from({
                length: user()?.role === "pokdarwis" ? 2 : 4,
              })}
            >
              {() => (
                <div class="card h-24 sm:h-28 lg:h-26 bg-gray-200 rounded-lg animate-pulse" />
              )}
            </For>
          </div>
        }
      >
        <div
          class={`grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8`}
          classList={{
            "lg:grid-cols-2": getObjectLength(summaryData()!.summary) === 1,
            "lg:grid-cols-4": getObjectLength(summaryData()!.summary) >= 2,
          }}
        >
          <For each={Object.entries(summaryData()!.summary)}>
            {([prefix, data]) => {
              const name =
                prefix.charAt(0).toUpperCase() + prefix.slice(1).toLowerCase();
              return (
                <>
                  <div class="card p-4 sm:p-5 lg:p-6">
                    <div class="flex items-center justify-between gap-3">
                      <div class="flex-1 min-w-0">
                        <p class="text-xs sm:text-sm text-gray-600 mb-1 truncate">
                          Pendapatan {name} Bulan Ini.
                        </p>
                        <p class="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                          {formatCurrency(data.total_income)},00
                        </p>
                      </div>
                      <div class="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Fa
                          icon={faWallet}
                          class="text-lg sm:text-xl text-blue-600"
                        />
                      </div>
                    </div>
                  </div>
                  <div class="card p-4 sm:p-5 lg:p-6">
                    <div class="flex items-center justify-between gap-3">
                      <div class="flex-1 min-w-0">
                        <p class="text-xs sm:text-sm text-gray-600 mb-1 truncate">
                          Pengeluaran {name} Bulan Ini.
                        </p>
                        <p class="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                          {formatCurrency(data.total_outcome)},00
                        </p>
                      </div>
                      <div class="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Fa
                          icon={faCreditCard}
                          class="text-lg sm:text-xl text-red-600"
                        />
                      </div>
                    </div>
                  </div>
                </>
              );
            }}
          </For>
        </div>
      </Show>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        <div class="xl:col-span-2">
          <div class="card">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
              <h2 class="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-0">
                Panduan Penggunaan Sistem
              </h2>
            </div>

            <div class="space-y-6" id="tutorialContent">
              <Show
                when={summaryData()}
                fallback={
                  <>
                    {[1, 2, 3].map(() => (
                      <div class="border-l-4 pl-6">
                        <div class="h-6 bg-gray-200 rounded-lg w-3/4 mb-3 animate-pulse"></div>
                        <div class="space-y-2">
                          {[1, 2, 3].map(() => (
                            <div class="flex items-start gap-3">
                              <div class="w-6 h-6 bg-gray-200 rounded-full animate-pulse mt-0.5"></div>
                              <div class="h-4 bg-gray-200 rounded-lg w-full animate-pulse"></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </>
                }
              >
                <For each={guideSteps}>
                  {(section) => {
                    if (
                      section.dynamic &&
                      (user()?.role === "admin" || user()?.role === "pemdes")
                    ) {
                      return null;
                    }

                    return (
                      <div
                        class="border-l-4 pl-6"
                        classList={{
                          "border-blue-500": section.title === "🚀 Memulai",
                          "border-green-500":
                            section.title === "🏪 Mengelola Usaha",
                          "border-yellow-500": section.title === "📊 Laporan",
                        }}
                      >
                        <h3 class="text-lg font-semibold text-gray-900 mb-3">
                          {section.title}
                        </h3>
                        <ul class="space-y-2 text-gray-700">
                          <Show
                            when={section.dynamic}
                            fallback={
                              <For each={section.steps}>
                                {(step, index) => (
                                  <li class="flex items-start gap-3">
                                    <span class="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                                      {index() + 1}
                                    </span>
                                    <span>{step}</span>
                                  </li>
                                )}
                              </For>
                            }
                          >
                            <For
                              each={
                                summaryData()!.menus[user()?.role as string]
                              }
                            >
                              {(menuItem, index) => (
                                <li class="flex items-start gap-3">
                                  <span class="w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-sm font-medium mt-0.5 flex-shrink-0">
                                    {index() + 1}
                                  </span>
                                  <a
                                    href={`usaha/${
                                      menuItem.prefix
                                    }/${menuItem.name
                                      .toLowerCase()
                                      .replace(/\s+/g, "-")}`}
                                    class="hover:underline block hover:text-green-600 transition-colors"
                                  >
                                    <strong>
                                      {menuItem.name
                                        .split("-")
                                        .map(
                                          (word) =>
                                            word.charAt(0).toUpperCase() +
                                            word.slice(1)
                                        )
                                        .join(" ")}
                                    </strong>
                                    : digunakan untuk mengelola data operasional
                                    usaha, mencakup pencatatan transaksi,
                                    pemantauan pemasukan dan pengeluaran, serta
                                    pengelolaan laporan secara terstruktur.
                                  </a>
                                </li>
                              )}
                            </For>
                          </Show>
                        </ul>
                      </div>
                    );
                  }}
                </For>
              </Show>
            </div>
          </div>
        </div>

        <div class="space-y-4 lg:space-y-6">
          <div class="card">
            <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-4">
              Informasi Pengguna
            </h3>
            <div class="space-y-4">
              <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span class="text-sm text-gray-600 flex items-center gap-2">
                  <Fa icon={faUser} class="text-blue-500" />
                  Nama Pengguna
                </span>
                <span class="font-semibold text-gray-900">
                  {user()?.name || "User"}
                </span>
              </div>
              <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span class="text-sm text-gray-600 flex items-center gap-2">
                  <Fa icon={faEnvelope} class="text-purple-500" />
                  Email
                </span>
                <span class="font-semibold text-gray-900">
                  {user()?.email || "example@gmail.com"}
                </span>
              </div>
              <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span class="text-sm text-gray-600 flex items-center gap-2">
                  <Fa icon={faUserTag} class="text-green-500" />
                  Role
                </span>
                <span class="font-semibold text-gray-900 capitalize">
                  {user()?.role || "User"}
                </span>
              </div>
            </div>
          </div>

          <div class="card">
            <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-4">
              Informasi Sistem
            </h3>
            <div class="space-y-4">
              <Show
                when={!sysInfo.loading}
                fallback={
                  <div class="space-y-3">
                    {[1, 2, 3, 4].map(() => (
                      <div class="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                }
              >
                <div class="space-y-3">
                  <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span class="text-sm text-gray-600 flex items-center gap-2">
                      <Fa icon={faCube} class="text-blue-500" />
                      Versi Aplikasi
                    </span>
                    <span class="font-semibold text-gray-900">
                      v{sysInfo()?.application.version}
                    </span>
                  </div>
                  <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span class="text-sm text-gray-600 flex items-center gap-2">
                      <Fa icon={faServer} class="text-purple-500" />
                      Versi Sistem
                    </span>
                    <span class="font-semibold text-gray-900">
                      v{sysInfo()?.system.backend_version}
                    </span>
                  </div>
                  <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span class="text-sm text-gray-600 flex items-center gap-2">
                      <Fa icon={faClock} class="text-orange-500" />
                      Zona Waktu
                    </span>
                    <span class="font-semibold text-gray-900">
                      {sysInfo()?.system.timezone}
                    </span>
                  </div>
                  <div class="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <span class="text-sm text-gray-600 flex items-center gap-2">
                      <Fa icon={faSignal} class="text-green-500" />
                      Status Server
                    </span>
                    <span class="flex items-center gap-2">
                      <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      <span class="text-green-600 font-semibold text-sm">
                        Online
                      </span>
                    </span>
                  </div>
                </div>
              </Show>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
