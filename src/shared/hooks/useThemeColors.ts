import { useColorScheme } from 'react-native';

const lightColors = {
  primary: '#EA1D2C',
  primaryLight: '#FFF1F1',
  success: '#05966A',
  successLight: '#DCFCE7',
  warning: '#D97706',
  warningLight: '#FFFBEB',
  error: '#C41C1C',
  errorLight: '#FEE4E4',
  info: '#2563EB',
  infoLight: '#EFF6FF',
  text: '#111111',
  textSecondary: '#5A5A5A',
  textTertiary: '#7D7D7D',
  textQuaternary: '#A8A8A8',
  textMuted: '#C8C8C8',
  background: '#FFFFFF',
  backgroundSecondary: '#F7F7F7',
  border: '#F0F0F0',
  borderSecondary: '#E4E4E4',
  icon: '#323232',
  white: '#FFFFFF',
  overlay: 'rgba(0,0,0,0.04)',
};

const darkColors = {
  primary: '#F74646',
  primaryLight: '#5F050D',
  success: '#22C55E',
  successLight: '#044E38',
  warning: '#F59E0B',
  warningLight: '#633112',
  error: '#F05252',
  errorLight: '#5A0707',
  info: '#3B82F6',
  infoLight: '#171D54',
  text: '#F8F8F8',
  textSecondary: '#A8A8A8',
  textTertiary: '#7D7D7D',
  textQuaternary: '#5A5A5A',
  textMuted: '#484848',
  background: '#0F0F0F',
  backgroundSecondary: '#171717',
  border: '#1C1C1C',
  borderSecondary: '#2D2D2D',
  icon: '#D2D2D2',
  white: '#FFFFFF',
  overlay: 'rgba(255,255,255,0.06)',
};

export function useThemeColors() {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? darkColors : lightColors;
}
