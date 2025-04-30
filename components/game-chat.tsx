"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { sendChatMessage, fetchChatMessages } from "@/lib/actions"

interface GameChatProps {
  gameId: string
  playerName: string
}

export function GameChat({ gameId, playerName }: GameChatProps) {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const isAutoScrollEnabled = useRef(true)
  const prevMessagesLength = useRef(0)

  // Poll for new messages
  useEffect(() => {
    let intervalId: NodeJS.Timeout

    const pollMessages = async () => {
      try {
        // Save scroll position before updating
        const chatContainer = chatContainerRef.current
        const isScrolledToBottom =
          chatContainer && chatContainer.scrollHeight - chatContainer.scrollTop <= chatContainer.clientHeight + 50

        // Only auto-scroll if user was already at the bottom
        isAutoScrollEnabled.current = isScrolledToBottom || false

        const chatMessages = await fetchChatMessages(gameId)

        // Only update if there are new messages
        if (chatMessages.length !== prevMessagesLength.current) {
          setMessages(chatMessages)
          prevMessagesLength.current = chatMessages.length
        }
      } catch (error) {
        console.error("Error fetching chat messages:", error)
      }
    }

    // Initial fetch
    pollMessages()

    // Set up polling
    intervalId = setInterval(pollMessages, 3000)

    return () => {
      clearInterval(intervalId)
    }
  }, [gameId])

  // Scroll to bottom when messages change, but only if auto-scroll is enabled
  useEffect(() => {
    if (isAutoScrollEnabled.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !playerName) return

    try {
      await sendChatMessage(gameId, playerName, newMessage)
      setNewMessage("")
      // Enable auto-scroll when user sends a message
      isAutoScrollEnabled.current = true
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  // Handle manual scroll to detect if user has scrolled up
  const handleScroll = () => {
    const chatContainer = chatContainerRef.current
    if (!chatContainer) return

    // If user scrolls up, disable auto-scroll
    // If user scrolls to bottom, enable auto-scroll
    isAutoScrollEnabled.current =
      chatContainer.scrollHeight - chatContainer.scrollTop <= chatContainer.clientHeight + 50
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chat</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col h-[300px]">
          <div className="flex-grow overflow-y-auto mb-4 space-y-2" ref={chatContainerRef} onScroll={handleScroll}>
            {messages.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">No messages yet. Start the conversation!</p>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-md max-w-[85%] ${
                    msg.sender === playerName ? "ml-auto bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <p className="text-xs font-medium mb-1">{msg.sender}</p>
                  <p className="text-sm">{msg.content}</p>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage()
                }
              }}
              disabled={!playerName}
            />
            <Button size="icon" onClick={handleSendMessage} disabled={!newMessage.trim() || !playerName}>
              →
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
