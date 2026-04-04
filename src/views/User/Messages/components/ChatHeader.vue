<template>
  <div class="chat-header d-flex align-center px-4" style="min-height: 64px">
    <!-- Sidebar aç butonu -->
    <v-btn
      v-if="!sidebarOpen"
      class="mr-2"
      icon
      variant="text"
      size="small"
      @click="$emit('toggle-sidebar')"
    >
      <v-icon>mdi-menu</v-icon>
    </v-btn>

    <!-- Avatar + Online dot -->
    <div class="position-relative mr-3">
      <v-avatar
        size="40"
        color="primary"
        variant="tonal"
        class="cursor-pointer"
        @click="$emit('go-profile')"
      >
        <v-img v-if="avatar" :src="avatar" />
        <span v-else class="text-body-2 font-weight-bold">{{ initial }}</span>
      </v-avatar>
      <span v-if="isOnline" class="online-indicator" />
    </div>

    <!-- Kullanıcı bilgileri -->
    <div class="flex-grow-1 overflow-hidden">
      <div class="d-flex align-center ga-2">
        <span class="text-body-1 font-weight-medium text-truncate">{{ name }}</span>
        <span class="text-caption text-medium-emphasis">@{{ username }}</span>
      </div>
      <p v-if="typingText" class="text-caption text-primary d-flex align-center ga-1 ma-0">
        <span class="typing-dots"><span /><span /><span /></span>
        {{ typingText }}
      </p>
      <p v-else-if="isOnline" class="text-caption text-success ma-0">Çevrimiçi</p>
      <p v-else class="text-caption text-medium-emphasis ma-0">
        {{ lastSeenText }}
      </p>
    </div>

    <!-- Sağ taraf aksiyonlar -->
    <div class="d-flex align-center ga-1">
      <v-menu location="bottom end">
        <template #activator="{ props: menuProps }">
          <v-btn v-bind="menuProps" icon variant="text" size="small">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-list density="compact" rounded="lg" min-width="160" elevation="3">
          <v-list-item
            prepend-icon="mdi-account-outline"
            title="Profili Gör"
            @click="$emit('go-profile')"
          />
          <v-divider />
          <v-list-item
            prepend-icon="mdi-archive-outline"
            title="Sohbeti Arşivle"
            class="text-error"
            @click="$emit('archive')"
          />
        </v-list>
      </v-menu>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  sidebarOpen: { type: Boolean, default: true },
  name: { type: String, default: "Bilinmeyen" },
  username: { type: String, default: "" },
  avatar: { type: String, default: null },
  initial: { type: String, default: "?" },
  isOnline: { type: Boolean, default: false },
  typingText: { type: String, default: "" },
  lastSeenAt: { type: String, default: null },
});

defineEmits(["toggle-sidebar", "go-profile", "archive"]);

const lastSeenText = computed(() => {
  if (!props.lastSeenAt) return "Çevrimdışı";
  const d = new Date(props.lastSeenAt);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Az önce görüldü";
  if (diffMin < 60) return `${diffMin} dk önce görüldü`;
  if (diffHour < 24) return `${diffHour} saat önce görüldü`;
  if (diffDay === 1) return "Dün görüldü";
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" }) + " tarihinde görüldü";
});
</script>

<style scoped>
.chat-header {
  background: rgb(var(--v-theme-surface));
}

.online-indicator {
  position: absolute;
  bottom: 1px;
  right: 1px;
  width: 10px;
  height: 10px;
  background: rgb(var(--v-theme-success));
  border: 2px solid rgb(var(--v-theme-surface));
  border-radius: 50%;
}

.typing-dots {
  display: inline-flex;
  gap: 2px;
  align-items: center;
}
.typing-dots span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgb(var(--v-theme-primary));
  animation: typingBounce 1.4s infinite ease-in-out;
}
.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}
.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typingBounce {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.4;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
