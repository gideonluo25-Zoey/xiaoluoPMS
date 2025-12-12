import React, { useState } from 'react';
import { Reservation, ReservationType, ReservationStatus, Isolator, InventoryItem, MouseGender, IsolatorStatus } from '../types';
import { Bookmark, Box, LayoutGrid, Calendar, User, Search, CheckCircle, XCircle, Clock, Plus, Filter } from 'lucide-react';

interface ReservationManagerProps {
  reservations: Reservation[];
  isolators: Isolator[];
  inventory: InventoryItem[];
  onAddReservation: (res: Reservation) => void;
  onUpdateStatus: (id: string, status: ReservationStatus) => void;
}

const ReservationManager: React.FC<ReservationManagerProps> = ({ 
  reservations, 
  isolators, 
  inventory, 
  onAddReservation, 
  onUpdateStatus 
}) => {
  const [activeTab, setActiveTab] = useState<ReservationType>('ISOLATOR');
  const [filter, setFilter] = useState<'ALL' | ReservationStatus>('ALL');
  
  // Form State
  const [formData, setFormData] = useState<Partial<Reservation>>({
    applicant: '',
    startDate: '',
    endDate: '',
    notes: '',
    resourceId: '', // For Isolator
    strain: '',     // For Inventory
    gender: MouseGender.MALE,
    ageWeeks: 6,
    quantity: 10
  });

  const availableIsolators = isolators.filter(i => i.status === IsolatorStatus.READY);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.applicant || !formData.startDate || !formData.endDate) {
        alert("Please fill in Applicant and Date Range.");
        return;
    }
    
    // Create specific reservation based on tab
    const newReservation: Reservation = {
        id: `RES-${Date.now().toString().slice(-6)}`,
        type: activeTab,
        status: 'PENDING',
        applicant: formData.applicant!,
        createDate: new Date().toLocaleDateString(),
        startDate: formData.startDate!,
        endDate: formData.endDate!,
        notes: formData.notes,
    };

    if (activeTab === 'ISOLATOR') {
        if (!formData.resourceId) {
            alert("Please select an Isolator.");
            return;
        }
        newReservation.resourceId = formData.resourceId;
    } else {
        if (!formData.strain || !formData.quantity) {
            alert("Please fill in Strain and Quantity.");
            return;
        }
        newReservation.strain = formData.strain;
        newReservation.gender = formData.gender;
        newReservation.ageWeeks = formData.ageWeeks;
        newReservation.quantity = formData.quantity;
    }

    onAddReservation(newReservation);
    // Reset core fields but keep applicant for convenience
    setFormData(prev => ({ ...prev, startDate: '', endDate: '', notes: '', resourceId: '', strain: '' }));
  };

  const filteredReservations = reservations.filter(res => {
      const typeMatch = res.type === activeTab;
      const statusMatch = filter === 'ALL' || res.status === filter;
      return typeMatch && statusMatch;
  });

  return (
    <div className="w-full max-w-7xl mx-auto p-6 animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center">
            <Bookmark className="mr-3 text-cyan-600" />
            资源预订中心 (RESERVATION CENTER)
        </h2>
        <p className="text-sm text-slate-500 font-mono mt-2 ml-9">
            Book resources in advance to secure availability.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Booking Form */}
        <div className="lg:col-span-1">
            <div className="glass-panel p-6 rounded-xl border border-cyan-200 sticky top-24">
                
                {/* Type Toggles */}
                <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
                    <button 
                        onClick={() => setActiveTab('ISOLATOR')}
                        className={`flex-1 py-2 text-sm font-bold rounded-md flex items-center justify-center transition-all ${activeTab === 'ISOLATOR' ? 'bg-white text-cyan-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Box className="w-4 h-4 mr-2" />
                        隔离包 (Isolator)
                    </button>
                    <button 
                        onClick={() => setActiveTab('INVENTORY')}
                        className={`flex-1 py-2 text-sm font-bold rounded-md flex items-center justify-center transition-all ${activeTab === 'INVENTORY' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <LayoutGrid className="w-4 h-4 mr-2" />
                        小鼠库存 (Stock)
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs text-slate-500 mb-1 block uppercase">申请人 (Applicant)</label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="输入申请人姓名"
                                value={formData.applicant}
                                onChange={e => setFormData({...formData, applicant: e.target.value})}
                                className="w-full pl-9 p-2 rounded border border-slate-300 bg-white text-sm focus:border-cyan-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-slate-500 mb-1 block uppercase">开始日期 (Start)</label>
                            <input 
                                type="date"
                                value={formData.startDate}
                                onChange={e => setFormData({...formData, startDate: e.target.value})}
                                className="w-full p-2 rounded border border-slate-300 bg-white text-xs focus:border-cyan-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 mb-1 block uppercase">结束日期 (End)</label>
                            <input 
                                type="date"
                                value={formData.endDate}
                                onChange={e => setFormData({...formData, endDate: e.target.value})}
                                className="w-full p-2 rounded border border-slate-300 bg-white text-xs focus:border-cyan-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Conditional Fields based on Type */}
                    {activeTab === 'ISOLATOR' ? (
                        <div className="bg-cyan-50 p-3 rounded border border-cyan-100 animate-fade-in">
                            <label className="text-xs text-cyan-700 mb-1 block font-bold">选择隔离包 (Select ID)</label>
                            <select 
                                value={formData.resourceId}
                                onChange={e => setFormData({...formData, resourceId: e.target.value})}
                                className="w-full p-2 rounded border border-cyan-200 bg-white text-sm focus:border-cyan-500 outline-none mb-2"
                            >
                                <option value="">-- Select Available Isolator --</option>
                                {availableIsolators.map(iso => (
                                    <option key={iso.id} value={iso.id}>{iso.id} (Status: {iso.status})</option>
                                ))}
                                {isolators.filter(i => i.status !== IsolatorStatus.READY).map(iso => (
                                    <option key={iso.id} value={iso.id} disabled>{iso.id} (Unavailable - {iso.status})</option>
                                ))}
                            </select>
                            <p className="text-[10px] text-cyan-600">
                                Note: Only 'READY' isolators are recommended for immediate booking.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-blue-50 p-3 rounded border border-blue-100 animate-fade-in space-y-3">
                            <div>
                                <label className="text-xs text-blue-700 mb-1 block font-bold">品系 (Strain)</label>
                                <input 
                                    type="text"
                                    placeholder="e.g. C57BL/6"
                                    value={formData.strain}
                                    onChange={e => setFormData({...formData, strain: e.target.value})}
                                    className="w-full p-2 rounded border border-blue-200 bg-white text-sm focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs text-blue-700 mb-1 block font-bold">性别 (Gender)</label>
                                    <select
                                        value={formData.gender}
                                        onChange={e => setFormData({...formData, gender: e.target.value as MouseGender})}
                                        className="w-full p-2 rounded border border-blue-200 bg-white text-xs outline-none"
                                    >
                                        {Object.values(MouseGender).map(g => <option key={g} value={g}>{g.split(' ')[0]}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-blue-700 mb-1 block font-bold">周龄 (Age)</label>
                                    <input 
                                        type="number"
                                        min="1"
                                        value={formData.ageWeeks}
                                        onChange={e => setFormData({...formData, ageWeeks: parseInt(e.target.value)})}
                                        className="w-full p-2 rounded border border-blue-200 bg-white text-xs outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-blue-700 mb-1 block font-bold">数量 (Quantity)</label>
                                <input 
                                    type="number"
                                    min="1"
                                    value={formData.quantity}
                                    onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})}
                                    className="w-full p-2 rounded border border-blue-200 bg-white text-sm font-bold text-blue-600 outline-none"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="text-xs text-slate-500 mb-1 block uppercase">备注 (Notes)</label>
                        <textarea 
                            rows={2}
                            value={formData.notes}
                            onChange={e => setFormData({...formData, notes: e.target.value})}
                            className="w-full p-2 rounded border border-slate-300 bg-white text-sm focus:border-cyan-500 outline-none resize-none"
                        />
                    </div>

                    <button 
                        type="submit"
                        className={`w-full py-3 rounded text-white font-bold text-sm shadow-md transition-all transform hover:-translate-y-1 ${activeTab === 'ISOLATOR' ? 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-200' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-200'}`}
                    >
                        <Plus className="w-4 h-4 inline-block mr-2" />
                        提交预订 (Submit Booking)
                    </button>
                </form>
            </div>
        </div>

        {/* RIGHT COLUMN: Reservation List */}
        <div className="lg:col-span-2 space-y-4">
            
            {/* Filter Bar */}
            <div className="bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-slate-500 px-2">
                    <Filter className="w-4 h-4" />
                    <span>Filter Status:</span>
                </div>
                <div className="flex space-x-2">
                    {(['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED'] as const).map(s => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${filter === s ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="space-y-3">
                {filteredReservations.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-slate-400">
                        No {filter !== 'ALL' ? filter.toLowerCase() : ''} reservations found for {activeTab.toLowerCase()}.
                    </div>
                ) : (
                    filteredReservations.map(res => (
                        <div key={res.id} className="glass-panel p-4 rounded-lg border border-slate-200 hover:border-cyan-300 transition-all group bg-white">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center">
                                    <div className={`w-2 h-2 rounded-full mr-2 ${
                                        res.status === 'CONFIRMED' ? 'bg-emerald-500' :
                                        res.status === 'PENDING' ? 'bg-amber-500' :
                                        res.status === 'CANCELLED' ? 'bg-red-500' : 'bg-blue-500'
                                    }`}></div>
                                    <span className="font-mono text-xs text-slate-500 mr-3">{res.id}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                        res.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-600' :
                                        res.status === 'PENDING' ? 'bg-amber-100 text-amber-600' :
                                        res.status === 'CANCELLED' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                    }`}>
                                        {res.status}
                                    </span>
                                </div>
                                <div className="text-xs text-slate-400 flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Created: {res.createDate}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                    <span className="text-[10px] text-slate-400 uppercase block">Applicant</span>
                                    <span className="text-sm font-bold text-slate-800">{res.applicant}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 uppercase block">Date Range</span>
                                    <span className="text-xs font-mono text-slate-600">
                                        {res.startDate} <br/> to {res.endDate}
                                    </span>
                                </div>
                                <div className="col-span-2 bg-slate-50 p-2 rounded border border-slate-100">
                                    <span className="text-[10px] text-slate-400 uppercase block">
                                        {res.type === 'ISOLATOR' ? 'Target Resource' : 'Mouse Specifications'}
                                    </span>
                                    {res.type === 'ISOLATOR' ? (
                                        <div className="flex items-center text-cyan-700 font-bold font-mono">
                                            <Box className="w-3 h-3 mr-2" />
                                            {res.resourceId}
                                        </div>
                                    ) : (
                                        <div className="text-xs text-blue-700">
                                            <span className="font-bold">{res.strain}</span> • {res.gender} • {res.ageWeeks}w • <span className="font-bold text-lg">{res.quantity}</span> qty
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {res.notes && (
                                <div className="text-xs text-slate-500 italic mb-4 border-l-2 border-slate-200 pl-2">
                                    "{res.notes}"
                                </div>
                            )}

                            {/* Actions */}
                            {res.status === 'PENDING' && (
                                <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                                    <button 
                                        onClick={() => onUpdateStatus(res.id, 'CANCELLED')}
                                        className="text-xs text-slate-400 hover:text-red-500 flex items-center transition-colors"
                                    >
                                        <XCircle className="w-3 h-3 mr-1" />
                                        Reject / Cancel
                                    </button>
                                    <button 
                                        onClick={() => onUpdateStatus(res.id, 'CONFIRMED')}
                                        className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded flex items-center transition-colors font-bold"
                                    >
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Confirm Booking
                                    </button>
                                </div>
                            )}
                             {res.status === 'CONFIRMED' && (
                                <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                                    <button 
                                        onClick={() => onUpdateStatus(res.id, 'FULFILLED')}
                                        className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded flex items-center transition-colors font-bold"
                                    >
                                        Mark as Fulfilled
                                    </button>
                                     <button 
                                        onClick={() => onUpdateStatus(res.id, 'CANCELLED')}
                                        className="text-xs text-red-400 hover:text-red-500 flex items-center transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationManager;