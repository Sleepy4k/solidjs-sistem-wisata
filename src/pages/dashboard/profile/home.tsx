import { Meta } from "@contexts";
import {
  faCheckCircle,
  faCog,
  faEdit,
  faHistory,
  faInbox,
  faKey,
  faPlusCircle,
  faSignInAlt,
  faSignOutAlt,
  faTrash,
  faUser,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { getDetailProfile } from "@services";
import { A } from "@solidjs/router";
import { firstChar, formatDate } from "@utils";
import Fa from "solid-fa";
import { Component, createResource, For, onMount, Show } from "solid-js";

interface ActivityLog {
  action: string;
  created_at: string;
  description: string;
}

interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: "admin" | "pemdes" | "bumdes" | "pokdarwis";
  created_at: string;
  status?: string;
  is_active?: boolean;
  permissions?: string[];
  logs: ActivityLog[];
}

interface ActivityClass {
  bg: string;
  border: string;
  icon: string;
}

const formatDateTime = (
  dateString?: string
): { date: string; time: string } => {
  if (!dateString) return { date: "-", time: "-" };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
  };
  return {
    date: formatDate(dateString),
    time: formatDate(dateString, timeOptions),
  };
};

const getActivityClass = (index: number): ActivityClass => {
  const classes: ActivityClass[] = [
    {
      bg: "from-blue-50 to-blue-100",
      border: "border-blue-200",
      icon: "bg-blue-500",
    },
    {
      bg: "from-green-50 to-green-100",
      border: "border-green-200",
      icon: "bg-green-500",
    },
    {
      bg: "from-purple-50 to-purple-100",
      border: "border-purple-200",
      icon: "bg-purple-500",
    },
    {
      bg: "from-orange-50 to-orange-100",
      border: "border-orange-200",
      icon: "bg-orange-500",
    },
    {
      bg: "from-teal-50 to-teal-100",
      border: "border-teal-200",
      icon: "bg-teal-500",
    },
  ];

  return classes[index % classes.length];
};

const getActivityIcon = (action: string): IconDefinition => {
  switch (action) {
    case "login":
      return faSignInAlt;
    case "logout":
      return faSignOutAlt;
    case "add":
    case "create":
      return faPlusCircle;
    case "view":
    case "show":
    case "read":
      return faInbox;
    case "update":
    case "edit":
      return faEdit;
    case "delete":
    case "remove":
      return faTrash;
    case "password":
      return faKey;
    default:
      return faCog;
  }
};

