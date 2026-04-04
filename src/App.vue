<template>
  <v-app>
    <router-view />
    <AppSnackbar />

    <!-- GEÇİCİ: Socket bağlantı göstergesi -->
    <v-chip
      v-if="authStore.isAuthenticated"
      :color="socketStore.connected ? 'success' : 'error'"
      size="small"
      style="position: fixed; bottom: 16px; right: 16px; z-index: 9999;"
    >
      {{ socketStore.connected ? "Socket: Bağlı" : "Socket: Bağlantı Yok" }}
    </v-chip>
  </v-app>
</template>

<script setup>
import { onMounted } from "vue";
import AppSnackbar from "@/components/AppSnackbar.vue";
import { useAuthStore } from "@/stores/auth";
import { useSocketStore } from "@/stores/socket";

const authStore = useAuthStore();
const socketStore = useSocketStore();

onMounted(() => {
  if (authStore.isAuthenticated) {
    socketStore.init();
  }
});
</script>

<style>

</style>
