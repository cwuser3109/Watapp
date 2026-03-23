"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"

export default function Home() {

  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }

    getUser()
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <main style={{padding:40}}>

      <h1>Messaging App</h1>

      {user ? (
        <div>
          <p>Logged in as: {user.email}</p>

          <button onClick={logout}>
            Logout
          </button>

          <br /><br />

          <Link href="/chat">
            Go to Chat
          </Link>

        </div>
      ) : (

        <div>
          <p>You are not logged in</p>

          <Link href="/login">
            Login
          </Link>

          <br /><br />

          <Link href="/signup">
            Signup
          </Link>
        </div>

      )}

    </main>
  )
}