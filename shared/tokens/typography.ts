import { Platform, TextStyle } from 'react-native';

const FONT_MAP: Record<string, string> = {
  '300': 'effra-light',
  '400': 'effra',
  '500': 'effra-medium',
  '700': 'effra-bold',
};

/** Returns cross-platform fontFamily (+ fontWeight on web) for Effra. */
export function effra(weight: '300' | '400' | '500' | '700' = '400'): TextStyle {
  if (Platform.OS === 'web') {
    return { fontFamily: 'effra', fontWeight: weight };
  }
  return { fontFamily: FONT_MAP[weight] };
}

export const typography = {
  h1: { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.5 },
  h2: { fontSize: 24, fontWeight: '700' as const },
  h3: { fontSize: 20, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  bodySmall: { fontSize: 14, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
  label: { fontSize: 14, fontWeight: '600' as const },
} as const;
