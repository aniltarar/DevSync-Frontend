import { defineStore } from "pinia";
import api from "@/api";
import { useAppStore } from "@/stores/app";
import { buildQuery } from "@/utils/buildQuery";

export const useProjectStore = defineStore("project", {
  state: () => ({
    status: "idle",
    projects: [],
    project: null,
    message: "",
  }),
  actions: {
    async fetchProjects(params = {}) {
      const appStore = useAppStore();
      this.status = "loading";
      this.message = "";
      try {
        const response = await api.get("/projects", { params: buildQuery(params) });
        this.projects = response.data.data;
        this.status = "success";
      } catch (error) {
        this.status = "error";
        this.message = error.response?.data?.message || "Projeler yüklenemedi.";
        appStore.apiError(error, "Projeler yüklenemedi.");
      }
    },
    async fetchMyProjects(){
      const appStore = useAppStore();
      this.status = "loading";
      this.message = "";
      try {
        const response = await api.get("/projects/my-projects");
        this.projects = response.data.data;
        this.status = "success";
      } catch (error) {
        this.status = "error";
        this.message = error.response?.data?.message || "Projeler yüklenemedi.";
        appStore.apiError(error, "Projeler yüklenemedi.");
      }
    },
    async fetchProjectById(id) {
      const appStore = useAppStore();
      this.status = "loading";
      this.project = null;
      this.message = "";
      try {
        const response = await api.get(`/projects/${id}`);
        this.project = response.data;
        this.status = "success";
      } catch (error) {
        this.status = "error";
        this.message = error.response?.data?.message || "Proje yüklenemedi.";
        appStore.apiError(error, "Proje yüklenemedi.");
      }
    },
    async createProject(payload) {
      const appStore = useAppStore();
      this.status = "loading";
      this.message = "";
      try {
        const response = await api.post("/projects", payload);
        this.status = "success";
        appStore.success("Proje başarıyla oluşturuldu.");
        return response.data.project;
      } catch (error) {
        this.status = "error";
        this.message = error.response?.data?.message || "Proje oluşturulamadı.";
        appStore.apiError(error, "Proje oluşturulamadı.");
        return null;
      }
    },
    async deleteProject(projectId) {
      const appStore = useAppStore();
      this.status = "loading";
      this.message = "";
      try {
        await api.delete(`/projects/${projectId}`);
        this.status = "success";
        appStore.success("Proje başarıyla silindi.");
        return true;
      } catch (error) {
        this.status = "error";
        this.message = error.response?.data?.message || "Proje silinemedi.";
        appStore.apiError(error, "Proje silinemedi.");
        return false;
      }
    },
    async addSlot(projectId, slot) {
      const appStore = useAppStore();
      this.status = "loading";
      this.message = "";
      try {
        await api.post(`/projects/${projectId}/slots`, slot);
        await this.fetchProjectById(projectId);
        appStore.success("Slot başarıyla eklendi.");
        return true;
      } catch (error) {
        this.status = "error";
        this.message = error.response?.data?.message || "Slot eklenemedi.";
        appStore.apiError(error, "Slot eklenemedi.");
        return false;
      }
    },
    async deleteSlot(projectId, slotId) {
      const appStore = useAppStore();
      this.status = "loading";
      this.message = "";
      try {
        await api.delete(`/projects/${projectId}/slots/${slotId}`);
        if (this.project) {
          this.project.slots = this.project.slots.filter(s => s._id !== slotId);
        }
        this.status = "success";
        appStore.success("Slot başarıyla silindi.");
        return true;
      } catch (error) {
        this.status = "error";
        this.message = error.response?.data?.message || "Slot silinemedi.";
        appStore.apiError(error, "Slot silinemedi.");
        return false;
      }
    },
    async updateProject(projectId, payload) {
      const appStore = useAppStore();
      this.status = "loading";
      this.message = "";
      try {
        await api.put(`/projects/${projectId}`, payload);
        await this.fetchProjectById(projectId);
        appStore.success("Proje başarıyla güncellendi.");
        return true;
      } catch (error) {
        this.status = "error";
        this.message = error.response?.data?.message || "Proje güncellenemedi.";
        appStore.apiError(error, "Proje güncellenemedi.");
        return false;
      }
    },
    async updateSlot(projectId, slotId, payload) {
      const appStore = useAppStore();
      this.status = "loading";
      this.message = "";
      try {
        await api.put(`/projects/${projectId}/slots/${slotId}`, payload);
        await this.fetchProjectById(projectId);
        appStore.success("Slot başarıyla güncellendi.");
        return true;
      } catch (error) {
        this.status = "error";
        this.message = error.response?.data?.message || "Slot güncellenemedi.";
        appStore.apiError(error, "Slot güncellenemedi.");
        return false;
      }
    },
  },
});
