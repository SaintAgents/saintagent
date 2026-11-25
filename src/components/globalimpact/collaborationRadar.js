import { useInfiniteQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { safePath } from '@/components/live/activity';
import { escapeRegex, opportunityPath } from '@/components/globalimpact/impactDiscovery';
import { demoOpportunities, demoPulse } from '@/components/globalimpact/impactDemo';

export const radarLayers = [['needs','Emerging needs'], ['initiatives','Active initiatives'], ['capabilities','Available capabilities'], ['outcomes','Reported outcomes']];
const isListing = layer => layer === 'needs' || layer === 'capabilities';
function listing(row) {
  return { ...row, terms: [...(row.skills_required || []), ...(row.skills || [])].filter(Boolean), path: opportunityPath(row.id) };
}
function event(row) {
  return { id:row.id, title:row.headline, description:row.description, metric:row.metric, region:row.country, terms:[], path:safePath(row.action_path) };
}
export function demoRadar(layer, search) {
  const rows = isListing(layer)
    ? (layer === 'needs' ? demoOpportunities.filter(row => row.listing_type === 'request') : [{ ...demoOpportunities[2], title:'Solar workshop facilitation (demo)', description:'A fictional facilitator offers to help teams teach a tabletop solar demonstration.', skills:['teaching'], skills_required:[] }]).map(row => ({ ...listing(row), path:null }))
    : demoPulse.filter(row => row.category === (layer === 'initiatives' ? 'projects' : 'impact')).map(row => {
      const location = demoOpportunities[layer === 'initiatives' ? 1 : 0];
      return { ...event(row), region:location.region, demoPoint:location.demoPoint, path:null };
    });
  return rows.filter(row => [row.title, row.description, row.region, ...row.terms].some(value => value?.toLowerCase().includes(search.toLowerCase())));
}
export default function useCollaborationRadar(userId, layer, search, demo) {
  const listings = isListing(layer);
  const entity = listings ? base44.entities.Listing : layer === 'initiatives' ? base44.entities.Mission : base44.entities.LiveEvent;
  const scope = listings ? { status:'active', listing_type:layer === 'needs' ? 'request' : 'offer' }
    : layer === 'initiatives' ? { status:'active', mission_type:{ $in:['platform','region'] } }
    : { audience:'members', category:layer === 'initiativeUpdates' ? 'projects' : 'impact', is_demo:{ $ne:true } };
  const fields = listings ? ['title','description','region','skills','skills_required'] : layer === 'initiatives' ? ['title','objective','description'] : ['headline','description','country'];
  if (search) scope.$or = fields.map(field => ({ [field]: { $regex:escapeRegex(search), $options:'i' } }));
  return useInfiniteQuery({ queryKey:['collaboration-radar',userId,layer,search], enabled:!!userId && !demo, initialPageParam:undefined,
    queryFn: async ({ pageParam }) => {
      const page = await entity.filter(scope, { limit:20, sort:'-created_date', cursor:pageParam });
      return { ...page, items:page.items.map(listings ? listing : layer === 'initiatives' ? row => ({ id:row.id, title:row.title, description:row.objective || row.description, terms:[], path:`/MissionDetail?id=${encodeURIComponent(row.id)}` }) : event) };
    }, getNextPageParam:page => page.has_more ? page.next_cursor : undefined });
}