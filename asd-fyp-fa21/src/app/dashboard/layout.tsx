import type React from "react";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-background">
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <div className="flex h-16 items-center border-b px-4">
              <SidebarTrigger className="mr-4" />
              <h1 className="text-lg font-semibold">Dashboard</h1>
            </div>
            <main className="flex-1">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
