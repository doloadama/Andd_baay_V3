import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Bot, User, Send, X, Loader } from 'lucide-react';
import { ai } from '../services/geminiService';
import { Chat } from '@google/genai';
import { User as CurrentUserType } from '../types';

interface Message {
    role: 'user' | 'model';
    text: string;
}

interface ChatBotProps {
    currentUser: CurrentUserType;
}

const ChatBot: React.FC<ChatBotProps> = ({ currentUser }) => {
    const chatHistoryKey = `chatHistory_${currentUser.id}`;

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>(() => {
        try {
            const savedHistory = localStorage.getItem(chatHistoryKey);
            if (savedHistory) {
                const parsed = JSON.parse(savedHistory);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        } catch (error) {
            console.error("Error loading chat history from localStorage:", error);
        }
        return [{ role: 'model', text: 'Hello! How can I help you with your farming today?' }];
    });
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatSessionRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // If there's more than just the default welcome message, use it as history
        const historyToRestore = messages.length > 1
            ? messages.map(msg => ({ role: msg.role, parts: [{ text: msg.text }] }))
            : [];

        chatSessionRef.current = ai.chats.create({
            model: 'gemini-2.5-flash',
            history: historyToRestore,
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on mount

    useEffect(() => {
        // Do not save if it's just the default welcome message
        if (messages.length > 1) {
            localStorage.setItem(chatHistoryKey, JSON.stringify(messages));
        }
    }, [messages, chatHistoryKey]);

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || !chatSessionRef.current) return;

        const userMessage: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        const userInputForApi = input;
        setInput('');
        setIsLoading(true);

        try {
            const response = await chatSessionRef.current.sendMessage({ message: userInputForApi });
            const modelMessage: Message = { role: 'model', text: response.text };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage: Message = { role: 'model', text: 'Sorry, I encountered an error. Please try again.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !isLoading) {
            handleSend();
        }
    };

    return (
        <>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 bg-green-600 text-white rounded-full p-4 shadow-lg hover:bg-green-700 transition-transform hover:scale-110 z-50"
                aria-label="Toggle chat"
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </button>

            {isOpen && (
                <div className="fixed bottom-20 right-6 w-full max-w-sm h-full max-h-[600px] bg-white rounded-xl shadow-2xl flex flex-col z-50 border">
                    <header className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                        <div className="flex items-center space-x-3">
                            <Bot className="text-green-600" size={24} />
                            <h2 className="font-bold text-lg text-gray-800">Andd Baay Assistant</h2>
                        </div>
                    </header>
                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                {msg.role === 'model' && <div className="bg-gray-200 p-2 rounded-full"><Bot size={16} className="text-gray-600"/></div>}
                                <div className={`px-4 py-2 rounded-lg max-w-xs ${msg.role === 'user' ? 'bg-green-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                </div>
                                 {msg.role === 'user' && <div className="bg-green-100 p-2 rounded-full"><User size={16} className="text-green-700"/></div>}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-start gap-3">
                                <div className="bg-gray-200 p-2 rounded-full"><Bot size={16} className="text-gray-600"/></div>
                                <div className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 rounded-bl-none">
                                    <Loader className="animate-spin text-gray-500" size={20} />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <footer className="p-4 border-t">
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask anything..."
                                className="w-full pr-12 pl-4 py-2 border border-gray-300 rounded-full focus:ring-green-500 focus:border-green-500"
                            />
                            <button onClick={handleSend} disabled={isLoading} className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-600 text-white rounded-full p-2 hover:bg-green-700 disabled:bg-gray-400">
                                <Send size={16} />
                            </button>
                        </div>
                    </footer>
                </div>
            )}
        </>
    );
};

export default ChatBot;