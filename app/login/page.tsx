"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    router.push("/chat")
    setLoading(false)
  }

  const handleLogout = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      alert(error.message)
    } else {
      router.push("/login")
    }
    setLoading(false)
  }

  const goToPage = (path: string) => {
    router.push(path)
  }

  const buttonStyle = {
    padding: "10px 20px",
    fontSize: "16px",
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    fontWeight: "500",
    color: "white",
    border: "2px solid white",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "transform 0.2s, opacity 0.2s",
  }

  return (
    <div style={{ 
      padding: 40,
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    }}>
      <div style={{
        maxWidth: "400px",
        margin: "0 auto",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(10px)",
        padding: "40px",
        borderRadius: "20px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)"
      }}>
        <h1 style={{ 
          color: "white", 
          marginBottom: "30px",
          textAlign: "center",
          fontSize: "32px",
          fontWeight: "bold"
        }}>
          Login
        </h1>

        <input
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          style={{ 
            padding: "12px 16px", 
            fontSize: "16px",
            width: "100%",
            boxSizing: "border-box",
            borderRadius: "8px",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            marginBottom: "16px",
            color:"black",
            WebkitTextFillColor: "black"
          }}
        />
        
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          style={{ 
            padding: "12px 16px", 
            fontSize: "16px",
            width: "100%",
            boxSizing: "border-box",
            borderRadius: "8px",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            marginBottom: "24px",
            WebkitTextFillColor: "black"
          }}
        />
        
        <button 
          onClick={handleLogin} 
          disabled={loading}
          style={{
            ...buttonStyle,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            width: "100%",
            marginBottom: "16px"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)"
            e.currentTarget.style.opacity = "0.9"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)"
            e.currentTarget.style.opacity = "1"
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div style={{ 
          marginTop: "30px", 
          display: "flex", 
          gap: "12px",
          justifyContent: "center"
        }}>
          

          
        </div>
      </div>
    </div>
  )
}