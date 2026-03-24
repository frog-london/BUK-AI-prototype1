import { useRef, useEffect, useState, useCallback } from 'react';
import {
  Animated,
  Image,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { effra } from '@shared/tokens/typography';
import { shadowMedium, shadowSubtle } from '@shared/tokens/shadows';
import IconMinusCircle from '@shared/assets/icons/icon-minus-circle.svg';
import IconPlusCircle from '@shared/assets/icons/icon-plus-circle.svg';
import IconChevronDown from '@shared/assets/icons/icon-chevron-down.svg';
import IconCheckShield from '@shared/assets/icons/icon-check-shield.svg';
import IconBarclaysEagle from '@shared/assets/icons/icon-barclays-eagle.svg';

interface ActionCardSendProps {
  variant: 'send' | 'edit' | 'confirm' | 'done';
  amount: number;
  onAmountPress?: () => void;
  onAmountChange?: (val: string) => void;
  onIncrement?: () => void;
  onDecrement?: () => void;
  onSubmit?: () => void;
}

const avatarSam = require('@shared/assets/images/avatar-sam.png');

// ── Sub-components ───────────────────────────────────────

function RecipientRow({ showChevron = true, compact = false }: { showChevron?: boolean; compact?: boolean }) {
  return (
    <View style={styles.recipientPill}>
      <View style={styles.recipientLeft}>
        <Image source={avatarSam} style={styles.avatar} />
        <View style={[styles.recipientText, compact && { paddingRight: 8 }]}>
          <Text style={styles.recipientName}>to Sam Paige</Text>
          <Text style={styles.recipientAccount}>1645 08121</Text>
        </View>
      </View>
      {showChevron && <IconChevronDown width={20} height={7} style={{ marginRight: 8 }} />}
    </View>
  );
}

function AccountPill() {
  return (
    <View style={styles.accountPill}>
      <View style={styles.accountLeft}>
        <IconBarclaysEagle width={25} height={25} />
        <Text style={styles.accountLabel}>Barclays Blue</Text>
      </View>
      <Text style={styles.accountBalance}>£1,331</Text>
      <IconChevronDown width={12} height={7} />
    </View>
  );
}

function TimingPill() {
  return (
    <View style={styles.timingPill}>
      <Text style={styles.timingLabel}>send right now</Text>
      <IconChevronDown width={12} height={7} />
    </View>
  );
}

function CtaButton({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <TouchableOpacity
      style={styles.ctaButton}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={styles.ctaText}>{label}</Text>
      <View style={styles.ctaInnerGlow} />
    </TouchableOpacity>
  );
}

// ── Main component ───────────────────────────────────────

export function ActionCardSend({
  variant,
  amount,
  onAmountPress,
  onAmountChange,
  onIncrement,
  onDecrement,
  onSubmit,
}: ActionCardSendProps) {
  const inputRef = useRef<TextInput>(null);
  const [confirmedDecimals, setConfirmedDecimals] = useState('00');
  const [editValue, setEditValue] = useState('');
  const [typedDecCount, setTypedDecCount] = useState(0);

  // ── Transition state machine ──
  const stepVariant = variant === 'edit' ? 'send' : variant;
  const [displayStep, setDisplayStep] = useState<'send' | 'confirm' | 'done'>(
    stepVariant as 'send' | 'confirm' | 'done',
  );
  const prevStepRef = useRef(stepVariant);

  // Animated values for variant transitions
  const plusMinusOpacity = useRef(new Animated.Value(1)).current;
  const referenceOpacity = useRef(new Animated.Value(1)).current;
  const outsidePillsOpacity = useRef(new Animated.Value(1)).current;
  const confirmPillsOpacity = useRef(new Animated.Value(0)).current;
  const confirmRowsMaxHeight = useRef(new Animated.Value(0)).current;
  const doneHeaderOpacity = useRef(new Animated.Value(0)).current;
  const ctaOpacity = useRef(new Animated.Value(1)).current;
  const ctaMaxHeight = useRef(new Animated.Value(100)).current;
  const recipientMaxWidth = useRef(new Animated.Value(999)).current;

  // Detect step changes and animate transitions
  useEffect(() => {
    const prevStep = prevStepRef.current;
    prevStepRef.current = stepVariant;
    if (prevStep === stepVariant) return;

    if (prevStep === 'send' && stepVariant === 'confirm') {
      // Phase 1: fade out send elements
      Animated.parallel([
        Animated.timing(plusMinusOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(referenceOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(outsidePillsOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start(() => {
        setDisplayStep('confirm');
        // Phase 2: grow innerCard — animate maxHeight from 0 to 130
        Animated.timing(confirmRowsMaxHeight, {
          toValue: Platform.OS === 'android' ? 138 : 130,
          duration: 300,
          useNativeDriver: false,
        }).start(() => {
          // Phase 3: fade in confirm pills
          Animated.timing(confirmPillsOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
        });
      });
    } else if (prevStep === 'confirm' && stepVariant === 'done') {
      // Phase 1: fade out confirm pills + CTA
      Animated.parallel([
        Animated.timing(confirmPillsOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(ctaOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start(() => {
        // Phase 2: shrink confirmRows + CTA height
        Animated.parallel([
          Animated.timing(confirmRowsMaxHeight, { toValue: 0, duration: 300, useNativeDriver: false }),
          Animated.timing(ctaMaxHeight, { toValue: 0, duration: 300, useNativeDriver: false }),
        ]).start(() => {
          // Phase 3: swap to done state
          setDisplayStep('done');
          // Phase 4: shrink recipient + fade in header
          Animated.parallel([
            Animated.timing(recipientMaxWidth, { toValue: 190, duration: 300, useNativeDriver: false }),
            Animated.timing(doneHeaderOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
          ]).start();
        });
      });
    }
  }, [stepVariant]);

  // ── Edit mode logic ──
  useEffect(() => {
    if (variant === 'edit') {
      const whole = Math.floor(amount).toString();
      if (confirmedDecimals !== '00') {
        setEditValue(`${whole}.${confirmedDecimals}`);
        setTypedDecCount(2);
      } else {
        setEditValue(whole);
        setTypedDecCount(0);
      }
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [variant]);

  // Save decimals whenever we leave edit mode
  useEffect(() => {
    if (variant !== 'edit' && editValue) {
      const dotIdx = editValue.indexOf('.');
      if (dotIdx >= 0) {
        setConfirmedDecimals(editValue.slice(dotIdx + 1).padEnd(2, '0').slice(0, 2));
      }
    }
  }, [variant]);

  const wholeAmount = Math.floor(amount).toString();
  const displayAmount =
    confirmedDecimals !== '00' ? `${wholeAmount}.${confirmedDecimals}` : wholeAmount;
  const formattedAmount = `${wholeAmount}.${confirmedDecimals}`;

  // Single handler for all text changes
  const handleChangeText = useCallback(
    (newText: string) => {
      const dotCount = (newText.match(/\./g) || []).length;
      if (dotCount >= 2) return;

      if (dotCount === 0) {
        const digits = newText.replace(/[^0-9]/g, '') || '0';
        const whole = digits.slice(0, 5);
        setEditValue(whole);
        setTypedDecCount(0);
        onAmountChange?.(whole);
        return;
      }

      const dotIdx = newText.indexOf('.');
      let whole = newText.slice(0, dotIdx).replace(/[^0-9]/g, '') || '0';
      if (whole.length > 5) whole = whole.slice(0, 5);
      let dec = newText.slice(dotIdx + 1).replace(/[^0-9]/g, '');
      if (dec.length > 2) dec = dec.slice(0, 2);

      setTypedDecCount(Math.min(dec.length, 2));
      setEditValue(`${whole}.${dec}`);
      onAmountChange?.(whole);
    },
    [onAmountChange],
  );

  const handleBlur = useCallback(() => {
    onAmountPress?.();
  }, [onAmountPress]);

  const dismissEdit = useCallback(() => {
    if (variant === 'edit') {
      Keyboard.dismiss();
    }
  }, [variant]);

  // Derive display values for edit variant
  const editDotIdx = editValue.indexOf('.');
  const editWholePart = editDotIdx >= 0 ? editValue.slice(0, editDotIdx) : editValue;
  const editRawDec = editDotIdx >= 0 ? editValue.slice(editDotIdx + 1) : '';
  const editDec0 = editRawDec.length >= 1 ? editRawDec[0] : '0';
  const editDec1 = editRawDec.length >= 2 ? editRawDec[1] : '0';

  const isEditMode = variant === 'edit';
  const ctaLabel =
    displayStep === 'confirm'
      ? 'Confirm and send'
      : isEditMode
        ? 'Send payment'
        : 'Verify and send payment';

  // ── Unified JSX ──
  return (
    <Pressable style={styles.outerContainer} onPress={isEditMode ? dismissEdit : undefined}>
      <View style={styles.innerCard}>
        {/* Done header */}
        {displayStep === 'done' && (
          <Animated.View needsOffscreenAlphaCompositing style={{ opacity: doneHeaderOpacity }}>
            <View style={styles.doneHeaderRow}>
              <IconCheckShield width={25} height={25} />
              <Text style={styles.doneHeaderText}>Money is on the way</Text>
            </View>
          </Animated.View>
        )}

        {/* Amount row */}
        {displayStep === 'send' && !isEditMode ? (
          <View style={styles.amountRowSpaced}>
            <Animated.View needsOffscreenAlphaCompositing style={{ opacity: plusMinusOpacity }}>
              <TouchableOpacity onPress={onDecrement} activeOpacity={0.7}>
                <IconMinusCircle width={31} height={31} />
              </TouchableOpacity>
            </Animated.View>
            <TouchableOpacity
              onPress={onAmountPress}
              activeOpacity={0.7}
              style={styles.amountTouchable}
            >
              <Text style={styles.amountCurrency}>£</Text>
              <Text style={styles.amountWhole}>{displayAmount}</Text>
            </TouchableOpacity>
            <Animated.View needsOffscreenAlphaCompositing style={{ opacity: plusMinusOpacity }}>
              <TouchableOpacity onPress={onIncrement} activeOpacity={0.7}>
                <IconPlusCircle width={31} height={31} />
              </TouchableOpacity>
            </Animated.View>
          </View>
        ) : displayStep === 'send' && isEditMode ? (
          <View style={styles.amountRowEditWrap}>
            <View style={styles.amountRowCenter}>
              <Text style={[styles.amountCurrency, { color: '#5E649D' }]}>£</Text>
              <View style={{ position: 'relative' }}>
                <Text style={styles.amountWhole} pointerEvents="none">
                  <Text style={{ color: '#06015D' }}>{editWholePart}</Text>
                  <Text style={{ color: typedDecCount > 0 ? '#06015D' : '#5E649D' }}>.</Text>
                  <Text style={{ color: typedDecCount >= 1 ? '#06015D' : '#5E649D' }}>
                    {editDec0}
                  </Text>
                  <Text style={{ color: typedDecCount >= 2 ? '#06015D' : '#5E649D' }}>
                    {editDec1}
                  </Text>
                </Text>
                <TextInput
                  ref={inputRef}
                  style={styles.amountEditInputOverlay}
                  value={editValue}
                  onChangeText={handleChangeText}
                  onBlur={handleBlur}
                  keyboardType="decimal-pad"
                  selectionColor="#06015D"
                  caretHidden={false}
                />
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.amountRowCenter}>
            <Text style={styles.amountCurrency}>£</Text>
            <Text style={styles.amountWhole}>{formattedAmount}</Text>
          </View>
        )}

        {/* Reference row — send/edit only */}
        {displayStep === 'send' && (
          <Animated.View needsOffscreenAlphaCompositing style={{ opacity: referenceOpacity }}>
            <View style={styles.referenceRow}>
              <Text style={styles.referenceText}>add a reference </Text>
              <Text style={styles.referencePlus}>+</Text>
            </View>
          </Animated.View>
        )}

        {/* Recipient — always visible */}
        <Animated.View style={{ maxWidth: recipientMaxWidth, alignSelf: 'center', width: '100%' }}>
          <RecipientRow showChevron={displayStep !== 'done'} compact={displayStep === 'done'} />
        </Animated.View>

        {/* Confirm pills — inside card for confirm variant */}
        {displayStep === 'confirm' && (
          <Animated.View style={{ maxHeight: confirmRowsMaxHeight, overflow: 'hidden', paddingBottom: Platform.OS === 'android' ? 8 : 0 }}>
            <Animated.View needsOffscreenAlphaCompositing style={{ opacity: confirmPillsOpacity }}>
              <View style={styles.confirmRows}>
                <AccountPillConfirm />
                <TimingPill />
              </View>
            </Animated.View>
          </Animated.View>
        )}
      </View>

      {/* Outside pills — send/edit only */}
      {displayStep === 'send' && (
        <Animated.View needsOffscreenAlphaCompositing style={{ opacity: outsidePillsOpacity }}>
          <View style={styles.pillsColumn}>
            <AccountPill />
            <TimingPill />
          </View>
        </Animated.View>
      )}

      {/* CTA — send/edit/confirm only */}
      {displayStep !== 'done' && (
        <Animated.View style={{ maxHeight: ctaMaxHeight, overflow: 'hidden', width: '100%' }}>
          <Animated.View needsOffscreenAlphaCompositing style={{ opacity: ctaOpacity, width: '100%' }}>
            <CtaButton label={ctaLabel} onPress={onSubmit} />
          </Animated.View>
        </Animated.View>
      )}
    </Pressable>
  );
}

// Account pill variant for Confirm (inside inner card, with chevron on right)
function AccountPillConfirm() {
  return (
    <View style={styles.confirmAccountPill}>
      <View style={styles.confirmAccountLeft}>
        <IconBarclaysEagle width={25} height={25} />
        <Text style={styles.accountLabel}>Barclays Blue</Text>
      </View>
      <Text style={styles.accountBalance}>£1,331</Text>
      <IconChevronDown width={20} height={7} />
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────

const styles = StyleSheet.create({
  outerContainer: {
    borderRadius: 33,
    padding: 16,
    gap: 14,
    alignItems: 'center',
    ...Platform.select({
      android: { backgroundColor: '#FFFFFF' },
      default: { ...shadowSubtle, backgroundColor: 'rgba(255, 255, 255, 0.7)' },
    }),
  },
  innerCard: {
    backgroundColor: '#E3F8FD',
    borderRadius: 17,
    paddingHorizontal: 14,
    paddingVertical: 16,
    gap: 20,
    width: '100%',
    alignItems: 'center',
  },

  // ── Amount ──
  amountRowSpaced: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    width: '100%',
  },
  amountTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  amountRowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    justifyContent: 'center',
  },
  amountCurrency: {
    ...effra('500'),
    fontSize: 40,
    lineHeight: 40,
    color: '#06015D',
    letterSpacing: -0.8,
    ...Platform.select({
      web: { textShadow: '0px 0.9px 9.2px rgba(0,0,0,0.25)' },
      default: {},
    }),
  },
  amountWhole: {
    ...effra('500'),
    fontSize: 60,
    lineHeight: 61,
    color: '#06015D',
    letterSpacing: -4.8,
    ...Platform.select({
      web: { textShadow: '0px 1.6px 16px rgba(0,0,0,0.25)' },
      default: {},
    }),
  },

  // ── Edit amount ──
  amountRowEditWrap: {
    width: '100%',
    alignItems: 'center',
  },
  amountEditInputOverlay: {
    ...effra('500'),
    fontSize: 60,
    lineHeight: 61,
    color: Platform.select({ android: '#00000000', default: 'transparent' }),
    letterSpacing: -4.8,
    padding: 0,
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    ...Platform.select({
      web: { outlineStyle: 'none', caretColor: '#06015D', WebkitTextFillColor: 'transparent' } as any,
      default: {},
    }),
  },

  // ── Reference ──
  referenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    justifyContent: 'center',
  },
  referenceText: {
    ...effra('500'),
    fontSize: 13.767,
    color: 'rgba(0, 0, 99, 0.66)',
    ...Platform.select({
      web: { textShadow: '0px 1.6px 16px rgba(0,0,0,0.25)' },
      default: {},
    }),
  },
  referencePlus: {
    ...effra('500'),
    fontSize: 13.767,
    color: 'rgba(0, 0, 99, 0.66)',
  },

  // ── Recipient ──
  recipientPill: {
    borderRadius: 27,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    ...shadowSubtle,
    ...Platform.select({
      android: { backgroundColor: '#FFFFFF' },
      default: { backgroundColor: 'rgba(255, 255, 255, 0.7)' },
    }),
  },
  recipientLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 37,
    height: 37,
    borderRadius: 18.5,
  },
  recipientText: {
    gap: 1,
  },
  recipientName: {
    ...effra('700'),
    fontSize: 14.93,
    color: '#06015D',
    lineHeight: 15,
  },
  recipientAccount: {
    ...effra(),
    fontSize: 12,
    lineHeight: 16.8,
    color: '#444444',
  },

  // ── Account pill ──
  accountPill: {
    borderRadius: 21.798,
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
    ...shadowSubtle,
    ...Platform.select({
      android: { backgroundColor: '#FFFFFF' },
      default: { backgroundColor: 'rgba(255, 255, 255, 0.72)' },
    }),
  },
  accountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  accountLabel: {
    ...effra('500'),
    fontSize: 13.767,
    color: '#346AD7',
  },
  accountBalance: {
    ...effra('700'),
    fontSize: 20,
    color: '#346AD7',
  },

  // ── Timing pill ──
  timingPill: {
    borderRadius: 21.798,
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    ...shadowSubtle,
    ...Platform.select({
      android: { backgroundColor: '#FFFFFF' },
      default: { backgroundColor: 'rgba(255, 255, 255, 0.72)' },
    }),
  },
  timingLabel: {
    ...effra('500'),
    fontSize: 13.767,
    color: '#346AD7',
  },

  // ── Pills column ──
  pillsColumn: {
    gap: 14,
  },

  // ── CTA button ──
  ctaButton: {
    backgroundColor: '#0384E6',
    borderRadius: 16,
    borderWidth: 0.8,
    borderColor: 'white',
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...Platform.select({ android: {}, default: shadowMedium }),
  },
  ctaText: {
    ...effra(),
    fontSize: 13.105,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  ctaInnerGlow: {
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

  // ── Confirm variant ──
  confirmRows: {
    gap: 14,
    width: '100%',
  },
  confirmAccountPill: {
    borderRadius: 21.798,
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    width: '100%',
    ...shadowSubtle,
    ...Platform.select({
      android: { backgroundColor: '#FFFFFF' },
      default: { backgroundColor: 'rgba(255, 255, 255, 0.72)' },
    }),
  },
  confirmAccountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  // ── Done variant ──
  doneHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  doneHeaderText: {
    ...effra('500'),
    fontSize: 20,
    color: '#000063',
  },
});
