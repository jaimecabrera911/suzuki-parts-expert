import React from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldCheck, Layers, ArrowRight, ShoppingBag, Wrench, Factory, FileText, Bike, Maximize2 } from 'lucide-react';
import { SuzukiPart, ActiveMotorcycle } from '../types';
import { SUZUKI_MODELS } from '../data/suzukiData';
import { formatCurrency } from '../utils/formatCurrency';
import { getProductWhatsAppUrl } from '../utils/whatsapp';
import { ProductImageGallery } from './ProductImageGallery';

interface ProductDetailModalProps {
  part: SuzukiPart | null;
  activeMotorcycle: ActiveMotorcycle | null;
  allParts?: SuzukiPart[];
  onClose: () => void;
  onAddToCart: (part: SuzukiPart) => void;
  onOpenGarageModal: () => void;
  onViewSchematics: (schematicId: string) => void;
  onSelectRelatedPart?: (part: SuzukiPart) => void;
  onOpenAsPage?: (part: SuzukiPart) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  part,
  activeMotorcycle,
  allParts = [],
  onClose,
  onAddToCart,
  onOpenGarageModal,
  onViewSchematics,
  onSelectRelatedPart,
  onOpenAsPage,
}) => {
  if (!part) return null;

  // Compatibility evaluation
  let isCompatible = false;
  let compatibilityRule = null;

  if (activeMotorcycle) {
    compatibilityRule = part.compatibility.find(c => {
      if (c.modelId !== activeMotorcycle.modelId) return false;
      if (activeMotorcycle.year < c.yearStart || activeMotorcycle.year > c.yearEnd) return false;
      if (c.version && c.version !== activeMotorcycle.version) return false;
      return true;
    });
    isCompatible = !!compatibilityRule;
  }

  // Calculate strictly compatible related parts
  const isPartCompatibleWithMoto = (p: SuzukiPart, moto: ActiveMotorcycle): boolean => {
    return p.compatibility.some(c => {
      if (c.modelId !== moto.modelId) return false;
      if (moto.year < c.yearStart || moto.year > c.yearEnd) return false;
      if (c.version && c.version !== moto.version) return false;
      return true;
    });
  };

  let relatedParts: SuzukiPart[] = [];
  if (activeMotorcycle) {
    // STRICT RULE: ONLY parts compatible with activeMotorcycle
    relatedParts = allParts.filter(
      p => p.id !== part.id && isPartCompatibleWithMoto(p, activeMotorcycle)
    );
  } else {
    // If no active motorcycle, parts sharing compatibility models
    const currentModelIds = new Set(part.compatibility.map(c => c.modelId));
    relatedParts = allParts.filter(
      p => p.id !== part.id && p.compatibility.some(c => currentModelIds.has(c.modelId))
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto">
        
        {/* Header Action Controls */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          {onOpenAsPage && (
            <button
              onClick={() => {
                onClose();
                onOpenAsPage(part);
              }}
              className="p-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors border border-slate-200/80 cursor-pointer"
              title="Abrir en vista dedicada de página completa"
            >
              <Maximize2 className="w-3.5 h-3.5 text-[#E60012]" />
              <span className="hidden sm:inline">Página Completa</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Compatibility Seal */}
        <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 border ${
          activeMotorcycle
            ? isCompatible
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          {activeMotorcycle ? (
            isCompatible ? (
              <>
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-sm uppercase text-emerald-900">
                    COMPATIBILIDAD 100% GARANTIZADA
                  </h4>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Esta pieza con código OEM <span className="font-mono font-bold">{part.oemNumber}</span> es exactamente la especificada de fábrica para tu <span className="font-bold">{activeMotorcycle.brand} {activeMotorcycle.modelName} ({activeMotorcycle.year})</span>.
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertTriangle className="w-6 h-6 text-[#E60012] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-sm uppercase text-[#E60012]">
                    ALERTA DE INCOMPATIBILIDAD TÉCNICA
                  </h4>
                  <p className="text-xs text-red-800 mt-0.5">
                    Este repuesto NO es compatible con tu vehículo activo (<span className="font-bold">{activeMotorcycle.modelName} {activeMotorcycle.year}</span>). Evita selecciones erróneas cambiando la moto en tu Garaje.
                  </p>
                </div>
              </>
            )
          ) : (
            <>
              <Wrench className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex items-center justify-between w-full">
                <div>
                  <h4 className="font-extrabold text-sm uppercase text-amber-900">
                    MOTOCICLETA NO SELECCIONADA
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Selecciona tu modelo y año antes de proceder con el pedido para verificar tolerancias exactas.
                  </p>
                </div>
                <button
                  onClick={onOpenGarageModal}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase rounded-lg shadow-xs shrink-0 ml-2"
                >
                  Seleccionar
                </button>
              </div>
            </>
          )}
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left Column: Interactive Image Gallery & Schematic link */}
          <div className="space-y-3">
            <ProductImageGallery part={part} onViewSchematics={onViewSchematics} />

            <div className="bg-slate-900 text-white p-3.5 rounded-xl font-mono text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">CÓDIGO OFICIAL SUZUKI OEM</span>
                <span className="font-bold text-emerald-400 text-sm tracking-wide">{part.oemNumber}</span>
              </div>
              <Factory className="w-5 h-5 text-slate-400" />
            </div>

            {part.schematicId && (
              <button
                onClick={() => {
                  onClose();
                  onViewSchematics(part.schematicId!);
                }}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-200 cursor-pointer"
              >
                <Layers className="w-4 h-4 text-[#E60012]" />
                <span>Ver en Diagrama de Despiece (Exploded View)</span>
              </button>
            )}
          </div>

          {/* Right Column: Technical Specs & Description */}
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">{part.category}</span>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">{part.name}</h2>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2 whitespace-nowrap">{formatCurrency(part.price)}</div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
              {part.description}
            </p>

            {/* Spec Sheet Table */}
            <div>
              <h4 className="text-xs font-extrabold uppercase text-slate-900 mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#E60012]" />
                Especificaciones Técnicas
              </h4>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5 text-xs">
                {part.specs.map((s, idx) => (
                  <div key={idx} className="flex justify-between border-b border-slate-200/60 pb-1 last:border-none">
                    <span className="text-slate-500 font-medium">{s.label}:</span>
                    <span className="font-mono font-bold text-slate-800">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Applicability Range Badges / Table */}
            <div>
              <h4 className="text-xs font-extrabold uppercase text-slate-900 mb-2 flex items-center gap-1.5">
                <Bike className="w-3.5 h-3.5 text-[#E60012]" />
                Vehículos Asociados & Compatibilidad
              </h4>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {part.compatibility.map((c, idx) => {
                  const modelObj = SUZUKI_MODELS.find(m => m.id === c.modelId);
                  const isMatch = activeMotorcycle ? activeMotorcycle.modelId === c.modelId : false;
                  return (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl text-xs flex justify-between items-center border transition-colors ${
                        isMatch
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950 ring-1 ring-emerald-400/20'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div>
                        <div className="font-extrabold flex items-center gap-1.5">
                          {modelObj ? modelObj.name : c.modelId.toUpperCase()}
                          {isMatch && (
                            <span className="text-[9px] font-mono font-bold bg-emerald-600 text-white px-1.5 py-0.5 rounded uppercase">
                              Tu Moto
                            </span>
                          )}
                        </div>
                        {c.version && (
                          <div className="text-[10px] text-slate-500 font-medium">{c.version}</div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono text-[11px] font-bold text-slate-700 bg-white/80 border border-slate-200 px-2 py-1 rounded-md">
                          {c.yearStart} - {c.yearEnd}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

        {/* Related Products Section (Strictly Compatible with Active Motorcycle) */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Repuestos Relacionados Garantizados
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeMotorcycle ? (
                  <>
                    Mostrando únicamente repuestos 100% compatibles con tu{' '}
                    <span className="font-bold text-slate-800">
                      {activeMotorcycle.modelName} ({activeMotorcycle.year})
                    </span>
                  </>
                ) : (
                  'Selecciona una motocicleta en tu garaje para verificar compatibilidad exacta.'
                )}
              </p>
            </div>
            {activeMotorcycle && (
              <span className="text-[10px] font-bold font-mono px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full shrink-0">
                100% Compatibles ({relatedParts.length})
              </span>
            )}
          </div>

          {relatedParts.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center text-xs text-slate-500">
              No hay otros repuestos registrados para este modelo en este momento.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {relatedParts.slice(0, 3).map((relPart) => (
                <div
                  key={relPart.id}
                  className="bg-slate-50 hover:bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between transition-all hover:shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded">
                        {relPart.oemNumber}
                      </span>
                      {activeMotorcycle && (
                        <span className="text-[9px] font-extrabold text-emerald-600 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Compatible
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 items-center mb-2">
                      <img
                        src={relPart.image}
                        alt={relPart.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 object-cover rounded-lg bg-slate-200 shrink-0"
                      />
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight">
                        {relPart.name}
                      </h4>
                    </div>
                    <div className="text-xs font-black text-slate-900 mb-3 whitespace-nowrap">
                      {formatCurrency(relPart.price)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200/80">
                    <button
                      onClick={() => onSelectRelatedPart && onSelectRelatedPart(relPart)}
                      className="flex-1 py-1.5 px-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-[10px] uppercase rounded-lg transition-colors text-center"
                    >
                      Ver Detalle
                    </button>
                    <button
                      onClick={() => onAddToCart(relPart)}
                      className="py-1.5 px-2 bg-[#E60012] hover:bg-red-700 text-white font-bold text-[10px] uppercase rounded-lg transition-colors flex items-center gap-1 shrink-0"
                      title="Añadir al carrito"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>+Carrito</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="mt-8 border-t border-slate-200 pt-4 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Stock disponible: <span className="font-bold text-slate-900">{part.stock} unidades en bodega</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={getProductWhatsAppUrl(part, activeMotorcycle)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-[#25D366] hover:bg-emerald-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              <span>Consultar WhatsApp</span>
            </a>

            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase rounded-xl transition-colors"
            >
              Cerrar
            </button>

            {!activeMotorcycle ? (
              <button
                onClick={onOpenGarageModal}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs uppercase rounded-xl shadow-md transition-colors"
              >
                Seleccionar Moto para Comprar
              </button>
            ) : !isCompatible ? (
              <button
                disabled
                className="px-6 py-2.5 bg-red-200 text-red-800 font-extrabold text-xs uppercase rounded-xl cursor-not-allowed border border-red-300"
              >
                Compra Bloqueada (Incompatible)
              </button>
            ) : (
              <button
                onClick={() => {
                  onAddToCart(part);
                  onClose();
                }}
                className="px-6 py-2.5 bg-[#E60012] hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Añadir al Carrito Garantizado</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
