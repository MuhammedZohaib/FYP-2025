"use client";
import { Inter } from "next/font/google";
import type React from "react";

import { usePathname } from "next/navigation";
import NavbarAuth from "@/components/ui/navauth";
import FooterAuth from "@/components/ui/footer-auth";
import { BackgroundLines } from "@/components/ui/background-lines";
import { AnimatedTestimonialsDemo } from "@/components/testimonialDemo";
import { useEffect, useState } from "react";

const inter = Inter({
  subsets: ["latin"],
});

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isSignup = pathname === "/signup";
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <main className="w-full min-h-[100vh] grid place-items-center relative">
      <BackgroundLines className="bg-black flex items-center justify-center w-full flex-col px-4">
        <div className="absolute inset-0" style={{ opacity: 0.95 }} />
        <NavbarAuth />
        <div className="w-full max-w-[1200px] relative z-10 flex items-stretch my-16">
          {/* Left panel - Form */}
          <div
            className={`max-w-xl w-full grid bg-[#0f0f0f] rounded-[20px] md:rounded-l-[20px] md:rounded-r-none p-8 text-slate-50 ${
              inter.className
            } ${isSignup ? "min-h-[650px]" : "min-h-[570px]"}`}
          >
            {children}
          </div>

          {/* Right panel - Testimonials (hidden on mobile) */}
          <div
            className={`hidden md:block bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg w-full relative px-4 rounded-r-[20px] ${
              isSignup ? "min-h-[650px]" : "min-h-[570px]"
            }`}
          >
            {isMounted && <AnimatedTestimonialsDemo />}
          </div>
        </div>
        <FooterAuth />
      </BackgroundLines>
    </main>
  );
}
