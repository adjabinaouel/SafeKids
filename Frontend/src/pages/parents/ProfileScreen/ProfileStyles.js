// src/pages/parents/ProfileScreen/ProfileStyles.js
import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
export const IS_TABLET = width >= 768;

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
export const COLORS = {
  // Brand
  primary:       '#7C3AED',
  primaryDark:   '#5B21B6',
  primaryLight:  '#EDE9FE',
  primaryGlow:   '#DDD6FE',

  // Surfaces
  surface:       '#F5F3FF',
  white:         '#FFFFFF',
  inputBg:       '#F8FAFC',

  // Text
  text:          '#1E293B',
  textLight:     '#64748B',
  textMuted:     '#94A3B8',

  // Borders
  border:        '#E2E8F0',
  borderLight:   '#F1F5F9',

  // Semantic
  success:       '#10B981',
  successBg:     '#D1FAE5',
  successText:   '#059669',
  error:         '#EF4444',
  errorBg:       '#FEE2E2',
  warning:       '#F59E0B',
  warningBg:     '#FEF3C7',
  warningText:   '#D97706',

  // Misc
  cardShadow:    '#7C3AED',
};

export const SHADOWS = {
  sm: Platform.select({
    ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
    android: { elevation: 2 },
  }),
  md: Platform.select({
    ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16 },
    android: { elevation: 6 },
  }),
  lg: Platform.select({
    ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 24 },
    android: { elevation: 12 },
  }),
};

// ─── SHARED RADIUS ─────────────────────────────────────────────────────────────
const RADIUS = {
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  xxl: 24,
};

// ─── STYLES ────────────────────────────────────────────────────────────────────
export default StyleSheet.create({

  // ── Layout ────────────────────────────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 48,
  },

  // ── ProfileScreen — Header ────────────────────────────────────────────────
  premiumHeader: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 24,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  headerContent: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },

  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
    fontWeight: '500',
  },

  // ── ProfileScreen — Animated wrapper ─────────────────────────────────────
  animatedContent: {
    flex: 1,
  },

  // ── ProfileScreen — Avatar ────────────────────────────────────────────────
  avatarContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 14,
  },

  // ✅ Fix caméra : conteneur position:relative avec dimensions exactes du cercle
  avatarWrapper: {
    width: 108,
    height: 108,
    position: 'relative',
  },

  avatarGradient: {
    width: 108,
    height: 108,
    borderRadius: 54,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
  },

  avatarImage: {
    width: 108,
    height: 108,
    borderRadius: 54,
  },

  cameraButton: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
    zIndex: 10,
  },

  // ── ProfileScreen — Name & badge ──────────────────────────────────────────
  fullName: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: -0.6,
    marginBottom: 6,
  },

  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },

  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.successBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.xl,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.successText,
  },

  userRole: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },

  // ── ProfileScreen — Stats ─────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },

  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    ...SHADOWS.md,
  },

  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  statLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '500',
    marginBottom: 3,
  },

  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },

  // ── ProfileScreen — Info section ──────────────────────────────────────────
  infoSection: {
    marginBottom: 24,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },

  cancelEdit: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.error,
  },

  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xxl,
    paddingHorizontal: 16,
    paddingVertical: 4,
    ...SHADOWS.sm,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.borderLight,
  },

  infoContent: {
    flex: 1,
    marginLeft: 12,
  },

  infoLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },

  inputEditable: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primaryGlow,
    paddingBottom: 2,
    color: COLORS.primary,
  },

  // ── ProfileScreen — Action buttons ───────────────────────────────────────
  actionButtons: {
    gap: 10,
    marginBottom: 32,
  },

  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: RADIUS.xl,
    ...SHADOWS.sm,
  },

  settingsButtonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },

  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: RADIUS.xl,
  },

  editButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },

  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: RADIUS.xl,
    ...SHADOWS.md,
  },

  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },

  loadingButton: {
    backgroundColor: COLORS.primaryDark,
    opacity: 0.85,
  },

  // ── ProfileScreen — Footer ────────────────────────────────────────────────
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 10,
  },

  versionText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },

  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  supportText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // ── SettingsScreen — Header ───────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 20,
    paddingBottom: 16,
  },

  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  headerTitleWrap: {
    flex: 1,
    marginLeft: 12,
  },

  headerSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 2,
    fontWeight: '500',
  },

  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },

  headerSaveBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.white,
  },

  headerSaveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // ── SettingsScreen — Layout ───────────────────────────────────────────────
  contentRow: {
    flexDirection: IS_TABLET ? 'row' : 'column',
    flex: 1,
  },

  // ── SettingsScreen — Side nav (tablet) / Horizontal scroll (mobile) ───────
  settingsNav: {
    width: IS_TABLET ? 220 : '100%',
    backgroundColor: COLORS.white,
    borderRadius: IS_TABLET ? RADIUS.xl : 0,
    margin: IS_TABLET ? 16 : 0,
    marginRight: IS_TABLET ? 0 : 0,
    paddingVertical: IS_TABLET ? 12 : 0,
    paddingHorizontal: IS_TABLET ? 8 : 0,
    ...SHADOWS.sm,
  },

  settingsNavScroll: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },

  settingsNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: IS_TABLET ? 12 : 9,
    paddingHorizontal: IS_TABLET ? 14 : 12,
    borderRadius: RADIUS.md,
    marginBottom: IS_TABLET ? 2 : 0,
  },

  settingsNavItemActive: {
    backgroundColor: COLORS.primaryLight,
  },

  settingsNavLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textLight,
  },

  settingsNavLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  // ── SettingsScreen — Form panel ───────────────────────────────────────────
  formPanel: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    margin: 16,
    marginLeft: IS_TABLET ? 12 : 16,
    padding: 20,
    ...SHADOWS.sm,
  },

  formTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },

  formSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 20,
  },

  formSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    marginTop: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },

  formField: {
    flex: 1,
  },

  formLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  formInput: {
    backgroundColor: COLORS.inputBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },

  // ── SettingsScreen — Profile upload row ──────────────────────────────────
  profileUploadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: RADIUS.lg,
    marginBottom: 20,
  },

  profileUploadInfo: {
    flex: 1,
  },

  profileUploadName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },

  profileUploadRole: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 8,
  },

  profileUploadActions: {
    flexDirection: 'row',
    gap: 8,
  },

  uploadBtn: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },

  uploadBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // ── SettingsScreen — Toggle rows ──────────────────────────────────────────
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.borderLight,
  },

  toggleRowLast: {
    borderBottomWidth: 0,
  },

  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },

  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },

  toggleSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // ── SettingsScreen — Security / list rows ─────────────────────────────────
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.borderLight,
  },

  securityRowLast: {
    borderBottomWidth: 0,
  },

  securityIcon: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },

  securityContent: {
    flex: 1,
  },

  securityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },

  securityValue: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // ── SettingsScreen — Danger zone ──────────────────────────────────────────
  dangerZone: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.errorBg,
  },

  dangerTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.error,
    marginBottom: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.borderLight,
  },

  dangerRowLast: {
    borderBottomWidth: 0,
  },

  dangerIcon: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.errorBg,
    justifyContent: 'center',
    alignItems: 'center',
  },

  dangerLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.error,
  },

  // ── SettingsScreen — Billing ──────────────────────────────────────────────
  upgradeButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },

  upgradeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },

  // ── Shared ────────────────────────────────────────────────────────────────
  version: {
    textAlign: 'center',
    fontSize: 11,
    color: '#CBD5E1',
    marginTop: 20,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});