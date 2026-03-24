import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { effra } from '@shared/tokens/typography';

interface SearchMatchesProps {
  matches: string[];
  query?: string;
  onSelect?: (match: string) => void;
}

function HighlightedText({ text, query }: { text: string; query?: string }) {
  if (!query?.trim()) {
    return <Text style={styles.matchText as any}>{text}</Text>;
  }

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const matchIndex = lowerText.indexOf(lowerQuery);

  if (matchIndex === -1) {
    return <Text style={[styles.matchText, styles.dimText] as any}>{text}</Text>;
  }

  const before = text.slice(0, matchIndex);
  const matched = text.slice(matchIndex, matchIndex + query.length);
  const after = text.slice(matchIndex + query.length);

  return (
    <Text style={styles.matchText as any}>
      {before ? <Text style={styles.dimText}>{before}</Text> : null}
      <Text>{matched}</Text>
      {after ? <Text style={styles.dimText}>{after}</Text> : null}
    </Text>
  );
}

export function SearchMatches({ matches, query, onSelect }: SearchMatchesProps) {
  return (
    <View testID="search-matches" style={styles.container}>
      {matches.map((match) => (
        <TouchableOpacity
          key={match}
          onPress={() => onSelect?.(match)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={match}
        >
          <HighlightedText text={match} query={query} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  matchText: {
    ...effra(),
    fontSize: 21.782,
    lineHeight: 26,
    color: '#346AD7',
  } as any,
  dimText: {
    color: '#346AD750',
  },
});
