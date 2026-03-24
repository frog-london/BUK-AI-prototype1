import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TextStyle, View } from 'react-native';

const SLIDE_DISTANCE = 6;
const ANIM_DURATION = 150;

interface AnimatedWordsProps {
  text: string;
  style?: TextStyle;
}

interface WordEntry {
  word: string;
  opacity: Animated.Value;
  translateY: Animated.Value;
}

export function AnimatedWords({ text, style }: AnimatedWordsProps) {
  const entriesRef = useRef<WordEntry[]>([]);
  const prevCountRef = useRef(0);

  const words = text ? text.split(' ') : [];

  // Add new entries for any new words and animate them in
  if (words.length > entriesRef.current.length) {
    for (let i = entriesRef.current.length; i < words.length; i++) {
      const opacity = new Animated.Value(0);
      const translateY = new Animated.Value(SLIDE_DISTANCE);
      entriesRef.current.push({ word: words[i], opacity, translateY });

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: ANIM_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: ANIM_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }

  // Update existing word text (speech recognition can revise earlier words)
  for (let i = 0; i < Math.min(words.length, entriesRef.current.length); i++) {
    entriesRef.current[i].word = words[i];
  }

  // Trim if words were removed (speech recognition correction)
  if (words.length < entriesRef.current.length) {
    entriesRef.current.length = words.length;
  }

  prevCountRef.current = words.length;

  // Reset entries when text is cleared
  useEffect(() => {
    if (!text) {
      entriesRef.current = [];
      prevCountRef.current = 0;
    }
  }, [text]);

  return (
    <View style={styles.row}>
      {entriesRef.current.map((entry, i) => (
        <Animated.Text
          key={i}
          style={[
            style,
            {
              opacity: entry.opacity,
              transform: [{ translateY: entry.translateY }],
            },
          ]}
        >
          {i > 0 ? ' ' : ''}{entry.word}
        </Animated.Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
});
