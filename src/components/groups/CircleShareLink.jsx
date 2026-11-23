import React, { useState } from 'react';
import { Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { shareUrl } from '@/components/publicprofile/publicLinks';

export default function CircleShareLink({ circleId, section, postId, label = 'Copy Circle link' }) {
  const [manual, setManual] = useState(false);
  const params = new URLSearchParams({ group: circleId });
  if (section) params.set('tab', section);
  if (postId) params.set('post', postId);
  const url = shareUrl(`/Circles?${params}`);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied');
    } catch {
      setManual(true);
    }
  }

  return <>
    <Button type="button" variant="outline" size="sm" className="shrink-0 gap-2" onClick={copy}><Link2 aria-hidden="true" />{label}</Button>
    <Dialog open={manual} onOpenChange={setManual}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
          <DialogDescription>Select and copy this link. Sharing it doesn’t grant access.</DialogDescription>
        </DialogHeader>
        <Input aria-label="Shareable link" readOnly value={url} onFocus={(event) => event.target.select()} />
      </DialogContent>
    </Dialog>
  </>;
}