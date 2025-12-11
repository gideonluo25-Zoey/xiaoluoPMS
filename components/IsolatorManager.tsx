import React, { useState } from 'react';
import { Isolator, IsolatorStatus, ProjectData } from '../types';
import { Box, RefreshCcw, CheckCircle, Activity, Droplets, Wind, Search, Edit3, Calendar, ChevronDown } from 'lucide-react';

interface IsolatorManagerProps {
  isolators: Isolator[];
  projects: ProjectData[];
  onUpdateStatus: (id: string, status: IsolatorStatus) => void;
  onUpdateLabel: (id: string, label: string) => void;
}

const statusColors: Record<IsolatorStatus, string> = {
  [IsolatorStatus.IN_USE]: 'bg-red-100 text-red-700 border-red-300',
  [IsolatorStatus.DISINFECTION]: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  [IsolatorStatus.PRESSURE_TEST]: 'bg-purple-100 text-purple-700 border-purple-300',
  [IsolatorStatus.CLEANING]: 'bg-blue-100 text-blue-700 border-blue-300',
  [IsolatorStatus.SAMPLING_1]: 'bg-cyan-100 text-cyan-700 border-cyan-300',
  [IsolatorStatus.SAMPLING_2]: 'bg-teal-100 text-teal-700 border-teal-300',
  [IsolatorStatus.READY]: 'bg-emerald-100 text-emerald-700 border-emerald-300',
};

const IsolatorManager: React.FC<IsolatorManagerProps> = ({ isolators, projects, onUpdateStatus, onUpdateLabel }) => {
  const [filter, setFilter] = useState<IsolatorStatus | 'ALL'>('ALL');

  const filteredIsolators = isolators.filter(iso => filter === 'ALL' || iso.status === filter);

  // Calculate stats
  const stats = {
    total: isolators.length,
    ready: isolators.filter(i => i.status === IsolatorStatus.READY).length,
    inUse: isolators.filter(i => i.status === IsolatorStatus.IN_USE).length,
    maintenance: isolators.filter(i => ![IsolatorStatus.READY, IsolatorStatus.IN_USE].includes(i.status)).length,
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 animate-fade-in-up">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center">
            <Box className="mr-2 text-cyan-600" />
            隔离包状态监控 / ISOLATOR MONITOR
          </h2>
          <div className="flex gap-4 text-xs font-mono mt-2">
            <span className="text-emerald-600 font-bold">AVAILABLE: {stats.ready}</span>
            <span className="text-red-600 font-bold">ACTIVE: {stats.inUse}</span>
            <span className="text-yellow-600 font-bold">MAINTENANCE: {stats.maintenance}</span>
          </div>
        </div>

        <div className="flex gap-2 bg-white p-1 rounded-lg border border-slate-300 shadow-sm">
           <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value as IsolatorStatus | 'ALL')}
              className="bg-transparent text-sm text-slate-700 outline-none p-2 cursor-pointer"
           >
              <option value="ALL" className="bg-white">全部显示 (ALL)</option>
              {Object.values(IsolatorStatus).map(status => (
                  <option key={status} value={status} className="bg-white">{status}</option>
              ))}
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredIsolators.map((iso) => {
          const isSampling = iso.status === IsolatorStatus.SAMPLING_1 || iso.status === IsolatorStatus.SAMPLING_2;
          const isInUse = iso.status === IsolatorStatus.IN_USE;
          
          // Find linked project if available
          const linkedProject = iso.currentProjectId ? projects.find(p => p.id === iso.currentProjectId) : null;

          return (
            <div 
              key={iso.id} 
              className={`glass-panel p-4 rounded-lg border transition-all duration-300 hover:shadow-lg group relative overflow-hidden flex flex-col ${
                iso.status === IsolatorStatus.READY ? 'border-emerald-300' : 'border-slate-300'
              }`}
            >
              <div className="flex justify-between items-start mb-3 relative z-10">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 font-mono">{iso.id}</h3>
                  <p className="text-[10px] text-slate-500">LAST UPDATE: {iso.lastUpdated}</p>
                </div>
                <div className={`px-2 py-1 rounded text-[10px] font-bold border ${statusColors[iso.status]}`}>
                  {iso.status.split(' ')[0]}
                </div>
              </div>

              {/* Status Control */}
              <div className="mt-auto space-y-3 relative z-10">
                 <div className="relative group/select">
                    <select
                        value={iso.status}
                        onChange={(e) => onUpdateStatus(iso.id, e.target.value as IsolatorStatus)}
                        className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs appearance-none focus:border-cyan-500 outline-none text-slate-700 hover:bg-white transition-colors"
                    >
                        {Object.values(IsolatorStatus).map((s) => (
                            <option key={s} value={s} className="bg-white text-slate-700">
                            {s}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-2.5 w-3 h-3 text-slate-400 pointer-events-none group-hover/select:text-cyan-600" />
                 </div>

                 {/* Use Case: IN_USE -> Show Project Info & Note */}
                 {isInUse && (
                    <div className="animate-fade-in space-y-2">
                         {linkedProject && (
                             <div className="text-xs bg-slate-50 p-2 rounded border border-slate-200">
                                <span className="block text-[10px] text-slate-400 uppercase">Linked Project</span>
                                <span className="text-cyan-700 font-bold truncate block" title={linkedProject.projectName}>{linkedProject.projectName}</span>
                             </div>
                         )}
                         <div className="relative">
                            <textarea
                                value={iso.customLabel || ''}
                                onChange={(e) => onUpdateLabel(iso.id, e.target.value)}
                                placeholder="输入项目/使用详情..."
                                className="w-full bg-white border border-slate-200 rounded p-2 text-xs text-slate-700 min-h-[60px] focus:border-cyan-500 outline-none resize-none placeholder-slate-400"
                            />
                            <Edit3 className="absolute right-2 bottom-2 w-3 h-3 text-slate-400 pointer-events-none" />
                         </div>
                    </div>
                 )}

                 {/* Use Case: SAMPLING -> Show Date Input */}
                 {isSampling && (
                    <div className="animate-fade-in space-y-1">
                       <label className="text-[10px] text-slate-500 uppercase flex items-center">
                         <Calendar className="w-3 h-3 mr-1" />
                         采样日期 (Date)
                       </label>
                       <input
                          type="text"
                          value={iso.customLabel || ''}
                          onChange={(e) => onUpdateLabel(iso.id, e.target.value)}
                          placeholder="YYYY-MM-DD"
                          className="w-full bg-white border border-slate-200 rounded p-2 text-sm text-slate-700 focus:border-cyan-500 outline-none font-mono placeholder-slate-400"
                       />
                    </div>
                 )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IsolatorManager;