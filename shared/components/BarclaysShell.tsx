import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@shared/tokens/colors';

interface BarclaysShellProps {
  children: ReactNode;
  backgroundColor?: string;
  statusBarStyle?: 'light' | 'dark' | 'auto';
}

export function BarclaysShell({
  children,
  backgroundColor = colors.background,
  statusBarStyle = 'dark',
}: BarclaysShellProps) {
  return (
    <SafeAreaView style={[styles.root, { backgroundColor }]}>
      <StatusBar style={statusBarStyle} />
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
