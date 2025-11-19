
import React, { useState, useEffect, useRef } from 'react';
import { Item, Category } from '../types';
import { generateSwipeItems } from '../services/geminiService';
import { MOCK_USERS, getRandomImage } from '../constants';
import { X, ArrowRightLeft, Filter, CheckCircle, ArrowRight, RotateCcw, Layers, ChevronDown, Sparkles, Search } from 'lucide-react';

interface SwipeDeckProps {
    activeItemId: string | null;
    onSwipeRight: (item: Item) => void;
    onNavigateToInventory: () => void;
}

const CardSkeleton = () => (
    <div className="relative w-full max-w-sm aspect-[3/4] bg-white/40 backdrop-blur-md rounded-3xl border border-white/50 shadow-xl overflow-hidden">
        {/* Image Placeholder Shimmer */}
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-200/40 via-slate-100/40 to-slate-200/40 animate-[shimmer_2s_infinite] bg-[length:200%_100%]"></div>
        
        {/* Badge Placeholder */}
        <div className="absolute top-4 left-4 w-20 h-6 bg-white/30 backdrop-blur-md rounded-full animate-pulse"></div>

        {/* Content Placeholder */}
        <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4 bg-gradient-to-t from-black/20 to-transparent">
             {/* Title & Price */}
             <div className="flex justify-between items-end">
                 <div className="h-8 w-2/3 bg-white/40 backdrop-blur-md rounded-lg animate-pulse"></div>
                 <div className="h-8 w-20 bg-white/40 backdrop-blur-md rounded-lg animate-pulse"></div>
             </div>
             
             {/* User Info */}
             <div className="flex items-center gap-3 mt-2">
                 <div className="h-5 w-16 bg-white/30 backdrop-blur-md rounded-md animate-pulse"></div>
                 <div className="h-1 w-1 bg-white/50 rounded-full"></div>
                 <div className="h-5 w-24 bg-white/30 backdrop-blur-md rounded-md animate-pulse"></div>
             </div>
             
             {/* Description Lines */}
             <div className="space-y-2 pt-2">
                 <div className="h-3 w-full bg-white/20 backdrop-blur-md rounded-full animate-pulse"></div>
                 <div className="h-3 w-3/4 bg-white/20 backdrop-blur-md rounded-full animate-pulse"></div>
             </div>
        </div>
    </div>
);

