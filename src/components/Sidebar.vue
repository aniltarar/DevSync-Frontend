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
    <v-list-item class="d-flex align-center px-4 py-3">
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
        prepend-icon="mdi-account-search-outline"
        title="Kullanıcı Ara"
        value="search"
        :to="'/search'"
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
        prepend-icon="mdi-folder-account-outline"
        title="Projelerim"
        value="my-projects"
        :to="'/my-projects'"
        rounded="lg"
      />
      <v-list-item
        prepend-icon="mdi-message-outline"
        title="Mesajlar"
        value="messages"
        :to="'/messages'"
        rounded="lg"
      >
        <template v-if="chatStore.totalUnreadCount > 0" #append>
          <v-chip size="x-small" color="primary" variant="flat" class="font-weight-bold">
            {{ chatStore.totalUnreadCount > 99 ? '99+' : chatStore.totalUnreadCount }}
          </v-chip>
        </template>
      </v-list-item>
      <v-list-item
        prepend-icon="mdi-bell-outline"
        title="Bildirimler"
        value="notifications"
        :to="'/notifications'"
        rounded="lg"
      >
        <template v-if="notificationStore.unreadCount > 0" #append>
          <v-chip size="x-small" color="error" variant="flat" class="font-weight-bold">
            {{ notificationStore.unreadCount > 99 ? '99+' : notificationStore.unreadCount }}
          </v-chip>
        </template>
      </v-list-item>
      <v-list-item
        prepend-icon="mdi-file-document-edit-outline"
        title="Başvurularım"
        value="applications"
        :to="'/applications'"
        rounded="lg"
      />
      <v-list-item
        prepend-icon="mdi-flag-outline"
        title="Raporlarım"
        value="reports"
        :to="'/reports'"
        rounded="lg"
      />
    </v-list>


    <template #append>

      <!-- Profil Kartı - Rail modda sadece avatar göster -->
      <div v-if="isRail" class="d-flex justify-center align-center py-3">
        <v-avatar
          size="36"
          color="primary"
          class="border border-primary border-opacity-50 cursor-pointer"
          @click="$router.push('/my-profile')"
        >
          <v-img v-if="authStore.avatarUrl" :src="authStore.avatarUrl" />
          <span v-else class="text-body-2 font-weight-bold text-white">
            {{ (authStore.fullName || "P")[0].toUpperCase() }}
          </span>
        </v-avatar>
      </div>

      <!-- Profil Kartı - Genişlemiş mod -->
      <v-list-item
        v-else
        :to="'/my-profile'"
        rounded="lg"
        class="ma-2 px-2 border border-opacity-25"
        base-color="primary"
      >
        <template #prepend>
          <v-avatar
            size="36"
            color="primary"
            class="border border-primary border-opacity-50"
          >
            <v-img v-if="authStore.avatarUrl" :src="authStore.avatarUrl" />
            <span v-else class="text-body-2 font-weight-bold text-white">
              {{ (authStore.fullName || "P")[0].toUpperCase() }}
            </span>
          </v-avatar>
        </template>
        <template #title>
          <div class="d-flex flex-column">
            <span class="text-body-2 font-weight-semibold">
              {{ authStore.fullName || "Profil" }}
            </span>
            <span class="text-caption text-medium-emphasis">
              @{{ authStore.user?.username }}
            </span>
          </div>
        </template>
        <template #append>
          <v-icon size="16" class="text-medium-emphasis">mdi-chevron-right</v-icon>
        </template>
      </v-list-item>

      <v-list density="compact" nav class="mb-1" active-color="primary">
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
import { ref, onMounted } from "vue";
import { useThemeStore } from "@/stores/theme";
import { useAuthStore } from "@/stores/auth";
import { useChatStore } from "@/stores/chat";
import { useNotificationStore } from "@/stores/notification";

const isRail = ref(true);
const themeStore = useThemeStore();
const authStore = useAuthStore();
const chatStore = useChatStore();
const notificationStore = useNotificationStore();

onMounted(() => {
  notificationStore.fetchUnreadCount();
  chatStore.fetchConversations();
});
</script>