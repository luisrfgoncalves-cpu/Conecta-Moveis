import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { getMyFavorites } from '@/lib/favorites/actions';
import { Heart, MapPin, ArrowRight } from 'lucide-react';

export const metadata = { title: 'Favoritos — Conecta Móveis' };

export default async function FavoritosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/entrar');

  const { data: favorites } = await getMyFavorites();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        <Heart className="w-6 h-6 text-red-400" fill="currentColor" aria-hidden />
        Meus Favoritos
      </h1>

      {favorites.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center space-y-4">
          <Heart className="w-12 h-12 mx-auto text-slate-600" aria-hidden />
          <p className="text-slate-400 text-sm">Você ainda não favoritou nenhum profissional.</p>
          <Link
            href="/encontrar-profissionais"
            className="btn-primary text-sm px-5 py-2.5 rounded-xl inline-flex items-center gap-2"
          >
            Encontrar profissionais
            <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map(({ id, profile, created_at }) => (
            <li key={id} className="glass-panel rounded-2xl p-5 space-y-3 border border-white/10 hover:border-white/20 transition-colors">
              <div className="flex items-center gap-3">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt=""
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-sm flex-shrink-0">
                    {profile.display_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{profile.display_name}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3" aria-hidden />
                    {profile.city}, {profile.state}
                  </p>
                </div>
              </div>

              {profile.bio && (
                <p className="text-xs text-slate-400 line-clamp-2">{profile.bio}</p>
              )}

              <div className="flex items-center justify-between pt-1">
                <time className="text-xs text-slate-500" dateTime={created_at}>
                  Favoritado em {new Date(created_at).toLocaleDateString('pt-BR')}
                </time>
                <Link
                  href={`/profissionais/${profile.slug}`}
                  className="text-xs text-orange-400 hover:text-orange-300 font-medium flex items-center gap-1 transition-colors"
                >
                  Ver perfil
                  <ArrowRight className="w-3 h-3" aria-hidden />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

