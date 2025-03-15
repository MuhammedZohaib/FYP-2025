export default function FooterAuth() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-3 px-6 flex justify-between items-center text-xs text-gray-400 absolute bottom-0 left-0">
      <div>&copy; {currentYear} EEG Prediction. All rights reserved.</div>
      <div className="flex gap-4">
        <a href="#" className="hover:text-white transition-colors">
          Terms of Service
        </a>
        <a href="#" className="hover:text-white transition-colors">
          Privacy Policy
        </a>
      </div>
    </footer>
  );
}
