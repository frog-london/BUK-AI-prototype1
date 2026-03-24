import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechRecognitionResult {
  transcript: string;
  interimTranscript: string;
  messageCount: number;
  reset: () => void;
}

export function useSpeechRecognition(active: boolean): SpeechRecognitionResult {
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [messageCount, setMessageCount] = useState(0);
  const recognitionRef = useRef<any>(null);
  const lastFinalRef = useRef('');

  useEffect(() => {
    if (!active) {
      // Stop recognition but preserve transcript/messageCount so UI stays intact
      setInterimTranscript('');
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-GB';

    recognition.onresult = (event: any) => {
      let latestFinal = '';
      let interim = '';

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          latestFinal = result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (latestFinal && latestFinal !== lastFinalRef.current) {
        lastFinalRef.current = latestFinal;
        setTranscript(latestFinal);
        setMessageCount(c => c + 1);
      }
      setInterimTranscript(interim);
    };

    recognition.onend = () => {
      if (recognitionRef.current) {
        try { recognition.start(); } catch {}
      }
    };

    recognition.onerror = () => {};

    try { recognition.start(); } catch {}

    return () => {
      recognitionRef.current = null;
      try { recognition.stop(); } catch {}
    };
  }, [active]);

  const reset = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setMessageCount(0);
    lastFinalRef.current = '';
  }, []);

  return { transcript, interimTranscript, messageCount, reset };
}
