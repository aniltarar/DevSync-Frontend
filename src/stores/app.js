import { defineStore } from "pinia";
import { ref } from "vue";

export const useAppStore = defineStore("app", () => {
  const snackbar = ref({
    show: false,
    message: "",
    detail: "",
    color: "success",
    timeout: 3000,
    location: "top right",
  });

  const notificationSnackbar = ref({
    show: false,
    message: "",
    icon: "mdi-bell",
    color: "info",
    avatarUrl: "",
    route: null,
    timeout: 5000,
  });

  function toast(message, color = "success", timeout = 3000, detail = "") {
    snackbar.value = {
      show: true,
      message,
      detail,
      color,
      timeout,
      location: "top right",
    };
  }

  function success(message, detail = "") {
    toast(message, "success", 3000, detail);
  }

  function error(message, detail = "") {
    toast(message, "error", 3000, detail);
  }

  function apiError(axiosError, fallback = "Bir hata oluştu.") {
    const message = axiosError.response?.data?.message || fallback;
    const detail = axiosError.response?.data?.error || "";
    toast(message, "error", 3000, detail);
  }

  function info(message) {
    toast(message, "info");
  }

  function warning(message) {
    toast(message, "warning");
  }

  function close() {
    snackbar.value.show = false;
  }

  function notificationToast({ message, icon, color, avatarUrl, route }) {
    notificationSnackbar.value = {
      show: true,
      message: message || "Yeni bildirim",
      icon: icon || "mdi-bell",
      color: color || "info",
      avatarUrl: avatarUrl || "",
      route: route || null,
      timeout: 5000,
    };
  }

  function closeNotification() {
    notificationSnackbar.value.show = false;
  }

  return { snackbar, notificationSnackbar, toast, success, error, apiError, info, warning, close, notificationToast, closeNotification };
});
