import { useState, useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface VoiceVisualiserProps {
  scale?: Animated.Value;
  thinking?: boolean;
}

const CONTAINER_H = 429;
const GRADIENT_BASELINE = `radial-gradient(215.48% 103.41% at 50% 103.41%, #046FE4 0%, #36F8F7 16.83%, #75DEF769 26.97%, #97FFFC42 38.94%, #D7FCFF40 61.06%, #FFFFFF00 100%)`;

const THINK_PERIOD = 3000;
const CROSSFADE_MS = 500;
const STOP2_MIN = 16.83;
const STOP2_MAX = 45;
const STOP3_MIN = 26.97;
const STOP3_MAX = 60;

function ripplePosition(t: number): number {
  if (t < 0.9) return t / 0.9;
  return 0;
}

function rippleOpacity(t: number): number {
  if (t < 0.7) return 1;
  if (t < 0.9) return 1 - (t - 0.7) / 0.2;
  return (t - 0.9) / 0.1;
}

function buildWaveGradient(stop2: number, stop3: number) {
  return `radial-gradient(215.48% 103.41% at 50% 103.41%, #046FE4 0%, #36F8F7 ${stop2}%, #EAFEAE69 ${stop3}%, #36F8F700 100%)`;
}

export function VoiceVisualiser({ scale, thinking }: VoiceVisualiserProps) {
  const [s, setS] = useState(1);
  const [wave1Gradient, setWave1Gradient] = useState(buildWaveGradient(STOP2_MIN, STOP3_MIN));
  const [wave1Opacity, setWave1Opacity] = useState(1);
  const [wave2Gradient, setWave2Gradient] = useState(buildWaveGradient(STOP2_MIN, STOP3_MIN));
  const [wave2Opacity, setWave2Opacity] = useState(1);
  const thinkAnim = useRef<number | null>(null);

  // Crossfade animated values
  const baselineOpacity = useRef(new Animated.Value(thinking ? 0 : 1)).current;
  const thinkingOpacity = useRef(new Animated.Value(thinking ? 1 : 0)).current;

  // Keep thinking layers always mounted so we can crossfade
  const [thinkingActive, setThinkingActive] = useState(!!thinking);

  // Crossfade between baseline and thinking
  useEffect(() => {
    if (thinking) {
      thinkingOpacity.setValue(0);
      setThinkingActive(true);
      // Defer animation to next frame so thinking layers are mounted
      requestAnimationFrame(() => {
        Animated.parallel([
          Animated.timing(baselineOpacity, {
            toValue: 0,
            duration: CROSSFADE_MS,
            useNativeDriver: true,
          }),
          Animated.timing(thinkingOpacity, {
            toValue: 1,
            duration: CROSSFADE_MS,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      Animated.parallel([
        Animated.timing(baselineOpacity, {
          toValue: 1,
          duration: CROSSFADE_MS,
          useNativeDriver: true,
        }),
        Animated.timing(thinkingOpacity, {
          toValue: 0,
          duration: CROSSFADE_MS,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setThinkingActive(false);
      });
    }
  }, [thinking]);

  // Listen to external scale (voice amplitude)
  useEffect(() => {
    if (!scale || thinking) return;
    const id = scale.addListener(({ value }) => setS(value));
    return () => scale.removeListener(id);
  }, [scale, thinking]);

  // Thinking ripple animation — two stacked layers offset by half a cycle
  useEffect(() => {
    if (!thinkingActive) {
      if (thinkAnim.current) cancelAnimationFrame(thinkAnim.current);
      return;
    }

    let start: number | null = null;
    function tick(ts: number) {
      if (!start) start = ts;
      const elapsed = ts - start;

      const t1 = (elapsed % THINK_PERIOD) / THINK_PERIOD;
      const t2 = ((elapsed + THINK_PERIOD * 0.5) % THINK_PERIOD) / THINK_PERIOD;

      const p1 = ripplePosition(t1);
      const p2 = ripplePosition(t2);

      setWave1Gradient(buildWaveGradient(
        STOP2_MIN + p1 * (STOP2_MAX - STOP2_MIN),
        STOP3_MIN + p1 * (STOP3_MAX - STOP3_MIN),
      ));
      setWave1Opacity(rippleOpacity(t1));

      setWave2Gradient(buildWaveGradient(
        STOP2_MIN + p2 * (STOP2_MAX - STOP2_MIN),
        STOP3_MIN + p2 * (STOP3_MAX - STOP3_MIN),
      ));
      setWave2Opacity(rippleOpacity(t2));

      thinkAnim.current = requestAnimationFrame(tick);
    }
    thinkAnim.current = requestAnimationFrame(tick);

    return () => {
      if (thinkAnim.current) cancelAnimationFrame(thinkAnim.current);
    };
  }, [thinkingActive]);

  return (
    <View style={styles.container}>
      {/* Baseline gradient (voice amplitude) */}
      <Animated.View
        style={[styles.layer, {
          opacity: baselineOpacity,
          // @ts-ignore — web-only
          background: GRADIENT_BASELINE,
          transform: `scale(${s})`,
          transformOrigin: 'center bottom',
        }]}
      />

      {/* Thinking gradient layers */}
      {thinkingActive && (
        <Animated.View style={[styles.layer, { opacity: thinkingOpacity }]}>
          <View
            style={[styles.layer, {
              // @ts-ignore — web-only
              background: wave1Gradient,
              opacity: wave1Opacity,
            }]}
          />
          <View
            style={[styles.layer, {
              // @ts-ignore — web-only
              background: wave2Gradient,
              opacity: wave2Opacity,
            }]}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: CONTAINER_H,
    position: 'relative',
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
  },
});
