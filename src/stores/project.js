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
        appStore.error(this.message);
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
        appStore.error(this.message);
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
        appStore.error(this.message);
      }
    },
  },
});
