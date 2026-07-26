import React from 'react';
import { CheckCircle2, AlertTriangle, HelpCircle, Eye, ShoppingBag, ShieldCheck, Bike } from 'lucide-react';
import { SuzukiPart, ActiveMotorcycle } from '../types';
import { SUZUKI_MODELS } from '../data/suzukiData';
import { formatCurrency } from '../utils/formatCurrency';
import { getProductWhatsAppUrl } from '../utils/whatsapp';

interface ProductCardProps {
  part: SuzukiPart;
  activeMotorcycle: ActiveMotorcycle | null;
  onOpenDetail: (part: SuzukiPart) => void;
  onAddToCart: (part: SuzukiPart) => void;
  onOpenGarageModal: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  part,
  activeMotorcycle,
  onOpenDetail,
  onAddToCart,
  onOpenGarageModal
}) => {

  // Evaluate compatibility status against active motorcycle
  let isCompatible = false;
  let compatibilityNote = '';

  if (activeMotorcycle) {
    const matchRule = part.compatibility.find(c => {
      if (c.modelId !== activeMotorcycle.modelId) return false;
      if (activeMotorcycle.year < c.yearStart || activeMotorcycle.year > c.yearEnd) return false;
      if (c.version && c.version !== activeMotorcycle.version) return false;
      return true;
    });

    if (matchRule) {
      isCompatible = true;
      compatibilityNote = matchRule.note || `Garantizado para ${activeMotorcycle.modelName} (${activeMotorcycle.year})`;
    }
  }

  // Map compatibility rules to model names and badges for this product
  const uniqueVehiclesMap = new Map<string, { name: string; years: string; isMatch: boolean }>();
  part.compatibility.forEach(c => {
    const model = SUZUKI_MODELS.find(m => m.id === c.modelId);
    const modelName = model ? model.name : c.modelId.toUpperCase();
    const isMatch = activeMotorcycle ? activeMotorcycle.modelId === c.modelId : false;
    if (!uniqueVehiclesMap.has(c.modelId)) {
      uniqueVehiclesMap.set(c.modelId, {
        name: modelName,
        years: `${c.yearStart}-${c.yearEnd}`,
        isMatch
      });
    }
  });
  const associatedVehicles = Array.from(uniqueVehiclesMap.values());

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col justify-between group hover:-translate-y-0.5 ${
      activeMotorcycle 
        ? isCompatible 
          ? 'border-emerald-300 shadow-xs hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-950/5' 
          : 'border-red-200 bg-red-50/10 shadow-xs opacity-95 hover:border-red-300'
        : 'border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-lg hover:shadow-slate-950/5'
    }`}>

      <div>
        {/* Dynamic Compatibility Badge Bar */}
        <div className={`px-4 py-2 text-xs font-bold flex items-center justify-between border-b ${
          activeMotorcycle
            ? isCompatible
              ? 'bg-emerald-50/90 text-emerald-800 border-emerald-100'
              : 'bg-red-50 text-red-900 border-red-100'
            : 'bg-amber-50/80 text-amber-900 border-amber-100/80'
        }`}>
          {activeMotorcycle ? (
            isCompatible ? (
              <div className="flex items-center gap-1.5 min-w-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-extrabold text-[11px] uppercase tracking-wider truncate">
                  100% Compatible ({activeMotorcycle.modelName})
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[#E60012] min-w-0">
                <AlertTriangle className="w-4 h-4 text-[#E60012] shrink-0" />
                <span className="font-extrabold text-[11px] uppercase tracking-wider truncate">
                  No Compatible
                </span>
              </div>
            )
          ) : (
            <button
              onClick={onOpenGarageModal}
              className="flex items-center gap-1.5 text-amber-900 hover:text-amber-950 cursor-pointer w-full justify-between group/btn"
            >
              <span className="flex items-center gap-1.5 font-bold text-[11px] uppercase tracking-wider">
                <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                Validar Moto Activa
              </span>
              <span className="text-[10px] bg-amber-200/80 group-hover/btn:bg-amber-300 px-2 py-0.5 rounded font-extrabold transition-colors">
                SELECCIONAR
              </span>
            </button>
          )}
        </div>

        {/* Product Image & Badges */}
        <div 
          role="button"
          tabIndex={0}
          aria-label={`Ver detalles de ${part.name}`}
          onClick={() => onOpenDetail(part)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenDetail(part);
            }
          }}
          className="relative aspect-4/3 bg-slate-100/80 overflow-hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E60012]"
        >
          <img
            src={part.image}
            alt={part.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          
          <div className="absolute top-2.5 left-2.5 bg-slate-900/90 text-white font-mono text-[10px] font-bold px-2.5 py-1 rounded-md backdrop-blur-md shadow-xs">
            OEM: {part.oemNumber}
          </div>

          <div className="absolute top-2.5 right-2.5 bg-white/95 text-slate-800 font-bold text-[10px] uppercase px-2.5 py-1 rounded-md backdrop-blur-md border border-slate-200/80 shadow-xs">
            {part.category}
          </div>
        </div>

        {/* Info */}
        <div className="p-4 sm:p-5">
          <h3 
            role="button"
            tabIndex={0}
            onClick={() => onOpenDetail(part)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpenDetail(part);
              }
            }}
            className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2 hover:text-[#E60012] cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E60012] rounded"
          >
            {part.name}
          </h3>

          <p className="text-slate-600 text-xs mt-1.5 line-clamp-2 leading-relaxed">
            {part.description}
          </p>

          {/* Quick Spec Highlights */}
          <div className="mt-3 bg-slate-50/90 rounded-xl p-2.5 border border-slate-100 text-[11px] text-slate-600 space-y-1.5">
            {part.specs.slice(0, 2).map((s, idx) => (
              <div key={idx} className="flex justify-between font-mono text-[11px]">
                <span className="text-slate-500 font-medium">{s.label}:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[140px]">{s.value}</span>
              </div>
            ))}
          </div>

          {/* Associated Vehicle Badges on Product Card */}
          <div className="mt-3 pt-2.5 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Bike className="w-3.5 h-3.5 text-[#E60012]" />
              <span>Aplica Para (Vehículos):</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {associatedVehicles.map((v, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-extrabold transition-all ${
                    v.isMatch
                      ? 'bg-emerald-100 text-emerald-950 border border-emerald-300 ring-2 ring-emerald-400/20 shadow-xs'
                      : 'bg-slate-100 text-slate-800 border border-slate-200/80'
                  }`}
                  title={`Modelo ${v.name} (${v.years})`}
                >
                  <span>{v.name}</span>
                  <span className="text-[9px] font-mono text-slate-500 font-normal">({v.years})</span>
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Footer Price & Anti-Error Add to Cart */}
      <div className="p-4 sm:p-5 pt-3 border-t border-slate-100 mt-2 space-y-3">
        {/* Row 1: Price and Stock status */}
        <div className="flex items-end justify-between gap-2">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">PRECIO GENUINO</span>
            <span className="text-base sm:text-lg font-mono font-black text-slate-900 tracking-tight block">
              {formatCurrency(part.price)}
            </span>
          </div>
          {part.stock > 0 && (
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg shrink-0">
              En Stock ({part.stock})
            </span>
          )}
        </div>

        {/* Row 2: Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenDetail(part)}
            aria-label={`Ver detalles técnicos de ${part.name}`}
            className="w-11 h-11 flex items-center justify-center text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E60012]"
            title="Ver Ficha Técnica"
          >
            <Eye className="w-4 h-4" />
          </button>

          <a
            href={getProductWhatsAppUrl(part, activeMotorcycle)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Consultar por WhatsApp sobre ${part.name}`}
            className="w-11 h-11 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl transition-colors shrink-0 flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E60012]"
            title="Consultar por WhatsApp"
          >
            <svg className="w-4 h-4 fill-current text-[#25D366]" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.447-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414zM12.01 2.003c-5.504 0-9.976 4.471-9.976 9.974 0 1.759.458 3.475 1.33 4.988l-1.416 5.17 5.29-1.388c1.458.796 3.104 1.215 4.772 1.215 5.505 0 9.977-4.472 9.977-9.974 0-2.665-1.037-5.17-2.92-7.054a9.907 9.907 0 0 0-7.057-2.932z"/>
            </svg>
          </a>

          {/* Strict Anti-Error Guard */}
          {!activeMotorcycle ? (
            <button
              type="button"
              onClick={onOpenGarageModal}
              className="flex-1 py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E60012]"
              title="Debes confirmar tu moto antes de añadir"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Validar Moto</span>
            </button>
          ) : !isCompatible ? (
            <button
              type="button"
              onClick={() => onOpenDetail(part)}
              className="flex-1 py-2.5 px-3 bg-red-100 hover:bg-red-200 text-red-900 font-bold text-xs uppercase rounded-xl cursor-pointer flex items-center justify-center gap-1.5 border border-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E60012]"
              title="Producto no compatible con la motocicleta activa. Haz clic para ver detalles."
            >
              <AlertTriangle className="w-4 h-4 text-[#E60012] shrink-0" />
              <span>Ver Incompatibilidad</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onAddToCart(part)}
              className="flex-1 py-2.5 px-3 bg-[#E60012] hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E60012]"
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span>Añadir</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
