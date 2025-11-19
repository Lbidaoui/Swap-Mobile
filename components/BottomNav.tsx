
import React from 'react';
import { Archive, Layers, MessageSquare, User } from 'lucide-react';

interface BottomNavProps {
    currentTab: string;
    setCurrentTab: (tab: string) => void;
    badgeCount?: number;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentTab, setCurrentTab, badgeCount }) => {
    const navItems = [
        { id: 'inventory', icon: Archive, label: 'My Stash' },
        { id: 'swipe', icon: Layers, label: 'Swap' },
        { id: 'offers', icon: MessageSquare, label: 'Offers' },
        { id: 'profile', icon: User, label: 'Profile' },
    ];

    return (
        <div className="fixed bottom-6 left-6 right-6 h-[72px] bg-white/90 backdrop-blur-xl rounded-3xl border border-white/50 shadow-[0_20px_40px_rgba(0,0,0,0.1)] flex justify-around items-center px-2 z-50 ring-1 ring-black/5">
            {navItems.map((item) => {
                const isActive = currentTab === item.id;
                const Icon = item.icon;
                return (
                    <button
                        key={item.id}
                        onClick={() => setCurrentTab(item.id)}
                        className="relative flex flex-col items-center justify-center w-16 h-full group"
                    >
                        {isActive && (
                            <div className="absolute top-2 w-10 h-10 bg-pink-50 rounded-2xl -z-10 animate-in zoom-in duration-300" />
                        )}
                        
                        <div className={`transition-all duration-300 transform ${isActive ? 'translate-y-[-2px] text-pink-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                            <Icon 
                                size={24} 
                                strokeWidth={isActive ? 2.5 : 2} 
                                fill={isActive ? "currentColor" : "none"}
                                className={isActive ? 'opacity-100' : 'opacity-80'}
                            />
                        </div>
                        
                        <span className={`text-[10px] font-bold mt-1 transition-all duration-300 ${isActive ? 'text-pink-600 opacity-100 scale-105' : 'text-slate-400 opacity-0 group-hover:opacity-100 scale-90 translate-y-2'}`}>
                            {item.label}
                        </span>

                        {item.id === 'offers' && badgeCount && badgeCount > 0 ? (
                            <span className="absolute top-3 right-2 bg-pink-500 text-white text-[10px] font-bold px-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full shadow-md border-2 border-white animate-pulse">
                                {badgeCount}
                            </span>
                        ) : null}
                    </button>
                );
            })}
        </div>
    );
};

export default BottomNav;
