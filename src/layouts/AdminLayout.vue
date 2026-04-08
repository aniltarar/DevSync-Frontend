<template>
  <v-layout class="admin-layout-root">
    <AdminSidebar />

    <v-main class="admin-layout-main">
      <v-container fluid class="pa-6">
        <router-view />
      </v-container>
    </v-main>
  </v-layout>
</template>

<script setup>
import AdminSidebar from "@/components/AdminSidebar.vue";
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
</style>
