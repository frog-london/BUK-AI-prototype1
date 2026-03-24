import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import IconFrozenShield from '@shared/assets/icons/icon-frozen-shield.svg';
import { effra } from '@shared/tokens/typography';
import { shadowSubtle, shadowMedium } from '@shared/tokens/shadows';

interface FrozenCardProps {
  cardName: string;
  lastFour: string;
  onNextPress?: () => void;
}

export function FrozenCard({ cardName, lastFour, onNextPress }: FrozenCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <IconFrozenShield width={19} height={19} />
        <Text style={styles.title}>Your card is frozen</Text>
      </View>

      <Text style={styles.description}>
        Your {cardName} card •••• {lastFour} is frozen and cannot be used. You
        can unfreeze it at any time. Let's review your transactions.
      </Text>

      <Image
        source={require('@shared/assets/images/card-blue-large.png')}
        style={styles.cardImage}
        resizeMode="cover"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={onNextPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Next, review transactions"
      >
        <Text style={styles.buttonText}>Next, review transactions</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 29,
    padding: 20,
    gap: 30,
    ...shadowSubtle,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  title: {
    ...effra('700'),
    fontSize: 20,
    lineHeight: 20,
    color: '#06015D',
  },
  description: {
    ...effra(),
    fontSize: 16,
    lineHeight: 22.4,
    color: '#444444',
  },
  cardImage: {
    width: '100%',
    height: 83.5,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#0384E6',
    borderRadius: 20,
    height: 63,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadowMedium,
  },
  buttonText: {
    ...effra(),
    fontSize: 16,
    lineHeight: 20,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
