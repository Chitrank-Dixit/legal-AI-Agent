import React, { useState, useCallback, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { ChatInterface } from './components/ChatInterface';
import { askWithContext } from './services/geminiService';
import type { Message } from './types';
import { translations } from './translations';


const App: React.FC = () => {
    const [context, setContext] = useState<string>('');
    const [fileNames, setFileNames] = useState<string[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [language, setLanguage] = useState<string>('en');
    const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

    const t = translations[language];

    useEffect(() => {
        setMessages([
            {
                id: 'system-initial',
                role: 'system',
                content: t.initialSystemMessage
            }
        ]);
    }, [language, t.initialSystemMessage]);


    const handleFilesProcessed = useCallback((content: string, names: string[]) => {
        setContext(content);
        setFileNames(names);
        setMessages(prev => [
            ...prev,
            {
                id: `system-${Date.now()}`,
                role: 'system',
                content: t.contextLoaded(names.length)
            }
        ]);
        setError(null);
    }, [t]);

    const handleSendMessage = useCallback(async (query: string) => {
        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: query
        };
        
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        setError(null);

        try {
            const responseContent = await askWithContext(context, query);
            const modelMessage: Message = {
                id: `model-${Date.now()}`,
                role: 'model',
                content: responseContent
            };
            setMessages(prev => [...prev, modelMessage]);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
            const errorMessageObj: Message = {
                id: `system-error-${Date.now()}`,
                role: 'system',
                content: `${t.errorPrefix} ${errorMessage}`
            };
            setMessages(prev => [...prev, errorMessageObj]);
        } finally {
            setIsLoading(false);
        }
    }, [context, t.errorPrefix]);
    
    const requestClearChat = () => {
        setShowClearConfirm(true);
    };

    const handleClearChatConfirm = () => {
        setMessages([
            {
                id: 'system-initial',
                role: 'system',
                content: t.initialSystemMessage,
            },
            {
                id: `system-cleared-${Date.now()}`,
                role: 'system',
                content: t.chatCleared,
            }
        ]);
        setShowClearConfirm(false);
    };

    const handleClearChatCancel = () => {
        setShowClearConfirm(false);
    };

    return (
        <div className="min-h-screen bg-slate-900 font-sans">
             {showClearConfirm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-opacity duration-300">
                    <div className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-slate-700">
                        <h3 className="text-lg font-semibold text-slate-100">{t.clearConfirmTitle}</h3>
                        <p className="mt-2 text-sm text-slate-400">{t.clearConfirmMessage}</p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button 
                                onClick={handleClearChatCancel}
                                className="px-4 py-2 rounded-md text-sm font-medium bg-slate-700 text-slate-200 hover:bg-slate-600 transition-colors"
                            >
                                {t.cancelClear}
                            </button>
                            <button
                                onClick={handleClearChatConfirm}
                                className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-500 transition-colors"
                            >
                                {t.confirmClear}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <header className="mb-8">
                    <div className="flex justify-between items-center">
                        <div></div> {/* Spacer */}
                        <div className="text-center">
                            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
                                {t.appTitle}
                            </h1>
                            <p className="mt-2 text-slate-400">{t.appSubtitle}</p>
                        </div>
                        <div className="flex items-center">
                            <label htmlFor="language-select" className="sr-only">{t.languageSelectorLabel}</label>
                            <select
                                id="language-select"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-md focus:ring-sky-500 focus:border-sky-500 block w-full p-2"
                            >
                                <option value="en">English</option>
                                <option value="hi">हिन्दी</option>
                                <option value="ta">தமிழ்</option>
                                <option value="kn">ಕನ್ನಡ</option>
                                <option value="ml">മലയാളം</option>
                                <option value="te">తెలుగు</option>
                                <option value="bn">বাংলা</option>
                            </select>
                        </div>
                    </div>
                </header>
                
                {error && (
                     <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative mb-6" role="alert">
                        <strong className="font-bold">{t.errorPrefix} </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-14rem)] min-h-[600px]">
                    <div className="lg:col-span-1">
                        <FileUpload 
                            onFilesProcessed={handleFilesProcessed} 
                            isDisabled={isLoading}
                            language={language}
                            translations={translations} 
                        />
                    </div>
                    <div className="lg:col-span-2">
                        <ChatInterface 
                            messages={messages} 
                            onSendMessage={handleSendMessage}
                            onClearChat={requestClearChat}
                            isLoading={isLoading}
                            isDisabled={!context}
                            language={language}
                            translations={translations}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;