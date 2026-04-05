<template>
  <div class="messages-page d-flex flex-grow-1" style="height: calc(100vh - 96px); min-height: 0; overflow: hidden; position: relative">
    <!-- Mobil overlay backdrop -->
    <Transition name="fade">
      <div
        v-if="showMobileOverlay"
        class="conversation-backdrop"
        @click="sidebarOpen = false"
      />
    </Transition>

    <!-- Sol Panel: Sohbet Listesi -->
    <div
      class="conversation-panel"
      :class="{
        'panel-closed': !sidebarOpen,
        'panel-mobile': isMobile,
      }"
    >
      <ConversationList @conversation-selected="onConversationSelected" @close="sidebarOpen = false" />
    </div>

    <!-- Sağ Panel: Chat Window -->
    <div
      class="flex-grow-1 d-flex flex-column chat-main"
      style="min-width: 0; overflow: hidden"
    >
      <ChatWindow :sidebar-open="sidebarOpen" @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useDisplay } from "vuetify";
import { useChatStore } from "@/stores/chat";
import { useSocketStore } from "@/stores/socket";
import ConversationList from "./components/ConversationList.vue";
import ChatWindow from "./components/ChatWindow.vue";

const route = useRoute();
const chatStore = useChatStore();
const socketStore = useSocketStore();
const { mobile, mdAndDown } = useDisplay();

const sidebarOpen = ref(true);

const isMobile = computed(() => mdAndDown.value);
const showMobileOverlay = computed(() => isMobile.value && sidebarOpen.value);

onMounted(async () => {
  if (isMobile.value) {
    sidebarOpen.value = true;
  }

  await chatStore.fetchConversations();

  if (route.query.conversationId) {
    await onConversationSelected(route.query.conversationId);
  }
});

onUnmounted(() => {
  if (chatStore.activeConversation) {
    socketStore.leaveConversation(chatStore.activeConversation._id);
  }
  chatStore.clearChat();
});

async function onConversationSelected(conversationId) {
  if (chatStore.activeConversation) {
    socketStore.leaveConversation(chatStore.activeConversation._id);
  }

  await chatStore.openConversation(conversationId);
  socketStore.joinConversation(conversationId);

  if (isMobile.value) {
    sidebarOpen.value = false;
  }
}

watch(
  () => route.query.conversationId,
  async (newId) => {
    if (newId) {
      await onConversationSelected(newId);
    }
  },
);
</script>

<style scoped>
.conversation-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 360px;
  min-width: 360px;
  flex-shrink: 0;
  background: rgb(var(--v-theme-surface));
  border-right: 1px solid rgba(var(--v-border-color), 0.08);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              min-width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.25s ease,
              transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.conversation-panel.panel-closed {
  width: 0;
  min-width: 0;
  opacity: 0;
  border: none;
}

/* Mobil/Tablet: sidebar overlay olarak davranır */
.conversation-panel.panel-mobile {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  width: 100%;
  min-width: 100%;
  max-width: 100%;
  border-right: none;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
}

.conversation-panel.panel-mobile.panel-closed {
  transform: translateX(-100%);
  opacity: 1;
  width: 100%;
  min-width: 100%;
}

.chat-main {
  background: rgb(var(--v-theme-background));
}

/* Tablet: sidebar biraz dar */
@media (min-width: 600px) and (max-width: 959.98px) {
  .conversation-panel.panel-mobile {
    width: 380px;
    min-width: 380px;
    max-width: 380px;
    border-right: 1px solid rgba(var(--v-border-color), 0.08);
    border-radius: 0 16px 16px 0;
  }
  .conversation-panel.panel-mobile.panel-closed {
    width: 380px;
    min-width: 380px;
  }
}

/* Backdrop */
.conversation-backdrop {
  position: absolute;
  inset: 0;
  z-index: 9;
  background: rgba(0, 0, 0, 0.4);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>