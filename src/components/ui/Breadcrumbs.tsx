'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center space-x-2 py-4 px-1 text-sm font-medium">
      {items.map((item, index) => (
        <div key={item.label} className="flex items-center">
          {index > 0 && (
            <ChevronRight size={14} className="mx-2 text-slate-400" />
          )}
          {item.href ? (
            <Link 
              href={item.href}
              className="text-[#002a54] hover:underline font-bold"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-800 font-bold">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
