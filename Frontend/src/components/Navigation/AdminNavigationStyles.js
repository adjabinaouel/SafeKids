
import { StyleSheet, Platform } from 'react-native';
import { COLORS, GLASS } from '../../theme';

export const ADMIN_HEADER_STYLES = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'ios' ? 54 : 36,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  topRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 4,
  },
  sub:    { fontSize: 13, color: 'rgba(255,255,255,0.70)', fontWeight: '600', marginBottom: 4 },
  title:  { fontSize: 24, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  accent: { color: '#FCD34D' },
  iconBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: GLASS.hero.bg,
    borderWidth: 1, borderColor: GLASS.hero.border,
    justifyContent: 'center', alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: GLASS.hero.bg,
    borderRadius: 14, borderWidth: 1.5, borderColor: GLASS.hero.border,
    paddingHorizontal: 14, height: 46, marginTop: 14,
  },
  searchInput: {
    flex: 1, fontSize: 14, color: '#fff', fontWeight: '500',
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },
});

export const ADMIN_CARD_STYLES = StyleSheet.create({
  card: {
    backgroundColor: GLASS.light.bg,
    borderRadius: 16, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: GLASS.light.border,
    ...Platform.select({
      ios:     { shadowColor: GLASS.light.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '900', color: COLORS.text, letterSpacing: -0.4 },
  seeAll: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
});