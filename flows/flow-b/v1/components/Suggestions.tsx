import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { effra } from '@shared/tokens/typography';

const DEFAULT_SUGGESTIONS = [
  'Check my payment',
  'Send money to Sam P.',
  'Lost card',
  'Statements',
];

interface SuggestionsProps {
  suggestions?: string[];
  onSelect?: (label: string) => void;
}

export function Suggestions({
  suggestions = DEFAULT_SUGGESTIONS,
  onSelect,
}: SuggestionsProps) {
  return (
    <ScrollView
      testID="suggestions"
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.scroll}
    >
      {suggestions.map((label) => (
        <TouchableOpacity
          key={label}
          style={styles.chip}
          onPress={() => onSelect?.(label)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={label}
        >
          <Text style={styles.chipText}>{label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingLeft: 30,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderRadius: 19,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  chipText: {
    ...effra('500'),
    fontSize: 12,
    lineHeight: 11,
    color: '#346AD7',
  },
});
