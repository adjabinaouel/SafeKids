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
  markAllBtn: {
    backgroundColor: GLASS.hero.bg, borderWidth: 1, borderColor: GLASS.hero.border,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8,
  },
  markAllText:     { fontSize: 12, fontWeight: '800', color: '#fff' },

  chipRow:         { paddingLeft: 16, paddingVertical: 14 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: GLASS.light.bg, borderRadius: 100, marginRight: 8,
    borderWidth: 1.5, borderColor: GLASS.light.border,
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  chipActive:      { backgroundColor: COLORS.text, borderColor: COLORS.text },
  chipText:        { fontSize: 12, fontWeight: '700', color: COLORS.textLight },
  chipTextActive:  { color: '#fff' },
  chipBadge: {
    backgroundColor: '#EF4444', borderRadius: 9,
    minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  chipBadgeText:   { fontSize: 9, fontWeight: '800', color: '#fff' },

  notifCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: GLASS.light.bg, borderRadius: 18, padding: 14,
    marginHorizontal: 16, marginBottom: 9,
    borderWidth: 1, borderColor: GLASS.light.border,
    ...Platform.select({ ios: { shadowColor: GLASS.light.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6 }, android: { elevation: 2 } }),
  },
  notifCardRead: {
    backgroundColor: COLORS.surface,
    ...Platform.select({ ios: { shadowOpacity: 0 }, android: { elevation: 0 } }),
  },
  notifIconWrap:   { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  unreadDot:       { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  notifContent:    { flex: 1, minWidth: 0 },
  notifTitleRow:   { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  notifTitle:      { fontSize: 13, fontWeight: '800', color: COLORS.text, flex: 1 },
  notifTitleRead:  { fontWeight: '600', color: COLORS.textMuted },
  notifText:       { fontSize: 12, color: COLORS.textLight, lineHeight: 17 },
  notifBot:        { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  notifTime:       { fontSize: 10, color: COLORS.textMuted, fontWeight: '600' },
  notifPill:       { borderRadius: 7, paddingHorizontal: 8, paddingVertical: 2 },
  notifPillText:   { fontSize: 10, fontWeight: '800' },

  emptyBox:        { alignItems: 'center', paddingVertical: 60 },
  emptyIcon:       { fontSize: 48, marginBottom: 12 },
  emptyText:       { fontSize: 16, fontWeight: '800', color: COLORS.text },
  emptySub:        { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
});