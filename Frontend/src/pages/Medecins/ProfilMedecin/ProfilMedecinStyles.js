// ✅ Styles pour la page profil médecin
import { StyleSheet, Platform } from 'react-native';

export const COLORS = {
  primary:      '#7C3AED',
  primaryLight: '#EDE9FE',
  text:         '#1F2937',
  textLight:    '#6B7280',
  textMuted:    '#9CA3AF',
  bgLight:      '#F9FAFB',
  border:       '#E5E7EB',
  success:      '#10B981',
  warning:      '#F59E0B',
  danger:       '#EF4444',
};

const S = StyleSheet.create({
  // ── Conteneur principal ────────────────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // ── En-tête dégradé ────────────────────────────────────────────────────────
  premiumHeader: {
    paddingTop: Platform.OS === 'ios' ? 56 : 24,
    paddingHorizontal: 20,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerContent: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },

  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },

  // ── Contenu animé ──────────────────────────────────────────────────────────
  animatedContent: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },

  // ── Avatar ─────────────────────────────────────────────────────────────────
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
    paddingHorizontal: 12,
  },

  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  avatarInfo: {
    flex: 1,
  },

  avatarName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },

  avatarRole: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 8,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // ── Stats ──────────────────────────────────────────────────────────────────
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    paddingHorizontal: 4,
  },

  statCard: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    gap: 8,
  },

  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  statLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '600',
    textAlign: 'center',
  },

  statValue: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },

  // ── Sections ───────────────────────────────────────────────────────────────
  section: {
    marginBottom: 20,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },

  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  infoContainer: {
    backgroundColor: COLORS.bgLight,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  securityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },

  inputEditable: {
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.primary,
    paddingBottom: 4,
  },

  // ── Disponibilités ─────────────────────────────────────────────────────────
  disponibiliteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.bgLight,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  disponibiliteLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginBottom: 4,
  },

  disponibiliteValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },

  // ── Boutons d'action ───────────────────────────────────────────────────────
  actionButtons: {
    gap: 12,
    marginTop: 24,
  },

  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },

  buttonPrimary: {
    backgroundColor: COLORS.primary,
  },

  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },

  buttonSecondary: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },

  buttonTextSecondary: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // ── Modals ─────────────────────────────────────────────────────────────────
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '80%',
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },

  inputGroup: {
    marginBottom: 12,
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
  },

  // ── Items jour ─────────────────────────────────────────────────────────────
  jourItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  jourText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },

  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },

  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
});

export default S;
