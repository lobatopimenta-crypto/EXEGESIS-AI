import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Sparkles, Clock, ArrowRight, AlertCircle, Quote, Filter, X, Info, Save, RotateCcw, Library, ScrollText } from 'lucide-react';
import { StudyRequest, Translation, Depth, HistoryItem, StudyMode } from '../types';

interface InputFormProps {
  onSubmit: (data: StudyRequest) => void;
  isLoading: boolean;
  history: HistoryItem[];
  onHistorySelect: (item: StudyRequest) => void;
}

// Simple internal database of verses for the "Daily Verse" feature
const DAILY_VERSES = [
  { text: "Lâmpada para os meus pés é tua palavra, e luz para o meu caminho.", ref: "Salmos 119:105" },
  { text: "Porque a palavra de Deus é viva e eficaz, e mais penetrante do que espada alguma de dois gumes.", ref: "Hebreus 4:12" },
  { text: "Seca-se a erva, e cai a flor, porém a palavra de nosso Deus subsiste eternamente.", ref: "Isaías 40:8" },
  { text: "Toda a Escritura é divinamente inspirada, e proveitosa para ensinar, para redargüir, para corrigir, para instruir em justiça.", ref: "2 Timóteo 3:16" },
  { text: "Não se aparte da tua boca o livro desta lei; antes medita nele dia e noite.", ref: "Josué 1:8" },
  { text: "Examinais as Escrituras, porque vós cuidais ter nelas a vida eterna, e são elas que de mim testificam.", ref: "João 5:39" },
];

