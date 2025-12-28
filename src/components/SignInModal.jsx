import React from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function SignInModal({ open, onClose }) {
  const handleSignIn = () => {
    base44.auth.redirectToLogin();
  };

  const handleSignUp = () => {
    base44.auth.redirectToLogin();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-violet-600" />
            Welcome to SaintAgent
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <p className="text-sm text-slate-600 text-center">
            Sign in to access your account and continue your journey.
          </p>
          <Button 
            onClick={handleSignIn}
            className="w-full h-11 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
          >
            Sign In
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">Or</span>
            </div>
          </div>
          <Button 
            onClick={handleSignUp}
            variant="outline"
            className="w-full h-11 border-2 border-violet-600 text-violet-600 hover:bg-violet-50"
          >
            Create New Account
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}