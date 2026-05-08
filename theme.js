import { Platform } from 'react-native';

const colors = {
  primary: '#0F766E',
  primaryLight: '#2DD4BF',
  primaryDark: '#115E59',
  secondary: '#D9A441',
  secondaryLight: '#FFF3D9',
  accent: '#2563EB',
  accentLight: '#DBEAFE',
  background: '#F4F7FB',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5F9',
  text: '#0F172A',
  textSecondary: '#475569',
  textLight: '#94A3B8',
  border: '#E2E8F0',
  danger: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  waterBlue: '#0EA5E9',
  waterBlueBg: '#E0F2FE',
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  title: 28,
};

const fontFamily = {
  display: Platform.select({
    ios: 'AvenirNext-DemiBold',
    android: 'AvenirNext-DemiBold',
    default: 'AvenirNext-DemiBold',
  }),
  body: Platform.select({
    ios: 'AvenirNext-Regular',
    android: 'AvenirNext-Regular',
    default: 'AvenirNext-Regular',
  }),
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'Menlo',
  }),
};

const shadows = {
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
    },
    default: {
      boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.08)',
    },
  }),
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
    },
    android: {
      elevation: 4,
    },
    default: {
      boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.12)',
    },
  }),
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.16,
      shadowRadius: 12,
    },
    android: {
      elevation: 8,
    },
    default: {
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.16)',
    },
  }),
};

export const theme = {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontFamily,
  shadows,
};

export default theme;
