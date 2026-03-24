import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SvgProps } from 'react-native-svg';
import { effra } from '@shared/tokens/typography';
import { shadowMedium } from '@shared/tokens/shadows';

interface ActionCardFreezeProps {
  icon: React.FC<SvgProps>;
  label: string;
  onPress?: () => void;
}

export function ActionCardFreeze({ icon: Icon, label, onPress }: ActionCardFreezeProps) {
  return (
    <TouchableOpacity
      testID="action-card-freeze"
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Icon width={40} height={40} />
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 162,
    height: 155,
    backgroundColor: '#0384E6',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    ...shadowMedium,
  },
  label: {
    ...effra(),
    fontSize: 14,
    lineHeight: 15.8,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.14,
  },
});
