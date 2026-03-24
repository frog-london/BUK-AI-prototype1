import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Animated,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useRouter } from 'expo-router';

import { Header } from '@flows/flow-b/v1/components/Header';
import { Suggestions } from '@flows/flow-b/v1/components/Suggestions';
import { AccountCard } from '@flows/flow-b/v1/components/AccountCard';
import { Nav2 } from '@flows/flow-b/v1/components/Nav2';
import { BackButton } from '@flows/flow-b/v1/components/BackButton';
import { WelcomeText } from '@flows/flow-b/v1/components/WelcomeText';
import { SearchField2 } from '@flows/flow-b/v1/components/SearchField2';
import { ConversationsButton } from '@flows/flow-b/v1/components/ConversationsButton';
import { SearchMatches } from '@flows/flow-b/v1/components/SearchMatches';
import { SpeechBubble } from '@flows/flow-b/v1/components/SpeechBubble';
import { MenuButton } from '@flows/flow-b/v1/components/MenuButton';
import { ResponseSection } from '@flows/flow-b/v1/components/ResponseSection';
import { ActionCardAccount } from '@flows/flow-b/v1/components/ActionCardAccount';
import { ActionCardFreeze } from '@flows/flow-b/v1/components/ActionCardFreeze';
import { FrozenCard } from '@flows/flow-b/v1/components/FrozenCard';
import { ShowAllCardsButton } from '@flows/flow-b/v1/components/ShowAllCardsButton';
import { Transactions } from '@flows/flow-b/v1/components/Transactions';
import { VoiceVisualiser } from '@flows/flow-b/v1/components/VoiceVisualiser';
import { VoiceControls } from '@flows/flow-b/v1/components/VoiceControls';
import { VoiceResponse } from '@flows/flow-b/v1/components/VoiceResponse';
import { LoadIndicator } from '@flows/flow-b/v1/components/LoadIndicator';
import { HandoverCard } from '@flows/flow-b/v1/components/HandoverCard';
import { WaitCard } from '@flows/flow-b/v1/components/WaitCard';
import { GradientHelpText } from '@flows/flow-b/v1/components/GradientHelpText';
import { AnimatedWords } from '@flows/flow-b/v1/components/AnimatedWords';
import { useVoiceAmplitude } from '@flows/flow-b/v1/hooks/useVoiceAmplitude';
import { useSpeechRecognition } from '@flows/flow-b/v1/hooks/useSpeechRecognition';
import { bgState2, bgState3, bgState4, bgState5 } from '@flows/flow-b/v1/videoSources';
import CardBlue from '@shared/assets/images/card-blue.svg';
import IconFreeze from '@shared/assets/icons/icon-freeze.svg';
import IconNoFreeze from '@shared/assets/icons/icon-no-freeze.svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { effra } from '@shared/tokens/typography';

// ── Account card data for response ───────────────────────
const ACCOUNT_CARDS = [
  { image: require('@shared/assets/images/card-blue-thumb.png'), name: 'Barclays Blue\nVisa Debit', displayName: 'Barclays Blue Visa Debit', lastFour: '4920' },
  { image: require('@shared/assets/images/card-dark-thumb.png'), name: 'Private Bank\nMastercard', displayName: 'Private Bank Mastercard', lastFour: '8259' },
  { image: require('@shared/assets/images/card-dark-thumb.png'), name: 'Private Bank\nMastercard', displayName: 'Private Bank Mastercard', lastFour: '7341' },
];

// ── Timing ────────────────────────────────────────────────
const FADE_OUT_MS = 250;
const SLIDE_MS = 400;
const FADE_IN_MS = 350;

