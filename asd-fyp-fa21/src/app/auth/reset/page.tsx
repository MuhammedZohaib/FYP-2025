"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function Reset() {

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/request-password-reset', {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: { 'Content-Type': 'application/json' },
    })

    if (res.ok) {
      toast( 'Check your inbox for the reset link.')
      setEmail('')
    } else {
      toast('Failed to send reset link.')
    }

    setLoading(false)
  }

  return (
    <div className="flex flex-col justify-between">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 mt-10"
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>
      <Link href="/auth/login" className="block">
        <Button type="button" className="py-6 w-full">
          Back to Login
        </Button>
      </Link>
    </div>
  );
}
