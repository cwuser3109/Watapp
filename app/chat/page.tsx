"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

type Profile = {
  id: string
  email: string
}

type Message = {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
}

export default function ChatPage() {
  const router = useRouter()
  const bottomRef = useRef<HTMLDivElement>(null)

  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [users, setUsers] = useState<Profile[]>([])
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loadingMessages, setLoadingMessages] = useState(false)

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push("/login")
        return
      }
      setCurrentUser({ id: data.user.id, email: data.user.email! })
    }
    getUser()
  }, [])

  // Fetch all other users
  useEffect(() => {
    if (!currentUser) return
    const fetchUsers = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, email")
        .neq("id", currentUser.id)
        .order("email")
      if (data) setUsers(data)
    }
    fetchUsers()
  }, [currentUser])

  // Fetch messages when a user is selected
  useEffect(() => {
    if (!currentUser || !selectedUser) return

    const fetchMessages = async () => {
      setLoadingMessages(true)
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${currentUser.id})`
        )
        .order("created_at", { ascending: true })
      if (data) setMessages(data)
      setLoadingMessages(false)
    }

    fetchMessages()

    // Real-time subscription
    const channel = supabase
      .channel("messages-${currentuser.id}-${user.id}")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new as Message

          const isRelevant = (msg.sender_id===currentUser.id && msg.receiver_id===selectedUser.id) ||
          (msg.sender_id===selectedUser.id && msg.receiver_id===currentUser.id)

          if (isRelevant) {
            setMessages((prev) => [...prev, msg])
          }
          // const isFromOtherUser =
          //   msg.sender_id === selectedUser.id && msg.receiver_id === currentUser.id
          // if (isFromOtherUser) {
          //   setMessages((prev) => [...prev, msg])
          // }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUser, selectedUser])

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || !currentUser || !selectedUser) return

    const content = input.trim()
    setInput("")

    const {  error } = await supabase
      .from("messages")
      .insert({
        sender_id: currentUser.id,
        receiver_id: selectedUser.id,
        content,
      })
      .select()
      .single()

    if (error) {
      console.error(error)
      setInput(content) // restore input if failed
      return
    }

    
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase()
  }

  const getAvatarColor = (email: string) => {
    const colors = ["#00a884", "#5157ae", "#d3396d", "#e07c39", "#1da0cb"]
    const index = email.charCodeAt(0) % colors.length
    return colors[index]
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Inter', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .chat-root {
          display: flex;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        /* SIDEBAR */
        .sidebar {
          width: 360px;
          min-width: 300px;
          display: flex;
          flex-direction: column;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          margin-right: 20px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .sidebar-header {
          padding: 16px 20px;
          background: rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .sidebar-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .current-user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
          color: white;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(5px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          flex-shrink: 0;
        }

        .current-user-email {
          font-size: 13px;
          color: white;
          font-weight: 500;
          max-width: 180px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .logout-btn {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .logout-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          transform: scale(1.05);
        }

        .sidebar-title {
          padding: 20px 20px 12px;
          font-size: 19px;
          font-weight: 600;
          color: white;
          letter-spacing: -0.3px;
        }

        .search-bar {
          padding: 8px 12px;
        }

        .search-bar input {
          width: 100%;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          outline: none;
          border-radius: 8px;
          padding: 9px 14px 9px 36px;
          font-size: 14px;
          color: white;
          backdrop-filter: blur(5px);
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.7)' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: 10px center;
        }

        .search-bar input::placeholder { color: rgba(255, 255, 255, 0.5); }

        .users-list {
          flex: 1;
          overflow-y: auto;
        }

        .users-list::-webkit-scrollbar { width: 6px; }
        .users-list::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); }
        .users-list::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.3); border-radius: 3px; }

        .user-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          cursor: pointer;
          transition: all 0.2s;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .user-item:hover { background: rgba(255, 255, 255, 0.1); }
        .user-item.active { background: rgba(255, 255, 255, 0.15); }

        .user-avatar {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 16px;
          color: white;
          flex-shrink: 0;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .user-info { flex: 1; min-width: 0; }

        .user-email {
          font-size: 15px;
          color: white;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-subtext {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.6);
          margin-top: 2px;
        }

        /* MAIN CHAT */
        .chat-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          overflow: hidden;
        }

        /* Empty state */
        .empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          color: white;
        }

        .empty-state-icon {
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .empty-state h2 {
          font-size: 22px;
          color: white;
          font-weight: 500;
          letter-spacing: -0.3px;
        }

        .empty-state p {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
        }

        /* Chat header */
        .chat-header {
          padding: 16px 20px;
          background: rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          flex-shrink: 0;
        }

        .chat-header-info h3 {
          font-size: 16px;
          color: white;
          font-weight: 600;
        }

        .chat-header-info span {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.6);
        }

        /* Messages area */
        .messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 20px 10%;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .messages-area::-webkit-scrollbar { width: 6px; }
        .messages-area::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); }
        .messages-area::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.3); border-radius: 3px; }

        .message-bubble {
          max-width: 65%;
          padding: 8px 12px 8px;
          border-radius: 12px;
          font-size: 14.5px;
          line-height: 1.45;
          position: relative;
          word-break: break-word;
          animation: msgIn 0.15s ease-out;
        }

        @keyframes msgIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .message-bubble.sent {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          align-self: flex-end;
          border-bottom-right-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .message-bubble.received {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          align-self: flex-start;
          border-bottom-left-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .message-time {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.6);
          float: right;
          margin-left: 10px;
          margin-top: 4px;
          line-height: 1;
        }

        .message-date-divider {
          align-self: center;
          background: rgba(0, 0, 0, 0.3);
          color: rgba(255, 255, 255, 0.7);
          font-size: 12px;
          padding: 5px 14px;
          border-radius: 8px;
          margin: 8px 0;
          font-weight: 500;
        }

        /* Input area */
        .input-area {
          padding: 16px 20px;
          background: rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .input-area input {
          flex: 1;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          outline: none;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 15px;
          color: white;
          font-family: 'Inter', sans-serif;
          backdrop-filter: blur(5px);
        }

        .input-area input::placeholder { color: rgba(255, 255, 255, 0.5); }

        .send-btn {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          flex-shrink: 0;
          color: white;
        }

        .send-btn:hover { 
          transform: scale(1.05);
          background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
        }
        .send-btn:active { transform: scale(0.95); }
        .send-btn:disabled { 
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .loading-dots {
          display: flex;
          gap: 4px;
          align-self: center;
          padding: 8px 0;
        }

        .loading-dots span {
          width: 8px; height: 8px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          animation: bounce 1.2s infinite;
        }

        .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .loading-dots span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
        }

        @media (max-width: 768px) {
          .chat-root { padding: 10px; }
          .sidebar { width: 100%; min-width: unset; margin-right: 0; display: ${selectedUser ? "none" : "flex"}; }
          .chat-main { display: ${selectedUser ? "flex" : "none"}; }
          .messages-area { padding: 16px 4%; }
        }
      `}</style>

      <div className="chat-root">

        {/* SIDEBAR */}
        <div className="sidebar">
          <div className="sidebar-header">
            <div className="sidebar-header-left">
              <div
                className="current-user-avatar"
                style={{ background: currentUser ? getAvatarColor(currentUser.email) : "rgba(255,255,255,0.2)" }}
              >
                {currentUser ? getInitials(currentUser.email) : "?"}
              </div>
              <span className="current-user-email">{currentUser?.email}</span>
            </div>
            <button
              className="logout-btn"
              title="Logout"
              onClick={async () => {
                await supabase.auth.signOut()
                router.push("/login")
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>

          <div className="sidebar-title">Chats</div>

          <div className="search-bar">
            <input placeholder="Search or start new chat" />
          </div>

          <div className="users-list">
            {users.length === 0 && (
              <div style={{ padding: "24px 20px", color: "rgba(255,255,255,0.6)", fontSize: 14, textAlign: "center" }}>
                No other users yet
              </div>
            )}
            {users.map((user) => (
              <div
                key={user.id}
                className={`user-item ${selectedUser?.id === user.id ? "active" : ""}`}
                onClick={() => setSelectedUser(user)}
              >
                <div
                  className="user-avatar"
                  style={{ background: getAvatarColor(user.email) }}
                >
                  {getInitials(user.email)}
                </div>
                <div className="user-info">
                  <div className="user-email">{user.email}</div>
                  <div className="user-subtext">Tap to chat</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MAIN CHAT PANEL */}
        <div className="chat-main">
          {!selectedUser ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <h2>Select a conversation</h2>
              <p>Choose someone from the list to start messaging</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <div
                  className="user-avatar"
                  style={{ background: getAvatarColor(selectedUser.email), width: 40, height: 40, fontSize: 14 }}
                >
                  {getInitials(selectedUser.email)}
                </div>
                <div className="chat-header-info">
                  <h3>{selectedUser.email}</h3>
                  <span>online</span>
                </div>
              </div>

              {/* Messages */}
              <div className="messages-area">
                {loadingMessages ? (
                  <div className="loading-dots">
                    <span/><span/><span/>
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ alignSelf: "center", color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 20 }}>
                    No messages yet. Say hello! 👋
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`message-bubble ${msg.sender_id === currentUser?.id ? "sent" : "received"}`}
                    >
                      {msg.content}
                      <span className="message-time">{formatTime(msg.created_at)}</span>
                    </div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="input-area">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message"
                />
                <button
                  className="send-btn"
                  onClick={sendMessage}
                  disabled={!input.trim()}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </>
  )
}