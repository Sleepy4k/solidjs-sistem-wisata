import { Meta } from "@contexts";
import {
  faCheck,
  faEdit,
  faEye,
  faEyeSlash,
  faPlus,
  faSearch,
  faSpinner,
  faTimes,
  faTrash,
  faUser,
  faUserShield,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
} from "@services";
import type { IUser, UserRole } from "@services";
import { useSearchParams } from "@solidjs/router";
import { success, error as toastError } from "@utils";
import Fa from "solid-fa";
import {
  Component,
  createEffect,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
} from "solid-js";

const ROLES: UserRole[] = ["admin", "bumdes", "pokdarwis", "pemdes"];

const roleBadge = (role: string) => {
  switch (role) {
    case "admin":
      return "bg-red-100 text-red-700 border-red-200";
    case "bumdes":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "pokdarwis":
      return "bg-green-100 text-green-700 border-green-200";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
};

const inputCls =
  "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg " +
  "focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white";

const labelCls =
  "block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide";

type FormMode = "create" | "edit";

interface UserForm {
  name: string;
  email: string;
  role: UserRole;
  password: string;
  password_confirmation: string;
}

const emptyForm = (): UserForm => ({
  name: "",
  email: "",
  role: "bumdes",
  password: "",
  password_confirmation: "",
});

const AdminUsers: Component = () => {
  const { changeTitle } = Meta.useMeta();
  const [searchParams, setSearchParams] = useSearchParams();

  const sp = (k: string, fallback = "") => {
    const v = searchParams[k];
    return Array.isArray(v) ? (v[0] ?? fallback) : (v ?? fallback);
  };

  const setParam = (key: string, value: string | undefined) =>
    setSearchParams({ [key]: value || undefined, page: undefined });

  const [users, setUsers] = createSignal<IUser[]>([]);
  const [meta, setMeta] = createSignal({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });
  const [loading, setLoading] = createSignal(false);
  const [searchInput, setSearchInput] = createSignal(sp("search"));
  const [isDebouncing, setIsDebouncing] = createSignal(false);
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;

  const handleSearchInput = (value: string) => {
    setSearchInput(value);
    setIsDebouncing(true);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      setIsDebouncing(false);
      setParam("search", value);
    }, 500);
  };

  onCleanup(() => clearTimeout(debounceTimer));

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers({
        page: Number(sp("page", "1")) || 1,
        per_page: Number(sp("per_page", "10")) || 10,
        search: sp("search") || undefined,
        role: sp("role") || undefined,
      });
      setUsers(res.data ?? []);
      setMeta({
        current_page: res.current_page ?? 1,
        last_page: res.last_page ?? 1,
        per_page: res.per_page ?? 10,
        total: res.total ?? 0,
        from: res.from ?? 0,
        to: res.to ?? 0,
      });
    } catch (err: any) {
      toastError(
        err?.response?.data?.message ?? "Gagal memuat data pengguna.",
        "Error",
      );
    } finally {
      setLoading(false);
    }
  };

  createEffect(() => {
    void sp("page");
    void sp("per_page");
    void sp("search");
    void sp("role");
    fetchUsers();
  });

  onMount(() => changeTitle("Manajemen Pengguna"));

  const [viewUser, setViewUser] = createSignal<IUser | null>(null);
  const [viewLoading, setViewLoading] = createSignal(false);

  const openView = async (id: number | string) => {
    setViewLoading(true);
    setViewUser(null);
    try {
      const u = await getUserById(id);
      setViewUser(u);
    } catch {
      toastError("Gagal memuat detail pengguna.", "Error");
    } finally {
      setViewLoading(false);
    }
  };

  const [formMode, setFormMode] = createSignal<FormMode>("create");
  const [formUser, setFormUser] = createSignal<IUser | null>(null);
  const [showForm, setShowForm] = createSignal(false);
  const [form, setForm] = createSignal<UserForm>(emptyForm());
  const [formErrors, setFormErrors] = createSignal<
    Partial<Record<keyof UserForm, string[]>>
  >({});
  const [formLoading, setFormLoading] = createSignal(false);
  const [showPass, setShowPass] = createSignal(false);
  const [showPassConfirm, setShowPassConfirm] = createSignal(false);

  const openCreate = () => {
    setFormMode("create");
    setFormUser(null);
    setForm(emptyForm());
    setFormErrors({});
    setShowPass(false);
    setShowPassConfirm(false);
    setShowForm(true);
  };

  const openEdit = (u: IUser) => {
    setFormMode("edit");
    setFormUser(u);
    setForm({
      name: u.name,
      email: u.email,
      role: u.role,
      password: "",
      password_confirmation: "",
    });
    setFormErrors({});
    setShowPass(false);
    setShowPassConfirm(false);
    setShowForm(true);
  };

  const closeForm = () => setShowForm(false);

  const handleFormSubmit = async (e: Event) => {
    e.preventDefault();
    setFormErrors({});
    setFormLoading(true);
    const f = form();
    try {
      if (formMode() === "create") {
        await createUser({
          name: f.name,
          email: f.email,
          role: f.role,
          password: f.password,
          password_confirmation: f.password_confirmation,
        });
        success("Pengguna berhasil ditambahkan.", "Berhasil");
      } else {
        const payload: any = { name: f.name, email: f.email, role: f.role };
        if (f.password) {
          payload.password = f.password;
          payload.password_confirmation = f.password_confirmation;
        }
        await updateUser(formUser()!.id, payload);
        success("Pengguna berhasil diperbarui.", "Berhasil");
      }
      closeForm();
      fetchUsers();
    } catch (err: any) {
      const errs = err?.response?.data?.errors;
      if (errs) {
        setFormErrors(errs);
      } else {
        toastError(
          err?.response?.data?.message ??
            (formMode() === "create"
              ? "Gagal menambahkan pengguna."
              : "Gagal memperbarui pengguna."),
          "Error",
        );
      }
    } finally {
      setFormLoading(false);
    }
  };

  const [deleteTarget, setDeleteTarget] = createSignal<IUser | null>(null);
  const [deleteLoading, setDeleteLoading] = createSignal(false);

  const openDelete = (u: IUser) => setDeleteTarget(u);
  const closeDelete = () => setDeleteTarget(null);

  const handleDelete = async () => {
    if (!deleteTarget()) return;
    setDeleteLoading(true);
    try {
      await deleteUser(deleteTarget()!.id);
      success("Pengguna berhasil dihapus.", "Berhasil");
      closeDelete();
      fetchUsers();
    } catch (err: any) {
      toastError(
        err?.response?.data?.message ?? "Gagal menghapus pengguna.",
        "Error",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const goToPage = (p: number) => setSearchParams({ page: String(p) });

  const getPages = () => {
    const total = meta().last_page;
    const cur = meta().current_page;
    const pages: (number | "...")[] = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (cur > 3) pages.push("...");
      const start = Math.max(2, cur - 1);
      const end = Math.min(total - 1, cur + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (cur < total - 2) pages.push("...");
      pages.push(total);
    }
    return pages;
  };

  return (
    <>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 class="text-lg font-bold text-gray-900">Manajemen Pengguna</h1>
          <p class="text-sm text-gray-500 mt-0.5">
            Kelola akun pengguna sistem
          </p>
        </div>
        <button
          onClick={openCreate}
          class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer"
        >
          <Fa icon={faPlus} />
          Tambah Pengguna
        </button>
      </div>

      <div class="bg-white rounded-xl p-4 shadow mb-4 border border-gray-100">
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="relative flex-1">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <Fa icon={faSearch} class="text-sm" />
            </span>
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={searchInput()}
              onInput={(e) => handleSearchInput(e.currentTarget.value)}
              class="w-full pl-9 pr-9 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
            <Show when={isDebouncing()}>
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none">
                <Fa icon={faSpinner} class="text-sm animate-spin" />
              </span>
            </Show>
          </div>

          <select
            value={sp("role")}
            onInput={(e) => setParam("role", e.currentTarget.value)}
            class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white min-w-[140px]"
          >
            <option value="">Semua Role</option>
            <For each={ROLES}>
              {(r) => (
                <option value={r} class="capitalize">
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              )}
            </For>
          </select>

          <select
            value={sp("per_page", "10")}
            onInput={(e) =>
              setSearchParams({
                per_page: e.currentTarget.value,
                page: undefined,
              })
            }
            class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
          >
            <For each={[10, 25, 50, 100]}>
              {(n) => <option value={String(n)}>{n} per halaman</option>}
            </For>
          </select>

          <Show when={searchInput() || sp("role")}>
            <button
              onClick={() => {
                clearTimeout(debounceTimer);
                setIsDebouncing(false);
                setSearchInput("");
                setSearchParams({
                  search: undefined,
                  role: undefined,
                  page: undefined,
                });
              }}
              class="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <Fa icon={faXmark} />
              Reset
            </button>
          </Show>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
        <div class="overflow-x-auto relative">
          <Show when={loading()}>
            <div class="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center">
              <div class="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow border border-gray-200">
                <Fa icon={faSpinner} class="animate-spin text-blue-600" />
                <span class="text-sm text-gray-600">Memuat...</span>
              </div>
            </div>
          </Show>

          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-10">
                  #
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Nama
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">
                  Email
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                  Role
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                  Dibuat
                </th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <Show
                when={users().length > 0}
                fallback={
                  <tr>
                    <td colSpan={6} class="px-4 py-16 text-center">
                      <div class="flex flex-col items-center gap-3 text-gray-400">
                        <Fa icon={faUser} class="text-4xl" />
                        <p class="text-sm font-medium">
                          Tidak ada pengguna ditemukan
                        </p>
                      </div>
                    </td>
                  </tr>
                }
              >
                <For each={users()}>
                  {(user, idx) => (
                    <tr class="hover:bg-gray-50 transition-colors">
                      <td class="px-4 py-3 text-sm text-gray-500">
                        {(meta().from || 0) + idx()}
                      </td>
                      <td class="px-4 py-3">
                        <div class="flex items-center gap-3">
                          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {user.name?.charAt(0)?.toUpperCase() ?? "?"}
                          </div>
                          <div class="min-w-0">
                            <p class="text-sm font-semibold text-gray-900 truncate">
                              {user.name}
                            </p>
                            <p class="text-xs text-gray-500 sm:hidden truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td class="px-4 py-3 hidden sm:table-cell text-sm text-gray-600 max-w-[200px] truncate">
                        {user.email}
                      </td>
                      <td class="px-4 py-3 hidden md:table-cell">
                        <span
                          class={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border capitalize ${roleBadge(user.role)}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td class="px-4 py-3 hidden lg:table-cell text-sm text-gray-500">
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "-"}
                      </td>
                      <td class="px-4 py-3">
                        <div class="flex items-center justify-end gap-1.5">
                          <button
                            title="Lihat detail"
                            onClick={() => openView(user.id)}
                            class="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-blue-100 text-gray-500 hover:text-blue-600 transition-colors cursor-pointer"
                          >
                            <Fa icon={faEye} class="text-xs" />
                          </button>
                          <button
                            title="Edit"
                            onClick={() => openEdit(user)}
                            class="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-amber-100 text-gray-500 hover:text-amber-600 transition-colors cursor-pointer"
                          >
                            <Fa icon={faEdit} class="text-xs" />
                          </button>
                          <button
                            title="Hapus"
                            onClick={() => openDelete(user)}
                            class="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
                          >
                            <Fa icon={faTrash} class="text-xs" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </For>
              </Show>
            </tbody>
          </table>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 bg-gray-50/50">
          <p class="text-sm text-gray-500">
            Menampilkan{" "}
            <span class="font-semibold text-gray-700">{meta().from}</span>–
            <span class="font-semibold text-gray-700">{meta().to}</span> dari{" "}
            <span class="font-semibold text-gray-700">{meta().total}</span>{" "}
            pengguna
          </p>
          <div class="flex items-center gap-1.5">
            <button
              onClick={() => goToPage(meta().current_page - 1)}
              disabled={meta().current_page <= 1}
              class="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Prev
            </button>
            <For each={getPages()}>
              {(p) => (
                <Show
                  when={p !== "..."}
                  fallback={<span class="px-2 text-gray-400 text-sm">…</span>}
                >
                  <button
                    onClick={() => goToPage(p as number)}
                    class="min-w-[2rem] px-3 py-1.5 text-sm rounded-lg border transition-colors cursor-pointer"
                    classList={{
                      "bg-blue-600 text-white border-blue-600 font-semibold":
                        meta().current_page === (p as number),
                      "border-gray-300 bg-white text-gray-600 hover:bg-gray-50":
                        meta().current_page !== (p as number),
                    }}
                    disabled={meta().current_page === (p as number)}
                  >
                    {p}
                  </button>
                </Show>
              )}
            </For>
            <button
              onClick={() => goToPage(meta().current_page + 1)}
              disabled={meta().current_page >= meta().last_page}
              class="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <Show when={viewUser() !== null || viewLoading()}>
        <div
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewUser(null);
          }}
        >
          <div class="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
            <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 class="font-semibold text-gray-800 flex items-center gap-2">
                <Fa icon={faUser} class="text-blue-500 text-sm" />
                Detail Pengguna
              </h3>
              <button
                onClick={() => setViewUser(null)}
                class="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <Fa icon={faTimes} class="text-xs" />
              </button>
            </div>

            <Show
              when={!viewLoading()}
              fallback={
                <div class="p-8 flex justify-center">
                  <Fa
                    icon={faSpinner}
                    class="animate-spin text-2xl text-blue-500"
                  />
                </div>
              }
            >
              <div class="p-5 space-y-4">
                <div class="flex items-center gap-4">
                  <div class="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    {viewUser()?.name?.charAt(0)?.toUpperCase() ?? "?"}
                  </div>
                  <div>
                    <p class="font-bold text-gray-900 text-lg leading-tight">
                      {viewUser()?.name}
                    </p>
                    <span
                      class={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border capitalize mt-1 ${roleBadge(viewUser()?.role ?? "")}`}
                    >
                      {viewUser()?.role}
                    </span>
                  </div>
                </div>
                <div class="grid grid-cols-1 divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
                  {(
                    [
                      ["ID", String(viewUser()?.id ?? "-")],
                      ["Email", viewUser()?.email ?? "-"],
                      ["Role", viewUser()?.role ?? "-"],
                      [
                        "Status",
                        viewUser()?.is_active !== false ? "Aktif" : "Nonaktif",
                      ],
                      [
                        "Dibuat",
                        viewUser()?.created_at
                          ? new Date(viewUser()!.created_at!).toLocaleString(
                              "id-ID",
                            )
                          : "-",
                      ],
                    ] as [string, string][]
                  ).map(([label, value]) => (
                    <div class="flex px-4 py-2.5 gap-4">
                      <span class="text-xs font-semibold text-gray-400 uppercase tracking-wide w-20 flex-shrink-0 pt-0.5">
                        {label}
                      </span>
                      <span class="text-sm text-gray-800 font-medium capitalize">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Show>

            <div class="flex gap-2 px-5 py-4 border-t border-gray-100">
              <button
                onClick={() => {
                  setViewUser(null);
                  openEdit(viewUser()!);
                }}
                class="flex-1 inline-flex items-center justify-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 py-2 rounded-lg hover:bg-amber-100 transition-colors text-sm font-medium cursor-pointer"
              >
                <Fa icon={faEdit} class="text-xs" /> Edit
              </button>
              <button
                onClick={() => setViewUser(null)}
                class="flex-1 inline-flex items-center justify-center gap-1.5 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </Show>

      <Show when={showForm()}>
        <div
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeForm();
          }}
        >
          <div class="w-full max-w-md bg-white rounded-xl shadow-2xl">
            <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 class="font-semibold text-gray-800 flex items-center gap-2">
                <Fa
                  icon={formMode() === "create" ? faPlus : faEdit}
                  class="text-blue-500 text-sm"
                />
                {formMode() === "create" ? "Tambah Pengguna" : "Edit Pengguna"}
              </h3>
              <button
                onClick={closeForm}
                class="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <Fa icon={faTimes} class="text-xs" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} class="px-5 py-4 space-y-4">
              <div>
                <label class={labelCls}>
                  Nama Lengkap <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form().name}
                  onInput={(e) =>
                    setForm((f) => ({ ...f, name: e.currentTarget.value }))
                  }
                  class={inputCls}
                  placeholder="Masukkan nama lengkap"
                />
                <Show when={formErrors().name}>
                  <p class="mt-1 text-xs text-red-600">
                    {formErrors().name?.[0]}
                  </p>
                </Show>
              </div>

              <div>
                <label class={labelCls}>
                  Email <span class="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={form().email}
                  onInput={(e) =>
                    setForm((f) => ({ ...f, email: e.currentTarget.value }))
                  }
                  class={inputCls}
                  placeholder="contoh@email.com"
                />
                <Show when={formErrors().email}>
                  <p class="mt-1 text-xs text-red-600">
                    {formErrors().email?.[0]}
                  </p>
                </Show>
              </div>

              <div>
                <label class={labelCls}>
                  Role <span class="text-red-500">*</span>
                </label>
                <select
                  value={form().role}
                  onInput={(e) =>
                    setForm((f) => ({
                      ...f,
                      role: e.currentTarget.value as UserRole,
                    }))
                  }
                  class={inputCls}
                  required
                >
                  <For each={ROLES}>
                    {(r) => (
                      <option value={r} class="capitalize">
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </option>
                    )}
                  </For>
                </select>
                <Show when={formErrors().role}>
                  <p class="mt-1 text-xs text-red-600">
                    {formErrors().role?.[0]}
                  </p>
                </Show>
              </div>

              <div>
                <label class={labelCls}>
                  Kata Sandi{" "}
                  {formMode() === "create" ? (
                    <span class="text-red-500">*</span>
                  ) : (
                    <span class="text-gray-400 normal-case font-normal">
                      (kosongkan jika tidak diubah)
                    </span>
                  )}
                </label>
                <div class="relative">
                  <input
                    type={showPass() ? "text" : "password"}
                    required={formMode() === "create"}
                    value={form().password}
                    onInput={(e) =>
                      setForm((f) => ({
                        ...f,
                        password: e.currentTarget.value,
                      }))
                    }
                    class={`${inputCls} pr-10`}
                    placeholder="••••••••"
                    minLength={formMode() === "create" ? 8 : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <Fa
                      icon={showPass() ? faEyeSlash : faEye}
                      class="text-sm"
                    />
                  </button>
                </div>
                <Show when={formErrors().password}>
                  <p class="mt-1 text-xs text-red-600">
                    {formErrors().password?.[0]}
                  </p>
                </Show>
              </div>

              <Show when={form().password || formMode() === "create"}>
                <div>
                  <label class={labelCls}>
                    Konfirmasi Kata Sandi <span class="text-red-500">*</span>
                  </label>
                  <div class="relative">
                    <input
                      type={showPassConfirm() ? "text" : "password"}
                      required={formMode() === "create" || !!form().password}
                      value={form().password_confirmation}
                      onInput={(e) =>
                        setForm((f) => ({
                          ...f,
                          password_confirmation: e.currentTarget.value,
                        }))
                      }
                      class={`${inputCls} pr-10`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassConfirm((v) => !v)}
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <Fa
                        icon={showPassConfirm() ? faEyeSlash : faEye}
                        class="text-sm"
                      />
                    </button>
                  </div>
                  <Show when={formErrors().password_confirmation}>
                    <p class="mt-1 text-xs text-red-600">
                      {formErrors().password_confirmation?.[0]}
                    </p>
                  </Show>
                </div>
              </Show>

              <div class="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  class="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading()}
                  class="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Show
                    when={!formLoading()}
                    fallback={
                      <>
                        <Fa icon={faSpinner} class="animate-spin text-xs" />{" "}
                        Menyimpan...
                      </>
                    }
                  >
                    <Fa icon={faCheck} class="text-xs" />
                    {formMode() === "create" ? "Tambah" : "Simpan"}
                  </Show>
                </button>
              </div>
            </form>
          </div>
        </div>
      </Show>

      <Show when={deleteTarget() !== null}>
        <div
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDelete();
          }}
        >
          <div class="w-full max-w-xs bg-white rounded-xl shadow-2xl overflow-hidden">
            <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 class="font-semibold text-gray-800">Hapus Pengguna</h3>
              <button
                onClick={closeDelete}
                class="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <Fa icon={faTimes} class="text-xs" />
              </button>
            </div>
            <div class="px-5 py-4">
              <p class="text-sm text-gray-600 leading-relaxed">
                Yakin ingin menghapus pengguna{" "}
                <span class="font-semibold text-gray-900">
                  {deleteTarget()?.name}
                </span>
                ? Tindakan ini{" "}
                <span class="text-red-500 font-medium">
                  tidak dapat dibatalkan
                </span>
                .
              </p>
            </div>
            <div class="flex gap-2 px-5 py-4 border-t border-gray-100">
              <button
                onClick={closeDelete}
                class="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm font-medium cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading()}
                class="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-medium cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Show when={deleteLoading()}>
                  <Fa icon={faSpinner} class="animate-spin text-xs" />
                </Show>
                Hapus
              </button>
            </div>
          </div>
        </div>
      </Show>
    </>
  );
};

export default AdminUsers;
