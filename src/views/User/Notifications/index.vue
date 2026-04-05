<template>
  <div class="notifications-page">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-5">
      <div class="d-flex align-center ga-3">
        <div class="page-icon-wrap">
          <v-icon size="22" color="primary">mdi-bell</v-icon>
        </div>
        <div>
          <h2 class="text-h6 font-weight-bold">Bildirimler</h2>
          <span v-if="notificationStore.unreadCount > 0" class="text-caption text-medium-emphasis">
            {{ notificationStore.unreadCount }} okunmamış
          </span>
        </div>
      </div>
      <div class="d-flex align-center ga-2">
        <v-btn-toggle v-model="filter" mandatory density="compact" rounded="pill" color="primary" variant="outlined" divided>
          <v-btn value="all" size="small" class="text-none px-4">Tümü</v-btn>
          <v-btn value="unread" size="small" class="text-none px-4">Okunmamış</v-btn>
        </v-btn-toggle>
        <v-btn
          v-if="notificationStore.unreadCount > 0"
          variant="tonal"
          color="primary"
          size="small"
          rounded="pill"
          class="text-none"
          :loading="markingAll"
          @click="handleMarkAllRead"
        >
          <v-icon size="16" class="mr-1">mdi-check-all</v-icon>
          Tümünü Oku
        </v-btn>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="notificationStore.status === 'loading' && !notificationStore.notifications.length" class="d-flex justify-center py-12">
      <v-progress-circular indeterminate color="primary" size="32" width="2" />
    </div>

    <!-- Empty State -->
    <div v-else-if="!notificationStore.notifications.length" class="d-flex flex-column align-center justify-center py-16">
      <div class="empty-icon-wrap mb-4">
        <v-icon size="36" color="primary">mdi-bell-check-outline</v-icon>
      </div>
      <p class="text-body-1 font-weight-medium mb-1">Bildirim yok</p>
      <p class="text-body-2 text-medium-emphasis">
        {{ filter === 'unread' ? 'Okunmamış bildiriminiz bulunmuyor' : 'Henüz bildiriminiz yok' }}
      </p>
    </div>

    <!-- Notification List -->
    <div v-else class="notification-list">
      <div
        v-for="notif in notificationStore.notifications"
        :key="notif._id"
        class="notification-card d-flex align-center ga-3 pa-4 rounded-xl mb-2 cursor-pointer"
        :class="{ 'unread': !notif.isRead }"
        @click="handleClick(notif)"
      >
        <!-- Sender Avatar -->
        <div class="position-relative">
          <v-avatar size="44" :color="getTypeColor(notif.type)" variant="tonal">
            <v-img v-if="notif.senderId?.profile?.avatarUrl" :src="getMediaUrl(notif.senderId.profile.avatarUrl)" />
            <v-icon v-else size="22">{{ getTypeIcon(notif.type) }}</v-icon>
          </v-avatar>
          <div class="type-badge" :style="{ background: `rgb(var(--v-theme-${getTypeColor(notif.type)}))` }">
            <v-icon size="10" color="white">{{ getTypeIcon(notif.type) }}</v-icon>
          </div>
        </div>

        <!-- Content -->
        <div class="flex-grow-1 overflow-hidden">
          <p class="text-body-2 mb-0" :class="{ 'font-weight-medium': !notif.isRead }">
            {{ getNotifText(notif) }}
          </p>
          <span class="text-caption text-medium-emphasis">{{ formatTime(notif.createdAt) }}</span>
        </div>

        <!-- Unread dot -->
        <div v-if="!notif.isRead" class="unread-dot" />
      </div>

      <!-- Load More -->
      <div v-if="canLoadMore" ref="sentinel" class="d-flex justify-center py-4">
        <v-progress-circular
          v-if="notificationStore.status === 'loading'"
          indeterminate
          color="primary"
          size="24"
          width="2"
        />
      </div>

      <p
        v-if="!canLoadMore && notificationStore.notifications.length"
        class="text-center text-caption text-medium-emphasis py-3"
      >
        Tüm bildirimler yüklendi
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useNotificationStore } from "@/stores/notification";
import { getNotificationLabel } from "@/stores/notification";
import { getMediaUrl } from "@/utils/mediaUrl";

