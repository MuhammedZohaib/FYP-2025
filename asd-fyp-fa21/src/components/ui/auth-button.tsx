import React from "react";
import { Button } from "./button";
import { FaSpinner } from "react-icons/fa";
type Props = React.PropsWithChildren<{
  isLoading?: boolean;
  className?: string;
}>;

export default function AuthButton({ isLoading, children, className }: Props) {
  return (
    <>
      <Button
        disabled={isLoading}
        type="submit"
        className={`bg-[#3476EF] hover:bg-[#3476EF]/90 py-6 ${className ?? ""}`}
      >
        {isLoading ? (
          <>
            <FaSpinner className="animate-spin" />
          </>
        ) : (
          children
        )}
      </Button>
    </>
  );
}
