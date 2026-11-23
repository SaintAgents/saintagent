import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WorkspaceReferenceList from '@/components/watch/WorkspaceReferenceList';

export default function SavedItems() {
  const { user } = useAuth();
  const [params,setParams] = useSearchParams();
  const tab = params.get('tab') === 'research' ? 'research' : 'saved';
  const researchId = tab === 'research' ? params.get('id') : null;
  return <section className="mx-auto max-w-5xl space-y-4 px-4 py-6 pb-24 text-foreground">
    <h1 className="text-2xl font-bold">{tab === 'research' ? 'My Research' : 'Saved Items'}</h1>
    <Tabs value={tab} onValueChange={value => setParams(value === 'research' ? {tab:value} : {})}><TabsList><TabsTrigger value="saved">Saved Items</TabsTrigger><TabsTrigger value="research">My Research</TabsTrigger></TabsList>
      <TabsContent value="saved"><WorkspaceReferenceList owner={user.id} kind="saved" /></TabsContent><TabsContent value="research">{researchId && <button type="button" className="mb-3 text-sm underline" onClick={() => setParams({tab:'research'})}>All research cards</button>}<WorkspaceReferenceList owner={user.id} kind="research" recordId={researchId} /></TabsContent>
    </Tabs>
  </section>;
}