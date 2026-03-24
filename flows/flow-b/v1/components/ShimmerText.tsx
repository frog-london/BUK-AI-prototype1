import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { effra } from '@shared/tokens/typography';

const CYCLE_MS = 1500;
const HIGHLIGHT_WIDTH = 0.15; // fraction of text width that's highlighted

const COLOR_BASE = [200, 200, 200];    // #C8C8C8
const COLOR_HIGHLIGHT = [112, 112, 112]; // #707070

interface ShimmerTextProps {
  text: string;
  fontSize?: number;
}

function lerp(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}

function charColor(charPos: number, totalChars: number, progress: number): string {
  const pos = charPos / totalChars;
  const dist = Math.abs(pos - progress);
  const wrapped = Math.min(dist, 1 - dist);
  const intensity = Math.max(0, 1 - wrapped / HIGHLIGHT_WIDTH);
  const r = lerp(COLOR_BASE[0], COLOR_HIGHLIGHT[0], intensity);
  const g = lerp(COLOR_BASE[1], COLOR_HIGHLIGHT[1], intensity);
  const b = lerp(COLOR_BASE[2], COLOR_HIGHLIGHT[2], intensity);
  return `rgb(${r},${g},${b})`;
}

export function ShimmerText({ text, fontSize = 16 }: ShimmerTextProps) {
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const start = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress((elapsed % CYCLE_MS) / CYCLE_MS);
    }, 33); // ~30fps

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const chars = text.split('');

  return (
    <View style={styles.row}>
      {chars.map((char, i) => (
        <Text
          key={i}
          style={[
            styles.char,
            {
              fontSize,
              color: charColor(i, chars.length, progress),
            },
          ]}
        >
          {char === ' ' ? '\u00A0' : char}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  char: {
    ...effra('400'),
    lineHeight: 17.6,
  },
});
