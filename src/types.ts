export interface SuzukiModel {
  id: string;
  name: string;
  category: string;
  image: string;
  years: number[];
  versions: string[];
}

export interface CompatibilityRule {
  modelId: string;
  yearStart: number;
  yearEnd: number;
  version?: string;
  note?: string;
}

export interface TechnicalSpec {
  label: string;
  value: string;
}

export interface SuzukiPart {
  id: string;
  oemNumber: string;
  name: string;
  category: 'motor' | 'electrico' | 'frenos' | 'transmision' | 'filtros' | 'carroceria';
  price: number;
  stock: number;
  image: string;
  images?: string[];
  description: string;
  specs: TechnicalSpec[];
  compatibility: CompatibilityRule[];
  schematicId?: string;
  diagramHotspot?: { x: number; y: number; itemNumber: number };
}

export interface ExplodedDiagram {
  id: string;
  title: string;
  category: string;
  modelTarget: string;
  diagramImage: string;
  description: string;
  hotspots: {
    partId: string;
    itemNumber: number;
    x: number; // percentage
    y: number; // percentage
    label: string;
  }[];
}

export interface ActiveMotorcycle {
  brand: string;
  modelId: string;
  modelName: string;
  year: number;
  version: string;
  vin?: string;
}

export interface CartItem {
  part: SuzukiPart;
  quantity: number;
  motorcycle: ActiveMotorcycle;
}

export interface VinLookupResult {
  vin: string;
  found: boolean;
  motorcycle?: ActiveMotorcycle;
  engineCode?: string;
  assemblyPlant?: string;
  specsSummary?: string;
  message?: string;
}
