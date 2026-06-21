// The 18 binary assessment criteria from the Material Capital framework.
// Each is a yes/no flag feeding the three capital sub-scores.

export const CRITERIA = {
  STR: { label: 'Structural integrity', capital: 'technical' },
  MOD: { label: 'Modularity', capital: 'technical' },
  DIS: { label: 'Disassemblability', capital: 'technical' },
  CON: { label: 'Condition', capital: 'technical' },
  VIS: { label: 'Visual quality', capital: 'technical' },
  SID: { label: 'Standardised dimensions', capital: 'technical' },
  REU: { label: 'Reusability', capital: 'technical' },
  LIF: { label: 'Remaining lifespan', capital: 'technical' },
  EMB: { label: 'Low embodied carbon', capital: 'ecological' },
  LOC: { label: 'Local / low transport', capital: 'ecological' },
  PUR: { label: 'Material purity', capital: 'ecological' },
  ENG: { label: 'Recyclability', capital: 'ecological' },
  AVA: { label: 'Availability', capital: 'economic' },
  TEC: { label: 'Established techniques', capital: 'economic' },
  REG: { label: 'Regulatory acceptance', capital: 'economic' },
  VERS: { label: 'Versatility', capital: 'economic' },
  TRA: { label: 'Transferable market value', capital: 'economic' },
  LAB: { label: 'Low separation labour', capital: 'economic' },
} as const;

export type CriterionKey = keyof typeof CRITERIA;
export type Capital = 'technical' | 'ecological' | 'economic';

export const CRITERIA_KEYS = Object.keys(CRITERIA) as CriterionKey[];

export function criteriaByCapital(capital: Capital): CriterionKey[] {
  return CRITERIA_KEYS.filter((k) => CRITERIA[k].capital === capital);
}
