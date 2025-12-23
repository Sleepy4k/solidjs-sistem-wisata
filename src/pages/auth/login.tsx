import { AuthLayout } from "@layouts";
import { Component } from "solid-js";
import { api } from "@services";
import { A, useNavigate } from "@solidjs/router";
import { Auth } from "@contexts";

const Login: Component = () => {
  const navigate = useNavigate();
  const { updateData } = Auth.useAuth();

  const handleSubmit = (e: Event) => {
    e.preventDefault();

    api
      .post("/login", {
        email: (document.getElementById("email") as HTMLInputElement).value,
        password: (document.getElementById("password") as HTMLInputElement)
          .value,
      })
      .then((response) => {
        const { user, token } = response.data;
      })
      .catch((error) => {
        console.error("Login failed:", error);
        // Handle login error (e.g., show error message)
      });
  };

  const handleTogglePassword = (e: Event) => {
    e.preventDefault();
    const passwordInput = document.getElementById(
      "password"
    ) as HTMLInputElement;
    const passwordIcon = document.getElementById(
      "password-icon"
    ) as HTMLElement;

    const isTypePassword = passwordInput.type === "password";

    passwordInput.type = isTypePassword ? "text" : "password";
    passwordInput.placeholder = isTypePassword
      ? "Masukkan kata sandi"
      : "••••••••";

    if (isTypePassword) {
      passwordIcon.classList.remove("fa-eye");
      passwordIcon.classList.add("fa-eye-slash");
    } else {
      passwordIcon.classList.remove("fa-eye-slash");
      passwordIcon.classList.add("fa-eye");
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
                    id="email"
                    name="email"
                    type="email"
                    required
                    class="login-input"
                    placeholder="admin@gmail.com"
                  />
                </div>
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
                    id="password"
                    name="password"
                    type="password"
                    required
                    class="login-input pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    id="password-toggle"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    onClick={handleTogglePassword}
                  >
                    <i
                      id="password-icon"
                      class="fas fa-eye text-gray-400 hover:text-gray-600 transition-colors"
                    ></i>
                  </button>
                </div>
              </div>

              <div class="flex items-center justify-end">
                <div class="text-sm">
                  <A
                    href="/forgot-password"
                    class="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Lupa kata sandi?
                  </A>
                </div>
              </div>

              <button
                type="submit"
                id="login-btn"
                class="group relative w-full btn-primary py-3 text-base shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                onClick={handleSubmit}
              >
                <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                  <i class="fas fa-sign-in-alt text-white opacity-75 group-hover:opacity-100 transition-opacity"></i>
                </span>
                Masuk ke Dashboard
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
