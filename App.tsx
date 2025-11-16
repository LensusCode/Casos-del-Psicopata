import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { CaseDisplay } from './components/CaseDisplay';
import { UserInput } from './components/UserInput';
import { getAiResponse } from './services/aiService';
import { Message } from './types';
import { INITIAL_PROMPT } from './constants';

const SAVE_KEY = 'psychopath_case_save';
const VOLUME_KEY = 'psychopath_case_volume';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [caseStarted, setCaseStarted] = useState<boolean>(false);
  const [hasSavedCase, setHasSavedCase] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.2);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Check for a saved case and volume on initial load
  useEffect(() => {
    try {
      const savedCase = localStorage.getItem(SAVE_KEY);
      if (savedCase) {
        const parsedMessages: Message[] = JSON.parse(savedCase);
        if (parsedMessages.length > 0) {
          setHasSavedCase(true);
        }
      }
      const savedVolume = localStorage.getItem(VOLUME_KEY);
      if (savedVolume !== null) {
        setVolume(parseFloat(savedVolume));
      }
    } catch (e) {
      console.error("Failed to load data from localStorage on init", e);
      localStorage.removeItem(SAVE_KEY); // Clear corrupted data
      setHasSavedCase(false);
    }
  }, []);
  
  // Save case to localStorage whenever messages change
  useEffect(() => {
    if (caseStarted && messages.length > 0) {
      try {
        const dataToSave = JSON.stringify(messages);
        localStorage.setItem(SAVE_KEY, dataToSave);
        setHasSavedCase(true);
      } catch (e) {
        console.error("Failed to save case to localStorage", e);
      }
    }
  }, [messages, caseStarted]);

  // Manage audio playback based on case status
  useEffect(() => {
    const audioEl = audioRef.current;
    if (audioEl) {
      if (caseStarted) {
        audioEl.volume = volume;
        const playPromise = audioEl.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.warn("Audio autoplay was prevented by the browser.", error);
          });
        }
      } else {
        audioEl.pause();
      }
    }
  }, [caseStarted, volume]);


  const startNewCase = useCallback(async () => {
    localStorage.removeItem(SAVE_KEY);
    setHasSavedCase(false);
    setMessages([]);
    setError(null);
    setIsLoading(true);
    setCaseStarted(true);

    try {
      const aiResponse = await getAiResponse(INITIAL_PROMPT, []);
      setMessages([{ role: 'ai', content: aiResponse }]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocurrió un error desconocido.';
      setError(`No se pudo generar el caso. ${errorMessage}`);
      setCaseStarted(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadSavedCase = useCallback(() => {
    try {
        const savedCase = localStorage.getItem(SAVE_KEY);
        if (savedCase) {
            const parsedMessages: Message[] = JSON.parse(savedCase);
            setMessages(parsedMessages);
            setCaseStarted(true);
            setError(null);
            setIsLoading(false);
        }
    } catch (e) {
        console.error("Failed to load case from localStorage", e);
        setError("No se pudo cargar el caso guardado. Puede que esté corrupto.");
        localStorage.removeItem(SAVE_KEY);
        setHasSavedCase(false);
    }
  }, []);


  const handleSendMessage = useCallback(async (userInput: string) => {
    if (!userInput.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: userInput };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const aiResponse = await getAiResponse(userInput, messages);
      setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocurrió un error desconocido.';
      setError(`Hubo un error al contactar al narrador. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);
  
  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
        audioRef.current.volume = newVolume;
    }
    try {
        localStorage.setItem(VOLUME_KEY, newVolume.toString());
    } catch(e) {
        console.error("Failed to save volume to localStorage", e);
    }
  }, []);

  const handleGoBack = useCallback(() => {
    setCaseStarted(false);
  }, []);

  return (
    <div className="flex flex-col h-screen text-[var(--text-color)]">
      <audio ref={audioRef} src="/assets/noir-background-music.mp3" loop />
      <Header 
        onNewCase={startNewCase} 
        isLoading={isLoading} 
        onLoadCase={loadSavedCase} 
        hasSavedCase={hasSavedCase} 
        volume={volume}
        onVolumeChange={handleVolumeChange}
        caseStarted={caseStarted}
        onGoBack={handleGoBack}
      />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {!caseStarted ? (
            <div className="text-center p-8 bg-[var(--paper-color)] border border-[var(--border-color)] rounded-lg shadow-lg">
              <h2 className="text-2xl font-title mb-4">Bienvenido, Detective</h2>
              <p className="mb-6 text-lg">Estás a punto de adentrarte en un mundo de misterio y engaño. ¿Listo para resolver tu primer caso?</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <button
                    onClick={startNewCase}
                    disabled={isLoading}
                    className="font-title bg-[var(--accent-color)] text-white px-8 py-3 rounded-lg hover:bg-[var(--accent-hover-color)] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:ring-offset-2 focus:ring-offset-[var(--paper-color)] transform hover:scale-105"
                  >
                    {isLoading ? 'Generando Caso...' : 'Comenzar un Nuevo Caso'}
                  </button>
                  {hasSavedCase && (
                    <button
                        onClick={loadSavedCase}
                        disabled={isLoading}
                        className="font-title bg-transparent text-[var(--text-color)] border-2 border-[var(--border-color)] px-8 py-3 rounded-lg hover:bg-[var(--bg-color)] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--border-color)] focus:ring-offset-2 focus:ring-offset-[var(--paper-color)] transform hover:scale-105"
                    >
                        Continuar Caso Anterior
                    </button>
                  )}
              </div>
              {error && <p className="text-center text-red-700 bg-red-100 border border-red-700 p-3 rounded-md my-4">{error}</p>}
            </div>
          ) : (
            <>
              <CaseDisplay messages={messages} isLoading={isLoading} />
              {error && <p className="text-center text-red-700 bg-red-100 border border-red-700 p-3 rounded-md my-4">{error}</p>}
            </>
          )}
        </div>
      </main>
      {caseStarted && (
        <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-[var(--bg-color)] to-transparent pt-8">
          <div className="bg-[var(--paper-color)] shadow-[0_-2px_10px_rgba(0,0,0,0.1)] border-t-2 border-[var(--border-color)] p-4">
            <div className="max-w-4xl mx-auto">
              <UserInput onSendMessage={handleSendMessage} isLoading={isLoading} messages={messages} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;