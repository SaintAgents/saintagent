import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FileText, 
  ShoppingBag, 
  Calendar, 
  Target, 
  MessageCircle, 
  Video,
  X,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CREATE_OPTIONS = [
  { id: 'post', label: 'Post', icon: FileText, color: 'bg-blue-500', description: 'Share an insight or update' },
  { id: 'offer', label: 'Offer', icon: ShoppingBag, color: 'bg-emerald-500', description: 'Sell your skills or services' },
  { id: 'event', label: 'Event', icon: Calendar, color: 'bg-violet-500', description: 'Host a gathering or workshop' },
  { id: 'mission', label: 'Mission', icon: Target, color: 'bg-amber-500', description: 'Launch a collaborative mission' },
  { id: 'message', label: 'Message', icon: MessageCircle, color: 'bg-pink-500', description: 'Start a conversation' },
  { id: 'meeting', label: 'Meeting', icon: Video, color: 'bg-indigo-500', description: 'Request a 1:1 meeting' },
];

export default function QuickCreateModal({ open, onClose, onCreate, initialType }) {
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({});

  React.useEffect(() => {
    if (open) {
      setSelectedType(initialType || null);
    }
  }, [open, initialType]);

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setFormData({});
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!selectedType) return;
    onCreate?.(selectedType, formData);
    handleClose();
  };

  const handleClose = () => {
    setSelectedType(null);
    setFormData({});
    onClose();
  };

  const renderForm = () => {
    switch (selectedType) {
      case 'post':
        return (
          <div className="space-y-4">
            <div>
              <Label>What's on your mind?</Label>
              <Textarea 
                placeholder="Share an insight, teaching, or update..."
                className="mt-2 min-h-32"
                value={formData.content || ''}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </div>
            <div>
              <Label>Visibility</Label>
              <Select 
                value={formData.visibility || 'public'} 
                onValueChange={(v) => setFormData({ ...formData, visibility: v })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="followers">Followers Only</SelectItem>
                  <SelectItem value="circle">Circle Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 'offer':
        return (
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input 
                placeholder="e.g., 1-on-1 Mentorship Session"
                className="mt-2"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select 
                value={formData.category || ''} 
                onValueChange={(v) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mentorship">Mentorship</SelectItem>
                  <SelectItem value="session">Session</SelectItem>
                  <SelectItem value="course">Course</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                  <SelectItem value="healing">Healing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price ($)</Label>
                <Input 
                  type="number"
                  placeholder="0 for free"
                  className="mt-2"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div>
                <Label>Duration (min)</Label>
                <Input 
                  type="number"
                  placeholder="60"
                  className="mt-2"
                  value={formData.duration || ''}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </div>
            </div>
          </div>
        );
      case 'meeting':
        return (
          <div className="space-y-4">
            <div>
              <Label>Meeting Title</Label>
              <Input 
                placeholder="e.g., Quick sync about project"
                className="mt-2"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <Label>With (email or username)</Label>
              <Input 
                placeholder="Enter their email or @handle"
                className="mt-2"
                value={formData.recipient || ''}
                onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select 
                value={formData.type || 'casual'} 
                onValueChange={(v) => setFormData({ ...formData, type: v })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual">Casual Chat</SelectItem>
                  <SelectItem value="collaboration">Collaboration</SelectItem>
                  <SelectItem value="mentorship">Mentorship</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {!selectedType ? (
            <motion.div
              key="select"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <DialogHeader className="p-6 pb-2">
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-500" />
                  Quick Create
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3 p-6 pt-4">
                {CREATE_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleTypeSelect(option.id)}
                    className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 hover:border-violet-300 hover:bg-violet-50/50 transition-all text-left group"
                  >
                    <div className={cn("p-2.5 rounded-xl text-white", option.color)}>
                      <option.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 group-hover:text-violet-900">
                        {option.label}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {option.description}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-violet-500 mt-1 transition-colors" />
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <DialogHeader className="p-6 pb-2">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => setSelectedType(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <DialogTitle>
                    Create {CREATE_OPTIONS.find(o => o.id === selectedType)?.label}
                  </DialogTitle>
                </div>
              </DialogHeader>
              <div className="px-6 pb-2">
                {renderForm()}
              </div>
              <div className="flex justify-end gap-3 p-6 pt-4 border-t border-slate-100 mt-4">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button 
                  className="bg-violet-600 hover:bg-violet-700"
                  onClick={handleSubmit}
                >
                  Create
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}