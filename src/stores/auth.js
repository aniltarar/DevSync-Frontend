import { defineStore } from "pinia";
import api from "@/api";
import router from "@/router";
import { useAppStore } from "@/stores/app";
import { getMediaUrl } from "@/utils/mediaUrl";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    status: "idle",
    user: JSON.parse(localStorage.getItem("user")) || null,
    message: "",
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
    avatarUrl: (state) => getMediaUrl(state.user?.profile?.avatarUrl),
  },
  actions: {
    async register(userData) {
      const appStore = useAppStore();
      this.status = "loading";
      this.message = "";
      try {
        const response = await api.post("/auth/register", userData);
        this.status = "success";
        this.message = response.data.message || "Kayıt başarılı!";
        appStore.success(this.message);
        router.push("/auth/login");
      } catch (error) {
        this.status = "error";
        this.message =
          error.response?.data?.message || "Kayıt işlemi başarısız.";
        appStore.error(this.message);
      }
    },
    async login(credentials) {
      const appStore = useAppStore();
      this.status = "loading";
      this.message = "";
      try {
        const response = await api.post("/auth/login", credentials);
        const { user, message } = response.data;

        this.user = user;
        this.status = "success";
        this.message = message || "Başarıyla giriş yapıldı.";

        localStorage.setItem("user", JSON.stringify(user));
        appStore.success(this.message);
        router.push("/feed");
      } catch (error) {
        this.status = "error";
        this.message =
          error.response?.data?.message || "Giriş işlemi başarısız.";
        appStore.error(this.message);
      }
    },
    logout() {
      const appStore = useAppStore();
      this.user = null;
      this.status = "idle";
      localStorage.removeItem("user");
      appStore.info("Çıkış yapıldı.");
      router.push("/");
    },
    async updateProfile(data) {
      const appStore = useAppStore();
      this.status = "loading";
      try {
        const response = await api.put("/auth/profile", data);
        this.user = response.data.user;
        localStorage.setItem("user", JSON.stringify(this.user));
        this.status = "success";
        appStore.success(response.data.message || "Profil güncellendi.");
        return true;
      } catch (error) {
        this.status = "error";
        appStore.error(error.response?.data?.message || "Profil güncellenemedi.");
        return false;
      }
    },
  },
});
