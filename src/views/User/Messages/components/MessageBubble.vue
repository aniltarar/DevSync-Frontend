<template>
  <div
    class="d-flex mb-2"
    :class="isMine ? 'justify-end' : 'justify-start'"
  >
    <!-- Avatar (karşı taraf) -->
    <v-avatar
      v-if="!isMine"
      size="32"
      color="primary"
      variant="tonal"
      class="mr-2 mt-auto"
    >
      <v-img v-if="senderAvatar" :src="senderAvatar" />
      <span v-else class="text-caption font-weight-bold">{{ senderInitial }}</span>
    </v-avatar>

    <!-- Mesaj Baloncuğu -->
    <div
      class="message-bubble pa-3 rounded-xl position-relative"
      :class="isMine ? 'bubble-mine' : 'bubble-other'"
      style="max-width: 70%; min-width: 80px"
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
            style="position: absolute; top: 2px; right: 2px"
          >
            <v-icon size="16">mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-list density="compact" rounded="lg" min-width="140" elevation="3">
          <v-list-item
            prepend-icon="mdi-pencil-outline"
            title="Düzenle"
            @click="$emit('edit', message)"
          />
          <v-list-item
            prepend-icon="mdi-delete-outline"
            title="Sil"
            class="text-error"
            @click="$emit('delete', message)"
          />
        </v-list>
      </v-menu>

      <!-- İçerik -->
      <p class="text-body-2 mb-1" style="white-space: pre-wrap; word-break: break-word">
        {{ message.content }}
      </p>

      <!-- Alt bilgi: saat + düzenlendi -->
      <div class="d-flex align-center justify-end ga-1">
        <span
          v-if="message.isEdited"
          class="text-caption"
          :class="isMine ? 'text-primary-lighten-3' : 'text-medium-emphasis'"
          style="font-size: 10px"
        >
          düzenlendi
        </span>
        <span
          class="text-caption"
          :class="isMine ? 'text-primary-lighten-3' : 'text-medium-emphasis'"
          style="font-size: 10px"
        >
          {{ formattedTime }}
        </span>
      </div>
    </div>
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

const isMine = computed(
  () => {
    const senderId = typeof props.message.senderId === "object"
      ? props.message.senderId._id
      : props.message.senderId;
    return senderId === props.currentUserId;
  }
);

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
</script>

<style scoped>
.bubble-mine {
  background: rgb(var(--v-theme-primary));
  color: white;
  border-bottom-right-radius: 4px !important;
}

.bubble-other {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-bottom-left-radius: 4px !important;
}

.message-actions {
  opacity: 0.7;
}
.message-actions:hover {
  opacity: 1;
}
</style>
