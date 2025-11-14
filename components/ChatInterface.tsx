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
        <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
    </svg>
);

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.006a.75.75 0 0 1-.749.654h-12.5a.75.75 0 0 1-.75-.654L5.334 6.66l-.21.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.347-9Zm5.198 0a.75.75 0 1 0-1.498.058l-.347 9a.75.75 0 0 0 1.5-.058l.347-9Z" clipRule="evenodd" />
    </svg>
);

const SummarizeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a.375.375 0 0 1-.375-.375V6.75A3.75 3.75 0 0 0 10.5 3H5.625Zm1.5 1.5v3.75c0 .621.504 1.125 1.125 1.125h3.75V1.5H7.125ZM12 1.5v7.5h4.5a2.25 2.25 0 0 1 2.25 2.25v8.25a.375.375 0 0 1-.375.375H5.625a.375.375 0 0 1-.375-.375V3.375c0-.207.168-.375.375-.375H12ZM15 15h-3a.75.75 0 0 1 0-1.5h3a.75.75 0 0 1 0 1.5Zm0 3h-3a.75.75 0 0 1 0-1.5h3a.75.75 0 0 1 0 1.5Z" />
    </svg>
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
        <div className="flex flex-col h-full bg-slate-800/50 border border-slate-700 rounded-lg">
            <header className="p-4 border-b border-slate-700 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-100">{t.chatHeader}</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onSummarizeChat}
                        disabled={!isSummarizeable || isLoading || isSummarizing}
                        className="p-2 rounded-md text-slate-400 hover:bg-slate-700 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label={t.summarizeChat}
                        title={t.summarizeChat}
                    >
                        <SummarizeIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={onClearChat}
                        disabled={!isChatClearable || isLoading || isSummarizing}
                        className="p-2 rounded-md text-slate-400 hover:bg-slate-700 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                        <div className="flex items-start gap-4 my-4">
                             <div className="w-8 h-8 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center">
                               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-sky-400">
                                  <path fillRule="evenodd" d="M9.315 7.584C12.195 3.883 19.86 3.798 23.333 7.497c2.173 2.22 2.623 5.347 1.343 7.958-1.28 2.61-4.035 4.093-6.936 4.093a8.21 8.21 0 0 1-6.162-2.735 8.21 8.21 0 0 1-2.162-5.462V9.375a.75.75 0 0 1 .75-.75h.383a3.515 3.515 0 0 0 2.822-1.046zM14.685 4.315C11.805.614 4.14.7 1.155 4.965a8.25 8.25 0 0 0 3.233 11.962A8.25 8.25 0 0 0 15.345 6.46v-.086a.75.75 0 0 0-.75-.75h-.383a3.515 3.515 0 0 1-2.822-1.046z" clipRule="evenodd"/>
                               </svg>
                            </div>
                            <div className="max-w-xl rounded-lg p-4 bg-slate-700/50 rounded-bl-none">
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse"></div>
                                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-slate-700">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isDisabled ? t.placeholderDisabled : t.placeholderEnabled}
                        className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
                        disabled={isLoading || isDisabled || isSummarizing}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || isDisabled || !input.trim() || isSummarizing}
                        className="bg-sky-600 text-white p-2 rounded-md hover:bg-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                        <SendIcon className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};