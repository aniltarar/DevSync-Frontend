import { defineStore } from "pinia";
import api from "@/api";
import { useAppStore } from "@/stores/app";

export const useReportStore = defineStore("report", {
  state: () => ({
    status: "idle",
    message: "",
    myReports: [],
    currentReport: null,
    totalReports: 0,
    page: 1,
    limit: 10,
  }),
  getters: {
    pagination: (state) => ({
      totalPages: Math.ceil(state.totalReports / state.limit) || 1,
      totalReports: state.totalReports,
      page: state.page,
      limit: state.limit,
    }),
  },
  actions: {
    // Rapor oluştur
    async createReport({ reportType, contentId, reason, description }) {
      const appStore = useAppStore();
      this.status = "loading";
      this.message = "";
      try {
        const payload = { reportType, reason, description };
        if (contentId) payload.contentId = contentId;
        const response = await api.post("/reports/", payload);
        this.status = "success";
        appStore.success("Raporunuz başarıyla gönderildi.");
        return response.data.report;
      } catch (error) {
        this.status = "error";
        this.message = error.response?.data?.message || "Rapor gönderilemedi.";
        appStore.apiError(error, "Rapor gönderilemedi.");
        return null;
      }
    },

    // Kendi raporlarımı getir
    async getMyReports({ page = 1, limit = 10, reportType } = {}) {
      const appStore = useAppStore();
      this.status = "loading";
      this.message = "";
      try {
        const params = { page, limit };
        if (reportType) params.reportType = reportType;
        const response = await api.get("/reports/my-reports", { params });
        this.myReports = response.data.reports;
        this.totalReports = response.data.totalReports;
        this.page = response.data.page;
        this.limit = response.data.limit;
        this.status = "success";
      } catch (error) {
        this.status = "error";
        this.message = error.response?.data?.message || "Raporlar alınamadı.";
        appStore.apiError(error, "Raporlar alınamadı.");
      }
    },

    // Raporu ID ile getir
    async getReportById(reportId) {
      const appStore = useAppStore();
      this.status = "loading";
      this.message = "";
      this.currentReport = null;
      try {
        const response = await api.get(`/reports/${reportId}`);
        this.currentReport = response.data.report;
        this.status = "success";
      } catch (error) {
        this.status = "error";
        this.message = error.response?.data?.message || "Rapor alınamadı.";
        appStore.apiError(error, "Rapor alınamadı.");
      }
    },

    // Raporu iptal et
    async cancelReport(reportId) {
      const appStore = useAppStore();
      this.status = "loading";
      this.message = "";
      try {
        await api.post(`/reports/cancel/${reportId}`);
        this.status = "success";
        appStore.success("Rapor başarıyla iptal edildi.");
        return true;
      } catch (error) {
        this.status = "error";
        this.message = error.response?.data?.message || "Rapor iptal edilemedi.";
        appStore.apiError(error, "Rapor iptal edilemedi.");
        return false;
      }
    },
  },
});
