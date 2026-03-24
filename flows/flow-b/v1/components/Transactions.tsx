import { Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { effra } from '@shared/tokens/typography';
import { shadowSubtle } from '@shared/tokens/shadows';

type Transaction = {
  logo: ImageSourcePropType;
  name: string;
  amount: string;
};

const TRANSACTIONS: Transaction[] = [
  { logo: require('@shared/assets/images/merchant-wagamama.png'), name: 'Wagamama', amount: '£24.32' },
  { logo: require('@shared/assets/images/merchant-nike.png'), name: 'Nike', amount: '£14.32' },
  { logo: require('@shared/assets/images/merchant-helen.png'), name: 'Helen Smith', amount: '£14.32' },
  { logo: require('@shared/assets/images/merchant-waitrose.png'), name: 'Waitrose', amount: '£5.32' },
];

export function Transactions() {
  return (
    <View style={styles.container}>
      {TRANSACTIONS.map((tx, i) => (
        <View key={tx.name}>
          <View style={styles.row}>
            <View style={styles.left}>
              <Image source={tx.logo} style={styles.logo} />
              <Text style={styles.name}>{tx.name}</Text>
            </View>
            <Text style={styles.amount}>{tx.amount}</Text>
          </View>
          {i < TRANSACTIONS.length - 1 && <View style={styles.divider} />}
        </View>
      ))}
      <TouchableOpacity activeOpacity={0.7}>
        <Text style={styles.seeAll}>See all</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 29,
    padding: 20,
    gap: 20,
    ...shadowSubtle,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  logo: {
    width: 29,
    height: 29,
    borderRadius: 14.5,
  },
  name: {
    ...effra(),
    fontSize: 15,
    lineHeight: 21,
    color: '#252525',
  },
  amount: {
    ...effra(),
    fontSize: 15,
    lineHeight: 21,
    color: '#252525',
    textAlign: 'right',
    width: 73,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E0E0E0',
    marginTop: 20,
  },
  seeAll: {
    ...effra(),
    fontSize: 15,
    lineHeight: 21,
    color: '#346AD7',
  },
});
