import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function BackButton({ className }) {
  const canGoBack = typeof window !== 'undefined' && window.history.length > 1;

  if (!canGoBack) return null;

  const handleBack = () => {
    window.history.back();
  };

  return (
    <button
      onClick={handleBack}
      className={cn(
        "p-2 rounded-lg transition-all duration-200",
        "text-slate-500 hover:text-slate-700 hover:bg-slate-100",
        "dark:text-[#00ff88]/70 dark:hover:text-[#00ff88] dark:hover:bg-[rgba(0,255,136,0.1)]",
        "dark:hover:shadow-[0_0_12px_rgba(0,255,136,0.3)]",
        "[data-theme='hacker'] &:text-[#00ff00]/70 [data-theme='hacker'] &:hover:text-[#00ff00]",
        className
      )}
      title="Go back"
    >
      <ArrowLeft className="w-5 h-5" />
    </button>
  );
}