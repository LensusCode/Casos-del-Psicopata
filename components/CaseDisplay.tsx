import React, { useEffect, useRef } from 'react';
import type { Message } from '../types';

interface CaseDisplayProps {
  messages: Message[];
  isLoading: boolean;
}

const TypingIndicator: React.FC = () => (
    <div className="flex items-center space-x-2 p-4">
        <div className="text-lg text-[var(--text-color)] font-semibold">El narrador está escribiendo</div>
        <div className="w-2 h-2 bg-[var(--text-color)] rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
        <div className="w-2 h-2 bg-[var(--text-color)] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        <div className="w-2 h-2 bg-[var(--text-color)] rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
    </div>
);

export const CaseDisplay: React.FC<CaseDisplayProps> = ({ messages, isLoading }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);
  
  const formatContent = (content: string) => {
    let processedContent = content
      .replace(/\r\n|\r/g, '\n')
      .trim();

    // Block-level Elements
    processedContent = processedContent.replace(/^#### (.*$)/gim, '<h4 class="font-title text-lg mt-2 mb-1">$1</h4>');
    processedContent = processedContent.replace(/^### (.*$)/gim, '<h3 class="font-title text-xl mt-3 mb-1">$1</h3>');
    processedContent = processedContent.replace(/^## (.*$)/gim, '<h2 class="font-title text-2xl mt-4 mb-2">$1</h2>');
    processedContent = processedContent.replace(/^# (.*$)/gim, '<h1 class="font-title text-3xl mt-5 mb-3 border-b border-[var(--border-color)] pb-2">$1</h1>');
    processedContent = processedContent.replace(/^\s*---\s*$/gim, '<hr class="border-[var(--border-color)] my-6" />');
    
    // Lists
    processedContent = processedContent.replace(/(?:(?:^\s*\* .*(?:\n|$))+)/gim, (match) => {
      const items = match.trim().split('\n');
      const listItems = items.map(item => `<li>${item.replace(/^\s*\* /, '').trim()}</li>`).join('');
      return `<ul class="list-disc list-inside my-2 pl-4">${listItems}</ul>`;
    });
    
    // Span-level Elements
    processedContent = processedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    processedContent = processedContent.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Paragraphs
    const blocks = processedContent.split(/\n{2,}/);
    const htmlBlocks = blocks.map(block => {
      if (block.startsWith('<h') || block.startsWith('<ul') || block.startsWith('<hr')) {
        return block;
      }
      return `<p>${block.replace(/\n/g, '<br />')}</p>`;
    });

    return { __html: htmlBlocks.join('') };
  };


  return (
    <div className="space-y-6">
      {messages.map((msg, index) => (
        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-xl p-4 rounded-lg shadow-md ${
              msg.role === 'user' 
                ? 'bg-transparent border-2 border-dashed border-[var(--border-color)]' 
                : 'bg-[var(--paper-color)] border-l-4 border-[var(--accent-color)]'
            }`}
          >
            <div
              className="prose prose-sm max-w-none whitespace-pre-wrap leading-relaxed text-[var(--text-color)] font-serif"
              dangerouslySetInnerHTML={formatContent(msg.content)}
            />
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex justify-start">
             <div className="max-w-xl p-4 rounded-lg">
                <TypingIndicator />
            </div>
        </div>
      )}
      <div ref={endOfMessagesRef} />
    </div>
  );
};