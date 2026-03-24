import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

const POLL_MS = 100;
const CALIBRATION_SAMPLES = 5;
const HEADROOM = 0;    // react immediately above ambient level
const RANGE = 0.08;    // RMS range from floor to max scale
const SCALE_MIN = 1.0;
const SCALE_MAX = 2.0;

function computeRMS(data: Uint8Array): number {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    const normalized = (data[i] - 128) / 128; // center around 0
    sum += normalized * normalized;
  }
  return Math.sqrt(sum / data.length);
}

export function useVoiceAmplitude(active: boolean) {
  const scale = useRef(new Animated.Value(SCALE_MIN)).current;
  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;
    const calibrationBuffer: number[] = [];
    let noiseFloor: number | null = null;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;

        const ctx = new AudioContext();
        ctxRef.current = ctx;

        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.fftSize);

        intervalRef.current = setInterval(() => {
          if (cancelled) return;

          analyser.getByteTimeDomainData(dataArray);
          const rms = computeRMS(dataArray);

          // Calibration phase: collect ambient RMS samples
          if (noiseFloor === null) {
            calibrationBuffer.push(rms);
            if (calibrationBuffer.length < CALIBRATION_SAMPLES) return;
            const avg = calibrationBuffer.reduce((a, b) => a + b, 0) / calibrationBuffer.length;
            noiseFloor = avg + HEADROOM;
            return;
          }

          const floor = noiseFloor;
          const ceil = floor + RANGE;
          const clamped = Math.max(floor, Math.min(ceil, rms));
          const normalized = (clamped - floor) / (ceil - floor);
          const targetScale = SCALE_MIN + normalized * (SCALE_MAX - SCALE_MIN);

          Animated.timing(scale, {
            toValue: targetScale,
            duration: POLL_MS,
            useNativeDriver: false,
          }).start();
        }, POLL_MS);
      } catch {}
    }

    start();

    return () => {
      cancelled = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (ctxRef.current) {
        ctxRef.current.close().catch(() => {});
        ctxRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      Animated.timing(scale, {
        toValue: SCALE_MIN,
        duration: 300,
        useNativeDriver: false,
      }).start();
    };
  }, [active]);

  return scale;
}
