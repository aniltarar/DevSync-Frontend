<template>
  <div class="conversation-list d-flex flex-column" style="height: 100%">
    <!-- Başlık + Ara -->
    <div class="conv-header">
      <div class="d-flex align-center justify-space-between mb-3">
        <div class="d-flex align-center ga-3">
          <div class="header-icon-wrap">
            <v-icon size="20" color="primary">mdi-message-text</v-icon>
          </div>
          <div>
            <h3 class="text-subtitle-1 font-weight-bold" style="line-height: 1.2">Mesajlar</h3>
            <span class="text-caption text-medium-emphasis">{{ chatStore.sortedConversations.length }} sohbet</span>
          </div>
        </div>
        <v-btn icon variant="text" size="small" class="close-btn" @click="emit('close')">
          <v-icon size="18">mdi-page-layout-sidebar-left</v-icon>
        </v-btn>
      </div>

      <v-text-field
        v-model="searchQuery"
        placeholder="Kullanıcı ara..."
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        rounded="pill"
        flat
        hide-details
        clearable
        class="search-field"
        @update:model-value="onSearch"
      />
    </div>

    <!-- Tabs -->
    <div class="tab-wrapper px-4 pt-1 pb-0 flex-shrink-0">
      <v-btn-toggle v-model="activeTab" mandatory density="compact" rounded="pill" color="primary" variant="outlined" class="conv-tabs" divided>
        <v-btn value="active" size="small" class="text-none px-4">
          <v-icon size="15" class="mr-1">mdi-message-text-outline</v-icon>
          Sohbetler
        </v-btn>
        <v-btn value="archived" size="small" class="text-none px-4" @click="loadArchived">
          <v-icon size="15" class="mr-1">mdi-archive-outline</v-icon>
          Arşiv
        </v-btn>
      </v-btn-toggle>
    </div>

    <!-- Arama Sonuçları -->
    <div v-show="isSearching" class="flex-grow-1 overflow-y-auto custom-scrollbar">
      <div v-if="authStore.searchStatus === 'loading'" class="d-flex justify-center py-8">
        <v-progress-circular indeterminate size="28" width="2" color="primary" />
      </div>

      <v-list v-else-if="authStore.searchResults.length" density="compact" nav class="px-3 pt-3">
        <v-list-subheader class="text-uppercase text-caption font-weight-bold letter-spacing-1">Kullanıcılar</v-list-subheader>
        <v-list-item
          v-for="user in filteredSearchResults"
          :key="user._id"
          rounded="xl"
          class="mb-1 py-2 search-result-item"
          @click="startConversation(user._id)"
        >
          <template #prepend>
            <v-avatar size="38" color="primary" variant="tonal">
              <v-img v-if="user.profile?.avatarUrl" :src="getMediaUrl(user.profile.avatarUrl)" />
              <span v-else class="text-caption font-weight-bold">
                {{ (user.profile?.name?.[0] || user.username[0]).toUpperCase() }}
              </span>
            </v-avatar>
          </template>
          <v-list-item-title class="text-body-2 font-weight-medium">
            {{ user.profile?.name }} {{ user.profile?.surname }}
          </v-list-item-title>
          <v-list-item-subtitle class="text-caption text-medium-emphasis">
            @{{ user.username }}
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>

      <div v-else class="text-center py-8 text-medium-emphasis text-body-2">
        Kullanıcı bulunamadı
      </div>
    </div>

    <!-- Aktif Sohbet Listesi -->
    <div v-show="!isSearching && activeTab === 'active'" class="flex-grow-1 overflow-y-auto custom-scrollbar">
      <div v-if="chatStore.conversationsStatus === 'loading'" class="d-flex justify-center py-8">
        <v-progress-circular indeterminate size="28" width="2" color="primary" />
      </div>

      <v-list
        v-else-if="chatStore.sortedConversations.length"
        density="compact"
        nav
        class="px-3 py-2"
      >
        <v-list-item
          v-for="conv in chatStore.sortedConversations"
          :key="conv._id"
          rounded="xl"
          class="conv-item mb-1 py-3"
          :active="chatStore.activeConversation?._id === conv._id"
          active-color="primary"
          @click="selectConversation(conv)"
        >
          <template #prepend>
            <div class="position-relative mr-2">
              <v-avatar size="46" color="primary" variant="tonal">
                <v-img
                  v-if="getOtherParticipant(conv)?.profile?.avatarUrl"
                  :src="getMediaUrl(getOtherParticipant(conv).profile.avatarUrl)"
                />
                <span v-else class="text-body-2 font-weight-bold">
                  {{ getParticipantInitial(conv) }}
                </span>
              </v-avatar>
              <span
                v-if="isOnline(getOtherParticipant(conv)?._id)"
                class="online-dot"
              />
            </div>
          </template>

          <v-list-item-title class="text-body-2 font-weight-medium">
            {{ getParticipantName(conv) }}
          </v-list-item-title>
          <v-list-item-subtitle class="text-caption text-truncate conv-subtitle">
            {{ getLastMessagePreview(conv) }}
          </v-list-item-subtitle>

          <template #append>
            <div class="d-flex flex-column align-end ga-1">
              <span class="conv-time">
                {{ formatConvTime(conv.updatedAt) }}
              </span>
              <v-chip
                v-if="conv.unreadCount > 0"
                size="x-small"
                color="primary"
                variant="flat"
                class="unread-chip"
              >
                {{ conv.unreadCount }}
              </v-chip>
            </div>
          </template>
        </v-list-item>
      </v-list>

      <div v-else class="d-flex flex-column align-center justify-center py-12 px-6">
        <div class="empty-icon-wrap mb-4">
          <v-icon size="32" color="primary">mdi-message-text-outline</v-icon>
        </div>
        <p class="text-body-2 font-weight-medium mb-1">Henüz sohbetiniz yok</p>
        <p class="text-caption text-medium-emphasis text-center">
          Kullanıcı arayarak yeni bir sohbet başlatın
        </p>
      </div>
    </div>

    <!-- Arşivlenmiş Sohbet Listesi -->
    <div v-show="!isSearching && activeTab === 'archived'" class="flex-grow-1 overflow-y-auto custom-scrollbar">
      <div v-if="chatStore.archivedStatus === 'loading'" class="d-flex justify-center py-8">
        <v-progress-circular indeterminate size="28" width="2" color="primary" />
      </div>

      <v-list
        v-else-if="chatStore.archivedConversations.length"
        density="compact"
        nav
        class="px-3 py-2"
      >
        <v-list-item
          v-for="conv in chatStore.archivedConversations"
          :key="conv._id"
          rounded="xl"
          class="conv-item mb-1 py-3"
        >
          <template #prepend>
            <v-avatar size="46" color="primary" variant="tonal" class="mr-2">
              <v-img
                v-if="getOtherParticipant(conv)?.profile?.avatarUrl"
                :src="getMediaUrl(getOtherParticipant(conv).profile.avatarUrl)"
              />
              <span v-else class="text-body-2 font-weight-bold">
                {{ getParticipantInitial(conv) }}
              </span>
            </v-avatar>
          </template>

          <v-list-item-title class="text-body-2 font-weight-medium">
            {{ getParticipantName(conv) }}
          </v-list-item-title>
          <v-list-item-subtitle class="text-caption text-truncate conv-subtitle">
            {{ getLastMessagePreview(conv) }}
          </v-list-item-subtitle>

          <template #append>
            <v-btn
              icon
              variant="tonal"
              size="small"
              color="primary"
              @click.stop="unarchive(conv._id)"
            >
              <v-icon size="18">mdi-archive-arrow-up-outline</v-icon>
              <v-tooltip activator="parent" location="top">Arşivden Çıkar</v-tooltip>
            </v-btn>
          </template>
        </v-list-item>
      </v-list>

      <div v-else class="d-flex flex-column align-center justify-center py-12 px-6">
        <div class="empty-icon-wrap mb-4">
          <v-icon size="32" color="primary">mdi-archive-outline</v-icon>
        </div>
        <p class="text-body-2 font-weight-medium mb-1">Arşiv boş</p>
        <p class="text-caption text-medium-emphasis text-center">
          Arşivlenmiş sohbet bulunmuyor
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useChatStore } from "@/stores/chat";
import { useAuthStore } from "@/stores/auth";
import { useSocketStore } from "@/stores/socket";
import { getMediaUrl } from "@/utils/mediaUrl";

