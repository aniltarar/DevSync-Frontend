<template>
  <div class="messages-page d-flex flex-grow-1" style="height: 100%; min-height: 0; overflow: hidden; position: relative">
    <!-- Sol Panel: Sohbet Listesi -->
    <div
      class="conversation-panel border-e"
      :class="{ 'panel-closed': !sidebarOpen }"
    >
      <ConversationList @conversation-selected="onConversationSelected" @close="sidebarOpen = false" />
    </div>

    <!-- Sağ Panel: Chat Window -->
    <div
      class="flex-grow-1 d-flex flex-column"
      style="min-width: 0; overflow: hidden"
    >
      <ChatWindow :sidebar-open="sidebarOpen" @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useChatStore } from "@/stores/chat";
import { useSocketStore } from "@/stores/socket";
import ConversationList from "./components/ConversationList.vue";
import ChatWindow from "./components/ChatWindow.vue";

const route = useRoute();
const chatStore = useChatStore();
const socketStore = useSocketStore();

const sidebarOpen = ref(true);

onMounted(async () => {
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
  transition: width 0.3s ease, min-width 0.3s ease, opacity 0.3s ease;
  overflow: hidden;
}

.conversation-panel.panel-closed {
  width: 0;
  min-width: 0;
  opacity: 0;
  border: none;
}
</style>