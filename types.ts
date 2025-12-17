export type Translation = 'NVI' | 'ARC' | 'ACF' | 'KJA' | 'NVT' | 'NAA' | 'KJV' | 'NIV' | 'ESV';
export type Depth = 'rapido' | 'detalhado' | 'academico' | 'sermao';
export type StudyMode = 'passage' | 'book';

export interface StudyRequest {
  passage: string; // Used for book name in 'book' mode
  translation: Translation;
  depth: Depth;
  mode: StudyMode;
}

export interface HistoryItem extends StudyRequest {
  timestamp: number;
}

export interface LexicalEntry {
  word: string;
  lemma: string;
  transliteration: string;
  morphology: string;
  meaning: string;
}

export interface TheologicalPosition {
  tradition: string; // e.g., "Reformada", "Patrística"
  summary: string;
}

export interface Theologian {
  name: string;
  era: string; // e.g. "Século IV", "Reforma Protestante"
  view: string; // Summary of their view
}

export interface BibliographicEntry {
  author: string;
  title: string;
  publisher?: string;
  year?: string;
  annotation: string; // Brief comment on relevance
}

export interface ParallelPassage {
  reference: string; // e.g., "Lucas 3:16"
  text: string;      // The text or summary
  correlation: string; // How it relates (e.g., "Sinótico", "Citação do AT")
}

export interface SlideContent {
  title: string;
  bullets: string[];
  image_hint: string;
}

export interface SermonPoint {
  title: string;
  explanation: string;
  illustration: string;
  application: string;
}

export interface SermonContent {
  title: string;
  text_focus: string; // The specific verses focused on
  introduction: string;
  points: SermonPoint[];
  conclusion: string;
}

// Interface for the 18-point Book Introduction
export interface BookIntroContent {
  general_id: {
    name: string;
    original_name: string;
    canon_position: string;
  };
  authorship: {
    author_traditional: string;
    internal_evidence: string;
    external_evidence: string;
    academic_debate: string;
  };
  dating: {
    approximate_date: string;
    historical_context: string;
    contemporary_events: string;
    arguments: string;
  };
  recipients: {
    target_audience: string;
    location: string;
    social_conditions: string;
    spiritual_situation: string;
  };
  context_cultural: {
    political_panorama: string;
    culture_customs: string;
    economic_social: string;
    neighbors_relation: string;
  };
  context_canonical: {
    relation_prev_next: string;
    continuity_rupture: string;
    promise_fulfillment: string;
    narrative_preparation: string;
  };
  purpose: {
    main_objective: string;
    problems_addressed: string;
    intent: string;
  };
  themes: string[];
  central_message: string;
  structure: {
    sections: string[];
    progression: string;
    genre: string;
  };
  style: {
    literary_features: string;
    keywords: string[];
    techniques: string;
  };
  characters: {
    name: string;
    role: string;
  }[];
  theology: {
    doctrines: string[];
    contributions: string;
    controversies: string;
  };
  key_passages: {
    reference: string;
    description: string;
  }[];
  redemptive_plan: {
    christ_pointer: string;
    salvation_relation: string;
  };
  application: {
    principles: string[];
    church_relevance: string;
    pastoral_implications: string;
  };
  interpretation_challenges: {
    difficult_texts: string[];
    hermeneutic_problems: string;
  };
  conclusion: string;
}

export interface StudyData {
  type: StudyMode; // 'passage' or 'book'
  meta: {
    reference: string;
    translation: Translation;
    generated_at: string;
  };
  // Existing fields for Passage Study
  summary?: {
    executive: string;
    key_quote: string;
    preaching_points: string[];
  };
  content?: {
    text_base: string;
    intro_definition: string;
    context_literary: string;
    context_historical: string;
    parallels: ParallelPassage[];
    lexical_analysis: LexicalEntry[];
    intertextuality: string;
    interpretations: TheologicalPosition[];
    theologians: Theologian[];
    implications: string;
    study_questions: string[];
    bibliography: BibliographicEntry[];
  };
  sermon?: SermonContent;
  slides?: SlideContent[];
  
  // New field for Book Introduction
  bookIntro?: BookIntroContent;
}