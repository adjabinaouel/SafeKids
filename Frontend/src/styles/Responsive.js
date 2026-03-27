// src/styles/Responsive.js (version corrigée et améliorée)
import { Dimensions, Platform, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');
const scale = PixelRatio.getFontScale() || 1;
const fontScale = PixelRatio.getFontScale() || 1;

const isSmallDevice = width < 360;
const isMediumDevice = width < 414;
const isLargeDevice = width >= 768;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const responsive = {
  // Espacements
  spacing: {
    xs: clamp(PixelRatio.roundToNearestPixel(4 * scale), 4, 8),
    sm: clamp(PixelRatio.roundToNearestPixel(8 * scale), 8, 12),
    md: clamp(PixelRatio.roundToNearestPixel(12 * scale), 12, 20),
    lg: clamp(PixelRatio.roundToNearestPixel(16 * scale), 16, 28),
    xl: clamp(PixelRatio.roundToNearestPixel(24 * scale), 24, 36),
    xxl: clamp(PixelRatio.roundToNearestPixel(32 * scale), 32, 48),
  },

  // Typographie
  typography: {
    h1: clamp(PixelRatio.roundToNearestPixel(28 * fontScale), 24, 36),
    h2: clamp(PixelRatio.roundToNearestPixel(24 * fontScale), 20, 32),
    h3: clamp(PixelRatio.roundToNearestPixel(20 * fontScale), 18, 28),
    body: clamp(PixelRatio.roundToNearestPixel(16 * fontScale), 14, 18),
    caption: clamp(PixelRatio.roundToNearestPixel(13 * fontScale), 12, 15),
  },

  // Tailles fixes
  sizes: {
    iconSize: clamp(PixelRatio.roundToNearestPixel(24 * scale), 20, 32),
    inputHeight: clamp(PixelRatio.roundToNearestPixel(52 * scale), 48, 60),
    buttonHeight: clamp(PixelRatio.roundToNearestPixel(50 * scale), 44, 56),
    borderRadius: clamp(PixelRatio.roundToNearestPixel(16 * scale), 12, 24),
    cardPadding: clamp(PixelRatio.roundToNearestPixel(20 * scale), 16, 28),
  },

  // Layout
  layout: {
    maxCardWidth: clamp(width * 0.88, 320, 480),
    safePaddingH: clamp(Math.min(width * 0.08, 32), 16, 40),
    safePaddingT: clamp(height * 0.06, 40, 80),
    safePaddingB: clamp(height * 0.06, 40, 80),
  },

  // Breakpoints
  screen: {
    xs: width < 360,
    sm: width >= 360 && width < 414,
    md: width >= 414 && width < 768,
    lg: width >= 768 && width < 1024,
    xl: width >= 1024,
  },

  // Fonctions utiles
  wp: (percentage) => clamp(width * (percentage / 100), width * 0.1, width * 0.95),
  hp: (percentage) => clamp(height * (percentage / 100), height * 0.1, height * 0.95),

  scale: scale,
  fontScale: fontScale,
  aspectRatio: width / height,
};

export default responsive;