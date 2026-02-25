
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TradingCard } from './components/TradingCard';
import { GlobalNav } from './components/GlobalNav';
import { UserPanel } from './components/UserPanel';
import { HomeModule } from './components/HomeModule';
import { ProjectsModule } from './components/ProjectsModule';
import { PersonnelModule } from './components/PersonnelModule';
import { SiteReconModule } from './components/SiteReconModule';
import { AdminModule } from './components/AdminModule';
import { SafetyModule } from './components/SafetyModule';
import { StandardFormModal } from './components/StandardFormModal';
import { ImportModal } from './components/ImportModal';
import { CommandPalette } from './components/CommandPalette';
import { LibraryChat } from './components/LibraryChat';
import { THEMES, SIDEBAR_BUTTONS, SUB_CATEGORIES } from './constants';
import { DataService } from './services/dataService';
import { ElementType, SidebarFilter, UserProfile, UserPreferences, StandardCard, SearchResultType } from './types';
import { X, Search, ChevronDown, Filter, LayoutGrid, List, User as UserIcon, Loader2, Terminal, Star, ArrowUp, ArrowDown, Plus, Upload } from 'lucide-react';

const App: React.FC = () => {
  // --- Theme Management ---
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // --- User State ---
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: 'SUR-007',
    name: 'Rtoony',
    title: 'Senior Lead Surveyor',
    department: 'Surveying & Geomatics',
    email: 'R.Toony@acmecivilsurvey.com',
    phone: 'Ext. 1776',
    startDate: 'Jan 12, 1988',
    status: 'Active, Grumbling',
    level: 10, // The Legend
    // Middle-aged, bearded white man, disgruntled
    avatarUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Easton&skinColor=f2d3b1&hair=short12&hairColor=856f5d&beard=variant12&beardProbability=100&glasses=variant02&eyebrows=variant12&mouth=variant10&backgroundColor=b6e3f4',
    bio: "Sir R. Toony is the bedrock of our Geomatics department—a man carved from granite and fueled by questionable coffee. He has been mapping this landscape since before half the current staff were born.",
    quote: "If you need a field problem solved, bring me a fresh mug.",
    expertise: [
        "Boundary Surveys (The Master)",
        "ALTA/NSPS Precision",
        "Historical Research",
        "Intimidation"
    ],
    recentHistory: ['SUR-BM-102', 'TREE SAVE.dwg', '00 FH.DWG'],
    preferences: {
        showGrid: true,
        highContrast: false,
        defaultExport: 'DWG',
        notifications: false // "Don't bother me"
    }
  });
  const [showUserPanel, setShowUserPanel] = useState(false);
  const [activeModule, setActiveModule] = useState('library');
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [imgError, setImgError] = useState(false);

  // --- App State ---
  const [activeCategory, setActiveCategory] = useState<ElementType>(ElementType.LAYERS); 
  // activeSubCategory can be null if a sidebar filter is exclusive
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>('ALL');
  const [sidebarFilter, setSidebarFilter] = useState<SidebarFilter>('ALL');
  const [zoomedCardId, setZoomedCardId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortMode, setSortMode] = useState<'NAME_ASC' | 'NAME_DESC' | 'USAGE_DESC' | 'USAGE_ASC' | 'DATE_ASC' | 'DATE_DESC' | 'ID_ASC' | 'ID_DESC'>('NAME_ASC');
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  
  // Data State
  const [allCards, setAllCards] = useState<StandardCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("INITIALIZING");

  // CRUD State
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingCard, setEditingCard] = useState<StandardCard | null>(null); // If null, it's a Create operation

  // Init Favorites from LocalStorage
  useEffect(() => {
    const storedFavs = localStorage.getItem('acme_user_favorites');
    if (storedFavs) {
        try {
            setFavoriteIds(JSON.parse(storedFavs));
        } catch (e) {
            console.error("Failed to parse favorites", e);
        }
    }
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            setShowCommandPalette(prev => !prev);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load Data when Category Changes
  useEffect(() => {
    if (activeModule === 'library') {
      loadData();
    }
  }, [activeCategory, activeModule]);

  const loadData = async () => {
    setIsLoading(true);
    setLoadingMessage("CONNECTING_TO_DB");
    
    // Reset Filters on Category Change
    setActiveSubCategory('ALL');
    setSidebarFilter('ALL');
    
    // Cycle through fake status messages for "vibe"
    const msgs = ["HANDSHAKE_INIT", "QUERYING_INDEX", "FETCHING_VECTORS", "RENDERING_ASSETS"];
    let msgIdx = 0;
    const msgInterval = setInterval(() => {
        setLoadingMessage(msgs[msgIdx % msgs.length]);
        msgIdx++;
    }, 150);

    setAllCards([]); // Clear current view
    try {
        const cards = await DataService.fetchCards(activeCategory);
        
        // Merge with favorites status
        const mergedCards = cards.map(card => ({
            ...card,
            isFavorite: favoriteIds.includes(card.id)
        }));
        setAllCards(mergedCards);
    } catch (error) {
        console.error("Failed to fetch library assets", error);
    } finally {
        clearInterval(msgInterval);
        setIsLoading(false);
    }
  };

  // Re-apply favorites if the list changes (without re-fetching data)
  useEffect(() => {
      if (allCards.length > 0) {
          setAllCards(prevCards => prevCards.map(card => ({
              ...card,
              isFavorite: favoriteIds.includes(card.id)
          })));
      }
  }, [favoriteIds.length]);

  // --- Handlers ---

  const handleDeepLink = (module: string, entityId?: string, entityType?: SearchResultType) => {
      setActiveModule(module);
      
      if (module === 'library' && entityId && entityType === 'STANDARD') {
          // Trigger a zoom if we can find the card. 
          setZoomedCardId(entityId);
      }
  };

  const toggleFavorite = (id: string) => {
    const isCurrentlyFav = favoriteIds.includes(id);
    let newFavs: string[];

    if (isCurrentlyFav) {
        newFavs = favoriteIds.filter(fid => fid !== id);
    } else {
        newFavs = [...favoriteIds, id];
    }

    setFavoriteIds(newFavs);
    localStorage.setItem('acme_user_favorites', JSON.stringify(newFavs));
  };

  const handleUpdatePreferences = (newPrefs: UserPreferences) => {
    setCurrentUser(prev => ({ ...prev, preferences: newPrefs }));
  };

  const handleZoomCard = (id: string) => {
    setZoomedCardId(id);
    // Add to recent history if not there
    if (!currentUser.recentHistory.includes(id)) {
        const newHistory = [id, ...currentUser.recentHistory].slice(0, 5);
        setCurrentUser(prev => ({ ...prev, recentHistory: newHistory }));
    }
  };

  // --- CRUD Handlers ---

  const handleCreateStart = () => {
      setEditingCard(null);
      setShowEditModal(true);
  };

  const handleEditStart = (card: StandardCard) => {
      setEditingCard(card);
      setShowEditModal(true);
  };

  const handleSave = async (data: Partial<StandardCard>) => {
      setShowEditModal(false);
      setIsLoading(true);
      setLoadingMessage(editingCard ? "UPDATING_RECORD" : "ALLOCATING_NEW_BLOCK");

      try {
          if (editingCard) {
              // Update
              const updated = await DataService.updateCard({ ...editingCard, ...data } as StandardCard);
              setAllCards(prev => prev.map(c => c.id === updated.id ? { ...updated, isFavorite: favoriteIds.includes(updated.id) } : c));
              // Update zoomed card if it was open
              if (zoomedCardId === updated.id) {
                  // Reactivity handles this naturally via find() below
              }
          } else {
              // Create
              const created = await DataService.addCard({ ...data, category: activeCategory });
              setAllCards(prev => [...prev, { ...created, isFavorite: false }]);
          }
      } catch (e) {
          console.error("Save failed", e);
          alert("System Error: Could not persist data.");
      } finally {
          setIsLoading(false);
      }
  };

  const handleImport = async (data: Partial<StandardCard>[]) => {
      setShowImportModal(false);
      setIsLoading(true);
      setLoadingMessage("BATCH_INSERTION_PROTOCOL");
      try {
          await DataService.bulkAddCards(data);
          // Refresh view
          loadData();
      } catch (e) {
          console.error("Import failed", e);
          alert("Import Failed.");
      } finally {
          setIsLoading(false);
      }
  };

  const handleDelete = async (id: string) => {
      setIsLoading(true);
      setLoadingMessage("PURGING_DATA");
      try {
          await DataService.deleteCard(id);
          setAllCards(prev => prev.filter(c => c.id !== id));
          if (zoomedCardId === id) setZoomedCardId(null);
      } catch (e) {
          console.error("Delete failed", e);
          alert("System Error: Could not delete record.");
      } finally {
          setIsLoading(false);
      }
  };

  // --- Exclusive Filter Logic ---
  
  // When clicking Sidebar (Left), clear Toolbar (Top)
  const handleSidebarFilter = (filter: SidebarFilter) => {
    setSidebarFilter(filter);
    if (filter !== 'ALL') {
        setActiveSubCategory(null); // De-selects "ALL" or specific subcat in toolbar
    } else {
        // If clicking 'ALL' in sidebar (not currently exposed via buttons but good safety)
        setActiveSubCategory('ALL');
    }
  };

  // When clicking Toolbar (Top), clear Sidebar (Left)
  const handleSubCategoryClick = (subCat: string) => {
      setActiveSubCategory(subCat);
      setSidebarFilter('ALL'); // Resets sidebar buttons
  };

  const toggleSort = (field: 'ID' | 'NAME' | 'USAGE') => {
    if (field === 'ID') {
        setSortMode(sortMode === 'ID_ASC' ? 'ID_DESC' : 'ID_ASC');
    } else if (field === 'NAME') {
        setSortMode(sortMode === 'NAME_ASC' ? 'NAME_DESC' : 'NAME_ASC');
    } else if (field === 'USAGE') {
        setSortMode(sortMode === 'USAGE_DESC' ? 'USAGE_ASC' : 'USAGE_DESC');
    }
  };

  const getSortIcon = (field: 'ID' | 'NAME' | 'USAGE') => {
      if (field === 'ID') {
          if (sortMode === 'ID_ASC') return <ArrowUp size={12} className="text-white"/>;
          if (sortMode === 'ID_DESC') return <ArrowDown size={12} className="text-white"/>;
      }
      if (field === 'NAME') {
          if (sortMode === 'NAME_ASC') return <ArrowUp size={12} className="text-white"/>;
          if (sortMode === 'NAME_DESC') return <ArrowDown size={12} className="text-white"/>;
      }
      if (field === 'USAGE') {
          if (sortMode === 'USAGE_ASC') return <ArrowUp size={12} className="text-white"/>;
          if (sortMode === 'USAGE_DESC') return <ArrowDown size={12} className="text-white"/>;
      }
      return <div className="w-3 h-3"></div>; // Spacer
  };


  // --- Filter Application ---
  const activeTheme = THEMES[activeCategory];
  const currentSubCategories = SUB_CATEGORIES[activeCategory] || [];
  
  const filteredCards = allCards
    .filter(card => {
      const matchesSearch = card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            card.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // If activeSubCategory is null, it means we are ignoring subcats (likely using sidebar filter)
      // If it is 'ALL', we match everything
      // Otherwise strict match
      const matchesSubCat = !activeSubCategory || activeSubCategory === 'ALL' || card.subCategory === activeSubCategory;
      
      let matchesSidebar = true;
      switch (sidebarFilter) {
        case 'NEW': matchesSidebar = card.isNew; break;
        case 'FAVORITES': matchesSidebar = card.isFavorite; break;
        case 'FREQUENT': matchesSidebar = true; break; // Placeholder logic
        default: matchesSidebar = true; break;
      }

      return matchesSearch && matchesSubCat && matchesSidebar;
    })
    .sort((a, b) => {
      if (sidebarFilter === 'FREQUENT') return b.stats.usage - a.stats.usage;
      switch (sortMode) {
        case 'NAME_ASC': return a.title.localeCompare(b.title);
        case 'NAME_DESC': return b.title.localeCompare(a.title);
        case 'ID_ASC': return a.id.localeCompare(b.id, undefined, {numeric: true});
        case 'ID_DESC': return b.id.localeCompare(a.id, undefined, {numeric: true});
        case 'USAGE_DESC': return b.stats.usage - a.stats.usage;
        case 'USAGE_ASC': return a.stats.usage - b.stats.usage;
        case 'DATE_ASC': return (a.lastModified || 0) - (b.lastModified || 0);
        case 'DATE_DESC': return (b.lastModified || 0) - (a.lastModified || 0);
        default: return 0;
      }
    });

  // Zoom Logic
  const zoomedCard = allCards.find(c => c.id === zoomedCardId);

  useEffect(() => {
    setSearchTerm("");
  }, [activeCategory]);

  return (
    <div className="flex h-screen w-screen bg-[var(--bg-main)] overflow-hidden font-sans relative selection:bg-blue-500/30 text-sm transition-colors duration-300">
      
      {/* 1. Global Navigation (Leftmost Strip) */}
      <GlobalNav activeModule={activeModule} onNavigate={setActiveModule} />

      {/* 2. User Badge (Centered Top) */}
      <div className="fixed top-4 left-[calc(50%+2rem)] -translate-x-1/2 z-[50]">
        <div className="relative group">
            <button 
                onClick={() => setShowUserPanel(!showUserPanel)}
                className={`
                    flex items-center gap-4 pl-3 pr-6 py-2.5 rounded-full border transition-all duration-300 cursor-pointer shadow-2xl
                    ${showUserPanel 
                        ? 'bg-[#18181b] border-indigo-500 ring-2 ring-indigo-500/20 translate-y-1' 
                        : 'bg-[#09090b] border-white/10 hover:border-indigo-500/50 hover:bg-[#18181b]'}
                `}
            >
                <div className="w-12 h-12 rounded-full bg-white border-2 border-indigo-500 shadow-lg overflow-hidden shrink-0 relative z-10 flex items-center justify-center">
                    {!imgError ? (
                        <img 
                            src={currentUser.avatarUrl} 
                            className="w-full h-full object-cover" 
                            alt="User"
                            onError={() => setImgError(true)}
                            crossOrigin="anonymous"
                        />
                    ) : (
                        <UserIcon size={24} className="text-indigo-500/50"/>
                    )}
                </div>
                
                <div className="text-left flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white tracking-tight leading-none">{currentUser.name}</span>
                        <div className="px-1.5 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30 text-[9px] font-mono font-bold text-indigo-300 uppercase tracking-wider">
                            {currentUser.id}
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-wide">{currentUser.status}</span>
                    </div>
                </div>

                <div className="absolute inset-x-6 -bottom-px h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
            
            {showUserPanel && (
                <>
                <div className="fixed inset-0 z-[-1] cursor-default bg-black/20 backdrop-blur-[1px]" onClick={() => setShowUserPanel(false)}></div>
                <UserPanel 
                    user={currentUser} 
                    onClose={() => setShowUserPanel(false)} 
                    onUpdatePreferences={handleUpdatePreferences}
                />
                </>
            )}
        </div>
      </div>

      {/* 3. Content Area */}
      {activeModule === 'home' ? (
         <HomeModule user={currentUser} onNavigate={setActiveModule} />
      ) : activeModule === 'projects' ? (
         <ProjectsModule />
      ) : activeModule === 'personnel' ? (
         <PersonnelModule />
      ) : activeModule === 'siterecon' ? (
         <SiteReconModule />
      ) : activeModule === 'safety' ? (
         <SafetyModule />
      ) : activeModule === 'admin' ? (
         <AdminModule />
      ) : activeModule === 'library' ? (
        <>
            <Sidebar 
                buttons={SIDEBAR_BUTTONS} 
                theme={activeTheme} 
                activeFilter={sidebarFilter}
                onFilterChange={handleSidebarFilter}
                filteredCount={filteredCards.length}
                totalCount={allCards.length}
            />

            <main className="flex-1 flex flex-col relative bg-[var(--bg-subtle)]">
                {currentUser.preferences.showGrid && (
                    <div className="absolute inset-0 z-0 bg-grid opacity-20 pointer-events-none"></div>
                )}

                {/* Header */}
                <div className="pt-6 px-8 z-40 relative border-b border-[var(--border-subtle)] bg-[var(--bg-main)]/90 backdrop-blur-md">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-[var(--text-main)] tracking-tight flex items-center gap-3">
                        <span className="w-2 h-8 bg-[var(--text-main)]/20 rounded-sm"></span>
                        LIBRARY BROWSER
                        <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--bg-card)] px-2 py-1 rounded ml-2 border border-[var(--border-subtle)]">v2.4.0</span>
                        </h1>
                        
                        <div className="flex gap-4 items-center">
                            <button 
                                onClick={() => setShowImportModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#18181b] border border-white/10 hover:border-white/20 text-white rounded shadow-sm transition-all font-bold uppercase text-xs tracking-wider"
                            >
                                <Upload size={16} /> Import
                            </button>

                            <button 
                                onClick={handleCreateStart}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded shadow-lg hover:shadow-indigo-500/20 transition-all font-bold uppercase text-xs tracking-wider"
                            >
                                <Plus size={16} /> Add New
                            </button>

                            <div className="flex gap-2 bg-[var(--bg-card)] p-1 rounded-lg border border-[var(--border-subtle)]">
                                <button 
                                    onClick={() => setViewMode('grid')}
                                    className={`h-8 w-8 rounded flex items-center justify-center transition-colors ${viewMode === 'grid' ? 'bg-[var(--bg-main)] text-[var(--text-main)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                                >
                                    <LayoutGrid size={16} />
                                </button>
                                <button 
                                    onClick={() => setViewMode('list')}
                                    className={`h-8 w-8 rounded flex items-center justify-center transition-colors ${viewMode === 'list' ? 'bg-[var(--bg-main)] text-[var(--text-main)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                                >
                                    <List size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0">
                        {Object.values(THEMES).map((theme) => {
                        const isActive = activeCategory === theme.id;
                        return (
                            <button
                            key={theme.id}
                            onClick={() => setActiveCategory(theme.id)}
                            className={`
                                relative px-6 py-3 min-w-[120px] font-bold text-sm tracking-wide uppercase transition-all duration-200
                                ${isActive 
                                ? `text-[var(--text-main)] bg-[var(--text-main)]/5` 
                                : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-main)] hover:bg-[var(--text-main)]/5'}
                            `}
                            >
                            {theme.label}
                            {isActive && (
                                <div className={`absolute bottom-0 left-0 w-full h-1.5 ${theme.baseColor} shadow-[0_-2px_12px_rgba(0,0,0,0.3)]`}></div>
                            )}
                            </button>
                        );
                        })}
                    </div>
                </div>

                {/* Toolbar */}
                <div className="z-20 bg-[#18181b] border-b border-white/5 px-8 py-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4 shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
                            <input 
                                type="text" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={`Search ${activeTheme.label.toLowerCase()}...`}
                                className="w-full pl-10 pr-4 py-2 bg-[var(--bg-main)] border border-white/10 rounded text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30 focus:bg-black/80 transition-all font-mono text-sm"
                            />
                        </div>
                        <div className="h-8 w-[1px] bg-white/10 hidden xl:block"></div>
                    </div>

                    <div className="flex-1 flex justify-center overflow-x-auto px-4">
                         <div className="flex items-center gap-2">
                            <Filter size={14} className="text-neutral-600" />
                            <button
                                onClick={() => handleSubCategoryClick('ALL')}
                                className={`
                                    px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all whitespace-nowrap
                                    ${activeSubCategory === 'ALL' 
                                    ? `${activeTheme.baseColor} text-white border-transparent shadow-md` 
                                    : 'bg-transparent text-neutral-500 border-neutral-700 hover:border-neutral-500 hover:text-neutral-300'}
                                `}
                            >
                                ALL
                            </button>
                            <button
                                onClick={() => handleSubCategoryClick('FAVORITES')}
                                className={`
                                    px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all whitespace-nowrap flex items-center gap-1
                                    ${activeSubCategory === 'FAVORITES' 
                                    ? `bg-amber-500 text-black border-transparent shadow-md` 
                                    : 'bg-transparent text-neutral-500 border-neutral-700 hover:border-amber-500 hover:text-amber-500'}
                                `}
                            >
                                <Star size={10} className={activeSubCategory === 'FAVORITES' ? 'fill-black' : ''} />
                                FAVORITES
                            </button>
                            {currentSubCategories.filter(c => c !== 'ALL').map((subCat) => {
                                const isActive = activeSubCategory === subCat;
                                return (
                                    <button
                                    key={subCat}
                                    onClick={() => handleSubCategoryClick(subCat)}
                                    className={`
                                        px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all whitespace-nowrap
                                        ${isActive 
                                        ? `${activeTheme.baseColor} text-white border-transparent shadow-md` 
                                        : 'bg-transparent text-neutral-500 border-neutral-700 hover:border-neutral-500 hover:text-neutral-300'}
                                    `}
                                    >
                                    {subCat}
                                    </button>
                                );
                            })}
                         </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-500 font-bold uppercase">Sort</span>
                        <div className="relative">
                            <select
                                value={sortMode}
                                onChange={(e) => setSortMode(e.target.value as any)}
                                disabled={sidebarFilter === 'FREQUENT'} 
                                className={`appearance-none pl-3 pr-8 py-1.5 bg-neutral-800 border border-white/10 rounded text-xs font-mono text-neutral-300 focus:outline-none cursor-pointer hover:border-white/30 transition-colors
                                ${sidebarFilter === 'FREQUENT' ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                            >
                                <option value="NAME_ASC">Name (A-Z)</option>
                                <option value="NAME_DESC">Name (Z-A)</option>
                                <option value="ID_ASC">ID (Ascending)</option>
                                <option value="ID_DESC">ID (Descending)</option>
                                <option value="USAGE_DESC">Usage (High)</option>
                                <option value="USAGE_ASC">Usage (Low)</option>
                                <option value="DATE_DESC">Newest First</option>
                                <option value="DATE_ASC">Oldest First</option>
                            </select>
                            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"/>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 relative custom-scrollbar">
                    {isLoading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-500 z-20 bg-[var(--bg-main)]/80 backdrop-blur-sm">
                           <div className="relative">
                                <div className={`w-16 h-16 border-4 border-t-${activeTheme.baseColor.split('-')[1]}-500 border-r-transparent border-b-neutral-800 border-l-neutral-800 rounded-full animate-spin`}></div>
                                <Terminal size={24} className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${activeTheme.textColor.replace('text-', 'text-')}`} />
                           </div>
                           <div className="mt-4 flex flex-col items-center">
                               <p className="font-mono text-lg font-bold text-[var(--text-main)] tracking-widest uppercase animate-pulse">
                                   {loadingMessage}
                               </p>
                               <p className="text-[10px] font-mono text-[var(--text-muted)] mt-1">
                                   ESTABLISHING SECURE LINK :: {activeTheme.label}_DB
                               </p>
                           </div>
                        </div>
                    ) : (
                        <>
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 pb-20">
                                {filteredCards.length > 0 ? (
                                filteredCards.map((card) => (
                                    <TradingCard 
                                    key={card.id} 
                                    card={card} 
                                    theme={activeTheme} 
                                    variant="gallery"
                                    onZoom={() => handleZoomCard(card.id)}
                                    onToggleFavorite={toggleFavorite}
                                    />
                                ))
                                ) : (
                                <div className="col-span-full flex flex-col items-center justify-center h-96 text-neutral-600">
                                    <div className="p-6 rounded-full bg-white/5 mb-4">
                                        <Search size={48} strokeWidth={1.5} />
                                    </div>
                                    <p className="text-lg font-medium text-[var(--text-muted)]">No standards found</p>
                                    <p className="text-sm font-mono">Adjust your filters to broaden search</p>
                                </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-[#18181b] border border-[var(--border-main)] rounded-sm overflow-hidden pb-20">
                                <div className="flex items-center gap-4 px-3 py-2 bg-black/20 border-b border-white/5 text-[10px] font-bold uppercase text-neutral-500 font-mono select-none">
                                     <div className="w-10 text-center">Icon</div>
                                     <button onClick={() => toggleSort('ID')} className="w-24 text-left hover:text-white flex items-center gap-1 transition-colors">ID {getSortIcon('ID')}</button>
                                     <button onClick={() => toggleSort('NAME')} className="flex-1 text-left hover:text-white flex items-center gap-1 transition-colors">Title / Description {getSortIcon('NAME')}</button>
                                     <div className="w-32 hidden md:block">Sub-Category</div>
                                     <button onClick={() => toggleSort('USAGE')} className="w-40 hidden lg:block text-right pr-4 hover:text-white flex items-center justify-end gap-1 transition-colors">{getSortIcon('USAGE')} Usage</button>
                                     <div className="w-16 pl-2">Actions</div>
                                </div>
                                {filteredCards.length > 0 ? (
                                    filteredCards.map((card) => (
                                        <TradingCard 
                                            key={card.id} 
                                            card={card} 
                                            theme={activeTheme} 
                                            variant="list"
                                            onZoom={() => handleZoomCard(card.id)}
                                            onToggleFavorite={toggleFavorite}
                                            onEdit={handleEditStart}
                                            onDelete={handleDelete}
                                        />
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-neutral-500">No results found.</div>
                                )}
                            </div>
                        )}
                        </>
                    )}
                </div>
                <LibraryChat />
            </main>
        </>
      ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#121212] text-neutral-500">
             <div className="p-8 border border-dashed border-neutral-800 rounded-2xl text-center max-w-md">
                <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600">
                   <UserIcon size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-wider">Module 404</h2>
                <p className="text-neutral-400 mb-6">Section not found or access restricted.</p>
                <button onClick={() => setActiveModule('home')} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold uppercase tracking-wide transition-colors">Return to Base</button>
             </div>
          </div>
      )}

      {zoomedCard && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 p-4"
          onClick={() => setZoomedCardId(null)}
        >
           <button onClick={() => setZoomedCardId(null)} className="absolute top-6 right-6 text-neutral-400 hover:text-white transition-colors"><X size={32} strokeWidth={1.5} /></button>
           <div className="cursor-default" onClick={(e) => e.stopPropagation()}>
             <TradingCard 
                card={zoomedCard} 
                theme={activeTheme} 
                variant="zoomed" 
                onClose={() => setZoomedCardId(null)}
                onToggleFavorite={toggleFavorite}
                onEdit={handleEditStart}
                onDelete={handleDelete}
             />
           </div>
        </div>
      )}

      {showEditModal && (
          <StandardFormModal
             mode={editingCard ? 'EDIT' : 'CREATE'}
             initialData={editingCard || undefined}
             category={activeCategory}
             onClose={() => setShowEditModal(false)}
             onSave={handleSave}
          />
      )}

      {showImportModal && (
          <ImportModal onClose={() => setShowImportModal(false)} onImport={handleImport} />
      )}

      <CommandPalette 
          isOpen={showCommandPalette}
          onClose={() => setShowCommandPalette(false)}
          onNavigate={handleDeepLink}
      />
    </div>
  );
};

export default App;
