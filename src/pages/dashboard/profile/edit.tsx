import { Auth, Meta } from "@contexts";
import { EAuthUpdateCategory, EDebugType } from "@enums";
import {
  faArrowLeft,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@services";
import { A } from "@solidjs/router";
import { getObjectLength, println } from "@utils";
import Fa from "solid-fa";
import {
  Component,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
} from "solid-js";
import { createStore } from "solid-js/store";

interface IPasswordState {
  currentPassword: boolean;
  newPassword: boolean;
  confirmPassword: boolean;
}

interface IErrorsBody {
  name?: string[];
  email?: string[];
  current_password?: string[];
  new_password?: string[];
  confirm_password?: string[];
}

const EditProfile: Component = () => {
  const { user, updateData } = Auth.useAuth();
  const { changeTitle } = Meta.useMeta();
  const [loading, setLoading] = createSignal<boolean>(false);
  const [errors, setErrors] = createSignal<IErrorsBody>({});
  const [passwordState, setPasswordState] = createStore<IPasswordState>({
    currentPassword: true,
    newPassword: true,
    confirmPassword: true,
  });

  let nameInput: HTMLInputElement,
    emailInput: HTMLInputElement,
    submitProfileButton: HTMLButtonElement,
    currentPasswordInput: HTMLInputElement,
    newPasswordInput: HTMLInputElement,
    confirmPasswordInput: HTMLInputElement,
    submitPasswordButton: HTMLButtonElement;

  const getUserRole = (): string => {
    const role = user()?.role;
    return role ? role.charAt(0).toUpperCase() + role.slice(1) : "User";
  };

  onMount(() => {
    changeTitle("Edit Profile");
  });

  const handleTogglePassword = (e: Event) => {
    e.preventDefault();

    const target = e.currentTarget as HTMLButtonElement;
    const inputField = target.previousElementSibling as HTMLInputElement;

    if (!inputField) return;

    const fieldMap: Record<string, keyof IPasswordState> = {
      [currentPasswordInput?.id || "current"]: "currentPassword",
      [newPasswordInput?.id || "new"]: "newPassword",
      [confirmPasswordInput?.id || "confirm"]: "confirmPassword",
    };

    const fieldKey = Object.keys(fieldMap).find(
      (key) =>
        inputField ===
        (key.includes("current")
          ? currentPasswordInput
          : key.includes("new")
          ? newPasswordInput
          : confirmPasswordInput)
    );

    if (fieldKey) {
      const stateKey = fieldMap[fieldKey];
      setPasswordState(stateKey, !passwordState[stateKey]);
      inputField.type = passwordState[stateKey] ? "password" : "text";
      inputField.placeholder = passwordState[stateKey]
        ? "••••••••"
        : "Masukan kata sandi";
    }
  };

  const validateProfileForm = (): boolean => {
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const newErrors: IErrorsBody = {};

    if (!name) {
      newErrors.name = ["Nama tidak boleh kosong."];
      println("Edit Profile", "Nama tidak boleh kosong.", EDebugType.ERROR);
    } else if (/[^a-zA-Z\s]/.test(name)) {
      newErrors.name = ["Nama hanya boleh berisi huruf dan spasi."];
      println(
        "Edit Profile",
        "Nama hanya boleh berisi huruf dan spasi.",
        EDebugType.ERROR
      );
    }

    if (!email) {
      newErrors.email = ["Email tidak boleh kosong."];
      println("Edit Profile", "Email tidak boleh kosong.", EDebugType.ERROR);
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = ["Format email tidak valid."];
      println("Edit Profile", "Format email tidak valid.", EDebugType.ERROR);
    }

    if (getObjectLength(newErrors) > 0) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
      return false;
    }

    return true;
  };

  const validatePasswordForm = (): boolean => {
    const currentPassword = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const newErrors: IErrorsBody = {};

    if (!currentPassword) {
      newErrors.current_password = ["Kata sandi saat ini tidak boleh kosong."];
      println(
        "Edit Profile",
        "Kata sandi saat ini tidak boleh kosong.",
        EDebugType.ERROR
      );
    } else if (currentPassword.length < 8) {
      newErrors.current_password = ["Kata sandi saat ini minimal 8 karakter."];
      println(
        "Edit Profile",
        "Kata sandi saat ini minimal 8 karakter.",
        EDebugType.ERROR
      );
    }

    if (!newPassword) {
      newErrors.new_password = ["Kata sandi baru tidak boleh kosong."];
      println(
        "Edit Profile",
        "Kata sandi baru tidak boleh kosong.",
        EDebugType.ERROR
      );
    } else if (newPassword.length < 8) {
      newErrors.new_password = ["Kata sandi baru minimal 8 karakter."];
      println(
        "Edit Profile",
        "Kata sandi baru minimal 8 karakter.",
        EDebugType.ERROR
      );
    }

    if (!confirmPassword) {
      newErrors.confirm_password = [
        "Konfirmasi kata sandi tidak boleh kosong.",
      ];
      println(
        "Edit Profile",
        "Konfirmasi kata sandi tidak boleh kosong.",
        EDebugType.ERROR
      );
    } else if (confirmPassword !== newPassword) {
      newErrors.confirm_password = ["Konfirmasi kata sandi tidak sesuai."];
      println(
        "Edit Profile",
        "Konfirmasi kata sandi tidak sesuai.",
        EDebugType.ERROR
      );
    }

    if (getObjectLength(newErrors) > 0) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
      return false;
    }

    return true;
  };

  const handleSubmitProfile = async (e: Event) => {
    e.preventDefault();

    setErrors({});
    setLoading(true);

    if (!validateProfileForm()) {
      setLoading(false);
      return;
    }

    submitProfileButton.textContent = "Menyimpan...";

    try {
      await api.post("/dashboard/profile", {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
      });
      println(
        "Edit Profile",
        "Profil berhasil diperbarui.",
        EDebugType.SUCCESS
      );
      updateData(EAuthUpdateCategory.USER, {
        ...user(),
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
      });
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
      println("Edit Profile", "Gagal memperbarui profil.", EDebugType.ERROR);
    } finally {
      setLoading(false);
      submitProfileButton.textContent = "Simpan Perubahan";
    }
  };

  const handleSubmitPassword = async (e: Event) => {
    e.preventDefault();

    setErrors({});
    setLoading(true);

    if (!validatePasswordForm()) {
      setLoading(false);
      return;
    }

    submitPasswordButton.textContent = "Menyimpan...";

    try {
      await api.post("/dashboard/profile", {
        old_password: currentPasswordInput.value,
        password: newPasswordInput.value,
        password_confirmation: confirmPasswordInput.value,
      });
      println(
        "Edit Profile",
        "Kata sandi berhasil diperbarui.",
        EDebugType.SUCCESS
      );
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
      println(
        "Edit Profile",
        "Gagal memperbarui kata sandi.",
        EDebugType.ERROR
      );
    } finally {
      setLoading(false);
      currentPasswordInput.value = "";
      newPasswordInput.value = "";
      confirmPasswordInput.value = "";
      submitPasswordButton.textContent = "Ubah Kata Sandi";
    }
  };

  onMount(() => {
    submitProfileButton?.addEventListener("click", handleSubmitProfile);
    submitPasswordButton?.addEventListener("click", handleSubmitPassword);

    onCleanup(() => {
      submitProfileButton?.removeEventListener("click", handleSubmitProfile);
      submitPasswordButton?.removeEventListener("click", handleSubmitPassword);
    });
  });

  return (
    <>
      <div class="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div class="flex items-center gap-4 w-full sm:w-auto">
            <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-lg sm:text-xl font-bold flex-shrink-0">
              {user()?.name ? user()?.name.charAt(0).toUpperCase() : "A"}
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
            href="/profile"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 cursor-pointer flex items-center gap-2 whitespace-nowrap w-full sm:w-auto justify-center sm:justify-start"
          >
            <Fa icon={faArrowLeft} />
            <span>Kembali ke Profil</span>
          </A>
        </div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <h1 class="text-2xl font-semibold mb-4">Ubah Profil</h1>
          <form class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div class="mb-4">
              <label for="name" class="block text-gray-700 font-medium mb-2">
                Nama
              </label>
              <input
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukan nama Anda"
                value={user()?.name || ""}
                ref={(el) => (nameInput = el)}
                disabled={loading()}
              />
              <Show when={errors().name}>
                <div class="mt-1 text-sm text-red-600">
                  <For each={errors().name}>
                    {(error) => <div>{error}</div>}
                  </For>
                </div>
              </Show>
            </div>
            <div class="mb-4">
              <label for="email" class="block text-gray-700 font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukan email Anda"
                value={user()?.email || ""}
                ref={(el) => (emailInput = el)}
                disabled={loading()}
              />
              <Show when={errors().email}>
                <div class="mt-1 text-sm text-red-600">
                  <For each={errors().email}>
                    {(error) => <div>{error}</div>}
                  </For>
                </div>
              </Show>
            </div>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
              ref={(el) => (submitProfileButton = el)}
              disabled={loading()}
            >
              Simpan Perubahan
            </button>
          </form>
        </div>
        <div>
          <h1 class="text-2xl font-semibold mb-4">Ubah Kata Sandi</h1>
          <form class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div class="mb-4 relative">
              <label
                for="current-password"
                class="block text-gray-700 font-medium mb-2"
              >
                Kata Sandi Saat Ini
              </label>
              <div class="relative">
                <input
                  type="password"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                  placeholder="••••••••"
                  ref={(el) => (currentPasswordInput = el)}
                  required
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={handleTogglePassword}
                  disabled={loading()}
                >
                  <Fa
                    icon={passwordState.currentPassword ? faEyeSlash : faEye}
                    class="text-gray-400 hover:text-gray-600 transition-colors"
                  />
                </button>
              </div>
              <Show when={errors().current_password}>
                <div class="mt-1 text-sm text-red-600">
                  <For each={errors().current_password}>
                    {(error) => <div>{error}</div>}
                  </For>
                </div>
              </Show>
            </div>
            <div class="mb-4 relative">
              <label class="block text-gray-700 font-medium mb-2">
                Kata Sandi Baru
              </label>
              <div class="relative">
                <input
                  type="password"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                  ref={(el) => (newPasswordInput = el)}
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={handleTogglePassword}
                  disabled={loading()}
                >
                  <Fa
                    icon={passwordState.newPassword ? faEyeSlash : faEye}
                    class="text-gray-400 hover:text-gray-600 transition-colors"
                  />
                </button>
              </div>
              <Show when={errors().new_password}>
                <div class="mt-1 text-sm text-red-600">
                  <For each={errors().new_password}>
                    {(error) => <div>{error}</div>}
                  </For>
                </div>
              </Show>
            </div>
            <div class="mb-4 relative">
              <label class="block text-gray-700 font-medium mb-2">
                Konfirmasi Kata Sandi Baru
              </label>
              <div class="relative">
                <input
                  type="password"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                  ref={(el) => (confirmPasswordInput = el)}
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={handleTogglePassword}
                  disabled={loading()}
                >
                  <Fa
                    icon={passwordState.confirmPassword ? faEyeSlash : faEye}
                    class="text-gray-400 hover:text-gray-600 transition-colors"
                  />
                </button>
              </div>
              <Show when={errors().confirm_password}>
                <div class="mt-1 text-sm text-red-600">
                  <For each={errors().confirm_password}>
                    {(error) => <div>{error}</div>}
                  </For>
                </div>
              </Show>
            </div>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
              ref={(el) => (submitPasswordButton = el)}
              disabled={loading()}
            >
              Ubah Kata Sandi
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditProfile;
