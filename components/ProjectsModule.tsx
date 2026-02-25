
import React, { useState, useEffect } from 'react';
import { Project, ProjectStatus } from '../types';
import { DataService } from '../services/dataService';
import { ProjectFormModal } from './ProjectFormModal';
import { TransmittalModal } from './TransmittalModal';
import { Briefcase, Search, Filter, LayoutGrid, List, MapPin, Calendar, User, MoreVertical, FolderOpen, AlertCircle, CheckCircle2, Clock, Plus, Edit, Trash2, FileText, Hash, Map } from 'lucide-react';

export const ProjectsModule: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'ALL'>('ALL');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // CRUD State
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Transmittal State
  const [transmittalProject, setTransmittalProject] = useState<Project | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
        const data = await DataService.fetchProjects();
        setProjects(data);
    } finally {
        setIsLoading(false);
    }
  };

  const handleCreateStart = () => {
      setEditingProject(null);
      setShowModal(true);
  };

  const handleEditStart = (project: Project, e?: React.MouseEvent) => {
      e?.stopPropagation();
      setEditingProject(project);
      setShowModal(true);
  };

  const handleTransmittalStart = (project: Project, e?: React.MouseEvent) => {
      e?.stopPropagation();
      setTransmittalProject(project);
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (window.confirm("Are you sure you want to delete this project record? This cannot be undone.")) {
          await DataService.deleteProject(id);
          setProjects(prev => prev.filter(p => p.id !== id));
      }
  };

  const handleSave = async (data: Partial<Project>) => {
      setShowModal(false);
      if (editingProject) {
          // Update
          const updated = await DataService.updateProject({ ...editingProject, ...data } as Project);
          setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
      } else {
          // Create
          const created = await DataService.addProject(data);
          setProjects(prev => [...prev, created]);
      }
  };

  const filteredProjects = projects.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.client.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: ProjectStatus) => {
      switch(status) {
          case 'ACTIVE': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
          case 'HOLD': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
          case 'COMPLETED': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
          case 'BIDDING': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
          default: return 'text-neutral-500 bg-neutral-500/10 border-neutral-500/20';
      }
  };

  const getProgressColor = (status: ProjectStatus) => {
      switch(status) {
          case 'ACTIVE': return 'bg-emerald-500';
          case 'HOLD': return 'bg-amber-500';
          case 'COMPLETED': return 'bg-blue-500';
          default: return 'bg-purple-500';
      }
  };

  // --- WAR ROOM MAP HELPERS ---
  const renderMapPins = () => {
      // Create a bounding box based on mock data distribution
      const minLat = 38.2; const maxLat = 38.7;
      const minLng = -123.0; const maxLng = -122.2;
      
      return filteredProjects.map((p) => {
          if (!p.coordinates) return null;
          
          // Normalize coordinates to percentage [0-100]
          const top = 100 - ((p.coordinates.lat - minLat) / (maxLat - minLat)) * 100;
          const left = ((p.coordinates.lng - minLng) / (maxLng - minLng)) * 100;

          return (
              <div 
                  key={p.id}
                  className="absolute group z-10 hover:z-50"
                  style={{ top: `${top}%`, left: `${left}%` }}
              >
                  {/* Radar Ping */}
                  <div className={`absolute -inset-4 rounded-full opacity-20 animate-ping ${getProgressColor(p.status)}`}></div>
                  
                  {/* Pin */}
                  <div 
                    onClick={() => handleEditStart(p)}
                    className={`relative w-3 h-3 rounded-full cursor-pointer shadow-[0_0_10px_currentColor] transition-transform hover:scale-150 ${getProgressColor(p.status)} border border-white`}
                  ></div>

                  {/* Tooltip Card */}
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 w-48 bg-black/90 border border-white/20 p-3 rounded hidden group-hover:block backdrop-blur-md shadow-2xl pointer-events-none animate-in fade-in slide-in-from-left-2">
                      <div className="text-[9px] font-mono text-neutral-400 mb-1">{p.id}</div>
                      <div className="text-xs font-bold text-white mb-1 truncate">{p.name}</div>
                      <div className={`text-[9px] inline-block px-1 rounded ${getStatusColor(p.status)}`}>{p.status}</div>
                  </div>
              </div>
          );
      });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--bg-main)] overflow-hidden relative">
       {/* Background Texture */}
       <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px]"></div>

       <div className="relative z-10 flex flex-col h-full">
          
          {/* Header */}
          <div className="px-8 py-6 border-b border-[var(--border-subtle)] bg-[var(--bg-main)]/90 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                  <div className="flex items-center gap-2 mb-1 text-indigo-500">
                      <Briefcase size={16} />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Job Management</span>
                  </div>
                  <h1 className="text-3xl font-bold text-[var(--text-main)] tracking-tight">Active Projects</h1>
              </div>

              <div className="flex items-center gap-3">
                  <button 
                    onClick={handleCreateStart}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-sm font-bold uppercase text-xs tracking-wider shadow-lg transition-colors"
                  >
                      <Plus size={16} /> New Job
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
                          placeholder="Search by Job #, Name, or Client..."
                          className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all font-mono placeholder:text-neutral-600"
                      />
                  </div>
                  <div className="h-8 w-[1px] bg-white/10 hidden md:block"></div>
                  <div className="flex items-center gap-2 overflow-x-auto">
                      {(['ALL', 'ACTIVE', 'HOLD', 'COMPLETED', 'BIDDING'] as const).map(status => (
                          <button 
                              key={status}
                              onClick={() => setStatusFilter(status)}
                              className={`
                                  px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all whitespace-nowrap
                                  ${statusFilter === status 
                                  ? 'bg-indigo-500 text-white border-transparent' 
                                  : 'bg-transparent text-neutral-500 border-neutral-700 hover:border-neutral-500 hover:text-neutral-300'}
                              `}
                          >
                              {status}
                          </button>
                      ))}
                  </div>
              </div>

              <div className="flex gap-2 bg-black/40 p-1 rounded-lg border border-white/10">
                  <button 
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded ${viewMode === 'grid' ? 'bg-neutral-700 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                      title="Grid View"
                  >
                      <LayoutGrid size={16} />
                  </button>
                  <button 
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded ${viewMode === 'list' ? 'bg-neutral-700 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                      title="List View"
                  >
                      <List size={16} />
                  </button>
                  <button 
                      onClick={() => setViewMode('map')}
                      className={`p-2 rounded ${viewMode === 'map' ? 'bg-neutral-700 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                      title="War Room Map"
                  >
                      <Map size={16} />
                  </button>
              </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-0 md:p-8 custom-scrollbar relative">
              {isLoading ? (
                  <div className="flex justify-center items-center h-64 text-neutral-500">Loading Projects...</div>
              ) : (
                  <>
                      {viewMode === 'map' && (
                          <div className="w-full h-full min-h-[500px] bg-[#09090b] border border-white/10 rounded-sm relative overflow-hidden group">
                               {/* Tactical Grid Background */}
                               <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,128,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,128,0.05)_1px,transparent_1px)] bg-[size:80px_80px] pointer-events-none"></div>
                               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)] pointer-events-none"></div>
                               
                               {/* Simulated Map Geography (Abstract shapes for landmass) */}
                               <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" preserveAspectRatio="none">
                                    <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="#121212"/>
                                    <path d="M200,800 Q400,600 600,800 T1000,800" stroke="white" strokeWidth="2" fill="none"/>
                                    <path d="M100,200 Q300,400 500,200" stroke="white" strokeWidth="2" fill="none"/>
                               </svg>

                               {/* Map Pins */}
                               <div className="absolute inset-10 md:inset-20">
                                   {renderMapPins()}
                               </div>

                               {/* HUD Overlay */}
                               <div className="absolute top-4 right-4 p-4 bg-black/60 backdrop-blur border border-white/10 rounded">
                                   <div className="text-xs font-bold text-white uppercase tracking-wider mb-2">Sector Status</div>
                                   <div className="space-y-1">
                                       <div className="flex items-center gap-2 text-[10px] text-emerald-400"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Active ({filteredProjects.filter(p=>p.status==='ACTIVE').length})</div>
                                       <div className="flex items-center gap-2 text-[10px] text-amber-400"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Hold ({filteredProjects.filter(p=>p.status==='HOLD').length})</div>
                                       <div className="flex items-center gap-2 text-[10px] text-blue-400"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Complete ({filteredProjects.filter(p=>p.status==='COMPLETED').length})</div>
                                   </div>
                               </div>
                          </div>
                      )}

                      {viewMode === 'grid' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                              {filteredProjects.map(project => (
                                  <div key={project.id} className="bg-[#18181b] border border-[var(--border-main)] rounded-sm group hover:border-indigo-500/50 transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer relative overflow-hidden flex flex-col h-[340px]">
                                      {/* Top Status Bar */}
                                      <div className={`h-1 w-full ${getProgressColor(project.status)}`}></div>
                                      
                                      <div className="p-5 flex-1 flex flex-col">
                                          <div className="flex justify-between items-start mb-4">
                                              <div>
                                                  <div className="font-mono text-xs text-indigo-400 font-bold mb-1">JOB #{project.id}</div>
                                                  <h3 className="text-lg font-bold text-white leading-tight group-hover:text-indigo-300 transition-colors line-clamp-1" title={project.name}>{project.name}</h3>
                                              </div>
                                              <div className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${getStatusColor(project.status)}`}>
                                                  {project.status}
                                              </div>
                                          </div>

                                          <div className="space-y-3 mb-4">
                                              <div className="flex items-start gap-3 text-xs text-neutral-400">
                                                  <User size={14} className="mt-0.5 shrink-0 opacity-70" />
                                                  <span className="line-clamp-1">{project.client}</span>
                                              </div>
                                              <div className="flex items-start gap-3 text-xs text-neutral-400">
                                                  <MapPin size={14} className="mt-0.5 shrink-0 opacity-70" />
                                                  <span className="line-clamp-1">{project.location}</span>
                                              </div>
                                              <div className="flex items-start gap-3 text-xs text-neutral-400">
                                                  <Clock size={14} className="mt-0.5 shrink-0 opacity-70" />
                                                  <span>Due: {project.dueDate}</span>
                                              </div>
                                          </div>

                                          {/* Tags */}
                                          {project.tags && project.tags.length > 0 && (
                                              <div className="flex flex-wrap gap-1.5 mb-3">
                                                  {project.tags.slice(0, 3).map((tag, idx) => (
                                                      <span key={idx} className="px-1.5 py-0.5 rounded bg-neutral-800 border border-white/5 text-[9px] text-neutral-400">
                                                          {tag}
                                                      </span>
                                                  ))}
                                                  {project.tags.length > 3 && (
                                                      <span className="px-1.5 py-0.5 text-[9px] text-neutral-500">+{project.tags.length - 3}</span>
                                                  )}
                                              </div>
                                          )}

                                          {/* Description Snippet */}
                                          <div className="mt-auto mb-4 bg-black/20 p-2 rounded border border-white/5">
                                              <p className="text-[10px] text-neutral-500 leading-relaxed line-clamp-2 italic">
                                                 "{project.description || 'No description available.'}"
                                              </p>
                                          </div>

                                          {/* Progress */}
                                          <div>
                                              <div className="flex justify-between text-[10px] font-mono text-neutral-500 uppercase mb-1">
                                                  <span>Phase: {project.phase}</span>
                                                  <span>{project.progress}%</span>
                                              </div>
                                              <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                                                  <div className={`h-full ${getProgressColor(project.status)} transition-all duration-500`} style={{ width: `${project.progress}%` }}></div>
                                              </div>
                                          </div>
                                      </div>
                                          
                                      {/* Footer */}
                                      <div className="p-4 pt-3 border-t border-white/5 flex justify-between items-center bg-black/10">
                                          <div className="flex -space-x-2">
                                              <div className="w-6 h-6 rounded-full bg-neutral-700 border border-[#18181b] flex items-center justify-center text-[10px] font-bold text-white" title={project.manager.name}>
                                                  {project.manager.name.charAt(0)}
                                              </div>
                                              {project.team.map((member, i) => (
                                                  <div key={i} className="w-6 h-6 rounded-full bg-neutral-800 border border-[#18181b] flex items-center justify-center text-[10px] text-neutral-400">
                                                      {member.name.charAt(0)}
                                                  </div>
                                              ))}
                                          </div>
                                          <div className="flex gap-2">
                                              <button 
                                                onClick={(e) => handleTransmittalStart(project, e)}
                                                className="p-1.5 text-neutral-500 hover:text-emerald-400 hover:bg-white/5 rounded transition-colors"
                                                title="Generate Transmittal"
                                              >
                                                  <FileText size={14} />
                                              </button>
                                              <button 
                                                onClick={(e) => handleEditStart(project, e)}
                                                className="p-1.5 text-neutral-500 hover:text-indigo-400 hover:bg-white/5 rounded transition-colors"
                                              >
                                                  <Edit size={14} />
                                              </button>
                                              <button 
                                                onClick={(e) => handleDelete(project.id, e)}
                                                className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-white/5 rounded transition-colors"
                                              >
                                                  <Trash2 size={14} />
                                              </button>
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )} 
                      
                      {viewMode === 'list' && (
                          <div className="bg-[#18181b] border border-[var(--border-main)] rounded-sm overflow-hidden">
                              <table className="w-full text-left border-collapse">
                                  <thead className="bg-black/20 text-xs uppercase text-neutral-500 font-mono border-b border-white/5">
                                      <tr>
                                          <th className="p-4 font-medium">Job #</th>
                                          <th className="p-4 font-medium">Project Name</th>
                                          <th className="p-4 font-medium">Description</th>
                                          <th className="p-4 font-medium">Client</th>
                                          <th className="p-4 font-medium">Location</th>
                                          <th className="p-4 font-medium">Status</th>
                                          <th className="p-4 font-medium text-right">Progress</th>
                                          <th className="p-4 font-medium text-right">Actions</th>
                                      </tr>
                                  </thead>
                                  <tbody className="text-sm text-neutral-300 divide-y divide-white/5">
                                      {filteredProjects.map(project => (
                                          <tr key={project.id} className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => handleEditStart(project)}>
                                              <td className="p-4 font-mono text-indigo-400 font-bold">{project.id}</td>
                                              <td className="p-4 font-bold">{project.name}</td>
                                              <td className="p-4 text-xs text-neutral-500 max-w-xs truncate">{project.description}</td>
                                              <td className="p-4 text-neutral-400">{project.client}</td>
                                              <td className="p-4 text-neutral-400">{project.location}</td>
                                              <td className="p-4">
                                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(project.status)}`}>
                                                      {project.status}
                                                  </span>
                                              </td>
                                              <td className="p-4 text-right font-mono">{project.progress}%</td>
                                              <td className="p-4 text-right">
                                                  <div className="flex items-center justify-end gap-2">
                                                      <button 
                                                        onClick={(e) => handleTransmittalStart(project, e)}
                                                        className="text-neutral-500 hover:text-emerald-400 transition-colors"
                                                        title="Generate Document"
                                                      >
                                                          <FileText size={14} />
                                                      </button>
                                                      <button 
                                                        onClick={(e) => handleEditStart(project, e)}
                                                        className="text-neutral-500 hover:text-indigo-400 transition-colors"
                                                      >
                                                          <Edit size={14} />
                                                      </button>
                                                      <button 
                                                        onClick={(e) => handleDelete(project.id, e)}
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

       {/* Project Modal */}
       {showModal && (
           <ProjectFormModal 
                mode={editingProject ? 'EDIT' : 'CREATE'}
                initialData={editingProject || undefined}
                onClose={() => setShowModal(false)}
                onSave={handleSave}
           />
       )}

       {/* Transmittal Generator Modal */}
       {transmittalProject && (
           <TransmittalModal
              project={transmittalProject}
              onClose={() => setTransmittalProject(null)}
           />
       )}
    </div>
  );
};
