import { AuthLayout } from "@layouts";
import { Component, createSignal, For, Show } from "solid-js";
import { api } from "@services";
import { useNavigate } from "@solidjs/router";
import { Auth } from "@contexts";
import { EAuthUpdateCategory, EDebugType } from "@enums";
import { println } from "@utils";

interface IErrorsBody {
  email?: string[];
  password?: string[];
}

const Login: Component = () => {
  const navigate = useNavigate();
  const { updateData } = Auth.useAuth();
  const [loading, setLoading] = createSignal<boolean>(false);
  const [errors, setErrors] = createSignal<IErrorsBody>({});

  let emailInput: HTMLInputElement, passwordInput: HTMLInputElement;

  const validateForm = (): boolean => {
    let isValid = true;
    const email = emailInput.value;
    const password = passwordInput.value;

    if (!email || !password) {
      setErrors({
        email: !email ? ["Email harus di isi"] : [],
        password: !password ? ["Password harus di isi"] : [],
      });
      println("Login", "Semua input harus di isi", EDebugType.WARN);
      return false;
    }

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isEmailValid) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: ["Format email tidak valid"],
      }));
      println("Login", "Format email tidak valid", EDebugType.WARN);
      isValid = false;
    }

    const isPasswordValid = password.length >= 8;
    if (!isPasswordValid) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        password: ["Password harus terdiri dari minimal 8 karakter"],
      }));
      println(
        "Login",
        "Password harus terdiri dari minimal 8 karakter",
        EDebugType.WARN
      );
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();

    setErrors({});
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    api
      .post("/login", {
        email: emailInput.value,
        password: passwordInput.value,
      })
      .then((response) => {
        const { success, data, message } = response.data;
        if (!success) throw new Error("Login failed");

        const { user, access_token } = data;
        updateData(EAuthUpdateCategory.IS_LOGGED, true);
        updateData(EAuthUpdateCategory.USER, user);
        updateData(EAuthUpdateCategory.TOKEN, access_token);

        println("Login", message, EDebugType.SUCCESS);
        navigate("/", { replace: true });
      })
      .catch((error) => {
        if (error.response && error.response.status === 422) {
          const responseData = error.response.data;
          println(
            "Login",
            "Satu atau lebih input tidak valid.",
            EDebugType.ERROR
          );
          setErrors(responseData.errors);
        } else {
          println(
            "Login",
            "Seperti ada yang tidak beres. Jika masalah berlanjut, silakan hubungi administrator.",
            EDebugType.ERROR
          );
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleTogglePassword = (e: Event) => {
    e.preventDefault();

    const icon = document.getElementById("passico")!;
    const isTypePassword = passwordInput.type === "password";

    passwordInput.type = isTypePassword ? "text" : "password";
    passwordInput.placeholder = isTypePassword
      ? "Masukkan kata sandi"
      : "••••••••";

    if (isTypePassword) {
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
    } else {
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    }
  };

  return (
    <AuthLayout title="Login">
      <div class="max-w-md w-full space-y-8">
        <div class="text-center">
          <div class="mx-auto w-20 h-20 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
            <i class="fas fa-map-marked-alt text-white text-2xl"></i>
          </div>
          <h2 class="mt-6 text-3xl font-bold text-blue-900">
            Admin Pariwisata
          </h2>
          <p class="mt-2 text-sm text-gray-600">
            Masuk untuk mengelola sistem pariwisata anda.
          </p>
        </div>

        <form id="login-form" class="mt-8 space-y-6">
          <div class="card">
            <div class="space-y-6">
              <div class="relative">
                <label for="email" class="login-label">
                  Email Administrator
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i class="fas fa-envelope text-gray-400"></i>
                  </div>
                  <input
                    name="email"
                    type="email"
                    required
                    class="login-input"
                    placeholder="admin@gmail.com"
                    disabled={loading()}
                    ref={(el) => (emailInput = el)}
                    autocomplete="email"
                  />
                </div>
                <Show when={errors().email}>
                  <div class="mt-1 text-sm text-red-600">
                    <For each={errors().email}>
                      {(error) => <div>{error}</div>}
                    </For>
                  </div>
                </Show>
              </div>

              <div class="relative">
                <label for="password" class="login-label">
                  Kata Sandi
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i class="fas fa-lock text-gray-400"></i>
                  </div>
                  <input
                    name="password"
                    type="password"
                    required
                    class="login-input pr-12"
                    placeholder="••••••••"
                    disabled={loading()}
                    ref={(el) => (passwordInput = el)}
                    autocomplete="current-password"
                  />
                  <button
                    type="button"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    onClick={handleTogglePassword}
                    disabled={loading()}
                  >
                    <i
                      id="passico"
                      class="fas fa-eye-slash text-gray-400 hover:text-gray-600 transition-colors"
                    ></i>
                  </button>
                </div>
                <Show when={errors().password}>
                  <div class="mt-1 text-sm text-red-600">
                    <For each={errors().password}>
                      {(error) => <div>{error}</div>}
                    </For>
                  </div>
                </Show>
              </div>

              <button
                type="submit"
                id="login-btn"
                class="group relative w-full btn-primary py-3 text-base shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                onClick={handleSubmit}
                disabled={loading()}
              >
                <Show
                  when={!loading()}
                  fallback={
                    <>
                      <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                        <i class="fas fa-spinner fa-spin text-white opacity-75"></i>
                      </span>
                      Memproses
                    </>
                  }
                >
                  <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                    <i class="fas fa-sign-in-alt text-white opacity-75 group-hover:opacity-100 transition-opacity"></i>
                  </span>
                  Masuk ke Dashboard
                </Show>
              </button>
            </div>
          </div>
        </form>

        <div class="text-center">
          <p class="text-sm text-gray-500">
            Sistem Manajemen Pariwisata <br />
          </p>
          <div class="mt-4 flex justify-center space-x-4 text-gray-400">
            <i class="fas fa-globe-asia" title="Platform Global"></i>
            <i class="fas fa-map-pin" title="Lokasi Terpercaya"></i>
            <i class="fas fa-shield-alt" title="Keamanan Terjamin"></i>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