const emit = defineEmits(["conversation-selected", "close"]);

const chatStore = useChatStore();
const authStore = useAuthStore();
const socketStore = useSocketStore();

const searchQuery = ref("");
const activeTab = ref("active");
let searchTimeout = null;
let archivedLoaded = false;

const currentUserId = computed(() => authStore.user?._id);

const isSearching = computed(() => searchQuery.value && searchQuery.value.length >= 2);

const filteredSearchResults = computed(() =>
  authStore.searchResults.filter((u) => u._id !== currentUserId.value),
);

function onSearch(val) {
  clearTimeout(searchTimeout);
  if (!val || val.length < 2) return;
  searchTimeout = setTimeout(() => {
    authStore.searchUsers(val);
  }, 300);
}

function getOtherParticipant(conv) {
  return conv.participants?.find(
    (p) => (p._id || p) !== currentUserId.value,
  );
}

function getParticipantName(conv) {
  if (conv.conversationType !== "direct" && conv.title) return conv.title;
  const other = getOtherParticipant(conv);
  if (!other) return "Bilinmeyen";
  return other.profile
    ? `${other.profile.name || ""} ${other.profile.surname || ""}`.trim() || other.username
    : other.username || "Bilinmeyen";
}

function getParticipantInitial(conv) {
  const other = getOtherParticipant(conv);
  if (!other) return "?";
  return (other.profile?.name?.[0] || other.username?.[0] || "?").toUpperCase();
}

