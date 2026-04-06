import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

const COLORS = {
  primary:      '#7C3AED',
  primaryLight: '#EDE9FE',
  background:   '#FDF8FF',
  surface:      'rgba(248,245,255,0.9)',
  glass:        'rgba(255,255,255,0.88)',
  text:         '#1A1035',
  textLight:    '#8B7AA8',
  border:       'rgba(196,181,253,0.4)',
  borderActive: '#7C3AED',
  white:        '#FFFFFF',
  errorBg:      '#FCE7F3',
  errorText:    '#9D174D',
  errorBorder:  '#FBCFE8',
};

export default StyleSheet.create({

  // ── Layout ──────────────────────────────────────────
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: isWeb ? 0 : 20,
    paddingVertical: isWeb ? 32 : 20,
    // ✅ FIX : pas de justifyContent sur Android pour éviter les recalculs
    alignItems: isWeb ? 'center' : 'stretch',
  },
  card: {
    backgroundColor: COLORS.glass,
    borderRadius: 28,
    padding: isWeb ? 40 : 4,
    width: isWeb ? 460 : '100%',
    borderWidth: isWeb ? 1.5 : 0,
    borderColor: 'rgba(167,139,250,0.25)',
    ...Platform.select({
      web: {
        boxShadow: '0 8px 48px rgba(124,58,237,0.12), 0 2px 8px rgba(124,58,237,0.06)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      },
    }),
  },

  // ── Brand ───────────────────────────────────────────
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  brandIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.5,
  },

  // ── Header ──────────────────────────────────────────
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  titleAccent: {
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },

  // ── Section label ────────────────────────────────────
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6D28D9',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },

  // ── Roles ────────────────────────────────────────────
  roleGrid: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  roleCard: {
    flex: 1,
    backgroundColor: 'rgba(245,240,255,0.7)',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    marginRight: 8,
  },
  roleCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(237,233,254,0.95)',
  },
  roleText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textLight,
    letterSpacing: 0.8,
  },
  roleTextActive: {
    color: COLORS.primary,
  },

  // ── Alerte ───────────────────────────────────────────
  alert: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
  },
  alertError: {
    backgroundColor: COLORS.errorBg,
    borderColor: COLORS.errorBorder,
  },
  alertText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.errorText,
  },

  // ── Form ─────────────────────────────────────────────
  form: {},
  inputGroup: {
    marginBottom: 14,
    // ✅ FIX : hauteur fixe pour éviter que le layout recalcule au focus
    minHeight: 74,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6D28D9',
    marginBottom: 5,
    marginLeft: 2,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 13,
    // ✅ FIX : hauteur fixe obligatoire
    height: 48,
    // ✅ FIX : pas d'elevation ici sur Android (cause les sauts)
  },
  inputWrapperActive: {
    borderColor: COLORS.borderActive,
    backgroundColor: COLORS.white,
    // ✅ FIX : elevation SUPPRIMÉ sur Android — c'était la cause des vibrations
    // L'elevation force Android à redessiner le shadow layer au focus → saut visuel
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: {
        // ❌ elevation: 2  ← supprimé volontairement
      },
      web: { boxShadow: '0 0 0 3px rgba(124,58,237,0.08)' },
    }),
  },
  inputIcon: {
    marginRight: 9,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#4C1D95',
    fontWeight: '600',
    // ✅ FIX : hauteur explicite sur Android
    height: 48,
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },

  // ── Forgot ───────────────────────────────────────────
  forgotPassword: {
    color: COLORS.primary,
    fontSize: 12.5,
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: 10,
    marginTop: -4,
  },

  // ── Bouton principal ─────────────────────────────────
  primaryButton: {
    height: 50,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    backgroundColor: COLORS.primary,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 14,
      },
      android: { elevation: 8 },
      web: { boxShadow: '0 6px 24px rgba(124,58,237,0.35)' },
    }),
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  // ── Séparateur ───────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: 'rgba(167,139,250,0.15)',
    marginVertical: 16,
  },

  // ── Footer ───────────────────────────────────────────
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  footerLink: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '800',
  },
});