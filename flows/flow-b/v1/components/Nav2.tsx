import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { shadowStrong } from '@shared/tokens/shadows';
import IconStart from '@shared/assets/icons/icon-nav2-start.svg';
import IconGrow from '@shared/assets/icons/icon-nav2-grow.svg';
import IconCoach from '@shared/assets/icons/icon-nav2-coach.svg';
import { SvgProps } from 'react-native-svg';
import { effra } from '@shared/tokens/typography';

type NavItem = {
  label: string;
  Icon: React.FC<SvgProps>;
};

const NAV_ITEMS: NavItem[] = [
  { label: 'Start', Icon: IconStart },
  { label: 'Grow', Icon: IconGrow },
  { label: 'Coach', Icon: IconCoach },
];

interface NavProps {
  activeIndex?: number;
  onTabPress?: (index: number) => void;
}

export function Nav2({ activeIndex = 0, onTabPress }: NavProps) {
  return (
    <View style={styles.outer}>
      <View testID="nav2" style={styles.container}>
        <BlurView
          intensity={30}
          tint="light"
          experimentalBlurMethod="dimezisBlurView"
          style={styles.blur}
        />
        {NAV_ITEMS.map((item, index) => {
          const isActive = index === activeIndex;
          return (
            <TouchableOpacity
              key={item.label}
              style={styles.tab}
              onPress={() => onTabPress?.(index)}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityLabel={item.label}
              accessibilityState={{ selected: isActive }}
            >
              <item.Icon width={25} height={25} />
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: 45,
    ...shadowStrong,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 45,
    height: 66,
    width: 229,
    gap: 35,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
  },
  tab: {
    alignItems: 'center',
    gap: 4,
  },
  label: {
    ...effra(),
    fontSize: 12,
    color: '#616161',
  },
  labelActive: {
    fontWeight: '500',
    color: '#086EDF',
  },
});
