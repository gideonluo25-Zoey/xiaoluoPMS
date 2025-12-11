import React, { useEffect, useState } from 'react';
import { SystemNotification } from '../types';
import { Mail, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

interface NotificationSystemProps {
  notifications: SystemNotification[];
  onDismiss: (id: string) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ notifications, onDismiss }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {notifications.map((note) => (
        <div 
          key={note.id}
          className="pointer-events-auto w-80 md:w-96 glass-panel border-l-4 p-4 shadow-xl rounded-r-lg animate-slide-in-right backdrop-blur-xl relative overflow-hidden group bg-white/90"
          style={{
            borderColor: 
              note.type === 'SUCCESS' ? '#10b981' : 
              note.type === 'EMAIL' ? '#3b82f6' : 
              note.type === 'WARNING' ? '#f59e0b' : '#06b6d4'
          }}
        >
          {/* Background Gradient */}
          <div className={`absolute inset-0 opacity-5 ${
             note.type === 'SUCCESS' ? 'bg-emerald-500' : 
             note.type === 'EMAIL' ? 'bg-blue-500' : 
             note.type === 'WARNING' ? 'bg-amber-500' : 'bg-cyan-500'
          }`}></div>

          <button 
            onClick={() => onDismiss(note.id)}
            className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3 relative z-10">
            <div className={`mt-1 p-2 rounded-full ${
               note.type === 'SUCCESS' ? 'bg-emerald-100 text-emerald-600' : 
               note.type === 'EMAIL' ? 'bg-blue-100 text-blue-600' : 
               note.type === 'WARNING' ? 'bg-amber-100 text-amber-600' : 'bg-cyan-100 text-cyan-600'
            }`}>
              {note.type === 'EMAIL' ? <Mail className="w-5 h-5" /> :
               note.type === 'SUCCESS' ? <CheckCircle className="w-5 h-5" /> :
               note.type === 'WARNING' ? <AlertTriangle className="w-5 h-5" /> :
               <Info className="w-5 h-5" />}
            </div>
            
            <div className="flex-1">
              <h4 className={`text-sm font-bold mb-1 ${
                 note.type === 'SUCCESS' ? 'text-emerald-700' : 
                 note.type === 'EMAIL' ? 'text-blue-700' : 
                 note.type === 'WARNING' ? 'text-amber-700' : 'text-cyan-700'
              }`}>
                {note.title}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-mono">
                {note.message}
              </p>
              {note.type === 'EMAIL' && (
                  <div className="mt-2 text-[10px] text-slate-500 flex items-center">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse mr-2"></span>
                      SMTP RELAY: SENT
                  </div>
              )}
            </div>
          </div>
          
          {/* Progress Bar for Auto Dismiss */}
          <div className="absolute bottom-0 left-0 h-1 bg-slate-100 w-full">
            <div className={`h-full animate-shrink-width w-full origin-left ${
               note.type === 'SUCCESS' ? 'bg-emerald-500' : 
               note.type === 'EMAIL' ? 'bg-blue-500' : 
               note.type === 'WARNING' ? 'bg-amber-500' : 'bg-cyan-500'
            }`}></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationSystem;