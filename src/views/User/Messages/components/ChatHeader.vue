<template>
  <div class="chat-header d-flex align-center px-4" style="min-height: 64px">
    <!-- Sidebar aç butonu -->
    <v-btn
      v-if="!sidebarOpen"
      class="mr-2 sidebar-toggle"
      icon
      variant="tonal"
      size="small"
      color="primary"
      @click="$emit('toggle-sidebar')"
    >
      <v-icon size="18">{{ mobile ? 'mdi-arrow-left' : 'mdi-menu' }}</v-icon>
    </v-btn>

    <!-- Avatar + Online dot -->
    <div class="position-relative mr-3">
      <v-avatar
        size="42"
        :color="conversationType === 'project' ? 'secondary' : 'primary'"
        variant="tonal"
        class="header-avatar"
        :style="conversationType !== 'project' ? 'cursor:pointer' : ''"
        @click="conversationType !== 'project' && $emit('go-profile')"
      >
        <v-icon v-if="conversationType === 'project'" size="22">mdi-folder-open</v-icon>
        <v-icon v-else-if="conversationType === 'group'" size="22">mdi-account-group</v-icon>
        <template v-else>
          <v-img v-if="avatar" :src="avatar" />
          <span v-else class="text-body-2 font-weight-bold">{{ initial }}</span>
        </template>
      </v-avatar>
      <span v-if="conversationType === 'direct' && isOnline" class="online-indicator" />
    </div>

    <!-- Kullanıcı / Proje bilgileri -->
    <div class="flex-grow-1 overflow-hidden">
      <div class="d-flex align-center ga-2">
        <span class="text-body-1 font-weight-semibold text-truncate">{{ name }}</span>
        <span v-if="conversationType === 'direct'" class="text-caption text-medium-emphasis" style="opacity: 0.6">@{{ username }}</span>
        <v-chip v-else-if="conversationType === 'project'" size="x-small" color="secondary" variant="tonal" class="text-caption">Proje</v-chip>
        <v-chip v-else-if="conversationType === 'group'" size="x-small" color="primary" variant="tonal" class="text-caption">Grup</v-chip>
      </div>
      <div class="status-line">
        <p v-if="typingText" class="text-caption text-primary d-flex align-center ga-1 ma-0">
          <span class="typing-dots"><span /><span /><span /></span>
          {{ typingText }}
        </p>
        <p v-else-if="conversationType === 'direct' && isOnline" class="text-caption ma-0 online-text">
          <span class="online-pulse" />
          Çevrimiçi
        </p>
        <p v-else-if="conversationType === 'project'" class="text-caption text-medium-emphasis ma-0" style="opacity: 0.6">
          Proje sohbeti
        </p>
        <p v-else-if="conversationType === 'group'" class="text-caption text-medium-emphasis ma-0" style="opacity: 0.6">
          Grup sohbeti
        </p>
        <p v-else class="text-caption text-medium-emphasis ma-0" style="opacity: 0.6">
          {{ lastSeenText }}
        </p>
      </div>
    </div>

    <!-- Sağ taraf aksiyonlar -->
    <div class="d-flex align-center ga-1">
      <v-btn
        v-if="conversationType !== 'direct'"
        icon
        variant="text"
        size="small"
        class="menu-btn"
        @click="$emit('show-participants')"
      >
        <v-icon size="20">mdi-account-group-outline</v-icon>
        <v-tooltip activator="parent" location="top">Katılımcıları Gör</v-tooltip>
      </v-btn>
      <v-menu location="bottom end" :offset="4">
        <template #activator="{ props: menuProps }">
          <v-btn v-bind="menuProps" icon variant="text" size="small" class="menu-btn">
            <v-icon size="20">mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-list density="compact" rounded="xl" min-width="180" elevation="2" class="py-1">
          <v-list-item
            v-if="conversationType === 'direct'"
            prepend-icon="mdi-account-outline"
            title="Profili Gör"
            rounded="lg"
            class="mx-1"
            @click="$emit('go-profile')"
          />
          <v-divider v-if="conversationType === 'direct'" class="my-1" />
          <v-list-item
            prepend-icon="mdi-archive-outline"
            title="Sohbeti Arşivle"
            class="text-error mx-1"
            rounded="lg"
            @click="$emit('archive')"
          />
        </v-list>
      </v-menu>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useDisplay } from "vuetify";

const { mobile } = useDisplay();

const props = defineProps({
  sidebarOpen: { type: Boolean, default: true },
  conversationType: { type: String, default: "direct" },
  name: { type: String, default: "Bilinmeyen" },
  username: { type: String, default: "" },
  avatar: { type: String, default: null },
  initial: { type: String, default: "?" },
  isOnline: { type: Boolean, default: false },
  typingText: { type: String, default: "" },
  lastSeenAt: { type: String, default: null },
});

defineEmits(["toggle-sidebar", "go-profile", "archive", "show-participants"]);

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
  border-bottom: 1px solid rgba(var(--v-border-color), 0.06);
}

.header-avatar {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.header-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 0 0 3px rgba(var(--v-theme-primary), 0.15);
}

.sidebar-toggle {
  transition: transform 0.2s;
}
.sidebar-toggle:hover {
  transform: scale(1.05);
}

.online-indicator {
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

.status-line {
  min-height: 18px;
}

.online-text {
  color: rgb(var(--v-theme-success));
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 500;
}

.online-pulse {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgb(var(--v-theme-success));
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(var(--v-theme-success), 0.5); }
  70% { box-shadow: 0 0 0 5px rgba(var(--v-theme-success), 0); }
  100% { box-shadow: 0 0 0 0 rgba(var(--v-theme-success), 0); }
}

.menu-btn {
  opacity: 0.5;
  transition: opacity 0.2s;
}
.menu-btn:hover {
  opacity: 1;
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

/* Mobil responsive */
@media (max-width: 599.98px) {
  .chat-header {
    padding-left: 12px;
    padding-right: 12px;
    min-height: 56px !important;
  }

  .header-avatar {
    width: 36px !important;
    height: 36px !important;
  }
}
</style>
