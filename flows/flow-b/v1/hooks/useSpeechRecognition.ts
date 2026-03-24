import { useState, useEffect, useRef, useCallback } from 'react';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import { useSpeechRecognitionEvent } from 'expo-speech-recognition';

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
  const lastFinalRef = useRef('');
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    if (!active) {
      setInterimTranscript('');
      ExpoSpeechRecognitionModule.stop();
      return;
    }

    ExpoSpeechRecognitionModule.start({
      lang: 'en-GB',
      interimResults: true,
      continuous: true,
    });

    return () => {
      ExpoSpeechRecognitionModule.stop();
    };
  }, [active]);

  useSpeechRecognitionEvent('result', (event) => {
    const result = event.results[0];
    if (!result) return;

    if (event.isFinal) {
      const finalText = result.transcript;
      if (finalText && finalText !== lastFinalRef.current) {
        lastFinalRef.current = finalText;
        setTranscript(finalText);
        setMessageCount(c => c + 1);
      }
      setInterimTranscript('');
    } else {
      setInterimTranscript(result.transcript);
    }
  });

  // Auto-restart when recognition ends while still active
  useSpeechRecognitionEvent('end', () => {
    if (activeRef.current) {
      ExpoSpeechRecognitionModule.start({
        lang: 'en-GB',
        interimResults: true,
        continuous: true,
      });
    }
  });

  const reset = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setMessageCount(0);
    lastFinalRef.current = '';
  }, []);

  return { transcript, interimTranscript, messageCount, reset };
}
