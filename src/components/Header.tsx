'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { FolderKanban, BookOpen, UserCircle, Home, LogOut, User, ShieldCheck, Users, ClipboardCheck } from 'lucide-react';

const navItems = [
  { label: 'My Projects', href: '/', icon: FolderKanban },
  { label: 'User Guide', href: '/guide', icon: BookOpen },
  { label: 'Account', href: '/account/profile', icon: UserCircle, isAccount: true },
  { label: 'Home', href: '/', icon: Home },
];

export default function Header() {
  const { data: session } = useSession();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const isAdmin = (session?.user as any)?.role === 'ADMIN';
  const closeAccountMenu = () => setIsAccountMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 py-3 sm:h-20 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-0">
          <div className="flex items-center justify-center space-x-2 sm:justify-start">
            <div className="flex flex-col">
              <span className="flex items-center text-3xl font-bold leading-none tracking-tighter text-primary">
                isUD
                <span className="ml-1 text-2xl text-[#F7941D]">&gt;</span>
              </span>
              <span className="hidden text-[10px] font-medium uppercase tracking-wider text-muted min-[460px]:block">
                Innovative solutions for Universal Design
              </span>
            </div>
          </div>

          <nav className="grid w-full grid-cols-4 items-start gap-1 sm:w-auto sm:flex sm:items-center sm:gap-0 sm:space-x-8">
            {navItems.map((item) => (
              item.isAccount ? (
                <div
                  key={item.label}
                  className="relative py-1 sm:py-4"
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) closeAccountMenu();
                  }}
                >
                  {session ? (
                    <button
                      type="button"
                      className="flex flex-col items-center space-y-1 text-slate-600 transition-colors duration-200 hover:text-primary"
                      aria-haspopup="menu"
                      aria-expanded={isAccountMenuOpen}
                      onClick={() => setIsAccountMenuOpen((open) => !open)}
                      onKeyDown={(event) => {
                        if (event.key === 'Escape') closeAccountMenu();
                      }}
                    >
                      <item.icon size={22} className="transition-transform duration-200" aria-hidden="true" />
                      <span className="text-center text-[10px] font-semibold uppercase leading-tight tracking-tight sm:text-[11px]">
                        {item.label}
                      </span>
                    </button>
                  ) : (
                    <Link
                      href="/register"
                      className="flex flex-col items-center space-y-1 text-slate-600 transition-colors duration-200 hover:text-primary"
                    >
                      <item.icon size={22} className="transition-transform duration-200" aria-hidden="true" />
                      <span className="text-center text-[10px] font-semibold uppercase leading-tight tracking-tight sm:text-[11px]">
                        {item.label}
                      </span>
                    </Link>
                  )}

                  {session && (
                    <div
                      role="menu"
                      className={`absolute right-0 top-full z-50 mt-0 w-48 origin-top-right rounded-md border border-slate-100 bg-white py-2 shadow-xl transition-all duration-200 ${
                        isAccountMenuOpen ? 'visible scale-100 opacity-100' : 'invisible scale-95 opacity-0'
                      }`}
                    >
                      <Link
                        href="/account/profile"
                        role="menuitem"
                        onClick={closeAccountMenu}
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-primary"
                      >
                        <User size={16} aria-hidden="true" />
                        <span className="font-medium">User Profile</span>
                      </Link>
                      {isAdmin && (
                        <>
                          <Link
                            href="/admin/edit-solutions"
                            role="menuitem"
                            onClick={closeAccountMenu}
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-primary"
                          >
                            <ShieldCheck size={16} aria-hidden="true" />
                            <span className="font-medium">Admin Dashboard</span>
                          </Link>
                          <Link
                            href="/admin/project-approvals"
                            role="menuitem"
                            onClick={closeAccountMenu}
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-primary"
                          >
                            <ClipboardCheck size={16} aria-hidden="true" />
                            <span className="font-medium">Project Approvals</span>
                          </Link>
                          <Link
                            href="/admin/users"
                            role="menuitem"
                            onClick={closeAccountMenu}
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-primary"
                          >
                            <Users size={16} aria-hidden="true" />
                            <span className="font-medium">Admin Users</span>
                          </Link>
                        </>
                      )}
                      <button
                        role="menuitem"
                        onClick={() => signOut({ callbackUrl: '/register' })}
                        className="flex w-full items-center space-x-3 px-4 py-3 text-sm text-red-600 transition-colors hover:bg-red-50"
                      >
                        <LogOut size={16} aria-hidden="true" />
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group flex flex-col items-center space-y-1 py-1 text-slate-600 transition-colors duration-200 hover:text-primary sm:py-0"
                >
                  <item.icon size={22} className="transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
                  <span className="text-center text-[10px] font-semibold uppercase leading-tight tracking-tight sm:text-[11px]">
                    {item.label}
                  </span>
                </Link>
              )
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
