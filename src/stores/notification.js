import { defineStore } from "pinia";
import api from "@/api";
import { useAppStore } from "@/stores/app";
import router from "@/router";

export const useNotificationStore = defineStore("notification", {
  state: () => ({
    notifications: [],
    pagination: { page: 1, totalPages: 0, total: 0, limit: 20 },
    status: "idle",
    unreadCount: 0,
  }),

  actions: {
    // ── Fetch ──────────────────────────────────────
    async fetchNotifications({ page = 1, unreadOnly = false, append = false } = {}) {
      const appStore = useAppStore();
      if (!append) this.status = "loading";
      try {
        const { data } = await api.get("/notifications", {
          params: { page, limit: this.pagination.limit, unreadOnly },
        });
        if (append) {
          this.notifications.push(...data.notifications);
        } else {
          this.notifications = data.notifications;
        }
        this.pagination = {
          page: data.pagination.page,
          totalPages: data.pagination.totalPages,
          total: data.pagination.total,
          limit: data.pagination.limit,
        };
        this.status = "success";
      } catch (error) {
        this.status = "error";
        appStore.apiError(error, "Bildirimler yüklenemedi.");
      }
    },

    async fetchUnreadCount() {
      try {
        const { data } = await api.get("/notifications/unread-count");
        this.unreadCount = data.count;
      } catch {
        // sessiz hata
      }
    },

    // ── Mark Read ──────────────────────────────────
    async markAsRead(notificationId) {
      try {
        await api.patch(`/notifications/${notificationId}/read`);
        const n = this.notifications.find((n) => n._id === notificationId);
        if (n && !n.isRead) {
          n.isRead = true;
          n.readAt = new Date().toISOString();
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        }
      } catch {
        // sessiz hata
      }
    },

    async markAllAsRead() {
      const appStore = useAppStore();
      try {
        await api.patch("/notifications/read-all");
        this.notifications.forEach((n) => {
          if (!n.isRead) {
            n.isRead = true;
            n.readAt = new Date().toISOString();
          }
        });
        this.unreadCount = 0;
      } catch (error) {
        appStore.apiError(error, "Bildirimler okundu olarak işaretlenemedi.");
      }
    },

    // ── Socket Handlers ────────────────────────────
    handleNewNotification(notification) {
      // Başa ekle, duplikasyon kontrolü
      if (!this.notifications.find((n) => n._id === notification._id)) {
        this.notifications.unshift(notification);
        this.pagination.total += 1;
      }
      this.unreadCount += 1;

      // Mesaj sayfasındayken mesaj toast'ı gösterme
      const currentPath = router.currentRoute.value.path;
      if (notification.type === "message" && currentPath.startsWith("/messages")) {
        return;
      }

      // Bildirim toast'ı göster
      const appStore = useAppStore();
      const label = getNotificationLabel(notification);
      const route = getNotificationRoute(notification);
      const icon = getNotificationIcon(notification.type);
      const color = getNotificationColor(notification.type);
      const avatarUrl = notification.senderId?.profile?.avatarUrl || "";

      appStore.notificationToast({
        message: label,
        icon,
        color,
        avatarUrl,
        route,
      });
    },

    handleNotificationRead(notificationId) {
      const n = this.notifications.find((n) => n._id === notificationId);
      if (n && !n.isRead) {
        n.isRead = true;
        n.readAt = new Date().toISOString();
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      }
    },

    handleAllRead() {
      this.notifications.forEach((n) => {
        n.isRead = true;
        n.readAt = new Date().toISOString();
      });
      this.unreadCount = 0;
    },
  },
});

// ── Helpers ──────────────────────────────────────
function getNotificationLabel(notification) {
  const sender = notification.senderId?.username || "Birisi";
  const typeMap = {
    like_post: `${sender} gönderinizi beğendi`,
    like_comment: `${sender} yorumunuzu beğendi`,
    comment: `${sender} gönderinize yorum yaptı`,
    reply: `${sender} yorumunuza yanıt verdi`,
    follow: `${sender} sizi takip etmeye başladı`,
    new_application: `${sender} projenize başvurdu`,
    application_update: `Başvurunuz güncellendi`,
    project_invite: `${sender} sizi bir projeye davet etti`,
    message: `${sender} size bir mesaj gönderdi`,
  };
  return typeMap[notification.type] || "Yeni bildirim";
}

function getNotificationIcon(type) {
  const map = {
    like_post: "mdi-heart",
    like_comment: "mdi-heart",
    comment: "mdi-comment-text-outline",
    reply: "mdi-reply",
    follow: "mdi-account-plus",
    new_application: "mdi-file-document-plus-outline",
    application_update: "mdi-file-document-check-outline",
    project_invite: "mdi-account-group-outline",
    message: "mdi-message-text-outline",
  };
  return map[type] || "mdi-bell";
}

function getNotificationColor(type) {
  const map = {
    like_post: "error",
    like_comment: "error",
    comment: "secondary",
    reply: "secondary",
    follow: "accent",
    new_application: "primary",
    application_update: "success",
    project_invite: "primary",
    message: "primary",
  };
  return map[type] || "primary";
}

function getNotificationRoute(notification) {
  switch (notification.type) {
    case "like_post":
    case "comment":
    case "like_comment":
    case "reply":
      return `/posts/${notification.referenceId}`;
    case "follow":
      return `/profile/${notification.senderId?._id || notification.senderId}`;
    case "new_application":
      return `/my-projects`;
    case "application_update":
      return "/applications";
    case "project_invite":
      return "/projects";
    case "message":
      return { path: "/messages", query: { conversationId: notification.referenceId } };
    default:
      return "/notifications";
  }
}

export { getNotificationLabel, getNotificationIcon, getNotificationColor, getNotificationRoute };
