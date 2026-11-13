"use client";
import { LEGAL_REVIEWED } from "@/lib/legal/config";

export function LegalBanner() {
  if (LEGAL_REVIEWED) return null;
  return (
    <div className="bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs px-4 py-2 rounded-lg flex items-center gap-2 mb-6">
      <span>⚠</span>
      <span>
        <strong>Versão Preliminar</strong> — Documento em revisão jurídica. Não
        tem validade legal até revisão e aprovação por advogado habilitado.
      </span>
    </div>
  );
}
