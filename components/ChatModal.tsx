
import React, { useState, useEffect, useRef } from 'react';
import { Message, Offer } from '../types';
import { generateChatResponse } from '../services/geminiService';
import { db } from '../services/db';
import { ArrowLeft, Send, CheckCircle2, X, ShieldCheck, Eye, Maximize2, AlertCircle } from 'lucide-react';

interface ChatModalProps {
    offer: Offer;
    onClose: () => void;
    onUpdateStatus: (offerId: string, status: 'accepted' | 'declined') => void;
    onEnterSwapRoom?: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ offer, onClose, onUpdateStatus, onEnterSwapRoom }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isNegotiating, setIsNegotiating] = useState(false);
    const [viewingImage, setViewingImage] = useState<string | null>(null);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const isPending = offer.status === 'pending';
    const isAccepted = offer.status === 'accepted';
    
    const showDecisionUI = isPending && !isNegotiating;
    
    // Helper to get image
    const displayImage = (offer.theirItem.images && offer.theirItem.images.length > 0) ? offer.theirItem.images[0] : 'https://via.placeholder.com/150';

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Load messages from DB
    useEffect(() => {
        const loadMessages = async () => {
            const history = await db.getMessages(offer.chatId);
            
            if (history.length === 0) {
                // First time chat: Create initial greeting
                const initialMsg: Message = {
                    id: `msg-${Date.now()}`,
                    senderId: 'them',
                    text: `Hey! I'm interested in your item.`,
                    timestamp: Date.now()
                };
                await db.saveMessage(offer.chatId, initialMsg);
                setMessages([initialMsg]);
            } else {
                setMessages(history);
            }
        };
        loadMessages();
    }, [offer.chatId]);

    useEffect(scrollToBottom, [messages, isTyping, isNegotiating]);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const myMsg: Message = {
            id: Date.now().toString(),
            senderId: 'me',
            text: inputText,
            timestamp: Date.now()
        };
        
        // Update UI immediately
        setMessages(prev => [...prev, myMsg]);
        setInputText('');
        setIsTyping(true);
        
        // Persist
        await db.saveMessage(offer.chatId, myMsg);

        // Simulate delay and AI response
        setTimeout(async () => {
            const responseText = await generateChatResponse(
                [...messages, myMsg], 
                offer.theirItem, 
                offer.theirItem, 
                offer.theirUser.name
            );
            
            const theirMsg: Message = {
                id: (Date.now() + 1).toString(),
                senderId: 'them',
                text: responseText,
                timestamp: Date.now()
            };
            
            setMessages(prev => [...prev, theirMsg]);
            await db.saveMessage(offer.chatId, theirMsg);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-3xl z-50 flex flex-col animate-in slide-in-from-bottom-full duration-300">
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/20 flex items-center justify-between bg-white/70 backdrop-blur-md shadow-sm z-10">
                <button onClick={onClose} className="p-2 -ml-2 text-slate-600 hover:bg-black/5 rounded-full transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <div className="flex flex-col items-center">
                    <span className="font-bold text-slate-900">{offer.theirUser.name}</span>
                    <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></span>
                        <span className="text-xs text-slate-500">Online</span>
                    </div>
                </div>
                
                {/* Context Action Button */}
                <div className="w-20 flex justify-end">
                     {isPending && isNegotiating && (
                         <button 
                            onClick={() => setIsNegotiating(false)}
                            className="text-xs font-bold text-pink-600 bg-pink-50/50 border border-pink-100 px-3 py-1.5 rounded-full"
                         >
                             Review
                         </button>
                     )}
                </div>
            </div>

            {/* Top Context Banner */}
            <div className="bg-white/40 backdrop-blur-sm p-3 border-b border-white/30">
                <div className="flex items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-3 flex-1">
                         <div className="flex items-center gap-2 font-bold text-slate-400 text-xs uppercase tracking-wider">
                            Their Offer
                        </div>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="relative group cursor-pointer" onClick={() => setViewingImage(displayImage)}>
                                <img src={displayImage} className="w-10 h-10 rounded-lg bg-slate-200 object-cover border border-slate-300" alt="" />
                                <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Maximize2 size={14} className="text-white" />
                                </div>
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="font-bold text-slate-900 truncate">{offer.theirItem.title}</span>
                                <span className="text-xs text-slate-500">{offer.theirItem.condition} • ${offer.theirItem.estimatedValue}</span>
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => setViewingImage(displayImage)}
                        className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-white/80 border border-white/50 px-3 py-2 rounded-lg shadow-sm active:scale-95 transition-transform hover:bg-white"
                    >
                        <Eye size={14} />
                        View Item
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent pb-32">
                {/* Safety Tip */}
                <div className="flex justify-center">
                    <div className="bg-yellow-50/80 backdrop-blur-sm border border-yellow-100 text-yellow-700 text-[10px] font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                        <AlertCircle size={12} />
                        Always meet in a public place for swaps.
                    </div>
                </div>

                {messages.map((msg) => (
                    <div 
                        key={msg.id} 
                        className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm backdrop-blur-sm ${
                            msg.senderId === 'me' 
                                ? 'bg-pink-500 text-white rounded-br-none shadow-pink-500/20' 
                                : 'bg-white/80 text-slate-700 rounded-bl-none border border-white/50'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white/60 backdrop-blur-sm text-slate-400 px-4 py-3 rounded-2xl rounded-bl-none border border-white/50 text-xs">
                            typing...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Bottom Action Area */}
            <div className="bg-white/80 backdrop-blur-xl border-t border-white/30 pb-safe z-20 shadow-[0_-5px_25px_rgba(0,0,0,0.05)]">
                {showDecisionUI ? (
                    <div className="p-4 space-y-3 animate-in slide-in-from-bottom-4 duration-300">
                        <p className="text-center text-xs text-slate-400 font-medium uppercase tracking-wide mb-2">
                            Do you want to trade with {offer.theirUser.name}?
                        </p>
                        <div className="flex gap-3 h-14">
                            <button 
                                onClick={() => onUpdateStatus(offer.id, 'declined')}
                                className="flex-1 bg-white/50 border-2 border-slate-200 text-slate-600 rounded-xl font-bold text-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 active:scale-95"
                            >
                                <X size={20} /> Decline
                            </button>
                            <button 
                                onClick={() => onUpdateStatus(offer.id, 'accepted')}
                                className="flex-1 bg-slate-900 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 active:scale-95"
                            >
                                <CheckCircle2 size={20} /> Accept
                            </button>
                        </div>
                        <button 
                            onClick={() => setIsNegotiating(true)} 
                            className="w-full text-center text-pink-600 text-sm font-bold py-2 hover:bg-pink-50/50 rounded-lg transition-colors"
                        >
                            Negotiate First
                        </button>
                    </div>
                ) : isAccepted ? (
                    <div className="p-4">
                         <div className="bg-green-50/80 backdrop-blur-sm border border-green-100 rounded-xl p-4 mb-2 flex items-center justify-between">
                             <div>
                                 <h3 className="text-green-800 font-bold flex items-center gap-2">
                                     <ShieldCheck size={18} /> Offer Accepted!
                                 </h3>
                                 <p className="text-green-600 text-xs mt-1">You agreed to swap. Time to meet up.</p>
                             </div>
                         </div>
                         <button 
                             onClick={onEnterSwapRoom}
                             className="w-full py-4 bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 animate-pulse"
                         >
                             Enter Swap Room
                         </button>
                    </div>
                ) : (
                    // Negotiate / Chat Mode
                    <div className="p-3 flex items-center gap-2 animate-in fade-in duration-300">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 bg-slate-100/50 border border-transparent focus:border-pink-500/30 text-slate-900 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500/20 transition-all"
                            autoFocus
                        />
                        <button 
                            onClick={handleSend}
                            disabled={!inputText.trim()}
                            className="p-3 bg-pink-500 text-white rounded-full shadow-lg shadow-pink-500/30 disabled:opacity-50 disabled:shadow-none transition-all active:scale-90 hover:bg-pink-600"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                )}
            </div>

            {/* Full Screen Image Modal */}
            {viewingImage && (
                <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-200">
                    <button 
                        onClick={() => setViewingImage(null)}
                        className="absolute top-4 right-4 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors z-50"
                    >
                        <X size={24} />
                    </button>
                    <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
                        <img 
                            src={viewingImage} 
                            alt="Full size item" 
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        />
                    </div>
                    <div className="p-6 pb-10 text-center">
                        <h3 className="text-white font-bold text-xl mb-1">{offer.theirItem.title}</h3>
                        <p className="text-white/60 text-sm">{offer.theirItem.description}</p>
                        <div className="flex justify-center gap-4 mt-4">
                             <span className="text-white/80 bg-white/10 px-3 py-1 rounded-full text-sm">
                                 Condition: {offer.theirItem.condition}
                             </span>
                             <span className="text-white/80 bg-white/10 px-3 py-1 rounded-full text-sm">
                                 Value: ${offer.theirItem.estimatedValue}
                             </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatModal;
