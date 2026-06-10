import { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-primary text-white hover:bg-[#002855] shadow-sm',
    secondary: 'bg-secondary text-white hover:bg-[#92400e] shadow-sm',
    outline: 'border-2 border-primary text-primary hover:bg-slate-50',
    ghost: 'text-primary hover:bg-slate-100',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs font-bold uppercase tracking-wider',
    md: 'px-8 py-3 text-sm font-bold uppercase tracking-widest',
    lg: 'px-10 py-4 text-base font-bold uppercase tracking-widest',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-sm transition-all duration-200 active:scale-95 focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
