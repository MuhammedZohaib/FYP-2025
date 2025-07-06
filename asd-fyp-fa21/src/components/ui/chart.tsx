"use client";

import type * as React from "react";
import { ResponsiveContainer, Tooltip, type TooltipProps } from "recharts";
import { cn } from "@/lib/utils";

interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig;
  children: React.ReactElement; // Updated type here
}

export function ChartContainer({
  config,
  children,
  className,
  ...props
}: ChartContainerProps) {
  // Create CSS variables for each color in the config
  const style = Object.entries(config).reduce((acc, [key, value]) => {
    acc[`--color-${key}`] = value.color;
    return acc;
  }, {} as Record<string, string>);

  return (
    <div className={cn("w-full h-full", className)} style={style} {...props}>
      <ResponsiveContainer width="100%" height="100%" minWidth={200}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

type ContentType = TooltipProps<any, any>["content"];

interface ChartTooltipProps extends Omit<TooltipProps<any, any>, "content"> {
  content?: ContentType;
  indicator?: "line" | "circle";
  hideLabel?: boolean;
}

export function ChartTooltip({
  content = <ChartTooltipContent />,
  indicator = "circle",
  hideLabel = false,
  ...props
}: ChartTooltipProps) {
  return <Tooltip content={content} {...props} />;
}

interface ChartTooltipContentProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: {
      [key: string]: any;
    };
    dataKey: string;
    color: string;
  }>;
  label?: string;
  indicator?: "line" | "circle";
  hideLabel?: boolean;
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  indicator = "circle",
  hideLabel = false,
}: ChartTooltipContentProps): React.ReactElement | undefined {
  if (!active || !payload?.length) {
    return undefined;
  }

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      {!hideLabel && label && <div className="mb-2 font-medium">{label}</div>}
      <div className="flex flex-col gap-1">
        {payload.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            {indicator === "circle" ? (
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
            ) : (
              <div
                className="h-2 w-4"
                style={{ backgroundColor: item.color }}
              />
            )}
            <span className="text-sm text-muted-foreground">{item.name}:</span>
            <span className="font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
