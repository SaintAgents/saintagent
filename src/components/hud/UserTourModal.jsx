import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Rocket, Lightbulb, Shield, Users, Globe } from "lucide-react";

export default function UserTourModal({ open, onClose }) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <Rocket className="w-12 h-12 text-violet-600 mx-auto mb-2" />
          <DialogTitle className="text-2xl font-bold">Welcome to SaintAgent!</DialogTitle>
          <DialogDescription className="text-slate-600">
            Let's quickly explore some key areas of your platform.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-emerald-500 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-slate-800">Command Deck</h3>
              <p className="text-sm text-slate-600">Your personalized dashboard for all activities and insights.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Users className="w-6 h-6 text-blue-500 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-slate-800">Community</h3>
              <p className="text-sm text-slate-600">Connect with other users, join circles, and participate in missions.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Globe className="w-6 h-6 text-amber-500 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-slate-800">Marketplace</h3>
              <p className="text-sm text-slate-600">Offer your services or find what you need from others.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Lightbulb className="w-6 h-6 text-purple-500 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-slate-800">Synchronicity Engine</h3>
              <p className="text-sm text-slate-600">Our AI-powered engine helps you find relevant matches and opportunities.</p>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Button 
            type="button"
            onClick={() => onClose()} 
            className="w-full bg-violet-600 hover:bg-violet-700 relative z-50 pointer-events-auto"
          >
            Got it! Let's Go
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}