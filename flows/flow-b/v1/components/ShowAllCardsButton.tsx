import { Pressable, StyleSheet, Text, View } from 'react-native';
import IconCards from '@shared/assets/icons/icon-cards.svg';
import { effra } from '@shared/tokens/typography';

interface ShowAllCardsButtonProps {
  label?: string;
  onPress?: () => void;
}

export function ShowAllCardsButton({ label = 'Show all of my cards', onPress }: ShowAllCardsButtonProps) {
  return (
    <View style={styles.container}>
      <Pressable
        testID="show-all-cards-button"
        style={({ pressed }) => [styles.pressable, pressed && { opacity: 0.7 }]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <IconCards width={40} height={40} />
        <Text style={styles.label}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0384E6',
    borderRadius: 30,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  pressable: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    paddingHorizontal: 16,
    gap: 4,
  },
  label: {
    ...effra(),
    fontSize: 16.37,
    color: '#F5F5F5',
  },
});
