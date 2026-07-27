import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const messagesFile = path.join(__dirname, "messages.json");

const server = http.createServer();

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://192.168.1.36:5173",
    ],
    methods: ["GET", "POST"],
  },
});

// ==========================
// Store Users
// ==========================

const users = new Map();

// ==========================
// Load Messages
// ==========================

let messages = [];

try {

 const data = fs.readFileSync(
  messagesFile,
  "utf8"
);

  messages = JSON.parse(data);

  console.log(
    `Loaded ${messages.length} messages`
  );

} catch {

  console.log(
    "No previous messages found."
  );

  messages = [];

}

// ==========================
// Save Messages
// ==========================

function saveMessages() {

  fs.writeFileSync(
  messagesFile,
  JSON.stringify(messages, null, 2)
);

}

// ==========================
// Connection
// ==========================

io.on("connection", (socket) => {

  console.log("User Connected:", socket.id);

  // ==========================
  // USER JOIN
  // ==========================

  socket.on("join", (username) => {

    if (!username) return;

    const usernameExists = Array.from(
      users.values()
    ).some(

      (user) =>

        user.username.toLowerCase() ===
        username.toLowerCase()

    );

    if (usernameExists) {

      socket.emit("username-error");

      return;

    }

    users.set(socket.id, {

      id: socket.id,

      username,

    });

    console.log(`${username} joined`);

    io.emit(

      "online_users",

      Array.from(users.values())

    );

    io.emit(

      "user_count",

      users.size

    );

    socket.emit(

      "chat-history",

      messages

    );

  });

  // ==========================
  // SEND MESSAGE
  // ==========================

  socket.on("send_message", (message) => {

    const user = users.get(socket.id);

    if (!user) return;

    const newMessage = {

      id: message.id,

      sender: user.username,

      text: message.text,

      reply: message.reply || null,

      reactions: {},

      edited: false,

      time: new Date().toLocaleTimeString([], {

        hour: "2-digit",

        minute: "2-digit",

      }),

    };

    messages.push(newMessage);

    saveMessages();

    console.log("📩 Message:", newMessage);

    io.emit(

      "receive_message",

      newMessage

    );

  });

    // ==========================
  // EDIT MESSAGE
  // ==========================

  socket.on("edit-message", ({ id, text }) => {

    const msg = messages.find(
      (message) => message.id === id
    );

    if (!msg) return;

    msg.text = text;
    msg.edited = true;

    saveMessages();

    io.emit("message-edited", {

      id,

      text,

    });

  });

// ==========================
// REACTION
// ==========================

socket.on("add-reaction", ({ id, emoji }) => {

  const user = users.get(socket.id);

  if (!user) return;

  const message = messages.find(
    (msg) => msg.id === id
  );

  if (!message) return;

  if (!message.reactions) {
    message.reactions = {};
  }

  if (!message.reactions[emoji]) {
    message.reactions[emoji] = [];
  }

  const reacted = message.reactions[emoji].includes(
    user.username
  );

  if (reacted) {

    // Remove reaction
    message.reactions[emoji] =
      message.reactions[emoji].filter(
        (name) => name !== user.username
      );

    // Remove emoji if no users left
    if (message.reactions[emoji].length === 0) {
      delete message.reactions[emoji];
    }

  } else {

    // Add reaction
    message.reactions[emoji].push(
      user.username
    );

  }

  saveMessages();

  io.emit("reaction-updated", {
    id,
    reactions: message.reactions,
  });

});

  // ==========================
  // DELETE MESSAGE
  // ==========================

  socket.on("delete-message", (id) => {

    const index = messages.findIndex(
      (message) => message.id === id
    );

    if (index !== -1) {

      messages.splice(index, 1);

      saveMessages();

    }

    io.emit("message-deleted", id);

  });

  // ==========================
  // TYPING
  // ==========================

  socket.on("typing", () => {

    const user = users.get(socket.id);

    if (user) {

      socket.broadcast.emit(
        "typing",
        user.username
      );

    }

  });

  socket.on("stop_typing", () => {

    socket.broadcast.emit("stop_typing");

  });

  // ==========================
  // DISCONNECT
  // ==========================

  socket.on("disconnect", () => {

    const user = users.get(socket.id);

    if (user) {

      console.log(`${user.username} left`);

      users.delete(socket.id);

    }

    io.emit(
      "online_users",
      Array.from(users.values())
    );

    io.emit(
      "user_count",
      users.size
    );

    console.log(
      "User Disconnected:",
      socket.id
    );

  });

});

// ==========================
// START SERVER
// ==========================

server.listen(5000, () => {

  console.log(
    "Socket.IO Server running on port 5000"
  );

});