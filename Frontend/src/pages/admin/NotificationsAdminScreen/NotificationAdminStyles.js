// src/pages/admin/NotificationsScreen/NotificationsStyles.js
import { StyleSheet, Platform } from 'react-native';
import { COLORS, GLASS } from '../../../theme';

export default StyleSheet.create({
  container:      { flex: 1, backgroundColor: COLORS.surface || '#F5F3FF' },

  // Header
  header: {
    paddingTop: Platform.OS === 'ios' ? 54 : 36,
    paddingBottom: 24, paddingHorizontal: 20,
    overflow: 'hidden',
  },
  headerTopRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerGreeting: { fontSize: 13, color: 'rgba(255,255,255,0.70)', fontWeight: '600', marginBottom: 4 },
  headerTitle:    { fontSize: 24, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  headerAccent:   { color: '#FCD34D' },
  markAllBtn: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 9,
  },
  markAllText:    { fontSize: 12, fontWeight: '800', color: '#fff' },

  // Chips
  chipRow:        { paddingLeft: 16, paddingVertical: 14, flexGrow: 0 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: GLASS.light?.bg || '#fff', borderRadius: 100, marginRight: 8,
    borderWidth: 1.5, borderColor: GLASS.light?.border || '#E2E8F0',
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  chipActive:     { backgroundColor: '#1E293B', borderColor: '#1E293B' },
  chipText:       { fontSize: 12, fontWeight: '700', color: COLORS.textLight || '#64748B' },
  chipTextActive: { color: '#fff' },
  chipBadge: {
    backgroundColor: '#EF4444', borderRadius: 9,
    minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  chipBadgeText:  { fontSize: 9, fontWeight: '800', color: '#fff' },

  // Notif card
  notifCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: '#fff', borderRadius: 18, padding: 14,
    marginBottom: 9,
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.10)',
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.08, shadowRadius:8 },
      android: { elevation: 3 },
    }),
  },
  notifCardRead: {
    backgroundColor: COLORS.surface || '#F5F3FF',
    borderColor: 'rgba(0,0,0,0.04)',
    ...Platform.select({ ios: { shadowOpacity: 0 }, android: { elevation: 0 } }),
  },
  notifIconWrap:   { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
  unreadDot:       { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  notifContent:    { flex: 1, minWidth: 0 },
  notifTitleRow:   { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  notifTitle:      { fontSize: 13, fontWeight: '800', color: COLORS.text || '#1E293B', flex: 1 },
  notifTitleRead:  { fontWeight: '600', color: COLORS.textMuted || '#94A3B8' },
  notifText:       { fontSize: 12, color: COLORS.textLight || '#64748B', lineHeight: 17 },
  notifBot:        { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 7 },
  notifTime:       { fontSize: 10, color: COLORS.textMuted || '#94A3B8', fontWeight: '600' },
  notifPill:       { borderRadius: 7, paddingHorizontal: 8, paddingVertical: 3 },
  notifPillText:   { fontSize: 10, fontWeight: '800' },

  // Séparateurs sections
  sectionSep: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 14,
  },
  sectionSepLine: { flex: 1, height: 1, backgroundColor: 'rgba(139,92,246,0.10)' },
  sectionSepText: { fontSize: 11, fontWeight: '800', color: COLORS.textMuted || '#94A3B8', letterSpacing: 0.5 },

  // Empty
  emptyBox:  { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, fontWeight: '800', color: COLORS.text || '#1E293B', marginBottom: 6 },
  emptySub:  { fontSize: 13, color: COLORS.textMuted || '#94A3B8' },
});