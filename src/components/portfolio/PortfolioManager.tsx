'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import {
  FolderPlus,
  UploadCloud,
  Trash2,
  MoveUp,
  MoveDown,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  HardDrive,
  AlertCircle,
  Loader2,
  Layers,
} from 'lucide-react';
import {
  PortfolioItemWithImages,
  PortfolioStorageSummary,
  createPortfolioProject,
  uploadPortfolioPhotos,
  reorderPortfolioPhotos,
  deletePortfolioImage,
  deletePortfolioProject,
} from '@/lib/portfolio/actions';
import { CATEGORIES_CATALOG } from '@/lib/profile/schemas';

interface PortfolioManagerProps {
  initialItems: PortfolioItemWithImages[];
  storage: PortfolioStorageSummary;
}

export function PortfolioManager({ initialItems, storage }: PortfolioManagerProps) {
  const [items, setItems] = useState<PortfolioItemWithImages[]>(initialItems);
  const [currentStorage, setCurrentStorage] = useState<PortfolioStorageSummary>(storage);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [activeUploadItemId, setActiveUploadItemId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form states for new project
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectCategory, setProjectCategory] = useState('');
  const [authorshipDeclaration, setAuthorshipDeclaration] = useState(false);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDemoUpload, setIsDemoUpload] = useState(false);

  // Helper para redimensionamento e compressão cliente para WebP (alvo max 1600 px e até 400 KB)
  const compressClientImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const maxDim = 1600;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
          }

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), {
                  type: 'image/webp',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            'image/webp',
            0.82
          );
        };
        img.onerror = () => resolve(file);
      };
      reader.onerror = () => resolve(file);
    });
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('title', projectTitle);
    formData.append('description', projectDesc);
    formData.append('category_id', projectCategory);
    formData.append('authorship_declaration', String(authorshipDeclaration));

    const res = await createPortfolioProject(formData);
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Erro ao criar projeto.');
      return;
    }

    setSuccessMessage('Projeto criado com sucesso! Agora você pode enviar as fotos.');
    setIsCreatingProject(false);
    setProjectTitle('');
    setProjectDesc('');
    setProjectCategory('');
    setAuthorshipDeclaration(false);

    // Atualizar lista local
    if (res.itemId) {
      setItems([
        {
          id: res.itemId,
          title: projectTitle,
          description: projectDesc || null,
          category_id: projectCategory || null,
          created_at: new Date().toISOString(),
          images: [],
        },
        ...items,
      ]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, itemId: string) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    // Validação de cota
    if (currentStorage.totalPhotos + selectedFiles.length > currentStorage.maxPhotos) {
      setErrorMessage(
        `Limite de fotos atingido! Você possui ${currentStorage.totalPhotos} fotos e pode enviar no máximo ${
          currentStorage.maxPhotos - currentStorage.totalPhotos
        } foto(s) adicional(is). Limite total do plano: ${currentStorage.maxPhotos} fotos.`
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setActiveUploadItemId(itemId);
    setUploadProgress(20);

    const formData = new FormData();
    formData.append('itemId', itemId);
    formData.append('is_demo', String(isDemoUpload));

    // Compressão cliente
    setUploadProgress(40);
    for (let i = 0; i < selectedFiles.length; i++) {
      const compressed = await compressClientImage(selectedFiles[i]);
      formData.append('files', compressed);
    }

    setUploadProgress(70);
    const res = await uploadPortfolioPhotos(formData);
    setUploadProgress(100);
    setActiveUploadItemId(null);

    if (fileInputRef.current) fileInputRef.current.value = '';

    if (!res.success) {
      setErrorMessage(res.error || 'Falha ao enviar fotos.');
      setUploadProgress(null);
      return;
    }

    setSuccessMessage(`${res.uploadedCount || selectedFiles.length} foto(s) enviada(s) para moderação!`);
    setTimeout(() => setUploadProgress(null), 1000);

    // Recarregar a página para atualizar o estado completo
    window.location.reload();
  };

  const handleMoveImage = async (itemId: string, imageIndex: number, direction: 'up' | 'down') => {
    const targetItem = items.find((i) => i.id === itemId);
    if (!targetItem) return;

    const newImages = [...targetItem.images];
    const targetIndex = direction === 'up' ? imageIndex - 1 : imageIndex + 1;

    if (targetIndex < 0 || targetIndex >= newImages.length) return;

    // Troca de posição
    const temp = newImages[imageIndex];
    newImages[imageIndex] = newImages[targetIndex];
    newImages[targetIndex] = temp;

    // Atualização otimista
    const updatedItems = items.map((it) => (it.id === itemId ? { ...it, images: newImages } : it));
    setItems(updatedItems);

    await reorderPortfolioPhotos(
      itemId,
      newImages.map((img) => img.id)
    );
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Deseja realmente excluir esta foto? Os arquivos serão removidos do armazenamento.')) {
      return;
    }

    setLoading(true);
    const res = await deletePortfolioImage(imageId);
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Falha ao excluir foto.');
      return;
    }

    // Atualização local
    const updatedItems = items.map((it) => ({
      ...it,
      images: it.images.filter((img) => img.id !== imageId),
    }));
    setItems(updatedItems);
    setCurrentStorage((prev) => ({
      ...prev,
      totalPhotos: Math.max(0, prev.totalPhotos - 1),
      canUploadMore: true,
    }));
    setSuccessMessage('Foto excluída com sucesso.');
  };

  const handleDeleteProject = async (itemId: string) => {
    if (!confirm('Tem certeza de que deseja excluir este projeto e todas as suas fotos? Esta ação é irreversível.')) {
      return;
    }

    setLoading(true);
    const res = await deletePortfolioProject(itemId);
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Falha ao excluir projeto.');
      return;
    }

    setItems(items.filter((it) => it.id !== itemId));
    setSuccessMessage('Projeto excluído com sucesso.');
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <div className="space-y-8">
      {/* Barra de Resumo de Armazenamento e Cota */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Uso de Armazenamento do Perfil
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Fotos ativas e pendentes: <strong className="text-white">{currentStorage.totalPhotos}</strong> de{' '}
              <strong className="text-white">{currentStorage.maxPhotos}</strong> fotos (Limite provisório)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 self-stretch sm:self-auto justify-between sm:justify-end">
          <div className="text-right">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Tamanho Total
            </span>
            <span className="text-sm font-extrabold text-orange-400">
              {currentStorage.storageFormatted}
            </span>
          </div>

          <button
            type="button"
            disabled={!currentStorage.canUploadMore}
            onClick={() => setIsCreatingProject(!isCreatingProject)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition ${
              currentStorage.canUploadMore
                ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20'
                : 'bg-white/10 text-slate-500 cursor-not-allowed border border-white/10'
            }`}
          >
            <FolderPlus className="w-4 h-4" />
            <span>Novo Projeto</span>
          </button>
        </div>
      </div>

      {/* Avisos e Feedbacks */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-emerald-300 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Formulário de Criação de Projeto */}
      {isCreatingProject && (
        <form
          onSubmit={handleCreateProject}
          className="glass-card rounded-2xl p-6 border border-orange-500/30 space-y-5 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-orange-400" />
              Criar Novo Projeto de Portfólio
            </h3>
            <button
              type="button"
              onClick={() => setIsCreatingProject(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Título do Projeto *
              </label>
              <input
                type="text"
                required
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="Ex: Cozinha Planejada em MDF Carvalho"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/20 text-white placeholder:text-slate-500 text-sm focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Categoria Relacionada (Opcional)
              </label>
              <select
                value={projectCategory}
                onChange={(e) => setProjectCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/20 text-white text-sm focus:border-orange-500 focus:outline-none"
              >
                <option value="">Selecione uma categoria</option>
                {CATEGORIES_CATALOG.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Descrição do Trabalho (Opcional)
            </label>
            <textarea
              rows={3}
              value={projectDesc}
              onChange={(e) => setProjectDesc(e.target.value)}
              placeholder="Descreva detalhes como ferragens utilizadas, tipo de MDF, prazo de execução..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/20 text-white placeholder:text-slate-500 text-sm focus:border-orange-500 focus:outline-none"
            />
          </div>

          {/* Declaração Obrigatória de Autoria */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={authorshipDeclaration}
                onChange={(e) => setAuthorshipDeclaration(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-white/20 text-orange-500 focus:ring-orange-500 bg-slate-950"
              />
              <span className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-white">Declaração Obrigatória de Autoria:</strong> Declaro sob
                as penas da lei que todas as imagens enviadas neste projeto são de minha própria autoria
                profissional ou possuo autorização formal de divulgação concedida pelos clientes e
                proprietários.
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreatingProject(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !authorshipDeclaration}
              className="px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-orange-500 hover:bg-orange-600 text-white transition disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Criar Projeto'}
            </button>
          </div>
        </form>
      )}

      {/* Lista de Projetos e Fotos */}
      {items.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-white/10 space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
            <Layers className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-white">Nenhum projeto cadastrado no portfólio</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Cadastre seu primeiro projeto acima e adicione até 6 fotos com boa iluminação para atrair
            clientes em Jundiaí e região.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="glass-card rounded-2xl p-6 border border-white/10 space-y-6 relative overflow-hidden"
            >
              {/* Cabeçalho do Projeto */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <h4 className="text-lg font-bold text-white">{item.title}</h4>
                  {item.description && (
                    <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {/* Botão de Upload de Fotos */}
                  <label
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer ${
                      currentStorage.canUploadMore
                        ? 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30'
                        : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Adicionar Fotos</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      disabled={!currentStorage.canUploadMore || activeUploadItemId === item.id}
                      onChange={(e) => handleFileSelect(e, item.id)}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => handleDeleteProject(item.id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                    title="Excluir projeto e fotos"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Barra de Progresso de Upload */}
              {activeUploadItemId === item.id && uploadProgress !== null && (
                <div className="space-y-2 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                  <div className="flex items-center justify-between text-xs text-orange-300">
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Comprimindo e enviando fotos para moderação...
                    </span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Opção de Marcar como Demonstração */}
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <input
                  type="checkbox"
                  id={`demo-${item.id}`}
                  checked={isDemoUpload}
                  onChange={(e) => setIsDemoUpload(e.target.checked)}
                  className="rounded border-white/20 text-orange-500 focus:ring-orange-500 bg-slate-950"
                />
                <label htmlFor={`demo-${item.id}`} className="cursor-pointer">
                  Marcar próximos envios como <span className="text-purple-300">Projeto Conceito / Demonstração</span>
                </label>
              </div>

              {/* Grade de Fotos do Projeto */}
              {item.images.length === 0 ? (
                <div className="p-8 rounded-xl bg-white/5 border border-dashed border-white/10 text-center text-xs text-slate-400">
                  Nenhuma foto anexada a este projeto ainda. Clique em &quot;Adicionar Fotos&quot; acima.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {item.images.map((img, idx) => (
                    <div
                      key={img.id}
                      className="group relative rounded-xl overflow-hidden border border-white/10 bg-slate-950 flex flex-col"
                    >
                      {/* Thumbnail com fallback */}
                      <div className="relative aspect-square w-full">
                        <Image
                          src={img.thumb_url || img.image_url}
                          alt={`Foto ${idx + 1}`}
                          fill
                          className="object-cover"
                          loading="lazy"
                        />

                        {/* Badges de Status e Demonstração */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                          {img.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/90 text-slate-950 backdrop-blur-md">
                              <Clock className="w-2.5 h-2.5" />
                              Em análise
                            </span>
                          )}
                          {img.status === 'approved' && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/90 text-slate-950 backdrop-blur-md">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Aprovada
                            </span>
                          )}
                          {img.status === 'rejected' && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/90 text-white backdrop-blur-md">
                              <XCircle className="w-2.5 h-2.5" />
                              Recusada
                            </span>
                          )}
                          {img.is_demo && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/90 text-white backdrop-blur-md">
                              <Sparkles className="w-2.5 h-2.5" />
                              Demo
                            </span>
                          )}
                        </div>

                        {/* Botão de Excluir Foto */}
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(img.id)}
                          className="absolute top-2 right-2 p-1 rounded-md bg-black/60 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition z-10"
                          title="Excluir foto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Controles de Ordenação e Bytes */}
                      <div className="p-2 flex items-center justify-between bg-slate-900 border-t border-white/5 text-[10px] text-slate-400">
                        <span>{(img.bytes_size / 1024).toFixed(0)} KB</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveImage(item.id, idx, 'up')}
                            className="p-0.5 rounded hover:bg-white/10 disabled:opacity-30"
                            title="Mover para esquerda"
                          >
                            <MoveUp className="w-3 h-3 rotate-[-90deg]" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === item.images.length - 1}
                            onClick={() => handleMoveImage(item.id, idx, 'down')}
                            className="p-0.5 rounded hover:bg-white/10 disabled:opacity-30"
                            title="Mover para direita"
                          >
                            <MoveDown className="w-3 h-3 rotate-[-90deg]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

