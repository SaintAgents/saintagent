import { useSearchParams } from 'react-router-dom';
import LinkTreeEditorPanel from '@/components/publicprofile/LinkTreeEditorPanel';

export default function LinkTreeEditor() {
  const [params] = useSearchParams();
  return <LinkTreeEditorPanel businessId={params.get('p') || ''} />;
}