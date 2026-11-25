export interface DrugCompound {
  cid: number;
  name: string;
  synonyms: string[];
  formula: string;
  mw: number;
  logp: number;
  tpsa: number;
  hbd: number;
  hba: number;
  rot_bonds: number;
  heavy_atoms?: number;
  complexity?: number;
  smiles: string;
  inchikey?: string;
  structure_url: string;
  source: string;
}

export interface DrugSafetyLabel {
  brand_name: string;
  generic_name: string;
  boxed_warning: string;
  indications: string;
  contraindications: string;
  warnings: string;
  adverse_reactions: string;
  mechanism_of_action: string;
  source: string;
}

export interface FaersAdverseEvent {
  term: string;
  count: number;
  prr: number;
  ror: number;
  disproportionality: string;
}

export interface FaersData {
  drug_name: string;
  total_reports_indexed: number;
  reporting_period: string;
  top_adverse_events: FaersAdverseEvent[];
  demographics: {
    female_pct: number;
    male_pct: number;
    age_groups: Record<string, number>;
  };
  bias_statement: string;
  source: string;
}

export interface PgxGuideline {
  drug: string;
  gene: string;
  evidence_level: string;
  clinical_summary: string;
  phenotype_guidelines: Record<string, { impact: string; recommendation: string }>;
  citation: string;
}

export interface PatientProfile {
  age: number;
  sex: string;
  height_cm: number;
  weight_kg: number;
  bmi: number;
  ast: number;
  alt: number;
  bilirubin: number;
  creatinine: number;
  systolic_bp: number;
  diastolic_bp: number;
  medications: string[];
}

export interface ShapContribution {
  feature: string;
  display_name: string;
  value: number;
  shap_value: number;
  direction?: string;
}

export interface SimulationResult {
  simulation_id: string;
  type: string;
  drug_name: string;
  daily_dose_mg: number;
  patient_profile: PatientProfile;
  chemical_properties?: DrugCompound;
  prediction: {
    predicted_class_code: number;
    predicted_class_label: string;
    class_probabilities: {
      v_no_dili_concern: number;
      v_less_dili_concern: number;
      v_most_dili_concern: number;
    };
    patient_baseline_factors: {
      ast_u_l: number;
      alt_u_l: number;
      total_bilirubin_mg_dl: number;
      age: number;
      vulnerability_flags: string[];
    };
    disclaimer: string;
  };
  openfda_safety?: DrugSafetyLabel;
  pharmacogenomics?: PgxGuideline;
  faers_adverse_events?: FaersData;
  explainability: {
    base_value: number;
    waterfall: ShapContribution[];
    scientific_summary: string;
  };
  operating_mode: "REAL_MODEL_MODE" | "DEMONSTRATION_MODE";
}

export interface BiologicalResponse {
  simulation_id?: string;
  drug_name: string;
  cell_line: string;
  cell_line_description?: string;
  experimental_dose_um: number;
  exposure_time_hours: number;
  dataset_source: string;
  landmark_gene_zscores: Record<string, number>;
  pathway_stress_index: number;
  cluster_assignment: string;
  pca_coordinates: {
    pc1: number;
    pc2: number;
    pc3: number;
  };
  scientific_limitation: string;
}

export interface DatasetInfo {
  id: string;
  name: string;
  source_url: string;
  provider: string;
  version: string;
  purpose: string;
  record_count: string;
  usage: string;
  caveats: string;
}

export interface ModelMetadataItem {
  name: string;
  algorithm?: string;
  version: string;
  status: string;
  mode: string;
  dataset_name: string;
  record_count?: number;
  accuracy?: number;
  f1_score?: number;
  roc_auc?: number;
  last_trained: string;
}

export type PlatformMode = "general" | "researcher";
export type ThemeMode = "midnight" | "cyber-emerald" | "deep-indigo" | "clinical-light";

// 3D Anatomy & Drug Journey Types
export interface Organ {
  id: string;
  name: string;
  system: string;
  position: [number, number, number];
  basic_function: string;
  metabolic_role: string;
}

export interface BiologicalSystem {
  id: string;
  name: string;
  key_organs: string[];
  color: string;
}

export interface OrganEvidence {
  organ_id: string;
  name: string;
  system: string;
  position: [number, number, number];
  basic_function: string;
  metabolic_role: string;
  status: "blue" | "green" | "yellow" | "orange" | "red" | "grey";
  effect_category: string;
  mechanism: string;
  evidence_source: string;
  evidence_type: string;
  biomarkers: string[];
  limitations: string;
}

export interface DrugJourneyStage {
  stage_number: number;
  title: string;
  target_system: string;
  primary_organ: string;
  duration_seconds: number;
  description: string;
  pharmacokinetic_status: string;
  camera_focus: [number, number, number];
}

export interface DrugJourney {
  drug_name: string;
  route: string;
  total_stages: number;
  stages: DrugJourneyStage[];
  disclaimer: string;
}

// Smart Medicine Calendar Types
export interface CalendarSchedule {
  id: string;
  medicine_name: string;
  brand_name?: string;
  strength: string;
  dosage_form: string;
  prescribed_dose: string;
  frequency: string;
  scheduled_times: string[];
  food_timing: string;
  start_date: string;
  end_date?: string;
  instructions: string;
  prescribing_doctor?: string;
  created_at: string;
}

export interface ScheduledDose {
  dose_id: string;
  schedule_id: string;
  medicine_name: string;
  brand_name: string;
  strength: string;
  dosage_form: string;
  date: string;
  time: string;
  food_timing: string;
  status: "Upcoming" | "Taken" | "Skipped" | "Missed";
  recorded_at?: string;
  instructions?: string;
}

export interface AdherenceStatistics {
  rate_percentage: number;
  taken_doses: number;
  missed_doses: number;
  skipped_doses: number;
  label: string;
}

export interface MedicationReminder {
  id: string;
  medicine: string;
  type: string;
  time: string;
  message: string;
  urgent: boolean;
}

export interface CalendarOverview {
  current_date: string;
  today_schedule: ScheduledDose[];
  weekly_schedule: ScheduledDose[];
  adherence_statistics: AdherenceStatistics;
  reminders: MedicationReminder[];
  missed_dose_rule: string;
}

// Drug Interaction Types
export interface DrugInteractionItem {
  drug_1: string;
  drug_2: string;
  severity: "Major" | "Moderate" | "Minor" | "No Documented Interaction";
  title: string;
  mechanism: string;
  clinical_action: string;
  evidence_source: string;
  documentation_level: string;
}

export interface InteractionCheckResult {
  evaluated_drugs: string[];
  total_pairs_evaluated: number;
  overall_status: string;
  interactions: DrugInteractionItem[];
  disclaimer: string;
}

// AI Assistant Types
export interface AssistantResponse {
  query: string;
  mode: "general" | "researcher";
  detected_drug?: string;
  is_emergency: boolean;
  response: string;
  citations: string[];
  disclaimer: string;
}

// Indian Medicine Types
export interface IndianBrandItem {
  brand: string;
  manufacturer: string;
  strength: string;
  form: string;
}

export interface IndianMedicineInfo {
  generic_name: string;
  abdm_id: string;
  cdsco_status: string;
  schedule: string;
  common_brands: IndianBrandItem[];
  approved_indications: string;
  cdsco_warnings: string;
  storage: string;
}
