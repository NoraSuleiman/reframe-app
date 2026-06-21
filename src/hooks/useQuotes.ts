import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { quotesRepo, type CreateQuoteInput } from '@/data';
import type { Quote } from '@/domain/types';

export function useQuotes() {
  return useQuery({ queryKey: ['quotes'], queryFn: () => quotesRepo.list() });
}

export function useCreateQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateQuoteInput) => quotesRepo.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotes'] }),
  });
}

export function useUpdateQuoteStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Quote['status'] }) =>
      quotesRepo.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotes'] }),
  });
}
