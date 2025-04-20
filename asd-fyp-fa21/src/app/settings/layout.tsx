"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, UserCog, Shield, Bell, Key } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const navigationItems = [
    {
      title: "General",
      href: "/settings/general",
      icon: <UserCog className="h-5 w-5" />,
    },
    {
      title: "Security",
      href: "/settings/security",
      icon: <Shield className="h-5 w-5" />,
    },
    {
      title: "Notifications",
      href: "/settings/notifications",
      icon: <Bell className="h-5 w-5" />,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center mb-8 gap-2 border-b pb-4">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
          <nav className="flex flex-col space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>
        </aside>
        <main className="md:col-span-3 bg-background rounded-lg border p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
