import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import IconBackDown from '@shared/assets/icons/icon-back-down.svg';

interface BackButtonProps {
  onPress?: () => void;
}

export function BackButton({ onPress }: BackButtonProps) {
  const router = useRouter();

  return (
    <View testID="back-button" style={styles.container}>
      <TouchableOpacity
        onPress={onPress ?? (() => router.navigate('/(flows)/flow-b/v1'))}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        style={styles.touchable}
      >
        <IconBackDown width={41} height={12} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 14,
  },
  touchable: {
    padding: 10,
  },
});
