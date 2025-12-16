import React, { useState, useEffect, useRef } from 'react';
import InputForm from './components/InputForm';
import StudyViewer from './components/StudyViewer';
import { StudyRequest, StudyData, HistoryItem, Translation, Depth } from './types';
import { generateStudy } from './services/geminiService';
import { AlertCircle, Loader2 } from 'lucide-react';

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
  
  const hasCheckedUrl = useRef(false);

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
        depth: depth || 'detalhado'
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
    <div className="h-screen w-full bg-gradient-to-br from-bible-50 to-white text-royal-neutral font-sans relative">
      {/* Assinatura Celpf Fixa */}
      <div className="fixed bottom-2 right-4 z-[100] pointer-events-none select-none opacity-40 mix-blend-multiply">
        <span className="font-serif italic text-[10px] text-royal-400 tracking-widest">Celpf</span>
      </div>

      {/* Loading Overlay Global (mais elegante) */}
      {isLoading && (
          <div className="fixed inset-0 z-50 bg-royal-950/20 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full text-center border border-royal-100 animate-fadeIn shadow-soft">
                  <div className="relative w-16 h-16 mx-auto mb-6">
                      <div className="absolute inset-0 border-4 border-royal-50 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-royal-800 rounded-full border-t-transparent animate-spin"></div>
                      <Loader2 className="absolute inset-0 m-auto w-6 h-6 text-royal-800 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-serif font-bold text-royal-950 mb-2">Gerando Exegese</h3>
                  <p className="text-royal-500 font-sans text-sm animate-pulse">{loadingMsg}</p>
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
                    <div className="max-w-2xl mx-auto mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-start gap-3 shadow-sm animate-fadeIn">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <p>{error}</p>
                    </div>
                )}
            </div>
          </main>
          
          <footer className="py-8 text-center text-royal-400 text-sm">
            <p>&copy; {new Date().getFullYear()} Exegesis AI. Powered by Gemini.</p>
          </footer>
        </div>
      )}
    </div>
  );
};

export default App;