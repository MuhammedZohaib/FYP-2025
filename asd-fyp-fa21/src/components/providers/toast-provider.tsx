"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      theme="dark"
      closeButton
      richColors
      expand={false}
      duration={4000}
    />
  );
}
