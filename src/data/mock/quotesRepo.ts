import type { Quote } from '@/domain/types';
import { readJSON, STORAGE_KEYS, writeJSON } from '@/lib/storage';
import type { CreateQuoteInput, QuotesRepo } from '@/data/repository';

const delay = (ms = 150) => new Promise((r) => setTimeout(r, ms));

function load(): Quote[] {
  return readJSON<Quote[]>(STORAGE_KEYS.quotes, []);
}
function save(quotes: Quote[]): void {
  writeJSON(STORAGE_KEYS.quotes, quotes);
}

function makeReference(): string {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `RF-${year}-${rand}`;
}

export const mockQuotesRepo: QuotesRepo = {
  async create(input: CreateQuoteInput) {
    await delay();
    const quote: Quote = {
      id: crypto.randomUUID(),
      reference: makeReference(),
      userId: input.userId,
      contact: input.contact,
      lineItems: input.lineItems,
      subtotal: input.subtotal,
      total: input.total,
      aggregateCrs: input.aggregateCrs,
      totalCarbonSavingPct: input.totalCarbonSavingPct,
      status: 'submitted',
      createdAt: new Date().toISOString(),
    };
    const all = load();
    all.unshift(quote);
    save(all);
    return quote;
  },
  async list() {
    await delay();
    return load();
  },
  async get(id) {
    await delay(60);
    return load().find((q) => q.id === id) ?? null;
  },
  async updateStatus(id, status) {
    await delay();
    const all = load();
    const idx = all.findIndex((q) => q.id === id);
    if (idx === -1) throw new Error(`Quote ${id} not found`);
    all[idx] = { ...all[idx], status };
    save(all);
    return all[idx];
  },
};
