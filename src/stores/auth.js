import { defineStore } from "pinia";
import api from "@/api";
import router from "@/router";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    status: "idle",
    user: JSON.parse(localStorage.getItem("user")) || null,
    message: "",
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
  },
  actions: {
    async register(userData) {
      this.status = "loading";
      this.message = "";
      try {
        const response = await api.post("/auth/register", userData);
        this.status = "success";
        this.message = response.data.message || "Kayıt başarılı!";
        router.push("/auth/login");
      } catch (error) {
        this.status = "error";
        this.message = error.response?.data?.message || "Kayıt işlemi başarısız.";
      }
    },
    async login(credentials) {
      this.status = "loading";
      this.message = "";
      try {
        const response = await api.post("/auth/login", credentials);
        const { user, message } = response.data;

        this.user = user;
        this.status = "success";
        this.message = message || "Başarıyla giriş yapıldı.";

        localStorage.setItem("user", JSON.stringify(user));

        router.push("/");
      } catch (error) {
        this.status = "error";
        this.message = error.response?.data?.message || "Giriş işlemi başarısız.";
      }
    },
    logout() {
      this.user = null;
      this.status = "idle";
      localStorage.removeItem("user");
      router.push("/auth/login");
    },
  },
});
