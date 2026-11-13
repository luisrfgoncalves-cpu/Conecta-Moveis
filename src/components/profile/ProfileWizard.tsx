'use client';

import { useState, useTransition } from 'react';
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
    profile_specialties?: { specialty_id: string }[];
    service_regions?: { neighborhoods?: string[] }[];
  } | null;
  userEmail?: string;
  isEmailConfirmed: boolean;
}

export function ProfileWizard({ initialProfile, userEmail: _userEmail, isEmailConfirmed }: Props) {
  const [currentStep, setCurrentStep] = useState(1);
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
    initialProfile?.service_regions?.[0]?.neighborhoods?.join(', ') ?? 'Centro, Vila Arens, Eloy Chaves'
  );
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(
    initialProfile?.profile_specialties?.map((s) => s.specialty_id) ?? []
  );
  const [whatsapp, setWhatsapp] = useState<string>(initialProfile?.whatsapp ?? '');
  const [isWhatsappPublic, setIsWhatsappPublic] = useState<boolean>(initialProfile?.is_whatsapp_public ?? true);
  const [phone, setPhone] = useState<string>(initialProfile?.phone ?? '');
  const [isPhonePublic, setIsPhonePublic] = useState<boolean>(initialProfile?.is_phone_public ?? false);
  const [avatarUrl, setAvatarUrl] = useState<string>(initialProfile?.avatar_url ?? '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [cropperRawSrc, setCropperRawSrc] = useState<string | null>(null);
  const [cropperFileName, setCropperFileName] = useState('avatar.webp');

  const steps = [
    { number: 1, title: 'Atuação', icon: Sparkles },
    { number: 2, title: 'Identidade', icon: User },
    { number: 3, title: 'Especialidades & Região', icon: MapPin },
    { number: 4, title: 'Contatos & Publicação', icon: Phone },
  ];

  // Iniciar seleção da imagem e abrir ajustador manual
  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;

    // Resetar input para permitir selecionar a mesma imagem novamente se desejar
    e.target.value = '';

    setServerError('');
    setServerSuccess('');

    // Validação de formato e tamanho no cliente
    const validation = validateClientImageFile(rawFile, 15 * 1024 * 1024);
    if (!validation.valid) {
      setServerError(validation.error || 'Arquivo inválido.');
      return;
    }

    setCropperFileName(rawFile.name);

    // Carregar para o modal de enquadramento/recorte manual
    const reader = new FileReader();
    reader.onload = () => {
      setCropperRawSrc(reader.result as string);
    };
    reader.readAsDataURL(rawFile);
  }

  // Confirmar recorte e realizar upload para o servidor
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
        setServerSuccess('Foto de perfil enquadrada e salva com sucesso!');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao processar e enviar foto de perfil.';
      setServerError(msg);
    } finally {
      setUploadingAvatar(false);
    }
  }

  // Toggle especialidade
  function toggleSpecialty(id: string) {
    setSelectedSpecialties((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  // Salvar rascunho / progresso
  function handleSave(showNotice = true) {
    setServerError('');
    setServerSuccess('');

    const neighborhoods = neighborhoodsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    startTransition(async () => {
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
      } else {
        if (res.data?.id) setProfileId(res.data.id);
        if (showNotice) setServerSuccess(res.message ?? 'Perfil salvo com sucesso!');
      }
    });
  }

  // Ação de Publicar / Despublicar
  function handleTogglePublish(targetState: boolean) {
    setServerError('');
    setServerSuccess('');

    if (!profileId) {
      setServerError('Salve os dados do perfil antes de publicá-lo.');
      return;
    }

    startTransition(async () => {
      // Salvar dados mais recentes primeiro
      handleSave(false);

      const res = await togglePublishProfile(profileId, targetState);
      if ('error' in res) {
        setServerError(res.error);
      } else {
        setIsPublished(targetState);
        setServerSuccess(res.message ?? 'Status alterado com sucesso!');
      }
    });
  }

  return (
    <div className="space-y-8">
      {/* Barra de Progresso Superior */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 sm:pb-0">
          {steps.map((st) => {
            const Icon = st.icon;
            const isActive = currentStep === st.number;
            const isDone = currentStep > st.number;

            return (
              <button
                key={st.number}
                type="button"
                onClick={() => setCurrentStep(st.number)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                    : isDone
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                    isActive
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
            {CATEGORIES_CATALOG.map((cat) => (
              <div
                key={cat.id}
                className="glass-card rounded-xl p-5 border border-white/10 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-base">{cat.name}</h3>
                  <span className="text-xs text-slate-400 font-mono">{cat.specialties.length} especialidades</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{cat.description}</p>
                <p className="text-xs text-orange-400 font-medium">
                  {cat.specialties.map((s) => s.name).slice(0, 3).join(', ')}...
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="btn-neon px-6 py-3 text-sm flex items-center gap-2"
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
                <span className="text-xs px-2 py-0.5 rounded bg-slate-500/20 text-slate-300 font-bold">Opcional</span>
                <span className="text-xs px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-bold">Público</span>
              </div>
              <label
                htmlFor="avatar-upload"
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-200 text-xs font-bold transition border border-orange-500/30 hover:border-orange-500/50 shadow-sm"
              >
                <Camera className="w-4 h-4 text-orange-400" />
                {avatarUrl ? 'Trocar foto de perfil' : 'Enviar foto de perfil'}
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
                  <strong className="text-slate-300">Formatos aceitos:</strong> JPG, PNG ou WebP.
                </p>
                <p className="text-[11px] text-slate-400">
                  Enquadrado automaticamente em formato quadrado (1:1), redimensionado para 512px e comprimido em WebP sem perda de qualidade.
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
              placeholder="Descreva sua experiência, ferramentas, tipos de móveis que atende e diferenciais de pontualidade e acabamento..."
              className="w-full bg-black/30 border border-white/20 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none text-sm"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>Mínimo 20 caracteres para publicar</span>
              <span>{bio.length}/600</span>
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
                handleSave(false);
                setCurrentStep(3);
              }}
              className="btn-neon px-6 py-3 text-sm flex items-center gap-2"
            >
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
                Selecione suas especialidades (mínimo 1 para publicar)
              </label>
              <div className="flex gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold">Obrigatório</span>
                <span className="text-xs px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-bold">Público</span>
              </div>
            </div>

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
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            selected
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
              <label htmlFor="city" className="block text-sm font-bold text-slate-200">
                Cidade Base
              </label>
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
              <label htmlFor="state" className="block text-sm font-bold text-slate-200">
                UF (Estado)
              </label>
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

          {/* Bairros atendidos (NUNCA endereço residencial) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="neighborhoods" className="block text-sm font-bold text-slate-200">
                Bairros e Cidades Vizinhas Atendidas
              </label>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-500/20 text-slate-300 font-bold">Opcional</span>
            </div>
            <input
              id="neighborhoods"
              type="text"
              value={neighborhoodsInput}
              onChange={(e) => setNeighborhoodsInput(e.target.value)}
              placeholder="Centro, Eloy Chaves, Vila Arens, Itupeva, Várzea Paulista..."
              className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
            <p className="text-xs text-amber-400 font-medium flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <strong>Privacidade garantida:</strong> Nunca informe seu endereço residencial pessoal. Apenas as regiões onde você se desloca para prestar o serviço.
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
                handleSave(false);
                setCurrentStep(4);
              }}
              className="btn-neon px-6 py-3 text-sm flex items-center gap-2"
            >
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
              Controle quais formas de contato você deseja exibir no seu perfil público.
            </p>
          </div>

          {/* WhatsApp */}
          <div className="space-y-3 p-4 rounded-xl bg-black/20 border border-white/10">
            <div className="flex items-center justify-between">
              <label htmlFor="whatsapp" className="block text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                WhatsApp para Contato
              </label>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-500/20 text-slate-300 font-bold">Opcional</span>
            </div>
            <input
              id="whatsapp"
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="Ex: 11999998888"
              className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <div className="flex items-center gap-3">
              <input
                id="isWhatsappPublic"
                type="checkbox"
                checked={isWhatsappPublic}
                onChange={(e) => setIsWhatsappPublic(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
              <label htmlFor="isWhatsappPublic" className="text-xs text-slate-300 cursor-pointer">
                Tornar botão direto de WhatsApp visível publicamente no perfil
              </label>
            </div>
          </div>

          {/* Telefone Fixo ou Celular Alternativo */}
          <div className="space-y-3 p-4 rounded-xl bg-black/20 border border-white/10">
            <div className="flex items-center justify-between">
              <label htmlFor="phone" className="block text-sm font-bold text-white">
                Telefone de Apoio
              </label>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-500/20 text-slate-300 font-bold">Opcional</span>
            </div>
            <input
              id="phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ex: 1145210000"
              className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
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

          {/* Status dos Requisitos para Publicar */}
          <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-3">
            <h3 className="text-sm font-bold text-white">Critérios para o perfil ficar visível no catálogo:</h3>
            <ul className="space-y-2 text-xs">
              <li className={`flex items-center gap-2 ${displayName.length >= 3 ? 'text-emerald-400' : 'text-slate-400'}`}>
                {displayName.length >= 3 ? '✓' : '○'} Nome profissional preenchido ({displayName ? 'OK' : 'Pendente'})
              </li>
              <li className={`flex items-center gap-2 ${bio.length >= 20 ? 'text-emerald-400' : 'text-slate-400'}`}>
                {bio.length >= 20 ? '✓' : '○'} Descrição com pelo menos 20 caracteres ({bio.length}/20)
              </li>
              <li className={`flex items-center gap-2 ${selectedSpecialties.length >= 1 ? 'text-emerald-400' : 'text-slate-400'}`}>
                {selectedSpecialties.length >= 1 ? '✓' : '○'} Ao menos 1 especialidade selecionada ({selectedSpecialties.length} selecionadas)
              </li>
              <li className={`flex items-center gap-2 ${city && state ? 'text-emerald-400' : 'text-slate-400'}`}>
                {city && state ? '✓' : '○'} Cidade e UF preenchidos ({city}/{state})
              </li>
              <li className={`flex items-center gap-2 ${isEmailConfirmed ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isEmailConfirmed ? '✓' : '⚠️'} E-mail confirmado ({isEmailConfirmed ? 'Confirmado' : 'Confirmação pendente na caixa de entrada'})
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
                Pré-visualizar Perfil
              </button>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleSave(true)}
                className="px-5 py-2.5 rounded-xl border border-white/20 text-white text-sm font-bold hover:bg-white/10 transition"
              >
                Salvar Rascunho
              </button>

              {isPublished ? (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleTogglePublish(false)}
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-black transition disabled:opacity-60"
                >
                  {isPending ? 'Atualizando...' : 'Despublicar Perfil'}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleTogglePublish(true)}
                  className="btn-neon px-6 py-2.5 text-sm flex items-center gap-2 disabled:opacity-60"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                  Publicar no Catálogo
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

              {/* Botão de contato simulado */}
              {isWhatsappPublic && whatsapp && (
                <div className="pt-2">
                  <div className="btn-neon w-full py-3 text-center text-sm font-bold flex items-center justify-center gap-2">
                    <Globe className="w-4 h-4" />
                    Conversar no WhatsApp ({whatsapp})
                  </div>
                </div>
              )}

              {/* Aviso Legal Obrigatório do Perfil Público */}
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