// ── Search match data ─────────────────────────────────────
const ALL_MATCHES = [
  // Generic banking
  "Set up a standing order",
  "Check my payment status",
  "Apply for an overdraft",
  "Report a suspicious transaction",
  "How do I change my address?",
  "Cancel a direct debit",
  "Request a new chequebook",
  "Increase my transfer limit",
  // I want / I need
  "I want to pay a bill",
  "I want to check my balance",
  "I want to transfer money",
  "I want to freeze my card",
  "I want to view my statements",
  "I need a replacement card",
  "I need to update my phone number",
  // I'm
  "I'm locked out of my account",
  "I'm going abroad, will my card work?",
  // I've lost
  "I've lost a cheque",
  "I've lost my credit card",
  "I've lost my PIN",
  "I've lost my wallet",
  "I've lost my card",
];

function getMatches(query: string): string[] {
  if (!query.trim()) return [];
  const lower = query.toLowerCase();
  return ALL_MATCHES.filter((m) => m.toLowerCase().startsWith(lower)).slice(0, 5);
}

type ScreenMode = 'home' | 'search' | 'voice';

export default function FlowBV1Screen() {
  const { width, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [mode, setMode] = useState<ScreenMode>('home');
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const searchInputRef = useRef<TextInput>(null);

  // Keep elements mounted during exit animations
  const [showHome, setShowHome] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [showVoiceResponse, setShowVoiceResponse] = useState(false);
  const [voiceAnswerIndex, setVoiceAnswerIndex] = useState(0);
  const [conversationStep, setConversationStep] = useState(0);

  const isHome = mode === 'home';
  const hasQuery = query.length > 0;
  const isConversation = submittedQuery !== null;
  const matches = getMatches(query);

  // ── Animation values ──
  const homeOpacity = useRef(new Animated.Value(1)).current;
  const homeHeaderY = useRef(new Animated.Value(0)).current;
  const homeNavY = useRef(new Animated.Value(0)).current;
  const navOpacity = useRef(new Animated.Value(1)).current;

  const searchBackOpacity = useRef(new Animated.Value(0)).current;
  const searchWelcomeOpacity = useRef(new Animated.Value(0)).current;
  const searchWelcomeY = useRef(new Animated.Value(20)).current;
  const searchBottomY = useRef(new Animated.Value(200)).current;
  const searchBottomOpacity = useRef(new Animated.Value(0)).current;

  const searchResultsOpacity = useRef(new Animated.Value(0)).current;
  const searchSuggestionsOpacity = useRef(new Animated.Value(1)).current;
  const conversationOpacity = useRef(new Animated.Value(0)).current;
  const responseOpacity = useRef(new Animated.Value(0)).current;
  const bgImageOpacity = useRef(new Animated.Value(1)).current;
  const keyboardOffset = useRef(new Animated.Value(0)).current;
  const voiceOpacity = useRef(new Animated.Value(0)).current;
  const voiceBubbleOpacity = useRef(new Animated.Value(0)).current;
  const voiceResponseOpacity = useRef(new Animated.Value(0)).current;
  const voiceScale = useVoiceAmplitude(showVoice && !isMicMuted && !isThinking);
  const { transcript, interimTranscript, messageCount, reset: resetSpeech } = useSpeechRecognition(showVoice && !isMicMuted);

  // ── Voice bubble animation + thinking state ──
  useEffect(() => {
    if (messageCount === 0 || !transcript) return;

    // Animate bubble in
    Animated.timing(voiceBubbleOpacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(voiceBubbleOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });

    // Enter thinking state for 3 seconds, then show response
    setIsThinking(true);
    setShowVoiceResponse(false);
    voiceResponseOpacity.setValue(0);
    if (messageCount > 1) setVoiceAnswerIndex(prev => prev + 1);
    const timer = setTimeout(() => {
      setIsThinking(false);
      setShowVoiceResponse(true);
      Animated.timing(voiceResponseOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 4000);
    return () => clearTimeout(timer);
  }, [messageCount]);

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
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  // ── Background video players ──
  const bgVideoPlayer2 = useVideoPlayer(bgState2, (p) => {
    p.loop = false;
    p.playbackRate = 1.0;
    p.muted = true;
    p.volume = 0;
  });
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
  const [activeBgVideo, setActiveBgVideo] = useState<2 | 3 | 4 | 5 | null>(null);

  // Play video after VideoView mounts (web needs the <video> DOM element registered first)
  useEffect(() => {
    if (activeBgVideo === null) return;
    const players: Record<number, typeof bgVideoPlayer2> = {
      2: bgVideoPlayer2, 3: bgVideoPlayer3,
      4: bgVideoPlayer4, 5: bgVideoPlayer5,
    };
    const player = players[activeBgVideo];
    if (player) {
      player.currentTime = 0;
      player.play();
    }
  }, [activeBgVideo]);

  // ── Forward transition: Home → Search ──
  const animateToSearch = useCallback(() => {
    setMode('search');
    setShowSearch(true);

    // Start background video (state 2)
    setActiveBgVideo(2);

    // Phase 1: Fade out home elements + crossfade background
    Animated.parallel([
      Animated.timing(bgImageOpacity, {
        toValue: 0,
        duration: FADE_OUT_MS,
        useNativeDriver: true,
      }),
      Animated.timing(homeOpacity, {
        toValue: 0,
        duration: FADE_OUT_MS,
        useNativeDriver: true,
      }),
      Animated.timing(navOpacity, {
        toValue: 0,
        duration: FADE_OUT_MS,
        useNativeDriver: true,
      }),
      Animated.timing(homeHeaderY, {
        toValue: -20,
        duration: FADE_OUT_MS,
        useNativeDriver: true,
      }),
      Animated.timing(homeNavY, {
        toValue: 40,
        duration: FADE_OUT_MS,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowHome(false);

      // Phase 2: Fade in search elements
      Animated.parallel([
        // Back button
        Animated.timing(searchBackOpacity, {
          toValue: 1,
          duration: FADE_IN_MS,
          useNativeDriver: true,
        }),
        // Welcome text (staggered)
        Animated.sequence([
          Animated.delay(80),
          Animated.parallel([
            Animated.timing(searchWelcomeOpacity, {
              toValue: 1,
              duration: FADE_IN_MS,
              useNativeDriver: true,
            }),
            Animated.timing(searchWelcomeY, {
              toValue: 0,
              duration: FADE_IN_MS,
              useNativeDriver: true,
            }),
          ]),
        ]),
        // Bottom container (Suggestions + SearchField) slides up
        Animated.sequence([
          Animated.delay(160),
          Animated.parallel([
            Animated.timing(searchBottomY, {
              toValue: 0,
              duration: SLIDE_MS,
              useNativeDriver: true,
            }),
            Animated.timing(searchBottomOpacity, {
              toValue: 1,
              duration: SLIDE_MS,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start(() => {
        searchInputRef.current?.focus();
      });
    });
  }, []);

  // ── Reverse transition: Search → Home ──
  const animateToHome = useCallback(() => {
    setMode('home');

    // Phase 1: Fade out search elements
    Animated.parallel([
      Animated.timing(searchBackOpacity, {
        toValue: 0,
        duration: FADE_OUT_MS,
        useNativeDriver: true,
      }),
      Animated.timing(searchWelcomeOpacity, {
        toValue: 0,
        duration: FADE_OUT_MS,
        useNativeDriver: true,
      }),
      Animated.timing(searchWelcomeY, {
        toValue: 20,
        duration: FADE_OUT_MS,
        useNativeDriver: true,
      }),
      Animated.timing(searchBottomY, {
        toValue: 200,
        duration: FADE_OUT_MS,
        useNativeDriver: true,
      }),
      Animated.timing(searchBottomOpacity, {
        toValue: 0,
        duration: FADE_OUT_MS,
        useNativeDriver: true,
      }),
      Animated.timing(searchResultsOpacity, {
        toValue: 0,
        duration: FADE_OUT_MS,
        useNativeDriver: true,
      }),
      Animated.timing(searchSuggestionsOpacity, {
        toValue: 1,
        duration: 0,
        useNativeDriver: true,
      }),
      Animated.timing(conversationOpacity, {
        toValue: 0,
        duration: FADE_OUT_MS,
        useNativeDriver: true,
      }),
      Animated.timing(responseOpacity, {
        toValue: 0,
        duration: FADE_OUT_MS,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setQuery('');
      setSubmittedQuery(null);
      setShowResponse(false);
      setConversationStep(0);
      conversationOpacity.setValue(0);
      responseOpacity.setValue(0);
      setShowSearch(false);
      setShowHome(true);

      // Stop videos
      bgVideoPlayer2.pause();
      bgVideoPlayer3.pause();
      bgVideoPlayer4.pause();
      bgVideoPlayer5.pause();
      setActiveBgVideo(null);

      // Set nav opacity directly to avoid backdrop-filter bug on web
      navOpacity.setValue(1);

      // Phase 2: Fade in home elements + restore static background
      Animated.parallel([
        Animated.timing(bgImageOpacity, {
          toValue: 1,
          duration: FADE_IN_MS,
          useNativeDriver: true,
        }),
        Animated.timing(homeOpacity, {
          toValue: 1,
          duration: FADE_IN_MS,
          useNativeDriver: true,
        }),
        Animated.timing(homeHeaderY, {
          toValue: 0,
          duration: FADE_IN_MS,
          useNativeDriver: true,
        }),
        Animated.timing(homeNavY, {
          toValue: 0,
          duration: FADE_IN_MS,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  // ── Forward transition: Search → Voice ──
  const animateToVoice = useCallback(() => {
    Keyboard.dismiss();
    setMode('voice');

    // Phase 1: Fade out search elements
    Animated.parallel([
      Animated.timing(searchBackOpacity, {
        toValue: 0,
        duration: FADE_OUT_MS,
        useNativeDriver: true,
      }),
      Animated.timing(searchWelcomeOpacity, {
        toValue: 0,
        duration: FADE_OUT_MS,
        useNativeDriver: true,
      }),
      Animated.timing(searchBottomOpacity, {
        toValue: 0,
        duration: FADE_OUT_MS,
        useNativeDriver: true,
      }),
      Animated.timing(searchSuggestionsOpacity, {
        toValue: 0,
        duration: FADE_OUT_MS,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowSearch(false);
      setShowVoice(true);
      setIsMicMuted(false);
      voiceBubbleOpacity.setValue(0);

      // Phase 2: Fade in voice UI
      Animated.timing(voiceOpacity, {
        toValue: 1,
        duration: FADE_IN_MS,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  // ── Reverse transition: Voice → Home ──
  const animateFromVoice = useCallback(() => {
    setMode('home');

    // Phase 1: Fade out voice elements
    Animated.timing(voiceOpacity, {
      toValue: 0,
      duration: FADE_OUT_MS,
      useNativeDriver: true,
    }).start(() => {
      setShowVoice(false);
      setShowHome(true);
      setIsThinking(false);
      setShowVoiceResponse(false);
      setVoiceAnswerIndex(0);
      voiceResponseOpacity.setValue(0);
      resetSpeech();

      // Reset search animation values
      searchBackOpacity.setValue(0);
      searchWelcomeOpacity.setValue(0);
      searchWelcomeY.setValue(20);
      searchBottomY.setValue(200);
      searchBottomOpacity.setValue(0);
      searchSuggestionsOpacity.setValue(1);

      // Stop videos
      bgVideoPlayer2.pause();
      bgVideoPlayer3.pause();
      bgVideoPlayer4.pause();
      bgVideoPlayer5.pause();
      setActiveBgVideo(null);

      // Set nav opacity directly to avoid backdrop-filter bug on web
      navOpacity.setValue(1);

      // Phase 2: Fade in home elements + restore static background
      Animated.parallel([
        Animated.timing(bgImageOpacity, {
          toValue: 1,
          duration: FADE_IN_MS,
          useNativeDriver: true,
        }),
        Animated.timing(homeOpacity, {
          toValue: 1,
          duration: FADE_IN_MS,
          useNativeDriver: true,
        }),
        Animated.timing(homeHeaderY, {
          toValue: 0,
          duration: FADE_IN_MS,
          useNativeDriver: true,
        }),
        Animated.timing(homeNavY, {
          toValue: 0,
          duration: FADE_IN_MS,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  // ── Submit query → conversation state ──
  const handleSubmit = useCallback(() => {
    if (!query.trim()) return;
    const submitted = query.trim();
    setSubmittedQuery(submitted);
    setQuery('');

    // Start background video (state 3)
    setActiveBgVideo(3);

    // Fade out search results, fade in conversation, then show response
    Animated.parallel([
      Animated.timing(searchResultsOpacity, {
        toValue: 0,
        duration: FADE_OUT_MS,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.timing(conversationOpacity, {
        toValue: 1,
        duration: FADE_IN_MS,
        useNativeDriver: true,
      }).start(() => {
        // After conversation bubble is visible, show AI response
        setTimeout(() => {
          setShowResponse(true);
          Animated.timing(responseOpacity, {
            toValue: 1,
            duration: FADE_IN_MS,
            useNativeDriver: true,
          }).start();
        }, 800);
      });
    });
  }, [query]);

  // ── Card selected → advance conversation ──
  const handleCardSelect = useCallback((cardName: string) => {
    // Start background video (state 4)
    setActiveBgVideo(4);

    // Fade out response + bubble
    Animated.parallel([
      Animated.timing(responseOpacity, {
        toValue: 0,
        duration: FADE_OUT_MS,
        useNativeDriver: true,
      }),
      Animated.timing(conversationOpacity, {
        toValue: 0,
        duration: FADE_OUT_MS,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowResponse(false);
      setSubmittedQuery(cardName);
      setConversationStep(1);
      responseOpacity.setValue(0);

      // Fade bubble back in, then show new response
      Animated.timing(conversationOpacity, {
        toValue: 1,
        duration: FADE_IN_MS,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          setShowResponse(true);
          Animated.timing(responseOpacity, {
            toValue: 1,
            duration: FADE_IN_MS,
            useNativeDriver: true,
          }).start();
        }, 400);
      });
    });
  }, []);

  // ── Freeze selected → advance to frozen state ──
  const handleFreezeSelect = useCallback((label: string) => {
    // Start background video (state 5)
    setActiveBgVideo(5);

    Animated.parallel([
      Animated.timing(responseOpacity, {
        toValue: 0,
        duration: FADE_OUT_MS,
        useNativeDriver: true,
      }),
      Animated.timing(conversationOpacity, {
        toValue: 0,
        duration: FADE_OUT_MS,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowResponse(false);
      setSubmittedQuery(label);
      setConversationStep(2);
      responseOpacity.setValue(0);

      Animated.timing(conversationOpacity, {
        toValue: 1,
        duration: FADE_IN_MS,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          setShowResponse(true);
          Animated.timing(responseOpacity, {
            toValue: 1,
            duration: FADE_IN_MS,
            useNativeDriver: true,
          }).start();
        }, 400);
      });
    });
  }, []);

  // ── Animate search suggestions opacity when query changes ──
  useEffect(() => {
    if (mode !== 'search') return;
    Animated.timing(searchSuggestionsOpacity, {
      toValue: hasQuery ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    Animated.timing(searchResultsOpacity, {
      toValue: hasQuery ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [hasQuery, mode]);

  return (
    <View
      testID="screen"
      style={styles.root}
    >
      <StatusBar style="dark" />

      {/* Background video (only mount the active one) */}
      {activeBgVideo === 2 && (
        <VideoView
          player={bgVideoPlayer2}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width,
            height: screenHeight,
          }}
          contentFit="fill"
          nativeControls={false}
          allowsPictureInPicture={false}
        />
      )}
      {activeBgVideo === 3 && (
        <VideoView
          player={bgVideoPlayer3}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width,
            height: screenHeight,
          }}
          contentFit="fill"
          nativeControls={false}
          allowsPictureInPicture={false}
        />
      )}
      {activeBgVideo === 4 && (
        <VideoView
          player={bgVideoPlayer4}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width,
            height: screenHeight,
          }}
          contentFit="fill"
          nativeControls={false}
          allowsPictureInPicture={false}
        />
      )}
      {activeBgVideo === 5 && (
        <VideoView
          player={bgVideoPlayer5}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width,
            height: screenHeight,
          }}
          contentFit="fill"
          nativeControls={false}
          allowsPictureInPicture={false}
        />
      )}

      {/* Background static image (on top, fades out to reveal video) */}
      <Animated.Image
        source={require('@shared/assets/images/bg-state1.png')}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width,
          height: screenHeight,
          opacity: bgImageOpacity,
        }}
        resizeMode="stretch"
      />


      {/* ═══ HOME: Scrollable content (includes Header + Suggestions) ═══ */}
      {showHome && (
        <Animated.View
          renderToHardwareTextureAndroid
          style={[styles.contentScroll, { opacity: homeOpacity }]}
        >
          <ScrollView
            testID="content"
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={{ transform: [{ translateY: homeHeaderY }] }}>
              <Header />
            </Animated.View>
            <View testID="help-section" style={styles.helpSection}>
              <TouchableOpacity
                testID="help-text-row"
                style={styles.helpTextRow}
                onPress={animateToSearch}
                activeOpacity={0.7}
              >
                <View style={styles.cursor} />
                <GradientHelpText />
              </TouchableOpacity>
              <Suggestions onSelect={(label) => {
                if (label === 'Send money to Sam P.') {
                  router.push('/(flows)/flow-d/v1');
                }
              }} />
            </View>

            <View testID="accounts-section" style={styles.accountsSection}>
              <View testID="accounts-list" style={styles.accountsList}>
                <Text style={styles.sectionTitle}>Your accounts</Text>
                <View style={styles.cards}>
                  <AccountCard
                    cardImage={CardBlue}
                    name="Barclays Blue"
                    balance="£1,331"
                    balanceCents=".38"
                    subtext="00-00-00  123456789"
                  />
                  <AccountCard
                    cardImage={require('@shared/assets/images/card-platinum.png')}
                    name="Barclaycard Platinum"
                    balance="£524"
                    balanceCents=".89"
                    subtext="of £10,000.00 spent"
                    hasShadow
                  />
                </View>
              </View>
              <View style={styles.accountsList}>
                <Text style={styles.sectionTitle}>Latest updates</Text>
                <Transactions />
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      )}

      {/* ═══ HOME: Floating nav ═══ */}
      <Animated.View
        renderToHardwareTextureAndroid
        pointerEvents={showHome ? 'auto' : 'none'}
        style={[
          styles.navContainer,
          { opacity: navOpacity, transform: [{ translateY: homeNavY }], zIndex: 10 },
        ]}
      >
        <Nav2 activeIndex={activeTab} onTabPress={setActiveTab} />
      </Animated.View>

      {/* ═══ SEARCH: BackButton ═══ */}
      {showSearch && (
        <Animated.View renderToHardwareTextureAndroid style={{ opacity: searchBackOpacity }}>
          <BackButton onPress={animateToHome} />
        </Animated.View>
      )}

      {/* ═══ SEARCH: WelcomeText ═══ */}
      {showSearch && !hasQuery && !isConversation && (
        <Animated.View
          style={{
            opacity: searchWelcomeOpacity,
            transform: [{ translateY: searchWelcomeY }],
          }}
        >
          <WelcomeText />
        </Animated.View>
      )}

      {/* ═══ SEARCH: Menu + Conversation bubble ═══ */}
      {showSearch && isConversation && (
        <View style={styles.conversationRow}>
          <MenuButton />
          <Animated.View
            style={[styles.conversationBubbleWrap, { opacity: conversationOpacity }]}
          >
            <SpeechBubble text={submittedQuery} />
          </Animated.View>
        </View>
      )}

      {/* ═══ SEARCH: AI Response ═══ */}
      {showSearch && isConversation && showResponse && (
        <Animated.View needsOffscreenAlphaCompositing style={[styles.responseContainer, { opacity: responseOpacity }]}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.responseScroll}>
            {conversationStep === 0 && (
              <ResponseSection
                text="I can help with that right now. Which card have you lost?"
                cards={
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.accountCardsRow}
                  >
                    {ACCOUNT_CARDS.map((card, i) => (
                      <ActionCardAccount
                        key={i}
                        image={card.image}
                        name={card.name}
                        lastFour={card.lastFour}
                        onPress={() => handleCardSelect(card.displayName)}
                      />
                    ))}
                  </ScrollView>
                }
                button={<ShowAllCardsButton />}
              />
            )}
            {conversationStep === 1 && (
              <ResponseSection
                text="Would you like to freeze this card so it can't be used?"
                subtitle="You can unfreeze it instantly if you find it."
                cards={
                  <View style={styles.freezeCardsRow}>
                    <ActionCardFreeze
                      icon={IconFreeze}
                      label={'Yes, freeze\nthis card'}
                      onPress={() => handleFreezeSelect('Yes, freeze this card')}
                    />
                    <ActionCardFreeze
                      icon={IconNoFreeze}
                      label={'No, do not\nfreeze this card'}
                    />
                  </View>
                }
              />
            )}
            {conversationStep === 2 && (
              <View style={styles.frozenCardWrap}>
                <FrozenCard
                  cardName="Visa Debit"
                  lastFour="4920"
                />
              </View>
            )}
          </ScrollView>
        </Animated.View>
      )}

      {/* ═══ VOICE: Listening screen ═══ */}
      {showVoice && (
        <Animated.View style={[styles.voiceContainer, { opacity: voiceOpacity }]}>
          <BackButton onPress={animateFromVoice} />

          {/* Finalized transcript as speech bubble */}
          {transcript ? (
            <View style={styles.conversationRow}>
              <MenuButton />
              <Animated.View style={[styles.conversationBubbleWrap, { opacity: voiceBubbleOpacity }]}>
                <SpeechBubble text={transcript} />
              </Animated.View>
            </View>
          ) : (
            <View style={styles.voiceMenuWrap}>
              <MenuButton />
            </View>
          )}

          {/* Interim text or listening indicator */}
          {interimTranscript ? (
            <View style={styles.transcriptContainer}>
              <AnimatedWords text={interimTranscript} style={styles.interimText} />
            </View>
          ) : !transcript && messageCount === 0 ? (
            <View style={styles.listeningContainer} pointerEvents="none">
              <Text style={styles.listeningText}>Listening...</Text>
            </View>
          ) : null}

          {/* AI response after thinking */}
          {showVoiceResponse && !interimTranscript && (
            <Animated.View style={{ opacity: voiceResponseOpacity, paddingTop: 30 }}>
              {voiceAnswerIndex === 0 ? (
                <VoiceResponse
                  key="answer-0"
                  text="Let's get this sorted immediately. I'll start by looking at your transactions."
                  indicator={<LoadIndicator />}
                  indicatorDuration={4000}
                  secondText={"Good news \u2014 nothing else looks out of the ordinary. I\u2019ve checked your last 90 days of transactions and this is the only payment to Clear Web Solutions on your account. No repeat charges, no linked payments.\n\nWould you like me to connect you to a Barclays specialist?"}
                />
              ) : (
                <VoiceResponse
                  key="answer-1"
                  text="I've put together a summary, you won't need to repeat yourself."
                  indicator={<LoadIndicator text="Connecting you to a specialist..." />}
                  indicatorDuration={4000}
                  card={<View style={{ gap: 14 }}><WaitCard /><HandoverCard /></View>}
                />
              )}
            </Animated.View>
          )}

          <View style={styles.voiceVisualiserWrap}>
            <VoiceVisualiser scale={voiceScale} thinking={isThinking} />
          </View>
          <View style={[styles.voiceControlsWrap, { paddingBottom: insets.bottom + 40 }]}>
            <VoiceControls isMuted={isMicMuted} onMicToggle={() => setIsMicMuted(m => !m)} onStop={animateFromVoice} />
          </View>
        </Animated.View>
      )}

      {/* ═══ SEARCH: Bottom container (results + suggestions + field) ═══ */}
      {showSearch && (
        <Animated.View
          style={[
            styles.searchBottomContainer,
            {
              opacity: searchBottomOpacity,
              transform: [{ translateY: searchBottomY }, { translateY: keyboardOffset }],
            },
          ]}
        >
          {/* Search results (when typing) */}
          {hasQuery && (
            <Animated.View
              style={[styles.searchResultsRow, { opacity: searchResultsOpacity }]}
            >
              <ConversationsButton />
              {matches.length > 0 && (
                <SearchMatches matches={matches} query={query} />
              )}
            </Animated.View>
          )}

          {/* Suggestion chips (when not typing and not in conversation) */}
          {!isConversation && (
            <Animated.View
              style={{ opacity: searchSuggestionsOpacity }}
              pointerEvents={!hasQuery ? 'auto' : 'none'}
            >
              {!hasQuery && (
                <View style={styles.searchSuggestionsRow}>
                  <Suggestions onSelect={(label) => setQuery(label)} />
                </View>
              )}
            </Animated.View>
          )}

          <SearchField2
            ref={searchInputRef}
            value={query}
            onChangeText={setQuery}
            onSubmit={handleSubmit}
            onMicPress={animateToVoice}
            docked
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  contentScroll: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contentContainer: {
    paddingBottom: 145,
    gap: 50,
  },
  helpSection: {
    height: 188,
    justifyContent: 'flex-end',
    gap: 14,
  },
  helpTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 30,
  },
  cursor: {
    width: 3,
    height: 32,
    backgroundColor: '#086EDF',
    borderRadius: 2,
  },
  accountsSection: {
    gap: 30,
    paddingHorizontal: 30,
  },
  accountsList: {
    gap: 10,
  },
  sectionTitle: {
    ...effra('700'),
    fontSize: 20,
    color: '#000000',
  },
  cards: {
    gap: 17,
  },
  navContainer: {
    position: 'absolute',
    bottom: 59 - 30,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
    paddingBottom: 30,
  },
  searchResultsRow: {
    gap: 20,
    paddingBottom: 16,
    paddingHorizontal: 30,
  },
  searchBottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  searchSuggestionsRow: {
    paddingVertical: 16,
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
    marginTop: 77,
  },
  responseScroll: {
    paddingBottom: 130,
  },
  accountCardsRow: {
    gap: 14,
    paddingLeft: 30,
    paddingRight: 14,
    paddingVertical: 12,
  },
  freezeCardsRow: {
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  frozenCardWrap: {
    paddingHorizontal: 30,
  },
  voiceContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F5F5F5',
  },
  voiceMenuWrap: {
    position: 'absolute',
    left: 30,
    top: 60,
    zIndex: 10,
  },
  transcriptContainer: {
    marginTop: 120,
    paddingHorizontal: 32,
    maxHeight: 200,
    zIndex: 10,
  },
  listeningContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    zIndex: 10,
  },
  listeningText: {
    ...effra('400'),
    fontSize: 24,
    color: '#046FE4',
    textAlign: 'center',
  },
  transcriptText: {
    ...effra('400'),
    fontSize: 24,
    color: '#046FE4',
    textAlign: 'right',
    lineHeight: 34,
  },
  interimText: {
    ...effra('400'),
    fontSize: 24,
    color: '#046FE4',
    opacity: 0.6,
    textAlign: 'right',
    lineHeight: 24,
  },
  voiceVisualiserWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  voiceControlsWrap: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
