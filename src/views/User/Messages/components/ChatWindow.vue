<template>
  <div class="chat-window d-flex flex-column" style="height: 100%; overflow: hidden">
    <!-- Sohbet yoksa placeholder -->
    <div v-if="!chatStore.activeConversation" class="d-flex flex-column align-center justify-center flex-grow-1 empty-chat">
      <div class="empty-chat-icon mb-5">
        <v-icon size="40" color="primary">mdi-message-text-outline</v-icon>
      </div>
      <p class="text-h6 font-weight-medium mb-2" style="opacity: 0.7">Sohbet Seçin</p>
      <p class="text-body-2 text-medium-emphasis mb-5" style="max-width: 280px; text-align: center">
        Bir sohbet seçin veya yeni bir konuşma başlatın
      </p>
      <v-btn
        v-if="!props.sidebarOpen"
        variant="tonal"
        color="primary"
        rounded="pill"
        prepend-icon="mdi-message-text-outline"
        class="text-none"
        @click="$emit('toggle-sidebar')"
      >
        Sohbetleri Göster
      </v-btn>
    </div>

    <template v-else>
      <!-- Header -->
      <ChatHeader
        :sidebar-open="props.sidebarOpen"
        :conversation-type="chatStore.activeConversation?.conversationType"
        :name="otherUserName"
        :username="otherUser?.username"
        :avatar="otherUserAvatar"
        :initial="otherUserInitial"
        :is-online="isOtherOnline"
        :typing-text="typingText"
        :last-seen-at="otherUser?.lastSeenAt"
        @toggle-sidebar="$emit('toggle-sidebar')"
        @go-profile="goToProfile"
        @archive="archiveDialog = true"
        @show-participants="participantsDialog = true"
      />

      <!-- Mesajlar -->
      <div
        ref="messagesContainer"
        class="flex-grow-1 overflow-y-auto messages-area custom-scrollbar"
        style="min-height: 0"
        @scroll="onScroll"
      >
        <!-- Üst yükleniyor spinner -->
        <div v-if="loadingMore" class="d-flex justify-center mb-3 pt-4">
          <v-progress-circular indeterminate size="22" width="2" color="primary" />
        </div>

        <!-- Tüm mesajlar yüklendi bilgisi -->
        <div v-else-if="!canLoadMore && chatStore.messages.length" class="d-flex justify-center mb-3 pt-4">
          <v-chip size="x-small" variant="tonal" color="primary" rounded="pill" class="text-caption">
            Tüm mesajlar yüklendi
          </v-chip>
        </div>

        <div v-if="chatStore.messagesStatus === 'loading' && !chatStore.messages.length" class="d-flex justify-center py-10">
          <v-progress-circular indeterminate color="primary" size="32" width="2" />
        </div>

        <template v-else>
          <div v-if="!chatStore.messages.length" class="d-flex flex-column align-center justify-center py-12">
            <div class="empty-msgs-icon mb-4">
              <v-icon size="28" color="primary">mdi-message-plus-outline</v-icon>
            </div>
            <p class="text-body-2 font-weight-medium mb-1">Henüz mesaj yok</p>
            <p class="text-caption text-medium-emphasis">Bu konuşmadaki ilk mesajı gönderin</p>
          </div>

          <!-- Tarih ayracı + mesajlar -->
          <!-- eslint-disable-next-line vue/no-v-for-template-key -->
          <template v-for="(msg, idx) in chatStore.messages" :key="msg._id">
            <!-- Tarih ayracı -->
            <div
              v-if="showDateSeparator(idx)"
              class="d-flex align-center justify-center my-4"
            >
              <v-chip size="x-small" variant="tonal" rounded="pill" class="date-chip">
                {{ formatDateLabel(msg.createdAt) }}
              </v-chip>
            </div>

            <MessageBubble
              :message="msg"
              :current-user-id="currentUserId"
              @edit="openEditDialog"
              @delete="openDeleteDialog"
            />
          </template>
        </template>
      </div>

      <!-- Mesaj Input -->
      <div class="message-input-area">
        <!-- Dosya Önizleme -->
        <Transition name="slide-up">
          <div v-if="selectedFile" class="file-preview mb-2">
            <div class="d-flex align-center ga-3 pa-2 rounded-lg" style="background: rgba(var(--v-theme-primary), 0.06)">
              <div v-if="filePreviewUrl" class="file-thumb rounded-lg overflow-hidden">
                <v-img :src="filePreviewUrl" width="56" height="56" cover />
              </div>
              <div v-else class="file-thumb-icon rounded-lg d-flex align-center justify-center">
                <v-icon size="24" color="primary">mdi-file-outline</v-icon>
              </div>
              <div class="flex-grow-1 overflow-hidden">
                <p class="text-body-2 font-weight-medium text-truncate">{{ selectedFile.name }}</p>
                <p class="text-caption text-medium-emphasis">{{ formatFileSize(selectedFile.size) }}</p>
              </div>
              <v-btn icon variant="text" size="x-small" @click="clearSelectedFile">
                <v-icon size="18">mdi-close</v-icon>
              </v-btn>
            </div>
          </div>
        </Transition>

        <div class="d-flex align-center ga-1">
          <!-- Dosya ekleme butonu -->
          <v-btn
            icon
            variant="text"
            size="small"
            color="primary"
            class="attach-btn flex-shrink-0"
            @click="$refs.fileInput.click()"
          >
            <v-icon size="20">mdi-paperclip</v-icon>
            <v-tooltip activator="parent" location="top">Dosya Ekle (max 10MB)</v-tooltip>
          </v-btn>
          <input
            ref="fileInput"
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            style="display: none"
            @change="onFileSelected"
          />

          <v-textarea
            v-model="messageText"
            placeholder="Mesajınızı yazın..."
            variant="outlined"
            density="compact"
            rounded="xl"
            rows="1"
            max-rows="4"
            auto-grow
            hide-details
            no-resize
            class="message-input"
            @keydown.enter.exact.prevent="handleSend"
            @input="handleTyping"
          >
            <template #append-inner>
              <v-btn
                icon
                variant="flat"
                size="small"
                color="primary"
                :disabled="!canSend"
                :loading="chatStore.sendingStatus === 'sending'"
                class="send-btn"
                @click="handleSend"
              >
                <v-icon size="18">mdi-send</v-icon>
              </v-btn>
            </template>
          </v-textarea>
        </div>
      </div>
    </template>

    <!-- Düzenleme Dialog -->
    <v-dialog v-model="editDialog" max-width="420">
      <v-card rounded="xl" elevation="0" class="dialog-card">
        <v-card-title class="text-subtitle-1 font-weight-bold pt-5 px-5 d-flex align-center ga-2">
          <v-icon size="20" color="primary">mdi-pencil-outline</v-icon>
          Mesajı Düzenle
        </v-card-title>
        <v-card-text class="px-5 pb-2">
          <v-textarea
            v-model="editContent"
            variant="outlined"
            density="compact"
            rounded="xl"
            rows="2"
            max-rows="6"
            auto-grow
            hide-details
            counter="300"
          />
        </v-card-text>
        <v-card-actions class="px-5 pb-5">
          <v-spacer />
          <v-btn variant="text" rounded="pill" class="text-none" @click="editDialog = false">İptal</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            rounded="pill"
            class="text-none px-5"
            :disabled="!editContent.trim()"
            :loading="editLoading"
            @click="confirmEdit"
          >
            Kaydet
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Silme Dialog -->
    <v-dialog v-model="deleteDialog" max-width="380">
      <v-card rounded="xl" elevation="0" class="dialog-card">
        <v-card-title class="text-subtitle-1 font-weight-bold pt-5 px-5 d-flex align-center ga-2">
          <v-icon size="20" color="error">mdi-delete-outline</v-icon>
          Mesajı Sil
        </v-card-title>
        <v-card-text class="px-5 text-body-2">
          Bu mesaj kalıcı olarak silinecek. Devam etmek istiyor musunuz?
        </v-card-text>
        <v-card-actions class="px-5 pb-5">
          <v-spacer />
          <v-btn variant="text" rounded="pill" class="text-none" @click="deleteDialog = false">İptal</v-btn>
          <v-btn
            color="error"
            variant="flat"
            rounded="pill"
            class="text-none px-5"
            :loading="deleteLoading"
            @click="confirmDelete"
          >
            Sil
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Arşivleme Dialog -->
    <v-dialog v-model="archiveDialog" max-width="380">
      <v-card rounded="xl" elevation="0" class="dialog-card">
        <v-card-title class="text-subtitle-1 font-weight-bold pt-5 px-5 d-flex align-center ga-2">
          <v-icon size="20" color="primary">mdi-archive-outline</v-icon>
          Sohbeti Arşivle
        </v-card-title>
        <v-card-text class="px-5 text-body-2">
          Bu sohbet arşivlenecek ve listeden kaldırılacak. Devam etmek istiyor musunuz?
        </v-card-text>
        <v-card-actions class="px-5 pb-5">
          <v-spacer />
          <v-btn variant="text" rounded="pill" class="text-none" @click="archiveDialog = false">İptal</v-btn>
          <v-btn
            color="error"
            variant="flat"
            rounded="pill"
            class="text-none px-5"
            @click="confirmArchive"
          >
            Arşivle
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Katılımcılar Dialog -->
    <ParticipantsDialog
      v-model="participantsDialog"
      :participants="chatStore.activeConversation?.participants || []"
      :admin-id="chatStore.activeConversation?.adminId?.toString?.() ?? chatStore.activeConversation?.adminId"
      :conversation-id="chatStore.activeConversation?._id"
      :conversation-type="chatStore.activeConversation?.conversationType"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useChatStore } from "@/stores/chat";