const Profile: Component = () => {
  const { changeTitle } = Meta.useMeta();
  const [user, _] = createResource<ProfileData | null>(getDetailProfile);

  const getUserRole = (): string => {
    const role = user()?.role;
    return role ? role.charAt(0).toUpperCase() + role.slice(1) : "User";
  };

  onMount(() => {
    changeTitle("Profile");
  });

  return (
    <>
      <div class="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div class="flex items-center gap-4 w-full sm:w-auto">
            <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-lg sm:text-xl font-bold flex-shrink-0">
              {firstChar(user()?.name || "A", true)}
            </div>
            <div class="min-w-0 flex-1">
              <h1 class="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                <Show
                  when={user()}
                  fallback={
                    <div class="w-32 h-6 bg-gray-200 rounded-md animate-pulse"></div>
                  }
                >
                  {user()?.name}
                </Show>
              </h1>
              <p class="text-xs sm:text-sm text-gray-500 mt-1">
                <Show
                  when={user()}
                  fallback={
                    <div class="w-24 h-4 bg-gray-200 rounded-md animate-pulse"></div>
                  }
                >
                  {getUserRole()}
                </Show>
              </p>
            </div>
          </div>

          <A
            href="/profile/edit"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 cursor-pointer flex items-center gap-2 whitespace-nowrap w-full sm:w-auto justify-center sm:justify-start"
          >
            <Fa icon={faEdit} />
            <span>Edit</span>
          </A>
        </div>
      </div>

      <div class="grid lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2">
          <div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div class="flex items-center mb-6">
              <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-4">
                <Fa icon={faUser} class="text-white" />
              </div>
              <h2 class="text-2xl font-bold text-gray-900">
                Informasi Pribadi
              </h2>
            </div>

            <div id="profile-info" class="grid md:grid-cols-2 gap-8">
              <div class="space-y-6">
                <div>
                  <label class="block text-sm font-medium text-gray-500 mb-2">
                    Nama Lengkap
                  </label>
                  <Show
                    when={user()}
                    fallback={
                      <div class="h-6 bg-gray-200 rounded-lg animate-pulse"></div>
                    }
                  >
                    <p class="text-lg font-semibold text-gray-900">
                      {user()?.name}
                    </p>
                  </Show>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-500 mb-2">
                    Tanggal Bergabung
                  </label>
                  <Show
                    when={user()}
                    fallback={
                      <div class="h-6 bg-gray-200 rounded-lg animate-pulse"></div>
                    }
                  >
                    <p class="text-lg text-gray-700">
                      {formatDate(user()?.created_at || "")}
                    </p>
                  </Show>
                </div>
              </div>
              <div class="space-y-6">
                <div>
                  <label class="block text-sm font-medium text-gray-500 mb-2">
                    Email
                  </label>
                  <Show
                    when={user()}
                    fallback={
                      <div class="h-6 bg-gray-200 rounded-lg animate-pulse"></div>
                    }
                  >
                    <p class="text-lg text-gray-700">{user()?.email}</p>
                  </Show>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-500 mb-2">
                    Status Aktif
                  </label>
                  <Show
                    when={user()}
                    fallback={
                      <div class="h-6 bg-gray-200 rounded-lg animate-pulse"></div>
                    }
                  >
                    <p class="flex items-center gap-2">
                      <Fa icon={faCheckCircle} class="text-green-600" />
                      <span class="text-lg font-semibold text-green-600">
                        Aktif
                      </span>
                    </p>
                  </Show>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-1">
          <div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 sticky top-8">
            <div class="flex items-center mb-6">
              <div class="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-4">
                <Fa icon={faHistory} class="text-white" />
              </div>
              <h3 class="text-xl font-bold text-gray-900">
                Aktivitas Terakhir
              </h3>
            </div>

            <div class="space-y-4">
              <Show
                when={user()?.logs?.length}
                fallback={
                  <div class="text-center py-8">
                    <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Fa icon={faInbox} class="text-gray-400 text-xl" />
                    </div>
                    <p class="text-gray-500 font-medium">Belum ada aktivitas</p>
                    <p class="text-gray-400 text-sm mt-1">
                      Aktivitas akan muncul di sini
                    </p>
                  </div>
                }
              >
                <For each={user()?.logs}>
                  {(log, index) => {
                    const style = getActivityClass(index());
                    const dateTime = formatDateTime(log.created_at);
                    const description =
                      log.description || "Aktivitas tidak ada";
                    return (
                      <div
                        class={`flex items-start gap-4 p-4 bg-gradient-to-r ${
                          style.bg
                        } rounded-xl border ${
                          style.border
                        } hover:shadow-md transition-all duration-200
                          ${index() === 0 ? "ring-2 ring-blue-200" : ""}
                        `}
                      >
                        <div
                          class={`w-10 h-10 ${style.icon} rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm`}
                        >
                          <Fa
                            icon={getActivityIcon(log.action?.toLowerCase())}
                            class="text-white text-sm"
                          />
                        </div>
                        <div class="min-w-0 flex-1">
                          <div class="flex items-center flex-wrap gap-2">
                            <p class="text-sm font-medium text-gray-900">
                              {description}
                            </p>
                            <Show when={index() === 0}>
                              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 ml-2">
                                <span class="w-1.5 h-1.5 bg-red-500 rounded-full mr-1 animate-pulse"></span>
                                Baru
                              </span>
                            </Show>
                          </div>
                          <div class="flex items-center gap-2 mt-1">
                            <p class="text-xs text-gray-500">{dateTime.date}</p>
                            <span class="w-1 h-1 bg-gray-400 rounded-full"></span>
                            <p class="text-xs text-gray-500 font-medium">
                              {dateTime.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                </For>
              </Show>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
