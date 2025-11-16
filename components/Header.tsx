import React, { useState, useEffect, useRef } from 'react';
import { MenuIcon } from './icons/MenuIcon';
import { VolumeIcon } from './icons/VolumeIcon';
import { BackIcon } from './icons/BackIcon';

interface HeaderProps {
  onNewCase: () => void;
  isLoading: boolean;
  onLoadCase: () => void;
  hasSavedCase: boolean;
  volume: number;
  onVolumeChange: (newVolume: number) => void;
  caseStarted: boolean;
  onGoBack: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onNewCase, 
  isLoading, 
  onLoadCase, 
  hasSavedCase, 
  volume, 
  onVolumeChange, 
  caseStarted, 
  onGoBack 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNewCaseClick = () => {
    onNewCase();
    setIsOpen(false);
  };

  const handleLoadCaseClick = () => {
    onLoadCase();
    setIsOpen(false);
  };

  return (
    <header className="relative flex items-center justify-center p-3 border-b-4 border-double border-[var(--border-color)] bg-[var(--text-color)] shadow-lg sticky top-0 z-10">
      {caseStarted && (
         <div className="absolute top-1/2 left-4 -translate-y-1/2">
            <button
              onClick={onGoBack}
              className="text-[var(--paper-color)] p-2 rounded-md hover:bg-black/20 focus:outline-none focus:ring-2 focus:ring-[var(--paper-color)]"
              aria-label="Volver al inicio"
            >
              <BackIcon />
            </button>
        </div>
      )}
      <h1 className="text-4xl md:text-5xl font-title text-[var(--paper-color)] text-center">
        Casos del Psicópata
      </h1>
      <div ref={menuRef} className="absolute top-1/2 right-4 -translate-y-1/2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-[var(--paper-color)] p-2 rounded-md hover:bg-black/20 focus:outline-none focus:ring-2 focus:ring-[var(--paper-color)]"
          aria-label="Abrir menú"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <MenuIcon />
        </button>
        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 origin-top-right bg-[var(--paper-color)] border border-[var(--border-color)] rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
            <ul className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
              <li>
                <button
                  onClick={handleNewCaseClick}
                  disabled={isLoading}
                  className="font-title block w-full text-left px-4 py-2 text-md text-[var(--text-color)] hover:bg-[var(--bg-color)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  role="menuitem"
                >
                  {isLoading ? 'Generando...' : 'Comenzar un nuevo caso'}
                </button>
              </li>
              <li>
                <button
                  onClick={handleLoadCaseClick}
                  disabled={!hasSavedCase || isLoading}
                  className="font-title block w-full text-left px-4 py-2 text-md text-[var(--text-color)] hover:bg-[var(--bg-color)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  role="menuitem"
                  title={!hasSavedCase ? "No hay ningún caso guardado" : "Cargar el último caso"}
                >
                  Cargar caso guardado
                </button>
              </li>
              <li className="border-t border-[var(--border-color)] my-1"></li>
              <li>
                <div className="px-4 py-2 flex items-center gap-3" title="Volumen ambiental">
                    <VolumeIcon />
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                        className="w-full h-2 bg-[var(--border-color)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)]"
                        aria-label="Volumen ambiental"
                    />
                </div>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
};