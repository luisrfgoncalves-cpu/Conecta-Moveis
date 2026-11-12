import { ShieldAlert, AlertTriangle, Info } from 'lucide-react';

export function Alert({ children, type = 'info' }: { children: React.ReactNode; type?: 'info' | 'warning' | 'legal' }) {
  if (type === 'legal') {
    return (
      <div className="relative p-5 rounded-2xl bg-gradient-to-r from-slate-900/90 to-slate-950/90 border border-orange-500/30 text-slate-300 text-xs sm:text-sm leading-relaxed backdrop-blur-md shadow-2xl flex items-start gap-3.5">
        <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 shrink-0 mt-0.5">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          {children}
        </div>
      </div>
    );
  }

  if (type === 'warning') {
    return (
      <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <div>{children}</div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-sky-950/40 border border-sky-500/30 text-sky-200 text-xs flex items-center gap-2.5">
      <Info className="w-4 h-4 text-sky-400 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

export function Skeleton({ className = 'h-6 w-full' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-white/10 rounded-xl ${className}`} />
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="text-center py-16 px-6 glass-card rounded-2xl border-dashed border-white/10">
      <h3 className="text-base font-bold text-white">{title}</h3>
      <p className="mt-1 text-xs text-slate-400">{description}</p>
    </div>
  );
}
