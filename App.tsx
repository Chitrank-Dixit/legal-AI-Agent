import React, { useState, useCallback, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { ChatInterface } from './components/ChatInterface';
import { askWithContext, summarizeChat } from './services/geminiService';
import type { Message } from './types';
import { translations } from './translations';


const App: React.FC = () => {
    const [context, setContext] = useState<string>('');
    const [fileNames, setFileNames] = useState<string[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
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
        if (context) {
             setMessages(prev => [
                ...prev,
                {
                    id: `system-context-retained-${Date.now()}`,
                    role: 'system',
                    content: t.contextLoaded(fileNames.length)
                }
            ]);
        }
        setShowClearConfirm(false);
    };

    const handleClearChatCancel = () => {
        setShowClearConfirm(false);
    };

    const handleSummarizeChat = useCallback(async () => {
        setIsSummarizing(true);
        const summarizingMessage: Message = {
            id: 'system-summarizing',
            role: 'system',
            content: t.summarizingChat
        };
        setMessages(prev => [...prev, summarizingMessage]);

        const historyToSummarize = messages
            .filter(msg => msg.role === 'user' || msg.role === 'model')
            .map(msg => `${msg.role === 'user' ? 'User' : 'AI Assistant'}: ${msg.content}`)
            .join('\n\n');

        try {
            const summary = await summarizeChat(historyToSummarize, language);
            const summaryMessage: Message = {
                id: `system-summary-${Date.now()}`,
                role: 'system',
                content: `**${t.summaryTitle}**\n\n${summary}`
            };
            setMessages(prev => [...prev.filter(m => m.id !== 'system-summarizing'), summaryMessage]);
        } catch (err) {
             const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
             const errorMessageObj: Message = {
                id: `system-error-${Date.now()}`,
                role: 'system',
                content: `${t.errorPrefix} ${errorMessage}`
            };
            setMessages(prev => [...prev.filter(m => m.id !== 'system-summarizing'), errorMessageObj]);
        } finally {
            setIsSummarizing(false);
        }

    }, [messages, language, t]);

    return (
        <div className="min-h-screen bg-slate-950 font-sans">
             {showClearConfirm && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 transition-opacity duration-300 animate-fade-in">
                    <div className="bg-slate-900 rounded-xl shadow-2xl p-6 w-full max-w-md border border-slate-800 m-4">
                        <h3 className="text-lg font-bold text-slate-100">{t.clearConfirmTitle}</h3>
                        <p className="mt-2 text-sm text-slate-400">{t.clearConfirmMessage}</p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button 
                                onClick={handleClearChatCancel}
                                className="px-4 py-2 rounded-md text-sm font-medium bg-slate-700 text-slate-200 hover:bg-slate-600/70 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                            >
                                {t.cancelClear}
                            </button>
                            <button
                                onClick={handleClearChatConfirm}
                                className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                            >
                                {t.confirmClear}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <main className="max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8">
                <header className="mb-8">
                    <div className="flex justify-between items-center relative">
                        <div></div> {/* Spacer */}
                        <div className="text-center absolute left-1/2 -translate-x-1/2">
                            <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 pb-2">
                                {t.appTitle}
                            </h1>
                            <p className="mt-1 text-sm text-slate-400">{t.appSubtitle}</p>
                        </div>
                        <div className="flex items-center ml-auto">
                            <label htmlFor="language-select" className="sr-only">{t.languageSelectorLabel}</label>
                            <div className="relative">
                                <select
                                    id="language-select"
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="appearance-none bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-md focus:ring-cyan-500 focus:border-cyan-500 block w-full pl-3 pr-8 py-2 transition-colors hover:bg-slate-700/50"
                                >
                                    <option value="en">English</option>
                                    <option value="hi">हिन्दी</option>
                                    <option value="ta">தமிழ்</option>
                                    <option value="kn">ಕನ್ನಡ</option>
                                    <option value="ml">മലയാളം</option>
                                    <option value="te">తెలుగు</option>
                                    <option value="bn">বাংলা</option>
                                    <option value="mr">मराठी</option>
                                    <option value="gu">ગુજરાતી</option>
                                    <option value="raj">राजस्थानी</option>
                                    <option value="hry">हरियाणवी</option>
                                    <option value="pa">ਪੰਜਾਬੀ</option>
                                    <option value="ks">कॉशुर</option>
                                    <option value="him">हिमाचली</option>
                                    <option value="awa">अवधी</option>
                                    <option value="bho">भोजपुरी</option>
                                    <option value="as">অসমীয়া</option>
                                    <option value="or">ଓଡ଼ିଆ</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
                
                {error && (
                     <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative mb-6" role="alert">
                        <strong className="font-bold">{t.errorPrefix} </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)] min-h-[650px]">
                    <div className="lg:col-span-1">
                        <FileUpload 
                            onFilesProcessed={handleFilesProcessed} 
                            isDisabled={isLoading || isSummarizing}
                            language={language}
                            translations={translations} 
                        />
                    </div>
                    <div className="lg:col-span-2">
                        <ChatInterface 
                            messages={messages} 
                            onSendMessage={handleSendMessage}
                            onClearChat={requestClearChat}
                            onSummarizeChat={handleSummarizeChat}
                            isLoading={isLoading}
                            isSummarizing={isSummarizing}
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