import { useAuthStore } from "@/stores/auth";
import { useSocketStore } from "@/stores/socket";
import { useAppStore } from "@/stores/app";
import { getMediaUrl } from "@/utils/mediaUrl";
import MessageBubble from "./MessageBubble.vue";
import ChatHeader from "./ChatHeader.vue";
import ParticipantsDialog from "./ParticipantsDialog.vue";

const props = defineProps({
  sidebarOpen: { type: Boolean, default: true },
});

defineEmits(["toggle-sidebar"]);

const router = useRouter();
const chatStore = useChatStore();
const authStore = useAuthStore();
const socketStore = useSocketStore();

const messagesContainer = ref(null);
const messageText = ref("");
const loadingMore = ref(false);

// File upload
const selectedFile = ref(null);
const filePreviewUrl = ref(null);
const fileInput = ref(null);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Edit
const editDialog = ref(false);
const editContent = ref("");
const editLoading = ref(false);
const editingMessage = ref(null);

// Delete
const deleteDialog = ref(false);
const deleteLoading = ref(false);
const deletingMessage = ref(null);

// Archive
const archiveDialog = ref(false);

// Participants
const participantsDialog = ref(false);

// Typing
let typingTimeout = null;
let isTyping = false;

const currentUserId = computed(() => authStore.user?._id);

