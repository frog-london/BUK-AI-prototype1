import { StyleSheet, Text, View } from 'react-native';
import { effra } from '@shared/tokens/typography';
import { shadowMedium } from '@shared/tokens/shadows';

export function WaitCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Estimated wait</Text>
      <Text style={styles.value}>6 minutes</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 29,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadowMedium,
  },
  label: {
    ...effra('500'),
    fontSize: 16,
    color: '#000063',
    lineHeight: 22.4,
  },
  value: {
    ...effra('700'),
    fontSize: 16,
    color: '#000063',
    lineHeight: 22.4,
  },
});
