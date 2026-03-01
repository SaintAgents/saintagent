import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, CheckCircle2, Clock, AlertCircle, User, FileText, 
  Camera, Fingerprint, Globe, Lock, ExternalLink, RefreshCw
} from 'lucide-react';

export default function KYCVerification({ walletConnected, walletAddress, theme = 'lime' }) {
  const [kycStatus, setKycStatus] = useState('not_started'); // not_started, pending, verified, rejected
  const [verificationStep, setVerificationStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const steps = [
    { id: 1, title: 'Personal Information', icon: User, description: 'Basic identity details' },
    { id: 2, title: 'Document Upload', icon: FileText, description: 'Government-issued ID' },
    { id: 3, title: 'Selfie Verification', icon: Camera, description: 'Liveness check' },
    { id: 4, title: 'Review', icon: Shield, description: 'Final verification' },
  ];

  const handleStartKYC = async () => {
    if (!walletConnected) {
      return;
    }
    
    setIsLoading(true);
    
    // Simulate iDenfy redirect flow
    // In production, this would call the backend to generate an iDenfy token
    // and redirect to their verification page
    setTimeout(() => {
      setKycStatus('pending');
      setVerificationStep(1);
      setIsLoading(false);
    }, 1500);
  };

  const simulateStepComplete = () => {
    if (verificationStep < 4) {
      setVerificationStep(verificationStep + 1);
    } else {
      setKycStatus('verified');
    }
  };

  const getStatusBadge = () => {
    switch (kycStatus) {
      case 'verified':
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
            <Clock className="w-3 h-3 mr-1" />
            Pending Review
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
            <AlertCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/50">
            <Shield className="w-3 h-3 mr-1" />
            Not Verified
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card className={`bg-black/60 border-${theme}-500/20 backdrop-blur-xl`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-${theme}-500/20`}>
                <Fingerprint className={`w-6 h-6 text-${theme}-400`} />
              </div>
              <div>
                <CardTitle className="text-white text-lg">KYC Verification</CardTitle>
                <p className="text-xs text-gray-400 mt-0.5">Powered by iDenfy</p>
              </div>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-black/40 rounded-lg p-3 border border-gray-800">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                <Globe className="w-3 h-3" />
                Supported Countries
              </div>
              <div className="text-white font-medium">190+</div>
            </div>
            <div className="bg-black/40 rounded-lg p-3 border border-gray-800">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                <FileText className="w-3 h-3" />
                Document Types
              </div>
              <div className="text-white font-medium">3000+</div>
            </div>
            <div className="bg-black/40 rounded-lg p-3 border border-gray-800">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                <Lock className="w-3 h-3" />
                Data Protection
              </div>
              <div className="text-white font-medium">GDPR Compliant</div>
            </div>
          </div>

          {!walletConnected ? (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center">
              <AlertCircle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-yellow-400 text-sm font-medium">Wallet Required</p>
              <p className="text-gray-400 text-xs mt-1">Connect your wallet to start KYC verification</p>
            </div>
          ) : kycStatus === 'not_started' ? (
            <div className="space-y-4">
              <div className="bg-black/40 rounded-lg p-4 border border-gray-800">
                <h4 className="text-white font-medium mb-3">Why verify?</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 text-${theme}-400`} />
                    Access higher trading limits
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 text-${theme}-400`} />
                    Unlock fiat on/off ramps
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 text-${theme}-400`} />
                    Enhanced account security
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 text-${theme}-400`} />
                    Regulatory compliance
                  </li>
                </ul>
              </div>
              
              <Button 
                onClick={handleStartKYC}
                disabled={isLoading}
                className={`w-full bg-${theme}-500 hover:bg-${theme}-600 text-black font-medium h-12`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Start Verification
                  </>
                )}
              </Button>
              
              <p className="text-xs text-gray-500 text-center">
                By proceeding, you agree to share your identity documents with iDenfy for verification purposes.
              </p>
            </div>
          ) : kycStatus === 'pending' ? (
            <div className="space-y-4">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-6">
                {steps.map((step, idx) => (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        verificationStep > idx 
                          ? `bg-${theme}-500 border-${theme}-500` 
                          : verificationStep === idx + 1
                            ? `border-${theme}-500 bg-${theme}-500/20`
                            : 'border-gray-700 bg-black/40'
                      }`}>
                        {verificationStep > idx ? (
                          <CheckCircle2 className="w-5 h-5 text-black" />
                        ) : (
                          <step.icon className={`w-5 h-5 ${verificationStep === idx + 1 ? `text-${theme}-400` : 'text-gray-500'}`} />
                        )}
                      </div>
                      <span className={`text-xs mt-1 ${verificationStep >= idx + 1 ? 'text-white' : 'text-gray-500'}`}>
                        {step.title}
                      </span>
                    </div>
                    {idx < steps.length - 1 && (
                      <div className={`w-12 h-0.5 mx-2 ${verificationStep > idx + 1 ? `bg-${theme}-500` : 'bg-gray-700'}`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Current Step Card */}
              <Card className="bg-black/40 border-gray-800">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 rounded-full bg-${theme}-500/20 flex items-center justify-center mx-auto mb-4`}>
                    {React.createElement(steps[verificationStep - 1]?.icon || Shield, {
                      className: `w-8 h-8 text-${theme}-400`
                    })}
                  </div>
                  <h3 className="text-white font-medium text-lg mb-2">
                    {steps[verificationStep - 1]?.title || 'Processing'}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {steps[verificationStep - 1]?.description || 'Please wait...'}
                  </p>
                  
                  {/* Demo: Simulate step completion */}
                  <Button 
                    onClick={simulateStepComplete}
                    className={`bg-${theme}-500 hover:bg-${theme}-600 text-black`}
                  >
                    {verificationStep < 4 ? 'Continue' : 'Complete Verification'}
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                  
                  <p className="text-xs text-gray-500 mt-4">
                    In production, you would be redirected to iDenfy's secure verification portal.
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : kycStatus === 'verified' ? (
            <div className="text-center py-8">
              <div className={`w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4`}>
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-white font-medium text-xl mb-2">Verification Complete</h3>
              <p className="text-gray-400 text-sm mb-4">
                Your identity has been verified. You now have access to all platform features.
              </p>
              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                <div className="bg-black/40 rounded-lg p-3 border border-green-500/20">
                  <div className="text-green-400 font-medium">$100,000</div>
                  <div className="text-xs text-gray-500">Daily Limit</div>
                </div>
                <div className="bg-black/40 rounded-lg p-3 border border-green-500/20">
                  <div className="text-green-400 font-medium">Tier 3</div>
                  <div className="text-xs text-gray-500">Account Level</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-red-400" />
              </div>
              <h3 className="text-white font-medium text-xl mb-2">Verification Failed</h3>
              <p className="text-gray-400 text-sm mb-4">
                We couldn't verify your identity. Please try again or contact support.
              </p>
              <Button 
                onClick={() => {
                  setKycStatus('not_started');
                  setVerificationStep(0);
                }}
                className={`bg-${theme}-500 hover:bg-${theme}-600 text-black`}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-black/40 border-gray-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Lock className={`w-5 h-5 text-${theme}-400 mt-0.5`} />
            <div>
              <h4 className="text-white font-medium text-sm">Your data is secure</h4>
              <p className="text-gray-400 text-xs mt-1">
                All verification data is encrypted and processed by iDenfy, a certified identity verification provider. 
                We never store your documents on our servers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}