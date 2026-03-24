import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { Audio } from 'expo-av';

const POLL_MS = 100;
const CALIBRATION_SAMPLES = 5;
const FLAT_CHECK_SAMPLES = 5;
const HEADROOM = 2;
const RANGE = 25;
const SCALE_MIN = 1.0;
const SCALE_MAX = 2.0;

export function useVoiceAmplitude(active: boolean) {
  const scale = useRef(new Animated.Value(SCALE_MIN)).current;
  const recordingRef = useRef<Audio.Recording | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const simTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;
    const calibrationBuffer: number[] = [];
    const flatCheckBuffer: number[] = [];
    let noiseFloor: number | null = null;
    let flatDetected = false;

    // ── Simulated pulse loop (fallback for flat metering / emulator) ──
    function startSimulation() {
      flatDetected = true;

      // Stop recording — we don't need the mic for simulation
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
        recordingRef.current = null;
      }
      Audio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(() => {});

      let isSpiking = false;

      function pulse() {
        if (cancelled) return;

        if (isSpiking) {
          // Spike: random intensity (0.5–1.0 → scale 1.5–2.0)
          const volume = 0.5 + Math.random() * 0.5;
          const target = SCALE_MIN + volume * (SCALE_MAX - SCALE_MIN);
          Animated.timing(scale, {
            toValue: target,
            duration: 80,
            useNativeDriver: false,
          }).start();

          if (Math.random() < 0.4) {
            // Continue spiking (sustained syllable)
            simTimeoutRef.current = setTimeout(pulse, 80 + Math.random() * 120);
          } else {
            // End spike, brief transition before baseline
            isSpiking = false;
            simTimeoutRef.current = setTimeout(pulse, 50 + Math.random() * 80);
          }
        } else {
          // Baseline: contract gradient
          Animated.timing(scale, {
            toValue: SCALE_MIN,
            duration: 150,
            useNativeDriver: false,
          }).start();

          // Pause at baseline, then spike again
          isSpiking = true;
          simTimeoutRef.current = setTimeout(pulse, 300 + Math.random() * 400);
        }
      }

      // Initial delay before first pulse
      simTimeoutRef.current = setTimeout(pulse, 500 + Math.random() * 300);
    }

    // ── Real metering path ──
    async function start() {
      try {
        const perm = await Audio.requestPermissionsAsync();
        if (!perm.granted || cancelled) return;

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording } = await Audio.Recording.createAsync({
          ...Audio.RecordingOptionsPresets.LOW_QUALITY,
          isMeteringEnabled: true,
        });
        if (cancelled) {
          await recording.stopAndUnloadAsync();
          return;
        }
        recordingRef.current = recording;

        intervalRef.current = setInterval(async () => {
          if (cancelled || flatDetected) return;
          try {
            const status = await recording.getStatusAsync();
            if (!status.isRecording) return;
            if (status.metering == null) return;

            // Phase 1: Calibration — collect ambient samples
            if (noiseFloor === null) {
              calibrationBuffer.push(status.metering);
              if (calibrationBuffer.length < CALIBRATION_SAMPLES) return;
              noiseFloor = Math.min(...calibrationBuffer) + HEADROOM;
              return;
            }

            // Phase 2: Flat-check — detect if metering is stuck
            if (flatCheckBuffer.length < FLAT_CHECK_SAMPLES) {
              flatCheckBuffer.push(status.metering);
              if (flatCheckBuffer.length < FLAT_CHECK_SAMPLES) return;

              const allSame = flatCheckBuffer.every((v) => v === flatCheckBuffer[0]);
              if (allSame) {
                startSimulation();
                return;
              }
            }

            // Phase 3: Real metering → scale
            const floor = noiseFloor;
            const ceil = floor + RANGE;
            const clamped = Math.max(floor, Math.min(ceil, status.metering));
            const normalized = (clamped - floor) / (ceil - floor);
            const targetScale = SCALE_MIN + normalized * (SCALE_MAX - SCALE_MIN);

            Animated.timing(scale, {
              toValue: targetScale,
              duration: POLL_MS,
              useNativeDriver: false,
            }).start();
          } catch {}
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
      if (simTimeoutRef.current) {
        clearTimeout(simTimeoutRef.current);
        simTimeoutRef.current = null;
      }
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
        recordingRef.current = null;
      }
      Audio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(() => {});
      scale.setValue(SCALE_MIN);
    };
  }, [active]);

  return scale;
}
