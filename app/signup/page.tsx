"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async () => {
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    // If email confirmation is disabled, session is available immediately
    if (data.session) {
      router.push("/chat")
    } else {
      // Email confirmation is ON — tell the user to check their inbox
      alert("Check your email to confirm your account, then log in.")
      router.push("/login")
    }

    setLoading(false)
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Signup</h1>

      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <br /><br />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <br /><br />
      <button onClick={handleSignup} disabled={loading}>
        {loading ? "Creating account..." : "Signup"}
      </button>
    </div>
  )
}