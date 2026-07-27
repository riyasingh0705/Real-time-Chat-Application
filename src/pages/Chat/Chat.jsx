import { useState, useEffect } from "react";
import { useLocation, Navigate } from "react-router-dom";

import socket from "../../socket/socket";

import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import ChatWindow from "../../components/ChatWindow/ChatWindow";
import MessageInput from "../../components/MessageInput/MessageInput";

import "./Chat.css";

function Chat() {

  const location = useLocation();

  const username = location.state?.username;

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState("");
  const [messages, setMessages] = useState([]);
  const [replyMessage, setReplyMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {

    socket.connect();

    socket.on("connect", () => {

      console.log("Connected:", socket.id);

      socket.emit("join", username);

    });

    // ==========================
// USERNAME ALREADY EXISTS
// ==========================

socket.on("username-error", () => {

  sessionStorage.setItem(

    "joinError",

    "Username already exists. Please choose another username."

  );

  socket.disconnect();

  window.location.href = "/";

});

    // Receive Message
    socket.on("receive_message", (message) => {

      setMessages((prev) => [

        ...prev,

        {

          ...message,

          own: message.sender === username,

          reactions: message.reactions || {},

        },

      ]);

    });

    // ==========================
// Chat History
// ==========================

socket.on("chat-history", (history) => {

  setMessages(

    history.map((msg) => ({

      ...msg,

      own: msg.sender === username,

    }))

  );

});

    // Edited Message
    socket.on("message-edited", (updatedMessage) => {

      setMessages((prev) =>

        prev.map((msg) =>

          msg.id === updatedMessage.id

            ? {

                ...msg,

                text: updatedMessage.text,

                edited: true,

              }

            : msg

        )

      );

    });

    // ==========================
// REACTION UPDATED
// ==========================

socket.on("reaction-updated", ({ id, reactions }) => {

  setMessages((prev) =>

    prev.map((msg) =>

      msg.id === id

        ? {

            ...msg,

            reactions,

          }

        : msg

    )

  );

});

    // Deleted Message
    socket.on("message-deleted", (id) => {

      setMessages((prev) =>

        prev.filter((msg) => msg.id !== id)

      );

    });


    // Online Users
    socket.on("online_users", (users) => {

      setOnlineUsers(users);

    });

    // Typing
    socket.on("typing", (user) => {

      setTypingUser(user);

    });

    socket.on("stop_typing", () => {

      setTypingUser("");

    });

    return () => {

      socket.off("connect");
      socket.off("username-error");
      socket.off("receive_message");
      socket.off("chat-history");
      socket.off("message-edited");
      socket.off("reaction-updated"); 
      socket.off("message-deleted");
      socket.off("online_users");
      socket.off("typing");
      socket.off("stop_typing");

      socket.disconnect();

    };

  }, [username]);


  if (!username) {

    return <Navigate to="/" replace />;

  }

  // ==========================
  // Send / Edit Message
  // ==========================

  const handleSendMessage = (text, editingId = null) => {

    if (!text.trim()) return;

    // Editing
    if (editingId) {

      socket.emit("edit-message", {

        id: editingId,

        text,

      });

      setEditingMessage(null);

      socket.emit("stop_typing");

      return;

    }

    // New Message
    const newMessage = {

      id: Date.now(),

      sender: username,

      text,

      reply: replyMessage,

      time: new Date().toLocaleTimeString([], {

        hour: "2-digit",

        minute: "2-digit",

      }),

    };

    socket.emit("send_message", newMessage);

    setReplyMessage(null);

    socket.emit("stop_typing");

  };

    // ==========================
  // Emoji Reaction
  // ==========================

  const handleReaction = (messageId, emoji) => {

  socket.emit("add-reaction", {

    id: messageId,

    emoji,

  });

};

  // ==========================
  // Delete For Me
  // ==========================

  const deleteForMe = (id) => {

    setMessages((prev) =>

      prev.filter((msg) => msg.id !== id)

    );

  };



  // ==========================
  // Delete For Everyone
  // ==========================

  const deleteForEveryone = (id) => {

    socket.emit("delete-message", id);

  };



  return (

    <div className="chat-page">

      <Header
  username={username}
  toggleSidebar={() =>
    setSidebarOpen(!sidebarOpen)
  }
/>

      <div className="chat-body">

        <Sidebar
  onlineUsers={onlineUsers}
  currentUser={username}
  sidebarOpen={sidebarOpen}
  closeSidebar={() =>
    setSidebarOpen(false)
  }
/>

        <div
  className="chat-content"
  onClick={() => {

    if (sidebarOpen) {

      setSidebarOpen(false);

    }

  }}
>

          <ChatWindow
            messages={messages}
            typingUser={typingUser}
            onReaction={handleReaction}
            onReply={setReplyMessage}
            onEdit={setEditingMessage}
            deleteForMe={deleteForMe}
            deleteForEveryone={deleteForEveryone}
          />

          <MessageInput
            onSendMessage={handleSendMessage}
            username={username}
            replyMessage={replyMessage}
            clearReply={() => setReplyMessage(null)}
            editingMessage={editingMessage}
            clearEdit={() => setEditingMessage(null)}
          />

        </div>

      </div>

    </div>

  );

}

export default Chat;