import { Inter } from "next/font/google";
import { AnimatedTestimonialsDemo } from "./testimonialDemo";

const inter = Inter();

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="w-full h-[100vh] grid place-items-center">
      <div className="w-full max-w-[1200px] h-full flex items-center">
        <div
          className={`max-w-xl w-full grid bg-[#0f0f0f] rounded-l-[20px] p-8 text-slate-50 ${inter.className}`}
        >
          {children}
        </div>
        <div className="bg-[#F5F5F5] w-full h-full relative px-4 h-[570px] rounded-r-[20px]">
          <AnimatedTestimonialsDemo />
        </div>
      </div>
    </main>
  );
}
