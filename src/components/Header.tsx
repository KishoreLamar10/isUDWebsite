'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { FolderKanban, BookOpen, UserCircle, Home, LogOut, User } from 'lucide-react';
import InvitationBanner from './InvitationBanner';

const navItems = [
  { label: 'My Projects', href: '/', icon: FolderKanban },
  { label: 'User Guide', href: '/guide', icon: BookOpen },
  { label: 'Account', href: '/account/profile', icon: UserCircle, isAccount: true },
  { label: 'Home', href: '/', icon: Home },
];

export default function Header() {
  const { data: session } = useSession();

  return (
    <>
      <InvitationBanner />
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Section */}
          <div className="flex items-center space-x-2">
            <div className="flex flex-col">
              <span className="text-3xl font-bold tracking-tighter text-primary leading-none flex items-center">
                isUD
                <span className="ml-1 text-[#F7941D] text-2xl">›</span>
              </span>
              <span className="text-[10px] text-muted uppercase tracking-wider font-medium">
                Innovative solutions for Universal Design
              </span>
            </div>
          </div>

          {/* Navigation Section */}
          <nav className="flex items-center space-x-8">
            {navItems.map((item) => (
              item.isAccount ? (
                <div key={item.label} className="relative group py-4">
                  <Link
                    href={session ? '/account/profile' : '/register'}
                    className="flex flex-col items-center space-y-1 text-slate-600 group-hover:text-primary transition-colors duration-200"
                  >
                    <item.icon size={22} className="group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-[11px] font-semibold uppercase tracking-tight">
                      {item.label}
                    </span>
                  </Link>

                  {/* Dropdown Menu - Appears on Hover if logged in */}
                  {session && (
                    <div className="absolute top-full right-0 mt-0 w-48 bg-white border border-slate-100 shadow-xl rounded-md py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100 z-50">
                      <Link
                        href="/account/profile"
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors"
                      >
                        <User size={16} />
                        <span className="font-medium">User Profile</span>
                      </Link>
                      <button
                        onClick={() => signOut({ callbackUrl: '/register' })}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={16} />
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group flex flex-col items-center space-y-1 text-slate-600 hover:text-primary transition-colors duration-200"
                >
                  <item.icon size={22} className="group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-[11px] font-semibold uppercase tracking-tight">
                    {item.label}
                  </span>
                </Link>
              )
            ))}
          </nav>
        </div>
      </div>
    </header>
    </>
  );
}
