
import React, { useState, useEffect } from 'react';
import { Item, Offer, Category } from './types';
import { MOCK_USERS } from './constants';
import BottomNav from './components/BottomNav';
import Inventory from './components/Inventory';
import SwipeDeck from './components/SwipeDeck';
import Offers from './components/Offers';
import ChatModal from './components/ChatModal';
import SwapRoom from './components/SwapRoom';
import { db } from './services/db';
import { Trash2, Settings, Bell, Shield, HelpCircle, ChevronRight, LogOut, Star, Package, Zap, ArrowRightLeft } from 'lucide-react';

function App() {
  const [currentTab, setCurrentTab] = useState('swipe');
  const [inventory, setInventory] = useState<Item[]>([]);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [activeChatOffer, setActiveChatOffer] = useState<Offer | null>(null);
  const [showSwapRoom, setShowSwapRoom] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize App Data
  useEffect(() => {
    const initApp = async () => {
      db.init();
      
      const [loadedInventory, loadedOffers] = await Promise.all([
        db.getInventory(),
        db.getOffers()
      ]);
      
      setInventory(loadedInventory);
      setOffers(loadedOffers);
      
      // Restore active item or default to first
      const storedActiveId = db.getActiveItemId();
      if (storedActiveId && loadedInventory.find(i => i.id === storedActiveId)) {
        setActiveItemId(storedActiveId);
      } else if (loadedInventory.length > 0) {
        setActiveItemId(loadedInventory[0].id);
        db.setActiveItemId(loadedInventory[0].id);
      }
      
      setIsLoading(false);
    };

    initApp();
  }, []);

  const handleSetActiveItem = (id: string) => {
    setActiveItemId(id);
    db.setActiveItemId(id);
  };

  // Logic to handle a "Match"
  const handleSwipeRight = async (item: Item) => {
    // Simulation: Every 2nd right swipe matches (for demo purposes)
    const isMatch = Math.random() > 0.3; 

    if (isMatch && activeItemId) {
      setTimeout(() => {
        createMatch(item);
      }, 800);
    }
  };

  const createMatch = async (theirItem: Item) => {
    if (!activeItemId) return;

    const theirUser = MOCK_USERS.find(u => u.id === theirItem.ownerId) || MOCK_USERS[0];
    
    // Generate unique codes for 2-way verification
    const myCode = Math.floor(1000 + Math.random() * 9000).toString();
    const theirCode = Math.floor(1000 + Math.random() * 9000).toString();

    const newOffer: Offer = {
      id: `offer-${Date.now()}`,
      myItemId: activeItemId,
      theirItem: theirItem,
      theirUser: theirUser,
      status: 'pending',
      chatId: `chat-${Date.now()}`,
      createdAt: Date.now(),
      isPinned: false,
      isHidden: false,
      swapStep: 'logistics',
      myCode: myCode,
      theirCode: theirCode
    };

    await db.saveOffer(newOffer);
    setOffers(prev => [newOffer, ...prev]);
  };

  const handleAddItem = async (item: Item) => {
    await db.saveItem(item);
    setInventory(prev => [item, ...prev]);
    if (!activeItemId) handleSetActiveItem(item.id);
  };

  const handleUpdateItem = async (updatedItem: Item) => {
      await db.saveItem(updatedItem);
      setInventory(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const handleDeleteItem = async (itemId: string) => {
    await db.deleteItem(itemId);
    const newInventory = inventory.filter(i => i.id !== itemId);
    setInventory(newInventory);

    if (activeItemId === itemId) {
        if (newInventory.length > 0) {
            handleSetActiveItem(newInventory[0].id);
        } else {
            setActiveItemId(null);
            db.setActiveItemId('');
        }
    }
  };

  const updateOfferStatus = async (offerId: string, status: 'accepted' | 'declined' | 'pending') => {
    const offerToUpdate = offers.find(o => o.id === offerId);
    if (!offerToUpdate) return;

    const updatedOffer = { ...offerToUpdate, status: status };
    await db.saveOffer(updatedOffer);
    
    setOffers(prev => prev.map(o => o.id === offerId ? updatedOffer : o));
    
    // If viewing chat, update the active offer reference
    if (activeChatOffer && activeChatOffer.id === offerId) {
      setActiveChatOffer(updatedOffer);
    }
  };

  const handleUpdateOffer = async (offerId: string, updates: Partial<Offer>) => {
      const offer = offers.find(o => o.id === offerId);
      if (!offer) return;

      const updatedOffer = { ...offer, ...updates };
      await db.saveOffer(updatedOffer);
      
      setOffers(prev => prev.map(o => o.id === offerId ? updatedOffer : o));
      
      if (activeChatOffer && activeChatOffer.id === offerId) {
        setActiveChatOffer(updatedOffer);
      }
  };

  const handlePinOffer = async (offerId: string) => {
    const offer = offers.find(o => o.id === offerId);
    if (!offer) return;
    const updated = { ...offer, isPinned: !offer.isPinned };
    await db.saveOffer(updated);
    setOffers(prev => prev.map(o => o.id === offerId ? updated : o));
  };

  const handleHideOffer = async (offerId: string) => {
    const offer = offers.find(o => o.id === offerId);
    if (!offer) return;
    const updated = { ...offer, isHidden: !offer.isHidden };
    await db.saveOffer(updated);
    setOffers(prev => prev.map(o => o.id === offerId ? updated : o));
  };

  // Reset swap room when closing chat
  const closeChat = () => {
    setActiveChatOffer(null);
    setShowSwapRoom(false);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  // Render Content based on Tab
  const renderContent = () => {
    switch (currentTab) {
      case 'inventory':
        return <Inventory 
                  items={inventory} 
                  onAddItem={handleAddItem} 
                  onUpdateItem={handleUpdateItem}
                  onDeleteItem={handleDeleteItem}
                  activeItemId={activeItemId} 
                  setActiveItemId={handleSetActiveItem} 
               />;
      case 'swipe':
        return <SwipeDeck activeItemId={activeItemId} onSwipeRight={handleSwipeRight} onNavigateToInventory={() => setCurrentTab('inventory')} />;
      case 'offers':
        return <Offers 
                  offers={offers} 
                  onOpenChat={setActiveChatOffer}
                  onPinOffer={handlePinOffer}
                  onHideOffer={handleHideOffer}
               />;
      case 'profile':
        return (
          <div className="h-full flex flex-col bg-slate-50 overflow-y-auto pb-24 no-scrollbar">
            {/* Minimal Gradient Header */}
            <div className="relative bg-slate-50">
                <div className="h-40 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500" />
                
                <div className="relative -mt-12 bg-slate-50 rounded-t-[2.5rem] px-6 min-h-[calc(100vh-160px)] pb-10">
                    
                    <div className="flex justify-between items-end -mt-12 mb-6">
                        <div className="w-24 h-24 rounded-full border-[6px] border-slate-50 shadow-lg overflow-hidden bg-white">
                            <img 
                                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80" 
                                className="w-full h-full object-cover" 
                                alt="Profile" 
                            />
                        </div>
                        <button className="mb-2 px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-full shadow-xl shadow-slate-900/10 hover:bg-slate-800 active:scale-95 transition-all">
                            Edit Profile
                        </button>
                    </div>

                    {/* Name & Handle - Minimal */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-black text-slate-900">Alex Johnson</h1>
                        <p className="text-slate-500 text-sm font-medium">@alexj • San Francisco, CA</p>
                    </div>

                    {/* Settings Sections */}
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Account</h3>
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                <button className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 group">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 rounded-full bg-slate-50 text-slate-600 group-hover:bg-white group-hover:shadow-sm transition-all">
                                            <Settings size={20} />
                                        </div>
                                        <span className="font-bold text-slate-700 text-sm">Settings</span>
                                    </div>
                                    <ChevronRight size={18} className="text-slate-300" />
                                </button>

                                <button className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 group">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 rounded-full bg-blue-50 text-blue-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                                            <Bell size={20} />
                                        </div>
                                        <span className="font-bold text-slate-700 text-sm">Notifications</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md border-2 border-white">
                                            2
                                        </span>
                                        <ChevronRight size={18} className="text-slate-300" />
                                    </div>
                                </button>

                                <button className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 rounded-full bg-emerald-50 text-emerald-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                                            <Shield size={20} />
                                        </div>
                                        <span className="font-bold text-slate-700 text-sm">Privacy & Security</span>
                                    </div>
                                    <ChevronRight size={18} className="text-slate-300" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Support</h3>
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                <button className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 rounded-full bg-indigo-50 text-indigo-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                                            <HelpCircle size={20} />
                                        </div>
                                        <span className="font-bold text-slate-700 text-sm">Help Center</span>
                                    </div>
                                    <ChevronRight size={18} className="text-slate-300" />
                                </button>
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => db.reset()}
                            className="w-full py-4 rounded-2xl bg-red-50 border border-red-100 text-red-500 font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-100 transition-colors active:scale-[0.98] shadow-sm"
                        >
                            <LogOut size={18} />
                            Sign Out & Reset Demo
                        </button>
                        
                        <p className="text-center text-[10px] text-slate-400 font-bold tracking-wide pb-4">
                            Version 1.0.2 • Build 8829
                        </p>
                    </div>
                </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const pendingOffersCount = offers.filter(o => o.status === 'pending' && !o.isHidden).length;

  return (
    <div className="fixed inset-0 w-full h-full bg-[#f2f4f6] flex justify-center overflow-hidden font-sans">
        {/* Global Ambient Background */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-300/30 blur-[120px]" />
            <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-pink-300/30 blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[10%] w-[60%] h-[60%] rounded-full bg-blue-300/20 blur-[120px]" />
        </div>

        {/* Main App Container */}
        <div className="w-full h-full flex flex-col max-w-md shadow-2xl overflow-hidden relative bg-white/30 backdrop-blur-3xl border-x border-white/20 z-10">
            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden relative">
                {renderContent()}
            </div>

            {/* Navigation */}
            <BottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} badgeCount={pendingOffersCount} />

            {/* Chat Modal Overlay */}
            {activeChatOffer && (
                <ChatModal 
                    offer={activeChatOffer} 
                    onClose={closeChat} 
                    onUpdateStatus={updateOfferStatus}
                    onEnterSwapRoom={() => setShowSwapRoom(true)}
                />
            )}
            
            {/* Swap Room Overlay - Renders on top of ChatModal if active */}
            {activeChatOffer && showSwapRoom && (
                <SwapRoom 
                    offer={activeChatOffer} 
                    onClose={() => setShowSwapRoom(false)} 
                    onUpdateOffer={(updates) => handleUpdateOffer(activeChatOffer.id, updates)}
                />
            )}
        </div>
    </div>
  );
}

export default App;
