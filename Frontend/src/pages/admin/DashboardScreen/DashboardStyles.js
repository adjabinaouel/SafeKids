import { StyleSheet, Platform } from 'react-native';
import { COLORS, GLASS } from '../../../theme';

export default StyleSheet.create({
  container:       { flex: 1, backgroundColor: COLORS.surface },
  scrollContent:   { paddingBottom: Platform.OS === 'ios' ? 100 : 90 },

  // Header
  header:          { paddingTop: Platform.OS === 'ios' ? 54 : 36, paddingBottom: 24, paddingHorizontal: 20 },
  headerTopRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  headerGreeting:  { fontSize: 13, color: 'rgba(255,255,255,0.70)', fontWeight: '600', marginBottom: 4 },
  headerTitle:     { fontSize: 24, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  headerAccent:    { color: '#FCD34D' },
  headerRight:     { flexDirection: 'row', gap: 10 },
  headerIconBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: GLASS.hero.bg, borderWidth: 1, borderColor: GLASS.hero.border,
    justifyContent: 'center', alignItems: 'center',
  },

  // KPI grid
  kpiGrid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: 16, paddingTop: 20 },
  kpiCard: {
    flex: 1, minWidth: '45%', backgroundColor: GLASS.light.bg, borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: GLASS.light.border,
    ...Platform.select({ ios: { shadowColor: GLASS.light.shadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.10, shadowRadius: 10 }, android: { elevation: 3 } }),
  },
  kpiCardHighlight:{ backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  kpiIcon:         { fontSize: 24, marginBottom: 10 },
  kpiVal:          { fontSize: 28, fontWeight: '900', color: COLORS.text, letterSpacing: -0.5 },
  kpiValWhite:     { color: '#fff' },
  kpiLabel:        { fontSize: 12, color: COLORS.textMuted, marginTop: 4, fontWeight: '600' },
  kpiLabelWhite:   { color: 'rgba(255,255,255,0.75)' },
  kpiBadge: {
    alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 8,
    backgroundColor: COLORS.successLight,
  },
  kpiBadgeText:    { fontSize: 11, fontWeight: '800', color: COLORS.successText },
  kpiBadgeWhite: {
    alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  kpiBadgeWhiteText:{ fontSize: 11, fontWeight: '800', color: '#fff' },

  // Quick actions
  quickRow:        { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 20 },
  quickBtn: {
    flex: 1, borderRadius: 16, paddingVertical: 14, alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: GLASS.light.border,
    ...Platform.select({ ios: { shadowColor: GLASS.light.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 }, android: { elevation: 2 } }),
  },
  quickBtnIcon:    { fontSize: 22 },
  quickBtnLabel:   { fontSize: 11, fontWeight: '800', color: '#fff' },

  // Section
  section:         { paddingHorizontal: 16, marginBottom: 20 },
  sectionRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle:    { fontSize: 17, fontWeight: '900', color: COLORS.text, letterSpacing: -0.4 },
  seeAll:          { fontSize: 13, fontWeight: '700', color: COLORS.primary },

  // Activity card
  actCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: GLASS.light.bg, borderRadius: 16, padding: 14, marginBottom: 9,
    borderWidth: 1, borderColor: GLASS.light.border,
    ...Platform.select({ ios: { shadowColor: GLASS.light.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6 }, android: { elevation: 2 } }),
  },
  actAvatar:       { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  actInitials:     { fontSize: 14, fontWeight: '900', color: '#fff' },
  actName:         { fontSize: 14, fontWeight: '700', color: COLORS.text },
  actSub:          { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  actBadge:        { marginLeft: 'auto', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  actBadgeText:    { fontSize: 11, fontWeight: '800' },
});