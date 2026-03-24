import { useEffect, useRef } from 'react';
import { Dimensions, View, StyleSheet } from 'react-native';
import { Stack, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

// Device presets
const PHONE   = { w: 412,  h: 923  };   // Pixel 9 Pro
const WATCH   = { w: 410,  h: 502  };   // Apple Watch Ultra
const DESKTOP = { w: 1920, h: 1080 };   // 1080p landscape

// Mutable ref for Dimensions monkey-patch
const deviceRef = { w: PHONE.w, h: PHONE.h };

const originalGet = Dimensions.get.bind(Dimensions);
Dimensions.get = (dim: 'window' | 'screen') => {
  const real = originalGet(dim);
  return { ...real, width: deviceRef.w, height: deviceRef.h };
};

export default function RootLayout() {
  const segments = useSegments();
  const isWatch   = segments.includes('flow-w' as never);
  const isDesktop = segments.includes('flow-i' as never);
  const device = isDesktop ? DESKTOP : isWatch ? WATCH : PHONE;

  // Keep monkey-patch in sync with current route
  deviceRef.w = device.w;
  deviceRef.h = device.h;

  const [fontsLoaded] = useFonts({
    effra: require('@shared/assets/fonts/effra-regular.ttf'),
    'effra-light': require('@shared/assets/fonts/effra-light.ttf'),
    'effra-medium': require('@shared/assets/fonts/effra-medium.ttf'),
    'effra-bold': require('@shared/assets/fonts/effra-bold.ttf'),
  });

  useEffect(() => {
    document.documentElement.style.backgroundColor = '#1a1a1a';
    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.outer}>
      <View
        style={[
          styles.device,
          {
            width: device.w,
            height: device.h,
          },
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
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  device: {
    overflow: 'hidden',
  },
});