const SwipeDeck: React.FC<SwipeDeckProps> = ({ activeItemId, onSwipeRight, onNavigateToInventory }) => {
    const [items, setItems] = useState<Item[]>([]);
    const [history, setHistory] = useState<Item[]>([]); // For Undo
    const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category>(Category.ELECTRONICS);
    const [showFilters, setShowFilters] = useState(false);
    
    // Animation states
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (activeItemId) {
            setItems([]); // Clear items to show skeleton immediately
            loadItems();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCategory, activeItemId]);

    const loadItems = async () => {
        setLoading(true);
        try {
            const newItems = await generateSwipeItems(selectedCategory, 5);
            setItems(newItems);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const handleUndo = () => {
        if (history.length === 0) return;
        const previousItem = history[0];
        setItems([previousItem, ...items]);
        setHistory(prev => prev.slice(1));
    };

    const removeTopCard = (direction: 'left' | 'right') => {
        if (items.length === 0) return;
        const item = items[0];
        
        // Animate out
        const endX = direction === 'right' ? window.innerWidth + 200 : -window.innerWidth - 200;
        setX(endX);
        
        setTimeout(() => {
            if (direction === 'right') {
                onSwipeRight(item);
            }
            setHistory(prev => [item, ...prev]);
            setItems(prev => prev.slice(1));
            // Reset position immediately for next card
            setX(0);
            setY(0);
        }, 200);
    };

    // Touch/Mouse Handlers
    const handleStart = (clientX: number, clientY: number) => {
        if (items.length === 0) return;
        setIsDragging(true);
        setDragStart({ x: clientX, y: clientY });
    };

    const handleMove = (clientX: number, clientY: number) => {
        if (!isDragging) return;
        const deltaX = clientX - dragStart.x;
        const deltaY = clientY - dragStart.y;
        setX(deltaX);
        setY(deltaY);
    };

    const handleEnd = () => {
        setIsDragging(false);
        const threshold = 100; // Distance to trigger swipe
        if (x > threshold) {
            removeTopCard('right');
        } else if (x < -threshold) {
            removeTopCard('left');
        } else {
            // Reset spring
            setX(0);
            setY(0);
        }
    };

    // Rotation based on X displacement
    const rotation = x * 0.05;
    const opacityNope = x < 0 ? Math.min(Math.abs(x) / 100, 1) : 0;
    const opacityLike = x > 0 ? Math.min(x / 100, 1) : 0;

    // Helper to get owner details
    const getOwner = (ownerId: string) => {
        return MOCK_USERS.find(u => u.id === ownerId);
    };

    // Helper to safely get display image
    const getDisplayImage = (item: Item) => {
        if (item.images && item.images.length > 0) {
            return item.images[0];
        }
        return getRandomImage(item.category);
    }

    if (!activeItemId) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6 bg-transparent">
                <div className="w-24 h-24 bg-white/50 backdrop-blur-xl rounded-full flex items-center justify-center shadow-xl shadow-purple-100/50 mb-2 relative border border-white/50">
                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-slate-200 animate-[spin_10s_linear_infinite]"></div>
                    <Layers className="text-slate-400" size={32} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Ready to Swap?</h2>
                    <p className="text-slate-500 max-w-xs mt-2 mx-auto">
                        Select an item from your inventory to offer in exchange before you start swiping.
                    </p>
                </div>
                <button 
                    onClick={onNavigateToInventory}
                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg shadow-slate-900/20 flex items-center gap-2 hover:scale-105 transition-transform"
                >
                    Select My Offer <ArrowRight size={18} />
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full relative overflow-hidden bg-transparent">
            
            {/* UNIFIED EXPANDING HEADER */}
            <div className={`absolute top-0 left-0 right-0 z-50 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${
                showFilters 
                ? 'bg-white/90 backdrop-blur-2xl shadow-2xl rounded-b-[2.5rem] border-b border-white/50' 
                : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent'
            }`}>
                <div className="px-6 pt-6 pb-4 flex justify-between items-center">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setShowFilters(!showFilters)}>
                            <h1 className={`text-2xl font-black tracking-tighter transition-colors duration-300 ${
                                showFilters ? 'text-slate-900' : 'text-white drop-shadow-md'
                            }`}>
                                SwipeSwap
                            </h1>
                            {/* Animated Badge */}
                            <div className={`transition-all duration-500 ${showFilters ? 'opacity-0 -translate-x-4 w-0 overflow-hidden' : 'opacity-100 translate-x-0 w-auto'}`}>
                                <span className="text-[10px] font-black text-white bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/30 uppercase tracking-wider shadow-sm">
                                    {selectedCategory}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Undo Button (Hidden when filters open) */}
                        {history.length > 0 && !showFilters && (
                             <button 
                                onClick={handleUndo}
                                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center hover:bg-white/30 active:scale-95 transition-all shadow-sm"
                                aria-label="Undo"
                            >
                                <RotateCcw size={18} />
                            </button>
                        )}
                        
                        {/* Filter Toggle */}
                        <button 
                            onClick={() => setShowFilters(!showFilters)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 ${
                                showFilters 
                                ? 'bg-slate-900 text-white border-slate-900 rotate-180 shadow-lg' 
                                : 'bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-md'
                            }`}
                        >
                            <ChevronDown size={20} />
                        </button>
                    </div>
                </div>

                {/* Collapsible Filter Content */}
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showFilters ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-6 pb-8 pt-2">
                        <div className="flex items-center gap-2 mb-4 text-slate-400 px-1">
                            <Search size={14} className="text-pink-500" />
                            <span className="text-xs font-extrabold uppercase tracking-widest">I want to find...</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2.5">
                            {Object.values(Category).map((cat, idx) => {
                                const isSelected = selectedCategory === cat;
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => { 
                                            if (selectedCategory !== cat) {
                                                setItems([]); // Trigger skeleton
                                                setSelectedCategory(cat); 
                                            }
                                            setShowFilters(false); 
                                        }}
                                        style={{ animationDelay: `${idx * 30}ms` }}
                                        className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 border animate-in slide-in-from-top-2 fill-mode-backwards ${
                                            isSelected 
                                            ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20 scale-105' 
                                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-white hover:border-pink-200 hover:text-pink-600 hover:shadow-md'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Full Screen Backdrop when filters are open */}
            <div 
                className={`absolute inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-500 ${showFilters ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setShowFilters(false)}
            />

            {/* Card Deck */}
            <div className="flex-1 relative flex items-center justify-center px-4 pb-28 overflow-hidden mt-12">
                {loading && items.length === 0 ? (
                    <div className="animate-in zoom-in duration-300 w-full max-w-sm flex justify-center">
                        <CardSkeleton />
                    </div>
                ) : items.length === 0 ? (
                     <div className="text-center p-8 max-w-xs animate-in zoom-in duration-300 bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50">
                        <div className="w-24 h-24 bg-pink-50/50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg">
                            <CheckCircle className="text-pink-500" size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800">All caught up!</h3>
                        <p className="text-slate-500 mt-2 mb-8">No more items in {selectedCategory} right now.</p>
                        <button 
                            onClick={loadItems}
                            className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-colors active:scale-95"
                        >
                            Refresh List
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Background cards for depth */}
                        {items.length > 1 && (
                            <div className="absolute w-full max-w-sm aspect-[3/4] bg-white/40 backdrop-blur-md rounded-3xl shadow-xl transform scale-95 translate-y-6 opacity-40 z-0 border border-white/30" />
                        )}
                        {items.length > 1 && (
                            <div className="absolute w-full max-w-sm aspect-[3/4] bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl transform scale-[0.97] translate-y-3 opacity-60 z-0 border border-white/40 transition-transform duration-200" 
                                 style={{ transform: isDragging ? 'scale(0.99) translateY(5px)' : undefined }}
                            />
                        )}
                        
                        {/* Top Card */}
                        <div 
                            ref={cardRef}
                            className="absolute w-full max-w-sm aspect-[3/4] bg-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden cursor-grab active:cursor-grabbing z-20 select-none ring-1 ring-black/5 will-change-transform"
                            style={{
                                transform: `translate(${x}px, ${y}px) rotate(${rotation}deg)`,
                                transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            }}
                            onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
                            onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
                            onTouchEnd={handleEnd}
                            onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
                            onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
                            onMouseUp={handleEnd}
                            onMouseLeave={handleEnd}
                        >
                            {/* Full Bleed Image with Parallax */}
                            <img 
                                src={getDisplayImage(items[0])} 
                                alt={items[0].title} 
                                className="absolute inset-0 w-full h-full object-cover pointer-events-none will-change-transform" 
                                draggable={false}
                                style={{
                                    // Parallax Effect:
                                    // 1. Scale up to 115% to ensure no white edges show when translating
                                    // 2. Translate X in opposite direction of card drag (x) to create depth
                                    transform: `scale(1.15) translateX(${-x * 0.08}px)`,
                                    transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                }}
                            />

                            {/* Subtle Gradient Overlay for Text Legibility */}
                            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/90" />

                            {/* Category Badge Top Left */}
                            <div className="absolute top-4 left-4">
                                <span className="bg-black/30 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/20">
                                    {items[0].category}
                                </span>
                            </div>

                            {/* Overlays */}
                            <div 
                                className="absolute top-8 left-8 border-4 border-green-400 rounded-xl px-4 py-2 z-30 transform -rotate-12 transition-opacity bg-black/20 backdrop-blur-sm pointer-events-none shadow-lg"
                                style={{ opacity: opacityLike }}
                            >
                                <span className="text-green-400 font-black text-4xl uppercase tracking-widest drop-shadow-sm">SWAP</span>
                            </div>
                            <div 
                                className="absolute top-8 right-8 border-4 border-red-500 rounded-xl px-4 py-2 z-30 transform rotate-12 transition-opacity bg-black/20 backdrop-blur-sm pointer-events-none shadow-lg"
                                style={{ opacity: opacityNope }}
                            >
                                <span className="text-red-500 font-black text-4xl uppercase tracking-widest drop-shadow-sm">PASS</span>
                            </div>

                            {/* Content Area - Bottom */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
                                <div className="flex justify-between items-end mb-2">
                                    <h2 className="text-3xl font-bold leading-none drop-shadow-md line-clamp-2 pr-4">
                                        {items[0].title}
                                    </h2>
                                    <div className="flex flex-col items-end shrink-0">
                                        <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/30 text-white font-mono font-bold text-lg shadow-sm">
                                            ${items[0].estimatedValue}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-xs font-bold bg-white/10 backdrop-blur-sm px-2 py-1 rounded border border-white/10">
                                        {items[0].condition}
                                    </span>
                                    <div className="h-1 w-1 bg-white/50 rounded-full" />
                                    <div className="flex items-center gap-2">
                                        <span className="text-white/70 text-xs font-medium">
                                            {getOwner(items[0].ownerId)?.name || 'User'}
                                        </span>
                                        <span className="flex items-center gap-0.5 bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded text-[10px] font-bold backdrop-blur-sm border border-yellow-500/30">
                                            {getOwner(items[0].ownerId)?.rating || '4.8'} ★
                                        </span>
                                    </div>
                                </div>

                                <p className="text-white/80 text-sm leading-relaxed line-clamp-2 font-light drop-shadow-sm mb-2">
                                    {items[0].description}
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Action Buttons */}
            <div className="absolute bottom-28 left-0 right-0 flex justify-center gap-6 pointer-events-none z-30">
                 {items.length > 0 && (
                     <>
                        <button 
                            onClick={() => removeTopCard('left')}
                            className="w-16 h-16 bg-white/80 backdrop-blur-md text-slate-400 rounded-full shadow-xl flex items-center justify-center pointer-events-auto transition-all active:scale-90 hover:text-red-500 hover:bg-white ring-1 ring-white/50 hover:scale-105"
                            aria-label="Pass"
                        >
                            <X size={32} strokeWidth={2.5} />
                        </button>
                        
                        <button 
                             onClick={() => removeTopCard('right')}
                             className="w-20 h-20 bg-slate-900/90 backdrop-blur-md text-white rounded-full shadow-2xl shadow-slate-900/30 flex items-center justify-center pointer-events-auto transition-all active:scale-90 hover:-translate-y-1 hover:shadow-3xl ring-4 ring-white/20"
                             aria-label="Swap"
                        >
                            <ArrowRightLeft size={36} strokeWidth={2.5} />
                        </button>
                     </>
                 )}
            </div>
        </div>
    );
};

export default SwipeDeck;
