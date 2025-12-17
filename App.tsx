import React, { useState, useEffect, useRef } from 'react';
import InputForm from './components/InputForm';
import StudyViewer from './components/StudyViewer';
import { StudyRequest, StudyData, HistoryItem, Translation, Depth } from './types';
import { generateStudy } from './services/geminiService';
import { AlertCircle, Loader2, Moon, Sun } from 'lucide-react';

// Mensagens rotativas para o loading
const LOADING_MESSAGES = [
  "Consultando os textos originais...",
  "Analisando o contexto histórico...",
  "Verificando léxicos gregos e hebraicos...",
  "Sintetizando visões teológicas...",
  "Estruturando o esboço do sermão...",
  "Formatando referências cruzadas...",
  "Aplicando hermenêutica..."
];

const App: React.FC = () => {
  const [currentStudy, setCurrentStudy] = useState<StudyData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const hasCheckedUrl = useRef(false);

  // Theme Management
  useEffect(() => {
    const savedTheme = localStorage.getItem('exegesis_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
    } else {
        setIsDarkMode(false);
        document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      localStorage.setItem('exegesis_theme', newMode ? 'dark' : 'light');
      
      if (newMode) {
          document.documentElement.classList.add('dark');
      } else {
          document.documentElement.classList.remove('dark');
      }
  };

  // Load history
  useEffect(() => {
    const savedHistory = localStorage.getItem('exegesis_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Cycle loading messages
  useEffect(() => {
    let interval: any;
    if (isLoading) {
        let i = 0;
        setLoadingMsg(LOADING_MESSAGES[0]);
        interval = setInterval(() => {
            i = (i + 1) % LOADING_MESSAGES.length;
            setLoadingMsg(LOADING_MESSAGES[i]);
        }, 2500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Check URL parameters
  useEffect(() => {
    if (hasCheckedUrl.current) return;
    hasCheckedUrl.current = true;

    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    const trans = params.get('trans') as Translation;
    const depth = params.get('depth') as Depth;

    if (ref) {
      window.history.replaceState({}, '', window.location.pathname);
      handleCreateStudy({
        passage: decodeURIComponent(ref),
        translation: trans || 'NVI',
        depth: depth || 'detalhado',
        mode: 'passage'
      });
    }
  }, []);

  const addToHistory = (request: StudyRequest) => {
    const newItem: HistoryItem = { ...request, timestamp: Date.now() };
    setHistory(prev => {
      const filtered = prev.filter(item => 
        !(item.passage === newItem.passage && item.translation === newItem.translation)
      );
      const newHistory = [newItem, ...filtered].slice(0, 10);
      localStorage.setItem('exegesis_history', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const handleCreateStudy = async (request: StudyRequest) => {
    setIsLoading(true);
    setError(null);
    addToHistory(request);

    try {
      const data = await generateStudy(request);
      setCurrentStudy(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocorreu um erro ao gerar o estudo. Verifique sua conexão.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setCurrentStudy(null);
    setError(null);
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-bible-50 to-white dark:from-night-950 dark:to-night-900 text-royal-neutral dark:text-night-200 font-sans relative transition-colors duration-300">
      {/* Theme Toggle Button - Moved to Bottom Right */}
      <button 
        onClick={toggleTheme}
        className="fixed bottom-6 right-6 z-[100] p-3 rounded-full bg-white/90 dark:bg-night-800/90 backdrop-blur shadow-lg border border-royal-100 dark:border-night-700 text-royal-600 dark:text-gold-400 hover:scale-105 transition-all hover:shadow-xl"
        title={isDarkMode ? "Modo Claro" : "Modo Escuro"}
      >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Assinatura Celpf Fixa - Moved to Bottom Left to prevent overlap */}
      <div className="fixed bottom-2 left-4 z-[90] pointer-events-none select-none opacity-40 mix-blend-multiply dark:mix-blend-overlay">
        <span className="font-serif italic text-[10px] text-royal-400 dark:text-night-400 tracking-widest">Celpf</span>
      </div>

      {/* Loading Overlay Global (mais elegante) */}
      {isLoading && (
          <div className="fixed inset-0 z-50 bg-royal-950/20 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-night-800 rounded-2xl p-8 shadow-2xl max-w-sm w-full text-center border border-royal-100 dark:border-night-700 animate-fadeIn shadow-soft">
                  <div className="relative w-16 h-16 mx-auto mb-6">
                      <div className="absolute inset-0 border-4 border-royal-50 dark:border-night-700 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-royal-800 dark:border-gold-500 rounded-full border-t-transparent animate-spin"></div>
                      <Loader2 className="absolute inset-0 m-auto w-6 h-6 text-royal-800 dark:text-gold-500 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-serif font-bold text-royal-950 dark:text-night-100 mb-2">Gerando Exegese</h3>
                  <p className="text-royal-500 dark:text-night-400 font-sans text-sm animate-pulse">{loadingMsg}</p>
              </div>
          </div>
      )}

      {currentStudy ? (
        <StudyViewer data={currentStudy} onBack={handleBack} />
      ) : (
        <div className="h-full overflow-y-auto flex flex-col">
          <main className="flex-1 flex items-center justify-center p-4 py-12">
            <div className="w-full">
                {/* Form pass isLoading=false logicamente aqui pois o loading é global agora, 
                    mas mantemos a prop para desabilitar inputs */}
                <InputForm 
                  onSubmit={handleCreateStudy} 
                  isLoading={isLoading} 
                  history={history}
                  onHistorySelect={(item) => handleCreateStudy(item)}
                />
                
                {error && (
                    <div className="max-w-2xl mx-auto mt-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800 flex items-start gap-3 shadow-sm animate-fadeIn">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <p>{error}</p>
                    </div>
                )}
            </div>
          </main>
          
          <footer className="py-8 text-center text-royal-400 dark:text-night-400 text-sm">
            <p>&copy; {new Date().getFullYear()} Exegesis AI. Powered by Gemini.</p>
          </footer>
        </div>
      )}
    </div>
  );
};

export default App;