const convType = computed(() => chatStore.activeConversation?.conversationType);
const isDirectConversation = computed(() => convType.value === "direct");

const otherUser = computed(() => {
  const conv = chatStore.activeConversation;
  if (!conv || !isDirectConversation.value) return null;
  return conv.participants?.find((p) => (p._id || p) !== currentUserId.value);
});

const otherUserName = computed(() => {
  const conv = chatStore.activeConversation;
  if (!conv) return "Bilinmeyen";
  if (convType.value === "group") return conv.title || "Grup Sohbeti";
  if (convType.value === "project") return conv.title || conv.projectId?.title || "Proje Sohbeti";
  const u = otherUser.value;
  if (!u) return "Bilinmeyen";
  return u.profile
    ? `${u.profile.name || ""} ${u.profile.surname || ""}`.trim() || u.username
    : u.username || "Bilinmeyen";
});

const otherUserAvatar = computed(() =>
  isDirectConversation.value ? getMediaUrl(otherUser.value?.profile?.avatarUrl) : null,
);

const otherUserInitial = computed(() => {
  if (!isDirectConversation.value) {
    const title = chatStore.activeConversation?.title || "G";
    return title[0].toUpperCase();
  }
  return (otherUser.value?.profile?.name?.[0] || otherUser.value?.username?.[0] || "?").toUpperCase();
});

const isOtherOnline = computed(() =>
  isDirectConversation.value
    ? socketStore.onlineUsers.some((u) => u.userId === otherUser.value?._id)
    : false,
);

const typingText = computed(() => {
  if (!chatStore.typingUsers.length) return "";
  return chatStore.typingUsers.map((u) => u.username).join(", ") + " yazıyor...";
});

const canLoadMore = computed(() => {
  const p = chatStore.messagesPagination;
  return p.currentPage < p.totalPages;
});

const canSend = computed(() => messageText.value.trim() || selectedFile.value);

// Mesaj geldiğinde otomatik scroll
watch(
  () => chatStore.messages.length,
  async () => {
    await nextTick();
    scrollToBottom();
  },
);

function scrollToBottom() {
  const el = messagesContainer.value;
  if (el) el.scrollTop = el.scrollHeight;
}

function onScroll() {
  const el = messagesContainer.value;
  if (!el) return;
  if (el.scrollTop < 50 && canLoadMore.value && !loadingMore.value) {
    loadOlderMessages();
  }
}

async function loadOlderMessages() {
  loadingMore.value = true;
  const prevHeight = messagesContainer.value?.scrollHeight || 0;
  await chatStore.fetchMessages(
    chatStore.activeConversation._id,
    chatStore.messagesPagination.currentPage + 1,
  );
  await nextTick();
  // Scroll pozisyonunu koru
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight - prevHeight;
  }
  loadingMore.value = false;
}

async function handleSend() {
  const text = messageText.value.trim();
  const file = selectedFile.value;
  if ((!text && !file) || !chatStore.activeConversation) return;
  const content = text || (file ? file.name : "");
  messageText.value = "";
  const sendFile = file;
  clearSelectedFile();
  stopTyping();
  await chatStore.sendMessage(chatStore.activeConversation._id, content, sendFile);
  await nextTick();
  scrollToBottom();
}

