import { PATHWAY_LABELS } from '@/domain/crs';
import type { MaterialFamily, Pathway } from '@/domain/types';
import { Badge } from '@/components/ui/Badge';

export const FAMILY_LABELS: Record<MaterialFamily, string> = {
  panel: 'Panel',
  glazing: 'Glazing',
  substructure: 'Substructure',
  shading: 'Shading',
};

export function FamilyTag({ family }: { family: MaterialFamily }) {
  return <Badge tone={family === 'panel' ? 'clay' : family}>{FAMILY_LABELS[family]}</Badge>;
}

export function PathwayTag({ pathway }: { pathway: Pathway }) {
  return <Badge tone="outline">{PATHWAY_LABELS[pathway]}</Badge>;
}
