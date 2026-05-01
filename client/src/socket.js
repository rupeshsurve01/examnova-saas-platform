import { io } from "socket.io-client";

const apiBaseUrl =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const socketServerUrl = apiBaseUrl.replace(/\/api\/?$/, "");

export const socket = io(socketServerUrl, {
  autoConnect: false,
});
