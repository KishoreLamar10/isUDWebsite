'use client';

import Link from 'next/link';

export default function MarketingHeader() {
  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: 'Process', href: '/process' },
    { label: 'Resources', href: '/resources' },
    { label: 'About', href: '/about' },
    { label: 'Account', href: '/register' },
  ];

  return (
    <header className="w-full bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/" className="flex flex-col">
              <span className="text-4xl font-bold tracking-tighter text-primary leading-none flex items-center">
                isUD
                <span className="ml-1 text-secondary text-3xl">›</span>
              </span>
              <span className="text-[11px] text-muted uppercase tracking-widest font-medium mt-1">
                Innovative solutions for Universal Design
              </span>
            </Link>
          </div>

          {/* Navigation Section */}
          <nav className="hidden md:flex items-center space-x-10">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-[15px] font-semibold text-primary hover:text-secondary transition-colors duration-200"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
