import type React from "react";
import { cn } from "@/lib/utils";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-10 gap-4 max-w-7xl mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "row-span-1 rounded-xl group/bento transition duration-200 bg-zinc-950 border border-zinc-800 justify-between flex flex-col space-y-4 p-6 h-full",
        className
      )}
    >
      {header && <div className="mb-2">{header}</div>}
      <div>
        {icon && <div className="mb-2">{icon}</div>}
        <div className="font-medium text-lg text-white mb-2">{title}</div>
        <div className="font-normal text-zinc-400 text-sm">{description}</div>
      </div>
    </div>
  );
};
