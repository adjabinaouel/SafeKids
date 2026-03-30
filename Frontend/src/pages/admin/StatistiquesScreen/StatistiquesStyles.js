import { StyleSheet, Platform } from 'react-native';
import { COLORS, GLASS } from '../../../theme';

export default StyleSheet.create({
  container:      { flex: 1, backgroundColor: COLORS.surface },
  scrollContent:  { paddingBottom: Platform.OS === 'ios' ? 100 : 90 },
  header:         { paddingTop: Platform.OS === 'ios' ? 54 : 36, paddingBottom: 24, paddingHorizontal: 20 },
  headerGreeting: { fontSize: 13, color: 'rgba(255,255,255,0.70)', fontWeight: '600', marginBottom: 4 },
  headerTitle:    { fontSize: 24, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  headerAccent:   { color: '#FCD34D' },

  kpiRow:         { flexDirection: 'row', gap: 12, padding: 16, paddingTop: 20 },
  kpiCard: {
    flex: 1, backgroundColor: GLASS.light.bg, borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: GLASS.light.border,
    ...Platform.select({ ios: { shadowColor: GLASS.light.shadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.10, shadowRadius: 10 }, android: { elevation: 3 } }),
  },
  kpiIcon:        { fontSize: 22, marginBottom: 8 },
  kpiVal:         { fontSize: 26, fontWeight: '900', color: COLORS.text, letterSpacing: -0.5 },
  kpiLabel:       { fontSize: 11, color: COLORS.textMuted, marginTop: 4, fontWeight: '600' },
  kpiBadge:       { alignSelf: 'flex-start', borderRadius: 7, paddingHorizontal: 8, paddingVertical: 3, marginTop: 8 },
  kpiBadgeText:   { fontSize: 11, fontWeight: '800' },

  section:        { paddingHorizontal: 16, marginBottom: 20 },
  sectionRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle:   { fontSize: 17, fontWeight: '900', color: COLORS.text, letterSpacing: -0.4 },

  chartCard: {
    backgroundColor: GLASS.light.bg, borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: GLASS.light.border, marginBottom: 16,
    ...Platform.select({ ios: { shadowColor: GLASS.light.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8 }, android: { elevation: 2 } }),
  },
  chartTitle:     { fontSize: 14, fontWeight: '800', color: COLORS.text, marginBottom: 16 },
  barRow:         { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  barLabel:       { fontSize: 12, color: COLORS.textLight, width: 90, fontWeight: '600' },
  barTrack:       { flex: 1, height: 8, backgroundColor: COLORS.surface, borderRadius: 4, overflow: 'hidden' },
  barFill:        { height: 8, borderRadius: 4 },
  barPct:         { fontSize: 12, fontWeight: '800', width: 36, textAlign: 'right' },

  addSpecBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.primaryLight, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: COLORS.primaryMid,
  },
  addSpecBtnText: { fontSize: 12, fontWeight: '800', color: COLORS.primary },

  specItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: GLASS.light.bg, borderRadius: 14, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: GLASS.light.border,
    ...Platform.select({ ios: { shadowColor: GLASS.light.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 }, android: { elevation: 1 } }),
  },
  specDot:        { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  specName:       { fontSize: 14, fontWeight: '700', color: COLORS.text, flex: 1 },
  specCount:      { fontSize: 12, color: COLORS.textMuted, fontWeight: '600' },
  specDelBtn: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center',
  },

  modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 24, paddingTop: 24, paddingBottom: 48,
  },
  modalHandle:    { width: 40, height: 4, backgroundColor: COLORS.border, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalTitle:     { fontSize: 20, fontWeight: '900', color: COLORS.text, letterSpacing: -0.4, marginBottom: 20 },
  fieldLabel:     { fontSize: 12, fontWeight: '700', color: COLORS.textLight, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldInput: {
    backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, color: COLORS.text, marginBottom: 20,
  },
  submitBtn: {
    borderRadius: 16, paddingVertical: 16, alignItems: 'center',
    ...Platform.select({ ios: { shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.28, shadowRadius: 14 }, android: { elevation: 8 } }),
  },
  submitBtnText:  { fontSize: 16, fontWeight: '900', color: '#fff' },
});