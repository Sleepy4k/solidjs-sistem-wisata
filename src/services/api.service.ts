import axios from "axios";
import { BACKEND_URL, EMAIL_KEY_PREFIX, TOKEN_KEY_PREFIX } from "@consts";
import { LocalStorage, println } from "@utils";
import { EDebugType } from "@enums";

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const userToken = LocalStorage.getItem(TOKEN_KEY_PREFIX);
  config.headers.Authorization = userToken ? `Bearer ${userToken}` : "";
  return config;
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const response = error.response;

    if (response) {
      if (response.status === 401) {
        const { success, message } = response.data;
        if (!success) {
          println("Autentikasi gagal", message, EDebugType.ERROR);
          LocalStorage.removeItem(TOKEN_KEY_PREFIX);
          LocalStorage.removeItem(EMAIL_KEY_PREFIX);
          window.location.href = "/login";
        }
      } else {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
