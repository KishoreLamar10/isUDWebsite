'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AccordionItemProps {
  question: string;
  answer: string | React.ReactNode;
  isOpen?: boolean;
  onToggle: () => void;
}

function AccordionItem({ question, answer, isOpen, onToggle }: AccordionItemProps) {
  return (
    <div className="border-b border-slate-100 last:border-0 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 py-5 text-left group focus:outline-none"
        aria-expanded={isOpen}
      >
        <div className={cn(
          "shrink-0 w-6 h-6 flex items-center justify-center transition-transform duration-300",
          isOpen ? "text-secondary" : "text-primary group-hover:text-secondary"
        )}>
          {isOpen ? <Minus size={20} strokeWidth={2.5} /> : <Plus size={20} strokeWidth={2.5} />}
        </div>
        <span className={cn(
          "text-base md:text-[17px] font-bold tracking-tight transition-colors",
          isOpen ? "text-secondary" : "text-[#002a54] group-hover:text-secondary"
        )}>
          {question}
        </span>
      </button>

      <div 
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-[500px] opacity-100 mb-6" : "max-h-0 opacity-0"
        )}
      >
        <div className="pl-10 pr-4 text-slate-600 leading-relaxed text-sm md:text-base">
          {answer}
        </div>
      </div>
    </div>
  );
}

interface AccordionProps {
  items: { question: string; answer: string | React.ReactNode }[];
}

export default function Accordion({ items }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full bg-white divide-y divide-slate-100">
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          question={item.question}
          answer={item.answer}
          isOpen={openIndex === index}
          onToggle={() => handleToggle(index)}
        />
      ))}
    </div>
  );
}
