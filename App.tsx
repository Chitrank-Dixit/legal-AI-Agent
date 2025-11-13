
import React, { useState, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { ChatInterface } from './components/ChatInterface';
import { askWithContext } from './services/geminiService';
import type { Message } from './types';

const App: React.FC = () => {
    const [context, setContext] = useState<string>('');
    const [fileNames, setFileNames] = useState<string[]>([]);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'system-initial',
            role: 'system',
            content: 'Hello! I am your Legal Remedy AI Agent. Please upload the relevant legal documents, and I will help you find resolutions based on their content.'
        }
    ]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleFilesProcessed = useCallback((content: string, names: string[]) => {
        setContext(content);
        setFileNames(names);
        setMessages(prev => [
            ...prev,
            {
                id: `system-${Date.now()}`,
                role: 'system',
                content: `Context loaded from ${names.length} file(s). You can now ask questions.`
            }
        ]);
        setError(null);
    }, []);

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
                content: `Error: ${errorMessage}`
            };
            setMessages(prev => [...prev, errorMessageObj]);
        } finally {
            setIsLoading(false);
        }
    }, [context]);

    return (
        <div className="min-h-screen bg-slate-900 font-sans">
            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <header className="text-center mb-8">
                     <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
                        Legal Remedy AI Agent
                    </h1>
                    <p className="mt-2 text-slate-400">Your RAG-powered legal document assistant</p>
                </header>
                
                {error && (
                     <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative mb-6" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)] min-h-[600px]">
                    <div className="lg:col-span-1">
                        <FileUpload onFilesProcessed={handleFilesProcessed} isDisabled={isLoading} />
                    </div>
                    <div className="lg:col-span-2">
                        <ChatInterface 
                            messages={messages} 
                            onSendMessage={handleSendMessage} 
                            isLoading={isLoading}
                            isDisabled={!context}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
