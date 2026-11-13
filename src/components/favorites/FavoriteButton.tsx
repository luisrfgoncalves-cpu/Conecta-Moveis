'use client';

import { useState, useCallback } from 'react';
import { Heart } from 'lucide-react';
import { toggleFavorite } from '@/lib/favorites/actions';

interface FavoriteButtonProps {
  profileId: string;
  initialIsFav: boolean;
  isLoggedIn: boolean;
  className?: string;
}

export function FavoriteButton({
  profileId,
  initialIsFav,
  isLoggedIn,
  className = '',
}: FavoriteButtonProps) {
  const [isFav, setIsFav] = useState(initialIsFav);
  const [loading, setLoading] = useState(false);

  const handleToggle = useCallback(async () => {
    if (!isLoggedIn) {
      window.location.href = '/entrar';
      return;
    }

    setLoading(true);
    const res = await toggleFavorite(profileId);
    if (res.success) setIsFav(res.isFav);
    setLoading(false);
  }, [profileId, isLoggedIn]);

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      aria-pressed={isFav}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:opacity-50 ${
        isFav
          ? 'bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30'
          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
      } ${className}`}
    >
      <Heart
        className={`w-4 h-4 transition-transform ${loading ? 'scale-75' : 'scale-100'}`}
        fill={isFav ? 'currentColor' : 'none'}
        aria-hidden
      />
      <span className="text-sm font-medium">{isFav ? 'Favoritado' : 'Favoritar'}</span>
    </button>
  );
}

