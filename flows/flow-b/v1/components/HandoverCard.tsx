import { Image, StyleSheet, Text, View } from 'react-native';
import IconPhoneIncoming from '@shared/assets/icons/icon-phone-incoming.svg';
import { effra } from '@shared/tokens/typography';
import { shadowMedium } from '@shared/tokens/shadows';

export function HandoverCard() {
  return (
    <View style={styles.card}>
      {/* Header: avatar + info + phone button */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarWrap}>
            <Image
              source={require('@shared/assets/images/specialist-sarah.png')}
              style={styles.avatar}
              resizeMode="cover"
            />
          </View>
          <View style={styles.nameBlock}>
            <View style={styles.nameTexts}>
              <Text style={styles.name}>Sarah</Text>
              <Text style={styles.subtitle}>Disputes Team</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Barclays Specialist</Text>
            </View>
          </View>
        </View>
        <View style={styles.phonePill}>
          <IconPhoneIncoming width={15} height={15} />
          <Text style={styles.phoneText}>phone call</Text>
        </View>
      </View>

      {/* Summary section */}
      <View style={styles.summary}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Summary</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.transactionRow}>
          <View>
            <Text style={styles.transactionLabel}>Unauthorised transaction</Text>
            <Text style={styles.transactionMerchant}>Clearwave Solutions</Text>
          </View>
          <Text style={styles.transactionAmount}>£340.32</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.warningRow}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningText}>No other payments to this merchant found</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.warningRow}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningText}>You've confirmed you don't recognise this charge on your account</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.warningRow}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningText}>Account flagged for investigation</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 33,
    padding: 14,
    gap: 14,
    ...shadowMedium,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  avatarWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  avatar: {
    width: 77,
    height: 108,
    marginLeft: -8.5,
    marginTop: -4,
  },
  nameBlock: {
    gap: 8,
  },
  nameTexts: {
    paddingHorizontal: 10,
  },
  name: {
    ...effra('700'),
    fontSize: 20,
    color: '#346AD7',
    lineHeight: 22,
  },
  subtitle: {
    ...effra('400'),
    fontSize: 14,
    color: '#346AD7',
    lineHeight: 15.4,
  },
  badge: {
    borderWidth: 1,
    borderColor: '#346AD7',
    borderRadius: 29,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  badgeText: {
    ...effra('400'),
    fontSize: 12,
    color: '#346AD7',
    lineHeight: 13.2,
  },
  phonePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#E5F7FD',
    borderRadius: 47,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  phoneText: {
    ...effra('400'),
    fontSize: 12,
    color: '#006FEB',
    lineHeight: 13.2,
  },
  summary: {
    backgroundColor: '#E5F7FD',
    borderRadius: 23,
    paddingHorizontal: 14,
    paddingVertical: 20,
    gap: 15,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryTitle: {
    ...effra('700'),
    fontSize: 20,
    color: '#346AD7',
    lineHeight: 28,
  },
  divider: {
    height: 1,
    backgroundColor: '#C8DFF7',
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  transactionLabel: {
    ...effra('400'),
    fontSize: 14,
    color: '#000063',
    lineHeight: 19.6,
  },
  transactionMerchant: {
    ...effra('500'),
    fontSize: 16,
    color: '#000063',
    lineHeight: 22.4,
  },
  transactionAmount: {
    ...effra('500'),
    fontSize: 20,
    color: '#000063',
    lineHeight: 28,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  warningIcon: {
    fontSize: 16,
  },
  warningText: {
    ...effra('400'),
    fontSize: 16,
    color: '#000063',
    lineHeight: 15.4,
    flex: 1,
  },
});
