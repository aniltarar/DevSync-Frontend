<template>
  <div
    class="d-flex mb-3 message-row"
    :class="isMine ? 'justify-end' : 'justify-start'"
  >
    <!-- Avatar (karşı taraf) -->
    <v-avatar
      v-if="!isMine"
      size="30"
      color="primary"
      variant="tonal"
      class="mr-2 mt-auto mb-1"
    >
      <v-img v-if="senderAvatar" :src="senderAvatar" />
      <span v-else class="font-weight-bold" style="font-size: 11px">{{ senderInitial }}</span>
    </v-avatar>

    <!-- Mesaj Baloncuğu -->
    <div
      class="message-bubble pa-3 position-relative"
      :class="[
        isMine ? 'bubble-mine' : 'bubble-other',
        { 'bubble-media': isMediaMessage },
      ]"
      @mouseenter="hovered = true"
      @mouseleave="hovered = false"
    >
      <!-- 3 nokta menü (sadece kendi mesajları) -->
      <v-menu v-if="isMine" location="top end">
        <template #activator="{ props: menuProps }">
          <v-btn
            v-show="hovered"
            v-bind="menuProps"
            icon
            variant="text"
            size="x-small"
            class="message-actions"
          >
            <v-icon size="14">mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-list density="compact" rounded="xl" min-width="140" elevation="2" class="py-1">
          <v-list-item
            v-if="message.messageType === 'text'"
            prepend-icon="mdi-pencil-outline"
            title="Düzenle"
            rounded="lg"
            class="mx-1"
            @click="$emit('edit', message)"
          />
          <v-list-item
            prepend-icon="mdi-delete-outline"
            title="Sil"
            class="text-error mx-1"
            rounded="lg"
            @click="$emit('delete', message)"
          />
        </v-list>
      </v-menu>

      <!-- Resim mesajı -->
      <div v-if="message.messageType === 'image' && message.fileData?.fileUrl" class="msg-image mb-1" @click="imageDialog = true">
        <v-img
          :src="getMediaUrl(message.fileData.fileUrl)"
          :alt="message.fileData.fileName"
          max-width="280"
          max-height="280"
          rounded="lg"
          cover
          class="cursor-pointer"
        >
          <template #placeholder>
            <div class="d-flex align-center justify-center fill-height">
              <v-progress-circular indeterminate size="24" width="2" color="primary" />
            </div>
          </template>
        </v-img>
      </div>

      <!-- Dosya mesajı -->
      <a
        v-if="message.messageType === 'file' && message.fileData?.fileUrl"
        :href="getMediaUrl(message.fileData.fileUrl)"
        target="_blank"
        rel="noopener"
        class="msg-file d-flex align-center ga-2 mb-1 pa-2 rounded-lg text-decoration-none"
        :class="isMine ? 'file-mine' : 'file-other'"
      >
        <div class="file-icon-wrap rounded-lg d-flex align-center justify-center">
          <v-icon size="20">mdi-file-outline</v-icon>
        </div>
        <div class="flex-grow-1 overflow-hidden">
          <p class="text-body-2 font-weight-medium text-truncate mb-0">{{ message.fileData.fileName }}</p>
          <p class="text-caption mb-0" style="opacity: 0.6">{{ formatFileSize(message.fileData.fileSize) }}</p>
        </div>
        <v-icon size="18" style="opacity: 0.5">mdi-download</v-icon>
      </a>

      <!-- Metin içerik (her zaman göster, dosya mesajlarında sadece dosya adından farklıysa) -->
      <p
        v-if="showTextContent"
        class="text-body-2 mb-1"
        style="white-space: pre-wrap; word-break: break-word; line-height: 1.5"
      >
        {{ message.content }}
      </p>

      <!-- Alt bilgi: saat + düzenlendi -->
      <div class="d-flex align-center justify-end ga-1 msg-meta">
        <span v-if="message.isEdited" class="edited-label">
          düzenlendi
        </span>
        <span class="time-label">
          {{ formattedTime }}
        </span>
      </div>
    </div>

    <!-- Image Lightbox Dialog -->
    <v-dialog v-if="message.messageType === 'image'" v-model="imageDialog" max-width="800" content-class="image-lightbox">
      <v-card rounded="xl" elevation="0" color="transparent" class="overflow-hidden">
        <div class="position-relative">
          <v-img
            :src="getMediaUrl(message.fileData.fileUrl)"
            :alt="message.fileData.fileName"
            max-height="80vh"
            contain
          />
          <v-btn
            icon
            variant="flat"
            size="small"
            color="surface"
            class="position-absolute"
            style="top: 8px; right: 8px"
            @click="imageDialog = false"
          >
            <v-icon size="18">mdi-close</v-icon>
          </v-btn>
          <v-btn
            icon
            variant="flat"
            size="small"
            color="surface"
            class="position-absolute"
            style="bottom: 8px; right: 8px"
            :href="getMediaUrl(message.fileData.fileUrl)"
            target="_blank"
          >
            <v-icon size="18">mdi-download</v-icon>
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { getMediaUrl } from "@/utils/mediaUrl";

