
import React from 'react';
import type { Message } from '../types';

interface ChatMessageProps {
    message: Message;
}

const UserIcon: React.FC = () => (
    <div className="w-8 h-8 rounded-full bg-sky-500 flex-shrink-0 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
        </svg>
    </div>
);

const ModelIcon: React.FC = () => (
    <div className="w-8 h-8 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center">
       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-sky-400">
          <path fillRule="evenodd" d="M9.315 7.584C12.195 3.883 19.86 3.798 23.333 7.497c2.173 2.22 2.623 5.347 1.343 7.958-1.28 2.61-4.035 4.093-6.936 4.093a8.21 8.21 0 0 1-6.162-2.735 8.21 8.21 0 0 1-2.162-5.462V9.375a.75.75 0 0 1 .75-.75h.383a3.515 3.515 0 0 0 2.822-1.046zM14.685 4.315C11.805.614 4.14.7 1.155 4.965a8.25 8.25 0 0 0 3.233 11.962A8.25 8.25 0 0 0 15.345 6.46v-.086a.75.75 0 0 0-.75-.75h-.383a3.515 3.515 0 0 1-2.822-1.046z" clipRule="evenodd"/>
       </svg>
    </div>
);

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    const isUser = message.role === 'user';
    const isModel = message.role === 'model';
    const isSystem = message.role === 'system';

    if (isSystem) {
        return (
            <div className="text-center my-4">
                <p className="text-sm text-slate-500 italic">{message.content}</p>
            </div>
        )
    }

    return (
        <div className={`flex items-start gap-4 my-4 ${isUser ? 'justify-end' : ''}`}>
            {!isUser && <ModelIcon />}
            <div className={`max-w-xl rounded-lg p-4 text-sm ${
                isUser 
                ? 'bg-sky-600 text-white rounded-br-none' 
                : 'bg-slate-700/50 text-slate-300 rounded-bl-none'
            }`}>
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
            </div>
            {isUser && <UserIcon />}
        </div>
    );
};
