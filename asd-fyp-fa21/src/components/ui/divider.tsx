export default function Divider() {
  return (
    <div className="py-6 grid place-items-center relative">
      <p className="absolute text-sm text-gray-400 px-3 bg-[#0f0f0f]">OR</p>
      <span className="w-full block h-[1px] bg-slate-50"></span>
    </div>
  );
}
