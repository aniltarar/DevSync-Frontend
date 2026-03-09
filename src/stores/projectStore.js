import { defineStore } from "pinia";
import api from "@/api";
import { useAppStore } from "@/stores/app";

export const useProjectStore = defineStore("project", {
  state: () => ({
    status: "idle",
    projects: [],
    project: null,
    message: "",
  }),
  actions: {
    async fetchProjects() {
      const appStore = useAppStore();
      this.status = "loading";
      this.message = "";
      try {
        const response = await api.get("/projects");
        this.projects = response.data.data;
        this.status = "success";
      } catch (error) {
        this.status = "error";
        this.message = error.response?.data?.message || "Projeler yüklenemedi.";
        appStore.error(this.message);
      }
    },
  },
});
