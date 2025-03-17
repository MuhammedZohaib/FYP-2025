"use client";

import type * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "p-4 bg-[#0f0f0f] rounded-lg border border-gray-800 shadow-lg",
        className
      )}
      classNames={{
        months: "flex flex-col space-y-4",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center px-8",
        caption_label: "text-white font-medium text-base",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-8 w-8 bg-[#1a1a1a] border border-gray-800 rounded-md p-0 hover:bg-[#252525] text-gray-400"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head_row: "flex w-full",
        head_cell:
          "text-gray-400 w-10 h-10 flex items-center justify-center rounded-md font-medium text-sm",
        row: "flex w-full mt-1",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day: cn(
          "h-10 w-10 p-0 font-normal text-sm flex items-center justify-center rounded-md mx-[2px] aria-selected:opacity-100",
          "bg-[#1a1a1a] text-gray-300 hover:bg-[#252525]"
        ),
        day_range_start: "day-range-start",
        day_range_end: "day-range-end",
        day_selected: "bg-white text-black hover:bg-white hover:text-black",
        day_today: "bg-[#1a1a1a] text-white border border-gray-700",
        day_outside: "text-gray-600 opacity-50",
        day_disabled: "text-gray-600 opacity-30",
        day_range_middle: "aria-selected:bg-[#1a1a1a] text-black",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-5 w-5", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-5 w-5", className)} {...props} />
        ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
