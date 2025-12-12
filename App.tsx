import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ProjectForm from './components/ProjectForm';
import ProjectPreview from './components/ProjectPreview';
import IsolatorManager from './components/IsolatorManager';
import InventoryManager from './components/InventoryManager';
import ProjectProgressManager from './components/ProjectProgressManager';
import ProjectSchedulingManager from './components/ProjectSchedulingManager';
import ReservationManager from './components/ReservationManager';
import NotificationSystem from './components/NotificationSystem';
import { ProjectData, ViewState, Isolator, IsolatorStatus, InventoryItem, MouseGender, Administrator, SystemNotification, Reservation, ReservationStatus } from './types';

// Helper to generate mock isolators
const generateMockIsolators = (count: number): Isolator[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `ISO-${100 + i}`,
    status: Math.random() > 0.8 ? IsolatorStatus.DISINFECTION : IsolatorStatus.READY,
    lastUpdated: new Date().toLocaleDateString(),
    customLabel: '',
  }));
};

// --- CONFIG: Administrators ---
const ADMINISTRATORS: Administrator[] = [
    { 
        id: 'ADMIN-01', 
        name: '张组长 (Mr. Zhang)', 
        role: 'PROJECT_LEADER', 
        roleName: '项目管理组长',
        email: 'zhang.pm@xiaoluo.lab' 
    },
    { 
        id: 'ADMIN-02', 
        name: '李主管 (Ms. Li)', 
        role: 'INVENTORY_LEADER', 
        roleName: '小鼠库存组长',
        email: 'li.inv@xiaoluo.lab' 
    }
];

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('FORM');
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  
  // Global States
  const [isolators, setIsolators] = useState<Isolator[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);

  // Initialize Data
  useEffect(() => {
    // Simulate fetching initial data
    const initialIsolators = generateMockIsolators(24);
    
    // Create Mock Projects for demonstration
    const mockProject: ProjectData = {
        id: 'PROJ-DEMO-01',
        clientUnit: 'Apex BioScience',
        clientName: 'Dr. Chen',
        projectName: 'Neuro-Plasticity Study Ph1',
        isolatorCount: 3,
        mouseStrain: 'C57BL/6',
        mouseGender: MouseGender.MALE,
        mouseAgeWeeks: 8,
        mouseQuantity: 30,
        contractFileName: 'contract_apex_01.pdf',
        createDate: new Date().toLocaleDateString('zh-CN'),
        progress: {
            startDate: '2024-05-15',
            transferDate: '2024-05-20',
            samples: [
                { id: 'SMP-001', receiveDate: '2024-05-14T10:00', category: 'Drug Compound A', storageMethod: '-20C', notes: 'Fragile' }
            ],
            events: [],
            materials: [
               { id: 'MAT-001', name: '无菌垫料 (Sterile Bedding)', quantity: '5 Bags', isPrepared: true, notes: 'Double autoclaved' },
               { id: 'MAT-002', name: '特殊饲料 (Special Feed)', quantity: '10 kg', isPrepared: false, notes: 'Brand X Type A' }
            ]
        },
        scheduling: {
            estimatedDate: '2024-05-15',
            location: 'Lab Block A',
            isScheduled: true
        }
    };
    
    // Manually assign the mock project to the first 3 isolators to show "In Use" state
    initialIsolators[0] = { ...initialIsolators[0], status: IsolatorStatus.IN_USE, currentProjectId: mockProject.id, customLabel: mockProject.projectName, lastUpdated: new Date().toLocaleTimeString() };
    initialIsolators[1] = { ...initialIsolators[1], status: IsolatorStatus.IN_USE, currentProjectId: mockProject.id, customLabel: mockProject.projectName, lastUpdated: new Date().toLocaleTimeString() };
    initialIsolators[2] = { ...initialIsolators[2], status: IsolatorStatus.IN_USE, currentProjectId: mockProject.id, customLabel: mockProject.projectName, lastUpdated: new Date().toLocaleTimeString() };

    setIsolators(initialIsolators);
    setProjects([mockProject]);
    
    // Mock Inventory Items
    setInventory([
        { id: 'BATCH-001', strain: 'C57BL/6', gender: MouseGender.MALE, ageWeeks: 6, quantity: 150, lastUpdated: new Date().toLocaleTimeString() },
        { id: 'BATCH-002', strain: 'BALB/c', gender: MouseGender.FEMALE, ageWeeks: 8, quantity: 80, lastUpdated: new Date().toLocaleTimeString() },
        { id: 'BATCH-003', strain: 'Nude', gender: MouseGender.MALE, ageWeeks: 5, quantity: 45, lastUpdated: new Date().toLocaleTimeString() },
    ]);

    // Mock Reservations
    setReservations([
        { 
            id: 'RES-00101', 
            type: 'ISOLATOR', 
            status: 'PENDING', 
            applicant: 'Dr. Wu', 
            createDate: '2024-05-10', 
            startDate: '2024-06-01', 
            endDate: '2024-07-01',
            resourceId: 'ISO-105',
            notes: 'Viral study preparation'
        },
        { 
            id: 'RES-00102', 
            type: 'INVENTORY', 
            status: 'CONFIRMED', 
            applicant: 'Lab Tech Sarah', 
            createDate: '2024-05-12', 
            startDate: '2024-05-20', 
            endDate: '2024-05-20',
            strain: 'BALB/c',
            gender: MouseGender.FEMALE,
            ageWeeks: 8,
            quantity: 20
        }
    ]);
  }, []);

  const totalMouseCount = inventory.reduce((acc, item) => acc + item.quantity, 0);

  // Notification Helper
  const addNotification = (title: string, message: string, type: 'SUCCESS' | 'INFO' | 'WARNING' | 'EMAIL' = 'INFO') => {
      const id = Date.now().toString() + Math.random();
      const newNote: SystemNotification = { id, title, message, type, timestamp: Date.now() };
      setNotifications(prev => [...prev, newNote]);
      
      // Auto dismiss after 5 seconds
      setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== id));
      }, 5000);
  };

  const handleDismissNotification = (id: string) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleFormSubmit = (data: ProjectData) => {
    // 1. Check Resources
    const availableIsolators = isolators.filter(i => i.status === IsolatorStatus.READY);
    
    if (availableIsolators.length < data.isolatorCount) {
        alert(`隔离包数量不足! 需要 ${data.isolatorCount} 个，当前合格可用只有 ${availableIsolators.length} 个。\n\nInsufficient qualified isolators.`);
        return;
    }

    // 2. Find Exact Inventory Match (Strain + Gender + Age)
    const matchingBatch = inventory.find(item => 
        item.strain.toLowerCase() === data.mouseStrain.toLowerCase() &&
        item.gender === data.mouseGender &&
        item.ageWeeks === data.mouseAgeWeeks
    );

    let updatedInventory = [...inventory];

    if (!matchingBatch) {
        if (!confirm(`未找到完全匹配的库存记录:\nStrain: ${data.mouseStrain}\nGender: ${data.mouseGender}\nAge: ${data.mouseAgeWeeks} weeks\n\n是否继续并创建负库存记录?`)) {
            return;
        }
        // Create a new negative batch if not found
        const newBatch: InventoryItem = {
            id: `BATCH-${Date.now().toString().slice(-4)}`,
            strain: data.mouseStrain,
            gender: data.mouseGender,
            ageWeeks: data.mouseAgeWeeks,
            quantity: -data.mouseQuantity,
            lastUpdated: new Date().toLocaleString()
        };
        updatedInventory.push(newBatch);
    } else {
        if (matchingBatch.quantity < data.mouseQuantity) {
            if (!confirm(`该批次库存不足 (当前: ${matchingBatch.quantity}, 需要: ${data.mouseQuantity})。\n是否继续?`)) {
                return;
            }
        }
        // Deduct from existing batch
        updatedInventory = updatedInventory.map(item => 
            item.id === matchingBatch.id 
            ? { ...item, quantity: item.quantity - data.mouseQuantity, lastUpdated: new Date().toLocaleString() }
            : item
        );
    }

    // 3. Initialize Progress & Scheduling Data for new project
    const newProject: ProjectData = {
        ...data,
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

    // 4. Consume Isolators
    const updatedIsolators = [...isolators];
    let allocated = 0;
    
    for (let i = 0; i < updatedIsolators.length; i++) {
        if (updatedIsolators[i].status === IsolatorStatus.READY && allocated < data.isolatorCount) {
            updatedIsolators[i] = {
                ...updatedIsolators[i],
                status: IsolatorStatus.IN_USE,
                currentProjectId: newProject.id,
                customLabel: newProject.projectName, // Set the text label automatically
                lastUpdated: new Date().toLocaleString()
            };
            allocated++;
        }
    }
    
    setIsolators(updatedIsolators);
    setInventory(updatedInventory);
    setProjects(prev => [...prev, newProject]);

    // 5. Success Notifications
    setProjectData(newProject);
    setView('PREVIEW');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // --- TRIGGER EMAIL NOTIFICATIONS ---
    addNotification('Project Created', `Project ${newProject.id} successfully registered.`, 'SUCCESS');
    
    // Simulate slight delay for email sending
    setTimeout(() => {
        const projLeader = ADMINISTRATORS.find(a => a.role === 'PROJECT_LEADER');
        if (projLeader) {
            addNotification(
                'Notification Sent', 
                `Email dispatched to Project Leader: ${projLeader.name} (${projLeader.email})`, 
                'EMAIL'
            );
        }
    }, 1000);

    setTimeout(() => {
        const invLeader = ADMINISTRATORS.find(a => a.role === 'INVENTORY_LEADER');
        if (invLeader) {
            addNotification(
                'Notification Sent', 
                `Email dispatched to Inventory Leader: ${invLeader.name} (${invLeader.email})`, 
                'EMAIL'
            );
        }
    }, 2000);
  };

  const handleIsolatorUpdate = (id: string, status: IsolatorStatus) => {
      setIsolators(prev => prev.map(iso => 
          iso.id === id 
          ? { 
              ...iso, 
              status, 
              // Clear project linkage if not in use.
              currentProjectId: status === IsolatorStatus.IN_USE ? iso.currentProjectId : undefined,
              // If status changed, clear the label (reset for new state). If status is same, keep it.
              customLabel: iso.status === status ? iso.customLabel : '',
              lastUpdated: new Date().toLocaleString() 
            } 
          : iso
      ));
  };

  const handleIsolatorLabelUpdate = (id: string, label: string) => {
      setIsolators(prev => prev.map(iso => 
          iso.id === id 
          ? { ...iso, customLabel: label, lastUpdated: new Date().toLocaleString() } 
          : iso
      ));
  };

  // Inventory Actions
  const handleAddStock = (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => {
      const newItem: InventoryItem = {
          ...item,
          id: `BATCH-${Date.now().toString().slice(-4)}`,
          lastUpdated: new Date().toLocaleString()
      };
      setInventory(prev => [newItem, ...prev]);
  };

  const handleUpdateStock = (id: string, newQty: number) => {
      setInventory(prev => prev.map(item => 
          item.id === id ? { ...item, quantity: newQty, lastUpdated: new Date().toLocaleString() } : item
      ));
  };

  const handleRemoveStock = (id: string) => {
      if(confirm('Are you sure you want to delete this batch?')) {
          setInventory(prev => prev.filter(item => item.id !== id));
      }
  };

  const handleProjectUpdate = (updatedProject: ProjectData) => {
      setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const handleAddReservation = (res: Reservation) => {
      setReservations(prev => [res, ...prev]);
      addNotification('Booking Submitted', `${res.type} reservation for ${res.applicant} is pending.`, 'INFO');
  };

  const handleReservationStatusUpdate = (id: string, status: ReservationStatus) => {
      const res = reservations.find(r => r.id === id);
      if (!res) return;
      
      const oldStatus = res.status;

      // Update the reservation state
      setReservations(prev => prev.map(r => 
          r.id === id ? { ...r, status } : r
      ));

      // Handle Inventory Logic on Confirmation/Cancellation
      if (res.type === 'INVENTORY' && res.quantity && res.strain) {
          
          // Case 1: CONFIRMING -> Deduct Stock
          if (status === 'CONFIRMED' && oldStatus !== 'CONFIRMED') {
              setInventory(prevInv => {
                  // Find best matching batch
                  const matchIndex = prevInv.findIndex(item => 
                      item.strain.toLowerCase() === res.strain?.toLowerCase() &&
                      item.gender === res.gender &&
                      item.ageWeeks === res.ageWeeks
                  );

                  if (matchIndex !== -1) {
                      // Deduct from existing
                      const newInv = [...prevInv];
                      newInv[matchIndex] = {
                          ...newInv[matchIndex],
                          quantity: newInv[matchIndex].quantity - (res.quantity || 0),
                          lastUpdated: new Date().toLocaleString()
                      };
                      return newInv;
                  } else {
                      // No match found, create negative stock entry (debt)
                      const newItem: InventoryItem = {
                          id: `BATCH-RES-${Date.now().toString().slice(-4)}`,
                          strain: res.strain!,
                          gender: res.gender!,
                          ageWeeks: res.ageWeeks || 0,
                          quantity: -(res.quantity || 0),
                          lastUpdated: new Date().toLocaleString()
                      };
                      return [...prevInv, newItem];
                  }
              });
              addNotification('Stock Updated', `Inventory deducted automatically for Reservation ${id}`, 'WARNING');
          }
          
          // Case 2: CANCELLING (after confirm) -> Restock (Refund)
          else if (status === 'CANCELLED' && oldStatus === 'CONFIRMED') {
               setInventory(prevInv => {
                  // Find match to add back
                  const matchIndex = prevInv.findIndex(item => 
                      item.strain.toLowerCase() === res.strain?.toLowerCase() &&
                      item.gender === res.gender &&
                      item.ageWeeks === res.ageWeeks
                  );

                  if (matchIndex !== -1) {
                      const newInv = [...prevInv];
                      newInv[matchIndex] = {
                          ...newInv[matchIndex],
                          quantity: newInv[matchIndex].quantity + (res.quantity || 0),
                          lastUpdated: new Date().toLocaleString()
                      };
                      return newInv;
                  } else {
                       const newItem: InventoryItem = {
                          id: `BATCH-REFUND-${Date.now().toString().slice(-4)}`,
                          strain: res.strain!,
                          gender: res.gender!,
                          ageWeeks: res.ageWeeks || 0,
                          quantity: (res.quantity || 0),
                          lastUpdated: new Date().toLocaleString()
                      };
                      return [...prevInv, newItem];
                  }
              });
              addNotification('Stock Restored', `Inventory returned from Cancelled Reservation ${id}`, 'SUCCESS');
          }
      }

      if (status === 'CONFIRMED') {
        addNotification('Booking Confirmed', `Reservation ${id} has been approved.`, 'SUCCESS');
      } else if (status === 'CANCELLED') {
        addNotification('Booking Cancelled', `Reservation ${id} has been cancelled.`, 'WARNING');
      }
  };

  return (
    <div className="min-h-screen bg-tech-dark text-tech-text selection:bg-cyan-200 selection:text-cyan-900 pb-20 font-sans">
      <Header currentView={view} onNavigate={setView} />
      
      {/* Notifications Layer */}
      <NotificationSystem notifications={notifications} onDismiss={handleDismissNotification} />
      
      <main className="mt-8 px-4">
        {/* Ambient background glow - Light Blue */}
        <div className="fixed top-20 left-1/4 w-96 h-96 bg-cyan-200/40 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="fixed bottom-20 right-1/4 w-96 h-96 bg-blue-200/40 rounded-full blur-[100px] pointer-events-none"></div>

        {view === 'FORM' && (
          <div className="relative z-10 transition-opacity duration-500 ease-in-out">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">新建项目</h2>
              <p className="text-cyan-600 font-mono">Create New Project Protocol</p>
              
              <div className="mt-4 flex justify-center gap-4 text-xs font-mono">
                  <span className="px-3 py-1 rounded bg-white border border-slate-200 text-slate-600 shadow-sm">
                    可用隔离包: <b className="text-emerald-500">{isolators.filter(i => i.status === IsolatorStatus.READY).length}</b>
                  </span>
                  <span className="px-3 py-1 rounded bg-white border border-slate-200 text-slate-600 shadow-sm">
                    小鼠总库存: <b className="text-blue-500">{totalMouseCount}</b>
                  </span>
              </div>
            </div>
            <ProjectForm 
              onSubmit={handleFormSubmit} 
              initialData={projectData || undefined} 
            />
          </div>
        )}

        {view === 'PREVIEW' && projectData && (
           <div className="relative z-10 transition-opacity duration-500 ease-in-out">
             <ProjectPreview 
               data={projectData} 
               onBack={() => setView('FORM')} 
             />
           </div>
        )}

        {view === 'SCHEDULING' && (
            <ProjectSchedulingManager
                projects={projects}
                onUpdateProject={handleProjectUpdate}
            />
        )}

        {view === 'ISOLATORS' && (
            <IsolatorManager 
                isolators={isolators}
                projects={projects}
                onUpdateStatus={handleIsolatorUpdate}
                onUpdateLabel={handleIsolatorLabelUpdate}
            />
        )}

        {view === 'INVENTORY' && (
            <InventoryManager 
                inventory={inventory}
                onAddStock={handleAddStock}
                onUpdateStock={handleUpdateStock}
                onRemoveStock={handleRemoveStock}
            />
        )}

        {view === 'PROGRESS' && (
            <ProjectProgressManager
                projects={projects}
                onUpdateProject={handleProjectUpdate}
            />
        )}

        {view === 'RESERVATIONS' && (
            <ReservationManager
                reservations={reservations}
                isolators={isolators}
                inventory={inventory}
                onAddReservation={handleAddReservation}
                onUpdateStatus={handleReservationStatusUpdate}
            />
        )}
      </main>
      
      <footer className="fixed bottom-0 w-full py-4 text-center text-xs text-slate-500 bg-white/80 backdrop-blur-sm border-t border-slate-200 z-40">
        <p>XIAO LUO PROJECT MANAGEMENT SYSTEM © 2024 | SECURE CONNECTION</p>
      </footer>
    </div>
  );
};

export default App;