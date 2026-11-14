'use client';

import { useState } from 'react';
import { Navigation, Loader2 } from 'lucide-react';
import { findNearestMunicipio } from '@/lib/geo/haversine';
import type { Municipio } from '@/lib/geo/schemas';

interface PertoDeMimButtonProps {
  municipios: Municipio[];
  onMunicipioDetected?: (municipio: Municipio, distanceKm: number) => void;
  className?: string;
}

export function PertoDeMimButton({
  municipios,
  onMunicipioDetected,
  className = '',
}: PertoDeMimButtonProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleLocateMe() {
    setErrorMsg(null);

    if (typeof window === 'undefined' || !navigator.geolocation) {
      setErrorMsg('Geolocalização não suportada no seu navegador.');
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Coordenadas obtidas no aparelho
        const userCoords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        // Resolução matemática estritamente local (no aparelho do visitante)
        // Nenhuma coordenada geográfica é transmitida ao servidor (Regra R11 / LGPD)
        const result = findNearestMunicipio(userCoords, municipios);

        setLoading(false);

        if (result && result.municipio) {
          if (onMunicipioDetected) {
            onMunicipioDetected(result.municipio, result.distance_km);
          } else {
            // Redireciona na busca de profissionais pelo município detectado
            window.location.href = `/encontrar-profissionais?cidade=${encodeURIComponent(
              result.municipio.nome
            )}&uf=${result.municipio.uf}&ibge=${result.municipio.ibge_code}`;
          }
        } else {
          setErrorMsg('Não foi possível identificar o município mais próximo.');
        }
      },
      (err) => {
        setLoading(false);
        if (err.code === 1) {
          setErrorMsg('Permissão de localização não concedida no navegador.');
        } else {
          setErrorMsg('Não foi possível obter a localização do aparelho.');
        }
      },
      {
        timeout: 10000,
        enableHighAccuracy: false, // rápido e econômico em bateria/rede
      }
    );
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleLocateMe}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-orange-400 border border-orange-500/30 hover:border-orange-500/50 transition-colors disabled:opacity-50 ${className}`}
        title="Localizar município mais próximo sem armazenar sua posição"
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Navigation className="w-3.5 h-3.5" />
        )}
        <span>{loading ? 'Identificando cidade…' : 'Perto de mim'}</span>
      </button>

      {errorMsg && (
        <span className="text-[11px] text-amber-400 font-medium">
          {errorMsg}
        </span>
      )}
    </div>
  );
}

