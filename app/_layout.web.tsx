import { useState, useEffect } from 'react';
import { Dimensions, View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

// Fixed phone frame for desktop browsers
const PHONE = { w: 412, h: 923 };

// Threshold: viewports at or below this width go full-screen
const MOBILE_BREAKPOINT = 500;

// Mutable ref for Dimensions monkey-patch
const deviceRef = { w: PHONE.w, h: PHONE.h };

const originalGet = Dimensions.get.bind(Dimensions);
Dimensions.get = (dim: 'window' | 'screen') => {
  const real = originalGet(dim);
  return { ...real, width: deviceRef.w, height: deviceRef.h };
};

export default function RootLayout() {
  const [viewport, setViewport] = useState({
    w: window.innerWidth,
    h: window.innerHeight,
  });

  useEffect(() => {
    const onResize = () =>
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isMobile = viewport.w <= MOBILE_BREAKPOINT;
  const device = isMobile ? viewport : PHONE;

  // Keep monkey-patch in sync
  deviceRef.w = device.w;
  deviceRef.h = device.h;

  const [fontsLoaded] = useFonts({
    effra: require('@shared/assets/fonts/effra-regular.ttf'),
    'effra-light': require('@shared/assets/fonts/effra-light.ttf'),
    'effra-medium': require('@shared/assets/fonts/effra-medium.ttf'),
    'effra-bold': require('@shared/assets/fonts/effra-bold.ttf'),
  });

  useEffect(() => {
    document.documentElement.style.backgroundColor = isMobile ? '#012A45' : '#1a1a1a';
    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';
  }, [isMobile]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={[styles.outer, !isMobile && styles.outerDesktop]}>
      <View
        style={[
          styles.device,
          isMobile
            ? styles.deviceMobile
            : { width: device.w, height: device.h },
        ]}
      >
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(flows)" />
        </Stack>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
  },
  outerDesktop: {
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  device: {
    // @ts-ignore — web-only: 'clip' visually clips like 'hidden' but doesn't
    // create a scroll container, so inner horizontal ScrollViews still work
    overflow: 'clip',
  },
  deviceMobile: {
    flex: 1,
  },
});
