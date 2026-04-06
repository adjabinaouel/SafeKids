// src/pages/parents/ActivitiesScreen/ActivitiesStyles.js
import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const IS_TABLET = width >= 768;

// ─── DESIGN TOKENS — 100% alignés sur theme.js du HomeScreen ─────────────────
export const COLORS = {
  // Brand
  primary:      '#7C3AED',
  primaryDark:  '#5B21B6',
  primaryLight: '#F5F3FF',
  primaryMid:   '#EDE9FE',
  primaryGlow:  '#DDD6FE',

  // Surfaces
  background:   '#FFFFFF',
  surface:      '#F8FAFC',
  surfaceAlt:   '#F1F5F9',

  // Text
  text:         '#1E293B',
  textLight:    '#64748B',
  textMuted:    '#94A3B8',

  // Borders
  border:       '#E2E8F0',
  borderLight:  '#F1F5F9',

  // Misc
  white:        '#FFFFFF',
  black:        '#000000',
  success:      '#10B981',
  successLight: '#D1FAE5',
  warning:      '#F59E0B',
  warningLight: '#FEF3C7',
  error:        '#EF4444',
};

// ─── GLASS TOKENS — identiques à GLASS dans theme.js ─────────────────────────
export const GLASS = {
  hero: {
    bg:      'rgba(255,255,255,0.14)',
    border:  'rgba(255,255,255,0.28)',
    shadow:  '#000',
    shimmer: 'rgba(255,255,255,0.25)',
  },
  light: {
    bg:      'rgba(255,255,255,0.82)',
    border:  'rgba(226,232,240,0.7)',
    shadow:  '#94A3B8',
    shimmer: 'rgba(255,255,255,0.9)',
  },
  dark: {
    bg:      'rgba(255,255,255,0.07)',
    border:  'rgba(255,255,255,0.14)',
    shadow:  '#000',
    shimmer: 'rgba(255,255,255,0.10)',
  },
};

// ─── SHADOW HELPER — même signature que dans theme.js ────────────────────────
const mkShadow = (color, opacity, radius, elevation = 4, yOffset = 2) =>
  Platform.select({
    ios:     { shadowColor: color, shadowOffset: { width: 0, height: yOffset }, shadowOpacity: opacity, shadowRadius: radius },
    android: { elevation },
    web:     { boxShadow: `0 ${yOffset}px ${radius}px ${color}22` },
  });

