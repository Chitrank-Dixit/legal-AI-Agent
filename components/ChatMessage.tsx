import React from 'react';
import type { Message } from '../types';

interface ChatMessageProps {
    message: Message;
}

const UserIcon: React.FC = () => (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex-shrink-0 flex items-center justify-center shadow-md">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
        </svg>
    </div>
);

const ModelIcon: React.FC = () => (
    <div className="w-9 h-9 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center shadow-md border border-slate-600">
       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-cyan-400">
          <path d="M15.75 8.25a.75.75 0 01.75.75c0 1.12-.492 2.133-1.28 2.812a.75.75 0 01-1.062-1.062 2.25 2.25 0 00-.83-1.488.75.75 0 01.75-.75H15.75z" />
          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM6.262 6.512a.75.75 0 011.062 0 2.25 2.25 0 003.183 0 .75.75 0 111.06 1.06 3.75 3.75 0 01-5.302 0 .75.75 0 010-1.06zM9.75 12a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3a.75.75 0 01-.75-.75zm-3.238 2.012a.75.75 0 010 1.06 3.75 3.75 0 01-5.303 0 .75.75 0 111.06-1.06 2.25 2.25 0 003.183 0z" clipRule="evenodd" />
       </svg>
    </div>
);

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    const isUser = message.role === 'user';
    const isModel = message.role === 'model';
    const isSystem = message.role === 'system';

    if (isSystem) {
        return (
            <div className="text-center my-6">
                <p className="text-xs text-slate-500 italic max-w-md mx-auto">{message.content}</p>
            </div>
        )
    }

    return (
        <div className={`flex items-start gap-4 my-5 animate-fade-in ${isUser ? 'justify-end' : ''}`}>
            {!isUser && <ModelIcon />}
            <div className={`max-w-xl rounded-2xl p-4 text-sm shadow-md ${
                isUser 
                ? 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white rounded-br-none' 
                : 'bg-slate-800 text-slate-300 rounded-bl-none border border-slate-700/50'
            }`}>
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
            </div>
            {isUser && <UserIcon />}
        </div>
    );
};