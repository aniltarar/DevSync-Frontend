<template>
  <div>
    <!-- Default Snackbar -->
    <v-snackbar
    v-model="appStore.snackbar.show"
    :color="appStore.snackbar.color"
    :timeout="appStore.snackbar.timeout"
    :location="appStore.snackbar.location"
    rounded="lg"
    elevation="4"
  >
    <div>
      <div>{{ appStore.snackbar.message }}</div>
      <div v-if="appStore.snackbar.detail" class="text-caption mt-1 opacity-80">
        {{ appStore.snackbar.detail }}
      </div>
    </div>
    <template #actions>
      <v-btn icon="mdi-close" variant="text" size="small" @click="appStore.close" />
    </template>
  </v-snackbar>

  <!-- Notification Snackbar -->
  <v-snackbar
    v-model="appStore.notificationSnackbar.show"
    :timeout="appStore.notificationSnackbar.timeout"
    location="top right"
    rounded="lg"
    elevation="6"
    color="surface"
    class="notification-toast"
  >
    <div
      class="d-flex align-center ga-3 cursor-pointer"
      @click="handleNotificationClick"
    >
      <v-avatar
        v-if="appStore.notificationSnackbar.avatarUrl"
        size="36"
      >
        <v-img :src="getMediaUrl(appStore.notificationSnackbar.avatarUrl)" />
      </v-avatar>
      <v-avatar
        v-else
        size="36"
        :color="appStore.notificationSnackbar.color"
        variant="tonal"
      >
        <v-icon size="18">{{ appStore.notificationSnackbar.icon }}</v-icon>
      </v-avatar>
      <div class="flex-grow-1 overflow-hidden">
        <div class="text-body-2 font-weight-medium text-truncate">
          {{ appStore.notificationSnackbar.message }}
        </div>
        <div class="text-caption text-medium-emphasis">Az önce</div>
      </div>
    </div>
    <template #actions>
      <v-btn icon="mdi-close" variant="text" size="x-small" @click="appStore.closeNotification" />
    </template>
  </v-snackbar>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useAppStore } from "@/stores/app";
import { getMediaUrl } from "@/utils/mediaUrl";

const appStore = useAppStore();
const router = useRouter();

function handleNotificationClick() {
  const route = appStore.notificationSnackbar.route;
  appStore.closeNotification();
  if (route) {
    router.push(route);
  }
}
</script>
