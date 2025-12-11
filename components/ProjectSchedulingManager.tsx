import React, { useState } from 'react';
import { ProjectData } from '../types';
import { CalendarClock, MapPin, Box, Dna, CheckCircle2, AlertCircle, ArrowRight, MousePointer2, Table } from 'lucide-react';

interface ProjectSchedulingManagerProps {
  projects: ProjectData[];
  onUpdateProject: (project: ProjectData) => void;
}

const ProjectSchedulingManager: React.FC<ProjectSchedulingManagerProps> = ({ projects, onUpdateProject }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  const selectedProject = projects.find(p => p.id === selectedProjectId);
  
  // Sort projects: Unscheduled first
  const sortedProjects = [...projects].sort((a, b) => {
    if (a.scheduling?.isScheduled === b.scheduling?.isScheduled) return 0;
    return a.scheduling?.isScheduled ? 1 : -1;
  });

  const handleUpdateScheduling = (field: 'estimatedDate' | 'location', value: string) => {
      if (!selectedProject) return;
      const updatedProject = {
          ...selectedProject,
          scheduling: {
              ...(selectedProject.scheduling || { estimatedDate: '', location: '', isScheduled: false }),
              [field]: value
          }
      };
      onUpdateProject(updatedProject);
  };

  const handleConfirmSchedule = () => {
      if (!selectedProject) return;
      if (!selectedProject.scheduling?.estimatedDate || !selectedProject.scheduling?.location) {
          alert('请填写排期日期和实验地点 / Please fill in Date and Location');
          return;
      }
      
      const updatedProject = {
          ...selectedProject,
          scheduling: {
              ...selectedProject.scheduling,
              isScheduled: true
          }
      };
      onUpdateProject(updatedProject);
  };

  const handleExportAll = () => {
    // Define headers
    const headers = [
        "Project ID (编号)",
        "Project Name (名称)",
        "Client Unit (单位)",
        "Client Name (客户)",
        "Isolators (隔离包)",
        "Mouse Strain (品系)",
        "Quantity (数量)",
        "Status (状态)",
        "Est. Date (预计排期)",
        "Location (地点)"
    ];

    // Map data
    const rows = projects.map(p => [
        p.id,
        p.projectName,
        p.clientUnit,
        p.clientName,
        p.isolatorCount,
        p.mouseStrain,
        p.mouseQuantity,
        p.scheduling?.isScheduled ? 'Scheduled' : 'Pending',
        p.scheduling?.estimatedDate || '-',
        p.scheduling?.location || '-'
    ]);

    // Convert to CSV string (wrap values in quotes to handle commas)
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Add BOM for Excel UTF-8 support
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `PMS_Schedule_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 animate-fade-in-up">
       <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center mb-2">
                <CalendarClock className="mr-3 text-cyan-600" />
                项目排期管理 (SCHEDULING)
            </h2>
            <p className="text-sm text-slate-500 font-mono pl-9">
                Allocate resources and set experiment timelines.
            </p>
          </div>
          
          {projects.length > 0 && (
             <button 
                onClick={handleExportAll}
                className="flex items-center bg-white hover:bg-slate-50 text-cyan-600 border border-slate-200 hover:border-cyan-300 px-4 py-2 rounded-lg transition-all shadow-sm text-sm font-bold"
             >
                <Table className="w-4 h-4 mr-2" />
                导出排期总表 (Export Schedule CSV)
             </button>
          )}
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Project List */}
          <div className="lg:col-span-1 space-y-4">
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Waiting List</h3>
             <div className="space-y-3 max-h-[700px] overflow-y-auto custom-scrollbar">
                {sortedProjects.map(project => {
                    const isScheduled = project.scheduling?.isScheduled;
                    return (
                        <div 
                           key={project.id}
                           onClick={() => setSelectedProjectId(project.id)}
                           className={`p-4 rounded-lg border cursor-pointer transition-all relative overflow-hidden group ${
                               selectedProjectId === project.id 
                               ? 'bg-white border-cyan-500 shadow-lg ring-1 ring-cyan-500' 
                               : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-cyan-300'
                           }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-mono text-xs text-slate-400">{project.id}</span>
                                {isScheduled ? (
                                    <span className="flex items-center text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded border border-emerald-200">
                                        <CheckCircle2 className="w-3 h-3 mr-1" /> SCHEDULED
                                    </span>
                                ) : (
                                    <span className="flex items-center text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded border border-amber-200">
                                        <AlertCircle className="w-3 h-3 mr-1" /> PENDING
                                    </span>
                                )}
                            </div>
                            <h4 className="font-bold text-slate-800 text-sm mb-1">{project.projectName}</h4>
                            <p className="text-xs text-slate-500">{project.clientUnit}</p>
                            
                            {selectedProjectId === project.id && (
                                <div className="absolute right-0 top-0 bottom-0 w-1 bg-cyan-500"></div>
                            )}
                        </div>
                    );
                })}
             </div>
          </div>

          {/* RIGHT: Detail & Form */}
          <div className="lg:col-span-2">
             {selectedProject ? (
                 <div className="glass-panel p-8 rounded-xl border border-slate-200 relative bg-white">
                     <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                        <span className="w-2 h-6 bg-cyan-500 rounded mr-3"></span>
                        排期详情 / Scheduling Details
                     </h2>

                     {/* RESOURCE REQUIREMENTS CARD */}
                     <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center">
                            <Box className="w-4 h-4 mr-2 text-cyan-600" />
                            资源需求 (Requirements)
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="text-center p-3 rounded bg-white border border-slate-200 shadow-sm">
                                <span className="text-[10px] text-slate-400 block mb-1">ISOLATORS</span>
                                <span className="text-2xl font-mono text-cyan-600 font-bold">{selectedProject.isolatorCount}</span>
                                <span className="text-xs text-slate-500 ml-1">个</span>
                            </div>
                            <div className="text-center p-3 rounded bg-white border border-slate-200 shadow-sm">
                                <span className="text-[10px] text-slate-400 block mb-1">MICE COUNT</span>
                                <span className="text-2xl font-mono text-cyan-600 font-bold">{selectedProject.mouseQuantity}</span>
                                <span className="text-xs text-slate-500 ml-1">只</span>
                            </div>
                             <div className="col-span-2 p-3 rounded bg-white border border-slate-200 shadow-sm flex items-center justify-between">
                                <div className="text-left">
                                    <span className="text-[10px] text-slate-400 block mb-1">SPECIFICATIONS</span>
                                    <div className="flex items-center gap-2 text-sm text-slate-800">
                                        <Dna className="w-3 h-3 text-purple-500" />
                                        <span>{selectedProject.mouseStrain}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                        <span>{selectedProject.mouseGender}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                        <span>{selectedProject.mouseAgeWeeks} Weeks</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                     </div>

                     {/* SCHEDULING FORM */}
                     <div className="space-y-6">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-emerald-500" />
                            实验安排 (Arrangement)
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs text-slate-500">预计排期时间 (Est. Date)</label>
                                <input 
                                   type="date" 
                                   value={selectedProject.scheduling?.estimatedDate || ''}
                                   onChange={(e) => handleUpdateScheduling('estimatedDate', e.target.value)}
                                   disabled={selectedProject.scheduling?.isScheduled}
                                   className={`w-full p-3 rounded border ${selectedProject.scheduling?.isScheduled ? 'bg-slate-50 border-emerald-300 text-emerald-600 cursor-not-allowed' : 'bg-white border-slate-300 text-slate-800 focus:border-cyan-500'} outline-none transition-colors`}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-slate-500">实验地点 (Location)</label>
                                <input 
                                   type="text" 
                                   placeholder="e.g. Lab 4, Room 101"
                                   value={selectedProject.scheduling?.location || ''}
                                   onChange={(e) => handleUpdateScheduling('location', e.target.value)}
                                   disabled={selectedProject.scheduling?.isScheduled}
                                   className={`w-full p-3 rounded border ${selectedProject.scheduling?.isScheduled ? 'bg-slate-50 border-emerald-300 text-emerald-600 cursor-not-allowed' : 'bg-white border-slate-300 text-slate-800 focus:border-cyan-500'} outline-none transition-colors`}
                                />
                            </div>
                        </div>

                        {!selectedProject.scheduling?.isScheduled ? (
                            <div className="pt-6 flex justify-end border-t border-slate-100 mt-6">
                                <button 
                                    onClick={handleConfirmSchedule}
                                    className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded shadow-lg shadow-cyan-200 transition-all flex items-center"
                                >
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    确认排期 (Confirm Schedule)
                                </button>
                            </div>
                        ) : (
                             <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded flex items-center justify-center text-emerald-600 text-sm font-bold">
                                 <CheckCircle2 className="w-5 h-5 mr-2" />
                                 Project Successfully Scheduled
                             </div>
                        )}
                     </div>

                     <div className="absolute top-4 right-4 text-cyan-50">
                         <CalendarClock size={150} />
                     </div>
                 </div>
             ) : (
                 <div className="h-full flex flex-col items-center justify-center p-12 text-slate-400 border border-dashed border-slate-300 rounded-xl bg-slate-50">
                     <MousePointer2 className="w-12 h-12 mb-4 opacity-50" />
                     <p>Select a project from the list to manage scheduling.</p>
                 </div>
             )}
          </div>
       </div>
    </div>
  );
};

export default ProjectSchedulingManager;