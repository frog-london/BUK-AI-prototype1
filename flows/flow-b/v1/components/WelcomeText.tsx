import { Platform, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { effra } from '@shared/tokens/typography';

const WELCOME = 'Balance?\nTransaction?\nLife plan?\nAll of the above?';

function GradientText() {
  return (
    <MaskedView maskElement={<Text style={styles.text}>{WELCOME}</Text>}>
      <LinearGradient colors={['#00AEEF', '#000063']}>
        <Text style={[styles.text, { opacity: 0 }]}>{WELCOME}</Text>
      </LinearGradient>
    </MaskedView>
  );
}

function WebText() {
  return (
    <Text style={styles.text as any}>{WELCOME}</Text>
  );
}

export function WelcomeText() {
  return (
    <View testID="welcome-text" style={styles.container}>
      {Platform.OS === 'web' ? <WebText /> : <GradientText />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 30,
    paddingTop: 100,
    paddingBottom: 10,
  },
  text: {
    ...effra('300'),
    fontSize: 40,
    lineHeight: 44,
    // Web-only gradient properties (ignored on native)
    backgroundImage: 'linear-gradient(to bottom, #00AEEF, #000063)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  } as any,
});
