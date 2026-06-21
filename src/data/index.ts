// Active repository bindings. Swapping the mock layer for Supabase later means
// changing only these three lines (point them at src/data/supabase/*).
import { mockAuthRepo } from './mock/authRepo';
import { mockMaterialsRepo } from './mock/materialsRepo';
import { mockQuotesRepo } from './mock/quotesRepo';
import type { AuthRepo, MaterialsRepo, QuotesRepo } from './repository';

export const materialsRepo: MaterialsRepo = mockMaterialsRepo;
export const quotesRepo: QuotesRepo = mockQuotesRepo;
export const authRepo: AuthRepo = mockAuthRepo;

export * from './repository';
