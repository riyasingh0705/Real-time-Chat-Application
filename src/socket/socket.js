import { io } from "socket.io-client";

const socket = io("http://192.168.1.36:5000", {
  autoConnect: false,
});

export default socket;