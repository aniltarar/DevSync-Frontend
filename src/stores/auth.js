import { defineStore } from "pinia";
import api from "@/api";
import router from "@/router";
import { useAppStore } from "@/stores/app";
import { getMediaUrl } from "@/utils/mediaUrl";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    status: "idle",
    user: JSON.parse(localStorage.getItem("user")) || null,
    profileUser: null,
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
        appStore.apiError(error, "Kayıt işlemi başarısız.");
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
        appStore.apiError(error, "Giriş işlemi başarısız.");
      }
    },
    async logout() {
      const appStore = useAppStore();
      this.status = "idle";
      this.message = "";
      try {
        const response = await api.post("/auth/logout");
        this.user = null;
        localStorage.removeItem("user");
        appStore.success(response.data.message || "Başarıyla çıkış yapıldı.");
        router.push("/auth/login");
      } catch (error) {
        appStore.apiError(error, "Çıkış işlemi başarısız.");
      }
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
        appStore.apiError(error, "Profil güncellenemedi.");
        return false;
      }
    },
    async uploadAvatar(file) {
      const appStore = useAppStore();
      this.status = "loading";
      try {
        const formData = new FormData();
        formData.append("avatar", file);
        const response = await api.post("/auth/avatar", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        this.user = { ...this.user, profile: response.data.profile };
        localStorage.setItem("user", JSON.stringify(this.user));
        this.status = "success";
        appStore.success(response.data.message || "Avatar güncellendi.");
        return true;
      } catch (error) {
        this.status = "error";
        appStore.apiError(error, "Avatar yüklenemedi.");
        return false;
      }
    },
    async fetchUserById(userId) {
      const appStore = useAppStore();
      this.status = "loading";
      this.profileUser = null;
      try {
        const response = await api.get(`/auth/profile/${userId}`);
        this.profileUser = response.data.user;
        this.status = "success";
      } catch (error) {
        this.status = "error";
        appStore.apiError(error, "Kullanıcı profili yüklenemedi.");
      }
    },
  },
});
