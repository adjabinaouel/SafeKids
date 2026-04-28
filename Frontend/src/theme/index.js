
import { Platform } from 'react-native';

// ── Palette ───────────────────────────────────────────────────────────────────
export const COLORS = {
  primary:      '#7C3AED',
  primaryDark:  '#5B21B6',
  primaryLight: '#F5F3FF',
  primaryMid:   '#EDE9FE',
  background:   '#FFFFFF',
  surface:      '#F8FAFC',
  surfaceAlt:   '#F1F5F9',
  text:         '#1E293B',
  textLight:    '#64748B',
  textMuted:    '#94A3B8',
  border:       '#E2E8F0',
  white:        '#FFFFFF',
  black:        '#000000',
  success:      '#10B981',
  successLight: '#D1FAE5',
  warning:      '#F59E0B',
  warningLight: '#FEF3C7',
  error:        '#EF4444',
  errorLight:   '#FEE2E2',
};


export const GLASS = {
  hero: {
    bg:      'rgba(255,255,255,0.18)',
    bgHover: 'rgba(255,255,255,0.28)',
    border:  'rgba(255,255,255,0.32)',
    shimmer: 'rgba(255,255,255,0.55)',
    shadow:  'rgba(124,58,237,0.18)',
    text:    '#FFFFFF',
    textSub: 'rgba(255,255,255,0.65)',
  },
  light: {
    bg:      'rgba(255,255,255,0.72)',
    bgHover: 'rgba(255,255,255,0.92)',
    border:  'rgba(148,163,184,0.20)',
    shimmer: 'rgba(255,255,255,0.95)',
    shadow:  'rgba(30,41,59,0.07)',
    text:    '#1E293B',
    textSub: '#64748B',
  },
  dark: {
    bg:      'rgba(255,255,255,0.07)',
    bgHover: 'rgba(255,255,255,0.13)',
    border:  'rgba(255,255,255,0.14)',
    shimmer: 'rgba(255,255,255,0.12)',
    shadow:  'rgba(0,0,0,0.30)',
    text:    '#FFFFFF',
    textSub: 'rgba(255,255,255,0.60)',
  },
};

// ── Gradients ─────────────────────────────────────────────────────────────────
export const gradients = {
  hero:    ['#2D0878', '#4C1D95', '#6D28D9', '#7C3AED'],
  heroAlt: ['#3B0A8A', '#5B21B6', '#7C3AED', '#9D68F5'],
  card:    ['#4C1D95', '#7C3AED', '#9D68F5'],
  premium: ['#1E1B4B', '#3730A3', '#4C1D95'],
  success: ['#065F46', '#10B981'],
  gold:    ['#92400E', '#D97706', '#FCD34D'],
  surface: ['#F5F3FF', '#FFFFFF'],
};

// ── Shadows ───────────────────────────────────────────────────────────────────
export const shadow = (color = 'rgba(0,0,0,0.1)', y = 8, opacity = 0.12, radius = 20, elevation = 6) =>
  Platform.select({
    ios: {
      shadowColor:   color,
      shadowOffset:  { width: 0, height: y },
      shadowOpacity: opacity,
      shadowRadius:  radius,
    },
    android: { elevation },
    web:     { boxShadow: `0 ${y}px ${radius}px ${color}` },
  });

// ── Radii ─────────────────────────────────────────────────────────────────────
export const radius = {
  xs:  8,
  sm:  12,
  md:  16,
  lg:  20,
  xl:  24,
  xxl: 28,
  pill:99,
};

// ── Spacing ───────────────────────────────────────────────────────────────────
export const spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  22,
  xxl: 32,
  section: 44,
};

// ── Typography ────────────────────────────────────────────────────────────────
export const type = {
  hero:    { fontSize: 27, fontWeight: '800', letterSpacing: -0.8, lineHeight: 33 },
  h1:      { fontSize: 23, fontWeight: '800', letterSpacing: -0.6, lineHeight: 29 },
  h2:      { fontSize: 20, fontWeight: '800', letterSpacing: -0.4, lineHeight: 27 },
  h3:      { fontSize: 17, fontWeight: '700', letterSpacing: -0.3 },
  title:   { fontSize: 15, fontWeight: '700' },
  body:    { fontSize: 13, lineHeight: 20 },
  caption: { fontSize: 12, lineHeight: 17 },
  micro:   { fontSize: 11, fontWeight: '600', letterSpacing: 1.3, textTransform: 'uppercase' },
  nano:    { fontSize: 9,  fontWeight: '800', letterSpacing: 0.7 },
};