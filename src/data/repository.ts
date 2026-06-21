import type { Material, Profile, Quote, QuoteContact, QuoteLineItem } from '@/domain/types';

// ---------------------------------------------------------------------------
// Repository interfaces — the seam between the UI and the backend. The mock
// implementation (src/data/mock/*) satisfies these against seed JSON +
// localStorage today; a Supabase implementation (src/data/supabase/*) can
// satisfy the same contracts later without any UI changes.
// ---------------------------------------------------------------------------

export interface MaterialQuery {
  search?: string;
  families?: Material['family'][];
  pathways?: string[];
  minCrs?: number; // 0–1 eCRS ratio
  buildings?: string[];
  maxPrice?: number;
  sort?: 'crs' | 'carbon' | 'price-asc' | 'price-desc' | 'name';
  includeDrafts?: boolean; // admin only
}

export interface MaterialsRepo {
  list(query?: MaterialQuery): Promise<Material[]>;
  get(idOrSlug: string): Promise<Material | null>;
  create(material: Material): Promise<Material>;
  update(id: string, patch: Partial<Material>): Promise<Material>;
  remove(id: string): Promise<void>;
}

export interface CreateQuoteInput {
  userId: string | null;
  contact: QuoteContact;
  lineItems: QuoteLineItem[];
  subtotal: number;
  total: number;
  aggregateCrs: number;
  totalCarbonSavingPct: number;
}

export interface QuotesRepo {
  create(input: CreateQuoteInput): Promise<Quote>;
  list(): Promise<Quote[]>;
  get(id: string): Promise<Quote | null>;
  updateStatus(id: string, status: Quote['status']): Promise<Quote>;
}

export interface Session {
  profile: Profile;
}

export interface AuthRepo {
  signUp(email: string, password: string, displayName: string): Promise<Session>;
  signIn(email: string, password: string): Promise<Session>;
  /** Simulated magic link — resolves a session for a known or new email. */
  magicLink(email: string): Promise<Session>;
  signOut(): Promise<void>;
  currentSession(): Promise<Session | null>;
}
