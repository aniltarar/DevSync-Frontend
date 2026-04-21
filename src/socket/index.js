import { io } from "socket.io-client";

let socket = null;

export const getSocket = () => {
  if (!socket) {
    throw new Error("Socket henüz başlatılmadı. connectSocket() çağır.");
  }
  return socket;
};

export const connectSocket = () => {
  if (socket) {
    // Aynı instance'ı koru — event listener'lar kaybolmasın
    if (!socket.connected) socket.connect();
    return socket;
  }

  socket = io(import.meta.env.VITE_API_URL, {
    withCredentials: true,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
