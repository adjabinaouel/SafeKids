import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const IS_TABLET = width >= 768;

export const COLORS = {
  primary:      '#7C3AED',
  primaryDark:  '#7c3ee0',
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
  success:      '#10B981',
  successLight: '#D1FAE5',
  warning:      '#F59E0B',
  warningLight: '#FEF3C7',
  error:        '#EF4444',
};

// Styles communs pour les éléments de navigation (bottomNav et sidebar)
const commonNavItem = {
  flexDirection: 'row',
  alignItems: 'center',
  columnGap: 12,
  borderRadius: 12,
  marginBottom: 3,
};

const commonNavLabel = {
  fontSize: 14,
  fontWeight: '600',
};

const commonNavIconBox = {
  justifyContent: 'center',
  alignItems: 'center',
};

export default StyleSheet.create({

  // ── Layout ────────────────────────────────────────────────
  safeArea:        { flex:1, backgroundColor:COLORS.white }, // Fond blanc
  tabletContainer: { flex:1, flexDirection:'row', backgroundColor:COLORS.white }, // Fond blanc

  // ── Header — gradient subtil bleu foncé au lieu de violet plein ──
  header: {
    paddingTop: IS_TABLET ? 32 : 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerTopRow: {
    flexDirection:'row', justifyContent:'space-between',
    alignItems:'flex-start', marginBottom:18,
  },
  headerGreeting: { fontSize:13, color:'rgba(255,255,255,0.8)', fontWeight:'600', marginBottom:4 },
  headerTitle:    { fontSize:24, fontWeight:'900', color:'#fff', letterSpacing:-0.5 },
  headerAccent:   { color:'#FCD34D' },
  headerAvatar: {
    width:46, height:46, borderRadius:23,
    backgroundColor:'rgba(255,255,255,0.18)',
    justifyContent:'center', alignItems:'center',
    borderWidth:2, borderColor:'rgba(255,255,255,0.35)',
  },

  // Stats pills — blanc avec texte coloré
  statsRow:  { flexDirection:'row', columnGap:8, marginBottom:16 },
  statPill: {
    flex:1, backgroundColor:'rgba(255,255,255,0.18)',
    borderRadius:14, paddingVertical:10, alignItems:'center',
    borderWidth:1, borderColor:'rgba(255,255,255,0.25)',
  },
  statPillValue: { fontSize:16, fontWeight:'900', color:'#fff', marginTop:2 },
  statPillLabel: { fontSize:9, color:'rgba(255,255,255,0.75)', marginTop:1, textTransform:'uppercase', letterSpacing:0.3 },

  // Search — fond blanc avec placeholder gris
  searchWrapper: {
    flexDirection:'row', alignItems:'center', columnGap:10,
    backgroundColor:'rgba(255,255,255,0.22)',
    borderRadius:14, borderWidth:1.5,
    borderColor:'rgba(255,255,255,0.3)',
    paddingHorizontal:14, height:48,
  },
  searchInput: {
    flex:1, fontSize:14, color:'#fff', fontWeight:'500',
    ...Platform.select({ web:{ outlineStyle:'none' } }),
  },

  // ── Filtres — fond blanc, actif = accent ──────────────────
  filterRow:           { paddingVertical:14, paddingLeft:16 },
  filterChip: {
    paddingHorizontal:16, paddingVertical:8,
    backgroundColor:'#fff', borderRadius:20, marginRight:8,
    borderWidth:1.5, borderColor:COLORS.border,
    ...Platform.select({ ios:{shadowColor:'#000',shadowOffset:{width:0,height:1},shadowOpacity:0.05,shadowRadius:3}, android:{elevation:1} }),
  },
  filterChipActive:    { backgroundColor:COLORS.text, borderColor:COLORS.text },
  filterChipText:      { fontSize:12, fontWeight:'700', color:COLORS.textLight },
  filterChipTextActive:{ color:COLORS.white },

  // ── Sections ──────────────────────────────────────────────
  sectionWrap:      { paddingHorizontal:16, marginBottom:20 },
  sectionHeader:    { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:4 },
  sectionTitle:     { fontSize:17, fontWeight:'900', color:COLORS.text, letterSpacing:-0.4 },
  sectionSub:       { fontSize:12, color:COLORS.textMuted, marginBottom:12 },
  sectionBadge:     { paddingHorizontal:10, paddingVertical:3, backgroundColor:COLORS.primaryMid, borderRadius:20 },
  sectionBadgeText: { fontSize:11, fontWeight:'700', color:COLORS.primary },

  // ── Bannière Premium — gradient vert/teal au lieu de violet ──
  premiumBanner:        { marginHorizontal:16, marginBottom:16, borderRadius:18, overflow:'hidden' },
  premiumBannerGradient:{ padding:16, flexDirection:'row', alignItems:'center', columnGap:12 },
  premiumBannerEmoji:   { fontSize:26 },
  premiumBannerText:    { flex:1 },
  premiumBannerTitle:   { color:COLORS.white, fontWeight:'800', fontSize:14 },
  premiumBannerSub:     { color:'rgba(255,255,255,0.8)', fontSize:11, marginTop:2 },
  premiumBannerBtn:     { backgroundColor:COLORS.white, borderRadius:10, paddingHorizontal:14, paddingVertical:7 },
  premiumBannerBtnText: { color:COLORS.primary, fontWeight:'800', fontSize:12 },

  // ── Cartes TikTok ─────────────────────────────────────────
  tiktokCard: {
    borderRadius:22, padding:20, height:200,
    justifyContent:'space-between',
    ...Platform.select({
      ios:     { shadowColor:'#000', shadowOffset:{width:0,height:6}, shadowOpacity:0.12, shadowRadius:14 },
      android: { elevation:6 },
    }),
  },
  tiktokBadge:     { alignSelf:'flex-start', backgroundColor:'rgba(255,255,255,0.28)', paddingHorizontal:10, paddingVertical:3, borderRadius:20, marginBottom:4 },
  tiktokBadgeText: { fontSize:10, fontWeight:'800', color:COLORS.white, textTransform:'uppercase', letterSpacing:0.5 },
  tiktokIcon:      { fontSize:36, marginBottom:4 },
  tiktokNom:       { fontSize:16, fontWeight:'800', color:COLORS.white, lineHeight:22, marginBottom:8 },
  tiktokStats:     { flexDirection:'row', alignItems:'center' },
  tiktokStat:      { alignItems:'center', flex:1 },
  tiktokStatVal:   { fontSize:15, fontWeight:'900', color:COLORS.white },
  tiktokStatLbl:   { fontSize:9, color:'rgba(255,255,255,0.75)', marginTop:1, textTransform:'uppercase' },
  tiktokStatDivider:{ width:1, height:28, backgroundColor:'rgba(255,255,255,0.3)' },
  tiktokPlayBtn: {
    flexDirection:'row', alignItems:'center', columnGap:6,
    backgroundColor:COLORS.white, alignSelf:'flex-start',
    paddingHorizontal:14, paddingVertical:6, borderRadius:20,
  },
  tiktokPlayText:       { fontSize:12, fontWeight:'800' },
  tiktokPremiumBtn:     { backgroundColor:'rgba(255,255,255,0.2)', borderWidth:1.5, borderColor:'rgba(255,255,255,0.4)', paddingHorizontal:14, paddingVertical:8, borderRadius:12, alignItems:'center' },
  tiktokPremiumBtnText: { color:COLORS.white, fontSize:12, fontWeight:'800' },
  tiktokPagination:     { flexDirection:'row', columnGap:5 },
  tiktokDot:            { width:5, height:5, borderRadius:3, backgroundColor:'rgba(255,255,255,0.4)' },
  tiktokDotActive:      { width:16, backgroundColor:COLORS.white, borderRadius:3 },

  // ── Badge premium ─────────────────────────────────────────
  premiumBadge:     { backgroundColor:COLORS.warningLight, borderRadius:8, paddingHorizontal:7, paddingVertical:2 },
  premiumBadgeText: { fontSize:9, fontWeight:'800', color:'#D97706' },
  lockedHint:       { fontSize:11, color:COLORS.textMuted, marginTop:2 },

  // ── Carte liste ───────────────────────────────────────────
  listCard: {
    flexDirection:'row', alignItems:'center', columnGap:12,
    backgroundColor:COLORS.white, borderRadius:16, padding:14,
    marginBottom:9, borderLeftWidth:4,
    ...Platform.select({
      ios:     { shadowColor:COLORS.text, shadowOffset:{width:0,height:2}, shadowOpacity:0.06, shadowRadius:6 },
      android: { elevation:3 },
    }),
  },
  listCardLocked: {
    flexDirection:'row', alignItems:'center', columnGap:12,
    backgroundColor:COLORS.surface, borderRadius:16, padding:14,
    marginBottom:9, borderLeftWidth:3, borderLeftColor:'#CBD5E1',
    borderWidth:1, borderColor:COLORS.border,
  },
  listIconWrap:    { width:48, height:48, borderRadius:14, justifyContent:'center', alignItems:'center' },
  listTopRow:      { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:3 },
  listName:        { fontSize:14, fontWeight:'700', color:COLORS.text, flex:1, marginRight:6 },
  listNameLocked:  { fontSize:14, fontWeight:'500', color:COLORS.textMuted, flex:1, marginRight:6 },
  listMeta:        { fontSize:11, color:COLORS.textMuted, marginBottom:3 },
  listStatText:    { fontSize:11, fontWeight:'700' },

  // ── Éléments communs ──────────────────────────────────────
  badge:     { paddingHorizontal:8, paddingVertical:2, borderRadius:20 },
  badgeText: { fontSize:10, fontWeight:'800' },
  diffRow:   { flexDirection:'row', columnGap:4 },
  diffDot:   { width:8, height:8, borderRadius:4 },

  // ── Modal ─────────────────────────────────────────────────
  modalTopBar: {
    flexDirection:'row', alignItems:'center', justifyContent:'space-between',
    paddingHorizontal:16, paddingVertical:14,
    borderBottomWidth:1, borderBottomColor:COLORS.surfaceAlt,
    backgroundColor:COLORS.white,
  },
  modalTopBarTitle: { flex:1, textAlign:'center', fontSize:15, fontWeight:'700', color:COLORS.text, marginHorizontal:8 },
  modalCloseBtn:    { width:36, height:36, borderRadius:18, backgroundColor:COLORS.surface, justifyContent:'center', alignItems:'center' },
  modalHero:        { padding:22, margin:16, borderRadius:20 },
  modalHeroIcon:    { fontSize:44, marginBottom:10 },
  modalHeroName:    { fontSize:20, fontWeight:'800', color:COLORS.white, letterSpacing:-0.3, marginBottom:10 },
  modalHeroTags:    { flexDirection:'row', columnGap:8, flexWrap:'wrap' },
  modalTag:         { paddingHorizontal:10, paddingVertical:4, backgroundColor:'rgba(255,255,255,0.25)', borderRadius:20 },
  modalTagText:     { fontSize:11, fontWeight:'700', color:COLORS.white },
  modalStatsRow:    { flexDirection:'row', columnGap:8, marginBottom:4, paddingHorizontal:16 },
  modalStatCard: {
    flex:1, backgroundColor:COLORS.surface, borderRadius:14, padding:12, alignItems:'center',
    borderWidth:1, borderColor:COLORS.border,
  },
  modalStatIcon:     { fontSize:18, marginBottom:3 },
  modalStatValue:    { fontSize:14, fontWeight:'800', marginBottom:1 },
  modalStatLabel:    { fontSize:9, color:COLORS.textLight },
  modalSection: {
    backgroundColor:COLORS.surface, borderRadius:14, padding:14,
    marginHorizontal:16, marginTop:10,
    borderWidth:1, borderColor:COLORS.border,
  },
  modalSectionTitle: { fontSize:11, fontWeight:'800', color:COLORS.text, textTransform:'uppercase', letterSpacing:0.9, marginBottom:8 },
  modalSectionText:  { fontSize:13, color:COLORS.textLight, lineHeight:20 },
  noteRow: {
    backgroundColor:COLORS.white, borderRadius:12, padding:12, marginTop:8,
    borderLeftWidth:3, borderWidth:1, borderColor:COLORS.border,
  },
  noteRowTitle: { fontSize:12, fontWeight:'800', marginBottom:3 },
  noteRowText:  { fontSize:12, color:COLORS.textLight, lineHeight:18 },
  modalActions: {
    position:'absolute', bottom:0, left:0, right:0,
    flexDirection:'row', columnGap:10,
    paddingHorizontal:16, paddingTop:16,
    paddingBottom: Platform.OS==='ios' ? 80 : 70,
    backgroundColor:COLORS.white, borderTopWidth:1.5, borderTopColor:COLORS.border,
    ...Platform.select({ ios:{shadowColor:'#000',shadowOffset:{width:0,height:-4},shadowOpacity:0.10,shadowRadius:12}, android:{elevation:12} }),
  },
  btnSecondary: {
    flex:1, height:58, borderRadius:16, backgroundColor:COLORS.surfaceAlt,
    borderWidth:2, borderColor:'#CBD5E1',
    justifyContent:'center', alignItems:'center', flexDirection:'row', columnGap:6,
  },
  btnSecondaryText: { fontSize:15, fontWeight:'700', color:COLORS.text },
  btnPrimary: {
    flex:2, height:58, borderRadius:16,
    flexDirection:'row', justifyContent:'center', alignItems:'center', columnGap:8,
    ...Platform.select({ ios:{shadowColor:COLORS.primary,shadowOffset:{width:0,height:8},shadowOpacity:0.35,shadowRadius:14}, android:{elevation:10} }),
  },
  btnPrimaryText: { color:COLORS.white, fontSize:16, fontWeight:'800' },

  // ── Sidebar ───────────────────────────────────────────────
  sidebar: {
    width:220, backgroundColor:COLORS.white,
    paddingTop:40, paddingBottom:32, paddingHorizontal:16,
    borderRightWidth:1, borderRightColor:COLORS.surfaceAlt,
    ...Platform.select({ ios:{shadowColor:'#000',shadowOffset:{width:2,height:0},shadowOpacity:0.05,shadowRadius:8}, android:{elevation:4} }),
  },
  sidebarLogoIcon:      { ...commonNavIconBox, width:42, height:42, borderRadius:12, marginBottom:4 },
  sidebarLogoText:      { fontSize:18, fontWeight:'900', color:COLORS.text, marginBottom:24 },
  sidebarNavItem:       { ...commonNavItem, paddingVertical:11, paddingHorizontal:12 },
  sidebarNavItemActive: { backgroundColor:COLORS.primaryLight },
  // Style pour l'effet de survol (hover) sur les éléments de la barre latérale
  sidebarNavItemHover:  { backgroundColor: COLORS.primaryMid }, 
  sidebarNavLabel:      { ...commonNavLabel, color:COLORS.textLight },
  sidebarNavLabelActive:{ color:COLORS.primary, fontWeight:'700' },

  // ── Bottom Nav — fond blanc, ombre légère ─────────────────
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 20,
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceAlt,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 25 : 12,
    height: Platform.OS === 'ios' ? 85 : 70,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.08,
        shadowRadius: 15,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  bottomNavItem: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
    height: '100%',
  },
  // Style pour l'effet de survol (hover) sur les éléments de la barre de navigation inférieure
  bottomNavItemHover: { backgroundColor: COLORS.surface },
  bottomNavIconBox: { 
    ...commonNavIconBox,
    width: 48, 
    height: 32, 
    borderRadius: 16, 
  },
  bottomNavIconActive: { 
    backgroundColor: COLORS.primaryLight 
  },
  bottomNavLabel: { 
    fontSize: 10, 
    fontWeight: '600', 
    color: COLORS.textMuted, 
    marginTop: 4 
  },
  bottomNavLabelActive: { 
    color: COLORS.primary, 
    fontWeight: 'bold' 
  },
});