import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const allItems: BreadcrumbItem[] = [{ label: 'Início', href: '/' }, ...items];

  return (
    <nav
      aria-label="Trilha de navegação"
      className={`flex items-center flex-wrap gap-1.5 text-xs text-slate-400 font-medium ${className}`}
    >
      {allItems.map((item, index) => {
        const isLast = index === allItems.length - 1;
        const isFirst = index === 0;

        return (
          <div key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            {index > 0 && (
              <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0" aria-hidden="true" />
            )}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="flex items-center gap-1 hover:text-orange-400 transition-colors py-0.5 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500"
              >
                {isFirst && <Home className="w-3 h-3 text-orange-400" aria-hidden="true" />}
                <span>{item.label}</span>
              </Link>
            ) : (
              <span
                className={`truncate max-w-[200px] sm:max-w-xs ${
                  isLast ? 'text-white font-bold' : 'text-slate-400'
                }`}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}

