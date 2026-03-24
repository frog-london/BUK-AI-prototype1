import { forwardRef } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { BlurView } from 'expo-blur';
import IconMic from '@shared/assets/icons/icon-mic.svg';
import { effra } from '@shared/tokens/typography';

interface SearchField2Props {
  value?: string;
  onChangeText?: (text: string) => void;
  onSubmit?: () => void;
  onMicPress?: () => void;
  docked?: boolean;
  autoFocus?: boolean;
}

export const SearchField2 = forwardRef<TextInput, SearchField2Props>(
  function SearchField2({ value, onChangeText, onSubmit, onMicPress, docked = false, autoFocus = false }, ref) {
    return (
      <View
        testID="search-field-2"
        style={[
          styles.container,
          docked ? styles.containerDocked : styles.containerExpanded,
        ]}
      >
        <BlurView
          intensity={40}
          tint="light"
          experimentalBlurMethod="dimezisBlurView"
          style={[StyleSheet.absoluteFill, { borderRadius: 28 }]}
        />
        <View style={styles.inputRow}>
          <TextInput
            ref={ref}
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder="Ask anything"
            placeholderTextColor="rgba(0, 0, 0, 0.35)"
            autoFocus={autoFocus}
            selectionColor="#086EDF"
            multiline
            blurOnSubmit
            returnKeyType="search"
            onSubmitEditing={onSubmit}
            accessibilityLabel="Search"
          />
          <TouchableOpacity
            onPress={onMicPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Voice input"
          >
            <IconMic width={40} height={40} />
          </TouchableOpacity>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.87)',
    paddingTop: 14,
    paddingHorizontal: 30,
  },
  containerDocked: {
    paddingBottom: 30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
  },
  containerExpanded: {
    height: 206,
    borderRadius: 30,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  input: {
    flex: 1,
    ...effra(),
    fontSize: 21.782,
    color: '#000000',
    padding: 0,
    textAlignVertical: 'center',
  },
  mic: {
    width: 40,
    height: 40,
  },
});
