import { StyleSheet, Text, View } from 'react-native';
import IconBell from '@shared/assets/icons/icon-bell.svg';
import IconProfile from '@shared/assets/icons/icon-profile.svg';
import { effra } from '@shared/tokens/typography';

interface HeaderProps {
  name?: string;
}

export function Header({ name = 'Emily' }: HeaderProps) {
  return (
    <View testID="header" style={styles.container}>
      <Text style={styles.name}>{name}</Text>
      <View style={styles.icons}>
        <IconBell width={40} height={40} />
        <IconProfile width={40} height={40} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingBottom: 8,
  },
  name: {
    ...effra('700'),
    fontSize: 29,
    color: '#000000',
  },
  icons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
