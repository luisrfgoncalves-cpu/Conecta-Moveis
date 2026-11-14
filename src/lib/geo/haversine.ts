import type { Coordinates, Municipio } from './schemas';

const EARTH_RADIUS_KM = 6371.0;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calcula a distância em quilômetros entre duas coordenadas usando a fórmula de Haversine.
 * Matemática pura sem dependências externas (sem PostGIS, sem serviços de mapas).
 */
export function calculateHaversineDistanceKm(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);

  const lat1Rad = toRadians(coord1.latitude);
  const lat2Rad = toRadians(coord2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Number((EARTH_RADIUS_KM * c).toFixed(2));
}

/**
 * Converte as coordenadas do aparelho do usuário (do navegador) no município cadastrado mais próximo.
 * Roda estritamente no cliente para blindar a privacidade (LGPD art. 6º, III - minimização).
 * Nenhuma coordenada de latitude/longitude é enviada ao servidor.
 */
export function findNearestMunicipio(
  userCoords: Coordinates,
  municipios: Municipio[]
): { municipio: Municipio; distance_km: number } | null {
  if (!municipios || municipios.length === 0) return null;

  let nearest: Municipio = municipios[0];
  let minDistance = calculateHaversineDistanceKm(userCoords, {
    latitude: municipios[0].latitude,
    longitude: municipios[0].longitude,
  });

  for (let i = 1; i < municipios.length; i++) {
    const dist = calculateHaversineDistanceKm(userCoords, {
      latitude: municipios[i].latitude,
      longitude: municipios[i].longitude,
    });
    if (dist < minDistance) {
      minDistance = dist;
      nearest = municipios[i];
    }
  }

  return { municipio: nearest, distance_km: minDistance };
}
