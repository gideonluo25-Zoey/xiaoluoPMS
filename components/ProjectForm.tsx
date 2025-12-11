import React, { useState, useRef } from 'react';
import { ProjectData, MouseGender } from '../types';
import { Upload, FileText, CheckCircle, AlertCircle, Save } from 'lucide-react';

interface ProjectFormProps {
  onSubmit: (data: ProjectData) => void;
  initialData?: Partial<ProjectData>;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState<Partial<ProjectData>>(initialData || {
    mouseGender: MouseGender.MALE,
    isolatorCount: 1,
    mouseAgeWeeks: 6,
    mouseQuantity: 10,
    mouseStrain: 'C57BL/6', // Default
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value) || 0;
    setFormData(prev => ({ ...prev, [name]: numValue }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a fake URL for demo purposes since we don't have a backend
      const objectUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        contractFileName: file.name,
        contractFileUrl: objectUrl
      }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.clientUnit) newErrors.clientUnit = "请输入客户单位";
    if (!formData.clientName) newErrors.clientName = "请输入客户姓名";
    if (!formData.projectName) newErrors.projectName = "请输入项目名称";
    if (!formData.mouseStrain) newErrors.mouseStrain = "请输入小鼠品系";
    if ((formData.isolatorCount || 0) <= 0) newErrors.isolatorCount = "隔离包数量必须大于0";
    if ((formData.mouseQuantity || 0) <= 0) newErrors.mouseQuantity = "小鼠数量必须大于0";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const finalData: ProjectData = {
        id: `PROJ-${Date.now().toString().slice(-6)}`,
        createDate: new Date().toLocaleDateString('zh-CN'),
        clientUnit: formData.clientUnit!,
        clientName: formData.clientName!,
        projectName: formData.projectName!,
        isolatorCount: formData.isolatorCount!,
        mouseStrain: formData.mouseStrain!,
        mouseGender: formData.mouseGender as MouseGender,
        mouseAgeWeeks: formData.mouseAgeWeeks!,
        mouseQuantity: formData.mouseQuantity!,
        contractFileName: formData.contractFileName || '未上传合同',
        contractFileUrl: formData.contractFileUrl,
        progress: {
          samples: [],
          events: [],
          materials: []
        },
        scheduling: {
          estimatedDate: '',
          location: '',
          isScheduled: false
        }
      };
      onSubmit(finalData);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 animate-fade-in-up">
      <div className="glass-panel rounded-xl p-8 border-t-4 border-t-cyan-500 relative overflow-hidden">
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <FileText size={120} className="text-cyan-800" />
        </div>

        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-6 text-slate-800 font-sans flex items-center">
            <span className="w-2 h-8 bg-cyan-500 mr-3 rounded-sm"></span>
            项目信息录入
          </h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-mono text-cyan-600 uppercase tracking-wider border-b border-cyan-200 pb-2 mb-4">
                01. 基础信息 / Basic Info
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-medium text-slate-600 mb-2">客户单位 (Client Unit)</label>
                  <input
                    type="text"
                    name="clientUnit"
                    value={formData.clientUnit || ''}
                    onChange={handleChange}
                    className={`w-full p-3 rounded-md input-tech ${errors.clientUnit ? 'border-red-500/50' : ''}`}
                    placeholder="例如: 某某生物科技有限公司"
                  />
                  {errors.clientUnit && <p className="mt-1 text-xs text-red-500 flex items-center"><AlertCircle className="w-3 h-3 mr-1"/>{errors.clientUnit}</p>}
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-slate-600 mb-2">客户姓名 (Client Name)</label>
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName || ''}
                    onChange={handleChange}
                    className={`w-full p-3 rounded-md input-tech ${errors.clientName ? 'border-red-500/50' : ''}`}
                    placeholder="请输入联系人姓名"
                  />
                  {errors.clientName && <p className="mt-1 text-xs text-red-500 flex items-center"><AlertCircle className="w-3 h-3 mr-1"/>{errors.clientName}</p>}
                </div>

