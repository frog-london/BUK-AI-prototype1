import { StyleSheet, TouchableOpacity } from 'react-native';
import IconMenu from '@shared/assets/icons/icon-menu.svg';

interface MenuButtonProps {
  onPress?: () => void;
}

export function MenuButton({ onPress }: MenuButtonProps) {
  return (
    <TouchableOpacity
      testID="menu-button"
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="Menu"
    >
      <IconMenu width={25} height={25} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
