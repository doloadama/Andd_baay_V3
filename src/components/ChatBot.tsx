import React, { useState, useEffect } from 'react';
import { generateDescription } from '../services/geminiService';
import { Language } from '../utils/i18n';

interface ChatBotProps {
    t: (key: any, options?: any) => string;
    lang: Language;
}

const ChatBot: React.FC<ChatBotProps> = ({ t, lang }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ author: 'user' | 'bot'; text: string }[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setMessages([{ author: 'bot', text: t('chatBotWelcome') }]);
    }, [lang, t]);


    const handleSend = async () => {
        if (!input.trim()) return;

        const currentInput = input;
        const userMessage = { author: 'user' as const, text: currentInput };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const prompt = `You are a helpful agricultural assistant for farmers in Mali. The user said: "${currentInput}". Provide a concise and helpful response.`;
            const botResponse = await generateDescription(prompt);
            const botMessage = { author: 'bot' as const, text: botResponse };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error(error);
            const errorMessage = { author: 'bot' as const, text: 'Sorry, an error occurred.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-transform hover:scale-110"
                aria-label="Open Chatbot"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm1.5 1a.5.5 0 000 1h8a.5.5 0 000-1h-8zm0 2.5a.5.5 0 000 1h6a.5.5 0 000-1h-6z" />
                    <path d="M15 7a1 1 0 11-2 0 1 1 0 012 0zM5.5 16.5A1.5 1.5 0 014 15V8h12v7a1.5 1.5 0 01-1.5 1.5h-9z" />
                </svg>
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-80 h-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col">
            <header className="bg-blue-600 text-white p-3 rounded-t-xl flex justify-between items-center">
                <h3 className="font-semibold">{t('chatBotHeader')}</h3>
                <button onClick={() => setIsOpen(false)} className="font-bold text-xl">&times;</button>
            </header>
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                {messages.map((msg, index) => (
                    <div key={index} className={`mb-3 ${msg.author === 'user' ? 'text-right' : 'text-left'}`}>
                        <span className={`inline-block p-2 rounded-lg ${msg.author === 'user' ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/50 dark:text-blue-200' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
                            {msg.text}
                        </span>
                    </div>
                ))}
                 {loading && <div className="text-left"><span className="inline-block p-2 rounded-lg bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200">...</span></div>}
            </div>
            <div className="p-3 border-t dark:border-gray-700">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={t('chatBotPlaceholder')}
                        className="flex-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <button onClick={handleSend} className="bg-blue-600 text-white px-4 rounded-md hover:bg-blue-700">{t('chatBotSend')}</button>
                </div>
            </div>
        </div>
    );
};

export default ChatBot;