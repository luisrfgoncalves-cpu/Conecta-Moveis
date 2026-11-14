'use client';

import { useState, useTransition, useRef } from 'react';
import { Search, Tags, ChevronDown, X } from 'lucide-react';
import { autocompleteSpecialties, autocompleteCities } from '@/lib/search/actions';
import type { AutocompleteItem, CityAutocompleteItem } from '@/lib/search/schemas';

interface SearchBarProps {
  initialTermo?: string;
  initialCidade?: string;
  initialUf?: string;
  onSearch: (params: { termo: string; cidade: string; uf: string }) => void;
}

export function SearchBar({ initialTermo = '', initialCidade = '', initialUf = '', onSearch }: SearchBarProps) {
  const [termo, setTermo] = useState(initialTermo);
  const [cidade, setCidade] = useState(initialCidade);
  const [uf, setUf] = useState(initialUf);
  const [specSuggestions, setSpecSuggestions] = useState<AutocompleteItem[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<CityAutocompleteItem[]>([]);
  const [isPending, startTransition] = useTransition();
  const specTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleTermoChange(val: string) {
    setTermo(val);
    if (specTimer.current) clearTimeout(specTimer.current);
    if (val.length < 2) { setSpecSuggestions([]); return; }
    // Rate-limit: debounce 300 ms
    specTimer.current = setTimeout(() => {
      startTransition(async () => {
        const results = await autocompleteSpecialties(val);
        setSpecSuggestions(results);
      });
    }, 300);
  }

  function handleCidadeChange(val: string) {
    setCidade(val);
    if (cityTimer.current) clearTimeout(cityTimer.current);
    if (val.length < 2) { setCitySuggestions([]); return; }
    cityTimer.current = setTimeout(() => {
      startTransition(async () => {
        const results = await autocompleteCities(val, uf || undefined);
        setCitySuggestions(results);
      });
    }, 300);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSpecSuggestions([]);
    setCitySuggestions([]);
    onSearch({ termo, cidade, uf });
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Campo de termo com autocomplete de especialidades */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            value={termo}
            onChange={(e) => handleTermoChange(e.target.value)}
            placeholder="Ex: marceneiro, montador, planejados…"
            className="w-full pl-9 pr-8 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="off"
          />
          {termo && (
            <button
              type="button"
              onClick={() => { setTermo(''); setSpecSuggestions([]); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Limpar busca"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          {/* Dropdown de autocomplete de especialidades */}
          {specSuggestions.length > 0 && (
            <ul className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border rounded-lg shadow-lg max-h-56 overflow-y-auto text-sm">
              {specSuggestions.map((s) => (
                <li key={s.slug}>
                  <button
                    type="button"
                    className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50 text-left"
                    onClick={() => { setTermo(s.name); setSpecSuggestions([]); }}
                  >
                    <Tags className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <span>{s.name}</span>
                    {s.category_name && (
                      <span className="ml-auto text-gray-400 text-xs">{s.category_name}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Campo de cidade com autocomplete */}
        <div className="relative sm:w-52">
          <input
            type="text"
            value={cidade}
            onChange={(e) => handleCidadeChange(e.target.value)}
            placeholder="Cidade"
            className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="off"
          />
          {citySuggestions.length > 0 && (
            <ul className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto text-sm">
              {citySuggestions.map((c) => (
                <li key={`${c.city}-${c.state}`}>
                  <button
                    type="button"
                    className="flex items-center justify-between w-full px-3 py-2 hover:bg-gray-50 text-left"
                    onClick={() => { setCidade(c.city); setUf(c.state); setCitySuggestions([]); }}
                  >
                    <span>{c.city}</span>
                    <span className="text-gray-400 text-xs">{c.state}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* UF */}
        <div className="relative sm:w-24">
          <select
            value={uf}
            onChange={(e) => setUf(e.target.value)}
            className="w-full appearance-none px-3 py-2.5 pr-7 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">UF</option>
            {['SP','RJ','MG','RS','PR','SC','BA','GO','DF','PE','CE','AM','PA','MT','MS','ES','RN','PB','AL','PI','MA','SE','RO','TO','AC','AP','RR'].map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          {isPending ? 'Buscando…' : 'Buscar'}
        </button>
      </div>
    </form>
  );
}

