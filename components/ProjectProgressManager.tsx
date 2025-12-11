import React, { useState, useRef } from 'react';
import { ProjectData, SampleRecord, ProjectEvent, EventType, MaterialItem } from '../types';
import { Calendar, FileText, Upload, Plus, Package, Clock, ArrowRight, ArrowLeft, Image as ImageIcon, Trash2, Download, ShieldCheck, AlertTriangle, FileWarning, Paperclip, Table, ShoppingBag, CheckSquare, Square, XCircle } from 'lucide-react';

interface ProjectProgressManagerProps {
  projects: ProjectData[];
  onUpdateProject: (project: ProjectData) => void;
}

const ProjectProgressManager: React.FC<ProjectProgressManagerProps> = ({ projects, onUpdateProject }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showSampleForm, setShowSampleForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  
  // New Sample State
  const [newSample, setNewSample] = useState<Partial<SampleRecord>>({
    receiveDate: '',
    category: '',
    storageMethod: '',
    notes: '',
    imageUrls: []
  });

  // New Event State
  const [newEvent, setNewEvent] = useState<Partial<ProjectEvent>>({
      date: new Date().toISOString().split('T')[0],
      type: '异常 (Exception)',
      description: '',
      attachmentName: undefined,
      attachmentUrl: undefined
  });

  // New Material State
  const [newMaterial, setNewMaterial] = useState<Partial<MaterialItem>>({
    name: '',
    quantity: '',
    notes: ''
  });

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sampleImageInputRef = useRef<HTMLInputElement>(null);
  const eventFileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdateProgress = (field: string, value: any) => {
    if (!selectedProject) return;
    
    const updatedProject = {
      ...selectedProject,
      progress: {
        ...selectedProject.progress,
        [field]: value
      }
    };
    onUpdateProject(updatedProject);
  };

  const handleExecutionPlanUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedProject || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const url = URL.createObjectURL(file as Blob);
    
    const updatedProject = {
      ...selectedProject,
      progress: {
        ...selectedProject.progress,
        executionPlanFileName: file.name,
        executionPlanFileUrl: url
      }
    };
    onUpdateProject(updatedProject);
  };

  const handleSampleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    // Explicitly cast to Blob to avoid type error with Array.from inference
    const urls = files.map(f => URL.createObjectURL(f as Blob));
    
    setNewSample(prev => ({
      ...prev,
      imageUrls: [...(prev.imageUrls || []), ...urls]
    }));
  };

  const handleEventAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files?.[0]) return;
      const file = e.target.files[0];
      const url = URL.createObjectURL(file as Blob);
      setNewEvent(prev => ({
          ...prev,
          attachmentName: file.name,
          attachmentUrl: url
      }));
  };

  const submitSample = () => {
    if (!selectedProject || !newSample.receiveDate || !newSample.category) {
        alert("请填写接收时间和类别 / Please fill in Date and Category");
        return;
    }

    const sampleEntry: SampleRecord = {
      id: `SMP-${Date.now()}`,
      receiveDate: newSample.receiveDate!,
      category: newSample.category!,
      storageMethod: newSample.storageMethod || 'N/A',
      notes: newSample.notes || '',
      imageUrls: newSample.imageUrls || []
    };

    const updatedProject = {
      ...selectedProject,
      progress: {
        ...selectedProject.progress,
        samples: [sampleEntry, ...selectedProject.progress.samples]
      }
    };

    onUpdateProject(updatedProject);
    setShowSampleForm(false);
    setNewSample({ receiveDate: '', category: '', storageMethod: '', notes: '', imageUrls: [] });
  };

  const submitEvent = () => {
      if (!selectedProject || !newEvent.date || !newEvent.description) {
          alert("请填写日期和描述 / Please fill in Date and Description");
          return;
      }

      const eventEntry: ProjectEvent = {
          id: `EVT-${Date.now()}`,
          date: newEvent.date!,
          type: newEvent.type as EventType,
          description: newEvent.description!,
          attachmentName: newEvent.attachmentName,
          attachmentUrl: newEvent.attachmentUrl
      };

      const updatedProject = {
          ...selectedProject,
          progress: {
              ...selectedProject.progress,
              events: [eventEntry, ...(selectedProject.progress.events || [])]
          }
      };

      onUpdateProject(updatedProject);
      setShowEventForm(false);
      setNewEvent({ 
          date: new Date().toISOString().split('T')[0], 
          type: '异常 (Exception)', 
          description: '', 
          attachmentName: undefined, 
          attachmentUrl: undefined 
      });
  };

  const handleAddMaterial = () => {
    if (!selectedProject || !newMaterial.name) {
        alert("请输入物料名称 / Please enter material name");
        return;
    }
    
    const materialEntry: MaterialItem = {
        id: `MAT-${Date.now()}`,
        name: newMaterial.name!,
        quantity: newMaterial.quantity || '-',
        isPrepared: false,
        notes: newMaterial.notes
    };

    const updatedProject = {
        ...selectedProject,
        progress: {
            ...selectedProject.progress,
            materials: [materialEntry, ...(selectedProject.progress.materials || [])]
        }
    };

    onUpdateProject(updatedProject);
    setNewMaterial({ name: '', quantity: '', notes: '' });
  };

  const toggleMaterialStatus = (id: string) => {
      if (!selectedProject) return;
      
      const updatedMaterials = (selectedProject.progress.materials || []).map(item => 
          item.id === id ? { ...item, isPrepared: !item.isPrepared } : item
      );

      const updatedProject = {
          ...selectedProject,
          progress: {
              ...selectedProject.progress,
              materials: updatedMaterials
          }
      };
      onUpdateProject(updatedProject);
  };

  const deleteMaterial = (id: string) => {
    if (!selectedProject) return;
    if (!confirm("Are you sure you want to remove this item?")) return;

    const updatedMaterials = (selectedProject.progress.materials || []).filter(item => item.id !== id);
    const updatedProject = {
        ...selectedProject,
        progress: {
            ...selectedProject.progress,
            materials: updatedMaterials
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
        "Create Date (录入日期)",
        "Start Date (开启日期)",
        "Transfer Date (转鼠日期)",
        "Isolator Count (隔离包数)",
        "Strain (品系)",
        "Gender (性别)",
        "Quantity (数量)",
        "Samples Received (样品记录数)",
        "Exceptions/Logs (异常记录数)",
        "Material Items (物料条目数)"
    ];

    // Map data
    const rows = projects.map(p => [
        p.id,
        p.projectName,
        p.clientUnit,
        p.clientName,
        p.createDate,
        p.progress.startDate || 'Not Started',
        p.progress.transferDate || 'Pending',
        p.isolatorCount,
        p.mouseStrain,
        p.mouseGender,
        p.mouseQuantity,
        p.progress.samples.length,
        (p.progress.events || []).length,
        (p.progress.materials || []).length
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
    link.setAttribute('download', `PMS_Master_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- LIST VIEW ---
  if (!selectedProjectId) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6 animate-fade-in-up">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                <Clock className="mr-3 text-cyan-600" />
                项目进度管理 (PROJECT PROGRESS)
            </h2>
            
            {projects.length > 0 && (
                <button 
                    onClick={handleExportAll}
                    className="flex items-center bg-white hover:bg-slate-50 text-cyan-700 border border-slate-200 hover:border-cyan-300 px-4 py-2 rounded-lg transition-all shadow-sm text-sm font-bold"
                >
                    <Table className="w-4 h-4 mr-2" />
                    导出总进度表 (Export Master CSV)
                </button>
            )}
        </div>
        
        {projects.length === 0 ? (
          <div className="glass-panel p-12 rounded-xl text-center text-slate-500">
            暂无项目数据 (No Active Projects)
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <div 
                key={project.id}
                onClick={() => setSelectedProjectId(project.id)}
                className="glass-panel p-6 rounded-xl border border-slate-200 hover:border-cyan-400 cursor-pointer transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                   <ArrowRight className="w-12 h-12 text-cyan-600" />
                </div>
                
                <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-cyan-700 transition-colors">
                  {project.projectName}
                </h3>
                <p className="text-xs text-slate-500 mb-4 font-mono">{project.id}</p>
                
                <div className="space-y-2 text-sm text-slate-500">
                  <div className="flex justify-between">
                    <span>Client:</span>
                    <span className="text-slate-700 font-medium">{project.clientName}</span>
                  </div>
                   <div className="flex justify-between">
                    <span>Started:</span>
                    <span className={project.progress.startDate ? "text-emerald-600 font-medium" : "text-slate-400"}>
                        {project.progress.startDate || 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Materials:</span>
                    <span className={(project.progress.materials || []).some(m => !m.isPrepared) ? "text-amber-500 font-medium" : "text-emerald-600"}>
                        {(project.progress.materials || []).filter(m => m.isPrepared).length} / {(project.progress.materials || []).length} Ready
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- DETAIL VIEW ---
  return (
    <div className="w-full max-w-7xl mx-auto p-6 animate-fade-in">
      <button 
        onClick={() => setSelectedProjectId(null)}
        className="flex items-center text-slate-500 hover:text-cyan-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        返回项目列表 (Back to List)
      </button>

      <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-8 border-b border-slate-200 pb-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-800">{selectedProject.projectName}</h1>
           <p className="text-cyan-600 font-mono mt-1">{selectedProject.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Timeline & Documents */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* 1. Timeline Card */}
          <div className="glass-panel p-6 rounded-xl border border-slate-200">
             <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center">
               <Calendar className="w-4 h-4 mr-2 text-cyan-600" />
               关键时间节点 (Timeline)
             </h3>
             
             <div className="space-y-4">
                <div>
                   <label className="text-xs text-slate-500 mb-1 block">项目开启时间 (Start Date)</label>
                   <input 
                     type="date"
                     value={selectedProject.progress.startDate || ''}
                     onChange={(e) => handleUpdateProgress('startDate', e.target.value)}
                     className="w-full bg-white border border-slate-300 rounded p-2 text-sm text-slate-700 focus:border-cyan-500 outline-none"
                   />
                </div>
                <div>
                   <label className="text-xs text-slate-500 mb-1 block">转鼠时间 (Mouse Transfer)</label>
                   <input 
                     type="date"
                     value={selectedProject.progress.transferDate || ''}
                     onChange={(e) => handleUpdateProgress('transferDate', e.target.value)}
                     className="w-full bg-white border border-slate-300 rounded p-2 text-sm text-slate-700 focus:border-cyan-500 outline-none"
                   />
                </div>
             </div>
          </div>

          {/* 2. Contract Card */}
          <div className="glass-panel p-6 rounded-xl border border-slate-200">
             <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center">
               <ShieldCheck className="w-4 h-4 mr-2 text-blue-600" />
               合同文件 (Contract)
             </h3>
             
             {selectedProject.contractFileName ? (
               <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center mb-2">
                     <FileText className="w-8 h-8 text-blue-500 mr-3" />
                     <div className="overflow-hidden">
                        <p className="text-sm text-slate-800 truncate">{selectedProject.contractFileName}</p>
                        <p className="text-[10px] text-slate-500">Original Contract</p>
                     </div>
                  </div>
                  <div className="mt-2">
                      <a 
                        href={selectedProject.contractFileUrl} 
                        download={selectedProject.contractFileName}
                        className={`block w-full text-center py-1.5 rounded text-xs transition-colors ${selectedProject.contractFileUrl ? 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-800' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                        onClick={(e) => !selectedProject.contractFileUrl && e.preventDefault()}
                      >
                        {selectedProject.contractFileUrl ? '下载合同 (Download)' : 'File Not Available'}
                      </a>
                  </div>
               </div>
             ) : (
                <div className="p-4 text-center text-slate-500 text-xs italic border border-dashed border-slate-300 rounded">
                    No contract file uploaded.
                </div>
             )}
          </div>

          {/* 3. Execution Plan Card */}
          <div className="glass-panel p-6 rounded-xl border border-slate-200">
             <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center">
               <FileText className="w-4 h-4 mr-2 text-purple-600" />
               执行方案 (Execution Plan)
             </h3>
             
             {selectedProject.progress.executionPlanFileName ? (
               <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center mb-2">
                     <FileText className="w-8 h-8 text-purple-500 mr-3" />
                     <div className="overflow-hidden">
                        <p className="text-sm text-slate-800 truncate">{selectedProject.progress.executionPlanFileName}</p>
                        <p className="text-[10px] text-slate-500">Document Uploaded</p>
                     </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                      <a 
                        href={selectedProject.progress.executionPlanFileUrl} 
                        download={selectedProject.progress.executionPlanFileName}
                        className="flex-1 text-center py-1.5 rounded bg-white border border-slate-300 text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                      >
                        下载 (Download)
                      </a>
                      <button 
                         onClick={() => fileInputRef.current?.click()}
                         className="flex-1 text-center py-1.5 rounded bg-slate-100 border border-slate-300 text-xs text-slate-500 hover:bg-slate-200 transition-colors"
                      >
                         替换 (Replace)
                      </button>
                  </div>
               </div>
             ) : (
               <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-purple-400 hover:bg-purple-50 rounded-lg p-8 text-center cursor-pointer transition-all group"
               >
                  <Upload className="w-8 h-8 text-slate-400 group-hover:text-purple-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">点击上传方案文件</p>
               </div>
             )}
             <input type="file" ref={fileInputRef} className="hidden" onChange={handleExecutionPlanUpload} />
          </div>

        </div>

        {/* RIGHT COLUMN: Sample Logistics & Events */}
        <div className="lg:col-span-2 space-y-6">

           {/* New: Material Preparation List */}
           <div className="glass-panel rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                 <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center">
                    <ShoppingBag className="w-4 h-4 mr-2 text-cyan-500" />
                    物料准备清单 (Material Preparation)
                 </h3>
                 <div className="text-xs text-slate-500">
                    <span className="text-emerald-600 font-bold">
                        {(selectedProject.progress.materials || []).filter(m => m.isPrepared).length}
                    </span>
                    <span className="mx-1">/</span>
                    <span>{(selectedProject.progress.materials || []).length} Ready</span>
                 </div>
              </div>
              
              <div className="p-6">
                {/* Add Material Row */}
                <div className="flex gap-2 mb-6 items-end">
                    <div className="flex-1">
                        <label className="text-[10px] text-slate-400 uppercase mb-1 block">Item Name</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Sterile Bedding"
                            value={newMaterial.name}
                            onChange={(e) => setNewMaterial({...newMaterial, name: e.target.value})}
                            className="w-full p-2 text-sm border border-slate-300 rounded outline-none focus:border-cyan-500"
                        />
                    </div>
                    <div className="w-24">
                        <label className="text-[10px] text-slate-400 uppercase mb-1 block">Qty</label>
                        <input 
                            type="text" 
                            placeholder="e.g. 5kg"
                            value={newMaterial.quantity}
                            onChange={(e) => setNewMaterial({...newMaterial, quantity: e.target.value})}
                            className="w-full p-2 text-sm border border-slate-300 rounded outline-none focus:border-cyan-500"
                        />
                    </div>
                     <div className="flex-1">
                        <label className="text-[10px] text-slate-400 uppercase mb-1 block">Notes</label>
                        <input 
                            type="text" 
                            placeholder="Optional notes"
                            value={newMaterial.notes}
                            onChange={(e) => setNewMaterial({...newMaterial, notes: e.target.value})}
                            className="w-full p-2 text-sm border border-slate-300 rounded outline-none focus:border-cyan-500"
                        />
                    </div>
                    <button 
                        onClick={handleAddMaterial}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white p-2 rounded h-[38px] w-[38px] flex items-center justify-center transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>

                {/* Material List */}
                <div className="space-y-2">
                    {(!selectedProject.progress.materials || selectedProject.progress.materials.length === 0) ? (
                        <div className="text-center py-4 text-slate-400 italic text-xs border border-dashed border-slate-200 rounded">
                            No materials listed yet.
                        </div>
                    ) : (
                        selectedProject.progress.materials.map(item => (
                            <div key={item.id} className={`flex items-center p-3 rounded-lg border transition-all ${item.isPrepared ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`}>
                                <button 
                                    onClick={() => toggleMaterialStatus(item.id)}
                                    className={`mr-3 flex-shrink-0 transition-colors ${item.isPrepared ? 'text-emerald-500' : 'text-slate-300 hover:text-slate-500'}`}
                                >
                                    {item.isPrepared ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                </button>
                                
                                <div className="flex-1">
                                    <div className={`text-sm font-medium ${item.isPrepared ? 'text-emerald-800 line-through opacity-70' : 'text-slate-800'}`}>
                                        {item.name}
                                    </div>
                                    {item.notes && <div className="text-xs text-slate-500">{item.notes}</div>}
                                </div>

                                <div className="px-3 text-sm font-mono text-slate-600 border-l border-slate-100 mx-2">
                                    {item.quantity}
                                </div>

                                <button 
                                    onClick={() => deleteMaterial(item.id)}
                                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                >
                                    <XCircle className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
              </div>
           </div>
           
           {/* Sample Logistics */}
           <div className="glass-panel rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                 <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center">
                    <Package className="w-4 h-4 mr-2 text-emerald-500" />
                    样品接收记录 (Sample Logistics)
                 </h3>
                 <button 
                    onClick={() => setShowSampleForm(!showSampleForm)}
                    className="flex items-center px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                 >
                    <Plus className="w-3 h-3 mr-1" />
                    登记样品 (Add Log)
                 </button>
              </div>
              
              {/* Add New Sample Form */}
              {showSampleForm && (
                <div className="p-6 bg-slate-50 border-b border-slate-200 animate-fade-in">
                   <h4 className="text-xs text-emerald-600 font-bold mb-4 uppercase">New Arrival Entry</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                         <label className="text-xs text-slate-500 mb-1 block">接收时间 (Time)</label>
                         <input 
                           type="datetime-local"
                           value={newSample.receiveDate}
                           onChange={e => setNewSample({...newSample, receiveDate: e.target.value})}
                           className="w-full bg-white border border-slate-300 rounded p-2 text-sm text-slate-700 focus:border-emerald-500 outline-none"
                         />
                      </div>
                      <div>
                         <label className="text-xs text-slate-500 mb-1 block">类别 (Category)</label>
                         <input 
                           type="text"
                           placeholder="e.g. Blood, Tissue, Drug"
                           value={newSample.category}
                           onChange={e => setNewSample({...newSample, category: e.target.value})}
                           className="w-full bg-white border border-slate-300 rounded p-2 text-sm text-slate-700 focus:border-emerald-500 outline-none"
                         />
                      </div>
                      <div>
                         <label className="text-xs text-slate-500 mb-1 block">储存方式 (Storage)</label>
                         <input 
                           type="text"
                           placeholder="e.g. -80°C Freezer"
                           value={newSample.storageMethod}
                           onChange={e => setNewSample({...newSample, storageMethod: e.target.value})}
                           className="w-full bg-white border border-slate-300 rounded p-2 text-sm text-slate-700 focus:border-emerald-500 outline-none"
                         />
                      </div>
                      <div>
                         <label className="text-xs text-slate-500 mb-1 block">图片记录 (Images)</label>
                         <button 
                           onClick={() => sampleImageInputRef.current?.click()}
                           className="w-full flex items-center justify-center p-2 rounded bg-white border border-slate-300 text-xs text-slate-500 hover:text-emerald-600 hover:border-emerald-500 transition-colors"
                         >
                            <ImageIcon className="w-3 h-3 mr-2" />
                            Upload Images
                         </button>
                         <input type="file" multiple ref={sampleImageInputRef} className="hidden" accept="image/*" onChange={handleSampleImageUpload} />
                         {newSample.imageUrls && newSample.imageUrls.length > 0 && (
                            <p className="text-[10px] text-emerald-600 mt-1">{newSample.imageUrls.length} images selected</p>
                         )}
                      </div>
                   </div>
                   <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => setShowSampleForm(false)}
                        className="px-4 py-2 rounded text-xs text-slate-500 hover:text-slate-800"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={submitSample}
                        className="px-6 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                      >
                        Submit Record
                      </button>
                   </div>
                </div>
              )}

              {/* Sample List */}
              <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                 {selectedProject.progress.samples.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 italic text-sm">
                       No sample reception records yet.
                    </div>
                 ) : (
                    selectedProject.progress.samples.map((sample) => (
                       <div key={sample.id} className="relative pl-6 pb-6 border-l border-slate-300 last:border-0 last:pb-0">
                          <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-white border-2 border-emerald-500"></div>
                          
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                             <span className="text-emerald-700 font-mono text-sm font-bold bg-emerald-100 px-2 py-0.5 rounded">
                                {new Date(sample.receiveDate).toLocaleString()}
                             </span>
                             <span className="text-xs text-slate-500 mt-1 sm:mt-0 font-mono">{sample.id}</span>
                          </div>
                          
                          <div className="bg-white p-4 rounded-lg border border-slate-200">
                             <div className="grid grid-cols-2 gap-4 mb-3">
                                <div>
                                   <span className="text-[10px] text-slate-500 uppercase block">Category</span>
                                   <span className="text-slate-800 text-sm font-medium">{sample.category}</span>
                                </div>
                                <div>
                                   <span className="text-[10px] text-slate-500 uppercase block">Storage</span>
                                   <span className="text-slate-800 text-sm">{sample.storageMethod}</span>
                                </div>
                                {sample.notes && (
                                    <div className="col-span-2">
                                        <span className="text-[10px] text-slate-500 uppercase block">Notes</span>
                                        <span className="text-slate-800 text-sm">{sample.notes}</span>
                                    </div>
                                )}
                             </div>
                             
                             {/* Images */}
                             {sample.imageUrls && sample.imageUrls.length > 0 && (
                                <div className="flex gap-2 mt-3 overflow-x-auto pb-2 custom-scrollbar">
                                   {sample.imageUrls.map((url, idx) => (
                                      <div key={idx} className="w-16 h-16 flex-shrink-0 rounded overflow-hidden border border-slate-200 cursor-pointer hover:border-emerald-400 transition-colors">
                                         <img src={url} alt="sample" className="w-full h-full object-cover" />
                                      </div>
                                   ))}
                                </div>
                             )}
                          </div>
                       </div>
                    ))
                 )}
              </div>
           </div>

           {/* Events & Exceptions Log */}
           <div className="glass-panel rounded-xl border border-slate-200 overflow-hidden">
               <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center">
                     <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500" />
                     异常 & 变更记录 (Exceptions & Changes)
                  </h3>
                  <button 
                     onClick={() => setShowEventForm(!showEventForm)}
                     className="flex items-center px-3 py-1.5 rounded bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-bold transition-colors"
                  >
                     <Plus className="w-3 h-3 mr-1" />
                     新增记录 (Add Log)
                  </button>
               </div>

               {/* New Event Form */}
               {showEventForm && (
                 <div className="p-6 bg-slate-50 border-b border-slate-200 animate-fade-in">
                    <h4 className="text-xs text-yellow-600 font-bold mb-4 uppercase">Log Entry</h4>
                    <div className="space-y-4 mb-4">
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-xs text-slate-500 mb-1 block">日期 (Date)</label>
                              <input 
                                type="date"
                                value={newEvent.date}
                                onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                                className="w-full bg-white border border-slate-300 rounded p-2 text-sm text-slate-700 focus:border-yellow-500 outline-none"
                              />
                          </div>
                          <div>
                              <label className="text-xs text-slate-500 mb-1 block">类型 (Type)</label>
                              <select
                                value={newEvent.type}
                                onChange={e => setNewEvent({...newEvent, type: e.target.value as EventType})}
                                className="w-full bg-white border border-slate-300 rounded p-2 text-sm text-slate-700 focus:border-yellow-500 outline-none"
                              >
                                  <option value="异常 (Exception)">异常 (Exception)</option>
                                  <option value="变更 (Client Change)">变更 (Client Change)</option>
                                  <option value="其他 (Other)">其他 (Other)</option>
                              </select>
                          </div>
                       </div>
                       
                       <div>
                          <label className="text-xs text-slate-500 mb-1 block">描述 (Description)</label>
                          <textarea 
                            rows={3}
                            placeholder="Describe the situation or change..."
                            value={newEvent.description}
                            onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                            className="w-full bg-white border border-slate-300 rounded p-2 text-sm text-slate-700 focus:border-yellow-500 outline-none"
                          />
                       </div>

                       <div>
                          <label className="text-xs text-slate-500 mb-1 block">附件 (Attachment - Optional)</label>
                          <div className="flex items-center space-x-2">
                             <button 
                               onClick={() => eventFileInputRef.current?.click()}
                               className="px-3 py-1.5 rounded bg-white border border-slate-300 text-xs text-slate-600 hover:text-slate-900 hover:border-yellow-500 transition-colors flex items-center"
                             >
                                <Paperclip className="w-3 h-3 mr-2" />
                                {newEvent.attachmentName || 'Attach File'}
                             </button>
                             <input type="file" ref={eventFileInputRef} className="hidden" onChange={handleEventAttachment} />
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex justify-end gap-3">
                       <button 
                         onClick={() => setShowEventForm(false)}
                         className="px-4 py-2 rounded text-xs text-slate-500 hover:text-slate-800"
                       >
                         Cancel
                       </button>
                       <button 
                         onClick={submitEvent}
                         className="px-6 py-2 rounded bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-bold"
                       >
                         Save Log
                       </button>
                    </div>
                 </div>
               )}

               {/* Events List */}
               <div className="p-6 space-y-4">
                  {(!selectedProject.progress.events || selectedProject.progress.events.length === 0) ? (
                     <div className="text-center py-4 text-slate-500 italic text-sm">
                        No exceptions or changes recorded.
                     </div>
                  ) : (
                     selectedProject.progress.events.map((evt) => (
                        <div key={evt.id} className="bg-white p-4 rounded-lg border border-slate-200 hover:border-slate-400 transition-all shadow-sm">
                           <div className="flex justify-between items-start mb-2">
                               <div className="flex items-center">
                                   {evt.type === '异常 (Exception)' ? (
                                       <FileWarning className="w-4 h-4 text-red-500 mr-2" />
                                   ) : (
                                       <FileText className="w-4 h-4 text-blue-500 mr-2" />
                                   )}
                                   <span className={`text-xs font-bold px-2 py-0.5 rounded ${evt.type === '异常 (Exception)' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                       {evt.type}
                                   </span>
                               </div>
                               <span className="text-xs font-mono text-slate-400">{evt.date}</span>
                           </div>
                           
                           <p className="text-sm text-slate-700 mb-3 whitespace-pre-wrap">{evt.description}</p>
                           
                           {evt.attachmentName && (
                               <div className="flex items-center">
                                   <Paperclip className="w-3 h-3 text-slate-400 mr-1" />
                                   <a 
                                     href={evt.attachmentUrl} 
                                     download={evt.attachmentName}
                                     className="text-xs text-cyan-600 hover:underline"
                                     onClick={(e) => !evt.attachmentUrl && e.preventDefault()}
                                   >
                                       {evt.attachmentName}
                                   </a>
                               </div>
                           )}
                        </div>
                     ))
                  )}
               </div>
           </div>

        </div>
      </div>
    </div>
  );
};

export default ProjectProgressManager;