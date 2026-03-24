import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Animated,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useRouter } from 'expo-router';

import { BackButton } from '@flows/flow-b/v1/components/BackButton';
import { MenuButton } from '@flows/flow-b/v1/components/MenuButton';
import { SpeechBubble } from '@flows/flow-b/v1/components/SpeechBubble';
import { SearchField2 } from '@flows/flow-b/v1/components/SearchField2';
import { ActionCardSend } from '@flows/flow-d/v1/components/ActionCardSend';
import { bgState3, bgState4, bgState5 } from '@flows/flow-d/v1/videoSources';
import { effra } from '@shared/tokens/typography';
import { shadowMedium } from '@shared/tokens/shadows';

const FADE_OUT_MS = 250;
const FADE_IN_MS = 350;
const CHAR_MS = 18;

const RESPONSE_TEXTS = [
  "Right away! Should we send the usual £10?",
  "Ready to send?",
  "", // done step — no text
];

export default function FlowDV1Screen() {
  const { width, height: screenHeight } = useWindowDimensions();
  const router = useRouter();

  // ── State ──
  const [conversationStep, setConversationStep] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [amount, setAmount] = useState(10);
  const [showResponse, setShowResponse] = useState(false);
  const [activeBgVideo, setActiveBgVideo] = useState<3 | 4 | 5>(3);

  // Typewriter state
  const [displayedText, setDisplayedText] = useState('');
  const [typingDone, setTypingDone] = useState(false);
  const cardRevealed = useRef(false);

  // ── Animation values ──
  const backOpacity = useRef(new Animated.Value(0)).current;
  const bubbleOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const doneButtonOpacity = useRef(new Animated.Value(0)).current;
  const searchOpacity = useRef(new Animated.Value(0)).current;
  const keyboardOffset = useRef(new Animated.Value(0)).current;

  // ── Video players ──
  const bgVideoPlayer3 = useVideoPlayer(bgState3, (p) => {
    p.loop = false;
    p.playbackRate = 1.0;
    p.muted = true;
    p.volume = 0;
  });
  const bgVideoPlayer4 = useVideoPlayer(bgState4, (p) => {
    p.loop = false;
    p.playbackRate = 1.0;
    p.muted = true;
    p.volume = 0;
  });
  const bgVideoPlayer5 = useVideoPlayer(bgState5, (p) => {
    p.loop = false;
    p.playbackRate = 1.0;
    p.muted = true;
    p.volume = 0;
  });

  // Play video when activeBgVideo changes
  useEffect(() => {
    const players: Record<number, typeof bgVideoPlayer3> = {
      3: bgVideoPlayer3,
      4: bgVideoPlayer4,
      5: bgVideoPlayer5,
    };
    const player = players[activeBgVideo];
    if (player) {
      player.currentTime = 0;
      player.play();
    }
  }, [activeBgVideo]);

  // ── Keyboard tracking ──
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, (e) => {
      Animated.timing(keyboardOffset, {
        toValue: -e.endCoordinates.height,
        duration: Platform.OS === 'ios' ? e.duration : 200,
        useNativeDriver: true,
      }).start();
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      Animated.timing(keyboardOffset, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // ── Typewriter effect ──
  useEffect(() => {
    if (!showResponse) return;
    const text = RESPONSE_TEXTS[conversationStep];
    if (!text) {
      setDisplayedText('');
      setTypingDone(true);
      return;
    }
    setDisplayedText('');
    setTypingDone(false);
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
  }, [showResponse, conversationStep]);

  // Reveal card after first typewriter completes
  useEffect(() => {
    if (typingDone && !cardRevealed.current) {
      cardRevealed.current = true;
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [typingDone]);

  // ── Mount animation: fade in UI elements ──
  useEffect(() => {
    Animated.timing(backOpacity, {
      toValue: 1,
      duration: FADE_IN_MS,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(bubbleOpacity, {
        toValue: 1,
        duration: FADE_IN_MS,
        useNativeDriver: true,
      }).start();
    }, 150);

    setTimeout(() => {
      Animated.timing(searchOpacity, {
        toValue: 1,
        duration: FADE_IN_MS,
        useNativeDriver: true,
      }).start();
    }, 300);

    // Show response area → typewriter starts
    setTimeout(() => {
      setShowResponse(true);
    }, 800);
  }, []);

  // ── Handlers ──
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleAmountPress = useCallback(() => {
    setIsEditing((prev) => !prev);
  }, []);

  const handleAmountChange = useCallback((val: string) => {
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 0 && num <= 99999) {
      setAmount(num);
    }
  }, []);

  const handleIncrement = useCallback(() => {
    setAmount((prev) => prev + 10);
  }, []);

  const handleDecrement = useCallback(() => {
    setAmount((prev) => Math.max(0, prev - 10));
  }, []);

  // Step 0 → 1: Verify → Confirm (card stays visible, only text fades)
  const handleVerify = useCallback(() => {
    Keyboard.dismiss();
    setIsEditing(false);
    setActiveBgVideo(4);

    // Fade out text only (bubble stays visible)
    Animated.timing(textOpacity, {
      toValue: 0,
      duration: FADE_OUT_MS,
      useNativeDriver: true,
    }).start(() => {
      // Change step — card handles its own transition internally
      setConversationStep(1);
      // Fade text back in after a brief delay so typewriter has started
      setTimeout(() => {
        Animated.timing(textOpacity, { toValue: 1, duration: FADE_IN_MS, useNativeDriver: true }).start();
      }, 50);
    });
  }, []);

  // Step 1 → 2: Confirm → Done (card stays visible, text fades)
  const handleConfirm = useCallback(() => {
    setActiveBgVideo(5);

    // Fade out text only (bubble stays visible)
    Animated.timing(textOpacity, {
      toValue: 0,
      duration: FADE_OUT_MS,
      useNativeDriver: true,
    }).start(() => {
      setConversationStep(2);
      // Fade in done button after card transition
      setTimeout(() => {
        Animated.timing(doneButtonOpacity, {
          toValue: 1,
          duration: FADE_IN_MS,
          useNativeDriver: true,
        }).start();
      }, 500);
    });
  }, []);

  const handleDone = useCallback(() => {
    router.back();
  }, [router]);

  const currentVariant: 'send' | 'edit' | 'confirm' | 'done' = isEditing
    ? 'edit'
    : conversationStep === 0
      ? 'send'
      : conversationStep === 1
        ? 'confirm'
        : 'done';

  const handleSubmit =
    conversationStep === 0 ? handleVerify : conversationStep === 1 ? handleConfirm : undefined;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      {/* Background videos */}
      {activeBgVideo === 3 && (
        <VideoView
          player={bgVideoPlayer3}
          style={{ position: 'absolute', top: 0, left: 0, width, height: screenHeight }}
          contentFit="fill"
          nativeControls={false}
          allowsPictureInPicture={false}
        />
      )}
      {activeBgVideo === 4 && (
        <VideoView
          player={bgVideoPlayer4}
          style={{ position: 'absolute', top: 0, left: 0, width, height: screenHeight }}
          contentFit="fill"
          nativeControls={false}
          allowsPictureInPicture={false}
        />
      )}
      {activeBgVideo === 5 && (
        <VideoView
          player={bgVideoPlayer5}
          style={{ position: 'absolute', top: 0, left: 0, width, height: screenHeight }}
          contentFit="fill"
          nativeControls={false}
          allowsPictureInPicture={false}
        />
      )}

      {/* Back button */}
      <Animated.View style={{ opacity: backOpacity }}>
        <BackButton onPress={handleBack} />
      </Animated.View>

      {/* Menu + Speech bubble */}
      <View style={styles.conversationRow}>
        <MenuButton />
        <Animated.View style={[styles.conversationBubbleWrap, { opacity: bubbleOpacity }]}>
          <SpeechBubble text="Send money to Sam P." />
        </Animated.View>
      </View>

      {/* AI Response — text + card rendered separately */}
      {showResponse && (
        <View style={styles.responseContainer}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.responseScroll}
          >
            {/* Response text — always rendered for stable card position */}
            <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
              <Text style={styles.responseText}>{displayedText || ' '}</Text>
            </Animated.View>

            {/* Card — stays mounted across all steps */}
            <Animated.View
              needsOffscreenAlphaCompositing
              style={[styles.cardWrap, { opacity: cardOpacity }]}
            >
              <ActionCardSend
                variant={currentVariant}
                amount={amount}
                onAmountPress={handleAmountPress}
                onAmountChange={handleAmountChange}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
                onSubmit={handleSubmit}
              />
            </Animated.View>

            {/* Done button — fades in for step 2 */}
            {conversationStep === 2 && (
              <Animated.View style={[styles.doneWrap, { opacity: doneButtonOpacity }]}>
                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={handleDone}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Done"
                >
                  <Text style={styles.doneButtonText}>Done</Text>
                  <View style={styles.doneButtonGlow} />
                </TouchableOpacity>
              </Animated.View>
            )}
          </ScrollView>
        </View>
      )}

      {/* Search field at bottom */}
      <Animated.View
        style={[
          styles.searchBottomContainer,
          {
            opacity: searchOpacity,
            transform: [{ translateY: keyboardOffset }],
          },
        ]}
      >
        <SearchField2 docked />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  conversationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    gap: 10,
    marginTop: 10,
  },
  conversationBubbleWrap: {
    flex: 1,
  },
  responseContainer: {
    flex: 1,
    marginTop: 20,
  },
  responseScroll: {
    paddingBottom: 130,
    gap: 20,
  },
  textContainer: {
    paddingHorizontal: 30,
    minHeight: 60,
  },
  responseText: {
    ...effra(),
    fontSize: 22.13,
    color: '#252525',
    lineHeight: 26.8,
  },
  cardWrap: {
    paddingHorizontal: 30,
  },
  doneWrap: {
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  doneButton: {
    backgroundColor: '#0384E6',
    borderRadius: 16,
    borderWidth: 0.8,
    borderColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 30,
    width: 342,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...Platform.select({ android: {}, default: shadowMedium }),
  },
  doneButtonText: {
    ...effra(),
    fontSize: 13.105,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  doneButtonGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    ...Platform.select({
      web: { boxShadow: 'inset -2.4px 0px 17.1px 0px rgba(0,192,235,0.37)' } as any,
      default: {},
    }),
  },
  searchBottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
