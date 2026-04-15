import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-[#003366] text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0 text-sm font-medium tracking-wide">
          
          {/* Brand/University Section */}
          <div className="flex flex-col items-center md:items-start space-y-1">
            <span className="text-xs uppercase opacity-70">University at Buffalo</span>
            <span className="text-base font-bold leading-none tracking-tight">
              Center for Inclusive Design and Environmental Access
            </span>
            <span className="text-[10px] uppercase opacity-70 tracking-widest">
              School of Architecture and Planning
            </span>
          </div>

          {/* Copyright Section */}
          <div className="text-xs opacity-60">
            © 2026 All rights reserved
          </div>

          {/* Legal Links Section */}
          <div className="flex gap-x-8 uppercase text-[11px] tracking-widest">
            <Link href="/accessibility" className="hover:text-secondary transition-colors duration-200">
              Accessibility
            </Link>
            <Link href="/terms" className="hover:text-secondary transition-colors duration-200">
              Terms of Use
            </Link>
            <Link href="/privacy" className="hover:text-secondary transition-colors duration-200">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
