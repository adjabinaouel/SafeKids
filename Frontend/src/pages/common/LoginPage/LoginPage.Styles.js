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

  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: isWeb ? 0 : 20,
    paddingVertical: isWeb ? 32 : 20,
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

  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6D28D9',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },

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

  form: {},
  inputGroup: {
    marginBottom: 14,
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
    backgroundColor: COLORS.white,        // ✅ FIX : blanc pur pour meilleur contraste
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 13,
    height: 48,
  },
  inputWrapperActive: {
    borderColor: COLORS.borderActive,
    backgroundColor: COLORS.white,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: {},                         // ✅ FIX : pas d'elevation sur Android
      web: { boxShadow: '0 0 0 3px rgba(124,58,237,0.08)' },
    }),
  },
  inputIcon: {
    marginRight: 9,
  },
  input: {
    flex: 1,
    fontSize: 15,                          // ✅ FIX : légèrement plus grand
    color: '#1A1035',                      // ✅ FIX : quasi-noir pour lisibilité maximale
    fontWeight: '500',                     // ✅ FIX : moins lourd, plus lisible
    height: 48,
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },

  forgotPassword: {
    color: COLORS.primary,
    fontSize: 12.5,
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: 10,
    marginTop: -4,
  },

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

  divider: {
    height: 1,
    backgroundColor: 'rgba(167,139,250,0.15)',
    marginVertical: 16,
  },

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