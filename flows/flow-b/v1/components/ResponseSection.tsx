import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { effra } from '@shared/tokens/typography';

const CHAR_MS = 18;
const CARDS_FADE_MS = 300;
const BUTTON_FADE_MS = 250;

interface ResponseSectionProps {
  text: string;
  subtitle?: string;
  cards: React.ReactNode;
  button?: React.ReactNode;
}

export function ResponseSection({ text, subtitle, cards, button }: ResponseSectionProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [typingDone, setTypingDone] = useState(false);

  const cardsOpacity = useRef(new Animated.Value(0)).current;
  const cardsY = useRef(new Animated.Value(15)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  // Typewriter effect
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayedText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setTypingDone(true);
      }
    }, CHAR_MS);
    return () => clearInterval(interval);
  }, [text]);

  // After typing → reveal cards, then button
  useEffect(() => {
    if (!typingDone) return;
    Animated.parallel([
      Animated.timing(cardsOpacity, {
        toValue: 1,
        duration: CARDS_FADE_MS,
        useNativeDriver: true,
      }),
      Animated.timing(cardsY, {
        toValue: 0,
        duration: CARDS_FADE_MS,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (button) {
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: BUTTON_FADE_MS,
          useNativeDriver: true,
        }).start();
      }
    });
  }, [typingDone]);

  return (
    <View testID="response-section" style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.responseText}>{displayedText}</Text>
        {subtitle && typingDone && (
          <Text style={styles.subtitleText}>{subtitle}</Text>
        )}
      </View>

      <Animated.View
        needsOffscreenAlphaCompositing
        style={{
          opacity: cardsOpacity,
          transform: [{ translateY: cardsY }],
        }}
      >
        {cards}
      </Animated.View>

      {button && (
        <Animated.View style={[styles.buttonWrap, { opacity: buttonOpacity }]}>
          {button}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  textContainer: {
    paddingHorizontal: 30,
    gap: 10,
  },
  responseText: {
    ...effra(),
    fontSize: 22.13,
    color: '#252525',
    lineHeight: 26.8,
  },
  subtitleText: {
    ...effra(),
    fontSize: 16,
    color: '#3B3B3B',
    lineHeight: 22.4,
  },
  buttonWrap: {
    paddingHorizontal: 30,
  },
});
