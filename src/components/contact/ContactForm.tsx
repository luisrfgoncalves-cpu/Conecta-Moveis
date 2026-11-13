'use client';

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createContactRequest } from '@/lib/contact/actions';
import { contactRequestSchema, type ContactRequestInput } from '@/lib/contact/schemas';

interface ContactFormProps {
  profileId: string;
  professionalName: string;
  isLoggedIn: boolean;
}

export function ContactForm({ profileId, professionalName, isLoggedIn }: ContactFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ContactRequestInput>({
    resolver: zodResolver(contactRequestSchema),
    defaultValues: { profileId, message: '' },
  });

  const messageLen = watch('message')?.length ?? 0;

  async function onSubmit(data: ContactRequestInput) {
    setServerError('');
    const res = await createContactRequest(data);
    if (res.success) {
      setSubmitted(true);
    } else {
      setServerError(res.error ?? 'Erro desconhecido.');
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="glass-panel rounded-2xl p-6 text-center space-y-3">
        <MessageCircle className="w-8 h-8 text-orange-400 mx-auto" aria-hidden />
        <p className="text-sm text-slate-300">
          Faça login para enviar uma solicitação de contato a <strong>{professionalName}</strong>.
        </p>
        <a
          href={`/entrar?next=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '')}`}
          className="btn-primary text-sm px-4 py-2 rounded-xl inline-block"
        >
          Entrar para contatar
        </a>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="glass-panel rounded-2xl p-6 text-center space-y-2">
        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
          <MessageCircle className="w-5 h-5 text-green-400" aria-hidden />
        </div>
        <p className="text-sm font-semibold text-white">Solicitação enviada!</p>
        <p className="text-xs text-slate-400">
          {professionalName} verá sua mensagem no painel. Ela ficará disponível por 90 dias.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-6 space-y-4">
      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
        <MessageCircle className="w-4 h-4 text-orange-400" aria-hidden />
        Solicitar contato
      </h3>

      {/* Aviso de privacidade obrigatório */}
      <p className="text-xs text-slate-400 bg-white/5 rounded-xl p-3 border border-white/10">
        📋 <strong>Quem verá:</strong> somente {professionalName}.<br />
        🗓️ <strong>Por quanto tempo:</strong> sua mensagem ficará guardada por <strong>90 dias</strong>, depois é apagada automaticamente.<br />
        🚫 <strong>Não inclua:</strong> preços, orçamentos, formas de pagamento ou horários.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
        <input type="hidden" {...register('profileId')} />

        <div>
          <label htmlFor="contact-message" className="block text-xs font-medium text-slate-300 mb-1">
            Sua mensagem <span aria-hidden>*</span>
          </label>
          <textarea
            id="contact-message"
            {...register('message')}
            rows={4}
            maxLength={500}
            placeholder="Olá! Vi seu perfil e gostaria de conversar sobre um projeto..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            aria-describedby={errors.message ? 'contact-message-error' : 'contact-message-hint'}
          />
          <div className="flex justify-between mt-1">
            {errors.message ? (
              <p id="contact-message-error" role="alert" className="text-xs text-red-400">
                {errors.message.message}
              </p>
            ) : (
              <span id="contact-message-hint" className="text-xs text-slate-500">
                Seja objetivo e claro.
              </span>
            )}
            <span className={`text-xs ${messageLen > 480 ? 'text-orange-400' : 'text-slate-500'}`}>
              {messageLen}/500
            </span>
          </div>
        </div>

        {serverError && (
          <p role="alert" className="text-xs text-red-400 bg-red-500/10 rounded-lg p-2 border border-red-500/20">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-primary rounded-xl py-2 text-sm font-medium disabled:opacity-50"
        >
          {isSubmitting ? 'Enviando...' : 'Enviar solicitação'}
        </button>
      </form>
    </div>
  );
}

