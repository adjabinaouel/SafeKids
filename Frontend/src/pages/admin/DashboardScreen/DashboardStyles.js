// src/pages/admin/DashboardScreen/DashboardStyles.js
import { StyleSheet, Platform, Dimensions } from 'react-native';
import { COLORS } from '../../../theme';

const { width } = Dimensions.get('window');

export default StyleSheet.create({

  // ── Layout ────────────────────────────────────────────────────────────────
  root: {
    flex: 1,
    backgroundColor: '#F8F7FF',
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 100 : 90,
  },

  // ── Hero ──────────────────────────────────────────────────────────────────
  heroGreeting: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
    lineHeight: 36,
  },
  heroAccent: {
    color: '#FCD34D',
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(52,211,153,0.15)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.30)',
  },
  heroPillDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#34D399',
  },
  heroPillText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  heroIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F87171',
    borderWidth: 1.5,
    borderColor: '#1E1B4B',
  },

  // ── Stat cards ────────────────────────────────────────────────────────────
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.11)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    overflow: 'hidden',
  },
  statIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.8,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.88)',
    marginTop: 3,
  },
  statSub: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 2,
  },

  // ── Section header ────────────────────────────────────────────────────────
  sectionWrap: {
    paddingHorizontal: 22,
    marginTop: 28,
    marginBottom: 4,
  },
  sectionPill: {
    backgroundColor: '#EDE9FE',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(109,40,217,0.15)',
  },
  sectionPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6D28D9',
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E1B4B',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
  },
  sectionRow: {
    marginBottom: 16,
  },

  // ── Info banner cards ─────────────────────────────────────────────────────
  infoBanner: {
    flex: 1,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    gap: 8,
  },
  infoBannerIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  infoBannerValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E1B4B',
    letterSpacing: -0.5,
  },
  infoBannerTitle: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 15,
  },

  // ── Step cards ────────────────────────────────────────────────────────────
  stepCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  stepAccent: {
    position: 'absolute',
    left: 0, top: 20, bottom: 20,
    width: 4,
    borderRadius: 4,
  },
  stepIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  stepBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  stepBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E1B4B',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  stepDesc: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 17,
  },
  stepArrow: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.10)',
  },
  footerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  footerText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
});