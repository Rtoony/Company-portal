
import React, { useState, useEffect } from 'react';
import { Employee, EmployeeStatus } from '../types';
import { DataService } from '../services/dataService';
import { EmployeeFormModal } from './EmployeeFormModal';
import { Users, Search, LayoutGrid, List, Mail, Phone, MapPin, Briefcase, Shield, Activity, Radio, Plus, Edit, Trash2 } from 'lucide-react';

export const PersonnelModule: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // CRUD State
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
        const data = await DataService.fetchEmployees();
        setEmployees(data);
    } finally {
        setIsLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            emp.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = deptFilter === 'ALL' || emp.department === deptFilter;
      return matchesSearch && matchesDept;
  });

  const handleCreateStart = () => {
      setEditingEmployee(null);
      setShowModal(true);
  };

  const handleEditStart = (employee: Employee, e?: React.MouseEvent) => {
      e?.stopPropagation();
      setEditingEmployee(employee);
      setShowModal(true);
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (window.confirm("Are you sure you want to remove this employee record?")) {
          await DataService.deleteEmployee(id);
          setEmployees(prev => prev.filter(e => e.id !== id));
      }
  };

  const handleSave = async (data: Partial<Employee>) => {
      setShowModal(false);
      if (editingEmployee) {
          // Update
          const updated = await DataService.updateEmployee({ ...editingEmployee, ...data } as Employee);
          setEmployees(prev => prev.map(e => e.id === updated.id ? updated : e));
      } else {
          // Create
          const created = await DataService.addEmployee(data);
          setEmployees(prev => [...prev, created]);
      }
  };

  const getStatusColor = (status: EmployeeStatus) => {
      switch(status) {
          case 'ACTIVE': return 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10';
          case 'FIELD': return 'text-amber-400 border-amber-500/50 bg-amber-500/10';
          case 'REMOTE': return 'text-blue-400 border-blue-500/50 bg-blue-500/10';
          case 'LEAVE': return 'text-red-400 border-red-500/50 bg-red-500/10';
          case 'MEETING': return 'text-purple-400 border-purple-500/50 bg-purple-500/10';
          default: return 'text-neutral-400 border-neutral-500/50 bg-neutral-500/10';
      }
  };

  const departments = ['ALL', ...Array.from(new Set(employees.map(e => e.department)))];

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--bg-main)] overflow-hidden relative">
       {/* Background Texture */}
       <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px]"></div>

       <div className="relative z-10 flex flex-col h-full">
          
          {/* Header */}
          <div className="px-8 py-6 border-b border-[var(--border-subtle)] bg-[var(--bg-main)]/90 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                  <div className="flex items-center gap-2 mb-1 text-indigo-500">
                      <Users size={16} />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest">HR & Operations</span>
                  </div>
                  <h1 className="text-3xl font-bold text-[var(--text-main)] tracking-tight">Personnel Roster</h1>
              </div>

              <div className="flex items-center gap-3">
                  <button 
                    onClick={handleCreateStart}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-sm font-bold uppercase text-xs tracking-wider shadow-lg transition-colors"
                  >
                      <Plus size={16} /> Add Employee
                  </button>
              </div>
          </div>

          {/* Controls */}
          <div className="px-8 py-4 bg-[#18181b] border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                  <div className="relative w-full max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
                      <input 
                          type="text" 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Find employee..."
                          className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all font-mono placeholder:text-neutral-600"
                      />
                  </div>
                  <div className="h-8 w-[1px] bg-white/10 hidden md:block"></div>
                  <div className="flex items-center gap-2 overflow-x-auto">
                      {departments.map(dept => (
                          <button 
                              key={dept}
                              onClick={() => setDeptFilter(dept)}
                              className={`
                                  px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all whitespace-nowrap
                                  ${deptFilter === dept 
                                  ? 'bg-indigo-500 text-white border-transparent' 
                                  : 'bg-transparent text-neutral-500 border-neutral-700 hover:border-neutral-500 hover:text-neutral-300'}
                              `}
                          >
                              {dept}
                          </button>
                      ))}
                  </div>
              </div>

              <div className="flex gap-2 bg-black/40 p-1 rounded-lg border border-white/10">
                  <button 
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded ${viewMode === 'grid' ? 'bg-neutral-700 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                  >
                      <LayoutGrid size={16} />
                  </button>
                  <button 
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded ${viewMode === 'list' ? 'bg-neutral-700 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                  >
                      <List size={16} />
                  </button>
              </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {isLoading ? (
                  <div className="flex justify-center items-center h-64 text-neutral-500">Loading Directory...</div>
              ) : (
                  <>
                      {viewMode === 'grid' ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                              {filteredEmployees.map(emp => (
                                  <div key={emp.id} className="bg-[#18181b] border border-[var(--border-main)] rounded-sm group hover:border-indigo-500/50 transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer relative overflow-hidden flex flex-col">
                                      {/* Top Bar */}
                                      <div className="h-1.5 w-full bg-gradient-to-r from-neutral-800 to-neutral-700"></div>
                                      
                                      <div className="p-5 flex-1">
                                          <div className="flex items-start justify-between mb-4">
                                              <div className="w-16 h-16 rounded bg-white border border-white/10 overflow-hidden shadow-inner">
                                                  <img src={emp.avatarUrl} className="w-full h-full object-cover" alt={emp.name} />
                                              </div>
                                              <div className="text-right">
                                                   <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${getStatusColor(emp.status)}`}>
                                                       {emp.status === 'FIELD' && <Activity size={10} className="animate-pulse"/>}
                                                       {emp.status}
                                                   </div>
                                                   <div className="mt-2 font-mono text-[10px] text-neutral-500">{emp.id}</div>
                                              </div>
                                          </div>

                                          <div className="mb-4">
                                              <h3 className="text-lg font-bold text-white leading-none mb-1 group-hover:text-indigo-300 transition-colors">{emp.name}</h3>
                                              <p className="text-indigo-400 text-xs uppercase tracking-wider font-bold mb-4">{emp.title}</p>
                                              
                                              <div className="space-y-2 border-t border-white/5 pt-3">
                                                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                                                      <Briefcase size={12} className="opacity-50"/> 
                                                      <span>{emp.department}</span>
                                                  </div>
                                                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                                                      <MapPin size={12} className="opacity-50"/> 
                                                      <span>{emp.location}</span>
                                                  </div>
                                                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                                                      <Phone size={12} className="opacity-50"/> 
                                                      <span>{emp.phone}</span>
                                                  </div>
                                                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                                                      <Mail size={12} className="opacity-50"/> 
                                                      <span className="truncate">{emp.email}</span>
                                                  </div>
                                              </div>
                                          </div>

                                          <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/5">
                                              {emp.skills.map((skill, i) => (
                                                  <span key={i} className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 text-[9px] border border-white/5">
                                                      {skill}
                                                  </span>
                                              ))}
                                          </div>
                                      </div>

                                      {/* Actions Footer */}
                                      <div className="p-3 border-t border-white/5 flex justify-end gap-2 bg-black/10">
                                          <button 
                                            onClick={(e) => handleEditStart(emp, e)}
                                            className="p-1.5 text-neutral-500 hover:text-indigo-400 hover:bg-white/5 rounded transition-colors"
                                          >
                                              <Edit size={14} />
                                          </button>
                                          <button 
                                            onClick={(e) => handleDelete(emp.id, e)}
                                            className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-white/5 rounded transition-colors"
                                          >
                                              <Trash2 size={14} />
                                          </button>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <div className="bg-[#18181b] border border-[var(--border-main)] rounded-sm overflow-hidden">
                              <table className="w-full text-left border-collapse">
                                  <thead className="bg-black/20 text-xs uppercase text-neutral-500 font-mono border-b border-white/5">
                                      <tr>
                                          <th className="p-4 font-medium">Employee</th>
                                          <th className="p-4 font-medium">Title</th>
                                          <th className="p-4 font-medium">Dept</th>
                                          <th className="p-4 font-medium">Location</th>
                                          <th className="p-4 font-medium">Status</th>
                                          <th className="p-4 font-medium">Contact</th>
                                          <th className="p-4 font-medium text-right">Actions</th>
                                      </tr>
                                  </thead>
                                  <tbody className="text-sm text-neutral-300 divide-y divide-white/5">
                                      {filteredEmployees.map(emp => (
                                          <tr key={emp.id} className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => handleEditStart(emp)}>
                                              <td className="p-4">
                                                  <div className="flex items-center gap-3">
                                                      <div className="w-8 h-8 rounded bg-white overflow-hidden border border-white/10">
                                                          <img src={emp.avatarUrl} className="w-full h-full object-cover"/>
                                                      </div>
                                                      <div>
                                                          <div className="font-bold text-white">{emp.name}</div>
                                                          <div className="text-[9px] font-mono text-neutral-500">{emp.id}</div>
                                                      </div>
                                                  </div>
                                              </td>
                                              <td className="p-4 text-neutral-400">{emp.title}</td>
                                              <td className="p-4 text-neutral-400">{emp.department}</td>
                                              <td className="p-4 text-neutral-400 font-mono text-xs">{emp.location}</td>
                                              <td className="p-4">
                                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${getStatusColor(emp.status)}`}>
                                                      {emp.status === 'FIELD' && <Radio size={8} className="animate-pulse"/>}
                                                      {emp.status}
                                                  </span>
                                              </td>
                                              <td className="p-4 text-xs font-mono text-neutral-500">
                                                  <div>{emp.email}</div>
                                                  <div>{emp.phone}</div>
                                              </td>
                                              <td className="p-4 text-right">
                                                  <div className="flex items-center justify-end gap-2">
                                                      <button 
                                                        onClick={(e) => handleEditStart(emp, e)}
                                                        className="text-neutral-500 hover:text-indigo-400 transition-colors"
                                                      >
                                                          <Edit size={14} />
                                                      </button>
                                                      <button 
                                                        onClick={(e) => handleDelete(emp.id, e)}
                                                        className="text-neutral-500 hover:text-red-400 transition-colors"
                                                      >
                                                          <Trash2 size={14} />
                                                      </button>
                                                  </div>
                                              </td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                      )}
                  </>
              )}
          </div>
       </div>

       {/* Modal */}
       {showModal && (
           <EmployeeFormModal 
                mode={editingEmployee ? 'EDIT' : 'CREATE'}
                initialData={editingEmployee || undefined}
                onClose={() => setShowModal(false)}
                onSave={handleSave}
           />
       )}
    </div>
  );
};
