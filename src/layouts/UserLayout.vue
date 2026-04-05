<template>
  <v-layout class="layout-root">
    <Sidebar />
    <v-main class="layout-main">
      <v-container fluid class="pa-6 layout-container">
        <v-row justify="center" class="layout-row">
          <v-col
            cols="12"
            md="10"
            lg="8"
            class="pa-6 pa-md-10 pa-lg-12 bg-surface rounded-lg d-flex flex-column layout-content"
          >
            <router-view />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-layout>
</template>

<script setup>
import Sidebar from "@/components/Sidebar.vue";
</script>

<style scoped>
.layout-root {
  height: 100vh;
  overflow: hidden;
}

.layout-main {
  padding-left: 64px;
  height: 100vh;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--v-theme-on-surface), 0.15) transparent;
}

.layout-main::-webkit-scrollbar {
  width: 6px;
}

.layout-main::-webkit-scrollbar-track {
  background: transparent;
}

.layout-main::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-on-surface), 0.15);
  border-radius: 3px;
}

.layout-main::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-on-surface), 0.3);
}

.layout-container {
  min-height: 100%;
}

.layout-row {
  min-height: 100%;
}

.layout-content {
  min-height: calc(100vh - 48px);
}
</style>
