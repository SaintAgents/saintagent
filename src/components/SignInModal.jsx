import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";

export default function SignInModal({ open, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = (e) => {
    e.preventDefault();
    // Redirect to Base44 auth with return URL
    window.location.href = '/api/auth/login?next=' + encodeURIComponent(window.location.href);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-violet-600" />
            Sign In to SaintAgent
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSignIn} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11"
              required
            />
          </div>
          <Button 
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
          >
            Sign In
          </Button>
          <div className="text-center">
            <button
              type="button"
              onClick={() => window.location.href = '/api/auth/login?next=' + encodeURIComponent(window.location.href)}
              className="text-sm text-violet-600 hover:text-violet-700"
            >
              Don't have an account? Sign Up
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}