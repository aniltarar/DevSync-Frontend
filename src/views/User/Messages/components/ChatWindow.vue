<template>
  <div class="chat-window d-flex flex-column" style="height: 100%; overflow: hidden">
    <!-- Sohbet yoksa placeholder -->
    <div v-if="!chatStore.activeConversation" class="d-flex flex-column align-center justify-center flex-grow-1">
      <v-icon size="64" color="primary" class="mb-4 opacity-30">mdi-message-text-outline</v-icon>
      <p class="text-body-1 text-medium-emphasis mb-4">Bir sohbet seçin veya yeni sohbet başlatın</p>
      <v-btn
        v-if="!props.sidebarOpen"
        variant="tonal"
        color="primary"
        rounded="lg"
        prepend-icon="mdi-menu"
        @click="$emit('toggle-sidebar')"
      >
        Sohbetleri Göster
      </v-btn>
    </div>

    <template v-else>
      <!-- Header -->
      <ChatHeader
        :sidebar-open="props.sidebarOpen"
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
      />

      <v-divider />

      <!-- Mesajlar -->
      <div
        ref="messagesContainer"
        class="flex-grow-1 overflow-y-auto pa-4"
        style="min-height: 0"
        @scroll="onScroll"
      >
        <!-- Üst yükleniyor spinner -->
        <div v-if="loadingMore" class="d-flex justify-center mb-3">
          <v-progress-circular indeterminate size="24" width="2" color="primary" />
        </div>

        <!-- Tüm mesajlar yüklendi bilgisi -->
        <div v-else-if="!canLoadMore && chatStore.messages.length" class="d-flex justify-center mb-3">
          <span class="text-caption text-medium-emphasis">Tüm mesajlar yüklendi</span>
        </div>

        <div v-if="chatStore.messagesStatus === 'loading' && !chatStore.messages.length" class="d-flex justify-center py-10">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <template v-else>
          <div v-if="!chatStore.messages.length" class="d-flex flex-column align-center justify-center py-10">
            <v-icon size="48" color="primary" class="mb-3 opacity-30">mdi-message-plus-outline</v-icon>
            <p class="text-body-2 text-medium-emphasis">Henüz mesaj yok. İlk mesajı gönderin!</p>
          </div>

          <!-- Tarih ayracı + mesajlar -->
          <!-- eslint-disable-next-line vue/no-v-for-template-key -->
          <template v-for="(msg, idx) in chatStore.messages" :key="msg._id">
            <!-- Tarih ayracı -->
            <div
              v-if="showDateSeparator(idx)"
              class="d-flex align-center my-3"
            >
              <v-divider class="flex-grow-1" />
              <span class="mx-3 text-caption text-medium-emphasis">
                {{ formatDateLabel(msg.createdAt) }}
              </span>
              <v-divider class="flex-grow-1" />
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
      <v-divider />
      <div class="pa-3">
        <v-textarea
          v-model="messageText"
          placeholder="Mesajınızı yazın..."
          variant="outlined"
          density="compact"
          rounded="lg"
          rows="1"
          max-rows="4"
          auto-grow
          hide-details
          no-resize
          @keydown.enter.exact.prevent="handleSend"
          @input="handleTyping"
        >
          <template #append-inner>
            <v-btn
              icon
              variant="text"
              size="small"
              color="primary"
              :disabled="!messageText.trim()"
              :loading="chatStore.sendingStatus === 'sending'"
              @click="handleSend"
            >
              <v-icon>mdi-send</v-icon>
            </v-btn>
          </template>
        </v-textarea>
      </div>
    </template>

    <!-- Düzenleme Dialog -->
    <v-dialog v-model="editDialog" max-width="420">
      <v-card rounded="xl">
        <v-card-title class="text-h6 pt-5 px-5">Mesajı Düzenle</v-card-title>
        <v-card-text class="px-5">
          <v-textarea
            v-model="editContent"
            variant="outlined"
            density="compact"
            rounded="lg"
            rows="2"
            max-rows="6"
            auto-grow
            hide-details
            counter="300"
          />
        </v-card-text>
        <v-card-actions class="px-5 pb-5">
          <v-spacer />
          <v-btn variant="text" rounded="lg" @click="editDialog = false">İptal</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            rounded="lg"
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
      <v-card rounded="xl">
        <v-card-title class="text-h6 pt-5 px-5">Mesajı Sil</v-card-title>
        <v-card-text class="px-5 text-body-2">
          Bu mesaj kalıcı olarak silinecek. Devam etmek istiyor musunuz?
        </v-card-text>
        <v-card-actions class="px-5 pb-5">
          <v-spacer />
          <v-btn variant="text" rounded="lg" @click="deleteDialog = false">İptal</v-btn>
          <v-btn
            color="error"
            variant="flat"
            rounded="lg"
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
      <v-card rounded="xl">
        <v-card-title class="text-h6 pt-5 px-5">Sohbeti Arşivle</v-card-title>
        <v-card-text class="px-5 text-body-2">
          Bu sohbet arşivlenecek ve listeden kaldırılacak. Devam etmek istiyor musunuz?
        </v-card-text>
        <v-card-actions class="px-5 pb-5">
          <v-spacer />
          <v-btn variant="text" rounded="lg" @click="archiveDialog = false">İptal</v-btn>
          <v-btn
            color="error"
            variant="flat"
            rounded="lg"
            @click="confirmArchive"
          >
            Arşivle
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useChatStore } from "@/stores/chat";
import { useAuthStore } from "@/stores/auth";
import { useSocketStore } from "@/stores/socket";
import { getMediaUrl } from "@/utils/mediaUrl";
import MessageBubble from "./MessageBubble.vue";
import ChatHeader from "./ChatHeader.vue";

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

// Typing
let typingTimeout = null;
let isTyping = false;

const currentUserId = computed(() => authStore.user?._id);

const otherUser = computed(() => {
  const conv = chatStore.activeConversation;
  if (!conv) return null;
  return conv.participants?.find((p) => (p._id || p) !== currentUserId.value);
});

const otherUserName = computed(() => {
  const u = otherUser.value;
  if (!u) return "Bilinmeyen";
  return u.profile
    ? `${u.profile.name || ""} ${u.profile.surname || ""}`.trim() || u.username
    : u.username || "Bilinmeyen";
});

const otherUserAvatar = computed(() =>
  getMediaUrl(otherUser.value?.profile?.avatarUrl),
);

const otherUserInitial = computed(() =>
  (otherUser.value?.profile?.name?.[0] || otherUser.value?.username?.[0] || "?").toUpperCase(),
);

const isOtherOnline = computed(() =>
  socketStore.onlineUsers.some((u) => u.userId === otherUser.value?._id),
);

const typingText = computed(() => {
  if (!chatStore.typingUsers.length) return "";
  return chatStore.typingUsers.map((u) => u.username).join(", ") + " yazıyor...";
});

const canLoadMore = computed(() => {
  const p = chatStore.messagesPagination;
  return p.currentPage < p.totalPages;
});

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
  if (!text || !chatStore.activeConversation) return;
  messageText.value = "";
  stopTyping();
  await chatStore.sendMessage(chatStore.activeConversation._id, text);
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
</style>
