import React, { useState, useRef, useEffect, useMemo } from 'react';
import { SendIcon } from './icons/SendIcon';
import { CommandsIcon } from './icons/CommandsIcon';
import { HintIcon } from './icons/HintIcon';
import type { Message } from '../types';

interface UserInputProps {
  onSendMessage: (input: string) => void;
  isLoading: boolean;
  messages: Message[];
}

export const UserInput: React.FC<UserInputProps> = ({ onSendMessage, isLoading, messages }) => {
  const [input, setInput] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const commands = useMemo(() => {
    const baseCommands = [
      'Examinar la escena del crimen en busca de más pistas.',
      'Revisar las pruebas encontradas hasta ahora.',
      'Dame un resumen del caso.',
    ];

    const suspectNames = new Set<string>();
    const caseIntroduction = messages.length > 0 && messages[0].role === 'ai' ? messages[0] : null;

    if (caseIntroduction) {
      const suspectSectionMatch = caseIntroduction.content.match(/## Los Sospechosos\n\n([\s\S]*)/i);
      if (suspectSectionMatch && suspectSectionMatch[1]) {
        const suspectsText = suspectSectionMatch[1];
        const nameRegex = /^\*\s*\*\*(.*?)\*\*/gm;
        let match;
        while ((match = nameRegex.exec(suspectsText)) !== null) {
          suspectNames.add(match[1].trim());
        }
      }
    }

    const suspectCommands = Array.from(suspectNames).map(name => `Interrogar a ${name}.`);

    if (suspectCommands.length === 0) {
      return [...baseCommands, 'Interrogar a [Nombre del sospechoso].'];
    }

    return [...suspectCommands, ...baseCommands];
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCommandClick = (command: string) => {
    setInput(command);
    setIsMenuOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleHintRequest = () => {
    onSendMessage("Dame una pista sutil para continuar la investigación.");
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-stretch gap-3">
      <div className="relative" ref={menuRef}>
        <div 
          className={`absolute bottom-full w-72 mb-2 bg-[var(--paper-color)] border border-[var(--border-color)] rounded-lg shadow-lg z-10 origin-bottom-left transition-all duration-150 ease-out ${isMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
        >
          <p className="font-title text-sm p-2 text-center border-b border-[var(--border-color)] text-[var(--text-color)]/80">
            Acciones Rápidas
          </p>
          <ul className="p-1 max-h-48 overflow-y-auto">
            {commands.map((cmd, index) => (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => handleCommandClick(cmd)}
                  className="w-full text-left p-2 rounded-md text-[var(--text-color)] hover:bg-[var(--bg-color)] transition-colors text-sm font-serif"
                >
                  {cmd}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          disabled={isLoading}
          className="p-3 h-full bg-transparent border-2 border-[var(--border-color)] text-[var(--text-color)] rounded-lg hover:bg-[var(--bg-color)] disabled:opacity-50 transition-colors duration-300 flex items-center justify-center aspect-square shadow-sm"
          aria-label="Mostrar comandos"
          aria-haspopup="true"
          aria-expanded={isMenuOpen}
        >
          <CommandsIcon />
        </button>
      </div>
      <button
        type="button"
        onClick={handleHintRequest}
        disabled={isLoading}
        className="p-3 h-full bg-transparent border-2 border-[var(--border-color)] text-[var(--text-color)] rounded-lg hover:bg-[var(--bg-color)] disabled:opacity-50 transition-colors duration-300 flex items-center justify-center aspect-square shadow-sm"
        aria-label="Pedir una pista"
      >
        <HintIcon />
      </button>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Escribe tu pregunta o deducción aquí..."
        rows={1}
        className="flex-1 p-3 bg-[var(--paper-color)] border-2 border-[var(--border-color)] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent transition-all duration-200 min-h-[50px] font-serif shadow-inner"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading || !input.trim()}
        className="p-3 bg-[var(--accent-color)] text-white rounded-lg hover:bg-[var(--accent-hover-color)] disabled:bg-gray-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center aspect-square shadow-sm hover:shadow-md"
        aria-label="Enviar mensaje"
      >
        <SendIcon />
      </button>
    </form>
  );
};