const props = defineProps({
  message: { type: Object, required: true },
  currentUserId: { type: String, required: true },
});

defineEmits(["edit", "delete"]);

const hovered = ref(false);
const imageDialog = ref(false);

const isMine = computed(
  () => {
    const senderId = typeof props.message.senderId === "object"
      ? props.message.senderId._id
      : props.message.senderId;
    return senderId === props.currentUserId;
  }
);

const isMediaMessage = computed(() =>
  props.message.messageType === "image" || props.message.messageType === "file"
);

const showTextContent = computed(() => {
  if (props.message.messageType === "text") return true;
  if (!props.message.fileData) return true;
  // Show text only if it differs from the file name
  return props.message.content && props.message.content !== props.message.fileData.fileName;
});

const senderAvatar = computed(() => {
  if (typeof props.message.senderId === "object") {
    return getMediaUrl(props.message.senderId.profile?.avatarUrl);
  }
  return null;
});

const senderInitial = computed(() => {
  if (typeof props.message.senderId === "object") {
    return (props.message.senderId.profile?.name?.[0] || props.message.senderId.username?.[0] || "?").toUpperCase();
  }
  return "?";
});

const formattedTime = computed(() => {
  const d = new Date(props.message.createdAt);
  return d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
});

function formatFileSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
</script>

<style scoped>
.message-row {
  padding: 0 4px;
}

.message-bubble {
  max-width: 65%;
  min-width: 80px;
  border-radius: 18px;
  transition: box-shadow 0.2s ease;
}

.bubble-mine {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)), rgba(var(--v-theme-accent), 0.85));
  color: white;
  border-bottom-right-radius: 6px !important;
  box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.2);
}

.bubble-other {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-border-color), 0.08);
  border-bottom-left-radius: 6px !important;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.message-actions {
  position: absolute;
  top: 2px;
  right: 2px;
  opacity: 0.6;
  color: rgba(255, 255, 255, 0.8) !important;
  transition: opacity 0.2s;
}
.message-actions:hover {
  opacity: 1;
}

.msg-meta {
  margin-top: -2px;
}

.bubble-mine .edited-label,
.bubble-mine .time-label {
  font-size: 10px;
  opacity: 0.65;
  color: rgba(255, 255, 255, 0.85);
}

.bubble-other .edited-label,
.bubble-other .time-label {
  font-size: 10px;
  opacity: 0.5;
}

/* Media messages */
.bubble-media {
  padding: 6px !important;
}
.bubble-media .msg-meta {
  padding: 0 6px;
}

.msg-image {
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  line-height: 0;
}
.msg-image :deep(.v-img) {
  border-radius: 12px;
}

.msg-file {
  min-width: 200px;
}

.file-mine {
  background: rgba(255, 255, 255, 0.12);
  color: white;
}
.file-mine:hover {
  background: rgba(255, 255, 255, 0.18);
}

.file-other {
  background: rgba(var(--v-theme-primary), 0.06);
  color: inherit;
}
.file-other:hover {
  background: rgba(var(--v-theme-primary), 0.1);
}

.file-icon-wrap {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  background: rgba(var(--v-theme-primary), 0.12);
}

.cursor-pointer {
  cursor: pointer;
}

.image-lightbox {
  background: transparent !important;
  box-shadow: none !important;
}

/* Mobil responsive */
@media (max-width: 599.98px) {
  .message-bubble {
    max-width: 82%;
    padding: 10px 12px !important;
  }

  .message-row {
    padding: 0 2px;
  }
}

/* Tablet responsive */
@media (min-width: 600px) and (max-width: 959.98px) {
  .message-bubble {
    max-width: 72%;
  }
}
</style>
