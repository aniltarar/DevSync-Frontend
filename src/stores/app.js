import { defineStore } from "pinia";
import { ref } from "vue";

export const useAppStore = defineStore("app", () => {
  const snackbar = ref({
    show: false,
    message: "",
    color: "success",
    timeout: 3000,
    location: "top right",
  });

  function toast(message, color = "success", timeout = 3000) {
    snackbar.value = {
      show: true,
      message,
      color,
      timeout,
      location: "top right",
    };
  }

  function success(message) {
    toast(message, "success");
  }

  function error(message) {
    toast(message, "error");
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

  return { snackbar, toast, success, error, info, warning, close };
});
