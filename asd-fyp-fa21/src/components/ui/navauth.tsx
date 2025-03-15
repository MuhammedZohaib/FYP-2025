"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function NavbarAuth() {
  const pathname = usePathname();

  return (
    <nav className="w-full py-4 px-6 flex justify-between items-center bg-transparent absolute top-0 left-0 z-10">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
          <Image src="/file.svg" width={50} height={50} alt={""}></Image>
        </div>
      </Link>

      <div className="flex gap-4">
        <Link
          href="/home"
          className={`text-sm font-medium ${
            pathname === "/login"
              ? "text-white"
              : "text-gray-300 hover:text-white"
          } transition-colors`}
        >
          Home
        </Link>
      </div>
    </nav>
  );
}
