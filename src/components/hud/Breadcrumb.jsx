import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumb({ items = [] }) {
  // items: [{ label: string, page?: string }]
  // Last item is current page (no link)
  
  if (!items.length) return null;

  return (
    <nav className="flex items-center gap-1 text-sm text-slate-500 mb-4">
      <Link 
        to={createPageUrl('CommandDeck')} 
        className="flex items-center gap-1 hover:text-slate-700 transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>
      
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-4 h-4 text-slate-300" />
            {isLast || !item.page ? (
              <span className="text-slate-900 font-medium">{item.label}</span>
            ) : (
              <Link 
                to={createPageUrl(item.page)} 
                className="hover:text-slate-700 transition-colors"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}