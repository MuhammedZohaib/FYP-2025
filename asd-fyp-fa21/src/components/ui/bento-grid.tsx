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
        "row-span-1 rounded-xl group/bento hover:bg-zinc-900/50 transition duration-200 bg-zinc-950 border border-zinc-800/50 flex flex-col space-y-4",
        className
      )}
    >
      <div className="p-4 md:p-6 flex flex-col flex-1 gap-4">
        {header}
        <div className="flex-1 flex flex-col justify-end gap-2">
          {icon && <div className="text-zinc-400">{icon}</div>}
          {title && (
            <h3 className="font-semibold tracking-tight text-xl text-zinc-100">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-zinc-400 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
