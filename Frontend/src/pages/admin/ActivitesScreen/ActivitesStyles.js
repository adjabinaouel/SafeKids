import { StyleSheet, Platform } from 'react-native';
import { COLORS, GLASS } from '../../../theme';

export default StyleSheet.create({
  container:       { flex: 1, backgroundColor: COLORS.surface },
  scrollContent:   { paddingBottom: Platform.OS === 'ios' ? 100 : 90 },

  header:          { paddingTop: Platform.OS === 'ios' ? 54 : 36, paddingBottom: 24, paddingHorizontal: 20 },
  headerTopRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  headerGreeting:  { fontSize: 13, color: 'rgba(255,255,255,0.70)', fontWeight: '600', marginBottom: 4 },
  headerTitle:     { fontSize: 24, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  headerAccent:    { color: '#FCD34D' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: GLASS.hero.bg, borderRadius: 14,
    borderWidth: 1.5, borderColor: GLASS.hero.border,
    paddingHorizontal: 14, height: 46, marginTop: 14,
  },
  searchInput:     { flex: 1, fontSize: 14, color: '#fff', fontWeight: '500' },

  filterRow:       { paddingLeft: 16, paddingVertical: 14 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: GLASS.light.bg, borderRadius: 100, marginRight: 8,
    borderWidth: 1.5, borderColor: GLASS.light.border,
  },
  filterChipActive:     { backgroundColor: COLORS.text, borderColor: COLORS.text },
  filterChipText:       { fontSize: 12, fontWeight: '700', color: COLORS.textLight },
  filterChipTextActive: { color: '#fff' },

  createBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginBottom: 14, borderRadius: 16,
    paddingHorizontal: 18, paddingVertical: 14,
    ...Platform.select({ ios: { shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12 }, android: { elevation: 6 } }),
  },
  createBtnText:   { fontSize: 14, fontWeight: '800', color: '#fff', flex: 1 },

  // Carte activité
  actCard: {
    backgroundColor: GLASS.light.bg, borderRadius: 20,
    marginHorizontal: 16, marginBottom: 10,
    borderWidth: 1, borderColor: GLASS.light.border, overflow: 'hidden',
    ...Platform.select({ ios: { shadowColor: GLASS.light.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 }, android: { elevation: 2 } }),
  },
  actAccentBar:    { height: 4 },
  actBody:         { padding: 16 },
  actTop:          { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  actIconWrap:     { width: 50, height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  actIcon:         { fontSize: 26 },
  actName:         { fontSize: 15, fontWeight: '800', color: COLORS.text, flex: 1 },
  actMeta:         { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  actTags:         { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  actTag:          { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  actTagText:      { fontSize: 11, fontWeight: '700' },
  actStats:        { flexDirection: 'row', gap: 16, paddingTop: 10, borderTopWidth: 1, borderTopColor: GLASS.light.border },
  actStatItem:     { alignItems: 'center' },
  actStatVal:      { fontSize: 16, fontWeight: '900', color: COLORS.text },
  actStatLabel:    { fontSize: 10, color: COLORS.textMuted, marginTop: 2, fontWeight: '600' },
  actDivider:      { height: 1, backgroundColor: GLASS.light.border },
  actActions:      { flexDirection: 'row', gap: 8, padding: 12 },
  actBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 9, borderRadius: 12,
    backgroundColor: GLASS.light.bg, borderWidth: 1, borderColor: GLASS.light.border,
  },
  actBtnText:      { fontSize: 12, fontWeight: '700', color: COLORS.text },
  actBtnDanger:    { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' },
  actBtnDangerTxt: { color: '#991B1B' },

  // Modal
  modalOverlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: '95%',
  },
  modalInner:      { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 48 },
  modalHandle:     { width: 40, height: 4, backgroundColor: COLORS.border, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalTitle:      { fontSize: 20, fontWeight: '900', color: COLORS.text, letterSpacing: -0.4, marginBottom: 6 },
  modalSub:        { fontSize: 13, color: COLORS.textMuted, marginBottom: 24 },
  fieldLabel:      { fontSize: 12, fontWeight: '700', color: COLORS.textLight, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldInput: {
    backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, color: COLORS.text, marginBottom: 16,
  },
  fieldTextarea: {
    backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, color: COLORS.text, marginBottom: 16,
    minHeight: 90, textAlignVertical: 'top',
  },
  formRow:         { flexDirection: 'row', gap: 12 },
  diffRow:         { flexDirection: 'row', gap: 8, marginBottom: 16 },
  diffBtn: {
    width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.border,
  },
  diffBtnActive:   { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  diffBtnText:     { fontSize: 14, fontWeight: '800', color: COLORS.textMuted },
  diffBtnTextActive:{ color: COLORS.primary },
  submitBtn: {
    borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8,
    ...Platform.select({ ios: { shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.28, shadowRadius: 14 }, android: { elevation: 8 } }),
  },
  submitBtnText:   { fontSize: 16, fontWeight: '900', color: '#fff' },
  cancelBtn:       { alignItems: 'center', marginTop: 16 },
  cancelBtnText:   { fontSize: 14, color: COLORS.textMuted, fontWeight: '600' },

  emptyBox:        { alignItems: 'center', paddingVertical: 60 },
  emptyIcon:       { fontSize: 48, marginBottom: 12 },
  emptyText:       { fontSize: 16, fontWeight: '800', color: COLORS.text },
  emptySub:        { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
});