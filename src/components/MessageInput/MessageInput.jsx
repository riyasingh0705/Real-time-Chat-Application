import { useState, useRef, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";
import socket from "../../socket/socket";
import "./MessageInput.css";

function MessageInput({
  onSendMessage,
  username,
  replyMessage,
  clearReply,
  editingMessage,
  clearEdit,
}) {
  const [message, setMessage] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  const pickerRef = useRef(null);
  const typingTimeout = useRef(null);

  // Close emoji picker
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target)
      ) {
        setShowPicker(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // When edit message changes
  useEffect(() => {
    if (editingMessage) {
      queueMicrotask(() => {
        setMessage(editingMessage.text);
      });
    }
  }, [editingMessage]);

  // Send / Edit
  const handleSend = () => {
    if (!message.trim()) return;

    if (editingMessage) {
      onSendMessage(message, editingMessage.id);
      clearEdit();
    } else {
      onSendMessage(message);
      clearReply();
    }

    setMessage("");
    setShowPicker(false);

    socket.emit("stop_typing");
  };

  // Emoji
  const handleEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  // Typing
  const handleTyping = (e) => {
    setMessage(e.target.value);

    socket.emit("typing", username);

    clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      socket.emit("stop_typing");
    }, 1000);
  };

  // Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="message-input">

      {/* Reply Preview */}
      {replyMessage && (
        <div className="reply-preview">
          <div className="reply-header">
            <div>
              Replying to <strong>{replyMessage.sender}</strong>
            </div>

            <button
              className="reply-close"
              onClick={clearReply}
            >
              ✕
            </button>
          </div>

          <div className="reply-text">
            {replyMessage.text}
          </div>
        </div>
      )}

      {/* Edit Preview */}
      {editingMessage && (
        <div className="edit-preview">
          <div className="edit-header">
            Edit message

            <button
              className="reply-close"
              onClick={() => {
                clearEdit();
                setMessage("");
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="input-box">
        <span
          className="emoji"
          onClick={() => setShowPicker(!showPicker)}
        >
          😊
        </span>

        <input
          type="text"
          value={message}
          placeholder={
            editingMessage
              ? "Edit message..."
              : "Type a message..."
          }
          onChange={handleTyping}
          onKeyDown={handleKeyDown}
        />
      </div>

      <button
        className="send-btn"
        onClick={handleSend}
      >
        {editingMessage ? "✔" : "➤"}
      </button>

      {showPicker && (
        <div
          className="emoji-picker"
          ref={pickerRef}
        >
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            theme="light"
          />
        </div>
      )}
    </div>
  );
}

export default MessageInput;