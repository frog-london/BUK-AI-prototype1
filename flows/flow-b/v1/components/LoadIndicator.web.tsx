import { Image, StyleSheet, View } from 'react-native';
import { ShimmerText } from './ShimmerText';

const GRADIENT = `radial-gradient(circle at 50% 100%, rgba(0,188,237,1) 5%, rgba(37,214,241,1) 14.5%, rgba(74,239,245,1) 24%, rgba(96,245,209,1) 49%, rgba(117,250,172,1) 74%, rgba(217,221,187,0) 100%)`;

interface LoadIndicatorProps {
  text?: string;
}

export function LoadIndicator({ text = 'Reviewing transactions...' }: LoadIndicatorProps) {
  return (
    <View style={styles.container}>
      <View
        style={[styles.circle, {
          // @ts-ignore — web-only
          background: GRADIENT,
        }]}
      >
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
