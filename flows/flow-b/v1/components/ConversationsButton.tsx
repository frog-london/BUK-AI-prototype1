import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import IconConversations from '@shared/assets/icons/icon-conversations.svg';
import { effra } from '@shared/tokens/typography';

interface ConversationsButtonProps {
  onPress?: () => void;
}

export function ConversationsButton({ onPress }: ConversationsButtonProps) {
  return (
    <TouchableOpacity
      testID="conversations-button"
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="Ongoing conversations"
    >
      <IconConversations width={30} height={30} />
      <Text style={styles.label}>Ongoing conversations</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    height: 41,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.87)',
    borderRadius: 20.5,
    alignSelf: 'flex-start',
  },
  label: {
    ...effra('500'),
    fontSize: 14,
    color: '#046FE4',
    letterSpacing: 0.14,
  },
});
