
import React, { useState } from 'react';
import { Offer } from '../types';
import { QrCode, MapPin, Check, ShieldCheck, ArrowRightLeft, X, Calendar, Clock, Lock, Star, ThumbsUp, Sparkles } from 'lucide-react';

interface SwapRoomProps {
    offer: Offer;
    onClose: () => void;
    onUpdateOffer: (updates: Partial<Offer>) => void;
}

const SwapRoom: React.FC<SwapRoomProps> = ({ offer, onClose, onUpdateOffer }) => {
    // Initialize state from persisted offer data
    const isSwapped = offer.status === 'swapped';
    const [step, setStep] = useState<'logistics' | 'verify' | 'complete' | 'success'>(
        isSwapped ? 'success' : (offer.swapStep || 'logistics')
    );
    
    const initialDate = offer.meetingDetails?.datetime ? offer.meetingDetails.datetime.split('T')[0] : '';
    const initialTime = offer.meetingDetails?.datetime ? offer.meetingDetails.datetime.split('T')[1] : '';

    const [location, setLocation] = useState(offer.meetingDetails?.location || '');
    const [date, setDate] = useState(initialDate);
    const [time, setTime] = useState(initialTime);

    // Code Verification State
    const [inputCode, setInputCode] = useState('');
    const [error, setError] = useState(false);
    
    // Review State
    const [rating, setRating] = useState(offer.userRating || 0);

    // Stepper Configuration
    const steps = [
        { id: 'logistics', label: 'Plan', icon: MapPin },
        { id: 'verify', label: 'Verify', icon: ShieldCheck },
        { id: 'complete', label: 'Swap', icon: Lock },
    ];

    const getStepStatus = (stepId: string) => {
        if (step === 'success') return 'completed';
        const order = ['logistics', 'verify', 'complete'];
        const currentIdx = order.indexOf(step);
        const stepIdx = order.indexOf(stepId);
        if (stepIdx < currentIdx) return 'completed';
        if (stepIdx === currentIdx) return 'active';
        return 'pending';
    };

    const handleConfirmLogistics = (e: React.FormEvent) => {
        e.preventDefault();
        
        const datetime = `${date}T${time}`;
        const updates: Partial<Offer> = {
            meetingDetails: {
                location,
                datetime
            },
            swapStep: 'verify'
        };
        
        onUpdateOffer(updates);
        setStep('verify');
    };

    const handleVerify = () => {
        const updates: Partial<Offer> = {
            swapStep: 'complete'
        };
        onUpdateOffer(updates);
        setStep('complete');
    };

    const handleCodeInput = (val: string) => {
        if (val.length <= 4) {
            setInputCode(val);
            setError(false);
        }
    };

    const handleSubmitCode = () => {
        // Verify against the stored "theirCode" (the code they are supposed to have)
        if (inputCode === offer.theirCode) {
            const updates: Partial<Offer> = {
                status: 'swapped',
                swapStep: 'complete' // Keep it here so we know flow is done
            };
            onUpdateOffer(updates);
            setStep('success');
        } else {
            setError(true);
            // Shake animation trigger could go here
        }
    };

    const handleSubmitReview = () => {
        onUpdateOffer({ userRating: rating });
        onClose();
    };

    // Helper to get image
    const displayImage = (offer.theirItem.images && offer.theirItem.images.length > 0) ? offer.theirItem.images[0] : 'https://via.placeholder.com/150';

    // Fallback codes if old data without codes
    const myDisplayCode = offer.myCode || '8829';
    const targetCode = offer.theirCode || '1234';

    return (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-3xl z-50 flex flex-col animate-in zoom-in-95 duration-300">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-white text-center pb-16 relative overflow-hidden shrink-0">
                <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-pink-500 to-transparent"></div>
                <h2 className="text-2xl font-bold relative z-10">Swap Room</h2>
                <p className="opacity-80 text-sm relative z-10">Trade with {offer.theirUser.name}</p>
                <button onClick={onClose} className="absolute top-6 right-6 text-white/60 hover:text-white font-bold bg-white/10 p-2 rounded-full backdrop-blur-sm transition-colors z-50">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 -mt-10 px-4 pb-6 overflow-y-auto flex flex-col">
                <div className={`bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-4 border border-white/50 flex-1 flex flex-col ${step === 'success' ? 'bg-green-50/90 border-green-100' : ''}`}>
                     
                     {/* Progress Stepper (Hidden on success) */}
                     {step !== 'success' && (
                        <div className="mb-8">
                            <div className="flex justify-between items-center relative px-2">
                                {/* Progress Line */}
                                <div className="absolute left-5 right-5 top-5 h-1 bg-slate-100 rounded-full -z-0">
                                    <div 
                                        className="h-full bg-emerald-400 rounded-full transition-all duration-500 ease-out shadow-sm"
                                        style={{ 
                                            width: step === 'logistics' ? '0%' : step === 'verify' ? '50%' : '100%' 
                                        }}
                                    />
                                </div>

                                {steps.map((s) => {
                                    const status = getStepStatus(s.id);
                                    const isCompleted = status === 'completed';
                                    const isActive = status === 'active';
                                    
                                    return (
                                        <div key={s.id} className="flex flex-col items-center gap-2 z-10 relative">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-[3px] transition-all duration-300 ${
                                                isCompleted ? 'bg-emerald-400 border-emerald-400 text-white' :
                                                isActive ? 'bg-slate-900 border-slate-900 text-white shadow-lg scale-110' :
                                                'bg-white border-slate-100 text-slate-300'
                                            }`}>
                                                {isCompleted ? <Check size={16} strokeWidth={3} /> : <s.icon size={16} strokeWidth={2.5} />}
                                            </div>
                                            <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 ${
                                                isActive ? 'text-slate-900' : 
                                                isCompleted ? 'text-emerald-500' : 'text-slate-300'
                                            }`}>
                                                {s.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                     )}

                     {/* Items Header (Hide on Success for cleaner look) */}
                     {step !== 'success' && (
                        <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
                            <div className="text-center flex-1 flex flex-col items-center">
                                <img src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=100&q=80" className="w-16 h-16 rounded-xl mb-2 object-cover border-2 border-white shadow-sm" alt="My Item"/>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">You</p>
                            </div>
                            <div className="text-slate-300 px-2">
                                <ArrowRightLeft size={20} />
                            </div>
                            <div className="text-center flex-1 flex flex-col items-center">
                                <img src={displayImage} className="w-16 h-16 rounded-xl mb-2 object-cover border-2 border-white shadow-sm" alt="Their Item"/>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{offer.theirUser.name}</p>
                            </div>
                        </div>
                     )}
                     
                     {step === 'logistics' && (
                         <div className="space-y-6 animate-in slide-in-from-right duration-300">
                             <div className="text-center">
                                <h3 className="font-bold text-slate-900 text-xl">Step 1: Logistics</h3>
                                <p className="text-sm text-slate-500 mt-1">Where and when will you meet?</p>
                             </div>
                             
                             <form onSubmit={handleConfirmLogistics} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-3.5 text-slate-400" size={20} />
                                        <input 
                                            required
                                            value={location}
                                            onChange={e => setLocation(e.target.value)}
                                            type="text" 
                                            placeholder="e.g. Starbucks, Central Park" 
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-200/50 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none font-medium text-slate-900"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Date</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-3.5 text-slate-400" size={20} />
                                            <input 
                                                required
                                                value={date}
                                                onChange={e => setDate(e.target.value)}
                                                type="date" 
                                                className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-200/50 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none font-medium text-sm text-slate-900"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Time</label>
                                        <div className="relative">
                                            <Clock className="absolute left-4 top-3.5 text-slate-400" size={20} />
                                            <input 
                                                required
                                                value={time}
                                                onChange={e => setTime(e.target.value)}
                                                type="time" 
                                                className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-200/50 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none font-medium text-sm text-slate-900"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    type="submit"
                                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg mt-4 active:scale-[0.98] transition-transform"
                                >
                                    Confirm Logistics
                                </button>
                             </form>
                         </div>
                     )}

                     {step === 'verify' && (
                         <div className="text-center space-y-6 animate-in slide-in-from-right duration-300">
                             <div>
                                <h3 className="font-bold text-slate-900 text-xl">Step 2: Verify & Meet</h3>
                                <p className="text-sm text-slate-500 mt-1">Meet at <span className="font-bold text-slate-900">{location}</span>.</p>
                             </div>
                             
                             <div className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex flex-col items-center justify-center gap-3">
                                 <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md text-emerald-500 border-4 border-emerald-50">
                                    <ShieldCheck size={32} />
                                 </div>
                                 <div className="text-emerald-900 font-medium text-sm">
                                     Review items in person carefully before proceeding to the swap code.
                                 </div>
                             </div>

                             <button 
                                onClick={handleVerify}
                                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg active:scale-[0.98] transition-transform"
                             >
                                 Items Verified - Ready to Swap
                             </button>
                         </div>
                     )}

                     {step === 'complete' && (
                         <div className="text-center space-y-6 animate-in slide-in-from-right duration-300 flex-1 flex flex-col justify-between">
                             <div className="space-y-6">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-xl">Step 3: Secure Exchange</h3>
                                    <p className="text-sm text-slate-500 mt-1">Exchange codes to finalize.</p>
                                </div>

                                {/* My Code Section */}
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Show to {offer.theirUser.name}</p>
                                    <div className="flex items-center justify-center gap-4">
                                        <p className="text-slate-900 font-mono text-4xl tracking-[0.2em] font-black">{myDisplayCode}</p>
                                    </div>
                                </div>
                                
                                {/* Divider */}
                                <div className="relative flex py-2 items-center">
                                    <div className="flex-grow border-t border-slate-200"></div>
                                    <span className="flex-shrink-0 mx-4 text-slate-300 text-xs font-bold uppercase">And Enter Their Code</span>
                                    <div className="flex-grow border-t border-slate-200"></div>
                                </div>

                                {/* Input Section */}
                                <div>
                                    <div className="relative mb-2">
                                        <input 
                                            type="number"
                                            pattern="\d*"
                                            inputMode="numeric"
                                            value={inputCode}
                                            onChange={(e) => handleCodeInput(e.target.value)}
                                            className={`w-full text-center text-3xl font-mono font-bold tracking-[0.5em] py-4 rounded-xl border-2 focus:outline-none transition-all ${error ? 'border-red-300 bg-red-50 text-red-900' : 'border-slate-200 focus:border-slate-900 text-slate-900'}`}
                                            placeholder="0000"
                                        />
                                        {error && <span className="absolute -bottom-6 left-0 right-0 text-xs text-red-500 font-bold">Incorrect code. Try again.</span>}
                                    </div>
                                    
                                    {/* Demo Hint */}
                                    <div className="mt-4 text-[10px] text-slate-400 bg-yellow-50 border border-yellow-100 p-2 rounded-lg inline-block">
                                        <span className="font-bold text-yellow-600">Demo Hint:</span> The correct code is <strong>{targetCode}</strong>
                                    </div>
                                </div>
                             </div>

                             <button 
                                 disabled={inputCode.length !== 4}
                                 onClick={handleSubmitCode}
                                 className="w-full py-4 bg-slate-900 disabled:bg-slate-300 text-white rounded-xl font-bold shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                             >
                                 <Lock size={18} />
                                 Verify & Close Deal
                             </button>
                         </div>
                     )}

                     {step === 'success' && (
                         <div className="text-center flex-1 flex flex-col items-center justify-center animate-in zoom-in duration-500">
                             <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-xl shadow-green-200 mb-6 border-4 border-white animate-bounce">
                                 <Sparkles className="text-white" size={40} />
                             </div>
                             
                             <h2 className="text-3xl font-black text-slate-900 mb-2">Swap Completed!</h2>
                             <p className="text-slate-600 mb-8 max-w-xs">You successfully swapped items with {offer.theirUser.name}.</p>
                             
                             <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-green-100 mb-6">
                                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Rate your experience</p>
                                 <div className="flex justify-center gap-2">
                                     {[1, 2, 3, 4, 5].map((star) => (
                                         <button 
                                            key={star}
                                            onClick={() => setRating(star)}
                                            className={`p-1 transition-all hover:scale-110 active:scale-90 ${rating >= star ? 'text-yellow-400' : 'text-slate-200'}`}
                                         >
                                             <Star size={32} fill={rating >= star ? "currentColor" : "none"} strokeWidth={3} />
                                         </button>
                                     ))}
                                 </div>
                             </div>

                             <button 
                                onClick={handleSubmitReview}
                                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 active:scale-[0.98] transition-transform"
                             >
                                 Submit Review & Close
                             </button>
                         </div>
                     )}
                </div>
            </div>
        </div>
    );
};

export default SwapRoom;
