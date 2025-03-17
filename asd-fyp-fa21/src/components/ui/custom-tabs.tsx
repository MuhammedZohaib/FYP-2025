"use client";

import type React from "react";
import { createContext, useContext, useState } from "react";
import { cn } from "@/lib/utils";

type TabsContextValue = {
  activeTab: string;
  setActiveTab: (id: string) => void;
};

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

function useTabs() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within a TabsProvider");
  }
  return context;
}

interface TabsProps {
  defaultTab: string;
  children: React.ReactNode;
  className?: string;
  onChange?: (id: string) => void;
}

export function Tabs({ defaultTab, children, className, onChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    onChange?.(id);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabsNavProps {
  children: React.ReactNode;
  className?: string;
}

export function TabsNav({ children, className }: TabsNavProps) {
  return (
    <div
      className={cn(
        "flex bg-[#1a1a1a] border-b border-gray-800 w-full",
        className
      )}
    >
      {children}
    </div>
  );
}

interface TabTriggerProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function TabTrigger({ id, children, className }: TabTriggerProps) {
  const { activeTab, setActiveTab } = useTabs();
  const isActive = activeTab === id;

  return (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={cn(
        "px-6 py-3 text-sm font-medium transition-colors focus:outline-none",
        isActive
          ? "bg-[#0f0f0f] border-b-2 border-blue-500 text-white"
          : "text-gray-400 hover:text-gray-300",
        className
      )}
    >
      {children}
    </button>
  );
}

interface TabContentProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function TabContent({ id, children, className }: TabContentProps) {
  const { activeTab } = useTabs();

  if (activeTab !== id) return null;

  return <div className={cn("mt-6", className)}>{children}</div>;
}
