import { defineStore } from "pinia";
import { connectSocket } from "@/socket";

export const useSocketStore = defineStore("socket", {
  state: () => ({
    onlineUsers: [],
    notifications: [],
    connected: false,
  }),
  actions: {
    init() {
      const socket = connectSocket();

      socket.on("connect", () => {
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

      socket.on("notification", (data) => {
        this.notifications.unshift(data);
      });
    },
    reset() {
      this.onlineUsers = [];
      this.notifications = [];
      this.connected = false;
    },
  },
});
