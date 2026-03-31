import { io } from "socket.io-client";

let socket = null;

export const getSocket = () => {
  if (!socket) {
    throw new Error("Socket henüz başlatılmadı. connectSocket() çağır.");
  }
  return socket;
};

export const connectSocket = () => {
  if (socket?.connected) return socket;

  socket = io(import.meta.env.VITE_API_URL, {
    withCredentials: true,
    transports: ["websocket", "polling"],
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
