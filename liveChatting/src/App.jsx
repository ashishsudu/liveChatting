import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { PaperAirplaneIcon, FaceSmileIcon } from "@heroicons/react/24/solid";
import EmojiPicker from "emoji-picker-react";

function App() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const onEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  useEffect(() => {
    if (isLoggedIn && username.trim()) {
      socketRef.current = io('http://192.168.3.209:3001', {
        transports: ['websocket', 'polling'],
        reconnection: true,
      });

      socketRef.current.on("connect", () => {
        socketRef.current.emit("register-user", username);
      });

      socketRef.current.on("user-list-updated", (userList) => {
        setOnlineCount(userList.length);
      });

      socketRef.current.on("message", (message) => {
        setMessages((prev) => [...prev, message]);
      });

      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [isLoggedIn, username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && socketRef.current?.connected) {
      socketRef.current.emit("message", {
        text: message.trim(),
        username,
        timestamp: new Date().toISOString(),
      });
      setMessage("");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700">
          <h1 className="text-3xl font-bold mb-6 text-center">💬 Join Chat</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setIsLoggedIn(true);
            }}
            className="space-y-4"
          >
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-500 p-2 rounded hover:bg-blue-600 transition-all"
            >
              Join
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white relative">
      <header className="bg-gray-900 shadow-md py-4 px-6 flex justify-between items-center">
        <h1 className="text-xl font-semibold">🔥 Live Chat Room 🔥</h1>
        <div className="text-sm text-gray-300">
          Online: {onlineCount}
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4  bg-gray-900 border-t border-gray-700">
          <div className="flex flex-col space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.username === username ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] rounded-lg p-3 ${
                  msg.username === username ? "bg-blue-500 text-white" :
                  msg.type === "system" ? "bg-gray-700 text-gray-300 italic text-center w-full" :
                  "bg-purple-600 text-white"
                }`}>
                  {msg.type !== "system" && <p className="text-sm font-semibold">{msg.username}</p>}
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <p className="text-xs opacity-75 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex p-4 gap-2 bg-gray-900 border-t border-gray-700">
          <div className="relative flex-1">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full p-2 pl-10 rounded-lg bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute left-3 top-2.5 text-gray-400 hover:text-white"
            >
              <FaceSmileIcon className="h-5 w-5" />
            </button>
          </div>

          <button
            type="submit"
            className="bg-blue-500 p-2 rounded-lg hover:bg-blue-600 transition-all"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </form>

        {showEmojiPicker && (
          <div className="absolute bottom-20 left-4 z-50">
            <EmojiPicker
              onEmojiClick={onEmojiClick}
              width={300}
              height={350}
              previewConfig={{ showPreview: false }}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
