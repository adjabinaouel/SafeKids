import { StyleSheet, Platform } from 'react-native';
import { COLORS, GLASS } from '../../../theme';

export default StyleSheet.create({
  container:       { flex: 1, backgroundColor: COLORS.surface },
  scrollContent:   { paddingBottom: Platform.OS === 'ios' ? 100 : 90 },
  hero:            { paddingTop: Platform.OS === 'ios' ? 54 : 36, paddingBottom: 30, paddingHorizontal: 20, alignItems: 'center' },
  heroAvatar: {
    width: 84, height: 84, borderRadius: 26,
    backgroundColor: GLASS.hero.bg, borderWidth: 2, borderColor: GLASS.hero.border,
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
    ...Platform.select({ ios: { shadowColor: '#fff', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 10 }, android: { elevation: 6 } }),
  },
  heroName:        { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  heroRole:        { fontSize: 13, color: 'rgba(255,255,255,0.70)', marginTop: 4, fontWeight: '600' },
  heroBadge: {
    backgroundColor: GLASS.hero.bg, borderWidth: 1, borderColor: GLASS.hero.border,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6, marginTop: 12,
  },
  heroBadgeText:   { fontSize: 12, fontWeight: '800', color: '#fff' },

  statsRow:        { flexDirection: 'row', gap: 12, padding: 16, paddingTop: 20, paddingBottom: 4 },
  statCard: {
    flex: 1, backgroundColor: GLASS.light.bg, borderRadius: 16, padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: GLASS.light.border,
    ...Platform.select({ ios: { shadowColor: GLASS.light.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 }, android: { elevation: 2 } }),
  },
  statVal:         { fontSize: 22, fontWeight: '900', color: COLORS.primary },
  statLabel:       { fontSize: 10, color: COLORS.textMuted, marginTop: 4, fontWeight: '600' },

  section:         { paddingHorizontal: 16, marginBottom: 8, marginTop: 12 },
  sectionTitle:    { fontSize: 13, fontWeight: '800', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },

  menuCard: {
    backgroundColor: GLASS.light.bg, borderRadius: 18, overflow: 'hidden',
    borderWidth: 1, borderColor: GLASS.light.border, marginHorizontal: 16, marginBottom: 14,
    ...Platform.select({ ios: { shadowColor: GLASS.light.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 }, android: { elevation: 2 } }),
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16,
    borderBottomWidth: 1, borderBottomColor: GLASS.light.border,
  },
  menuItemLast:    { borderBottomWidth: 0 },
  menuIconBox: {
    width: 38, height: 38, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  menuLabel:       { flex: 1, fontSize: 14, fontWeight: '700', color: COLORS.text },
  menuSub:         { fontSize: 12, color: COLORS.textMuted, marginTop: 1 },
  menuArrow:       { width: 28, height: 28, borderRadius: 8, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },

  dangerCard: {
    backgroundColor: '#FEE2E2', borderRadius: 18, padding: 18,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 16, marginBottom: 20,
    borderWidth: 1, borderColor: '#FCA5A5',
  },
  dangerIconBox:   { width: 38, height: 38, borderRadius: 11, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' },
  dangerText:      { fontSize: 14, fontWeight: '800', color: '#991B1B', flex: 1 },
});