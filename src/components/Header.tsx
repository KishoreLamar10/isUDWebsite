'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { FolderKanban, BookOpen, UserCircle, Home, LogOut, User, ShieldCheck, Users } from 'lucide-react';

const navItems = [
  { label: 'My Projects', href: '/', icon: FolderKanban },
  { label: 'User Guide', href: '/guide', icon: BookOpen },
  { label: 'Account', href: '/account/profile', icon: UserCircle, isAccount: true },
  { label: 'Home', href: '/', icon: Home },
];

export default function Header() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'ADMIN';

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
                <div key={item.label} className="group relative py-1 sm:py-4">
                  <Link
                    href={session ? '/account/profile' : '/register'}
                    className="flex flex-col items-center space-y-1 text-slate-600 transition-colors duration-200 group-hover:text-primary"
                  >
                    <item.icon size={22} className="transition-transform duration-200 group-hover:scale-110" />
                    <span className="text-center text-[10px] font-semibold uppercase leading-tight tracking-tight sm:text-[11px]">
                      {item.label}
                    </span>
                  </Link>

                  {session && (
                    <div className="invisible absolute right-0 top-full z-50 mt-0 w-48 origin-top-right scale-95 rounded-md border border-slate-100 bg-white py-2 opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:scale-100 group-hover:opacity-100">
                      <Link
                        href="/account/profile"
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-primary"
                      >
                        <User size={16} />
                        <span className="font-medium">User Profile</span>
                      </Link>
                      {isAdmin && (
                        <>
                          <Link
                            href="/admin/edit-solutions"
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-primary"
                          >
                            <ShieldCheck size={16} />
                            <span className="font-medium">Admin Dashboard</span>
                          </Link>
                          <Link
                            href="/admin/users"
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-primary"
                          >
                            <Users size={16} />
                            <span className="font-medium">Admin Users</span>
                          </Link>
                        </>
                      )}
                      <button
                        onClick={() => signOut({ callbackUrl: '/register' })}
                        className="flex w-full items-center space-x-3 px-4 py-3 text-sm text-red-600 transition-colors hover:bg-red-50"
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
                  className="group flex flex-col items-center space-y-1 py-1 text-slate-600 transition-colors duration-200 hover:text-primary sm:py-0"
                >
                  <item.icon size={22} className="transition-transform duration-200 group-hover:scale-110" />
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
