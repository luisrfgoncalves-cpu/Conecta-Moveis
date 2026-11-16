"use client";
import { LEGAL_REVIEWED, LEGAL_DATE } from "@/lib/legal/config";

export function LegalBanner() {
  if (LEGAL_REVIEWED) return null;
  return (
    <div className="bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 mb-6">
      <span className="shrink-0 text-sm">ℹ️</span>
      <span>
        <strong>Documento em revisão.</strong> Última atualização: {LEGAL_DATE}.
      </span>
    </div>
  );
}