export default StyleSheet.create({

  // ── Layout ────────────────────────────────────────────────────────────────
  safeArea:        { flex: 1, backgroundColor: COLORS.white },
  tabletContainer: { flex: 1, flexDirection: 'row', backgroundColor: COLORS.white },

  // ── Header hero — même pattern que HomeScreen LinearGradient ─────────────
  header: {
    paddingTop:        Platform.OS === 'ios' ? 58 : (IS_TABLET ? 32 : 34),
    paddingBottom:     36,
    paddingHorizontal: 22,
    overflow:          'hidden',
  },
  headerTopRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    marginBottom:   28,                    // +8 vs ancienne valeur
  },
  headerTitle: {
    fontSize:      27,                     // aligné sur HomeScreen (était 26)
    fontWeight:    '800',                  // aligné sur HomeScreen (était 900)
    color:         '#fff',
    letterSpacing: -0.8,                   // aligné sur HomeScreen
    lineHeight:    33,
  },
  headerSubtitle: {                        // ← nouveau : même "greeting" style
    fontSize:   13,
    color:      'rgba(255,255,255,0.62)',
    fontWeight: '500',
    marginBottom: 6,
  },
  headerAccent: { color: '#FCD34D' },

  // Avatar glass — copié pixel-perfect depuis HomeScreen
  headerAvatar: {
    width:           56,                   // +4 vs ancien (aligné HomeScreen)
    height:          56,
    borderRadius:    28,
    backgroundColor: GLASS.hero.bg,
    justifyContent:  'center',
    alignItems:      'center',
    borderWidth:     2,
    borderColor:     GLASS.hero.border,
    overflow:        'hidden',
    ...mkShadow('#000', 1, 18, 6, 6),
  },

  // Stats pills glass — même pattern que MockupCard du HomeScreen
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 }, // gap uniforme
  statPill: {
    flex:            1,
    backgroundColor: GLASS.hero.bg,
    borderRadius:    18,                   // +2 (aligné sur GlassCard hero)
    paddingVertical: 14,                   // +2
    alignItems:      'center',
    borderWidth:     1,
    borderColor:     GLASS.hero.border,
  },
  statPillIcon:  { fontSize: 15, marginBottom: 6 },              // ← nouveau
  statPillValue: {
    fontSize:   17,
    fontWeight: '800',                     // aligné HomeScreen (était 900)
    color:      '#fff',
    letterSpacing: -0.4,
  },
  statPillLabel: {
    fontSize:      10,
    color:         'rgba(255,255,255,0.55)',// légèrement abaissé (plus élégant)
    marginTop:     2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    fontWeight:    '500',
  },

  // Search glass — dans le header, même radius/hauteur que HomeScreen
  searchWrapper: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               10,
    backgroundColor:   GLASS.hero.bg,
    borderRadius:      18,                 // +2 (aligné sur GlassCard)
    borderWidth:       1.5,
    borderColor:       GLASS.hero.border,
    paddingHorizontal: 16,
    height:            52,                 // +2
  },
  searchIconWrap: {                        // ← nouveau : cohérent avec HomeScreen
    width:           36,
    height:          36,
    borderRadius:    12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent:  'center',
    alignItems:      'center',
  },
  searchInput: {
    flex:       1,
    fontSize:   14,
    color:      '#fff',
    fontWeight: '500',
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },

  // ── Filtres — style GlassPill/CategoryPill du HomeScreen ─────────────────
  filterRow:  { paddingVertical: 14, paddingLeft: 22 },
  filterChip: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               6,
    paddingHorizontal: 14,
    paddingVertical:   9,
    backgroundColor:   COLORS.white,
    borderRadius:      50,                 // pill parfait (aligné ActivitiesScreen)
    marginRight:       8,
    borderWidth:       1.5,
    borderColor:       COLORS.border,
    ...mkShadow(COLORS.primary, 0, 0, 0),  // pas d'ombre par défaut
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor:     COLORS.primary,
    ...mkShadow(COLORS.primary, 0.3, 10, 4, 6),
  },
  filterChipText:       { fontSize: 12, fontWeight: '700', color: COLORS.textMuted },
  filterChipTextActive: { color: COLORS.white },

  // ── Sections ──────────────────────────────────────────────────────────────
  sectionWrap:   { paddingHorizontal: 22, marginBottom: 24 },
  sectionHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   4,
  },
  sectionTitle: {
    fontSize:      23,                     // aligné HomeScreen (était 18)
    fontWeight:    '800',                  // aligné HomeScreen (était 900)
    color:         COLORS.text,
    letterSpacing: -0.6,
    lineHeight:    30,
  },
  sectionSub: {
    fontSize:     13,                      // aligné HomeScreen
    color:        COLORS.textMuted,
    lineHeight:   20,
    marginBottom: 22,
  },
  // GlassPill variant="primary" — copié depuis HomeScreen
  sectionBadge: {
    paddingHorizontal: 12,
    paddingVertical:   4,
    backgroundColor:   COLORS.primaryMid,
    borderRadius:      22,
    borderWidth:       1,
    borderColor:       COLORS.primaryGlow,
  },
  sectionBadgeText: { fontSize: 11, fontWeight: '800', color: COLORS.primary, letterSpacing: 0.5 },

  // ── Bannière Premium — alignée sur section Premium du HomeScreen ──────────
  premiumBanner:         { marginHorizontal: 22, marginBottom: 20, borderRadius: 28, overflow: 'hidden' }, // +6 borderRadius
  premiumBannerGradient: {
    padding:       24,                     // +6 (aligné HomeScreen premiumSection)
    flexDirection: 'row',
    alignItems:    'center',
    gap:           14,
    overflow:      'hidden',
  },
  premiumBannerEmoji: { fontSize: 28 },
  premiumBannerText:  { flex: 1 },
  premiumBannerTitle: {
    color:      COLORS.white,
    fontWeight: '800',
    fontSize:   15,
    letterSpacing: -0.2,
  },
  premiumBannerSub: {
    color:     'rgba(255,255,255,0.72)',   // légèrement abaissé (plus élégant)
    fontSize:  12,
    marginTop: 3,
    lineHeight: 17,
  },
  premiumBannerBtn: {
    backgroundColor: COLORS.white,
    borderRadius:    14,                   // +2 (aligné GlassButton)
    paddingHorizontal: 16,
    paddingVertical: 9,
    ...mkShadow('#000', 0.12, 8, 4, 4),
  },
  premiumBannerBtnText: { color: COLORS.primary, fontWeight: '800', fontSize: 13 },

  // ── Cartes TikTok (carrousel) ─────────────────────────────────────────────
  tiktokCard: {
    borderRadius:   24,
    padding:        22,
    height:         210,
    justifyContent: 'space-between',
    overflow:       'hidden',
    ...mkShadow('#000', 0.18, 20, 10, 10),
  },
  // Shimmer line (nouveau — aligné sur HomeScreen gradient cards)
  tiktokShimmer: {
    position:        'absolute',
    top:             0,
    left:            0,
    right:           0,
    height:          1,
    backgroundColor: GLASS.dark.shimmer,
    zIndex:          1,
  },
  tiktokBadge: {
    alignSelf:         'flex-start',
    backgroundColor:   GLASS.hero.bg,
    paddingHorizontal: 12,
    paddingVertical:   4,
    borderRadius:      22,
    borderWidth:       1,
    borderColor:       GLASS.hero.border,
    marginBottom:      4,
  },
  tiktokBadgeText: {
    fontSize:      10,
    fontWeight:    '800',
    color:         COLORS.white,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  tiktokIcon:    { fontSize: 36, marginBottom: 4 },
  tiktokNom: {
    fontSize:   17,
    fontWeight: '800',
    color:      COLORS.white,
    lineHeight: 23,
    marginBottom: 10,
    letterSpacing: -0.3,               // +détail aligné HomeScreen
  },
  tiktokStats:       { flexDirection: 'row', alignItems: 'center' },
  tiktokStat:        { alignItems: 'center', flex: 1 },
  tiktokStatVal:     { fontSize: 16, fontWeight: '800', color: COLORS.white, letterSpacing: -0.3 },
  tiktokStatLbl:     { fontSize: 9, color: 'rgba(255,255,255,0.72)', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.4 },
  tiktokStatDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.25)' },
  tiktokPlayBtn: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               6,
    backgroundColor:   COLORS.white,
    alignSelf:         'flex-start',
    paddingHorizontal: 14,
    paddingVertical:   7,
    borderRadius:      22,
    ...mkShadow('#000', 0.12, 8, 4, 4),
  },
  tiktokPlayText:        { fontSize: 12, fontWeight: '800' },
  tiktokPremiumBtn:      { backgroundColor: GLASS.hero.bg, borderWidth: 1.5, borderColor: GLASS.hero.border, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, alignItems: 'center' },
  tiktokPremiumBtnText:  { color: COLORS.white, fontSize: 12, fontWeight: '800' },
  tiktokPagination:      { flexDirection: 'row', gap: 5 },
  tiktokDot:             { width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.35)' },
  tiktokDotActive:       { width: 18, backgroundColor: COLORS.white, borderRadius: 3 },

  // ── Badge premium ─────────────────────────────────────────────────────────
  premiumBadge:     { backgroundColor: COLORS.warningLight, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  premiumBadgeText: { fontSize: 9, fontWeight: '800', color: '#D97706', letterSpacing: 0.3 },
  lockedHint:       { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },

  // ── Carte liste — style GlassCard light du HomeScreen ────────────────────
  listCard: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             14,
    backgroundColor: COLORS.white,
    borderRadius:    22,                   // +4 (aligné GlassCard HomeScreen)
    padding:         16,
    marginBottom:    10,
    borderLeftWidth: 4,
    borderWidth:     1,
    borderColor:     COLORS.borderLight,
    ...mkShadow(COLORS.primary, 0.08, 14, 4, 4),
  },
  listCardLocked: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             14,
    backgroundColor: COLORS.surface,
    borderRadius:    22,                   // +4
    padding:         16,
    marginBottom:    10,
    borderWidth:     1,
    borderColor:     COLORS.border,
  },
  listIconWrap: {
    width:        50,
    height:       50,
    borderRadius: 18,                      // +2 (aligné sur infoIconWrap HomeScreen)
    justifyContent: 'center',
    alignItems:   'center',
  },
  listTopRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  listName:       { fontSize: 14, fontWeight: '700', color: COLORS.text, flex: 1, marginRight: 6, letterSpacing: -0.1 },
  listNameLocked: { fontSize: 14, fontWeight: '500', color: COLORS.textMuted, flex: 1, marginRight: 6 },
  listMeta:       { fontSize: 11, color: COLORS.textMuted, marginBottom: 3 },
  listStatText:   { fontSize: 11, fontWeight: '700' },

  // ── Éléments communs ──────────────────────────────────────────────────────
  badge:     { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  badgeText: { fontSize: 10, fontWeight: '800' },
  diffRow:   { flexDirection: 'row', gap: 5 },
  diffDot:   { width: 8, height: 8, borderRadius: 4 },

  // ── Modal — même langage glass que HomeScreen ─────────────────────────────
  modalTopBar: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 20,
    paddingVertical:   14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceAlt,
    backgroundColor:   COLORS.white,
  },
  modalTopBarTitle: {
    flex:             1,
    textAlign:        'center',
    fontSize:         15,
    fontWeight:       '700',
    color:            COLORS.text,
    marginHorizontal: 10,
    letterSpacing:    -0.2,
  },
  // Bouton fermer — identique à modalCloseBtn dans VideoPlayerStyles
  modalCloseBtn: {
    width:           38,
    height:          38,
    borderRadius:    14,                   // carré-arrondi (aligné HomeScreen)
    backgroundColor: COLORS.surface,
    justifyContent:  'center',
    alignItems:      'center',
    borderWidth:     1,
    borderColor:     COLORS.border,
  },
  modalHero: {
    padding:       22,
    margin:        18,
    borderRadius:  24,                     // +2 (aligné GlassCard dark)
    overflow:      'hidden',
  },
  // Shimmer line sur le hero modal (nouveau)
  modalHeroShimmer: {
    position:        'absolute',
    top:             0, left: 0, right: 0,
    height:          1,
    backgroundColor: GLASS.dark.shimmer,
  },
  modalHeroIcon: { fontSize: 48, marginBottom: 12 },
  modalHeroName: {
    fontSize:      22,
    fontWeight:    '800',
    color:         COLORS.white,
    letterSpacing: -0.5,                   // -0.1 (plus élégant)
    marginBottom:  12,
    lineHeight:    28,
  },
  modalHeroTags: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  // Tags glass — même style que les modal tags VideoPlayer
  modalTag: {
    paddingHorizontal: 12,
    paddingVertical:   5,
    backgroundColor:   GLASS.hero.bg,
    borderRadius:      22,
    borderWidth:       1,
    borderColor:       GLASS.hero.border,
  },
  modalTagText: { fontSize: 11, fontWeight: '700', color: COLORS.white },

  // Stats row dans la modal — même que statsRow du HomeScreen
  modalStatsRow: { flexDirection: 'row', gap: 8, marginBottom: 6, paddingHorizontal: 18 },
  modalStatCard: {
    flex:            1,
    backgroundColor: COLORS.surface,
    borderRadius:    16,
    padding:         14,
    alignItems:      'center',
    borderWidth:     1.5,                  // +0.5 (aligné statCard HomeScreen)
    borderColor:     COLORS.border,
    ...mkShadow('#1E293B', 0.05, 4, 2, 2),
  },
  modalStatIcon:  { fontSize: 18, marginBottom: 4 },
  modalStatValue: { fontSize: 15, fontWeight: '800', marginBottom: 2, letterSpacing: -0.2 },
  modalStatLabel: { fontSize: 9, color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 0.4 },

  // Sections modal — même surface que "section" dans HomeScreen
  modalSection: {
    backgroundColor:  COLORS.white,
    borderRadius:     16,
    padding:          16,
    marginHorizontal: 18,
    marginTop:        10,
    borderWidth:      1,
    borderColor:      COLORS.border,
    ...mkShadow('#1E293B', 0.05, 6, 2, 2),
  },
  modalSectionTitle: {
    fontSize:      11,
    fontWeight:    '800',
    color:         COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    marginBottom:  10,
  },
  modalSectionText: { fontSize: 13, color: COLORS.textLight, lineHeight: 20 },

  // Notes — même style que noteCard du VideoPlayer
  noteRow: {
    backgroundColor: COLORS.surface,
    borderRadius:    14,
    padding:         13,
    marginTop:       8,
    borderLeftWidth: 3,
    borderWidth:     1,
    borderColor:     COLORS.border,
  },
  noteRowTitle: { fontSize: 12, fontWeight: '800', marginBottom: 4 },
  noteRowText:  { fontSize: 12, color: COLORS.textLight, lineHeight: 18 },

  // Actions modal — même que VideoPlayer endBtn area
  modalActions: {
    position:          'absolute',
    bottom:            0,
    left:              0,
    right:             0,
    flexDirection:     'row',
    gap:               12,
    paddingHorizontal: 20,
    paddingTop:        18,
    paddingBottom:     Platform.OS === 'ios' ? 80 : 72,
    backgroundColor:   COLORS.white,
    borderTopWidth:    1.5,
    borderTopColor:    COLORS.border,
    ...mkShadow('#000', 0.10, 16, 14, -6),
  },

  // Boutons — identiques à GlassButton du HomeScreen
  btnSecondary: {
    flex:            1,
    height:          58,
    borderRadius:    18,
    backgroundColor: COLORS.surfaceAlt,
    borderWidth:     1.5,
    borderColor:     COLORS.primaryGlow,
    justifyContent:  'center',
    alignItems:      'center',
    flexDirection:   'row',
    gap:             6,
  },
  btnSecondaryText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  btnPrimary: {
    flex:           2,
    height:         58,
    borderRadius:   18,
    flexDirection:  'row',
    justifyContent: 'center',
    alignItems:     'center',
    gap:            8,
    ...mkShadow(COLORS.primary, 0.35, 16, 10, 8),
  },
  btnPrimaryText: { color: COLORS.white, fontSize: 16, fontWeight: '800' },

  // ── Sidebar tablet ────────────────────────────────────────────────────────
  sidebar: {
    width:             224,
    backgroundColor:   COLORS.white,
    paddingTop:        40,
    paddingBottom:     32,
    paddingHorizontal: 16,
    borderRightWidth:  1,
    borderRightColor:  COLORS.surfaceAlt,
    ...mkShadow('#000', 0.06, 10, 4, 2),
  },
  sidebarLogoIcon:       { justifyContent: 'center', alignItems: 'center', width: 44, height: 44, borderRadius: 14, marginBottom: 4 },
  sidebarLogoText:       { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 24, letterSpacing: -0.3 },
  sidebarNavItem:        { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, marginBottom: 4, paddingVertical: 12, paddingHorizontal: 14 },
  sidebarNavItemActive:  { backgroundColor: COLORS.primaryLight, borderWidth: 1, borderColor: COLORS.primaryGlow },
  sidebarNavLabel:       { fontSize: 14, fontWeight: '600', color: COLORS.textLight },
  sidebarNavLabelActive: { color: COLORS.primary, fontWeight: '700' },

  // ── Bottom Nav ────────────────────────────────────────────────────────────
  bottomNav: {
    position:        'absolute',
    bottom:          0,
    left:            0,
    right:           0,
    zIndex:          9999,
    elevation:       20,
    flexDirection:   'row',
    backgroundColor: COLORS.white,
    borderTopWidth:  1,
    borderTopColor:  COLORS.surfaceAlt,
    paddingTop:      10,
    paddingBottom:   Platform.OS === 'ios' ? 26 : 12,
    height:          Platform.OS === 'ios' ? 86 : 70,
    ...mkShadow('#000', 0.08, 16, 20, -10),
  },
  bottomNavItem:        { flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%' },
  bottomNavIconBox:     { justifyContent: 'center', alignItems: 'center', width: 48, height: 32, borderRadius: 16 },
  bottomNavIconActive:  { backgroundColor: COLORS.primaryLight },
  bottomNavLabel:       { fontSize: 10, fontWeight: '600', color: COLORS.textMuted, marginTop: 4 },
  bottomNavLabelActive: { color: COLORS.primary, fontWeight: '800' },
});