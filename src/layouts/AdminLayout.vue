<template>
  <v-layout class="admin-layout-root">
    <AdminSidebar />
    <v-main class="admin-layout-main">
      <v-container fluid class="pa-6 admin-layout-container">
        <v-row justify="center" class="admin-layout-row">
          <v-col
            cols="12"
            md="10"
            lg="8"
            class="pa-6 pa-md-10 pa-lg-12 bg-surface rounded-lg d-flex flex-column admin-layout-content"
          >
            <router-view />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-layout>
</template>

<script setup>
import AdminSidebar from "@/components/AdminSidebar.vue";
import { onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useAdminStore } from "@/stores/admin";

const route = useRoute();
const adminStore = useAdminStore();

// Her route değişiminde dashboard stats çek (pendingReports güncel kalsın)
onMounted(() => {
  adminStore.fetchDashboardStats();
});
watch(
  () => route.fullPath,
  () => {
    adminStore.fetchDashboardStats();
  }
);
</script>

<style scoped>
.admin-layout-root {
  height: 100vh;
  overflow: hidden;
}

.admin-layout-main {
  padding-left: 64px;
  height: 100vh;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--v-theme-on-surface), 0.15) transparent;
}

.admin-layout-main::-webkit-scrollbar {
  width: 6px;
}

.admin-layout-main::-webkit-scrollbar-track {
  background: transparent;
}

.admin-layout-main::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-on-surface), 0.15);
  border-radius: 3px;
}

.admin-layout-container {
  min-height: 100%;
}

.admin-layout-row {
  min-height: 100%;
}

.admin-layout-content {
  min-height: calc(100vh - 48px);
}
</style>
