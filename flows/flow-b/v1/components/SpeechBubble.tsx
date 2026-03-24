import { StyleSheet, Text, View } from 'react-native';
import { effra } from '@shared/tokens/typography';

interface SpeechBubbleProps {
  text: string;
}

export function SpeechBubble({ text }: SpeechBubbleProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-end',
    maxWidth: 270,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 9,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  text: {
    ...effra(),
    fontSize: 16,
    lineHeight: 22,
    color: '#060063',
  },
});
