import { defineStore } from "pinia";
import { connectSocket, getSocket } from "@/socket";
import { useChatStore } from "@/stores/chat";
import { useNotificationStore } from "@/stores/notification";

export const useSocketStore = defineStore("socket", {
  state: () => ({
    onlineUsers: [],
    connected: false,
  }),
  actions: {
    init() {
      const socket = connectSocket();
      const notificationStore = useNotificationStore();

      socket.on("connect", () => {
        console.log("[Socket] Bağlantı kuruldu, socket.id:", socket.id);
        this.connected = true;
      });

      socket.on("disconnect", () => {
        this.connected = false;
      });

      socket.on("userOnline", ({ userId, username }) => {
        if (!this.onlineUsers.find((u) => u.userId === userId)) {
          this.onlineUsers.push({ userId, username });
        }
      });

      socket.on("userOffline", ({ userId }) => {
        this.onlineUsers = this.onlineUsers.filter((u) => u.userId !== userId);
      });

      // Bağlantıda mevcut online kullanıcı listesini al
      socket.on("onlineUsers", (users) => {
        this.onlineUsers = users;
      });

      // ── Notification Events ──────────────────────
      socket.on("newNotification", (data) => {
        console.log("[Socket] newNotification alındı:", data);
        notificationStore.handleNewNotification(data);
      });

      socket.on("notificationRead", (data) => {
        notificationStore.handleNotificationRead(data.notificationId);
      });

      socket.on("allNotificationsRead", () => {
        notificationStore.handleAllRead();
      });

      // ── Chat Events ──────────────────────────────
      socket.on("newMessage", (message) => {
        useChatStore().handleNewMessage(message);
      });

      socket.on("messageEdited", (data) => {
        useChatStore().handleMessageEdited(data);
      });

      socket.on("messageDeleted", (data) => {
        useChatStore().handleMessageDeleted(data);
      });

      socket.on("messagesRead", (data) => {
        useChatStore().handleMessagesRead(data);
      });

      socket.on("userTyping", (data) => {
        useChatStore().handleTyping(data);
      });

      socket.on("userStopTyping", (data) => {
        useChatStore().handleStopTyping(data);
      });

      socket.on("conversationUpdated", (data) => {
        useChatStore().handleConversationUpdated(data);
      });
    },

    // ── Socket Chat Helpers ──────────────────────
    joinConversation(conversationId) {
      try {
        const socket = getSocket();
        socket.emit("joinConversation", conversationId);
      } catch {
        // Socket henüz hazır değilse yoksay
      }
    },

    leaveConversation(conversationId) {
      try {
        const socket = getSocket();
        socket.emit("leaveConversation", conversationId);
      } catch {
        // Socket henüz hazır değilse yoksay
      }
    },

    emitTyping(conversationId) {
      try {
        const socket = getSocket();
        socket.emit("typing", { conversationId });
      } catch {
        // yoksay
      }
    },

    emitStopTyping(conversationId) {
      try {
        const socket = getSocket();
        socket.emit("stopTyping", { conversationId });
      } catch {
        // yoksay
      }
    },

    reset() {
      this.onlineUsers = [];
      this.connected = false;
    },
  },
});
