import React, { useState } from 'react';
import { X, Wrench, CheckCircle2, Plus, ShieldCheck, Trash2, ArrowRight } from 'lucide-react';
import { SUZUKI_MODELS } from '../data/suzukiData';
import { ActiveMotorcycle } from '../types';
import { SearchableModelSelect } from './SearchableModelSelect';

interface GarageModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMotorcycle: ActiveMotorcycle | null;
  onSelectMotorcycle: (moto: ActiveMotorcycle) => void;
  savedGarages: ActiveMotorcycle[];
  onRemoveFromGarage: (moto: ActiveMotorcycle) => void;
}

export const GarageModal: React.FC<GarageModalProps> = ({
  isOpen,
  onClose,
  activeMotorcycle,
  onSelectMotorcycle,
  savedGarages,
  onRemoveFromGarage
}) => {
  const [selectedModelId, setSelectedModelId] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | ''>('');
  const [selectedVersion, setSelectedVersion] = useState('');

  if (!isOpen) return null;

  const currentModelObj = SUZUKI_MODELS.find(m => m.id === selectedModelId);

  const handleAddNew = () => {
    if (!currentModelObj || !selectedYear || !selectedVersion) return;
    onSelectMotorcycle({
      brand: 'SUZUKI',
      modelId: currentModelObj.id,
      modelName: currentModelObj.name,
      year: Number(selectedYear),
      version: selectedVersion
    });
    setSelectedModelId('');
    setSelectedYear('');
    setSelectedVersion('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
            <Wrench className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">Mi Garaje Suzuki</h3>
            <p className="text-xs text-slate-500">Gestiona tus motocicletas para filtrado y garantía de repuestos</p>
          </div>
        </div>

        {/* List of Saved Motorcycles */}
        {savedGarages.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs font-extrabold uppercase text-slate-500 mb-3 tracking-wider">
              MOTOCICLETAS GUARDADAS ({savedGarages.length})
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {savedGarages.map((moto, idx) => {
                const isActive = activeMotorcycle?.modelId === moto.modelId && activeMotorcycle?.year === moto.year && activeMotorcycle?.version === moto.version;
                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-300'}`} />
                      <div>
                        <div className="font-extrabold text-sm flex items-center gap-2">
                          <span>{moto.brand} {moto.modelName} ({moto.year})</span>
                          {isActive && (
                            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-mono">
                              ACTIVO EN NAVEGACIÓN
                            </span>
                          )}
                        </div>
                        <div className={`text-xs ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                          Versión: {moto.version}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isActive && (
                        <button
                          onClick={() => {
                            onSelectMotorcycle(moto);
                            onClose();
                          }}
                          className="px-3 py-1.5 bg-[#E60012] hover:bg-red-700 text-white font-bold text-xs uppercase rounded-lg transition-colors"
                        >
                          Activar
                        </button>
                      )}
                      <button
                        onClick={() => onRemoveFromGarage(moto)}
                        className={`p-1.5 rounded-lg transition-colors ${isActive ? 'text-slate-400 hover:text-red-400' : 'text-slate-400 hover:text-red-600'}`}
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add New Bike Form */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5">
          <h4 className="text-xs font-extrabold uppercase text-slate-900 mb-3 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-[#E60012]" />
            Añadir Nueva Motocicleta al Garaje
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <SearchableModelSelect
                models={SUZUKI_MODELS}
                selectedModelId={selectedModelId}
                onSelectModel={(id) => {
                  setSelectedModelId(id);
                  setSelectedYear('');
                  setSelectedVersion('');
                }}
                placeholder="Buscar modelo..."
                label="Modelo"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Año</label>
              <select
                value={selectedYear}
                disabled={!currentModelObj}
                onChange={(e) => {
                  setSelectedYear(Number(e.target.value));
                  setSelectedVersion('');
                }}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-800 disabled:opacity-50"
              >
                <option value="">-- Año --</option>
                {currentModelObj?.years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Versión</label>
              <select
                value={selectedVersion}
                disabled={!selectedYear || !currentModelObj}
                onChange={(e) => setSelectedVersion(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-800 disabled:opacity-50"
              >
                <option value="">-- Versión --</option>
                {currentModelObj?.versions.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleAddNew}
            disabled={!selectedModelId || !selectedYear || !selectedVersion}
            className="w-full mt-4 py-2.5 bg-[#E60012] hover:bg-red-700 disabled:bg-slate-300 text-white font-extrabold text-xs uppercase rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
          >
            <span>Guardar y Activar Garaje</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
