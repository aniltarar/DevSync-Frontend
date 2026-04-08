<template>
  <v-navigation-drawer
    :rail="isRail"
    permanent
    absolute
    :rail-width="64"
    :width="240"
    @mouseenter="isRail = false"
    @mouseleave="isRail = true"
  >
    <!-- Logo -->
    <v-list-item class="d-flex align-center px-4 py-3">
      <template #prepend>
        <v-icon size="32" color="warning">mdi-shield-crown</v-icon>
      </template>
      <template #title>
        <span class="text-subtitle-1 font-weight-bold">DevSync Admin</span>
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
    <v-list density="comfortable" nav class="mt-1" active-color="warning">
      <v-list-item
        v-for="item in navItems"
        :key="item.value"
        :prepend-icon="item.icon"
        :title="item.title"
        :value="item.value"
        :to="item.to"
        :active="route.path === item.to"
        rounded="lg"
      >
        <template v-if="item.badge" #append>
          <v-chip size="x-small" color="error" variant="flat" class="font-weight-bold">
            {{ item.badge > 99 ? '99+' : item.badge }}
          </v-chip>
        </template>
      </v-list-item>
    </v-list>

    <template #append>
      <v-list density="compact" nav class="mb-1" active-color="primary">
        <v-list-item
          prepend-icon="mdi-arrow-left"
          title="Siteye Dön"
          value="back"
          to="/feed"
          :active="false"
          rounded="lg"
        />
        <v-list-item
          title="Çıkış Yap"
          value="logout"
          rounded="lg"
          :active="false"
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
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import { useThemeStore } from "@/stores/theme";
import { useAuthStore } from "@/stores/auth";
import { useAdminStore } from "@/stores/admin";

const route = useRoute();
const isRail = ref(true);
const themeStore = useThemeStore();
const authStore = useAuthStore();
const adminStore = useAdminStore();

const navItems = computed(() => [
  { icon: "mdi-view-dashboard-outline", title: "Dashboard", value: "dashboard", to: "/admin" },
  { icon: "mdi-account-group-outline", title: "Kullanıcılar", value: "users", to: "/admin/users" },
  { icon: "mdi-flag-outline", title: "Raporlar", value: "reports", to: "/admin/reports", badge: adminStore.pendingReportsCount },
  { icon: "mdi-post-outline", title: "Gönderiler", value: "posts", to: "/admin/posts" },
  { icon: "mdi-folder-outline", title: "Projeler", value: "projects", to: "/admin/projects" },
  { icon: "mdi-comment-outline", title: "Yorumlar", value: "comments", to: "/admin/comments" },
]);
</script>
