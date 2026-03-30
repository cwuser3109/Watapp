"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }

    getUser()
  }, [])

  const logout = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    setUser(null)
    setLoading(false)
    router.push("/login")
  }

  const buttonStyle = {
    padding: "10px 20px",
    fontSize: "16px",
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    fontWeight: "500",
    color: "white",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "transform 0.2s, opacity 0.2s",
    marginRight: "12px",
  }

  const linkStyle = {
    display: "inline-block",
    padding: "10px 20px",
    fontSize: "16px",
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    fontWeight: "500",
    color: "#667eea",
    backgroundColor: "white",
    textDecoration: "none",
    borderRadius: "8px",
    marginRight: "12px",
    transition: "transform 0.2s, opacity 0.2s",
  }

  return (
    <div style={{ 
      padding: 40,
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    }}>
      <div style={{
        maxWidth: "500px",
        margin: "0 auto",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(10px)",
        padding: "40px",
        borderRadius: "20px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        textAlign: "center"
      }}>
        <h1 style={{ 
          color: "white", 
          marginBottom: "30px",
          fontSize: "32px",
          fontWeight: "bold",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
        }}>
          Watapp
        </h1>

        {user ? (
          <div>
            <p style={{ 
              color: "white", 
              marginBottom: "20px",
              fontSize: "16px",
              fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
            }}>
              Logged in as: <strong>{user.email}</strong>
            </p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <button 
                onClick={logout} 
                disabled={loading}
                style={{
                  ...buttonStyle,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "not-allowed" : "pointer"
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = "translateY(-2px)"
                    e.currentTarget.style.opacity = "0.9"
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)"
                  e.currentTarget.style.opacity = "1"
                }}
              >
                {loading ? "Logging out..." : "Logout"}
              </button>

              <Link 
                href="/chat"
                style={linkStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)"
                  e.currentTarget.style.opacity = "0.9"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)"
                  e.currentTarget.style.opacity = "1"
                }}
              >
                Go to Chat
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <p style={{ 
              color: "white", 
              marginBottom: "20px",
              fontSize: "16px",
              fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
            }}>
              You are not logged in
            </p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link 
                href="/login"
                style={linkStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)"
                  e.currentTarget.style.opacity = "0.9"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)"
                  e.currentTarget.style.opacity = "1"
                }}
              >
                Login
              </Link>

              <Link 
                href="/signup"
                style={linkStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)"
                  e.currentTarget.style.opacity = "0.9"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)"
                  e.currentTarget.style.opacity = "1"
                }}
              >
                Signup
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}