function isOnline(userId) {
  return socketStore.onlineUsers.some((u) => u.userId === userId);
}

function getLastMessagePreview(conv) {
  if (!conv.lastMessage?.content) return "Henüz mesaj yok";
  const senderId = typeof conv.lastMessage.senderId === "object"
    ? conv.lastMessage.senderId._id
    : conv.lastMessage.senderId;
  const prefix = senderId === currentUserId.value ? "Siz: " : "";
  return prefix + conv.lastMessage.content;
}

function formatConvTime(isoStr) {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  const now = new Date();
  const diff = now - d;
  const oneDay = 86400000;

  if (diff < oneDay && d.getDate() === now.getDate()) {
    return d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  }
  if (diff < 2 * oneDay) return "Dün";
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

async function selectConversation(conv) {
  emit("conversation-selected", conv._id);
}

async function startConversation(userId) {
  const conv = await chatStore.createOrGetConversation(userId);
  if (conv) {
    searchQuery.value = "";
    activeTab.value = "active";
    emit("conversation-selected", conv._id);
  }
}

function loadArchived() {
  if (!archivedLoaded) {
    chatStore.fetchArchivedConversations();
    archivedLoaded = true;
  }
}

async function unarchive(conversationId) {
  await chatStore.unarchiveConversation(conversationId);
}
</script>

<style scoped>
.conv-header {
  padding: 20px 16px 12px;
  background: rgb(var(--v-theme-surface));
}

.header-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(var(--v-theme-primary), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn {
  opacity: 0.5;
  transition: opacity 0.2s;
}
.close-btn:hover {
  opacity: 1;
}

.search-field :deep(.v-field) {
  font-size: 13px;
}

.conv-tabs {
  width: 100%;
}
.conv-tabs .v-btn {
  flex: 1;
  font-size: 12px !important;
  letter-spacing: 0.3px;
}

.tab-wrapper {
  padding-bottom: 8px;
}

.letter-spacing-1 {
  letter-spacing: 1px;
}

.conv-item {
  transition: all 0.2s ease;
}

.conv-subtitle {
  max-width: 160px;
  opacity: 0.65;
}

.conv-time {
  font-size: 10px;
  opacity: 0.5;
  font-weight: 500;
  white-space: nowrap;
}

.unread-chip {
  font-size: 10px !important;
  height: 18px !important;
  min-width: 18px;
  padding: 0 5px;
  font-weight: 700;
}

.search-result-item {
  transition: all 0.2s ease;
}

.empty-icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(var(--v-theme-primary), 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

.online-dot {
  position: absolute;
  bottom: 1px;
  right: 1px;
  width: 11px;
  height: 11px;
  background: rgb(var(--v-theme-success));
  border: 2.5px solid rgb(var(--v-theme-surface));
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(var(--v-theme-success), 0.3);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-primary), 0.15);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-primary), 0.3);
}

/* Mobil responsive */
@media (max-width: 599.98px) {
  .conv-header {
    padding: 16px 12px 10px;
  }

  .header-icon-wrap {
    width: 32px;
    height: 32px;
    border-radius: 8px;
  }
}
</style>
