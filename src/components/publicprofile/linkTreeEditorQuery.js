import { base44 } from '@/api/base44Client';

export function linkTreeEditorQuery(user, businessId = '') {
  return {
    queryKey: ['linktree-editor', user?.id, businessId],
    enabled: !!user?.id,
    retry: false,
    queryFn: async () => {
      const [profiles, records] = await Promise.all([
        businessId ? base44.entities.BusinessEntity5D.filter({ id: businessId, created_by_id: user.id }, '-updated_date', 1) : base44.entities.UserProfile.filter({ user_id: user.email }, '-updated_date', 1),
        base44.entities.LinkTree.filter({ created_by_id: user.id, business_id: businessId }, '-updated_date', 1),
      ]);
      return { profile: profiles[0], saved: records[0] };
    },
  };
}