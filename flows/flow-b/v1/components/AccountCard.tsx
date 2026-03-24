import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { shadowSubtle, shadowMedium } from '@shared/tokens/shadows';
import IconChevronRight from '@shared/assets/icons/icon-chevron-right.svg';
import IconMore from '@shared/assets/icons/icon-more.svg';
import { SvgProps } from 'react-native-svg';
import { effra } from '@shared/tokens/typography';

interface AccountCardProps {
  cardImage: ImageSourcePropType | React.FC<SvgProps>;
  name: string;
  balance: string;
  balanceCents: string;
  subtext: string;
  hasShadow?: boolean;
  onPress?: () => void;
}

export function AccountCard({
  cardImage,
  name,
  balance,
  balanceCents,
  subtext,
  hasShadow = false,
  onPress,
}: AccountCardProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={name}
    >
      <View style={styles.left}>
        {typeof cardImage === 'function' ? (
          <View style={[styles.card, hasShadow && (styles.cardShadow as any)]}>
            {React.createElement(cardImage, { width: 43, height: 68 })}
          </View>
        ) : (
          <Image
            source={cardImage}
            style={[styles.card, hasShadow && (styles.cardShadow as any)]}
            resizeMode="cover"
          />
        )}
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.balanceRow}>
            <Text style={styles.balanceMain}>{balance}</Text>
            <Text style={styles.balanceCents}>{balanceCents}</Text>
          </Text>
          <Text style={styles.subtext}>{subtext}</Text>
        </View>
      </View>
      <View style={styles.right}>
        <IconChevronRight width={25} height={25} />
        <IconMore width={25} height={25} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadowSubtle,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  card: {
    width: 43,
    height: 68,
    borderRadius: 5,
  },
  cardShadow: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
    ...shadowMedium,
  },
  info: {
    gap: 4,
    width: 136,
  },
  name: {
    ...effra(),
    fontSize: 14,
    lineHeight: 17,
    color: '#000000',
  },
  balanceRow: {
    ...effra('700'),
    color: '#06015D',
  },
  balanceMain: {
    ...effra('700'),
    fontSize: 25,
    lineHeight: 31,
    color: '#06015D',
  },
  balanceCents: {
    ...effra('700'),
    fontSize: 20,
    lineHeight: 24,
    color: '#06015D',
  },
  subtext: {
    ...effra(),
    fontSize: 14,
    lineHeight: 17,
    color: '#000000',
  },
  right: {
    height: 69,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
