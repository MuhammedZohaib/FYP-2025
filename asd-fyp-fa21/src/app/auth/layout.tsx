export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="w-full h-[100vh] grid place-items-center">
      <div className="max-w-7xl w-full h-full outline-1 outline-slate-700 outline solid bg-slate-700 flex items-center">
        <div className="max-w-xl w-full grid bg-[#0f0f0f] rounded-[20px] p-8">
          {children}
        </div>
        <div></div>
      </div>
    </main>
  );
}
