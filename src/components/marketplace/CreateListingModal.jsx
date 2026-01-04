import React from 'react';
import { base44 } from '@/api/base44Client';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function CreateListingModal({ open, onOpenChange, onCreate }) {
  const [form, setForm] = React.useState({
    title: '',
    listing_type: 'offer',
    category: 'session',
    price_amount: '',
    is_free: false,
    duration_minutes: 60,
    delivery_mode: 'online',
    description: '',
    image_url: ''
  });
  const [uploading, setUploading] = React.useState(false);
  const [localFile, setLocalFile] = React.useState(null);

  React.useEffect(() => {
    if (!open) {
      setForm({
        title: '',
        listing_type: 'offer',
        category: 'session',
        price_amount: '',
        is_free: false,
        duration_minutes: 60,
        delivery_mode: 'online',
        description: '',
        image_url: ''
      });
    }
  }, [open]);

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    onCreate?.(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Listing</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              className="mt-2"
              placeholder="e.g., 1:1 Mentorship Session"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Type</Label>
              <Select value={form.listing_type} onValueChange={(v) => setForm({ ...form, listing_type: v })}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="request">Request</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mentorship">Mentorship</SelectItem>
                  <SelectItem value="session">Session</SelectItem>
                  <SelectItem value="course">Course</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                  <SelectItem value="healing">Healing</SelectItem>
                  <SelectItem value="mutual_aid">Mutual Aid</SelectItem>
                  <SelectItem value="collaboration">Collaboration</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <Label>Price ($)</Label>
              <Input
                type="text"
                inputMode="decimal"
                className="mt-2"
                placeholder="0"
                value={form.price_amount}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || /^\d*\.?\d*$/.test(val)) {
                    setForm({ ...form, price_amount: val });
                  }
                }}
                disabled={form.is_free}
              />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <Checkbox id="free" checked={form.is_free} onCheckedChange={(v) => setForm({ ...form, is_free: Boolean(v) })} />
              <label htmlFor="free" className="text-sm text-slate-700">Free</label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Duration (min)</Label>
              <Input
                type="number"
                className="mt-2"
                placeholder="60"
                value={form.duration_minutes}
                onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
              />
            </div>
            <div>
              <Label>Delivery</Label>
              <Select value={form.delivery_mode} onValueChange={(v) => setForm({ ...form, delivery_mode: v })}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="in-person">In-person</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              className="mt-2 min-h-24"
              placeholder="Describe your offer or request..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div>
            <Label>Cover Image</Label>
            <div className="mt-2 grid grid-cols-1 gap-3">
              {form.image_url && (
                <div className="rounded-lg border p-2 bg-slate-50">
                  <img src={form.image_url} alt="Cover" className="w-full h-40 object-cover rounded" />
                </div>
              )}
              <div className="flex items-center gap-2">
                <Input type="file" accept="image/*" onChange={(e) => setLocalFile(e.target.files?.[0] || null)} />
                <Button type="button" variant="outline" disabled={!localFile || uploading} onClick={async () => {
                  if (!localFile) return;
                  setUploading(true);
                  const res = await base44.integrations.Core.UploadFile({ file: localFile });
                  const url = res?.file_url;
                  if (url) setForm({ ...form, image_url: url });
                  setUploading(false);
                }}>
                  {uploading ? 'Uploading…' : 'Upload'}
                </Button>
              </div>
              <div>
                <Label className="text-xs text-slate-500">Or paste image URL</Label>
                <Input className="mt-1" placeholder="https://..." value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button className="bg-violet-600 hover:bg-violet-700" onClick={handleSubmit} disabled={!form.title.trim()}>Create</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}