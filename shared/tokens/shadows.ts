import { Platform } from 'react-native';

// Subtle: cards, containers (opacity 0.04)
export const shadowSubtle = Platform.select({
  ios: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 9.4,
  },
  android: {
    elevation: 2,
  },
  web: {
    boxShadow: '0px 4px 9.4px rgba(0,0,0,0.04)',
  },
});

// Medium: action cards, buttons (opacity 0.17)
export const shadowMedium = Platform.select({
  ios: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.17,
    shadowRadius: 28,
  },
  android: {
    elevation: 5,
  },
  web: {
    boxShadow: '0px 6px 28px rgba(0,0,0,0.17)',
  },
});

// Strong: nav bar (opacity 0.2)
export const shadowStrong = Platform.select({
  ios: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 11,
  },
  android: {
    elevation: 8,
  },
  web: {
    boxShadow: '0px 0px 11px rgba(0,0,0,0.2)',
  },
});
