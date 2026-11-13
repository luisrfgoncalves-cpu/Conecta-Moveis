'use client';

import { useState, useEffect, useTransition } from 'react';
import Image from 'next/image';
import {
  CATEGORIES_CATALOG,
  type ProfessionalProfileInput,
} from '@/lib/profile/schemas';
import {
  saveProfessionalProfile,
  togglePublishProfile,
  uploadAvatarAction,
} from '@/lib/profile/actions';
import {
  validateClientImageFile,
} from '@/lib/storage/clientImage';
import { ImageCropperModal } from '@/components/ui/ImageCropperModal';
import {
  User,
  Sparkles,
  MapPin,
  Phone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Camera,
  Eye,
  ArrowRight,
  ArrowLeft,
  Globe,
  Lock,
  HelpCircle,
  Edit3,
  ExternalLink,
  CheckCheck,
} from 'lucide-react';

interface Props {
  initialProfile?: {
    id?: string;
    is_published?: boolean;
    display_name?: string;
    bio?: string;
    city?: string;
    state?: string;
    whatsapp?: string;
    is_whatsapp_public?: boolean;
    phone?: string;
    is_phone_public?: boolean;
    avatar_url?: string;
    slug?: string;
    profile_specialties?: { specialty_id: string }[];
    service_regions?: { neighborhoods?: string[] }[];
  } | null;
  userEmail?: string;
  isEmailConfirmed: boolean;
}

