
import React, { useState, useRef } from 'react';
import { Offer } from '../types';
import { MessageSquare, ArrowRightLeft, Clock, XCircle, CheckCircle, Pin, EyeOff, Eye } from 'lucide-react';

interface OffersProps {
    offers: Offer[];
    onOpenChat: (offer: Offer) => void;
    onPinOffer: (offerId: string) => void;
    onHideOffer: (offerId: string) => void;
}

interface SwipeableOfferProps {
    offer: Offer;
    onOpen: () => void;
    onPin: () => void;
    onHide: () => void;
}

const SwipeableOffer: React.FC<SwipeableOfferProps> = ({ offer, onOpen, onPin, onHide }) => {
    const [offset, setOffset] = useState(0);
    const startX = useRef(0);
    const startY = useRef(0);
    const isDragging = useRef(false);
    const isScrolling = useRef(false);
    
    // Threshold for triggering action
    const TRIGGER_THRESHOLD = 100;

    const handleTouchStart = (e: React.TouchEvent) => {
        startX.current = e.touches[0].clientX;
        startY.current = e.touches[0].clientY;
        isDragging.current = true;
        isScrolling.current = false;
        setOffset(0); 
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging.current || isScrolling.current) return;

        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const diffX = currentX - startX.current;
        const diffY = currentY - startY.current;

        // Lock direction on first significant move
        if (Math.abs(diffX) < 5 && Math.abs(diffY) < 5) return;

        if (Math.abs(diffY) > Math.abs(diffX)) {
            isScrolling.current = true;
            return;
        }

        // Horizontal swipe detected
        // Limit swipe distance slightly for elasticity feel
        const dampedDiff = diffX > 0 
            ? Math.pow(diffX, 0.8) // Swipe Right (Pin)
            : -Math.pow(Math.abs(diffX), 0.8); // Swipe Left (Hide)
        
        setOffset(dampedDiff);
    };

    const handleTouchEnd = () => {
        isDragging.current = false;
        
        if (offset > TRIGGER_THRESHOLD) {
            onPin();
        } else if (offset < -TRIGGER_THRESHOLD) {
            onHide();
        }
        
        setOffset(0);
    };

    const getActionColor = () => {
        if (offset > 50) return 'bg-blue-500'; // Pin Color
        if (offset < -50) return 'bg-slate-500'; // Hide Color
        return 'bg-transparent';
    };

    // Image helper
    const displayImage = (offer.theirItem.images && offer.theirItem.images.length > 0) 
        ? offer.theirItem.images[0] 
        : 'https://via.placeholder.com/150';

    return (
        <div className="relative overflow-hidden rounded-xl group select-none mb-3">
            {/* Background Actions Layer */}
            <div className={`absolute inset-0 flex items-center justify-between px-6 transition-colors duration-200 ${getActionColor()}`}>
                {/* Left Icon (Pin) */}
                <div className={`flex items-center gap-2 font-bold text-white transition-opacity duration-200 ${offset > 50 ? 'opacity-100' : 'opacity-0'}`}>
                    <Pin size={24} fill={offer.isPinned ? "white" : "none"} />
                    <span>{offer.isPinned ? 'Unpin' : 'Pin'}</span>
                </div>
                
                {/* Right Icon (Hide) */}
                <div className={`flex items-center gap-2 font-bold text-white transition-opacity duration-200 ${offset < -50 ? 'opacity-100' : 'opacity-0'}`}>
                    <span>{offer.isHidden ? 'Unhide' : 'Hide'}</span>
                    <EyeOff size={24} />
                </div>
            </div>

            {/* Foreground Card */}
            <div 
                className="bg-white/40 backdrop-blur-md p-4 shadow-sm border border-white/50 relative transition-transform duration-75 ease-linear active:cursor-grabbing touch-pan-y"
                style={{ 
                    transform: `translate3d(${offset}px, 0, 0)`,
                    touchAction: 'pan-y' 
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={() => {
                    if (Math.abs(offset) < 5) onOpen();
                }}
            >
                <div className="flex gap-4">
                    <div className="relative">
                        <img 
                            src={displayImage} 
                            alt={offer.theirItem.title}
                            className="w-16 h-16 rounded-lg object-cover bg-slate-100 pointer-events-none"
                        />
                        <div className="absolute -bottom-2 -right-2">
                            <img 
                                src={offer.theirUser.avatarUrl} 
                                alt={offer.theirUser.name} 
                                className="w-8 h-8 rounded-full border-2 border-white shadow-sm pointer-events-none"
                            />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                                {offer.isPinned && <Pin size={12} className="text-blue-500 fill-blue-500" />}
                                {offer.theirItem.title}
                            </h3>
                            <span className="text-xs text-slate-400 whitespace-nowrap flex items-center gap-1">
                                {new Date(offer.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">Offered by {offer.theirUser.name}</p>
                        
                        <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {offer.status === 'pending' && (
                                    <span className="bg-yellow-100/80 text-yellow-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
                                        <Clock size={10} /> ACTION REQUIRED
                                    </span>
                                )}
                                {offer.status === 'accepted' && (
                                    <span className="bg-green-100/80 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
                                        <CheckCircle size={10} /> SWAP ROOM OPEN
                                    </span>
                                )}
                                {offer.status === 'declined' && (
                                    <span className="bg-red-100/80 text-red-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
                                        <XCircle size={10} /> DECLINED
                                    </span>
                                )}
                            </div>
                            <div className="text-slate-400">
                                <MessageSquare size={18} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Offers: React.FC<OffersProps> = ({ offers, onOpenChat, onPinOffer, onHideOffer }) => {
    const [showHidden, setShowHidden] = useState(false);

    // Sort offers: Pinned first, then by Status, then by Date
    const sortedOffers = [...offers]
        .filter(o => showHidden ? o.isHidden : !o.isHidden)
        .sort((a, b) => {
            // 1. Pinned Status
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            
            // 2. Offer Status (Pending > Accepted/Declined)
            if (a.status === 'pending' && b.status !== 'pending') return -1;
            if (a.status !== 'pending' && b.status === 'pending') return 1;
            
            // 3. Date Descending
            return b.createdAt - a.createdAt;
        });

    return (
        <div className="flex flex-col h-full bg-transparent">
            <div className="p-6 pb-4 bg-white/30 backdrop-blur-lg sticky top-0 z-10 border-b border-white/20 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Offers & Matches</h1>
                    <p className="text-sm text-slate-600">Swipe right to pin, left to hide.</p>
                </div>
                <button 
                    onClick={() => setShowHidden(!showHidden)}
                    className={`p-2 rounded-full transition-colors ${showHidden ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-white/50'}`}
                >
                    {showHidden ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24">
                {offers.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-white/40 backdrop-blur-md border border-white/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 shadow-sm">
                            <ArrowRightLeft size={24} />
                        </div>
                        <h3 className="text-lg font-medium text-slate-700">No offers yet</h3>
                        <p className="text-slate-500 text-sm mt-1">Swipe right on items to find a match!</p>
                    </div>
                )}

                {sortedOffers.length === 0 && offers.length > 0 && !showHidden && (
                     <div className="text-center py-10">
                        <p className="text-slate-400 text-sm">All offers are hidden.</p>
                        <button onClick={() => setShowHidden(true)} className="text-pink-600 font-bold text-sm mt-2">View Hidden</button>
                    </div>
                )}

                {sortedOffers.map((offer) => (
                    <SwipeableOffer 
                        key={offer.id}
                        offer={offer}
                        onOpen={() => onOpenChat(offer)}
                        onPin={() => onPinOffer(offer.id)}
                        onHide={() => onHideOffer(offer.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default Offers;
