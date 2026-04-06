// src/pages/admin/ActivitesScreen/ActivitesStyles.js
import { StyleSheet, Platform, Dimensions } from 'react-native';
import { COLORS, GLASS } from '../../../theme';

const { height: SCREEN_H } = Dimensions.get('window');

export default StyleSheet.create({
  container:      { flex: 1, backgroundColor: COLORS.surface || '#F5F3FF' },
  scrollContent:  { paddingHorizontal: 16, paddingBottom: Platform.OS === 'ios' ? 100 : 90 },

  // ── Header ───────────────────────────────────────────────────────────────
  header: {
    paddingTop: Platform.OS === 'ios' ? 54 : 36,
    paddingBottom: 20, paddingHorizontal: 20, overflow: 'hidden',
  },
  headerTopRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  headerGreeting: { fontSize: 13, color: 'rgba(255,255,255,0.70)', fontWeight: '600', marginBottom: 4 },
  headerTitle:    { fontSize: 24, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  headerAccent:   { color: '#FCD34D' },
  addHeaderBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center', alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.13)', borderRadius: 14,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.20)',
    paddingHorizontal: 14, height: 46,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#fff', fontWeight: '500' },

  // ── Filtres domaine ───────────────────────────────────────────────────────
  // ✅ FIX : wrapper avec paddingVertical fixe pour éviter le décalage
  filterWrapper: {
    height: 56,                    // hauteur fixe → pas de saut de layout
    backgroundColor: COLORS.surface || '#F5F3FF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139,92,246,0.08)',
  },
  filterContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
    paddingVertical: 10,           // centrage vertical dans la hauteur fixe
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 7,
    backgroundColor: GLASS.light?.bg || '#fff', borderRadius: 100,
    borderWidth: 1.5, borderColor: GLASS.light?.border || '#E2E8F0',
  },
  filterChipActive:     { backgroundColor: '#1E293B', borderColor: '#1E293B' },
  filterChipText:       { fontSize: 12, fontWeight: '700', color: COLORS.textLight || '#64748B' },
  filterChipTextActive: { color: '#fff' },

  // ── Bouton créer ──────────────────────────────────────────────────────────
  // ✅ FIX : marginHorizontal + marginVertical cohérents
  createBtnWrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  createBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 16, paddingHorizontal: 18, paddingVertical: 14,
    ...Platform.select({
      ios:     { shadowColor: '#4C1D95', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12 },
      android: { elevation: 6 },
    }),
  },
  createBtnText: { fontSize: 14, fontWeight: '800', color: '#fff', flex: 1 },

  // ── Carte activité ────────────────────────────────────────────────────────
  actCard: {
    backgroundColor: '#fff', borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.08)',
    overflow: 'hidden',
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 10 },
      android: { elevation: 3 },
    }),
  },
  actAccentBar:    { height: 4 },
  actBody:         { padding: 16 },
  actTop: {
    flexDirection: 'row',
    alignItems: 'center',      // ✅ FIX : centrage vertical de l'icône et du texte
    gap: 12,
    marginBottom: 10,
  },
  actIconWrap: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,             // ✅ FIX : empêche l'icône de rétrécir
  },
  actIcon:         { fontSize: 24 },
  actName:         { fontSize: 15, fontWeight: '800', color: COLORS.text || '#1E293B' },
  actMeta:         { fontSize: 12, color: COLORS.textMuted || '#94A3B8', marginTop: 2 },
  actObjectif: {
    fontSize: 12, color: COLORS.textLight || '#64748B',
    lineHeight: 18, marginBottom: 10,
  },
  actTags:         { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  actTag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
  },
  actTagText:      { fontSize: 11, fontWeight: '700' },
  actStats: {
    flexDirection: 'row', paddingTop: 12,
    borderTopWidth: 1, borderTopColor: 'rgba(139,92,246,0.08)',
  },
  actStatItem:     { flex: 1, alignItems: 'center' },
  actStatBorder:   { borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(139,92,246,0.08)' },
  actStatVal:      { fontSize: 16, fontWeight: '900', color: COLORS.text || '#1E293B' },
  actStatLabel:    { fontSize: 10, color: COLORS.textMuted || '#94A3B8', marginTop: 2, fontWeight: '600' },
  actDivider:      { height: 1, backgroundColor: 'rgba(139,92,246,0.06)' },

  // ✅ FIX : boutons d'action sur une seule ligne, taille égale
  actActions: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
  },
  actBtn: {
    flex: 1,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  actBtnText:      { fontSize: 12, fontWeight: '700', color: COLORS.text || '#1E293B' },
  actBtnDanger:    { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' },
  actBtnDangerTxt: { color: '#991B1B' },

  // ── Empty state ───────────────────────────────────────────────────────────
  emptyBox:    { alignItems: 'center', paddingVertical: 60 },
  emptyIcon:   { fontSize: 52, marginBottom: 14 },
  emptyText:   { fontSize: 16, fontWeight: '800', color: COLORS.text || '#1E293B', marginBottom: 6 },
  emptySub:    { fontSize: 13, color: COLORS.textMuted || '#94A3B8', marginBottom: 20 },
  emptyBtn:    { backgroundColor: '#EDE9FE', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12 },
  emptyBtnText:{ fontSize: 14, fontWeight: '700', color: '#6D28D9' },

  // ── Modal ─────────────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: SCREEN_H * 0.92,
    minHeight: SCREEN_H * 0.55,
  },
  modalHandle: {
    width: 42, height: 4, backgroundColor: '#E2E8F0',
    borderRadius: 2, alignSelf: 'center',
    marginTop: 14, marginBottom: 0,
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingTop: 16, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  modalTitle:    { fontSize: 18, fontWeight: '900', color: COLORS.text || '#1E293B', letterSpacing: -0.4 },
  modalSub:      { fontSize: 12, color: COLORS.textMuted || '#94A3B8', marginTop: 3 },
  modalCloseBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center', alignItems: 'center',
    marginLeft: 12,
  },
  modalInner:    { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 48 },

  // ── Champs formulaire ─────────────────────────────────────────────────────
  fieldLabel: {
    fontSize: 11, fontWeight: '700', color: COLORS.textLight || '#64748B',
    marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  fieldInput: {
    backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, color: COLORS.text || '#1E293B', marginBottom: 16,
  },
  fieldTextarea: {
    backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 14, color: COLORS.text || '#1E293B', marginBottom: 16,
    minHeight: 88,
  },
  formRow: { flexDirection: 'row', gap: 12 },

  // Difficulté
  diffRow:          { flexDirection: 'row', gap: 10, marginBottom: 16 },
  diffBtn: {
    flex: 1, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC',
  },
  diffBtnActive:    { borderColor: '#7C3AED', backgroundColor: '#EDE9FE' },
  diffBtnText:      { fontSize: 15, fontWeight: '800', color: '#94A3B8' },
  diffBtnTextActive:{ color: '#6D28D9' },

  // Submit
  submitBtn: {
    borderRadius: 16, overflow: 'hidden', marginTop: 8,
    ...Platform.select({
      ios:     { shadowColor: '#4C1D95', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.28, shadowRadius: 14 },
      android: { elevation: 8 },
    }),
  },
  submitBtnGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 17,
  },
  submitBtnText: { fontSize: 16, fontWeight: '900', color: '#fff' },
  cancelBtn:     { alignItems: 'center', marginTop: 16, paddingVertical: 10 },
  cancelBtnText: { fontSize: 14, color: COLORS.textMuted || '#94A3B8', fontWeight: '600' },
});