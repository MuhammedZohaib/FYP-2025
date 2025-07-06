import type React from "react";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

const inter = Inter();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex h-[5.3rem] items-center border-b px-4">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>
          <main className="flex-1 overflow-x-hidden">{children}</main>
        </SidebarInset>
      </SidebarProvider>
      <Toaster />
    </>
  );
}
