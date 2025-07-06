"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { FaRobot } from "react-icons/fa";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Features", href: "#features" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
        isScrolled
          ? "bg-black/80 backdrop-blur-md border-b border-zinc-800/50 py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center rounded bg-blue-600">
            <Image src="/file.svg" width={50} height={50} alt={""}></Image>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
            >
              {item.name}
            </Link>
          ))}
          <Link
            href="/asd-assistant"
            className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
          >
            <FaRobot className="w-4 h-4" />
            ASD Assistant
          </Link>
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link href={"/auth/login"} className="text-white hover:text-blue-400">
            Login
          </Link>
          <Link href={"/auth/signup"} className="w-full sm:w-auto">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Create an Account
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "fixed inset-0 top-[60px] bg-black/95 backdrop-blur-md z-40 transition-transform duration-300 ease-in-out md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col p-6 space-y-6">
          <nav className="flex flex-col space-y-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-lg font-medium text-zinc-300 hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/asd-assistant"
              className="text-lg font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FaRobot className="w-4 h-4" />
              ASD Assistant
            </Link>
          </nav>
          <div className="flex flex-col space-y-4 pt-6 border-t border-zinc-800">
            <Link href="/auth/login">
              <Button
                variant="ghost"
                className="text-white hover:text-blue-400 justify-start w-full"
              >
                Login
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-blue-600 hover:bg-blue-700 w-full">
                Create an Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
