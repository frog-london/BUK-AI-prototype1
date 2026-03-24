import { Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { effra } from '@shared/tokens/typography';
import { shadowSubtle } from '@shared/tokens/shadows';

interface ActionCardAccountProps {
  image: ImageSourcePropType;
  name: string;
  lastFour: string;
  onPress?: () => void;
}

export function ActionCardAccount({ image, name, lastFour, onPress }: ActionCardAccountProps) {
  return (
    <TouchableOpacity
      testID="action-card-account"
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${name} ending in ${lastFour}`}
    >
      <Image source={image} style={styles.cardImage} resizeMode="cover" />
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.lastFour}>•••• {lastFour}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 162,
    height: 155,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 20,
    gap: 10,
    ...shadowSubtle,
  },
  cardImage: {
    width: 134.5,
    height: 46.5,
  },
  name: {
    ...effra(),
    fontSize: 16,
    lineHeight: 18,
    color: '#0473E9',
    textAlign: 'center',
    letterSpacing: 0.16,
  },
  lastFour: {
    ...effra(),
    fontSize: 11.28,
    lineHeight: 12,
    color: '#444444',
    opacity: 0.8,
    textAlign: 'center',
    letterSpacing: 0.11,
  },
});
