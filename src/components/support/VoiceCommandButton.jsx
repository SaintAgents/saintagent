import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const SpeechRecognition = typeof window !== 'undefined' 
  ? (window.SpeechRecognition || window.webkitSpeechRecognition) 
  : null;

export default function VoiceCommandButton({ onTranscript, disabled, className }) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    setSupported(!!SpeechRecognition);
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  const toggleListening = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript.trim()) {
        onTranscript(transcript.trim());
      }
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  if (!supported) return null;

  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      onClick={toggleListening}
      disabled={disabled}
      className={cn(
        "shrink-0 rounded-xl transition-all",
        listening 
          ? "bg-red-100 text-red-600 hover:bg-red-200 animate-pulse ring-2 ring-red-300" 
          : "text-slate-400 hover:text-slate-600 hover:bg-slate-100",
        className
      )}
      title={listening ? "Stop listening" : "Voice command"}
    >
      {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
    </Button>
  );
}