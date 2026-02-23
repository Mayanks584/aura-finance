import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiRobot2Line, RiSendPlaneFill, RiCloseLine, RiSparklingLine } from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';
import { aiService } from '../services/aiService';

const AIAssistantWidget = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: 'Hi there! 👋 I am Aura, your personal AI financial assistant. How can I help you manage your money today?', timestamp: new Date() }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e?.preventDefault();
        if (!input.trim() || !user || isTyping) return;

        const userMessage = { role: 'user', text: input, timestamp: new Date() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        try {
            // Call the AI Service
            const response = await aiService.askFinancialAssistant(user.id, userMessage.text);

            setMessages(prev => [...prev, {
                role: 'assistant',
                text: response,
                timestamp: new Date()
            }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                text: "I'm sorry, I'm having trouble connecting to my brain right now. Please try again later.",
                timestamp: new Date()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    // Do not render the widget at all if the user isn't logged in
    if (!user) return null;

    return (
        <>
            {/* Chat Button */}
            <motion.button
                className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-40 gradient-primary"
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.5 }}
            >
                {isOpen ? <RiCloseLine className="text-white text-2xl" /> : <RiRobot2Line className="text-white text-2xl" />}

                {/* Glow effect */}
                {!isOpen && (
                    <motion.div
                        className="absolute inset-0 rounded-full border-2 border-white pointer-events-none"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                )}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed bottom-24 right-6 w-[350px] sm:w-[400px] h-[500px] max-h-[70vh] card-glass flex flex-col overflow-hidden z-40 shadow-2xl origin-bottom-right"
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    >
                        {/* Header */}
                        <div className="gradient-primary p-4 shrink-0 flex items-center justify-between shadow-md z-10 text-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30">
                                    <RiSparklingLine className="text-xl text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm leading-tight">Aura AI</h3>
                                    <p className="text-xs text-white/80 flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,1)]"></span>
                                        Online
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                            >
                                <RiCloseLine />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                            {messages.map((msg, index) => {
                                const isAI = msg.role === 'assistant';
                                return (
                                    <motion.div
                                        key={index}
                                        className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <div className={`max-w-[85%] p-3 text-sm ${isAI
                                                ? 'bg-muted/50 text-foreground rounded-2xl rounded-tl-sm border border-border shadow-sm'
                                                : 'gradient-primary text-white rounded-2xl rounded-tr-sm shadow-md'
                                            }`}>
                                            <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                                            <span className={`text-[10px] mt-1.5 block ${isAI ? 'text-muted-foreground' : 'text-white/70 text-right'}`}>
                                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}

                            {/* Typing Indicator */}
                            {isTyping && (
                                <motion.div className="flex justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <div className="bg-muted/50 p-4 rounded-2xl rounded-tl-sm border border-border shadow-sm flex items-center gap-1.5 w-16">
                                        <motion.div className="w-2 h-2 rounded-full gradient-primary" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                                        <motion.div className="w-2 h-2 rounded-full gradient-primary" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                                        <motion.div className="w-2 h-2 rounded-full gradient-primary" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-3 shrink-0 border-t border-border bg-background/50 backdrop-blur flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Ask Aura anything..."
                                className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-white text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                                disabled={isTyping}
                            />
                            <motion.button
                                type="submit"
                                disabled={!input.trim() || isTyping}
                                className="w-11 h-11 rounded-xl gradient-primary text-white flex items-center justify-center shadow-md disabled:opacity-50 transition-opacity"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <RiSendPlaneFill className="text-lg" />
                            </motion.button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AIAssistantWidget;
