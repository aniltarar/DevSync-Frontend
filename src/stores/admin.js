import { defineStore } from "pinia";
import api from "@/api";
import { useAppStore } from "@/stores/app";

export const useAdminStore = defineStore("admin", {
  state: () => ({
    // Dashboard
    stats: null,
    recentUsers: [],
    recentReports: [],

    // Users
    users: [],
    usersPagination: null,
    currentUser: null,
    userStatistics: null,

    // Reports
    reports: [],
    reportsPagination: null,
    reportStatistics: null,
    currentReport: null,

    // Posts
    posts: [],
    postsPagination: null,

    // Projects
    projects: [],
    projectsPagination: null,

    // Comments
    comments: [],
    commentsPagination: null,

    // Genel
    status: "idle",
    pendingReportsCount: 0,
  }),

  actions: {
    // ─── Dashboard ───
    async fetchDashboardStats() {
      const appStore = useAppStore();
      this.status = "loading";
      try {
        const { data } = await api.get("/admin/stats");
        this.stats = data.stats;
        this.recentUsers = data.recentUsers;
        this.recentReports = data.recentReports;
        this.pendingReportsCount = data.stats.pendingReports;
        this.status = "success";
      } catch (error) {
        this.status = "error";
        appStore.apiError(error, "Dashboard verileri alınamadı.");
      }
    },

    // ─── Users ───
    async fetchUsers(params = {}) {
      const appStore = useAppStore();
      this.status = "loading";
      try {
        const { data } = await api.get("/admin/users", { params });
        this.users = data.users;
        this.usersPagination = data.pagination;
        this.status = "success";
      } catch (error) {
        this.status = "error";
        appStore.apiError(error, "Kullanıcılar alınamadı.");
      }
    },

    async fetchUserById(userId) {
      const appStore = useAppStore();
      this.status = "loading";
      this.currentUser = null;
      this.userStatistics = null;
      try {
        const { data } = await api.get(`/admin/users/${userId}`);
        this.currentUser = data.user;
        this.userStatistics = data.statistics;
        this.status = "success";
      } catch (error) {
        this.status = "error";
        appStore.apiError(error, "Kullanıcı bilgileri alınamadı.");
      }
    },

    async updateUserStatus(userId, status) {
      const appStore = useAppStore();
      try {
        const { data } = await api.patch(`/admin/users/${userId}/status`, { status });
        appStore.success(data.message);
        // Listeyi güncelle
        const idx = this.users.findIndex((u) => u._id === userId);
        if (idx !== -1) this.users[idx].status = status;
        return true;
      } catch (error) {
        appStore.apiError(error, "Kullanıcı durumu değiştirilemedi.");
        return false;
      }
    },

    async updateUserRole(userId, role) {
      const appStore = useAppStore();
      try {
        const { data } = await api.patch(`/admin/users/${userId}/role`, { role });
        appStore.success(data.message);
        const idx = this.users.findIndex((u) => u._id === userId);
        if (idx !== -1) this.users[idx].role = role;
        return true;
      } catch (error) {
        appStore.apiError(error, "Kullanıcı rolü değiştirilemedi.");
        return false;
      }
    },

    // ─── Reports ───
    async fetchReports(params = {}) {
      const appStore = useAppStore();
      this.status = "loading";
      try {
        const { data } = await api.get("/reports/admin", { params });
        this.reports = data.reports;
        this.reportsPagination = data.pagination;
        this.reportStatistics = data.statistics;
        this.pendingReportsCount = data.statistics?.pending || 0;
        this.status = "success";
      } catch (error) {
        this.status = "error";
        appStore.apiError(error, "Raporlar alınamadı.");
      }
    },

    async fetchReportById(reportId) {
      const appStore = useAppStore();
      this.status = "loading";
      this.currentReport = null;
      try {
        const { data } = await api.get(`/reports/${reportId}`);
        this.currentReport = data.report;
        this.status = "success";
      } catch (error) {
        this.status = "error";
        appStore.apiError(error, "Rapor detayı alınamadı.");
      }
    },

    async resolveReport(reportId, { actionTaken, adminNote }) {
      const appStore = useAppStore();
      try {
        const { data } = await api.patch(`/reports/resolve/${reportId}`, { actionTaken, adminNote });
        appStore.success(data.message);
        // Listeyi güncelle
        const idx = this.reports.findIndex((r) => r._id === reportId);
        if (idx !== -1) {
          this.reports[idx].status.state = "resolved";
          this.reports[idx].status.actionTaken = actionTaken;
        }
        return true;
      } catch (error) {
        appStore.apiError(error, "Rapor çözülemedi.");
        return false;
      }
    },

    // ─── Posts ───
    async fetchPosts(params = {}) {
      const appStore = useAppStore();
      this.status = "loading";
      try {
        const { data } = await api.get("/admin/posts", { params });
        this.posts = data.posts;
        this.postsPagination = data.pagination;
        this.status = "success";
      } catch (error) {
        this.status = "error";
        appStore.apiError(error, "Gönderiler alınamadı.");
      }
    },

    async deletePost(postId) {
      const appStore = useAppStore();
      try {
        const { data } = await api.delete(`/admin/posts/${postId}`);
        appStore.success(data.message);
        this.posts = this.posts.filter((p) => p._id !== postId);
        return true;
      } catch (error) {
        appStore.apiError(error, "Gönderi silinemedi.");
        return false;
      }
    },

    // ─── Projects ───
    async fetchProjects(params = {}) {
      const appStore = useAppStore();
      this.status = "loading";
      try {
        const { data } = await api.get("/admin/projects", { params });
        this.projects = data.projects;
        this.projectsPagination = data.pagination;
        this.status = "success";
      } catch (error) {
        this.status = "error";
        appStore.apiError(error, "Projeler alınamadı.");
      }
    },

    async updateProjectStatus(projectId, status) {
      const appStore = useAppStore();
      try {
        const { data } = await api.patch(`/admin/projects/${projectId}/status`, { status });
        appStore.success(data.message);
        const idx = this.projects.findIndex((p) => p._id === projectId);
        if (idx !== -1) this.projects[idx].status = status;
        return true;
      } catch (error) {
        appStore.apiError(error, "Proje durumu değiştirilemedi.");
        return false;
      }
    },

    // ─── Comments ───
    async fetchComments(params = {}) {
      const appStore = useAppStore();
      this.status = "loading";
      try {
        const { data } = await api.get("/admin/comments", { params });
        this.comments = data.comments;
        this.commentsPagination = data.pagination;
        this.status = "success";
      } catch (error) {
        this.status = "error";
        appStore.apiError(error, "Yorumlar alınamadı.");
      }
    },

    async deleteComment(commentId) {
      const appStore = useAppStore();
      try {
        const { data } = await api.delete(`/admin/comments/${commentId}`);
        appStore.success(data.message);
        this.comments = this.comments.filter((c) => c._id !== commentId);
        return true;
      } catch (error) {
        appStore.apiError(error, "Yorum silinemedi.");
        return false;
      }
    },
  },
});
