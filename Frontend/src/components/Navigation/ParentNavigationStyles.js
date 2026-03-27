// src/components/Navigation/ParentNavigation.styles.js
import { StyleSheet, Platform, Dimensions } from 'react-native';
import { COLORS, GLASS, shadow } from '../../theme';

const { width } = Dimensions.get('window');
const IS_TABLET = width >= 768;

export default StyleSheet.create({

  // ── Layout ────────────────────────────────────────────────────────────────
  safeArea:        { flex: 1, backgroundColor: COLORS.white },
  tabletContainer: { flex: 1, flexDirection: 'row', backgroundColor: COLORS.white },

  // ── Header gradient ───────────────────────────────────────────────────────
  header: {
    paddingTop:        IS_TABLET ? 32 : 16,
    paddingBottom:     24,
    paddingHorizontal: 20,
  },
  headerTopRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 18,
  },
  headerGreeting: { fontSize: 13, color: 'rgba(255,255,255,0.70)', fontWeight: '600', marginBottom: 4 },
  headerTitle:    { fontSize: 24, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  headerAccent:   { color: '#FCD34D' },

  // Avatar header — glass hero
  headerAvatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: GLASS.hero.bg,
    borderWidth: 1.5, borderColor: GLASS.hero.border,
    justifyContent: 'center', alignItems: 'center',
    ...shadow(GLASS.hero.shadow, 6, 1, 14, 4),
  },

  // Stat pills hero
  statsRow: { flexDirection: 'row', columnGap: 8, marginBottom: 16 },
  statPill: {
    flex: 1,
    backgroundColor: GLASS.hero.bg,
    borderRadius: 14, paddingVertical: 10, alignItems: 'center',
    borderWidth: 1, borderColor: GLASS.hero.border,
  },
  statPillValue: { fontSize: 16, fontWeight: '900', color: '#fff', marginTop: 2 },
  statPillLabel: { fontSize: 9, color: 'rgba(255,255,255,0.62)', marginTop: 1, textTransform: 'uppercase', letterSpacing: 0.3 },

  // Search hero
  searchWrapper: {
    flexDirection: 'row', alignItems: 'center', columnGap: 10,
    backgroundColor: GLASS.hero.bg,
    borderRadius: 14, borderWidth: 1.5, borderColor: GLASS.hero.border,
    paddingHorizontal: 14, height: 48,
  },
  searchInput: {
    flex: 1, fontSize: 14, color: '#fff', fontWeight: '500',
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },

  // Filtres — glass léger
  filterRow:            { paddingVertical: 14, paddingLeft: 16 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: GLASS.light.bg, borderRadius: 20, marginRight: 8,
    borderWidth: 1.5, borderColor: GLASS.light.border,
    ...shadow(GLASS.light.shadow, 2, 1, 6, 1),
  },
  filterChipActive:     { backgroundColor: COLORS.text, borderColor: COLORS.text },
  filterChipText:       { fontSize: 12, fontWeight: '700', color: COLORS.textLight },
  filterChipTextActive: { color: COLORS.white },

  // Sections
  sectionWrap:      { paddingHorizontal: 16, marginBottom: 20 },
  sectionHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  sectionTitle:     { fontSize: 17, fontWeight: '900', color: COLORS.text, letterSpacing: -0.4 },
  sectionSub:       { fontSize: 12, color: COLORS.textMuted, marginBottom: 12 },
  sectionBadge:     { paddingHorizontal: 10, paddingVertical: 3, backgroundColor: COLORS.primaryMid, borderRadius: 20 },
  sectionBadgeText: { fontSize: 11, fontWeight: '700', color: COLORS.primary },

  // Bannière Premium
  premiumBanner:        { marginHorizontal: 16, marginBottom: 16, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: GLASS.dark.border },
  premiumBannerGradient:{ padding: 16, flexDirection: 'row', alignItems: 'center', columnGap: 12 },
  premiumBannerEmoji:   { fontSize: 26 },
  premiumBannerText:    { flex: 1 },
  premiumBannerTitle:   { color: COLORS.white, fontWeight: '800', fontSize: 14 },
  premiumBannerSub:     { color: 'rgba(255,255,255,0.72)', fontSize: 11, marginTop: 2 },
  premiumBannerBtn:     {
    backgroundColor: GLASS.hero.bg, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1, borderColor: GLASS.hero.border,
  },
  premiumBannerBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 12 },

  // Cartes TikTok / activités
  tiktokCard: {
    borderRadius: 22, padding: 20, height: 200,
    justifyContent: 'space-between',
    borderWidth: 1, borderColor: GLASS.dark.border,
    overflow: 'hidden',
    ...shadow(GLASS.dark.shadow, 8, 1, 20, 7),
  },
  tiktokBadge: {
    alignSelf: 'flex-start',
    backgroundColor: GLASS.dark.bg,
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, marginBottom: 4,
    borderWidth: 1, borderColor: GLASS.dark.border,
  },
  tiktokBadgeText: { fontSize: 10, fontWeight: '800', color: COLORS.white, textTransform: 'uppercase', letterSpacing: 0.5 },
  tiktokIcon:  { fontSize: 36, marginBottom: 4 },
  tiktokNom:   { fontSize: 16, fontWeight: '800', color: COLORS.white, lineHeight: 22, marginBottom: 8 },
  tiktokStats: { flexDirection: 'row', alignItems: 'center' },
  tiktokStat:  { alignItems: 'center', flex: 1 },
  tiktokStatVal: { fontSize: 15, fontWeight: '900', color: COLORS.white },
  tiktokStatLbl: { fontSize: 9, color: 'rgba(255,255,255,0.60)', marginTop: 1, textTransform: 'uppercase' },
  tiktokStatDivider: { width: 1, height: 28, backgroundColor: GLASS.dark.border },
  tiktokPlayBtn: {
    flexDirection: 'row', alignItems: 'center', columnGap: 6,
    backgroundColor: GLASS.hero.bg, alignSelf: 'flex-start',
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: GLASS.hero.border,
  },
  tiktokPlayText:       { fontSize: 12, fontWeight: '800', color: COLORS.white },
  tiktokPremiumBtn:     {
    backgroundColor: GLASS.dark.bg,
    borderWidth: 1.5, borderColor: GLASS.dark.border,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, alignItems: 'center',
  },
  tiktokPremiumBtnText: { color: COLORS.white, fontSize: 12, fontWeight: '800' },
  tiktokPagination:     { flexDirection: 'row', columnGap: 5 },
  tiktokDot:            { width: 5, height: 5, borderRadius: 3, backgroundColor: GLASS.dark.bg },
  tiktokDotActive:      { width: 16, backgroundColor: GLASS.hero.bg, borderRadius: 3 },

  // Badges
  premiumBadge:     { backgroundColor: COLORS.warningLight, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)' },
  premiumBadgeText: { fontSize: 9, fontWeight: '800', color: '#D97706' },
  lockedHint:       { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },

  // Carte liste — glass léger
  listCard: {
    flexDirection: 'row', alignItems: 'center', columnGap: 12,
    backgroundColor: GLASS.light.bg, borderRadius: 16, padding: 14, marginBottom: 9,
    borderLeftWidth: 4, borderWidth: 1, borderColor: GLASS.light.border,
    ...shadow(GLASS.light.shadow, 4, 1, 12, 3),
  },
  listCardLocked: {
    flexDirection: 'row', alignItems: 'center', columnGap: 12,
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 14, marginBottom: 9,
    borderLeftWidth: 3, borderLeftColor: '#CBD5E1',
    borderWidth: 1, borderColor: COLORS.border,
  },
  listIconWrap:   { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  listTopRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  listName:       { fontSize: 14, fontWeight: '700', color: COLORS.text, flex: 1, marginRight: 6 },
  listNameLocked: { fontSize: 14, fontWeight: '500', color: COLORS.textMuted, flex: 1, marginRight: 6 },
  listMeta:       { fontSize: 11, color: COLORS.textMuted, marginBottom: 3 },
  listStatText:   { fontSize: 11, fontWeight: '700' },

  // Communs
  badge:    { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  badgeText:{ fontSize: 10, fontWeight: '800' },
  diffRow:  { flexDirection: 'row', columnGap: 4 },
  diffDot:  { width: 8, height: 8, borderRadius: 4 },

  // Modal
  modalTopBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: GLASS.light.border,
    backgroundColor: 'rgba(255,255,255,0.88)',
  },
  modalTopBarTitle: { flex: 1, textAlign: 'center', fontSize: 15, fontWeight: '700', color: COLORS.text, marginHorizontal: 8 },
  modalCloseBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: GLASS.light.bg,
    borderWidth: 1, borderColor: GLASS.light.border,
    justifyContent: 'center', alignItems: 'center',
  },
  modalHero:     { padding: 22, margin: 16, borderRadius: 22, overflow: 'hidden' },
  modalHeroIcon: { fontSize: 44, marginBottom: 10 },
  modalHeroName: { fontSize: 20, fontWeight: '800', color: COLORS.white, letterSpacing: -0.3, marginBottom: 10 },
  modalHeroTags: { flexDirection: 'row', columnGap: 8, flexWrap: 'wrap' },
  modalTag: {
    paddingHorizontal: 10, paddingVertical: 4,
    backgroundColor: GLASS.dark.bg, borderRadius: 20,
    borderWidth: 1, borderColor: GLASS.dark.border,
  },
  modalTagText:  { fontSize: 11, fontWeight: '700', color: COLORS.white },
  modalStatsRow: { flexDirection: 'row', columnGap: 8, marginBottom: 4, paddingHorizontal: 16 },
  modalStatCard: {
    flex: 1, backgroundColor: GLASS.light.bg, borderRadius: 14, padding: 12, alignItems: 'center',
    borderWidth: 1, borderColor: GLASS.light.border,
  },
  modalStatIcon:  { fontSize: 18, marginBottom: 3 },
  modalStatValue: { fontSize: 14, fontWeight: '800', marginBottom: 1 },
  modalStatLabel: { fontSize: 9, color: COLORS.textLight },
  modalSection: {
    backgroundColor: GLASS.light.bg, borderRadius: 14, padding: 14,
    marginHorizontal: 16, marginTop: 10,
    borderWidth: 1, borderColor: GLASS.light.border,
  },
  modalSectionTitle: { fontSize: 11, fontWeight: '800', color: COLORS.text, textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 8 },
  modalSectionText:  { fontSize: 13, color: COLORS.textLight, lineHeight: 20 },
  noteRow: {
    backgroundColor: GLASS.light.bg, borderRadius: 12, padding: 12, marginTop: 8,
    borderLeftWidth: 3, borderWidth: 1, borderColor: GLASS.light.border,
  },
  noteRowTitle: { fontSize: 12, fontWeight: '800', marginBottom: 3 },
  noteRowText:  { fontSize: 12, color: COLORS.textLight, lineHeight: 18 },
  modalActions: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', columnGap: 10,
    paddingHorizontal: 16, paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 80 : 70,
    backgroundColor: 'rgba(255,255,255,0.90)',
    borderTopWidth: 1, borderTopColor: GLASS.light.border,
    ...shadow(GLASS.light.shadow, -6, 1, 20, 12),
  },
  btnSecondary: {
    flex: 1, height: 58, borderRadius: 16,
    backgroundColor: GLASS.light.bg,
    borderWidth: 2, borderColor: '#CBD5E1',
    justifyContent: 'center', alignItems: 'center', flexDirection: 'row', columnGap: 6,
  },
  btnSecondaryText: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  btnPrimary: {
    flex: 2, height: 58, borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)',
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', columnGap: 8,
    ...shadow(COLORS.primary, 10, 0.35, 18, 10),
  },
  btnPrimaryText: { color: COLORS.white, fontSize: 16, fontWeight: '800' },

  // Sidebar
  sidebar: {
    width: 228, backgroundColor: 'rgba(255,255,255,0.90)',
    paddingTop: 40, paddingBottom: 32, paddingHorizontal: 16,
    borderRightWidth: 1, borderRightColor: GLASS.light.border,
    ...shadow(GLASS.light.shadow, 2, 1, 14, 4),
  },
  sidebarLogoIcon:      { width: 42, height: 42, borderRadius: 12, marginBottom: 4, justifyContent: 'center', alignItems: 'center' },
  sidebarLogoText:      { fontSize: 18, fontWeight: '900', color: COLORS.text, marginBottom: 24 },
  sidebarNavItem:       { flexDirection: 'row', alignItems: 'center', columnGap: 12, borderRadius: 14, marginBottom: 4, paddingVertical: 11, paddingHorizontal: 14 },
  sidebarNavItemActive: { backgroundColor: GLASS.light.bg, borderWidth: 1, borderColor: GLASS.light.border },
  sidebarNavItemHover:  { backgroundColor: COLORS.primaryMid },
  sidebarNavLabel:      { fontSize: 14, fontWeight: '500', color: COLORS.textLight },
  sidebarNavLabelActive:{ color: COLORS.primary, fontWeight: '700' },

  // Bottom Nav — glass amélioré
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 24,
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.95)',     // ← Plus opaque pour meilleure visibilité
    borderTopWidth: 1,
    borderTopColor: GLASS.light.border,
    paddingTop: 10,
    ...shadow(GLASS.light.shadow, -12, 0.35, 25, 18), // Ombre plus marquée
  },
});