                <div className="md:col-span-2 group">
                  <label className="block text-sm font-medium text-slate-600 mb-2">项目名称 (Project Name)</label>
                  <input
                    type="text"
                    name="projectName"
                    value={formData.projectName || ''}
                    onChange={handleChange}
                    className={`w-full p-3 rounded-md input-tech ${errors.projectName ? 'border-red-500/50' : ''}`}
                    placeholder="请输入完整项目名称"
                  />
                  {errors.projectName && <p className="mt-1 text-xs text-red-500 flex items-center"><AlertCircle className="w-3 h-3 mr-1"/>{errors.projectName}</p>}
                </div>
              </div>
            </div>

            {/* Section 2: Technical Specs */}
            <div className="space-y-4">
              <h3 className="text-sm font-mono text-cyan-600 uppercase tracking-wider border-b border-cyan-200 pb-2 mb-4">
                02. 实验参数 / Parameters
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                 <div className="group">
                  <label className="block text-sm font-medium text-slate-600 mb-2">隔离包数量</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="isolatorCount"
                      min="1"
                      value={formData.isolatorCount}
                      onChange={handleNumberChange}
                      className="w-full p-3 rounded-md input-tech font-mono text-center text-lg"
                    />
                    <span className="absolute right-3 top-3 text-slate-400 text-xs">个</span>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-slate-600 mb-2">小鼠品系</label>
                  <input
                    type="text"
                    name="mouseStrain"
                    value={formData.mouseStrain}
                    onChange={handleChange}
                    placeholder="e.g. C57BL/6"
                    className={`w-full p-3 rounded-md input-tech ${errors.mouseStrain ? 'border-red-500/50' : ''}`}
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-slate-600 mb-2">小鼠性别</label>
                  <select
                    name="mouseGender"
                    value={formData.mouseGender}
                    onChange={handleChange}
                    className="w-full p-3 rounded-md input-tech appearance-none bg-white"
                  >
                    {Object.values(MouseGender).map((gender) => (
                      <option key={gender} value={gender} className="bg-white text-slate-800">
                        {gender}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-slate-600 mb-2">小鼠周龄</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="mouseAgeWeeks"
                      min="1"
                      value={formData.mouseAgeWeeks}
                      onChange={handleNumberChange}
                      className="w-full p-3 rounded-md input-tech font-mono text-center text-lg"
                    />
                    <span className="absolute right-3 top-3 text-slate-400 text-xs">周</span>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-slate-600 mb-2">小鼠数量</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="mouseQuantity"
                      min="1"
                      value={formData.mouseQuantity}
                      onChange={handleNumberChange}
                      className="w-full p-3 rounded-md input-tech font-mono text-center text-lg text-cyan-600 font-bold"
                    />
                    <span className="absolute right-3 top-3 text-slate-400 text-xs">只</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Contract Upload */}
            <div className="space-y-4">
              <h3 className="text-sm font-mono text-cyan-600 uppercase tracking-wider border-b border-cyan-200 pb-2 mb-4">
                03. 合同文件 / Contract
              </h3>
              
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer group ${formData.contractFileName ? 'border-emerald-500/50 bg-emerald-50' : 'border-slate-300 hover:border-cyan-500 hover:bg-cyan-50'}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  onChange={handleFileChange}
                />
                
                {formData.contractFileName ? (
                  <div className="flex flex-col items-center text-emerald-600">
                    <CheckCircle className="w-12 h-12 mb-2" />
                    <span className="font-medium text-lg">{formData.contractFileName}</span>
                    <span className="text-xs text-emerald-700 mt-1">点击更换文件</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-slate-400 group-hover:text-cyan-600">
                    <Upload className="w-12 h-12 mb-2 transition-transform group-hover:scale-110" />
                    <span className="font-medium">点击上传合同文件</span>
                    <span className="text-xs text-slate-500 mt-1">支持 PDF, Word, 图片格式</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 flex justify-end">
              <button
                type="submit"
                className="relative overflow-hidden group bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-4 rounded-md font-bold tracking-widest transition-all transform hover:-translate-y-1 hover:shadow-lg shadow-cyan-500/30"
              >
                <span className="relative z-10 flex items-center">
                  <Save className="w-5 h-5 mr-2" />
                  生成项目单 (GENERATE)
                </span>
                <div className="absolute inset-0 h-full w-full scale-0 rounded-md transition-all duration-300 group-hover:scale-100 group-hover:bg-cyan-400/20"></div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectForm;