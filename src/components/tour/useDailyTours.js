import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { DAILY_TOURS } from '@/components/tour/dailyTours';

const EMPTY_PROGRESS = DAILY_TOURS.map(() => 0);

export default function useDailyTours(userId) {
  const queryClient = useQueryClient();
  const queryKey = ['dailyTourProgress', userId];
  const query = useQuery({
    queryKey, enabled: !!userId,
    queryFn: async () => {
      const { items } = await base44.entities.DailyTourProgress.filter({ created_by_id: userId }, { sort: 'created_date', limit: 1 });
      return items[0] ?? null;
    },
  });
  const record = query.data;
  const sections = record?.sections_completed ?? EMPTY_PROGRESS;


  const save = useMutation({
    mutationFn: async ({ day, count } = {}) => {
      if (!record) return base44.entities.DailyTourProgress.create({ sections_completed: EMPTY_PROGRESS });
      const next = sections.map((saved, index) => index === day ? Math.max(count, saved) : saved);
      return base44.entities.DailyTourProgress.update(record.id, { sections_completed: next });
    },
    onSuccess: (saved) => {
      queryClient.setQueryData(queryKey, saved);
    },
  });
  return { query, record, sections, save };
}