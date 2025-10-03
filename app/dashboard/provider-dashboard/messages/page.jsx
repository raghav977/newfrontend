"use client";
import { useEffect, useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { io } from "socket.io-client";

export default function MessagesLayout({ providerId }) {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io("http://localhost:3024");

    // Fetch provider's active rooms (replace with API if needed)
    const initialChats = [
      {
        roomId: "service-4-user-23",
        participantName: "John Doe",
        participantAvatar: "/placeholder.svg",
        messages: [],
        unread: 0,
      },
    ];

    setChats(initialChats);

    // Join all rooms for this provider
    initialChats.forEach((chat) => {
      socketRef.current.emit("joinBidRoom", chat.roomId);
    });

    // Listen for new bids
    socketRef.current.on("newBid", (data) => {
      setChats((prev) =>
        prev.map((chat) =>
          chat.roomId === data.roomId
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  {
                    amount: data.amount,
                    senderType: "user",
                    timestamp: new Date().toISOString(),
                  },
                ],
                unread: (chat.unread || 0) + 1,
              }
            : chat
        )
      );
    });

    return () => socketRef.current.disconnect();
  }, []);

  const handleSendMessage = (roomId) => {
    if (!newMessage) return;

    socketRef.current.emit("sendMessage", { roomId, content: newMessage });

    setChats((prev) =>
      prev.map((chat) =>
        chat.roomId === roomId
          ? {
              ...chat,
              messages: [
                ...chat.messages,
                { content: newMessage, senderType: "provider", timestamp: new Date().toISOString() },
              ],
            }
          : chat
      )
    );

    setNewMessage("");
  };

  return (
    <div className="h-[90vh] flex bg-gray-50">
      {/* Chat list */}
      <div className="w-80 border-r bg-white flex flex-col">
        <div className="p-4 border-b font-semibold text-lg">Messages</div>
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <div
              key={chat.roomId}
              onClick={() => setSelectedChat(chat.roomId)}
              className={`p-3 cursor-pointer hover:bg-gray-100 ${selectedChat === chat.roomId ? "bg-gray-100" : ""}`}
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={chat.participantAvatar} />
                  <AvatarFallback>{chat.participantName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{chat.participantName}</p>
                  <p className="text-xs text-gray-500 truncate">{chat.messages.slice(-1)[0]?.amount ? `Bid: $${chat.messages.slice(-1)[0].amount}` : ""}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat window */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            <div className="p-4 border-b flex items-center gap-3">
              <p className="font-medium">{chats.find((c) => c.roomId === selectedChat)?.participantName}</p>
            </div>

            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {chats
                .find((c) => c.roomId === selectedChat)
                ?.messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.senderType === "provider" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg ${
                        msg.senderType === "provider" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      <p className="text-sm">{msg.amount ? `$${msg.amount}` : msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
            </div>

            <div className="p-4 border-t flex gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage(selectedChat)}
              />
              <Button onClick={() => handleSendMessage(selectedChat)}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
