import {
  DrugCompound,
  DrugSafetyLabel,
  SimulationResult,
  BiologicalResponse,
  DatasetInfo,
  ModelMetadataItem,
  Organ,
  BiologicalSystem,
  OrganEvidence,
  DrugJourney,
  CalendarOverview,
  InteractionCheckResult,
  AssistantResponse
} from '../types';

const API_BASE = '/api';

export const api = {
  // Drug Explorer
  searchDrugs: async (query: string): Promise<DrugCompound[]> => {
    try {
      const res = await fetch(`${API_BASE}/drugs/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      return data.results || [];
    } catch (e) {
      console.warn('API fetch failed, returning fallback catalog', e);
      return [];
    }
  },

  searchIndianBrands: async (query: string): Promise<any[]> => {
    try {
      const res = await fetch(`${API_BASE}/drugs/indian/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Indian brand search failed');
      const data = await res.json();
      return data.results || [];
    } catch (e) {
      console.warn('Indian search failed', e);
      return [];
    }
  },

  getCatalog: async (): Promise<DrugCompound[]> => {
    try {
      const res = await fetch(`${API_BASE}/drugs/catalog`);
      if (!res.ok) throw new Error('Failed to fetch catalog');
      const data = await res.json();
      return data.drugs || [];
    } catch (e) {
      console.warn('Catalog API failed', e);
      return [];
    }
  },

  getDrugDetails: async (drugId: string): Promise<{ compound: DrugCompound; pharmacogenomics: any; indian_registry?: any }> => {
    const res = await fetch(`${API_BASE}/drugs/${encodeURIComponent(drugId)}`);
    if (!res.ok) throw new Error('Failed to fetch drug details');
    return res.json();
  },

  getDrugProperties: async (drugId: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/drugs/${encodeURIComponent(drugId)}/properties`);
    if (!res.ok) throw new Error('Failed to fetch drug properties');
    return res.json();
  },

  getDrugSafety: async (drugId: string): Promise<{ drug_name: string; openfda_label: DrugSafetyLabel; faers_adverse_events: any; indian_regulatory?: any }> => {
    const res = await fetch(`${API_BASE}/drugs/${encodeURIComponent(drugId)}/safety`);
    if (!res.ok) throw new Error('Failed to fetch drug safety');
    return res.json();
  },

  checkDrugInteractions: async (drugs: string[]): Promise<InteractionCheckResult> => {
    const res = await fetch(`${API_BASE}/drugs/interactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drugs })
    });
    if (!res.ok) throw new Error('Failed to evaluate drug interactions');
    return res.json();
  },

  // 3D Anatomy & Drug Journey
  getOrgans: async (): Promise<{ count: number; organs: Organ[] }> => {
    const res = await fetch(`${API_BASE}/anatomy/organs`);
    if (!res.ok) throw new Error('Failed to fetch organs');
    return res.json();
  },

  getBiologicalSystems: async (): Promise<{ count: number; systems: BiologicalSystem[] }> => {
    const res = await fetch(`${API_BASE}/anatomy/systems`);
    if (!res.ok) throw new Error('Failed to fetch biological systems');
    return res.json();
  },

  getDrugOrganEvidence: async (drugId: string): Promise<{ drug_name: string; is_supported: boolean; organs: OrganEvidence[]; general_disclaimer: string }> => {
    const res = await fetch(`${API_BASE}/anatomy/drug/${encodeURIComponent(drugId)}/evidence`);
    if (!res.ok) throw new Error('Failed to fetch organ evidence');
    return res.json();
  },

  getDrugJourney: async (drugName: string, route: string = 'Oral'): Promise<DrugJourney> => {
    const res = await fetch(`${API_BASE}/anatomy/drug-journey`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drug_name: drugName, route })
    });
    if (!res.ok) throw new Error('Failed to generate drug journey');
    return res.json();
  },

  // Smart Medicine Calendar & Reminders
  getCalendarOverview: async (targetDate?: string): Promise<CalendarOverview> => {
    const url = targetDate ? `${API_BASE}/calendar?date=${encodeURIComponent(targetDate)}` : `${API_BASE}/calendar`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch calendar');
    return res.json();
  },

  addMedicationSchedule: async (payload: any): Promise<any> => {
    const res = await fetch(`${API_BASE}/calendar/schedules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to create medication schedule');
    return res.json();
  },

  updateDoseStatus: async (doseId: string, status: string, notes?: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/calendar/doses/${encodeURIComponent(doseId)}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes })
    });
    if (!res.ok) throw new Error('Failed to update dose status');
    return res.json();
  },

  deleteSchedule: async (scheduleId: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/calendar/schedules/${encodeURIComponent(scheduleId)}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete schedule');
    return res.json();
  },

  // RAG AI Medicine Guide & Research Assistant
  askAIAssistant: async (query: string, mode: 'general' | 'researcher' = 'general', drugContext?: string): Promise<AssistantResponse> => {
    const res = await fetch(`${API_BASE}/assistant/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, mode, drug_context: drugContext })
    });
    if (!res.ok) throw new Error('Failed to query AI assistant');
    return res.json();
  },

  // Simulations
  runLiverSimulation: async (payload: {
    drug_name: string;
    daily_dose_mg: number;
    patient: any;
  }): Promise<SimulationResult> => {
    const res = await fetch(`${API_BASE}/simulation/liver-toxicity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Simulation failed');
    return res.json();
  },

  runBiologicalSimulation: async (payload: {
    drug_name: string;
    cell_line: string;
    dose_um: number;
    time_h: number;
  }): Promise<BiologicalResponse> => {
    const res = await fetch(`${API_BASE}/simulation/biological-response`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Biological simulation failed');
    return res.json();
  },

  getSimulationById: async (id: string): Promise<SimulationResult> => {
    const res = await fetch(`${API_BASE}/simulation/${id}`);
    if (!res.ok) throw new Error('Failed to fetch simulation');
    return res.json();
  },

  // Explainability & Models
  getGlobalExplainability: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/explainability/global`);
    if (!res.ok) throw new Error('Failed to fetch explainability');
    return res.json();
  },

  getModelsStatus: async (): Promise<{ operating_mode: string; dili_model_trained: boolean; lincs_model_trained: boolean; models_metadata: Record<string, ModelMetadataItem> }> => {
    const res = await fetch(`${API_BASE}/models/status`);
    if (!res.ok) throw new Error('Failed to fetch models status');
    return res.json();
  },

  getModelMetrics: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/models/metrics`);
    if (!res.ok) throw new Error('Failed to fetch metrics');
    return res.json();
  },

  getDatasetsStatus: async (): Promise<{ datasets: DatasetInfo[] }> => {
    const res = await fetch(`${API_BASE}/datasets/status`);
    if (!res.ok) throw new Error('Failed to fetch dataset status');
    return res.json();
  },

  // PDF Report Generation
  generateReport: async (payload: {
    simulation_id?: string;
    drug_name: string;
    patient: any;
    simulation_result: any;
    chemical_properties?: any;
  }): Promise<{ report_id: string; filename: string; download_url: string }> => {
    const res = await fetch(`${API_BASE}/reports/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to generate PDF report');
    return res.json();
  },

  // Authentication & Privacy
  register: async (payload: any): Promise<any> => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  login: async (payload: any): Promise<any> => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  deleteUserData: async (email: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/auth/data?email=${encodeURIComponent(email)}`, {
      method: 'DELETE'
    });
    return res.json();
  }
};
