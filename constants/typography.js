import { Platform } from 'react-native';

export const typography = {
  // Using system default fonts
  // fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',

  fontSizes: {
    h1: 28,
    h2: 24,
    h3: 20,
    h4: 18,
    body: 16,
    large: 18,
    medium: 16,
    small: 14,
    caption: 12,
  },
  fontWeights: {
    bold: '700',
    semiBold: '600',
    medium: '500',
    regular: '400',
    normal: '400', // alias for regular
    light: '300',
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    loose: 1.8,
  },
  letterSpacings: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
}; 