import { defineStore } from "pinia";
import api from "@/api";
import router from "@/router";
import { useAppStore } from "@/stores/app";
import { getMediaUrl } from "@/utils/mediaUrl";
import { connectSocket, disconnectSocket } from "@/socket";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    status: "idle",
    user: JSON.parse(localStorage.getItem("user")) || null,
    profileUser: null,
    profileIsBlocked: false,
    profileIsBlockedBy: false,
    profileIsFollowing: false,
    profileIsFollowedBy: false,
    profileFollowersCount: 0,
    profileFollowingCount: 0,
    following: [],
    followers: [],
    searchResults: [],
    searchStatus: "idle",
    message: "",
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
    avatarUrl: (state) => getMediaUrl(state.user?.profile?.avatarUrl),
    fullName: (state) => {
      if (!state.user) return "";
      const { name, surname } = state.user.profile || {};
      return `${name || ""} ${surname || ""}`.trim();
    },
  },
  actions: {
    async refreshToken() {
      try {
        const response = await api.post("/auth/token-refresh");
        return response.data.accessToken;
      } catch {
        return null;
      }
    },
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

        const { useSocketStore } = await import("@/stores/socket");
        useSocketStore().init();

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

        disconnectSocket();
        const { useSocketStore } = await import("@/stores/socket");
        useSocketStore().reset();

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
    async deleteAvatar(){
      const appStore = useAppStore();
      this.status = "loading";
      try {
        const response = await api.delete("/auth/avatar");
        this.user = { ...this.user, profile: response.data.profile };
        localStorage.setItem("user", JSON.stringify(this.user));
        this.status = "success";
        appStore.success(response.data.message || "Avatar silindi.");
        return true;
      } catch (error) {
        this.status = "error";
        appStore.apiError(error, "Avatar silinemedi.");
        return false;
      } 
    },
    async fetchUserById(userId) {
      const appStore = useAppStore();
      this.status = "loading";
      this.profileUser = null;
      this.profileIsBlocked = false;
      this.profileIsFollowing = false;
      this.profileIsFollowedBy = false;
      this.profileFollowersCount = 0;
      this.profileFollowingCount = 0;
      try {
        const response = await api.get(`/auth/profile/${userId}`);
        this.profileUser = response.data.user;
        this.profileIsBlocked = response.data.isBlocked ?? false;
        this.profileIsBlockedBy = response.data.isBlockedBy ?? false;
        this.profileIsFollowing = response.data.isFollowing ?? false;
        this.profileIsFollowedBy = response.data.isFollowedBy ?? false;
        this.profileFollowersCount = response.data.followersCount ?? 0;
        this.profileFollowingCount = response.data.followingCount ?? 0;
        this.status = "success";
      } catch (error) {
        this.status = "error";
        appStore.apiError(error, "Kullanıcı profili yüklenemedi.");
      }
    },
    async followUser(userId) {
      const appStore = useAppStore();
      try {
        const response = await api.post(`/auth/follow/${userId}`);
        appStore.success(response.data.message || "İşlem başarılı.");
        const wasFollowing = this.profileIsFollowing;
        this.profileIsFollowing = !wasFollowing;
        this.profileFollowersCount += wasFollowing ? -1 : 1;
        return response.data;
      } catch (error) {
        appStore.apiError(error, "Takip işlemi başarısız.");
        return null;
      }
    },
    async fetchFollowing() {
      const appStore = useAppStore();
      this.status = "loading";
      try {
        const response = await api.get("/auth/following");
        this.following = response.data.following ?? response.data.data ?? [];
        this.status = "success";
      } catch (error) {
        this.status = "error";
        appStore.apiError(error, "Takip edilenler yüklenemedi.");
      }
    },
    async fetchFollowers() {
      const appStore = useAppStore();
      this.status = "loading";
      try {
        const response = await api.get("/auth/followers");
        this.followers = response.data.followers ?? response.data.data ?? [];
        this.status = "success";
      } catch (error) {
        this.status = "error";
        appStore.apiError(error, "Takipçiler yüklenemedi.");
      }
    },
    async searchUsers(query) {
      const appStore = useAppStore();
      this.searchStatus = "loading";
      try {
        const response = await api.get("/auth/users/search", { params: { q: query } });
        this.searchResults = response.data.users ?? response.data.data ?? [];
        this.searchStatus = "success";
      } catch (error) {
        this.searchStatus = "error";
        appStore.apiError(error, "Kullanıcı araması başarısız.");
      }
    },
    async blockUser(userId) {
      const appStore = useAppStore();
      try {
        const response = await api.post(`/auth/block/${userId}`);
        appStore.success(response.data.message || "Kullanıcı engellendi.");
        this.profileIsBlocked = !this.profileIsBlocked;
        return response.data;
      } catch (error) {
        appStore.apiError(error, "Engelleme işlemi başarısız.");
        return null;
      }
    },
  },
});
