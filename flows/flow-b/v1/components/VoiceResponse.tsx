import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { effra } from '@shared/tokens/typography';

const WORD_MS = 80;
const FADE_MS = 300;

interface VoiceResponseProps {
  text: string;
  secondText?: string;
  indicator?: React.ReactNode;
  indicatorDuration?: number;
  indicatorText?: string;
  card?: React.ReactNode;
}

export function VoiceResponse({
  text,
  secondText,
  indicator,
  indicatorDuration = 4000,
  indicatorText,
  card,
}: VoiceResponseProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [typingDone, setTypingDone] = useState(false);
  const [showIndicator, setShowIndicator] = useState(false);
  const [showSecond, setShowSecond] = useState(false);
  const [displayedSecondText, setDisplayedSecondText] = useState('');
  const [secondTypingDone, setSecondTypingDone] = useState(false);
  const [showCard, setShowCard] = useState(false);

  const indicatorOpacity = useRef(new Animated.Value(0)).current;
  const secondTextOpacity = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  // Phase 1: Word-by-word reveal for first text
  useEffect(() => {
    const words = text.split(' ');
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayedText(words.slice(0, i).join(' '));
      if (i >= words.length) {
        clearInterval(interval);
        setTypingDone(true);
      }
    }, WORD_MS);
    return () => clearInterval(interval);
  }, [text]);

  // Phase 2: Show indicator after first text typed
  useEffect(() => {
    if (!typingDone || !indicator) return;
    setShowIndicator(true);
    Animated.timing(indicatorOpacity, {
      toValue: 1,
      duration: FADE_MS,
      useNativeDriver: true,
    }).start();

    // Phase 3: After indicatorDuration, hide indicator and show second text (or card)
    const hasNext = secondText || card;
    if (!hasNext) return;

    const timer = setTimeout(() => {
      Animated.timing(indicatorOpacity, {
        toValue: 0,
        duration: FADE_MS,
        useNativeDriver: true,
      }).start(() => {
        setShowIndicator(false);
        if (secondText) {
          setShowSecond(true);
          Animated.timing(secondTextOpacity, {
            toValue: 1,
            duration: FADE_MS,
            useNativeDriver: true,
          }).start();
        } else if (card) {
          setShowCard(true);
          Animated.timing(cardOpacity, {
            toValue: 1,
            duration: FADE_MS,
            useNativeDriver: true,
          }).start();
        }
      });
    }, indicatorDuration);

    return () => clearTimeout(timer);
  }, [typingDone]);

  // Phase 4: Word-by-word reveal for second text
  useEffect(() => {
    if (!showSecond || !secondText) return;
    const words = secondText.split(' ');
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayedSecondText(words.slice(0, i).join(' '));
      if (i >= words.length) {
        clearInterval(interval);
        setSecondTypingDone(true);
      }
    }, WORD_MS);
    return () => clearInterval(interval);
  }, [showSecond]);

  // Phase 5: Show card after second text finishes
  useEffect(() => {
    if (!secondTypingDone || !card) return;
    setShowCard(true);
    Animated.timing(cardOpacity, {
      toValue: 1,
      duration: FADE_MS,
      useNativeDriver: true,
    }).start();
  }, [secondTypingDone]);

  return (
    <View style={styles.container}>
      <Text style={styles.responseText}>{displayedText}</Text>

      {showIndicator && indicator && (
        <Animated.View style={{ opacity: indicatorOpacity }}>
          {indicator}
        </Animated.View>
      )}

      {showSecond && (
        <Animated.View style={{ opacity: secondTextOpacity }}>
          <Text style={styles.responseText}>{displayedSecondText}</Text>
        </Animated.View>
      )}

      {showCard && (
        <Animated.View style={{ opacity: cardOpacity }}>
          {card}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 30,
    gap: 20,
  },
  responseText: {
    ...effra('400'),
    fontSize: 20,
    color: '#252525',
    lineHeight: 24,
  },
});