const router = useRouter();
const notificationStore = useNotificationStore();

const filter = ref("all");
const markingAll = ref(false);
const sentinel = ref(null);
let observer = null;

const canLoadMore = computed(() =>
  notificationStore.pagination.page < notificationStore.pagination.totalPages,
);

function getTypeIcon(type) {
  const map = {
    like_post: "mdi-heart",
    like_comment: "mdi-heart",
    comment: "mdi-comment-text-outline",
    reply: "mdi-reply",
    follow: "mdi-account-plus",
    new_application: "mdi-file-document-plus-outline",
    application_update: "mdi-file-document-check-outline",
    project_invite: "mdi-account-group-outline",
    message: "mdi-message-text-outline",
  };
  return map[type] || "mdi-bell";
}

function getTypeColor(type) {
  const map = {
    like_post: "error",
    like_comment: "error",
    comment: "secondary",
    reply: "secondary",
    follow: "accent",
    new_application: "primary",
    application_update: "success",
    project_invite: "primary",
    message: "primary",
  };
  return map[type] || "primary";
}

function getNotifText(notif) {
  return getNotificationLabel(notif);
}

function formatTime(isoStr) {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Az önce";
  if (diffMin < 60) return `${diffMin} dk önce`;
  if (diffHour < 24) return `${diffHour} saat önce`;
  if (diffDay === 1) return "Dün";
  if (diffDay < 7) return `${diffDay} gün önce`;
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

async function handleClick(notif) {
  if (!notif.isRead) {
    await notificationStore.markAsRead(notif._id);
  }
  navigateToReference(notif);
}

function navigateToReference(notif) {
  switch (notif.type) {
    case "like_post":
    case "comment":
    case "like_comment":
    case "reply":
      router.push(`/posts/${notif.referenceId}`);
      break;
    case "follow":
      router.push(`/profile/${notif.senderId?._id || notif.senderId}`);
      break;
    case "new_application":
      router.push(`/my-projects`);
      break;
    case "application_update":
      router.push(`/applications`);
      break;
    case "project_invite":
      router.push(`/projects`);
      break;
    case "message":
      router.push({ path: "/messages", query: { conversationId: notif.referenceId } });
      break;
    default:
      break;
  }
}

async function handleMarkAllRead() {
  markingAll.value = true;
  await notificationStore.markAllAsRead();
  markingAll.value = false;
}

async function loadMore() {
  if (notificationStore.status === "loading" || !canLoadMore.value) return;
  await notificationStore.fetchNotifications({
    page: notificationStore.pagination.page + 1,
    unreadOnly: filter.value === "unread",
    append: true,
  });
}

function setupObserver() {
  if (observer) observer.disconnect();
  nextTick(() => {
    if (sentinel.value) {
      observer = new IntersectionObserver(
        (entries) => { if (entries[0].isIntersecting) loadMore(); },
        { rootMargin: "200px" },
      );
      observer.observe(sentinel.value);
    }
  });
}

watch(filter, async () => {
  await notificationStore.fetchNotifications({ page: 1, unreadOnly: filter.value === "unread" });
  setupObserver();
});

// Socket'ten yeni bildirim geldiğinde observer'ı yeniden kur
watch(
  () => notificationStore.notifications.length,
  () => {
    nextTick(() => setupObserver());
  },
);

onMounted(async () => {
  await notificationStore.fetchNotifications({ page: 1 });
  await notificationStore.fetchUnreadCount();
  setupObserver();
});

onUnmounted(() => {
  if (observer) observer.disconnect();
});
</script>

<style scoped>
.page-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(var(--v-theme-primary), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon-wrap {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(var(--v-theme-primary), 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-card {
  background: rgb(var(--v-theme-surface));
  border: 1px solid transparent;
  transition: all 0.2s ease;
}
.notification-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.15);
  box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.06);
}
.notification-card.unread {
  background: rgba(var(--v-theme-primary), 0.04);
  border-left: 3px solid rgb(var(--v-theme-primary));
}

.type-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgb(var(--v-theme-surface));
}

.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgb(var(--v-theme-primary));
  flex-shrink: 0;
}

.cursor-pointer {
  cursor: pointer;
}

@media (max-width: 599.98px) {
  .notification-card {
    padding: 12px !important;
  }
}
</style>