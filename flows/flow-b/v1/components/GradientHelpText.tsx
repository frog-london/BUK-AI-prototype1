import { Platform, Text } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { effra } from '@shared/tokens/typography';

const HELP = 'How can I help today?';
const FONT_SIZE = 29;

export function GradientHelpText() {
  if (Platform.OS === 'web') {
    return (
      <Text
        style={{
          ...effra('500'),
          fontSize: FONT_SIZE,
          color: '#000063',
          flex: 1,
          backgroundImage: 'linear-gradient(to right, #000063, #046FE4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        } as any}
      >
        {HELP}
      </Text>
    );
  }

  return (
    <Svg height={FONT_SIZE + 6} style={{ flex: 1 }}>
      <Defs>
        <LinearGradient id="helpGrad" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#000063" />
          <Stop offset="1" stopColor="#046FE4" />
        </LinearGradient>
      </Defs>
      <SvgText
        fill="url(#helpGrad)"
        fontSize={FONT_SIZE}
        fontFamily="effra-medium"
        y={FONT_SIZE}
      >
        {HELP}
      </SvgText>
    </Svg>
  );
}
