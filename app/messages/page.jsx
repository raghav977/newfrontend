"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send } from "lucide-react"
import HeaderNavbar from "../landingpagecomponents/components/HeaderNavbar"
import Head from "next/head"

export default function MessagesLayout() {
  const [selectedChat, setSelectedChat] = useState(null)
  const [newMessage, setNewMessage] = useState("")

  // Mock data
  const chats = [
    {
      id: "1",
      participantName: "Sarah Johnson",
      participantAvatar: "/diverse-woman-portrait.png",
      lastMessage: "Thanks for your bid! Let me review the details.",
      timestamp: "2 min ago",
      unread: 1,
      messages: [
        { id: "1", senderId: "other", content: "Hi! I saw your bid on my project.", timestamp: "10:30 AM" },
        { id: "2", senderId: "me", content: "Hello! I can deliver in 5 days.", timestamp: "10:32 AM" },
        { id: "3", senderId: "other", content: "Thanks for your bid! Let me review.", timestamp: "10:35 AM" },
      ],
    },
    {
      id: "2",
      participantName: "Mike Chen",
      participantAvatar: "/thoughtful-man.png",
      lastMessage: "Looking forward to your offer.",
      timestamp: "5 min ago",
      unread: 0,
      messages: [],
    },
  ]

  const handleSendMessage = (chatId) => {
    if (!newMessage) return
    const chat = chats.find((c) => c.id === chatId)
    if (!chat) return
    chat.messages.push({ id: Date.now(), senderId: "me", content: newMessage, timestamp: "Now" })
    setNewMessage("")
  }

  return (
    <div>
        <HeaderNavbar/>
    <div className="h-[93vh] flex bg-gray-50">
      <div className="w-80 border-r bg-white flex flex-col">
        <div className="p-4 border-b font-semibold text-lg">Messages</div>
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat.id)}
              className={`p-3 cursor-pointer hover:bg-gray-100 ${selectedChat === chat.id ? "bg-gray-100" : ""}`}
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={chat.participantAvatar || "/placeholder.svg"} />
                  <AvatarFallback>{chat.participantName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="font-medium truncate">{chat.participantName}</p>
                    {chat.unread > 0 && <Badge className="h-5 w-5 p-0 text-xs">{chat.unread}</Badge>}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
                  <p className="text-xs text-gray-400">{chat.timestamp}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={chats.find((c) => c.id === selectedChat)?.participantAvatar || "/placeholder.svg"}
                />
                <AvatarFallback>{chats.find((c) => c.id === selectedChat)?.participantName[0]}</AvatarFallback>
              </Avatar>
              <p className="font-medium">{chats.find((c) => c.id === selectedChat)?.participantName}</p>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {chats
                .find((c) => c.id === selectedChat)
                ?.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === "me" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg ${
                        message.senderId === "me" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
                    </div>
                  </div>
                ))}
            </div>

            {/* Message Input */}
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
    </div>
  )
}
