"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function Reset() {
  
  const router = useRouter()

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("http://localhost:8000/api/doctor/reset-password/request", {
      method: "POST",
      body: JSON.stringify({ email }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      toast("Reset code sent to your email.");
      setStep(2);
    } else {
      toast.error("Doctor with that email does not exist");
    }
    setLoading(false);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("http://localhost:8000/api/doctor/reset-password/confirm", {
      method: "POST",
      body: JSON.stringify({ email, code }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      toast("Code verified successfully.");
      setStep(3);
    } else {
      toast.error("Invalid code.");
    }
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("http://localhost:8000/api/doctor/reset-password/new", {
      method: "POST",
      body: JSON.stringify({ email, password: newPassword }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      toast("Password reset successfully.");
      setStep(1);
      setEmail("");
      setCode("");
      setNewPassword("");
      router.push("/auth/login")
    } else {
      toast.error("Failed to reset password.");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col justify-between">
      {step === 1 && (
        <form onSubmit={handleSendResetCode} className="space-y-4 mt-10">
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
            {loading ? "Sending..." : "Send Reset Code"}
          </Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyCode} className="space-y-4 mt-10">
          <div className="space-y-2">
            <Label htmlFor="code">Enter Verification Code</Label>
            <Input
              id="code"
              type="text"
              placeholder="6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Verifying..." : "Verify Code"}
          </Button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleResetPassword} className="space-y-4 mt-10">
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              minLength={8}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      )}

      <Link href="/auth/login" className="block mt-8">
        <Button type="button" className="py-6 w-full" variant="outline">
          Back to Login
        </Button>
      </Link>
    </div>
  );
}
