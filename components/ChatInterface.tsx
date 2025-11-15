import React, { useState, useRef, useEffect } from 'react';
import type { Message } from '../types';
import { ChatMessage } from './ChatMessage';

interface ChatInterfaceProps {
    messages: Message[];
    onSendMessage: (query: string) => void;
    onClearChat: () => void;
    onSummarizeChat: () => void;
    isLoading: boolean;
    isSummarizing: boolean;
    isDisabled: boolean;
    language: string;
    translations: Record<string, any>;
}

const SendIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
    </svg>
);

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);

const SummarizeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
    </svg>
);

const ModelIconSpinner: React.FC = () => (
     <div className="w-9 h-9 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center shadow-md border border-slate-600">
       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-cyan-400">
          <path d="M15.75 8.25a.75.75 0 01.75.75c0 1.12-.492 2.133-1.28 2.812a.75.75 0 01-1.062-1.062 2.25 2.25 0 00-.83-1.488.75.75 0 01.75-.75H15.75z" />
          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM6.262 6.512a.75.75 0 011.062 0 2.25 2.25 0 003.183 0 .75.75 0 111.06 1.06 3.75 3.75 0 01-5.302 0 .75.75 0 010-1.06zM9.75 12a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3a.75.75 0 01-.75-.75zm-3.238 2.012a.75.75 0 010 1.06 3.75 3.75 0 01-5.303 0 .75.75 0 111.06-1.06 2.25 2.25 0 003.183 0z" clipRule="evenodd" />
       </svg>
    </div>
);


export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, onClearChat, onSummarizeChat, isLoading, isSummarizing, isDisabled, language, translations }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const t = translations[language];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading, isSummarizing]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading && !isDisabled) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    const isChatClearable = messages.length > 1;
    const isSummarizeable = messages.filter(m => m.role === 'user' || m.role === 'model').length >= 2;

    return (
        <div className="flex flex-col h-full bg-slate-900/70 border border-slate-800 rounded-xl shadow-lg">
            <header className="p-4 border-b border-slate-800 flex justify-between items-center flex-shrink-0">
                <h2 className="text-xl font-bold text-slate-100">{t.chatHeader}</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onSummarizeChat}
                        disabled={!isSummarizeable || isLoading || isSummarizing}
                        className="p-2 rounded-full text-slate-400 hover:bg-slate-800 hover:text-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        aria-label={t.summarizeChat}
                        title={t.summarizeChat}
                    >
                        <SummarizeIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={onClearChat}
                        disabled={!isChatClearable || isLoading || isSummarizing}
                        className="p-2 rounded-full text-slate-400 hover:bg-slate-800 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        aria-label={t.clearChat}
                        title={t.clearChat}
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                    {messages.map((msg) => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-4 my-5 animate-fade-in">
                            <ModelIconSpinner />
                            <div className="max-w-xl rounded-2xl p-4 bg-slate-800 rounded-bl-none border border-slate-700/50">
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-2 h-2 rounded-full bg-slate-500 animate-pulse"></div>
                                    <div className="w-2 h-2 rounded-full bg-slate-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-2 h-2 rounded-full bg-slate-500 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-slate-800 flex-shrink-0">
                <form onSubmit={handleSubmit} className="flex items-center gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isDisabled ? t.placeholderDisabled : t.placeholderEnabled}
                        className="w-full bg-slate-800 border border-slate-700 rounded-full py-2.5 px-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 disabled:opacity-50"
                        disabled={isLoading || isDisabled || isSummarizing}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || isDisabled || !input.trim() || isSummarizing}
                        className="bg-cyan-600 text-white p-2.5 rounded-full hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                        aria-label="Send message"
                    >
                        <SendIcon className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};