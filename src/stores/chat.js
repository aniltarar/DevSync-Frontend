import { defineStore } from "pinia";
import api from "@/api";
import { useAppStore } from "@/stores/app";

export const useChatStore = defineStore("chat", {
  state: () => ({
    conversations: [],
    conversationsTotal: 0,
    conversationsStatus: "idle",

    activeConversation: null,
    messages: [],
    messagesPagination: { currentPage: 1, totalPages: 0, totalMessages: 0, limit: 10 },
    messagesStatus: "idle",

    sendingStatus: "idle",
    typingUsers: [],

    archivedConversations: [],
    archivedStatus: "idle",
  }),

  getters: {
    sortedConversations: (state) =>
      [...state.conversations].sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
      ),
  },

  actions: {
    // ── Conversations ──────────────────────────────
    async fetchConversations() {
      const appStore = useAppStore();
      this.conversationsStatus = "loading";
      try {
        const { data } = await api.get("/chat/conversations", {
          params: { limit: 50, skip: 0 },
        });
        this.conversations = data.conversations;
        this.conversationsTotal = data.total;
        this.conversationsStatus = "success";
      } catch (error) {
        this.conversationsStatus = "error";
        appStore.apiError(error, "Sohbetler yüklenemedi.");
      }
    },

    async createOrGetConversation(participantId) {
      const appStore = useAppStore();
      try {
        const { data } = await api.post("/chat/conversations", {
          participantIds: [participantId],
          conversationType: "direct",
        });
        const conv = data.conversation;

        // Listeye ekle (yoksa)
        if (!this.conversations.find((c) => c._id === conv._id)) {
          // Populate edilmemiş olabilir, detayı çek
          await this.fetchConversations();
        }
        return conv;
      } catch (error) {
        appStore.apiError(error, "Sohbet oluşturulamadı.");
        return null;
      }
    },

    async deleteConversation(conversationId) {
      const appStore = useAppStore();
      try {
        await api.delete(`/chat/conversations/${conversationId}`);
        this.conversations = this.conversations.filter(
          (c) => c._id !== conversationId,
        );
        if (this.activeConversation?._id === conversationId) {
          this.activeConversation = null;
          this.messages = [];
        }
        appStore.success("Sohbet arşivlendi.");
      } catch (error) {
        appStore.apiError(error, "Sohbet arşivlenemedi.");
      }
    },

    async fetchArchivedConversations() {
      const appStore = useAppStore();
      this.archivedStatus = "loading";
      try {
        const { data } = await api.get("/chat/conversations/archived", {
          params: { limit: 50, skip: 0 },
        });
        this.archivedConversations = data.conversations;
        this.archivedStatus = "success";
      } catch (error) {
        this.archivedStatus = "error";
        appStore.apiError(error, "Arşivlenmiş sohbetler yüklenemedi.");
      }
    },

    async unarchiveConversation(conversationId) {
      const appStore = useAppStore();
      try {
        await api.patch(`/chat/conversations/${conversationId}/unarchive`);
        const conv = this.archivedConversations.find((c) => c._id === conversationId);
        this.archivedConversations = this.archivedConversations.filter(
          (c) => c._id !== conversationId,
        );
        if (conv) {
          this.conversations.push(conv);
        }
        appStore.success("Sohbet arşivden çıkarıldı.");
      } catch (error) {
        appStore.apiError(error, "Sohbet arşivden çıkarılamadı.");
      }
    },

    // ── Messages ───────────────────────────────────
    async openConversation(conversationId) {
      this.messagesStatus = "loading";
      this.messages = [];
      this.typingUsers = [];
      const appStore = useAppStore();
      try {
        // Sohbet detayı
        const { data: convData } = await api.get(
          `/chat/conversations/${conversationId}`,
        );
        this.activeConversation = convData.conversation;

        // İlk sayfa mesajları
        await this.fetchMessages(conversationId, 1);

        // Okundu işaretle
        await this.markAsRead(conversationId);

        this.messagesStatus = "success";
      } catch (error) {
        this.messagesStatus = "error";
        appStore.apiError(error, "Sohbet açılamadı.");
      }
    },

    async fetchMessages(conversationId, page = 1) {
      const appStore = useAppStore();
      try {
        const { data } = await api.get(
          `/chat/conversations/${conversationId}/messages`,
          { params: { page, limit: 10 } },
        );
        if (page === 1) {
          this.messages = data.messages;
        } else {
          // Önceki sayfalar — başa ekle
          this.messages = [...data.messages, ...this.messages];
        }
        this.messagesPagination = data.pagination;
      } catch (error) {
        appStore.apiError(error, "Mesajlar yüklenemedi.");
      }
    },

    async sendMessage(conversationId, content) {
      const appStore = useAppStore();
      this.sendingStatus = "sending";
      try {
        const { data } = await api.post(
          `/chat/conversations/${conversationId}/messages`,
          { content },
        );
        // Socket broadcast'ten gelecek — ama güvenlik için local ekle
        const msg = data.data;
        if (!this.messages.find((m) => m._id === msg._id)) {
          this.messages.push(msg);
        }
        this._updateConversationLastMessage(conversationId, content);
        this.sendingStatus = "idle";
        return msg;
      } catch (error) {
        this.sendingStatus = "error";
        appStore.apiError(error, "Mesaj gönderilemedi.");
        return null;
      }
    },

    async editMessage(messageId, content) {
      const appStore = useAppStore();
      try {
        const { data } = await api.put(`/chat/messages/${messageId}`, {
          content,
        });
        const edited = data.data;
        const idx = this.messages.findIndex((m) => m._id === messageId);
        if (idx !== -1) {
          this.messages[idx] = { ...this.messages[idx], content: edited.content, isEdited: true, editedAt: edited.editedAt };
        }
        return true;
      } catch (error) {
        appStore.apiError(error, "Mesaj düzenlenemedi.");
        return false;
      }
    },

    async deleteMessage(messageId) {
      const appStore = useAppStore();
      try {
        await api.delete(`/chat/messages/${messageId}`);
        this.messages = this.messages.filter((m) => m._id !== messageId);
        return true;
      } catch (error) {
        appStore.apiError(error, "Mesaj silinemedi.");
        return false;
      }
    },

    async markAsRead(conversationId) {
      try {
        await api.post(`/chat/conversations/${conversationId}/read`);
        // Conversation unreadCount'u sıfırla
        const conv = this.conversations.find((c) => c._id === conversationId);
        if (conv) conv.unreadCount = 0;
      } catch {
        // Sessiz hata
      }
    },

    // ── Socket Event Handlers ──────────────────────
    handleNewMessage(message) {
      const convId =
        typeof message.conversationId === "object"
          ? message.conversationId._id
          : message.conversationId;

      // Aktif sohbetse mesajı ekle
      if (this.activeConversation?._id === convId) {
        if (!this.messages.find((m) => m._id === message._id)) {
          this.messages.push(message);
        }
        this.markAsRead(convId);
      }

      // Conversation listesini güncelle
      this._updateConversationLastMessage(convId, message.content);
      const conv = this.conversations.find((c) => c._id === convId);
      if (conv && this.activeConversation?._id !== convId) {
        conv.unreadCount = (conv.unreadCount || 0) + 1;
      }

      // Listede yoksa refetch
      if (!conv) {
        this.fetchConversations();
      }
    },

    handleMessageEdited({ messageId, content, editedAt }) {
      const idx = this.messages.findIndex((m) => m._id === messageId);
      if (idx !== -1) {
        this.messages[idx] = { ...this.messages[idx], content, isEdited: true, editedAt };
      }
    },

    handleMessageDeleted({ messageId }) {
      this.messages = this.messages.filter((m) => m._id !== messageId);
    },

    handleMessagesRead({ conversationId, userId }) {
      // Mesajlardaki readBy'ı güncelleyebiliriz ama basit tutalım
      const conv = this.conversations.find((c) => c._id === conversationId);
      if (conv) conv.unreadCount = 0;
    },

    handleTyping({ conversationId, userId, username }) {
      if (this.activeConversation?._id === conversationId) {
        if (!this.typingUsers.find((u) => u.userId === userId)) {
          this.typingUsers.push({ userId, username });
        }
      }
    },

    handleStopTyping({ conversationId, userId }) {
      if (this.activeConversation?._id === conversationId) {
        this.typingUsers = this.typingUsers.filter((u) => u.userId !== userId);
      }
    },

    handleConversationUpdated({ conversationId, lastMessage }) {
      const conv = this.conversations.find((c) => c._id === conversationId);
      if (conv) {
        conv.lastMessage = { ...conv.lastMessage, ...lastMessage };
        conv.updatedAt = lastMessage.timestamp || new Date().toISOString();
      } else {
        // Yeni bir sohbet gelmiş olabilir, listeyi yenile
        this.fetchConversations();
      }
    },

    // ── Helpers ────────────────────────────────────
    _updateConversationLastMessage(conversationId, content) {
      const conv = this.conversations.find((c) => c._id === conversationId);
      if (conv) {
        conv.lastMessage = {
          ...conv.lastMessage,
          content,
          timestamp: new Date().toISOString(),
        };
        conv.updatedAt = new Date().toISOString();
      }
    },

    clearChat() {
      this.activeConversation = null;
      this.messages = [];
      this.typingUsers = [];
      this.messagesStatus = "idle";
    },

    reset() {
      this.$reset();
    },
  },
});
