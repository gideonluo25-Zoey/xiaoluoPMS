import React from 'react';
import { ProjectData } from '../types';
import { Download, FileText, ArrowLeft, Printer, Box, Share2 } from 'lucide-react';

interface ProjectPreviewProps {
  data: ProjectData;
  onBack: () => void;
}

const ProjectPreview: React.FC<ProjectPreviewProps> = ({ data, onBack }) => {

  const handleDownload = () => {
    // Generate a simple text representation
    const content = `
========================================
       小罗项目管理系统 - 项目确认单
       XIAO LUO PROJECT MANAGEMENT
========================================

项目编号 (ID): ${data.id}
创建日期 (Date): ${data.createDate}

[ 客户信息 / Client Info ]
----------------------------------------
客户单位: ${data.clientUnit}
客户姓名: ${data.clientName}

[ 项目信息 / Project Details ]
----------------------------------------
项目名称: ${data.projectName}
合同文件: ${data.contractFileName}

[ 实验参数 / Lab Parameters ]
----------------------------------------
隔离包数量: ${data.isolatorCount}
小鼠品系  : ${data.mouseStrain}
小鼠性别  : ${data.mouseGender}
小鼠周龄  : ${data.mouseAgeWeeks} 周
小鼠数量  : ${data.mouseQuantity} 只

========================================
生成的报告 - 仅供内部使用
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.projectName}_ProjectSheet.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadContract = () => {
      if (data.contractFileUrl) {
          const link = document.createElement('a');
          link.href = data.contractFileUrl;
          link.download = data.contractFileName;
          link.click();
      } else {
          alert("未找到有效的合同文件链接。");
      }
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={onBack}
          className="flex items-center text-cyan-600 hover:text-cyan-800 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" />
          返回编辑 (BACK)
        </button>
        <div className="text-right">
            <h2 className="text-2xl font-bold text-slate-800 tracking-wider">{data.id}</h2>
            <p className="text-xs text-cyan-600 font-mono">PROJECT IDENTIFIER</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-8 rounded-xl border-l-4 border-l-blue-500 relative bg-white">
             <div className="absolute -top-3 -right-3">
                <div className="bg-blue-500 text-white font-bold text-xs px-2 py-1 rounded shadow-lg uppercase">
                    Status: Pending
                </div>
             </div>

            <div className="mb-8">
              <h3 className="text-xs font-mono text-blue-600 mb-1">PROJECT NAME</h3>
              <h1 className="text-3xl font-bold text-slate-900">{data.projectName}</h1>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-mono text-slate-400 mb-1">CLIENT UNIT</h3>
                <p className="text-lg text-slate-700">{data.clientUnit}</p>
              </div>
              <div>
                <h3 className="text-xs font-mono text-slate-400 mb-1">CLIENT CONTACT</h3>
                <p className="text-lg text-slate-700">{data.clientName}</p>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-200">
               <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center">
                 <Box className="w-4 h-4 mr-2 text-blue-500"/> 
                 规格参数 (SPECIFICATIONS)
               </h3>
               <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="text-center">
                    <p className="text-xs text-slate-400">隔离包</p>
                    <p className="text-xl font-mono text-cyan-600 font-bold">{data.isolatorCount}</p>
                  </div>
                   <div className="text-center border-l border-slate-200">
                    <p className="text-xs text-slate-400">品系</p>
                    <p className="text-sm font-mono text-cyan-600 font-bold mt-1 truncate" title={data.mouseStrain}>{data.mouseStrain}</p>
                  </div>
                  <div className="text-center border-l border-slate-200">
                    <p className="text-xs text-slate-400">性别</p>
                    <p className="text-sm font-mono text-cyan-600 font-bold mt-1">{data.mouseGender.split(' ')[0]}</p>
                  </div>
                  <div className="text-center border-l border-slate-200">
                    <p className="text-xs text-slate-400">周龄</p>
                    <p className="text-xl font-mono text-cyan-600 font-bold">{data.mouseAgeWeeks}</p>
                  </div>
                  <div className="text-center border-l border-slate-200">
                    <p className="text-xs text-slate-400">数量</p>
                    <p className="text-xl font-mono text-cyan-600 font-bold">{data.mouseQuantity}</p>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Sidebar / Actions */}
        <div className="space-y-6">
           {/* Contract Card */}
           <div className="glass-panel p-6 rounded-xl border border-slate-200 flex flex-col items-center text-center bg-white">
              <FileText className="w-16 h-16 text-slate-400 mb-4" />
              <h3 className="text-slate-800 font-medium mb-1 truncate w-full" title={data.contractFileName}>
                  {data.contractFileName}
              </h3>
              <p className="text-xs text-slate-500 mb-6">合同附件 / Attachment</p>
              <button 
                onClick={handleDownloadContract}
                disabled={!data.contractFileUrl}
                className={`w-full py-2 px-4 rounded border flex items-center justify-center text-sm transition-colors ${data.contractFileUrl ? 'border-cyan-500 text-cyan-600 hover:bg-cyan-50' : 'border-slate-200 text-slate-400 cursor-not-allowed'}`}
              >
                <Download className="w-4 h-4 mr-2" />
                下载合同
              </button>
           </div>

           {/* Main Actions */}
           <div className="glass-panel p-6 rounded-xl border border-slate-200 space-y-3 bg-white">
              <button 
                onClick={handleDownload}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 px-4 rounded font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center"
              >
                <Printer className="w-5 h-5 mr-2" />
                导出项目单
              </button>
              
              <button className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 py-3 px-4 rounded font-medium transition-all flex items-center justify-center">
                <Share2 className="w-5 h-5 mr-2" />
                分享项目 (Share)
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPreview;