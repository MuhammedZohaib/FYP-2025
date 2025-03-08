import { Inter } from "next/font/google";

const inter = Inter();

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="w-full h-[100vh] grid place-items-center">
      <div className="w-full max-w-[1200px] h-full flex gap-24 items-center">
        <div
          className={`max-w-xl w-full grid bg-[#0f0f0f] rounded-[20px] p-8 text-slate-50 ${inter.className}`}
        >
          {children}
        </div>
        <div className="h-[500px] bg-gradient-to-b from-[#2C2C2C] to-[#222222] w-full h-full relative px-4 max-h-[700px] rounded-[20px]">
                <div className="bg-grid w-full h-full"></div>
                </div>
      </div>
    </main>
  );
}
