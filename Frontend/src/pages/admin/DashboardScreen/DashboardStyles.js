// src/pages/admin/DashboardScreen/DashboardStyles.js
import { StyleSheet, Platform, Dimensions } from 'react-native';
import { COLORS, GLASS } from '../../../theme';

const { width } = Dimensions.get('window');

export default StyleSheet.create({

  // ── Layout ────────────────────────────────────────────────────────────────
  root: {
    flex: 1,
    backgroundColor: COLORS.surface || '#F5F3FF',
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 100 : 90,
  },

  // ── Hero ──────────────────────────────────────────────────────────────────
  heroGreeting: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.62)',
    fontWeight: '500',
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 27,
    fontWeight: '800',
    color: '#fff',
    marginTop: 2,
    letterSpacing: -0.8,
    lineHeight: 33,
  },
  heroAccent: {
    color: '#FCD34D',
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  heroPillDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#34D399',
  },
  heroPillText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.82)',
    fontWeight: '600',
  },
  heroIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Mini stat cards (dans le hero) ────────────────────────────────────────
  miniStatCard: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    overflow: 'hidden',
  },
  miniStatIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  miniStatValue: {
    fontSize: 23,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.6,
  },
  miniStatTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  miniStatSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.52)',
    marginTop: 2,
  },

  // ── KPI Card flottante ────────────────────────────────────────────────────
  kpiCard: {
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios:     { shadowColor: '#4C1D95', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.22, shadowRadius: 28 },
      android: { elevation: 12 },
    }),
  },
  kpiGradient: {
    padding: 22,
    borderRadius: 24,
    overflow: 'hidden',
  },
  kpiSuperTitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  kpiTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.4,
  },
  kpiBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(253,211,77,0.18)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(253,211,77,0.28)',
  },
  kpiBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FCD34D',
  },
  kpiMetric: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    gap: 4,
  },
  kpiMetricBorder: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.10)',
  },
  kpiMetricVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
    marginTop: 4,
  },
  kpiMetricLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.50)',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 13,
  },

  // ── Sections ──────────────────────────────────────────────────────────────
  sectionWrap: {
    paddingHorizontal: 22,
    marginTop: 32,
    marginBottom: 4,
  },
  sectionRow: {
    marginBottom: 14,
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
    letterSpacing: 0.7,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.text || '#1E293B',
    letterSpacing: -0.4,
    marginBottom: 2,
  },
  sectionSub: {
    fontSize: 12,
    color: COLORS.textMuted || '#94A3B8',
    marginTop: 2,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7C3AED',
  },
  legendText: {
    fontSize: 11,
    color: COLORS.textMuted || '#94A3B8',
    fontWeight: '600',
  },

  // ── Glass card (contenu des sections) ─────────────────────────────────────
  glassCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.08)',
    overflow: 'hidden',
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 14 },
      android: { elevation: 4 },
    }),
  },

  // ── Raccourcis ────────────────────────────────────────────────────────────
  quickBtn: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 10 },
      android: { elevation: 4 },
    }),
  },
  quickBtnIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickBtnLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.2,
  },

  // ── Genre ─────────────────────────────────────────────────────────────────
  genreLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text || '#1E293B',
  },
  genreVal: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  genreBarBg: {
    height: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(139,92,246,0.10)',
    overflow: 'hidden',
  },
  genreBarFill: {
    height: 10,
    borderRadius: 6,
  },

  // ── Charts ────────────────────────────────────────────────────────────────
  chartWrap: {
    paddingTop: 4,
  },
  chartLabel: {
    fontSize: 10,
    color: COLORS.textMuted || '#94A3B8',
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },

  // ── Activités récentes ────────────────────────────────────────────────────
  actCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.08)',
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  actAvatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actInitials: {
    fontSize: 14,
    fontWeight: '900',
    color: '#fff',
  },
  actName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text || '#1E293B',
    marginBottom: 2,
  },
  actSub: {
    fontSize: 12,
    color: COLORS.textMuted || '#94A3B8',
  },
  actBadge: {
    marginLeft: 'auto',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  actBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },

  // ── Premium card ──────────────────────────────────────────────────────────
  premiumPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(253,211,77,0.14)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(253,211,77,0.25)',
  },
  premiumPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FCD34D',
    letterSpacing: 0.5,
  },
  premiumTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.6,
    lineHeight: 30,
    marginBottom: 10,
  },
  premiumSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.52)',
    lineHeight: 20,
  },
  premiumBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FCD34D',
    borderRadius: 16,
    paddingVertical: 15,
  },
  premiumBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  premiumBtnGhost: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.08)',
  },
  footerText: {
    fontSize: 11,
    color: COLORS.textMuted || '#94A3B8',
    fontWeight: '500',
  },
});