import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { materialsRepo, type MaterialQuery } from '@/data';
import type { Material } from '@/domain/types';

export function useMaterials(query?: MaterialQuery) {
  return useQuery({
    queryKey: ['materials', query ?? {}],
    queryFn: () => materialsRepo.list(query),
  });
}

export function useMaterial(idOrSlug: string | undefined) {
  return useQuery({
    queryKey: ['material', idOrSlug],
    queryFn: () => materialsRepo.get(idOrSlug!),
    enabled: !!idOrSlug,
  });
}

export function useMaterialMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['materials'] });

  const create = useMutation({
    mutationFn: (m: Material) => materialsRepo.create(m),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Material> }) =>
      materialsRepo.update(id, patch),
    onSuccess: (_data, vars) => {
      invalidate();
      qc.invalidateQueries({ queryKey: ['material', vars.id] });
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) => materialsRepo.remove(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
