import { ownerFilter, titlePattern } from '@/components/vault/vault';
import { visibility } from '@/components/wisdom/wisdomCards';

const path = (base, id) => `${base}${encodeURIComponent(id)}`;
const reference = row => ({ title: row.title, description: row.note,
  detail: `${({ saved: 'Saved item', research: 'Research card', plan: 'Plan draft' })[row.kind]} · ${row.references?.length ?? 0} linked`,
  route: path(({ saved: '/SavedItems?id=', research: '/SavedItems?tab=research&id=', plan: '/Planner?draft=' })[row.kind], row.id) });

export const knowledgeSources = [
  { id:'files', label:'My Files', entity:'UserFile', key:user=>['userFiles',user.email], fields:['file_name','description','tags'], scope:user=>({$and:[{user_id:user.email},ownerFilter(user)]}),
    row:r=>({title:r.file_name,description:r.description,detail:r.file_uri ? 'Private file' : r.mime_type,url:r.file_url,uri:r.file_uri}) },
  { id:'vault', label:'Document Vault', entity:'HubDocument', key:()=>['vault'], fields:['title','description','tags','folder','project_name'], scope:user=>({$or:[{project_id:{$exists:false}},{project_id:{$in:[null,'']}},ownerFilter(user)]}), route:'/DocumentVault',
    row:r=>({title:r.title,description:r.description,detail:[r.folder || 'Other',r.project_name].filter(Boolean).join(' · '),url:r.file_url}) },
  { id:'studies', label:'Investigations', entity:'IntelligenceStudy', key:user=>['intelligence-library',user.id], fields:['objective','summary'], scope:user=>({created_by_id:user.id}), route:'/Intelligence',
    row:r=>({title:r.objective,description:r.summary,route:path('/Intelligence?study=',r.id),studyId:r.id}) },
  { id:'references', label:'Saved Work', entity:'WorkspaceReference', fields:['title','note','references.title'], scope:user=>({created_by_id:user.id,kind:{$in:['saved','research','plan']}}), route:'/SavedItems', row:reference },
  { id:'wisdom', label:'Wisdom Cards', entity:'WisdomCard', key:()=>['wisdom-cards'], fields:['title','insight','category','tags'], scope:visibility, route:'/WisdomExchange',
    row:r=>({title:r.title,description:r.insight,detail:[r.category,r.status].filter(Boolean).join(' · '),route:path('/WisdomExchange?card=',r.id)}) },
  { id:'resources', label:'Resource Hub', entity:'Resource', key:()=>['resources'], fields:['title','description','categories','tags'], scope:()=>({status:'approved'}), route:'/ResourceHub',
    row:r=>({title:r.title,description:r.description,detail:r.type?.replaceAll('_',' '),url:r.content_url,route:path('/ResourceHub#resource-',r.id)}) },
];

export function knowledgeFilter(source, user, search) {
  const scope = source.scope(user);
  if (!search) return scope;
  return { $and:[scope,{ $or:source.fields.map(field=>({[field]:titlePattern(search)})) }] };
}