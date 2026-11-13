'use client';

import { useState, useTransition } from 'react';
import { saveCompany, uploadAvatarAction } from '@/lib/profile/actions';
import { type CompanyInput } from '@/lib/profile/schemas';
import {
  validateClientImageFile,
} from '@/lib/storage/clientImage';
import { ImageCropperModal } from '@/components/ui/ImageCropperModal';
import {
  Building2,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';

interface Props {
  initialCompany?: {
    id?: string;
    name?: string;
    trade_name?: string;
    cnpj?: string;
    description?: string;
    logo_url?: string;
  } | null;
}

export function CompanyForm({ initialCompany }: Props) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState('');
  const [serverSuccess, setServerSuccess] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [cropperRawSrc, setCropperRawSrc] = useState<string | null>(null);
  const [cropperFileName, setCropperFileName] = useState('logo.webp');

  const [companyId, setCompanyId] = useState<string | undefined>(initialCompany?.id);
  const [name, setName] = useState<string>(initialCompany?.name ?? '');
  const [tradeName, setTradeName] = useState<string>(initialCompany?.trade_name ?? '');
  const [cnpj, setCnpj] = useState<string>(initialCompany?.cnpj ?? '');
  const [description, setDescription] = useState<string>(initialCompany?.description ?? '');
  const [logoUrl, setLogoUrl] = useState<string>(initialCompany?.logo_url ?? '');

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
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
    reader.onload = () => {
      setCropperRawSrc(reader.result as string);
    };
    reader.readAsDataURL(rawFile);
  }

  async function handleConfirmCrop(croppedFile: File) {
    setCropperRawSrc(null);
    setUploadingLogo(true);
    setServerError('');
    setServerSuccess('');

    try {
      const fd = new FormData();
      fd.append('file', croppedFile);

      const res = await uploadAvatarAction(fd);

      if ('error' in res) {
        setServerError(res.error);
      } else if (res.data?.publicUrl) {
        setLogoUrl(res.data.publicUrl);
        setServerSuccess('Logotipo atualizado e salvo com sucesso!');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao processar e enviar logotipo.';
      setServerError(msg);
    } finally {
      setUploadingLogo(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError('');
    setServerSuccess('');

    startTransition(async () => {
      const payload: CompanyInput = {
        id: companyId,
        name,
        tradeName,
        cnpj,
        description,
        logoUrl,
      };

      const res = await saveCompany(payload);
      if ('error' in res) {
        setServerError(res.error);
      } else {
        if (res.data?.id) setCompanyId(res.data.id);
        setServerSuccess(res.message ?? 'Empresa salva com sucesso!');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
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

      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6">
        {/* Upload de Logotipo */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-black/20 border border-white/10">
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-white/5 border border-white/20 flex items-center justify-center flex-shrink-0">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="Logo da Empresa" className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-10 h-10 text-slate-500" />
            )}
            {uploadingLogo && (
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
              htmlFor="company-logo-upload"
              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-200 text-xs font-bold transition border border-orange-500/30 hover:border-orange-500/50 shadow-sm"
            >
              <Camera className="w-4 h-4 text-orange-400" />
              {logoUrl ? 'Trocar logotipo' : 'Enviar logotipo'}
            </label>
            <input
              id="company-logo-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={handleLogoChange}
              disabled={uploadingLogo}
              className="hidden"
            />
            <div className="text-xs text-slate-400 space-y-0.5">
              <p>
                <strong className="text-slate-300">Formatos aceitos:</strong> JPG, PNG ou WebP.
              </p>
              <p className="text-[11px] text-slate-400">
                Enquadrado automaticamente em formato quadrado (1:1), redimensionado para 512px e comprimido em WebP.
              </p>
            </div>
          </div>
        </div>

        {/* Nome / Razão Social */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="name" className="block text-sm font-bold text-slate-200">
              Razão Social ou Nome Empresarial
            </label>
            <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold">Obrigatório</span>
          </div>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Marcenaria Jundiaiense Ltda"
            className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          />
        </div>

        {/* Nome Fantasia */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="tradeName" className="block text-sm font-bold text-slate-200">
              Nome Fantasia ou Marca Comercial
            </label>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-500/20 text-slate-300 font-bold">Opcional</span>
          </div>
          <input
            id="tradeName"
            type="text"
            value={tradeName}
            onChange={(e) => setTradeName(e.target.value)}
            placeholder="Ex: Studio Jundiaí Design & Móveis"
            className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          />
        </div>

        {/* CNPJ (Opcional, apenas informativo e sem selo de garantia) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="cnpj" className="block text-sm font-bold text-slate-200">
              CNPJ (Cadastro Nacional da Pessoa Jurídica)
            </label>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-500/20 text-slate-300 font-bold">Opcional</span>
          </div>
          <input
            id="cnpj"
            type="text"
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
            placeholder="00.000.000/0001-00"
            className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          />
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Aviso legal e transparência:</strong> O preenchimento do CNPJ é 100% opcional e meramente informativo. A plataforma não emite selo de &quot;CNPJ consultado&quot; ou verificado.
            </p>
          </div>
        </div>

        {/* Descrição da Empresa */}
        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-bold text-slate-200">
            Sobre a Empresa / Showroom
          </label>
          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Apresente os anos de mercado, estrutura de maquinário, tipos de madeira, equipe e especialidades da sua loja ou marcenaria..."
            className="w-full bg-black/30 border border-white/20 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none text-sm"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              Exibido no perfil da empresa
            </span>
            <span>{description.length}/800</span>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-white/10">
          <button
            type="submit"
            disabled={isPending}
            className="btn-neon px-8 py-3 text-sm flex items-center gap-2 disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando empresa...
              </>
            ) : (
              'Salvar Dados da Empresa'
            )}
          </button>
        </div>
      </div>

      {cropperRawSrc && (
        <ImageCropperModal
          imageSrc={cropperRawSrc}
          fileName={cropperFileName}
          title="Ajustar Logotipo da Empresa"
          onCancel={() => setCropperRawSrc(null)}
          onConfirm={handleConfirmCrop}
        />
      )}
    </form>
  );
}
