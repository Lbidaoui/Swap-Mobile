
import React, { useState, useRef } from 'react';
import { Item, Category } from '../types';
import { Plus, CheckCircle2, Tag, DollarSign, Edit2, RefreshCw, Sparkles, PackageOpen, X, ImagePlus, Trash2, AlertTriangle, BarChart3 } from 'lucide-react';
import { CURRENT_USER_ID, getRandomImage } from '../constants';

interface InventoryProps {
    items: Item[];
    onAddItem: (item: Item) => void;
    onUpdateItem: (item: Item) => void;
    onDeleteItem: (itemId: string) => void;
    activeItemId: string | null;
    setActiveItemId: (id: string) => void;
}

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

const Inventory: React.FC<InventoryProps> = ({ items, onAddItem, onUpdateItem, onDeleteItem, activeItemId, setActiveItemId }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    
    // Form State
    const [itemId, setItemId] = useState('');
    const [itemTitle, setItemTitle] = useState('');
    const [itemDesc, setItemDesc] = useState('');
    const [itemCategory, setItemCategory] = useState<Category>(Category.ELECTRONICS);
    const [itemCondition, setItemCondition] = useState<string>('Good');
    const [itemValue, setItemValue] = useState('');
    const [itemImages, setItemImages] = useState<string[]>([]);
    
    // Delete Confirmation State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const openAddModal = () => {
        setEditMode(false);
        setItemId('');
        setItemTitle('');
        setItemDesc('');
        setItemCategory(Category.ELECTRONICS);
        setItemCondition('Good');
        setItemValue('');
        setItemImages([getRandomImage(Category.ELECTRONICS)]);
        setShowDeleteConfirm(false);
        setIsModalOpen(true);
    };

    const openEditModal = (item: Item, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditMode(true);
        setItemId(item.id);
        setItemTitle(item.title);
        setItemDesc(item.description);
        setItemCategory(item.category);
        setItemCondition(item.condition);
        setItemValue(item.estimatedValue.toString());
        setItemImages(item.images || [getRandomImage(item.category)]);
        setShowDeleteConfirm(false);
        setIsModalOpen(true);
    };

    const handleAddRandomImage = () => {
        if (itemImages.length >= 5) return;
        setItemImages(prev => [...prev, getRandomImage(itemCategory)]);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files) as File[];
            const remainingSlots = 5 - itemImages.length;
            const filesToProcess = files.slice(0, remainingSlots);

            filesToProcess.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (reader.result) {
                        setItemImages(prev => {
                            if (prev.length >= 5) return prev;
                            return [...prev, reader.result as string];
                        });
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeImage = (index: number) => {
        setItemImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const finalImages = itemImages.length > 0 ? itemImages : [getRandomImage(itemCategory)];

        const newItem: Item = {
            id: editMode ? itemId : `my-item-${Date.now()}`,
            ownerId: CURRENT_USER_ID,
            title: itemTitle,
            description: itemDesc,
            category: itemCategory,
            condition: itemCondition as 'New' | 'Like New' | 'Good' | 'Fair',
            estimatedValue: Number(itemValue) || 0,
            images: finalImages
        };

        if (editMode) {
            onUpdateItem(newItem);
        } else {
            onAddItem(newItem);
        }
        setIsModalOpen(false);
    };

    const handleConfirmDelete = () => {
        onDeleteItem(itemId);
        setIsModalOpen(false);
    };

    const activeItem = items.find(i => i.id === activeItemId);

    if (isModalOpen) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col animate-in slide-in-from-bottom-10 duration-300">
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                <div className="absolute inset-x-0 bottom-0 top-8 bg-white/90 backdrop-blur-2xl rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-t border-white/40 flex flex-col overflow-hidden">
                    
                    {/* Modal Header */}
                    <div className="px-6 py-4 border-b border-white/40 flex justify-between items-center bg-white/40">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            {editMode ? <Edit2 size={20} className="text-pink-500" /> : <Sparkles size={20} className="text-pink-500" />}
                            {editMode ? 'Edit Item' : 'New Item'}
                        </h2>
                        <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white/50 rounded-full hover:bg-white text-slate-500 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 pb-32">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Image Upload Section */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                     <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Photos ({itemImages.length}/5)</label>
                                     <button 
                                        type="button"
                                        onClick={handleAddRandomImage}
                                        className="text-[10px] font-bold text-pink-600 bg-pink-50 px-2 py-1 rounded-md hover:bg-pink-100"
                                     >
                                         + Add Demo Photo
                                     </button>
                                </div>
                                
                                {/* Main Preview */}
                                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 shadow-inner border border-white/50 group">
                                    {itemImages.length > 0 ? (
                                        <img src={itemImages[0]} alt="Main Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                            <ImagePlus size={40} className="mb-2 opacity-50" />
                                            <p className="text-xs font-medium">No images selected</p>
                                        </div>
                                    )}
                                </div>

                                {/* Thumbnails */}
                                <div className="flex gap-2 overflow-x-auto pb-2 snap-x no-scrollbar">
                                    {itemImages.map((img, idx) => (
                                        <div key={idx} className="relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-sm snap-start group">
                                            <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                                            <button 
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                            >
                                                <X size={12} />
                                            </button>
                                            {idx === 0 && (
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[8px] font-bold text-center py-0.5">COVER</div>
                                            )}
                                        </div>
                                    ))}
                                    
                                    {itemImages.length < 5 && (
                                        <button 
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="shrink-0 w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:border-pink-400 hover:text-pink-500 transition-colors bg-slate-50"
                                        >
                                            <Plus size={24} />
                                            <span className="text-[9px] font-bold mt-1">ADD</span>
                                        </button>
                                    )}
                                    <input 
                                        type="file" 
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept="image/*"
                                        multiple
                                    />
                                </div>
                            </div>

                            {/* Fields */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Title</label>
                                    <input 
                                        required
                                        type="text" 
                                        value={itemTitle}
                                        onChange={e => setItemTitle(e.target.value)}
                                        className="w-full p-4 rounded-xl border border-white/60 bg-white/40 focus:bg-white/70 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none transition-all text-slate-900 font-medium shadow-sm placeholder:text-slate-400"
                                        placeholder="What are you trading?"
                                    />
                                </div>

                                {/* Row 1: Category & Condition */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Category</label>
                                        <div className="relative">
                                            <select 
                                                value={itemCategory}
                                                onChange={e => setItemCategory(e.target.value as Category)}
                                                className="w-full p-4 rounded-xl border border-white/60 bg-white/40 focus:bg-white/70 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none appearance-none text-slate-900 font-medium shadow-sm"
                                            >
                                                {Object.values(Category).map(c => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                            <Tag className="absolute right-4 top-4 text-slate-400 pointer-events-none" size={18} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Condition</label>
                                        <div className="relative">
                                            <select 
                                                value={itemCondition}
                                                onChange={e => setItemCondition(e.target.value)}
                                                className="w-full p-4 rounded-xl border border-white/60 bg-white/40 focus:bg-white/70 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none appearance-none text-slate-900 font-medium shadow-sm"
                                            >
                                                {CONDITIONS.map(c => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                            <BarChart3 className="absolute right-4 top-4 text-slate-400 pointer-events-none" size={18} />
                                        </div>
                                    </div>
                                </div>

                                {/* Row 2: Value */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Estimated Value ($)</label>
                                    <div className="relative">
                                        <input 
                                            required
                                            type="number" 
                                            value={itemValue}
                                            onChange={e => setItemValue(e.target.value)}
                                            className="w-full p-4 pl-10 rounded-xl border border-white/60 bg-white/40 focus:bg-white/70 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none text-slate-900 font-medium shadow-sm placeholder:text-slate-400"
                                            placeholder="0.00"
                                        />
                                        <DollarSign className="absolute left-3 top-4 text-slate-400 pointer-events-none" size={18} />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Description</label>
                                    <textarea 
                                        required
                                        value={itemDesc}
                                        onChange={e => setItemDesc(e.target.value)}
                                        className="w-full p-4 rounded-xl border border-white/60 bg-white/40 focus:bg-white/70 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none h-32 resize-none text-slate-900 font-medium shadow-sm placeholder:text-slate-400"
                                        placeholder="Describe the condition, age, and any details..."
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-pink-500 to-violet-600 shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-all active:scale-[0.98]"
                            >
                                {editMode ? 'Save Changes' : 'List Item'}
                            </button>

                            {/* Custom Delete UI */}
                            {editMode && (
                                <div className="pt-2">
                                    {!showDeleteConfirm ? (
                                        <button 
                                            type="button"
                                            onClick={() => setShowDeleteConfirm(true)}
                                            className="w-full py-4 rounded-xl font-bold text-red-500 bg-red-50 border border-red-100 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Trash2 size={20} />
                                            Delete Item
                                        </button>
                                    ) : (
                                        <div className="bg-red-50 border border-red-100 rounded-xl p-4 animate-in zoom-in-95 duration-200">
                                            <div className="flex flex-col items-center mb-3 text-center">
                                                <div className="w-10 h-10 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-2">
                                                    <AlertTriangle size={20} />
                                                </div>
                                                <p className="font-bold text-slate-900">Are you sure?</p>
                                                <p className="text-xs text-slate-500">This action cannot be undone.</p>
                                            </div>
                                            <div className="flex gap-3">
                                                <button 
                                                    type="button"
                                                    onClick={() => setShowDeleteConfirm(false)}
                                                    className="flex-1 py-3 rounded-lg font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={handleConfirmDelete}
                                                    className="flex-1 py-3 rounded-lg font-bold text-white bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/20 transition-colors"
                                                >
                                                    Yes, Delete
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-transparent">
            {/* Header */}
            <div className="px-6 pt-6 pb-2 bg-white/60 backdrop-blur-xl sticky top-0 z-10 border-b border-white/30 shadow-sm z-20">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Stash</h1>
                        <p className="text-slate-500 font-medium text-sm">Manage your tradeables</p>
                    </div>
                    <button 
                        onClick={openAddModal}
                        className="w-10 h-10 bg-slate-900 text-white rounded-full shadow-lg hover:bg-slate-800 transition-all active:scale-90 flex items-center justify-center"
                    >
                        <Plus size={20} strokeWidth={3} />
                    </button>
                </div>

                {/* Active Item Strip */}
                {items.length > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-3 flex items-center justify-between mb-2 shadow-sm">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0 shadow-md shadow-blue-200">
                                <RefreshCw className="text-white animate-spin-slow" size={14} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Currently Trading</p>
                                <p className="text-sm font-bold text-slate-800 truncate">{activeItem?.title || 'Select an item'}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Grid Content */}
            <div className="p-4 pb-32 overflow-y-auto flex-1">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
                        <div className="w-24 h-24 bg-white/40 backdrop-blur-md rounded-3xl flex items-center justify-center mb-6 border border-white/50 shadow-lg rotate-3">
                            <PackageOpen className="text-pink-400" size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Your stash is empty</h3>
                        <p className="text-slate-500 max-w-xs mt-2 mb-8 leading-relaxed">
                            Upload items you don't use anymore to start trading with others.
                        </p>
                        <button 
                            onClick={openAddModal}
                            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-900/20 hover:scale-105 transition-transform"
                        >
                            List Your First Item
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {items.map((item, index) => {
                            const isActive = activeItemId === item.id;
                            const displayImage = (item.images && item.images.length > 0) 
                                ? item.images[0] 
                                : getRandomImage(item.category);

                            return (
                                <div 
                                    key={item.id} 
                                    onClick={() => setActiveItemId(item.id)}
                                    className={`relative group rounded-3xl overflow-hidden transition-all duration-300 cursor-pointer flex flex-col ${
                                        isActive 
                                        ? 'ring-2 ring-pink-500 shadow-xl shadow-pink-500/20 scale-[1.02] z-10 bg-white' 
                                        : 'bg-white/40 backdrop-blur-sm border border-white/50 hover:bg-white/60 hover:border-white/80 shadow-sm hover:shadow-md'
                                    }`}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    {/* Image Area */}
                                    <div className="relative aspect-square overflow-hidden bg-slate-100">
                                        <img 
                                            src={displayImage} 
                                            alt={item.title} 
                                            className={`w-full h-full object-cover transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} 
                                        />
                                        
                                        <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${isActive ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`} />

                                        {/* Active Badge */}
                                        {isActive && (
                                            <div className="absolute top-3 right-3 bg-pink-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1 animate-in zoom-in">
                                                <CheckCircle2 size={10} /> ACTIVE
                                            </div>
                                        )}

                                        {/* Value Tag */}
                                        <div className="absolute bottom-2 left-2 bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg border border-white/10">
                                            ${item.estimatedValue}
                                        </div>
                                    </div>

                                    {/* Details Area */}
                                    <div className="p-3 flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className={`font-bold text-sm leading-tight mb-1 ${isActive ? 'text-pink-600' : 'text-slate-800'}`}>
                                                {item.title}
                                            </h3>
                                            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">
                                                {item.category}
                                            </p>
                                        </div>
                                        
                                        <div className="flex justify-between items-end mt-3">
                                            <span className="text-[10px] text-slate-500 bg-white/60 border border-white px-2 py-0.5 rounded-md font-medium shadow-sm">
                                                {item.condition}
                                            </span>
                                            <button 
                                                onClick={(e) => openEditModal(item, e)}
                                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-black/5 rounded-full transition-colors"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Inventory;
