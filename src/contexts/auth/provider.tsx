import AuthContext from "./context";
import { useLocation, useNavigate } from "@solidjs/router";
import { createSignal, createEffect, Component, Show } from "solid-js";
import { EMAIL_KEY_PREFIX, TOKEN_KEY_PREFIX } from "@consts";
import { IAuthUserData, IProviderProp } from "./interface";
import { EAuthUpdateCategory, EDebugType } from "@enums";
import { LocalStorage, println } from "@utils";
import { api } from "@services";

const AuthProvider: Component<IProviderProp> = (props: IProviderProp) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [checked, setChecked] = createSignal<boolean>(false);
  const [user, setUser] = createSignal<IAuthUserData | null>(null);
  const [isLogged, setIsLogged] = createSignal<boolean>(false);
  const [authToken, setAuthToken] = createSignal<string>("");

  const updateData = (category: EAuthUpdateCategory, data: any) => {
    switch (category) {
      case EAuthUpdateCategory.USER:
        setUser(data);
        LocalStorage.setItem(EMAIL_KEY_PREFIX, data.email);
        break;
      case EAuthUpdateCategory.TOKEN:
        setAuthToken(data);
        LocalStorage.setItem(TOKEN_KEY_PREFIX, data);
        break;
      case EAuthUpdateCategory.IS_LOGGED:
        setIsLogged(data);
        break;
      default:
        break;
    }
  };

  const logoutUser = async () => {
    await api
      .post("/logout")
      .then(async (response) => {
        const { success, message } = response.data;

        if (!success) {
          println("Logout Gagal", message, EDebugType.WARN);
        } else {
          println("Logout Berhasil", message, EDebugType.SUCCESS);
        }
      })
      .catch((error) => {
        println("Pengecekan Sesi Error", error.message, EDebugType.ERROR);
      })
      .finally(() => {
        LocalStorage.removeItem(TOKEN_KEY_PREFIX);
        LocalStorage.removeItem(EMAIL_KEY_PREFIX);
        setUser(null);
        setAuthToken("");
        setIsLogged(false);
        navigate("/login", { replace: true });
      });
  };

  createEffect(() => {
    if (isLogged() || checked()) return;

    const token = LocalStorage.getItem(TOKEN_KEY_PREFIX);
    const email = LocalStorage.getItem(EMAIL_KEY_PREFIX);

    if (!token || !email) {
      setChecked(true);
      setIsLogged(false);
      navigate("/login", { replace: true });
      return;
    }

    const oldPath = location.pathname;
    const oldState = location.state;

    const loadSession = async () => {
      await api
        .post("/check-session")
        .then(async (response) => {
          const { active, reason, valid_until } = response.data;

          if (!active) {
            throw new Error(reason || "Sesi tidak aktif");
          }

          if (valid_until < 60) {
            throw new Error("Sesi kedaluwarsa");
          }

          await api
            .get("/dashboard/profile")
            .then((res) => {
              const userData = res.data.data;
              if (!userData) {
                throw new Error("Gagal mengambil data pengguna");
              }

              if (userData.email !== email) {
                throw new Error("Email tidak cocok");
              }

              setUser(userData);
              setIsLogged(true);

              if (location.pathname == oldPath) return;

              navigate(oldPath, { replace: true, state: oldState });
            })
            .catch(() => {
              throw new Error("Gagal mengambil data pengguna");
            });
        })
        .catch((error) => {
          println("Pengecekan Sesi Error", error.message, EDebugType.ERROR);
          LocalStorage.removeItem(TOKEN_KEY_PREFIX);
          LocalStorage.removeItem(EMAIL_KEY_PREFIX);
        })
        .finally(() => {
          setChecked(true);
        });
    };

    loadSession();
  });

  return (
    <AuthContext.Provider
      value={{ user, isLogged, authToken, updateData, logoutUser, checked }}
    >
      <Show
        when={checked()}
        fallback={
          <div class="flex justify-center items-center h-screen bg-gray-100">
            <div class="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        }
      >
        {props.children}
      </Show>
    </AuthContext.Provider>
  );
};

export default AuthProvider;