const DRAFT_KEY = 'exegesis_draft';

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading, history, onHistorySelect }) => {
  const [mode, setMode] = useState<StudyMode>('passage');
  const [passage, setPassage] = useState('');
  const [translation, setTranslation] = useState<Translation>('NVI');
  const [depth, setDepth] = useState<Depth>('detalhado');
  const [verse, setVerse] = useState(DAILY_VERSES[0]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [draftAvailable, setDraftAvailable] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  
  // History Filter State
  const [historyFilter, setHistoryFilter] = useState('');

  useEffect(() => {
    // Pick a random verse on mount
    const randomIndex = Math.floor(Math.random() * DAILY_VERSES.length);
    setVerse(DAILY_VERSES[randomIndex]);

    // Check for draft
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
        setDraftAvailable(true);
    }
  }, []);

  // Validation logic
  const validatePassage = (input: string): boolean => {
    if (!input.trim()) return false;
    
    if (mode === 'passage') {
        const bibleRegex = /^\s*(?:\d\s*)?[a-zA-ZÀ-ÿ\.]+\s+\d+(?:[:\.]\d+(?:-\d+)?)?\s*$/;
        if (!bibleRegex.test(input)) {
            setValidationError("Formato inválido. Use: Livro Capítulo:Versículo (ex: Mateus 3:11, 1 Jo 1:9)");
            return false;
        }
    } else {
        // Book mode validation - just check if it has text, maybe at least 3 chars
        if (input.length < 3) {
            setValidationError("Por favor, digite o nome completo do livro.");
            return false;
        }
    }
    
    setValidationError(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!passage.trim()) {
        setValidationError(mode === 'passage' ? "Por favor, insira uma passagem bíblica." : "Por favor, insira o nome do livro.");
        return;
    }

    if (!validatePassage(passage)) {
        return;
    }

    onSubmit({ passage, translation, depth, mode });
  };

  const handleSaveDraft = () => {
      const draftData = { passage, translation, depth, mode };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
      setDraftAvailable(true);
      setShowSaveConfirm(true);
      setTimeout(() => setShowSaveConfirm(false), 2000);
  };

  const handleLoadDraft = () => {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
          try {
              const { passage: p, translation: t, depth: d, mode: m } = JSON.parse(savedDraft);
              setPassage(p);
              setTranslation(t);
              setDepth(d);
              if (m) setMode(m);
              setValidationError(null);
          } catch (e) {
              console.error("Failed to load draft", e);
          }
      }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassage(e.target.value);
    if (validationError) setValidationError(null); // Clear error on type
  };

  const handleHistoryClick = (item: HistoryItem) => {
    setPassage(item.passage);
    setTranslation(item.translation);
    setDepth(item.depth);
    setMode(item.mode || 'passage'); // Fallback for old history items
    setValidationError(null);
    onHistorySelect(item);
  };

  // Filter History Logic
  const filteredHistory = history.filter(item => {
    const search = historyFilter.toLowerCase();
    return (
        item.passage.toLowerCase().includes(search) ||
        item.translation.toLowerCase().includes(search)
    );
  });

  return (
    <div className="w-full max-w-3xl mx-auto font-sans transition-colors duration-300">
      {/* Header Minimalista e Elegante */}
      <div className="text-center mb-8 space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white dark:bg-night-800 mb-2 shadow-soft dark:shadow-none border dark:border-night-700">
          <BookOpen className="w-8 h-8 text-royal-950 dark:text-gold-500" />
        </div>
        <h1 className="text-4xl font-serif font-bold text-royal-950 dark:text-night-100 tracking-tight">Exegesis AI</h1>
        <p className="text-royal-500 dark:text-night-400 max-w-lg mx-auto font-light text-lg font-sans">
          Assistente de teologia para análise bíblica sistemática, léxica e histórica.
        </p>
      </div>

      {/* Versículo do Dia - Card Elegante */}
      <div className="mb-10 mx-4 md:mx-0 relative">
        <div className="bg-royal-950 dark:bg-night-900 rounded-2xl p-6 md:p-8 text-center shadow-soft relative overflow-hidden group transition-all hover:shadow-xl dark:border dark:border-night-700">
             {/* Decorative Quotes */}
            <Quote className="absolute top-4 left-4 w-10 h-10 text-royal-800 dark:text-night-700 opacity-50 rotate-180" />
            <div className="relative z-10">
                <p className="text-royal-50 dark:text-night-200 font-serif text-lg md:text-xl italic leading-relaxed mb-4 text-justify hyphens-auto md:text-center">
                    "{verse.text}"
                </p>
                <div className="inline-block px-3 py-1 border border-royal-800 dark:border-night-700 rounded-full text-gold-400 text-xs font-semibold tracking-wider uppercase font-sans">
                    {verse.ref}
                </div>
            </div>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-night-800/60 backdrop-blur-xl rounded-3xl shadow-soft dark:shadow-none border border-white/50 dark:border-night-700 overflow-hidden relative transition-colors duration-300">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-night-900/80 z-20 flex flex-col items-center justify-center backdrop-blur-sm">
            <div className="w-10 h-10 border-4 border-royal-100 dark:border-night-700 border-t-royal-800 dark:border-t-gold-500 rounded-full animate-spin mb-4"></div>
            <p className="text-royal-600 dark:text-gold-400 font-medium animate-pulse font-sans">Analisando textos sagrados...</p>
          </div>
        )}
        
        {/* Mode Selector Tabs */}
        <div className="flex border-b border-royal-100 dark:border-night-700">
            <button
                onClick={() => setMode('passage')}
                className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors ${mode === 'passage' ? 'bg-white/50 dark:bg-night-800 text-royal-600 dark:text-gold-400 border-b-2 border-royal-600 dark:border-gold-500' : 'text-royal-400 dark:text-night-400 hover:text-royal-600 dark:hover:text-night-200 hover:bg-royal-50 dark:hover:bg-night-700'}`}
            >
                <ScrollText className="w-4 h-4" />
                Análise de Passagem
            </button>
            <button
                onClick={() => setMode('book')}
                className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors ${mode === 'book' ? 'bg-white/50 dark:bg-night-800 text-royal-600 dark:text-gold-400 border-b-2 border-royal-600 dark:border-gold-500' : 'text-royal-400 dark:text-night-400 hover:text-royal-600 dark:hover:text-night-200 hover:bg-royal-50 dark:hover:bg-night-700'}`}
            >
                <Library className="w-4 h-4" />
                Conhecendo o Livro
            </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
            {/* Draft Notification */}
            {draftAvailable && !passage && (
                <div className="flex items-center justify-between p-3 bg-gold-50 dark:bg-yellow-900/20 border border-gold-200 dark:border-yellow-900/50 rounded-lg animate-fadeIn text-sm">
                    <div className="flex items-center gap-2 text-gold-800 dark:text-gold-400">
                        <Save className="w-4 h-4" />
                        <span>Há um rascunho salvo anteriormente.</span>
                    </div>
                    <button 
                        type="button"
                        onClick={handleLoadDraft}
                        className="px-3 py-1 bg-white dark:bg-night-800 border border-gold-200 dark:border-night-600 text-gold-700 dark:text-gold-400 rounded-md hover:bg-gold-50 dark:hover:bg-night-700 transition-colors text-xs font-bold uppercase tracking-wide flex items-center gap-1"
                    >
                        <RotateCcw className="w-3 h-3" /> Restaurar
                    </button>
                </div>
            )}

          <div>
            <label className="block text-xs font-semibold text-royal-400 dark:text-night-400 uppercase tracking-wider mb-2 ml-1 font-sans">
              {mode === 'passage' ? 'Passagem Bíblica' : 'Nome do Livro'}
            </label>
            <div className="relative group">
              <input
                type="text"
                value={passage}
                onChange={handleInputChange}
                onBlur={() => passage && validatePassage(passage)}
                placeholder={mode === 'passage' ? "Ex: Mateus 3:11, Romanos 8:28..." : "Ex: Gênesis, Isaías, Romanos..."}
                className={`w-full pl-12 pr-4 py-4 bg-white/50 dark:bg-night-900/50 border rounded-xl focus:ring-2 transition-all text-xl font-sans placeholder-royal-300 dark:placeholder-night-600 text-royal-950 dark:text-night-100 shadow-inner
                    ${validationError 
                        ? 'border-red-300 focus:border-red-400 focus:ring-red-100 bg-red-50/30 dark:bg-red-900/10' 
                        : 'border-royal-100 dark:border-night-700 focus:ring-gold-400 focus:border-gold-400'
                    }`}
                disabled={isLoading}
              />
              <Search className={`absolute left-4 top-5 w-6 h-6 transition-colors ${validationError ? 'text-red-400' : 'text-royal-300 dark:text-night-400 group-focus-within:text-royal-600 dark:group-focus-within:text-gold-400'}`} />
            </div>
            {validationError && (
                <div className="flex items-center gap-2 mt-2 ml-1 text-red-500 dark:text-red-400 text-sm animate-fadeIn font-sans">
                    <AlertCircle className="w-4 h-4" />
                    <span>{validationError}</span>
                </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-royal-400 dark:text-night-400 uppercase tracking-wider mb-2 ml-1 font-sans">
                Versão / Tradução
              </label>
              <div className="relative">
                <select
                  value={translation}
                  onChange={(e) => setTranslation(e.target.value as Translation)}
                  className="w-full p-3.5 bg-white/50 dark:bg-night-900/50 border border-royal-100 dark:border-night-700 rounded-xl focus:ring-2 focus:ring-gold-400 focus:border-gold-400 focus:bg-white dark:focus:bg-night-800 appearance-none text-royal-800 dark:text-night-200 font-medium cursor-pointer hover:bg-white dark:hover:bg-night-800 transition-colors font-sans"
                  disabled={isLoading}
                >
                  <optgroup label="Português" className="dark:bg-night-800">
                    <option value="NVI">Nova Versão Internacional (NVI)</option>
                    <option value="NVT">Nova Versão Transformadora (NVT)</option>
                    <option value="NAA">Nova Almeida Atualizada (NAA)</option>
                    <option value="KJA">King James Atualizada (KJA)</option>
                    <option value="ARC">Almeida Revista e Corrigida (ARC)</option>
                    <option value="ACF">Almeida Corrigida Fiel (ACF)</option>
                  </optgroup>
                  <optgroup label="Inglês" className="dark:bg-night-800">
                    <option value="NIV">New International Version (NIV)</option>
                    <option value="ESV">English Standard Version (ESV)</option>
                    <option value="KJV">King James Version (KJV)</option>
                  </optgroup>
                </select>
                <div className="absolute right-4 top-4 pointer-events-none">
                  <ArrowRight className="w-4 h-4 text-royal-300 dark:text-night-400 rotate-90" />
                </div>
              </div>
            </div>

            <div className={mode === 'book' ? 'opacity-50 pointer-events-none' : ''}>
              <label className="flex items-center text-xs font-semibold text-royal-400 dark:text-night-400 uppercase tracking-wider mb-2 ml-1 font-sans">
                Profundidade do Estudo
                
                {/* Tooltip Info */}
                <div className="relative group ml-1.5 cursor-help" aria-label="Informações sobre os níveis de estudo">
                    <Info className="w-3.5 h-3.5 text-royal-300 dark:text-night-400 hover:text-royal-500 dark:hover:text-gold-400 transition-colors" />
                    
                    {/* Tooltip Content */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-royal-900 dark:bg-night-900 text-white text-xs rounded-lg p-3 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none text-left leading-relaxed border border-royal-800 dark:border-night-700 font-sans">
                        <div className="space-y-2">
                            <p><span className="text-gold-400 font-bold">Rápido:</span> Devocional, conciso e inspirador. Ideal para leitura diária.</p>
                            <p><span className="text-gold-400 font-bold">Detalhado:</span> Equilíbrio entre contexto histórico e aplicação prática. Ótimo para grupos.</p>
                            <p><span className="text-gold-400 font-bold">Acadêmico:</span> Exegese técnica, línguas originais e debate teológico profundo.</p>
                            <p><span className="text-gold-400 font-bold">Sermão:</span> Gera um esboço homilético completo, estruturado para pregação.</p>
                        </div>
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-royal-900 dark:border-t-night-900"></div>
                    </div>
                </div>
              </label>
              <div className="relative">
                <select
                  value={depth}
                  onChange={(e) => setDepth(e.target.value as Depth)}
                  className="w-full p-3.5 bg-white/50 dark:bg-night-900/50 border border-royal-100 dark:border-night-700 rounded-xl focus:ring-2 focus:ring-gold-400 focus:border-gold-400 focus:bg-white dark:focus:bg-night-800 appearance-none text-royal-800 dark:text-night-200 font-medium cursor-pointer hover:bg-white dark:hover:bg-night-800 transition-colors font-sans"
                  disabled={isLoading}
                >
                  <option value="rapido" className="dark:bg-night-800">Rápido (Devocional & Breve)</option>
                  <option value="detalhado" className="dark:bg-night-800">Detalhado (Estudo & Grupo)</option>
                  <option value="academico" className="dark:bg-night-800">Acadêmico (Exegese & Grego)</option>
                  <option value="sermao" className="dark:bg-night-800">Sermão Expositivo (Pregação Pronta)</option>
                </select>
                <div className="absolute right-4 top-4 pointer-events-none">
                  <ArrowRight className="w-4 h-4 text-royal-300 dark:text-night-400 rotate-90" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
                type="button"
                onClick={handleSaveDraft}
                className="px-6 py-4 rounded-xl flex items-center justify-center space-x-2 font-semibold text-lg transition-all border border-royal-100 dark:border-night-600 hover:bg-white dark:hover:bg-night-700 text-royal-600 dark:text-night-200 shadow-sm hover:shadow-md font-sans w-auto"
                title="Salvar como rascunho para continuar depois"
                disabled={isLoading}
            >
                {showSaveConfirm ? (
                    <span className="text-green-600 dark:text-green-400 text-sm animate-fadeIn">Salvo!</span>
                ) : (
                    <Save className="w-5 h-5" />
                )}
            </button>

            <button
                type="submit"
                disabled={isLoading}
                className={`flex-1 py-4 rounded-xl flex items-center justify-center space-x-2 font-semibold text-lg transition-all transform hover:-translate-y-0.5 shadow-lg font-sans ${
                isLoading
                    ? 'bg-royal-200 dark:bg-night-700 text-royal-400 dark:text-night-400 cursor-not-allowed shadow-none'
                    : 'bg-royal-950 dark:bg-gold-600 text-white hover:bg-royal-900 dark:hover:bg-gold-700 shadow-royal-900/20'
                }`}
            >
                <Sparkles className="w-5 h-5 text-gold-400 dark:text-white" />
                <span>{mode === 'passage' ? 'Gerar Estudo' : 'Gerar Introdução'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Histórico Recente */}
      {history.length > 0 && (
        <div className="mt-12 animate-fadeIn pb-12">
            {/* Header com Filtro */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 px-2">
                <div className="flex items-center gap-2 text-royal-400 dark:text-night-400">
                    <Clock className="w-4 h-4" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider font-sans">Histórico Recente</h3>
                </div>
                
                {/* Search / Filter Input */}
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Filtrar histórico..."
                        value={historyFilter}
                        onChange={(e) => setHistoryFilter(e.target.value)}
                        className="pl-8 pr-8 py-1.5 bg-white/50 dark:bg-night-800/50 border border-transparent dark:border-night-700 rounded-lg text-sm text-royal-800 dark:text-night-200 placeholder-royal-300 dark:placeholder-night-600 focus:ring-2 focus:ring-royal-200 dark:focus:ring-night-600 focus:bg-white dark:focus:bg-night-800 transition-all w-full sm:w-48 font-sans"
                    />
                    <Filter className="absolute left-2.5 top-2 w-3.5 h-3.5 text-royal-300 dark:text-night-400" />
                    {historyFilter && (
                        <button 
                            onClick={() => setHistoryFilter('')}
                            className="absolute right-2 top-2 text-royal-300 hover:text-royal-500 dark:text-night-400 dark:hover:text-night-200"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredHistory.length > 0 ? (
                filteredHistory.map((item, index) => (
                <button
                    key={index}
                    onClick={() => handleHistoryClick(item)}
                    disabled={isLoading}
                    className="flex items-center justify-between p-4 bg-white/80 dark:bg-night-800/80 border border-white dark:border-night-700 rounded-xl hover:border-royal-200 dark:hover:border-gold-500/50 hover:shadow-md transition-all text-left group shadow-sm"
                >
                    <div>
                    <div className="flex items-center gap-2 mb-1">
                        {item.mode === 'book' ? <Library className="w-3 h-3 text-gold-500" /> : <ScrollText className="w-3 h-3 text-royal-500 dark:text-night-400" />}
                        <span className="text-[10px] font-bold uppercase text-royal-400 dark:text-night-400">{item.mode === 'book' ? 'Introdução ao Livro' : 'Análise'}</span>
                    </div>
                    <div className="font-serif font-bold text-royal-900 dark:text-night-100 text-lg">{item.passage}</div>
                    <div className="text-xs text-royal-500 dark:text-night-400 mt-1 flex gap-2 font-sans">
                        <span className="bg-royal-50 dark:bg-night-700 px-1.5 py-0.5 rounded text-royal-600 dark:text-night-200 border border-royal-100 dark:border-night-600">{item.translation}</span>
                        {item.mode !== 'book' && <span className="capitalize">{item.depth === 'sermao' ? 'Sermão' : item.depth}</span>}
                    </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-royal-200 dark:text-night-400 group-hover:text-royal-500 dark:group-hover:text-gold-500 transition-colors" />
                </button>
                ))
            ) : (
                <div className="col-span-2 text-center py-6 text-royal-400 dark:text-night-400 italic bg-white/50 dark:bg-night-800/30 rounded-xl border border-dashed border-royal-200 dark:border-night-700 font-sans">
                    Nenhum estudo encontrado para "{historyFilter}"
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InputForm;