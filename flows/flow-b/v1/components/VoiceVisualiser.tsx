import { useState, useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Ellipse, G } from 'react-native-svg';

interface VoiceVisualiserProps {
  scale?: Animated.Value;
  thinking?: boolean;
}

const CONTAINER_H = 429;
const THINK_PERIOD = 3000;
const CROSSFADE_MS = 500;
const STOP2_MIN = 0.1683;
const STOP2_MAX = 0.45;
const STOP3_MIN = 0.2697;
const STOP3_MAX = 0.60;

function ripplePosition(t: number): number {
  if (t < 0.9) return t / 0.9;
  return 0;
}

function rippleOpacity(t: number): number {
  if (t < 0.7) return 1;
  if (t < 0.9) return 1 - (t - 0.7) / 0.2;
  return (t - 0.9) / 0.1;
}

interface WaveState {
  stop2: number;
  stop3: number;
  opacity: number;
}

function GradientLayer({
  id,
  wave,
  width,
  containerH,
}: {
  id: string;
  wave: WaveState;
  width: number;
  containerH: number;
}) {
  const cx = width * 0.5;
  const cy = containerH * 2.15;
  const gradientRx = width * 2.1548;
  const gradientRy = containerH * 1.0341;
  const ellipseRy = containerH * 3;

  return (
    <View style={[StyleSheet.absoluteFill, { opacity: wave.opacity }]}>
      <Svg width={width} height={containerH * 3.5}>
        <Defs>
          <RadialGradient
            id={id}
            cx={cx}
            cy={cy}
            rx={gradientRx}
            ry={gradientRy}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor="#046FE4" stopOpacity="1" />
            <Stop offset={String(wave.stop2)} stopColor="#36F8F7" stopOpacity="1" />
            <Stop offset={String(wave.stop3)} stopColor="#EAFEAE" stopOpacity="0.41" />
            <Stop offset="1" stopColor="#36F8F7" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Ellipse
          cx={cx}
          cy={cy}
          rx={gradientRx}
          ry={ellipseRy}
          fill={`url(#${id})`}
        />
      </Svg>
    </View>
  );
}

export function VoiceVisualiser({ scale, thinking }: VoiceVisualiserProps) {
  const { width } = useWindowDimensions();
  const [s, setS] = useState(1);
  const [wave1, setWave1] = useState<WaveState>({ stop2: STOP2_MIN, stop3: STOP3_MIN, opacity: 1 });
  const [wave2, setWave2] = useState<WaveState>({ stop2: STOP2_MIN, stop3: STOP3_MIN, opacity: 1 });
  const thinkAnim = useRef<ReturnType<typeof setInterval> | null>(null);

  // Crossfade animated values
  const baselineOpacity = useRef(new Animated.Value(thinking ? 0 : 1)).current;
  const thinkingOpacity = useRef(new Animated.Value(thinking ? 1 : 0)).current;

  // Keep thinking layers mounted during crossfade
  const [thinkingActive, setThinkingActive] = useState(!!thinking);

  // Crossfade between baseline and thinking
  useEffect(() => {
    if (thinking) {
      thinkingOpacity.setValue(0);
      setThinkingActive(true);
      // Defer animation to next frame so thinking layers are mounted
      const frame = requestAnimationFrame(() => {
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
      return () => cancelAnimationFrame(frame);
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
      if (thinkAnim.current) clearInterval(thinkAnim.current);
      return;
    }

    const start = Date.now();
    thinkAnim.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const t1 = (elapsed % THINK_PERIOD) / THINK_PERIOD;
      const t2 = ((elapsed + THINK_PERIOD * 0.5) % THINK_PERIOD) / THINK_PERIOD;
      const p1 = ripplePosition(t1);
      const p2 = ripplePosition(t2);
      setWave1({
        stop2: STOP2_MIN + p1 * (STOP2_MAX - STOP2_MIN),
        stop3: STOP3_MIN + p1 * (STOP3_MAX - STOP3_MIN),
        opacity: rippleOpacity(t1),
      });
      setWave2({
        stop2: STOP2_MIN + p2 * (STOP2_MAX - STOP2_MIN),
        stop3: STOP3_MIN + p2 * (STOP3_MAX - STOP3_MIN),
        opacity: rippleOpacity(t2),
      });
    }, 16);

    return () => {
      if (thinkAnim.current) clearInterval(thinkAnim.current);
    };
  }, [thinkingActive]);

  const cx = width * 0.5;
  const cy = CONTAINER_H * 2.15;
  const gradientRx = width * 2.1548;
  const gradientRy = CONTAINER_H * 1.0341;
  const ellipseRy = CONTAINER_H * 3;
  const transform = `translate(${cx}, ${CONTAINER_H}) scale(${s}) translate(${-cx}, ${-CONTAINER_H})`;

  return (
    <View style={styles.container}>
      {/* Baseline gradient (voice amplitude) */}
      <Animated.View style={[styles.layer, { opacity: baselineOpacity }]}>
        <Svg width={width} height={CONTAINER_H * 3.5}>
          <Defs>
            <RadialGradient
              id="voiceGrad"
              cx={cx}
              cy={cy}
              rx={gradientRx}
              ry={gradientRy}
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0" stopColor="#046FE4" stopOpacity="1" />
              <Stop offset="0.1683" stopColor="#36F8F7" stopOpacity="1" />
              <Stop offset="0.2697" stopColor="#75DEF7" stopOpacity="0.41" />
              <Stop offset="0.3894" stopColor="#97FFFC" stopOpacity="0.26" />
              <Stop offset="0.6106" stopColor="#D7FCFF" stopOpacity="0.25" />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <G transform={transform}>
            <Ellipse
              cx={cx}
              cy={cy}
              rx={gradientRx}
              ry={ellipseRy}
              fill="url(#voiceGrad)"
            />
          </G>
        </Svg>
      </Animated.View>

      {/* Thinking gradient layers */}
      {thinkingActive && (
        <Animated.View style={[styles.layer, { opacity: thinkingOpacity }]}>
          <GradientLayer id="voiceGrad1" wave={wave1} width={width} containerH={CONTAINER_H} />
          <GradientLayer id="voiceGrad2" wave={wave2} width={width} containerH={CONTAINER_H} />
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
