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
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Check, Upload, Link, Image, AlertCircle } from 'lucide-react';

const STEPS = [
  { id: 'basics', label: 'Basics' },
  { id: 'details', label: 'Details' },
  { id: 'media', label: 'Image' }
];

export default function CreateListingModal({ open, onOpenChange, onCreate }) {
  const [step, setStep] = React.useState(0);
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
  const [errors, setErrors] = React.useState({});
  const [uploading, setUploading] = React.useState(false);
  const [localFile, setLocalFile] = React.useState(null);
  const [imageMode, setImageMode] = React.useState('upload'); // 'upload' or 'url'

  React.useEffect(() => {
    if (!open) {
      setStep(0);
      setErrors({});
      setLocalFile(null);
      setImageMode('upload');
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

  const validateStep = (stepIndex) => {
    const newErrors = {};
    
    if (stepIndex === 0) {
      if (!form.title.trim()) {
        newErrors.title = 'Title is required';
      } else if (form.title.trim().length < 5) {
        newErrors.title = 'Title must be at least 5 characters';
      }
    }
    
    if (stepIndex === 1) {
      if (!form.is_free && (!form.price_amount || parseFloat(form.price_amount) <= 0)) {
        newErrors.price_amount = 'Enter a price or mark as free';
      }
      if (!form.description.trim()) {
        newErrors.description = 'Description is required';
      } else if (form.description.trim().length < 20) {
        newErrors.description = 'Description must be at least 20 characters';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = () => {
    if (validateStep(step)) {
      onCreate?.(form);
    }
  };

  const handleFileUpload = async () => {
    if (!localFile) return;
    setUploading(true);
    try {
      const res = await base44.integrations.Core.UploadFile({ file: localFile });
      const url = res?.file_url;
      if (url) {
        setForm({ ...form, image_url: url });
        setLocalFile(null);
      }
    } catch (e) {
      console.error('Upload failed', e);
    }
    setUploading(false);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {STEPS.map((s, i) => (
        <React.Fragment key={s.id}>
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
              i < step ? "bg-emerald-500 text-white" :
              i === step ? "bg-violet-600 text-white" :
              "bg-slate-100 text-slate-400"
            )}>
              {i < step ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={cn(
              "text-sm hidden sm:inline",
              i === step ? "text-slate-900 font-medium" : "text-slate-400"
            )}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={cn(
              "w-8 h-0.5",
              i < step ? "bg-emerald-500" : "bg-slate-200"
            )} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderError = (field) => {
    if (!errors[field]) return null;
    return (
      <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
        <AlertCircle className="w-3 h-3" />
        {errors[field]}
      </div>
    );
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <Label className={errors.title ? 'text-red-600' : ''}>
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                className={cn("mt-2", errors.title && "border-red-300 focus:border-red-500")}
                placeholder="e.g., 1:1 Mentorship Session"
                value={form.title}
                onChange={(e) => {
                  setForm({ ...form, title: e.target.value });
                  if (errors.title) setErrors({ ...errors, title: null });
                }}
              />
              {renderError('title')}
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
                <p className="text-xs text-slate-500 mt-1">
                  {form.listing_type === 'offer' ? 'You\'re offering a service' : 'You\'re looking for help'}
                </p>
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
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 items-start">
              <div>
                <Label className={errors.price_amount ? 'text-red-600' : ''}>Price ($)</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  className={cn("mt-2", errors.price_amount && "border-red-300")}
                  placeholder="0"
                  value={form.price_amount}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^\d*\.?\d*$/.test(val)) {
                      setForm({ ...form, price_amount: val });
                      if (errors.price_amount) setErrors({ ...errors, price_amount: null });
                    }
                  }}
                  disabled={form.is_free}
                />
                {renderError('price_amount')}
              </div>
              <div className="flex items-center gap-2 mt-8">
                <Checkbox 
                  id="free" 
                  checked={form.is_free} 
                  onCheckedChange={(v) => {
                    setForm({ ...form, is_free: Boolean(v) });
                    if (v) setErrors({ ...errors, price_amount: null });
                  }} 
                />
                <label htmlFor="free" className="text-sm text-slate-700">Offer for free</label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Duration (minutes)</Label>
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
              <Label className={errors.description ? 'text-red-600' : ''}>
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                className={cn("mt-2 min-h-24", errors.description && "border-red-300")}
                placeholder="Describe what you're offering or looking for. Be specific about what's included, your experience, and what participants can expect."
                value={form.description}
                onChange={(e) => {
                  setForm({ ...form, description: e.target.value });
                  if (errors.description) setErrors({ ...errors, description: null });
                }}
              />
              <div className="flex justify-between mt-1">
                {renderError('description')}
                <span className="text-xs text-slate-400 ml-auto">
                  {form.description.length} characters
                </span>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label>Cover Image (optional)</Label>
              <p className="text-xs text-slate-500 mt-1 mb-3">
                Add an image to make your listing stand out
              </p>
              
              {/* Image preview */}
              {form.image_url && (
                <div className="relative rounded-lg border p-2 bg-slate-50 mb-4">
                  <img src={form.image_url} alt="Cover" className="w-full h-40 object-cover rounded" />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute top-3 right-3 bg-white/80 hover:bg-white"
                    onClick={() => setForm({ ...form, image_url: '' })}
                  >
                    Remove
                  </Button>
                </div>
              )}

              {/* Mode toggle */}
              {!form.image_url && (
                <>
                  <div className="flex gap-2 mb-4">
                    <Button
                      type="button"
                      variant={imageMode === 'upload' ? 'default' : 'outline'}
                      size="sm"
                      className={cn("flex-1 gap-2", imageMode === 'upload' && "bg-violet-600 hover:bg-violet-700")}
                      onClick={() => setImageMode('upload')}
                    >
                      <Upload className="w-4 h-4" />
                      Upload Image
                    </Button>
                    <Button
                      type="button"
                      variant={imageMode === 'url' ? 'default' : 'outline'}
                      size="sm"
                      className={cn("flex-1 gap-2", imageMode === 'url' && "bg-violet-600 hover:bg-violet-700")}
                      onClick={() => setImageMode('url')}
                    >
                      <Link className="w-4 h-4" />
                      Paste URL
                    </Button>
                  </div>

                  {imageMode === 'upload' ? (
                    <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
                      <Image className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <Input 
                        type="file" 
                        accept="image/*" 
                        className="mb-3"
                        onChange={(e) => setLocalFile(e.target.files?.[0] || null)} 
                      />
                      {localFile && (
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-sm text-slate-600">{localFile.name}</span>
                          <Button 
                            type="button" 
                            size="sm"
                            disabled={uploading} 
                            onClick={handleFileUpload}
                            className="bg-violet-600 hover:bg-violet-700"
                          >
                            {uploading ? 'Uploading…' : 'Upload'}
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <Input 
                        placeholder="https://example.com/image.jpg" 
                        value={form.image_url} 
                        onChange={(e) => setForm({ ...form, image_url: e.target.value })} 
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Paste a direct link to an image (JPG, PNG, WebP)
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Listing</DialogTitle>
        </DialogHeader>
        
        {renderStepIndicator()}
        
        <div className="min-h-[280px]">
          {renderStep()}
        </div>

        <div className="flex justify-between gap-2 pt-4 border-t">
          <div>
            {step > 0 && (
              <Button variant="ghost" onClick={handleBack}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            {step < STEPS.length - 1 ? (
              <Button className="bg-violet-600 hover:bg-violet-700" onClick={handleNext}>
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button 
                className="bg-violet-600 hover:bg-violet-700" 
                onClick={handleSubmit}
              >
                Create Listing
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}