function handleTyping() {
  if (!chatStore.activeConversation) return;
  if (!isTyping) {
    isTyping = true;
    socketStore.emitTyping(chatStore.activeConversation._id);
  }
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => stopTyping(), 2000);
}

function stopTyping() {
  if (isTyping && chatStore.activeConversation) {
    isTyping = false;
    socketStore.emitStopTyping(chatStore.activeConversation._id);
  }
  clearTimeout(typingTimeout);
}

// File upload
function onFileSelected(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  if (file.size > MAX_FILE_SIZE) {
    const appStore = useAppStore();
    appStore.showSnackbar("Dosya boyutu 10MB'dan büyük olamaz.", "error");
    event.target.value = "";
    return;
  }

  selectedFile.value = file;

  if (file.type.startsWith("image/")) {
    filePreviewUrl.value = URL.createObjectURL(file);
  } else {
    filePreviewUrl.value = null;
  }

  event.target.value = "";
}

function clearSelectedFile() {
  if (filePreviewUrl.value) {
    URL.revokeObjectURL(filePreviewUrl.value);
  }
  selectedFile.value = null;
  filePreviewUrl.value = null;
}

function formatFileSize(bytes) {
  if (!bytes) return "0 B";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

// Tarih ayracı
function showDateSeparator(idx) {
  if (idx === 0) return true;
  const prev = new Date(chatStore.messages[idx - 1].createdAt);
  const curr = new Date(chatStore.messages[idx].createdAt);
  return prev.toDateString() !== curr.toDateString();
}

function formatDateLabel(isoStr) {
  const d = new Date(isoStr);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return "Bugün";
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Dün";
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

// Edit
function openEditDialog(msg) {
  editingMessage.value = msg;
  editContent.value = msg.content;
  editDialog.value = true;
}

async function confirmEdit() {
  if (!editingMessage.value) return;
  editLoading.value = true;
  await chatStore.editMessage(editingMessage.value._id, editContent.value.trim());
  editLoading.value = false;
  editDialog.value = false;
}

// Delete
function openDeleteDialog(msg) {
  deletingMessage.value = msg;
  deleteDialog.value = true;
}

async function confirmDelete() {
  if (!deletingMessage.value) return;
  deleteLoading.value = true;
  await chatStore.deleteMessage(deletingMessage.value._id);
  deleteLoading.value = false;
  deleteDialog.value = false;
}

// Archive
async function confirmArchive() {
  await chatStore.deleteConversation(chatStore.activeConversation._id);
  archiveDialog.value = false;
}

// Profile
function goToProfile() {
  if (otherUser.value?._id) {
    router.push(`/profile/${otherUser.value._id}`);
  }
}
</script>

<style scoped>
.empty-chat {
  background: rgb(var(--v-theme-background));
}

.empty-chat-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(var(--v-theme-primary), 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-msgs-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(var(--v-theme-primary), 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

.messages-area {
  padding: 16px 20px;
  background: rgb(var(--v-theme-background));
  background-image:
    radial-gradient(circle at 20% 50%, rgba(var(--v-theme-primary), 0.02) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(var(--v-theme-accent), 0.02) 0%, transparent 50%);
}

.date-chip {
  font-size: 11px !important;
  font-weight: 600;
  letter-spacing: 0.3px;
  opacity: 0.7;
}

.message-input-area {
  padding: 12px 16px 14px;
  background: rgb(var(--v-theme-surface));
  border-top: 1px solid rgba(var(--v-border-color), 0.06);
}

.message-input {
  flex: 1;
}

.message-input :deep(.v-field) {
  font-size: 14px;
}

.attach-btn {
  opacity: 0.6;
  transition: opacity 0.2s, transform 0.2s;
}
.attach-btn:hover {
  opacity: 1;
  transform: rotate(-45deg);
}

.file-preview .file-thumb {
  width: 56px;
  height: 56px;
  flex-shrink: 0;
}

.file-preview .file-thumb-icon {
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  background: rgba(var(--v-theme-primary), 0.1);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.25s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.send-btn {
  transition: transform 0.2s ease;
}
.send-btn:not(:disabled):hover {
  transform: scale(1.1);
}

.dialog-card {
  border: 1px solid rgba(var(--v-border-color), 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-primary), 0.12);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-primary), 0.25);
}

/* Mobil responsive */
@media (max-width: 599.98px) {
  .messages-area {
    padding: 10px 12px;
  }

  .message-input-area {
    padding: 8px 10px 12px;
    padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
  }

  .empty-chat-icon {
    width: 64px;
    height: 64px;
  }
  .empty-chat-icon .v-icon {
    font-size: 32px !important;
  }
}

/* Tablet responsive */
@media (min-width: 600px) and (max-width: 959.98px) {
  .messages-area {
    padding: 14px 16px;
  }

  .message-input-area {
    padding: 10px 14px 12px;
  }
}
</style>
