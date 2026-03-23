<template>
  <v-navigation-drawer
    :rail="isRail"
    permanent
    absolute
    :rail-width="64"
    :width="220"
    @mouseenter="isRail = false"
    @mouseleave="isRail = true"
  >
    <!-- Logo + Tema -->
    <v-list-item class="d-flex align-center px-4 py-3 ">
      <template #prepend>
        <v-icon size="32" color="primary">mdi-code-tags</v-icon>
      </template>
      <template #title>
        <span class="text-subtitle-1 font-weight-bold">DevSync</span>
      </template>
      <template #append>
        <v-btn
          :icon="themeStore.isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          variant="text"
          size="small"
          @click="themeStore.toggleTheme"
        />
      </template>
    </v-list-item>

    <v-divider />

    <!-- Ana Navigasyon -->
    <v-list density="comfortable" nav class="mt-1" active-color="primary">
      <v-list-item
        prepend-icon="mdi-home-variant-outline"
        title="Akış"
        value="feed"
        :to="'/feed'"
        rounded="lg"
      />
      <v-list-item
        prepend-icon="mdi-folder-multiple-outline"
        title="Projeler"
        value="projects"
        :to="'/projects'"
        rounded="lg"
      />
      <v-list-item
        prepend-icon="mdi-message-outline"
        title="Mesajlar"
        value="messages"
        :to="'/messages'"
        rounded="lg"
      />
      <v-list-item
        prepend-icon="mdi-bell-outline"
        title="Bildirimler"
        value="notifications"
        :to="'/notifications'"
        rounded="lg"
      />
      <v-list-item
        prepend-icon="mdi-file-document-edit-outline"
        title="Başvurularım"
        value="applications"
        :to="'/applications'"
        rounded="lg"
      />
    </v-list>

    <template #append>
      <v-divider />
      <v-list density="compact" nav class="mb-1" active-color="primary">
        <v-list-item
          prepend-icon="mdi-account-circle-outline"
          title="Profil"
          value="profile"
          :to="'/my-profile'"
          rounded="lg"
        />
        <v-list-item
          prepend-icon="mdi-cog-outline"
          title="Ayarlar"
          value="settings"
          :to="'/settings'"
          rounded="lg"
        />
        <v-list-item
          v-if="authStore.user?.role === 'admin'"
          title="Admin"
          value="admin"
          :to="'/admin'"
          rounded="lg"
          class="bg-warning text-white"
        >
          <template #prepend>
            <v-icon color="warning">mdi-shield-crown-outline</v-icon>
          </template>
        </v-list-item>
        <v-list-item
          title="Çıkış Yap"
          value="logout"
          rounded="lg"
          class="bg-error text-white"
          @click="authStore.logout"
        >
          <template #prepend>
            <v-icon>mdi-logout</v-icon>
          </template>
        </v-list-item>
      </v-list>
    </template>
  </v-navigation-drawer>
</template>

<script setup>
import { ref } from "vue";
import { useThemeStore } from "@/stores/theme";
import { useAuthStore } from "@/stores/auth";

const isRail = ref(true);
const themeStore = useThemeStore();
const authStore = useAuthStore();
</script>

<style scoped></style>