export function ProfileWizard({ initialProfile, userEmail: _userEmail, isEmailConfirmed }: Props) {
  // Se o perfil já existe e está publicado, começa no modo "visualização/edição"
  const hasExistingProfile = !!initialProfile?.id;
  const [isEditMode, setIsEditMode] = useState(!hasExistingProfile);
  const [currentStep, setCurrentStep] = useState(hasExistingProfile ? 4 : 1);
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState('');
  const [serverSuccess, setServerSuccess] = useState('');
  const [showLivePreview, setShowLivePreview] = useState(false);

  // Estado do formulário
  const [profileId, setProfileId] = useState<string | undefined>(initialProfile?.id);
  const [isPublished, setIsPublished] = useState<boolean>(initialProfile?.is_published ?? false);
  const [displayName, setDisplayName] = useState<string>(initialProfile?.display_name ?? '');
  const [bio, setBio] = useState<string>(initialProfile?.bio ?? '');
  const [city, setCity] = useState<string>(initialProfile?.city ?? 'Jundiaí');
  const [state, setState] = useState<string>(initialProfile?.state ?? 'SP');
  const [neighborhoodsInput, setNeighborhoodsInput] = useState<string>(
    initialProfile?.service_regions?.[0]?.neighborhoods?.join(', ') ?? ''
  );
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(
    initialProfile?.profile_specialties?.map((s) => s.specialty_id) ?? []
  );
  const [whatsapp, setWhatsapp] = useState<string>(initialProfile?.whatsapp ?? '');
  const isWhatsappPublic = true;
  const [phone, setPhone] = useState<string>(initialProfile?.phone ?? '');
  const [isPhonePublic, setIsPhonePublic] = useState<boolean>(initialProfile?.is_phone_public ?? false);
  const [avatarUrl, setAvatarUrl] = useState<string>(initialProfile?.avatar_url ?? '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [cropperRawSrc, setCropperRawSrc] = useState<string | null>(null);
  const [cropperFileName, setCropperFileName] = useState('avatar.webp');
  const [profileSlug, setProfileSlug] = useState<string>(initialProfile?.slug ?? '');

  // Sincronizar avatarUrl se initialProfile for atualizado pelo servidor (ex: revalidatePath)
  useEffect(() => {
    if (initialProfile?.avatar_url && !avatarUrl) {
      setAvatarUrl(initialProfile.avatar_url);
    }
  }, [initialProfile?.avatar_url, avatarUrl]);

  const steps = [
    { number: 1, title: 'Atuação', icon: Sparkles },
    { number: 2, title: 'Identidade', icon: User },
    { number: 3, title: 'Especialidades & Região', icon: MapPin },
    { number: 4, title: 'Contatos & Publicação', icon: Phone },
  ];

  // Checar se todos os campos estão preenchidos para publicar
  const publishReady =
    !!avatarUrl &&
    displayName.trim().length >= 3 &&
    bio.trim().length >= 80 &&
    selectedSpecialties.length >= 1 &&
    city.trim().length >= 2 &&
    state.trim().length === 2 &&
    neighborhoodsInput.trim().length > 0 &&
    whatsapp.trim().length >= 10 &&
    isEmailConfirmed;

  // Iniciar seleção da imagem e abrir ajustador manual
  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;
    e.target.value = '';
    setServerError('');
    setServerSuccess('');

    const validation = validateClientImageFile(rawFile, 15 * 1024 * 1024);
    if (!validation.valid) {
      setServerError(validation.error || 'Arquivo inválido.');
      return;
    }

    setCropperFileName(rawFile.name);
    const reader = new FileReader();
    reader.onload = () => { setCropperRawSrc(reader.result as string); };
    reader.readAsDataURL(rawFile);
  }

  // Confirmar recorte e realizar upload
  async function handleConfirmCrop(croppedFile: File) {
    setCropperRawSrc(null);
    setUploadingAvatar(true);
    setServerError('');
    setServerSuccess('');
    try {
      const fd = new FormData();
      fd.append('file', croppedFile);
      const res = await uploadAvatarAction(fd);
      if ('error' in res) {
        setServerError(res.error);
      } else if (res.data?.publicUrl) {
        setAvatarUrl(res.data.publicUrl);
        setServerSuccess('Foto de perfil atualizada e otimizada com sucesso!');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao processar e enviar foto de perfil.';
      setServerError(msg);
    } finally {
      setUploadingAvatar(false);
    }
  }

  function toggleSpecialty(id: string) {
    setSelectedSpecialties((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  // Selecionar ou alternar categoria na Etapa 1
  function selectCategory(catId: string) {
    const category = CATEGORIES_CATALOG.find((c) => c.id === catId);
    if (!category) return;

    // Se já tinha especialidades dessa categoria, desmarca; se não tinha, seleciona as especialidades da categoria
    const catSpecIds = category.specialties.map((s) => s.id);
    const hasAnyFromCat = catSpecIds.some((id) => selectedSpecialties.includes(id));

    if (hasAnyFromCat) {
      // Remover especialidades desta categoria
      setSelectedSpecialties((prev) => prev.filter((id) => !catSpecIds.includes(id)));
    } else {
      // Adicionar especialidades padrão desta categoria (seleciona as 2 primeiras automaticamente)
      const toAdd = catSpecIds.slice(0, 2);
      setSelectedSpecialties((prev) => Array.from(new Set([...prev, ...toAdd])));
    }
  }

  // Salvar rascunho / progresso (retorna o ID salvo para uso interno)
  async function doSave(): Promise<string | null> {
    const neighborhoods = neighborhoodsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: ProfessionalProfileInput = {
      id: profileId,
      displayName,
      bio,
      city,
      state: state.toUpperCase(),
      neighborhoods,
      specialtyIds: selectedSpecialties,
      whatsapp,
      isWhatsappPublic,
      phone,
      isPhonePublic,
      avatarUrl,
    };

    const res = await saveProfessionalProfile(payload);
    if ('error' in res) {
      setServerError(res.error);
      return null;
    }
    if (res.data?.id) {
      setProfileId(res.data.id);
      if (res.data.slug) setProfileSlug(res.data.slug);
      return res.data.id;
    }
    return profileId ?? null;
  }

  function handleSaveDraft() {
    setServerError('');
    setServerSuccess('');
    startTransition(async () => {
      const id = await doSave();
      if (id) setServerSuccess('Rascunho salvo com sucesso!');
    });
  }

  // Publicar: salva tudo e depois publica atomicamente
  function handleTogglePublish(targetState: boolean) {
    setServerError('');
    setServerSuccess('');

    startTransition(async () => {
      if (targetState) {
        // Validação preventiva amigável no cliente antes de qualquer chamada ao servidor
        if (!avatarUrl) {
          setServerError('Adicione uma foto de perfil ou logotipo (Etapa 2) antes de publicar.');
          setCurrentStep(2);
          return;
        }
        if (!displayName || displayName.trim().length < 3) {
          setServerError('Informe seu nome profissional ou comercial com pelo menos 3 caracteres (Etapa 2).');
          setCurrentStep(2);
          return;
        }
        if (!bio || bio.trim().length < 80) {
          setServerError(`Sua apresentação profissional precisa de pelo menos 80 caracteres (você tem ${bio.trim().length}). Acesse a Etapa 2 para completar.`);
          setCurrentStep(2);
          return;
        }
        if (selectedSpecialties.length === 0) {
          setServerError('Selecione pelo menos uma especialidade (Etapa 3).');
          setCurrentStep(3);
          return;
        }
        if (!city || !state || state.length !== 2) {
          setServerError('Informe sua cidade e estado de atendimento (Etapa 3).');
          setCurrentStep(3);
          return;
        }
        if (!neighborhoodsInput || neighborhoodsInput.trim().length === 0) {
          setServerError('Informe ao menos um bairro ou região de atendimento (Etapa 3).');
          setCurrentStep(3);
          return;
        }
        if (!whatsapp || whatsapp.trim().length < 10) {
          setServerError('Informe um número de WhatsApp válido com DDD (Etapa 4).');
          setCurrentStep(4);
          return;
        }
        if (!isEmailConfirmed) {
          setServerError('Confirme seu e-mail antes de publicar. Verifique sua caixa de entrada.');
          return;
        }
      }

      // 1. Salvar todos os dados primeiro (garante que o banco está atualizado)
      const savedId = await doSave();
      if (!savedId) return; // doSave já setou o erro

      // 2. Publicar/despublicar com base no ID confirmado (passando avatarUrl atual para evitar perda por latência)
      const res = await togglePublishProfile(savedId, targetState, avatarUrl);
      if ('error' in res) {
        // Erro real do servidor — mostrar de forma clara sem confundir o usuário
        setServerError(res.error);
      } else {
        setIsPublished(targetState);
        if (targetState) {
          setIsEditMode(false); // Volta para modo visualização após publicar
          setServerSuccess('🎉 Parabéns! Seu perfil foi publicado e já está visível na vitrine!');
        } else {
          setServerSuccess('Perfil despublicado. Ele não está mais visível no catálogo.');
        }
      }
    });
  }

  // ─── MODO VISUALIZAÇÃO: Perfil já existe ─────────────────────────────────────
  if (hasExistingProfile && !isEditMode) {
    return (
      <div className="space-y-6">
        {/* Banner de status */}
        <div className={`glass-panel rounded-2xl p-5 border flex items-center justify-between gap-4 ${isPublished
            ? 'border-emerald-500/30 bg-emerald-500/5'
            : 'border-amber-500/30 bg-amber-500/5'
          }`}>
          <div className="flex items-center gap-3">
            {isPublished ? (
              <CheckCheck className="w-6 h-6 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0" />
            )}
            <div>
              <p className={`font-bold text-sm ${isPublished ? 'text-emerald-300' : 'text-amber-300'}`}>
                {isPublished ? 'Seu perfil está publicado e visível na vitrine!' : 'Perfil salvo como rascunho — não está visível ao público ainda.'}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {isPublished
                  ? 'Clientes já podem te encontrar no catálogo de profissionais.'
                  : 'Complete os campos e clique em "Publicar" para aparecer no catálogo.'}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
            {isPublished && profileSlug && (
              <a
                href={`/profissionais/${profileSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500/15 text-sky-400 text-xs font-bold border border-sky-500/30 hover:bg-sky-500/25 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Ver Perfil Público
              </a>
            )}
            <button
              type="button"
              onClick={() => { setIsEditMode(true); setServerError(''); setServerSuccess(''); }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-500/15 text-orange-400 text-xs font-bold border border-orange-500/30 hover:bg-orange-500/25 transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Editar Perfil
            </button>
          </div>
        </div>

        {serverError && (
          <div role="alert" className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{serverError}</p>
          </div>
        )}
        {serverSuccess && (
          <div role="status" className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{serverSuccess}</p>
          </div>
        )}

        {/* Resumo do perfil */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-lg font-black text-white">Visualização do Cartão do Perfil</h2>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${isPublished
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
              {isPublished ? '● Publicado na vitrine' : '○ Rascunho privado'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 rounded-2xl bg-black/30 border border-white/10">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/5 border border-white/20 flex-shrink-0 flex items-center justify-center shadow-lg">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-slate-500" />
              )}
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-white text-xl">{displayName || 'Nome Profissional'}</h3>
              <p className="text-xs text-orange-400 font-bold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> {city} • {state}
              </p>
              {whatsapp && (
                <p className="text-xs text-emerald-400 font-mono flex items-center gap-1.5 mt-1">
                  <Globe className="w-3.5 h-3.5" /> WhatsApp: {whatsapp}
                </p>
              )}
            </div>
          </div>

          {bio && (
            <div className="p-5 rounded-2xl bg-black/30 border border-white/10 space-y-2">
              <p className="text-xs font-bold text-orange-400/90 uppercase tracking-wider">Apresentação Profissional</p>
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap break-all [overflow-wrap:anywhere]">
                {bio}
              </p>
            </div>
          )}

          {selectedSpecialties.length > 0 && (
            <div className="p-5 rounded-2xl bg-black/30 border border-white/10 space-y-3">
              <p className="text-xs font-bold text-orange-400/90 uppercase tracking-wider">Especialidades Atendidas ({selectedSpecialties.length})</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES_CATALOG.flatMap(cat => cat.specialties)
                  .filter(s => selectedSpecialties.includes(s.id))
                  .map(s => (
                    <span key={s.id} className="px-3 py-1 rounded-xl text-xs bg-orange-500/15 text-orange-300 border border-orange-500/30 font-medium">
                      ✓ {s.name}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {neighborhoodsInput && (
            <div className="p-5 rounded-2xl bg-black/30 border border-white/10 space-y-2">
              <p className="text-xs font-bold text-orange-400/90 uppercase tracking-wider">Regiões e Bairros de Atendimento</p>
              <p className="text-sm text-slate-300 font-medium">{neighborhoodsInput}</p>
            </div>
          )}
        </div>

        {/* Ação de despublicar */}
        {isPublished && (
          <div className="flex justify-end">
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleTogglePublish(false)}
              className="px-5 py-2.5 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30 text-sm font-bold hover:bg-amber-600/30 transition disabled:opacity-60"
            >
              {isPending ? 'Atualizando...' : 'Despublicar Perfil'}
            </button>
          </div>
        )}
      </div>
    );
  }

  // ─── MODO EDIÇÃO / WIZARD ────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* Barra de Progresso Superior */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        {/* Botão de voltar ao resumo se já tem perfil */}
        {hasExistingProfile && (
          <button
            type="button"
            onClick={() => { setIsEditMode(false); setServerError(''); setServerSuccess(''); }}
            className="mb-4 flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar ao resumo do perfil
          </button>
        )}

        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 sm:pb-0">
          {steps.map((st) => {
            const Icon = st.icon;
            const isActive = currentStep === st.number;

            // Determinar se a etapa está genuinamente preenchida/concluída
            let isDone = false;
            if (st.number === 1) {
              isDone = selectedSpecialties.length >= 1;
            } else if (st.number === 2) {
              isDone = !!avatarUrl && displayName.trim().length >= 3 && bio.trim().length >= 80;
            } else if (st.number === 3) {
              isDone = selectedSpecialties.length >= 1 && city.trim().length >= 2 && state.trim().length === 2 && neighborhoodsInput.trim().length > 0;
            } else if (st.number === 4) {
              isDone = whatsapp.trim().length >= 10 && isEmailConfirmed;
            }

            return (
              <button
                key={st.number}
                type="button"
                onClick={() => setCurrentStep(st.number)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${isActive
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                    : isDone
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${isActive
                      ? 'bg-orange-500 text-white'
                      : isDone
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white/10 text-slate-400'
                    }`}
                >
                  {isDone ? '✓' : <Icon className="w-3.5 h-3.5" />}
                </div>
                <span>{st.title}</span>
              </button>
            );
          })}
        </div>

        {/* Linha indicadora de porcentagem */}
        <div className="w-full bg-white/5 h-2 rounded-full mt-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Alertas globais de erro ou sucesso */}
      {serverError && (
        <div role="alert" className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{serverError}</p>
        </div>
      )}

      {serverSuccess && (
        <div role="status" className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{serverSuccess}</p>
        </div>
      )}

      {/* ETAPA 1: Tipo de Atuação (Categorias do Catálogo) */}
      {currentStep === 1 && (
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold">Obrigatório</span>
              <span className="text-xs px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-bold">Público no perfil</span>
            </div>
            <h2 className="text-xl font-black text-white">Qual é o seu tipo de atuação principal?</h2>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              <strong>Por que pedimos isso?</strong> Os clientes filtram diretamente por tipo de profissional no catálogo de Jundiaí e região.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CATEGORIES_CATALOG.map((cat) => {
              const catSpecIds = cat.specialties.map((s) => s.id);
              const isSelected = catSpecIds.some((id) => selectedSpecialties.includes(id));
              const selectedCount = catSpecIds.filter((id) => selectedSpecialties.includes(id)).length;

              return (
                <div
                  key={cat.id}
                  onClick={() => selectCategory(cat.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      selectCategory(cat.id);
                    }
                  }}
                  className={`glass-card rounded-xl p-5 border cursor-pointer transition-all duration-200 space-y-3 text-left outline-none ${isSelected
                      ? 'border-orange-500 bg-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,0.25)] ring-1 ring-orange-500'
                      : 'border-white/10 hover:border-white/30 hover:bg-white/5'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-black transition ${isSelected ? 'bg-orange-500 text-white' : 'bg-white/10 text-transparent border border-white/20'
                        }`}>
                        ✓
                      </div>
                      <h3 className="font-bold text-white text-base">{cat.name}</h3>
                    </div>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${isSelected ? 'bg-orange-500/20 text-orange-300 font-bold' : 'text-slate-400 bg-white/5'
                      }`}>
                      {isSelected ? `${selectedCount} selecionada(s)` : `${cat.specialties.length} especialidades`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{cat.description}</p>
                  <p className="text-xs text-orange-400 font-medium">
                    {cat.specialties.map((s) => s.name).slice(0, 3).join(', ')}...
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <p className="text-xs text-slate-400">
              {selectedSpecialties.length > 0 ? (
                <span className="text-emerald-400 font-semibold">
                  ✓ Atuação selecionada ({selectedSpecialties.length} especialidade{selectedSpecialties.length > 1 ? 's' : ''}). Você pode ajustar detalhes na Etapa 3.
                </span>
              ) : (
                <span>Clique em um ou mais tipos de atuação acima para selecionar.</span>
              )}
            </p>
            <button
              type="button"
              onClick={() => {
                if (selectedSpecialties.length === 0) {
                  // Se não escolheu nenhum, seleciona a primeira como padrão para ajudar
                  selectCategory(CATEGORIES_CATALOG[0].id);
                }
                setCurrentStep(2);
              }}
              className="btn-neon px-6 py-3 text-sm flex items-center gap-2 whitespace-nowrap"
            >
              Próximo: Identidade Pública
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ETAPA 2: Identidade Pública (Foto, Nome e Bio) */}
      {currentStep === 2 && (
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6">
          <div>
            <h2 className="text-xl font-black text-white">Sua Identidade Pública</h2>
            <p className="text-xs text-slate-400 mt-1">
              Como seu nome e sua apresentação aparecerão para os contratantes.
            </p>
          </div>

          {/* Upload de Foto / Avatar */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-black/20 border border-white/10">
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-white/5 border border-white/20 flex items-center justify-center flex-shrink-0">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-slate-500" />
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
                </div>
              )}
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold">Obrigatório</span>
                <span className="text-xs px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-bold">Público</span>
              </div>
              <label
                htmlFor="avatar-upload"
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-200 text-xs font-bold transition border border-orange-500/30 hover:border-orange-500/50 shadow-sm"
              >
                <Camera className="w-4 h-4 text-orange-400" />
                {avatarUrl ? 'Trocar ou reajustar foto' : 'Enviar foto de perfil ou logotipo'}
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleAvatarChange}
                disabled={uploadingAvatar}
                className="hidden"
              />
              <div className="text-xs text-slate-400 space-y-0.5">
                <p>
                  <strong className="text-slate-300">Foto obrigatória para publicação.</strong> Formatos: JPG, PNG ou WebP.
                </p>
                <p className="text-[11px] text-slate-400">
                  Você poderá recortar, arrastar, dar zoom e girar antes de salvar.
                </p>
              </div>
            </div>
          </div>

          {/* Nome Profissional */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="displayName" className="block text-sm font-bold text-slate-200">
                Nome Profissional ou Comercial
              </label>
              <div className="flex gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold">Obrigatório</span>
                <span className="text-xs px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-bold">Público</span>
              </div>
            </div>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Ex: Carlos Silva • Montador ou Marcenaria Oliveira"
              className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              <strong>Por que pedimos?</strong> É o nome de destaque exibido nos cartões e na URL amigável do seu perfil.
            </p>
          </div>

          {/* Descrição / Bio */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="bio" className="block text-sm font-bold text-slate-200">
                Apresentação Profissional (Bio)
              </label>
              <div className="flex gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold">Obrigatório</span>
                <span className="text-xs px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-bold">Público</span>
              </div>
            </div>
            <textarea
              id="bio"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Ex: Atuo há mais de 6 anos com montagem e desmontagem de móveis modulados, planejados e convencionais em Jundiaí e região. Possuo ferramentas próprias completas, prezando por pontualidade, organização e fino acabamento."
              className="w-full bg-black/30 border border-white/20 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none text-sm leading-relaxed"
            />
            <div className="flex justify-between items-center text-xs">
              <span className={`font-medium ${bio.length >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {bio.length >= 80
                  ? '✓ Tamanho ideal atingido'
                  : `Mínimo de 80 caracteres para publicar (faltam ${Math.max(0, 80 - bio.length)})`}
              </span>
              <span className="text-slate-400">{bio.length}/800</span>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-5 py-2.5 rounded-xl border border-white/20 text-slate-300 text-sm font-semibold hover:bg-white/5 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
            <button
              type="button"
              onClick={() => {
                startTransition(async () => { await doSave(); setCurrentStep(3); });
              }}
              className="btn-neon px-6 py-3 text-sm flex items-center gap-2"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Próximo: Especialidades & Região
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ETAPA 3: Especialidades e Região de Atendimento */}
      {currentStep === 3 && (
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6">
          <div>
            <h2 className="text-xl font-black text-white">Especialidades e Área de Atendimento</h2>
            <p className="text-xs text-slate-400 mt-1">
              Marque exatamente o que você faz e onde você atende.
            </p>
          </div>

          {/* Seleção de Especialidades */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-bold text-slate-200">
                Selecione suas especialidades
              </label>
              <div className="flex gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold">Obrigatório</span>
                <span className="text-xs px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-bold">Público</span>
              </div>
            </div>

            {selectedSpecialties.length > 0 && (
              <p className="text-xs text-emerald-400 font-medium">
                ✓ {selectedSpecialties.length} especialidade{selectedSpecialties.length > 1 ? 's' : ''} selecionada{selectedSpecialties.length > 1 ? 's' : ''}
              </p>
            )}

            <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
              {CATEGORIES_CATALOG.map((cat) => (
                <div key={cat.id} className="space-y-2">
                  <p className="text-xs font-black uppercase tracking-wider text-orange-400">
                    {cat.name}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {cat.specialties.map((spec) => {
                      const selected = selectedSpecialties.includes(spec.id);
                      return (
                        <button
                          key={spec.id}
                          type="button"
                          onClick={() => toggleSpecialty(spec.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${selected
                              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                              : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                            }`}
                        >
                          {selected ? '✓ ' : '+ '}
                          {spec.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              <strong>Por que pedimos?</strong> Permite que o cliente encontre você quando buscar por itens específicos (ex: móveis modulados, cozinhas sob medida).
            </p>
          </div>

          {/* Região: Cidade e Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="city" className="block text-sm font-bold text-slate-200">
                  Cidade Base
                </label>
                <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold">Obrigatório</span>
              </div>
              <input
                id="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Jundiaí"
                className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="state" className="block text-sm font-bold text-slate-200">
                  UF (Estado)
                </label>
                <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold">Obrigatório</span>
              </div>
              <input
                id="state"
                type="text"
                maxLength={2}
                value={state}
                onChange={(e) => setState(e.target.value.toUpperCase())}
                placeholder="SP"
                className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white uppercase placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
          </div>

          {/* Bairros atendidos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="neighborhoods" className="block text-sm font-bold text-slate-200">
                Bairros e Cidades Vizinhas Atendidas
              </label>
              <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold">Obrigatório</span>
            </div>
            <input
              id="neighborhoods"
              type="text"
              value={neighborhoodsInput}
              onChange={(e) => setNeighborhoodsInput(e.target.value)}
              placeholder="Ex: Centro, Vila Arens, Eloy Chaves, Itupeva, Várzea Paulista..."
              className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
            <p className="text-xs text-amber-400 font-medium flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <strong>Privacidade garantida:</strong> Informe apenas os bairros ou cidades onde você presta serviços (nunca seu endereço residencial).
            </p>
          </div>

          <div className="flex justify-between pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 rounded-xl border border-white/20 text-slate-300 text-sm font-semibold hover:bg-white/5 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
            <button
              type="button"
              onClick={() => {
                startTransition(async () => { await doSave(); setCurrentStep(4); });
              }}
              className="btn-neon px-6 py-3 text-sm flex items-center gap-2"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Próximo: Contatos & Publicação
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ETAPA 4: Contatos e Controle de Publicação */}
      {currentStep === 4 && (
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6">
          <div>
            <h2 className="text-xl font-black text-white">Contatos e Publicação</h2>
            <p className="text-xs text-slate-400 mt-1">
              Configure seu contato e publique seu perfil na vitrine.
            </p>
          </div>

          {/* WhatsApp Obrigatório */}
          <div className="space-y-3 p-4 rounded-xl bg-black/20 border border-white/10">
            <div className="flex items-center justify-between">
              <label htmlFor="whatsapp" className="block text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                WhatsApp para Contato Direto
              </label>
              <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold">Obrigatório</span>
            </div>
            <div className="flex gap-2">
              <div className="w-20 px-3 py-3 rounded-xl bg-white/5 border border-white/15 text-slate-300 font-bold text-sm flex items-center justify-center select-none">
                🇧🇷 +55
              </div>
              <input
                id="whatsapp"
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="DDD + Número (ex: 11 99999-8888)"
                className="flex-1 bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm font-medium"
              />
            </div>
            <p className="text-xs text-emerald-400/90 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              Digite o DDD e o número (ex: 11999998888 ou 11 99999-8888). O sistema aceita com ou sem máscara.
            </p>
          </div>

          {/* Telefone Fixo ou Celular Alternativo */}
          <div className="space-y-3 p-4 rounded-xl bg-black/20 border border-white/10">
            <div className="flex items-center justify-between">
              <label htmlFor="phone" className="block text-sm font-bold text-white">
                Telefone de Apoio
              </label>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-500/20 text-slate-300 font-bold">Opcional</span>
            </div>
            <div className="flex gap-2">
              <div className="w-20 px-3 py-3 rounded-xl bg-white/5 border border-white/15 text-slate-300 font-bold text-sm flex items-center justify-center select-none">
                🇧🇷 +55
              </div>
              <input
                id="phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="DDD + Número (ex: 11 4521-0000)"
                className="flex-1 bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-sm font-medium"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                id="isPhonePublic"
                type="checkbox"
                checked={isPhonePublic}
                onChange={(e) => setIsPhonePublic(e.target.checked)}
                className="w-4 h-4 accent-orange-500 cursor-pointer"
              />
              <label htmlFor="isPhonePublic" className="text-xs text-slate-300 cursor-pointer">
                Tornar este telefone público no perfil
              </label>
            </div>
          </div>

          {/* Checklist de requisitos */}
          <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-3">
            <h3 className="text-sm font-bold text-white">
              {publishReady ? '✅ Tudo pronto para publicar!' : 'Critérios para aparecer na vitrine:'}
            </h3>
            <ul className="space-y-2 text-xs">
              <li className={`flex items-center gap-2 ${avatarUrl ? 'text-emerald-400' : 'text-slate-400'}`}>
                {avatarUrl ? '✓' : '○'} Foto de perfil {avatarUrl ? '— OK' : '— Pendente na Etapa 2'}
              </li>
              <li className={`flex items-center gap-2 ${displayName.length >= 3 ? 'text-emerald-400' : 'text-slate-400'}`}>
                {displayName.length >= 3 ? '✓' : '○'} Nome profissional {displayName.length >= 3 ? '— OK' : '— Pendente na Etapa 2'}
              </li>
              <li className={`flex items-center gap-2 ${bio.length >= 80 ? 'text-emerald-400' : 'text-slate-400'}`}>
                {bio.length >= 80 ? '✓' : '○'} Apresentação profissional ({bio.length}/80 caracteres) {bio.length >= 80 ? '— OK' : `— faltam ${80 - bio.length} na Etapa 2`}
              </li>
              <li className={`flex items-center gap-2 ${selectedSpecialties.length >= 1 ? 'text-emerald-400' : 'text-slate-400'}`}>
                {selectedSpecialties.length >= 1 ? '✓' : '○'} Especialidades ({selectedSpecialties.length} selecionadas) {selectedSpecialties.length >= 1 ? '— OK' : '— Pendente na Etapa 3'}
              </li>
              <li className={`flex items-center gap-2 ${city && state.length === 2 ? 'text-emerald-400' : 'text-slate-400'}`}>
                {city && state.length === 2 ? '✓' : '○'} Cidade e UF {city && state.length === 2 ? `— ${city}/${state}` : '— Pendente na Etapa 3'}
              </li>
              <li className={`flex items-center gap-2 ${neighborhoodsInput.trim().length > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                {neighborhoodsInput.trim().length > 0 ? '✓' : '○'} Bairros de atendimento {neighborhoodsInput.trim().length > 0 ? '— OK' : '— Pendente na Etapa 3'}
              </li>
              <li className={`flex items-center gap-2 ${whatsapp.trim().length >= 10 ? 'text-emerald-400' : 'text-slate-400'}`}>
                {whatsapp.trim().length >= 10 ? '✓' : '○'} WhatsApp com DDD {whatsapp.trim().length >= 10 ? '— OK' : '— Pendente acima'}
              </li>
              <li className={`flex items-center gap-2 ${isEmailConfirmed ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isEmailConfirmed ? '✓' : '⚠️'} E-mail confirmado {isEmailConfirmed ? '— OK' : '— Verifique sua caixa de entrada'}
              </li>
            </ul>
          </div>

          {/* Botões de Ação Final */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2.5 rounded-xl border border-white/20 text-slate-300 text-sm font-semibold hover:bg-white/5 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </button>
              <button
                type="button"
                onClick={() => setShowLivePreview(true)}
                className="px-5 py-2.5 rounded-xl border border-sky-500/30 text-sky-400 text-sm font-semibold hover:bg-sky-500/10 flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Pré-visualizar
              </button>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <button
                type="button"
                disabled={isPending}
                onClick={handleSaveDraft}
                className="px-5 py-2.5 rounded-xl border border-white/20 text-white text-sm font-bold hover:bg-white/10 transition disabled:opacity-60"
              >
                {isPending ? 'Salvando...' : 'Salvar Rascunho'}
              </button>

              {isPublished ? (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleTogglePublish(false)}
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-black transition disabled:opacity-60"
                >
                  {isPending ? 'Atualizando...' : 'Despublicar'}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isPending || !publishReady}
                  onClick={() => handleTogglePublish(true)}
                  title={!publishReady ? 'Complete todos os campos obrigatórios acima para publicar' : ''}
                  className={`px-6 py-2.5 text-sm flex items-center gap-2 rounded-xl font-black transition disabled:opacity-60 ${publishReady
                      ? 'btn-neon'
                      : 'bg-slate-700 text-slate-400 border border-white/10 cursor-not-allowed'
                    }`}
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                  {isPending ? 'Publicando...' : publishReady ? 'Publicar no Catálogo' : 'Complete os campos acima'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Interativo de Ajuste, Recorte e Centralização da Foto */}
      {cropperRawSrc && (
        <ImageCropperModal
          imageSrc={cropperRawSrc}
          fileName={cropperFileName}
          title="Ajustar Foto de Perfil"
          onCancel={() => setCropperRawSrc(null)}
          onConfirm={handleConfirmCrop}
        />
      )}

      {/* Modal de Pré-visualização do Perfil Público */}
      {showLivePreview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-xl w-full rounded-3xl p-6 sm:p-8 border border-white/20 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-orange-400" />
                <h3 className="font-black text-white text-lg">Pré-visualização do Perfil Público</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLivePreview(false)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕ Fechar
              </button>
            </div>

            {/* Simulação do Cartão Público */}
            <div className="glass-card rounded-2xl p-6 border border-white/15 space-y-4">
              <div className="flex items-start gap-4">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-white/10 border border-white/20 flex-shrink-0">
                  {avatarUrl ? (
                    <Image src={avatarUrl} alt={displayName} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-orange-400 font-bold text-xl">
                      {displayName.charAt(0) || 'P'}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-xl font-black text-white">{displayName || 'Seu Nome Profissional'}</h4>
                  <p className="text-xs text-orange-400 font-semibold">{city || 'Cidade'} • {state || 'UF'}</p>
                  <p className="text-xs text-slate-300 mt-1">{neighborhoodsInput ? `Atende: ${neighborhoodsInput}` : 'Atende toda a região'}</p>
                </div>
              </div>

              <p className="text-sm text-slate-200 leading-relaxed bg-black/30 p-4 rounded-xl border border-white/5">
                {bio || 'Sua apresentação profissional aparecerá aqui para os clientes que acessarem seu perfil.'}
              </p>

              {whatsapp && (
                <div className="pt-2">
                  <div className="btn-neon w-full py-3 text-center text-sm font-bold flex items-center justify-center gap-2">
                    <Globe className="w-4 h-4" />
                    Conversar no WhatsApp ({whatsapp})
                  </div>
                </div>
              )}

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-400 leading-relaxed">
                Este perfil é publicado pelo anunciante. A presença na plataforma não representa garantia da qualidade, prazo ou resultado do serviço.
              </div>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowLivePreview(false)}
                className="btn-neon px-8 py-3 text-sm font-bold"
              >
                Entendido, voltar para a edição
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
