import AuthContext from "./context";
import { useLocation, useNavigate } from "@solidjs/router";
import { createSignal, createEffect, Component } from "solid-js";
import { EMAIL_KEY_PREFIX, TOKEN_KEY_PREFIX } from "@consts";
import { IAuthUserData, IProviderProp } from "./interface";
import { EAuthUpdateCategory } from "@enums";
import { LocalStorage } from "@utils";
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

  const logoutUser = () => {
    LocalStorage.removeItem(TOKEN_KEY_PREFIX);
    LocalStorage.removeItem(EMAIL_KEY_PREFIX);
    setUser(null);
    setAuthToken("");
    setIsLogged(false);
    navigate("/login", { replace: true });
  };

  createEffect(() => {
    checkIsLogged();
  });

  const checkIsLogged = async () => {
    if (isLogged() || checked()) return;

    const token = LocalStorage.getItem(TOKEN_KEY_PREFIX);
    const email = LocalStorage.getItem(EMAIL_KEY_PREFIX);

    if (!token || !email) {
      setChecked(true);
      setIsLogged(false);
      [TOKEN_KEY_PREFIX, EMAIL_KEY_PREFIX].forEach((key) => {
        LocalStorage.removeItem(key);
      });
      navigate("/login", { replace: true });
      return;
    }

    const oldPath = location.pathname;
    const oldQuery = location.query;
    const oldState = location.state;

    await api
      .post("/check-session")
      .then(async (response) => {
        const data = response.data;

        if (!data.active) {
          throw new Error("Inactive session");
        }

        if (data.valid_until < 60) {
          throw new Error("Expired session");
        }

        await api
          .post("/dashboard/profile")
          .then((res) => {
            const userData = res.data.data;
            setUser(userData);
            setIsLogged(true);

            if (location.pathname == oldPath) return;

            const fixedPath = oldQuery ? `${oldPath}?${oldQuery}` : oldPath;

            navigate(fixedPath, { replace: true, state: oldState });
          })
          .catch(() => {
            throw new Error("Failed to fetch user data");
          });
      })
      .catch(() => {
        logoutUser();
      })
      .finally(() => {
        setChecked(true);
      });
  };

  return (
    <AuthContext.Provider
      value={{ user, isLogged, authToken, updateData, logoutUser }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
