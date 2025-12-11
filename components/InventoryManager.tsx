import React, { useState } from 'react';
import { InventoryItem, MouseGender } from '../types';
import { LayoutGrid, Plus, Trash2, Search, Dna, Calendar, Users } from 'lucide-react';

interface InventoryManagerProps {
  inventory: InventoryItem[];
  onAddStock: (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => void;
  onUpdateStock: (id: string, newQty: number) => void;
  onRemoveStock: (id: string) => void;
}

const InventoryManager: React.FC<InventoryManagerProps> = ({ inventory, onAddStock, onUpdateStock, onRemoveStock }) => {
  const [filter, setFilter] = useState('');
  const [newItem, setNewItem] = useState({
    strain: '',
    gender: MouseGender.MALE,
    ageWeeks: 6,
    quantity: 10
  });

  const filteredInventory = inventory.filter(item => 
    item.strain.toLowerCase().includes(filter.toLowerCase()) ||
    item.id.toLowerCase().includes(filter.toLowerCase())
  );

  const totalMice = inventory.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.strain) return;
    
    onAddStock({
      strain: newItem.strain,
      gender: newItem.gender,
      ageWeeks: newItem.ageWeeks,
      quantity: newItem.quantity
    });
    
    setNewItem({ ...newItem, strain: '' }); // Reset strain, keep others
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 animate-fade-in-up">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <div className="glass-panel p-6 rounded-lg border border-slate-300 flex items-center justify-between">
            <div>
               <p className="text-xs text-slate-500 uppercase tracking-wider">Total Specimens</p>
               <h2 className="text-4xl font-mono text-cyan-600 font-bold">{totalMice}</h2>
            </div>
            <Users className="text-cyan-200 w-12 h-12" />
         </div>
         <div className="glass-panel p-6 rounded-lg border border-slate-300 flex items-center justify-between">
            <div>
               <p className="text-xs text-slate-500 uppercase tracking-wider">Total Batches</p>
               <h2 className="text-4xl font-mono text-blue-600 font-bold">{inventory.length}</h2>
            </div>
            <LayoutGrid className="text-blue-200 w-12 h-12" />
         </div>
         <div className="glass-panel p-6 rounded-lg border border-slate-300 flex items-center justify-between bg-gradient-to-br from-white to-slate-50">
            <div className="w-full">
               <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">System Status</p>
               <div className="flex items-center space-x-2">
                 <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                 <span className="text-sm text-emerald-600 font-medium">Inventory Live</span>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left: Add New Stock Form */}
        <div className="lg:col-span-1">
           <div className="glass-panel p-6 rounded-xl border border-cyan-200 sticky top-24">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center border-b border-slate-200 pb-2">
                <Plus className="w-5 h-5 mr-2 text-cyan-600" />
                入库登记 (Entry)
              </h3>
              
              <form onSubmit={handleAddItem} className="space-y-4">
                 <div>
                    <label className="text-xs text-slate-500 mb-1 block">Strain (品系)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. C57BL/6"
                      value={newItem.strain}
                      onChange={e => setNewItem({...newItem, strain: e.target.value})}
                      className="w-full bg-white border border-slate-300 rounded p-2 text-sm focus:border-cyan-500 outline-none text-slate-800"
                      required
                    />
                 </div>
                 
                 <div>
                    <label className="text-xs text-slate-500 mb-1 block">Gender (性别)</label>
                    <select 
                      value={newItem.gender}
                      onChange={e => setNewItem({...newItem, gender: e.target.value as MouseGender})}
                      className="w-full bg-white border border-slate-300 rounded p-2 text-sm outline-none text-slate-800"
                    >
                      {Object.values(MouseGender).map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                 </div>

                 <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-xs text-slate-500 mb-1 block">Age (周龄)</label>
                        <input 
                            type="number" 
                            min="1"
                            value={newItem.ageWeeks}
                            onChange={e => setNewItem({...newItem, ageWeeks: parseInt(e.target.value) || 0})}
                            className="w-full bg-white border border-slate-300 rounded p-2 text-sm text-center outline-none text-slate-800"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 mb-1 block">Qty (数量)</label>
                        <input 
                            type="number" 
                            min="1"
                            value={newItem.quantity}
                            onChange={e => setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})}
                            className="w-full bg-white border border-slate-300 rounded p-2 text-sm text-center font-bold text-cyan-600 outline-none"
                        />
                    </div>
                 </div>

                 <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-2 rounded mt-4 transition-colors font-bold text-sm">
                    确认入库 (ADD STOCK)
                 </button>
              </form>
           </div>
        </div>

        {/* Right: Inventory List */}
        <div className="lg:col-span-3 space-y-4">
           {/* Filters */}
           <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-slate-300">
              <Search className="w-5 h-5 text-slate-400 ml-2" />
              <input 
                type="text" 
                placeholder="Search by Strain ID or Name..." 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-transparent border-none outline-none text-slate-700 w-full placeholder-slate-400"
              />
           </div>

           {/* Table Header */}
           <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs font-mono text-slate-500 uppercase tracking-wider">
              <div className="col-span-2">Batch ID</div>
              <div className="col-span-3">Strain / Specs</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-3 text-right">Last Updated</div>
              <div className="col-span-1"></div>
           </div>

           {/* Rows */}
           <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
              {filteredInventory.map(item => (
                 <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-4 rounded-lg bg-white border border-slate-200 hover:border-cyan-400 shadow-sm transition-all group">
                    <div className="col-span-2 font-mono text-xs text-slate-500">{item.id}</div>
                    
                    <div className="col-span-3">
                       <div className="font-bold text-slate-800 flex items-center">
                          <Dna className="w-3 h-3 mr-1 text-purple-500" />
                          {item.strain}
                       </div>
                       <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                          <span className={item.gender.includes('Male') ? 'text-blue-500' : 'text-pink-500'}>{item.gender.split(' ')[0]}</span>
                          <span className="flex items-center"><Calendar className="w-3 h-3 mr-1"/> {item.ageWeeks}周</span>
                       </div>
                    </div>

                    <div className="col-span-3 flex justify-center items-center space-x-2">
                       <button 
                         onClick={() => onUpdateStock(item.id, Math.max(0, item.quantity - 1))}
                         className="w-6 h-6 flex items-center justify-center rounded bg-slate-100 text-slate-500 hover:text-white hover:bg-slate-400"
                       >-</button>
                       <span className={`font-mono text-xl w-12 text-center font-bold ${item.quantity < 10 ? 'text-red-500' : 'text-cyan-600'}`}>
                          {item.quantity}
                       </span>
                       <button 
                         onClick={() => onUpdateStock(item.id, item.quantity + 1)}
                         className="w-6 h-6 flex items-center justify-center rounded bg-slate-100 text-slate-500 hover:text-white hover:bg-slate-400"
                       >+</button>
                    </div>

                    <div className="col-span-3 text-right text-xs font-mono text-slate-400">
                       {item.lastUpdated}
                    </div>

                    <div className="col-span-1 text-right">
                       <button 
                          onClick={() => onRemoveStock(item.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                          title="Remove Batch"
                       >
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                 </div>
              ))}
              
              {filteredInventory.length === 0 && (
                 <div className="text-center py-10 text-slate-500 italic">
                    No matching inventory found.
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryManager;