import { Image, StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import { ShimmerText } from './ShimmerText';

interface LoadIndicatorProps {
  text?: string;
}

export function LoadIndicator({ text = 'Reviewing transactions...' }: LoadIndicatorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.circle}>
        <Svg width={40} height={40} style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient
              id="loadGrad"
              cx="20"
              cy="40"
              rx="20"
              ry="43"
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0.05" stopColor="#00BCED" />
              <Stop offset="0.145" stopColor="#25D6F1" />
              <Stop offset="0.24" stopColor="#4AEFF5" />
              <Stop offset="0.49" stopColor="#60F5D1" />
              <Stop offset="0.74" stopColor="#75FAAC" />
              <Stop offset="1" stopColor="#D9DDBB" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx={20} cy={20} r={20} fill="url(#loadGrad)" />
        </Svg>
        <Image
          source={require('@shared/assets/images/barclays-eagle.png')}
          style={styles.icon}
          resizeMode="contain"
        />
      </View>
      <ShimmerText text={text} fontSize={16} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 19.5,
    height: 21,
  },
});
