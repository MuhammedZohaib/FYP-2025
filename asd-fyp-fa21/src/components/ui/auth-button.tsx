import React from "react";
import { Button } from "./button";
import { FaSpinner } from "react-icons/fa";
type Props = React.PropsWithChildren<{
  isLoading?: boolean;
}>;

export default function AuthButton({ isLoading, children }: Props) {
  return (
    <>
      <Button
        disabled={isLoading}
        type="submit"
        className="bg-[#3476EF] hover:bg-[#3476EF]/90 py-6"
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
