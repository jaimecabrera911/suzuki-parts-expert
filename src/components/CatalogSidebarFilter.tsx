import React, { useState } from 'react';
import {
  Filter,
  Search,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Tag,
  DollarSign,
  Box,
  Layers,
  Bike,
  X,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import { ActiveMotorcycle, SuzukiPart } from '../types';
import { SUZUKI_MODELS } from '../data/suzukiData';
import { formatCurrency } from '../utils/formatCurrency';

interface CatalogSidebarFilterProps {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onlyCompatible: boolean;
  setOnlyCompatible: (val: boolean) => void;
  inStockOnly: boolean;
  setInStockOnly: (val: boolean) => void;
  selectedModelFilter: string;
  setSelectedModelFilter: (modelId: string) => void;
  maxPriceFilter: number;
  setMaxPriceFilter: (price: number) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeMotorcycle: ActiveMotorcycle | null;
  onOpenGarageModal: () => void;
  allParts: SuzukiPart[];
  filteredCount: number;
  onResetFilters: () => void;
}

export const CatalogSidebarFilter: React.FC<CatalogSidebarFilterProps> = ({
  selectedCategory,
  setSelectedCategory,
  onlyCompatible,
  setOnlyCompatible,
  inStockOnly,
  setInStockOnly,
  selectedModelFilter,
  setSelectedModelFilter,
  maxPriceFilter,
  setMaxPriceFilter,
  sortBy,
  setSortBy,
  searchQuery,
  setSearchQuery,
  activeMotorcycle,
  onOpenGarageModal,
  allParts,
  filteredCount,
  onResetFilters
}) => {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    vehicle: true,
    category: true,
    price: true,
    models: true,
    stock: true
  });

  // Handle Escape key and body scroll lock for mobile drawer
  React.useEffect(() => {
    if (!mobileFiltersOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileFiltersOpen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileFiltersOpen]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Find max possible price in database
  const maxDatabasePrice = Math.max(...allParts.map(p => p.price), 1000000);

  // Category counts
  const categories = [
    { id: 'all', label: 'Todos los Repuestos', icon: Layers },
    { id: 'filtros', label: 'Filtros & Mantenimiento', icon: Tag },
    { id: 'motor', label: 'Motor & Inyección', icon: Box },
    { id: 'frenos', label: 'Frenos & ABS', icon: ShieldCheck },
    { id: 'transmision', label: 'Transmisión & Arrastre', icon: SlidersHorizontal },
    { id: 'electrico', label: 'Sistema Eléctrico', icon: Sparkles }
  ];

  const getCategoryCount = (catId: string) => {
    if (catId === 'all') return allParts.length;
    return allParts.filter(p => p.category === catId).length;
  };

  const getModelCount = (modelId: string) => {
    if (modelId === 'all') return allParts.length;
    return allParts.filter(p => p.compatibility.some(c => c.modelId === modelId)).length;
  };

  const activeFilterCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (onlyCompatible && activeMotorcycle ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (selectedModelFilter !== 'all' ? 1 : 0) +
    (maxPriceFilter < maxDatabasePrice ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const FilterContent = () => (
    <div className="space-y-6">
      
      {/* 1. Vehicle Context & Compatibility Filter */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 opacity-10 text-slate-400 pointer-events-none" aria-hidden="true">
          <Bike className="w-32 h-32" />
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" aria-hidden="true"></span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300">Garaje Activo</span>
          </div>
          <button
            type="button"
            onClick={onOpenGarageModal}
            className="text-[11px] font-bold text-[#E60012] hover:text-red-400 hover:underline transition-colors flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
          >
            {activeMotorcycle ? 'Cambiar' : 'Seleccionar'}
          </button>
        </div>

        {activeMotorcycle ? (
          <div>
            <div className="font-bold text-sm text-white flex items-center gap-2">
              <Bike className="w-4 h-4 text-[#E60012]" aria-hidden="true" />
              <span>{activeMotorcycle.modelName}</span>
              <span className="text-xs font-mono px-2 py-0.5 bg-slate-800 rounded text-slate-300">
                {activeMotorcycle.year}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1 line-clamp-1">{activeMotorcycle.version}</p>

            {/* Toggle Switch for Strictly Compatible Parts */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className={`w-4 h-4 ${onlyCompatible ? 'text-emerald-400' : 'text-slate-400'}`} aria-hidden="true" />
                <span className="text-xs font-semibold text-slate-200">Solo 100% Compatibles</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={onlyCompatible}
                aria-label="Filtrar solo repuestos 100% compatibles"
                onClick={() => setOnlyCompatible(!onlyCompatible)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                  onlyCompatible ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    onlyCompatible ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-xs text-slate-300 mb-2">No has seleccionado tu motocicleta en el Garaje.</p>
            <button
              type="button"
              onClick={onOpenGarageModal}
              className="w-full py-2 px-3 min-h-[44px] bg-[#E60012] hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              + Añadir Moto para Filtro Exacto
            </button>
          </div>
        )}
      </div>

      {/* 2. Search Input */}
      <div>
        <label htmlFor="sidebar-search-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" /> Búsqueda Rápida
        </label>
        <div className="relative">
          <input
            id="sidebar-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ej: Filtro, Bujía, Ref..."
            className="w-full pl-3.5 pr-8 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#E60012]/20 focus:border-[#E60012] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Limpiar búsqueda"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 p-1"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Category Filter List */}
      <div className="border-t border-slate-200 pt-4">
        <button
          type="button"
          aria-expanded={expandedSections.category}
          aria-controls="filter-section-category"
          onClick={() => toggleSection('category')}
          className="w-full flex items-center justify-between py-1 text-xs font-extrabold uppercase tracking-wider text-slate-800 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E60012] rounded"
        >
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#E60012]" aria-hidden="true" /> Categorías
          </span>
          {expandedSections.category ? <ChevronUp className="w-4 h-4 text-slate-500" aria-hidden="true" /> : <ChevronDown className="w-4 h-4 text-slate-500" aria-hidden="true" />}
        </button>

        {expandedSections.category && (
          <div id="filter-section-category" className="mt-3 space-y-1">
            {categories.map((cat) => {
              const count = getCategoryCount(cat.id);
              const isSelected = selectedCategory === cat.id;
              const IconComp = cat.icon;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 min-h-[40px] rounded-xl text-xs font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E60012] ${
                    isSelected
                      ? 'bg-[#E60012] text-white font-bold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <IconComp className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-500'}`} aria-hidden="true" />
                    <span className="truncate">{cat.label}</span>
                  </span>
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Filter by Suzuki Model (Dynamic Model Sub-filter) */}
      <div className="border-t border-slate-200 pt-4">
        <button
          type="button"
          aria-expanded={expandedSections.models}
          aria-controls="filter-section-models"
          onClick={() => toggleSection('models')}
          className="w-full flex items-center justify-between py-1 text-xs font-extrabold uppercase tracking-wider text-slate-800 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E60012] rounded"
        >
          <span className="flex items-center gap-1.5">
            <Bike className="w-3.5 h-3.5 text-[#0A3088]" aria-hidden="true" /> Modelo Específico
          </span>
          {expandedSections.models ? <ChevronUp className="w-4 h-4 text-slate-500" aria-hidden="true" /> : <ChevronDown className="w-4 h-4 text-slate-500" aria-hidden="true" />}
        </button>

        {expandedSections.models && (
          <div id="filter-section-models" className="mt-3 space-y-1">
            <button
              type="button"
              onClick={() => setSelectedModelFilter('all')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E60012] ${
                selectedModelFilter === 'all'
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>Todos los Modelos Suzuki</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                  selectedModelFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {allParts.length}
              </span>
            </button>

            {SUZUKI_MODELS.map((m) => {
              const count = getModelCount(m.id);
              const isSelected = selectedModelFilter === m.id;

              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedModelFilter(m.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E60012] ${
                    isSelected
                      ? 'bg-[#0A3088] text-white font-bold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate">{m.name}</span>
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-mono ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Price Range Slider */}
      <div className="border-t border-slate-200 pt-4">
        <button
          type="button"
          aria-expanded={expandedSections.price}
          aria-controls="filter-section-price"
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between py-1 text-xs font-extrabold uppercase tracking-wider text-slate-800 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E60012] rounded"
        >
          <span className="flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" /> Precio Máximo
          </span>
          {expandedSections.price ? <ChevronUp className="w-4 h-4 text-slate-500" aria-hidden="true" /> : <ChevronDown className="w-4 h-4 text-slate-500" aria-hidden="true" />}
        </button>

        {expandedSections.price && (
          <div id="filter-section-price" className="mt-3 space-y-3 px-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="text-slate-500">$0 COP</span>
              <span className="text-[#E60012] font-mono text-xs">{formatCurrency(maxPriceFilter)}</span>
            </div>
            <label htmlFor="price-range-slider" className="sr-only">Seleccionar precio máximo</label>
            <input
              id="price-range-slider"
              type="range"
              min={20000}
              max={maxDatabasePrice}
              step={10000}
              value={maxPriceFilter}
              onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#E60012]"
            />
            <div className="flex justify-between text-[10px] text-slate-600 font-mono">
              <span>Mín: $20.000 COP</span>
              <span>Máx: {formatCurrency(maxDatabasePrice)}</span>
            </div>
          </div>
        )}
      </div>

      {/* 6. Availability Stock Toggle */}
      <div className="border-t border-slate-200 pt-4">
        <div className="flex items-center justify-between py-1">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" /> Solo En Stock
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={inStockOnly}
            aria-label="Filtrar solo repuestos en stock"
            onClick={() => setInStockOnly(!inStockOnly)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              inStockOnly ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                inStockOnly ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Reset Filters Action */}
      {activeFilterCount > 0 && (
        <div className="border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={onResetFilters}
            className="w-full py-2.5 px-3 min-h-[44px] bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E60012]"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Restablecer ({activeFilterCount}) Filtros</span>
          </button>
        </div>
      )}

    </div>
  );

  return (
    <>
      {/* Mobile Top Header & Filter Trigger */}
      <div className="lg:hidden mb-6 space-y-3">
        <div className="flex items-center gap-3">
          {/* Search Box on Mobile */}
          <div className="relative flex-1">
            <label htmlFor="mobile-catalog-search" className="sr-only">Buscar por nombre o referencia</label>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" aria-hidden="true" />
            <input
              id="mobile-catalog-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre o ref..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#E60012]/20 focus:border-[#E60012]"
            />
          </div>

          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="px-4 py-2.5 min-h-[44px] bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-2 shrink-0 shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E60012]"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#E60012]" aria-hidden="true" />
            <span>Filtros</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#E60012] text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile active filter chips */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[10px] font-extrabold uppercase text-slate-600 shrink-0">Activos:</span>
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-200 text-red-800 font-bold text-[11px] rounded-lg shrink-0">
                Cat: {categories.find(c => c.id === selectedCategory)?.label}
                <button type="button" aria-label="Remover filtro de categoría" onClick={() => setSelectedCategory('all')} className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-red-100 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {onlyCompatible && activeMotorcycle && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-[11px] rounded-lg shrink-0">
                Compatible: {activeMotorcycle.modelName}
                <button type="button" aria-label="Remover filtro de compatibilidad" onClick={() => setOnlyCompatible(false)} className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-emerald-100 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedModelFilter !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-800 font-bold text-[11px] rounded-lg shrink-0">
                Modelo: {SUZUKI_MODELS.find(m => m.id === selectedModelFilter)?.name}
                <button type="button" aria-label="Remover filtro de modelo" onClick={() => setSelectedModelFilter('all')} className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-blue-100 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {inStockOnly && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-900 font-bold text-[11px] rounded-lg shrink-0">
                En Stock
                <button type="button" aria-label="Remover filtro de stock" onClick={() => setInStockOnly(false)} className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-amber-100 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={onResetFilters}
              className="text-[11px] font-bold text-[#E60012] underline shrink-0 ml-1 cursor-pointer"
            >
              Limpiar todo
            </button>
          </div>
        )}
      </div>

      {/* Desktop Sticky Sidebar Layout */}
      <aside className="hidden lg:block w-72 shrink-0">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs sticky top-24">
          
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#E60012]" aria-hidden="true" />
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                Filtros
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 font-mono">
                {filteredCount} {filteredCount === 1 ? 'part' : 'parts'}
              </span>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="text-[11px] font-bold text-[#E60012] hover:underline cursor-pointer"
                  title="Limpiar todos los filtros"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          <FilterContent />

        </div>
      </aside>

      {/* Mobile Drawer Slide-Over */}
      {mobileFiltersOpen && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-filter-title"
          className="fixed inset-0 z-50 lg:hidden flex"
        >
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 max-w-full flex z-10">
            <div className="w-screen max-w-xs bg-white shadow-2xl flex flex-col">
              
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#E60012]" aria-hidden="true" />
                  <h2 id="mobile-filter-title" className="text-sm font-bold uppercase tracking-wider">Filtros de Catálogo</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  aria-label="Cerrar filtros de catálogo"
                  className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-white rounded-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E60012]"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <div className="p-5 flex-1 overflow-y-auto">
                <FilterContent />
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full py-3 min-h-[44px] bg-[#E60012] text-white font-bold text-xs rounded-xl shadow-sm uppercase tracking-wider cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E60012]"
                >
                  Ver ({filteredCount}) Resultados
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};
