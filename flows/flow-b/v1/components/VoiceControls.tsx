import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import IconMic from '@shared/assets/icons/icon-mic.svg';
import IconMicOff from '@shared/assets/icons/icon-mic-off.svg';

interface VoiceControlsProps {
  isMuted?: boolean;
  onMicToggle?: () => void;
  onStop?: () => void;
}

export function VoiceControls({ isMuted = false, onMicToggle, onStop }: VoiceControlsProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.micButton}
        onPress={onMicToggle}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={isMuted ? 'Unmute microphone' : 'Mute microphone'}
      >
        {isMuted ? (
          <IconMicOff width={21} height={26} />
        ) : (
          <IconMic width={30} height={31} />
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.stopButton}
        onPress={onStop}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Stop voice input"
      >
        <View style={styles.stopIcon} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 19,
    padding: 8,
    borderRadius: 38,
    backgroundColor: 'rgba(0,0,0,0.04)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 11,
    elevation: 5,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
      } as any,
    }),
  },
  micButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FDEAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopIcon: {
    width: 18,
    height: 18,
    borderRadius: 3.6,
    backgroundColor: '#FF6F37',
  },
});
