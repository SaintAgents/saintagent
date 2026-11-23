import { useEffect, useRef, useState } from 'react';

export default function useAssistantVoice(open, voiceName, messages) {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const synth = window.speechSynthesis;
  const session = useRef(null);
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [voiceTurn, setVoiceTurn] = useState(null);
  const [voices, setVoices] = useState(() => synth?.getVoices() || []);
  useEffect(() => {
    const update = () => setVoices(synth.getVoices());
    synth?.addEventListener('voiceschanged', update);
    return () => synth?.removeEventListener('voiceschanged', update);
  }, [synth]);
  useEffect(() => {
    if (open) return () => { session.current?.abort(); synth?.cancel(); };
  }, [open, synth]);
  function speak(text) {
    if (!synth || !text) return;
    synth.cancel();
    const reply = new SpeechSynthesisUtterance(text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*`#]/g, ''));
    reply.voice = voices.find(voice => voice.name === voiceName) || null;
    synth.speak(reply);
  }
  const index = messages.findLastIndex(message => message.role === 'assistant' && !message.hidden && typeof message.content === 'string' && message.content.trim());
  const latest = messages[index]?.content;
  useEffect(() => {
    if (!open || listening || voiceTurn === null || index < voiceTurn || !latest) return;
    const timer = setTimeout(() => { speak(latest); setVoiceTurn(null); }, 1800);
    return () => clearTimeout(timer);
  }, [open, listening, voiceTurn, index, latest, voiceName]);
  function listen(onText) {
    if (!Recognition) return;
    if (session.current) { session.current.stop(); return; }
    synth?.cancel(); setVoiceError('');
    const recognition = new Recognition();
    session.current = recognition;
    recognition.onend = () => { session.current = null; setListening(false); };
    recognition.onerror = event => { if (event.error !== 'aborted') setVoiceError('Could not listen. Check microphone access or type your message.'); };
    recognition.onresult = event => onText(event.results[0]?.[0]?.transcript || '');
    try { recognition.start(); setListening(true); }
    catch { session.current = null; setVoiceError('Could not start the microphone.'); }
  }
  return { canListen: !!Recognition, canSpeak: !!synth, listening, voiceError, voices, listen, speak, stop: () => { setVoiceTurn(null); synth?.cancel(); }, setVoiceTurn };
}