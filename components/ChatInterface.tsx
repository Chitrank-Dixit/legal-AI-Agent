
import React, { useState, useRef, useEffect } from 'react';
import type { Message } from '../types';
import { ChatMessage } from './ChatMessage';

interface ChatInterfaceProps {
    messages: Message[];
    onSendMessage: (query: string) => void;
    isLoading: boolean;
    isDisabled: boolean;
}

const SendIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
    </svg>
);


export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading, isDisabled }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading && !isDisabled) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-800/50 border border-slate-700 rounded-lg">
            <header className="p-4 border-b border-slate-700">
                <h2 className="text-xl font-semibold text-slate-100">AI Assistant</h2>
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
                        placeholder={isDisabled ? "Please upload documents to begin" : "Ask a question about your documents..."}
                        className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
                        disabled={isLoading || isDisabled}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || isDisabled || !input.trim()}
                        className="bg-sky-600 text-white p-2 rounded-md hover:bg-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                        <SendIcon className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};
