import { defineStore } from "pinia";
import api from "@/api";
import { useAppStore } from "@/stores/app";
import { buildQuery } from "@/utils/buildQuery";

export const useApplicationStore = defineStore("application", {
  state: () => ({
    status: "idle",
    myApplications: [],
    applications: [],
    message: "",
    myApplicationsPagination: {
      currentPage: 1,
      totalPages: 1,
      total: 0,
      limit: 10,
    },
  }),
  actions: {
    // Projeye başvuru yapma
    async applyToProject({ projectId, slotId }) {
      const appStore = useAppStore();
      this.status = "loading";
      this.message = "";
      try {
        await api.post("/applications/apply", { projectId, slotId });
        this.status = "success";
        appStore.success("Başvurunuz başarıyla gönderildi.");
        return true;
      } catch (error) {
        this.status = "error";
        this.message =
          error.response?.data?.message || "Başvuru gönderilemedi.";
        appStore.apiError(error, "Başvuru gönderilemedi.");
        return false;
      }
    },
    // Kullanıcının başvurularını alma
    async getMyApplications({ page = 1, limit = 10 } = {}) {
      const appStore = useAppStore();
      this.status = "loading";
      this.message = "";
      try {
        const response = await api.get("/applications/my-applications", {
          params: buildQuery({ page, limit }),
        });
        this.myApplications = response.data.applications;
        this.myApplicationsPagination = response.data.pagination;
        this.status = "success";
      } catch (error) {
        this.status = "error";
        this.message = error.response?.data?.message || "Başvurular alınamadı.";
        appStore.apiError(error, "Başvurular alınamadı.");
      }
    },
    // Başvuruyu iptal etme
    async cancelApplication({ applicationId }) {
      const appStore = useAppStore();
      this.status = "loading";
      this.message = "";
      try {
        await api.delete(`/applications/cancel/${applicationId}`);
        this.status = "success";
        appStore.success("Başvurunuz başarıyla iptal edildi.");
        return true;
      } catch (error) {
        this.status = "error";
        this.message =
          error.response?.data?.message || "Başvuru iptal edilemedi.";
        appStore.apiError(error, "Başvuru iptal edilemedi.");
        return false;
      }
    },
    // Projeye yapılan başvuruları alma (proje sahibi için)
    async getApplicationsByProject(projectId) {
      const appStore = useAppStore();
      this.status = "loading";
      this.message = "";
      try {
        const response = await api.get(`/applications/${projectId}`);
        this.applications = response.data.applications;
        this.status = "success";
      } catch (error) {
        this.status = "error";
        this.message = error.response?.data?.message || "Başvurular alınamadı.";
        appStore.apiError(error, "Başvurular alınamadı.");
      }
    },
    // Başvuruyu kabul etme
    async acceptApplication(applicationId) {
      const appStore = useAppStore();
      this.status = "loading";
      this.message = "";
      try {
        const response = await api.post(
          `/applications/accept/${applicationId}`,
        );
        this.status = "success";
        appStore.success("Başvuru başarıyla kabul edildi.");
      } catch (error) {
        this.status = "error";
        this.message =
          error.response?.data?.message || "Başvuru kabul edilemedi.";
        appStore.apiError(error, "Başvuru kabul edilemedi.");
      }
    },
    // Başvuruyu reddetme
    async rejectApplication(applicationId) {
      const appStore = useAppStore();
      this.status = "loading";
      this.message = "";
      try {
        const response = await api.post(
          `/applications/reject/${applicationId}`,
        );
        this.status = "success";
        appStore.success("Başvuru başarıyla reddedildi.");
      } catch (error) {
        this.status = "error";
        this.message =
          error.response?.data?.message || "Başvuru reddedilemedi.";
        appStore.apiError(error, "Başvuru reddedilemedi.");
      }
    },
  },
});
