// src/pages/Medecins/PatientsScreen/PatientsScreenStyles.js
import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Responsive helpers
const isSmallScreen = width < 375;
const isTablet = width >= 768;
const scaleFactor = Math.min(width / 375, 1); // Scale based on 375px reference

export const COLORS = {
  primary: '#7C3AED',
  primaryLight: '#EDE9FE',
  text: '#1E1B4B',
  textLight: '#64748B',
  textMuted: '#94A3B8',
  white: '#FFFFFF',
  border: '#E2E8F0',
  success: '#10B981',
  error: '#EF4444',
};

const S = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7FF',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F7FF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14 + scaleFactor * 2,
    color: COLORS.textLight,
    fontWeight: '600',
  },

  // Header
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24 + scaleFactor * 8,
    paddingHorizontal: 16 + scaleFactor * 8,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22 + scaleFactor * 6,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13 + scaleFactor * 3,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginBottom: 16 + scaleFactor * 8,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8 + scaleFactor * 8,
  },
  statBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14 + scaleFactor * 2,
    paddingVertical: 10 + scaleFactor * 2,
    paddingHorizontal: 12 + scaleFactor * 4,
    alignItems: 'center',
    minWidth: 60 + scaleFactor * 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statNumber: {
    fontSize: 20 + scaleFactor * 4,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 10 + scaleFactor * 2,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '700',
    marginTop: 2,
  },

  // List
  listContainer: {
    padding: 12 + scaleFactor * 8,
  },

  // Patient Card
  patientCard: {
    backgroundColor: '#fff',
    borderRadius: 16 + scaleFactor * 4,
    padding: 14 + scaleFactor * 4,
    marginBottom: 10 + scaleFactor * 2,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.12)',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  patientAvatar: {
    width: 40 + scaleFactor * 10,
    height: 40 + scaleFactor * 10,
    borderRadius: 20 + scaleFactor * 5,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10 + scaleFactor * 4,
  },
  patientInitials: {
    fontSize: 14 + scaleFactor * 4,
    fontWeight: '900',
    color: COLORS.primary,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 15 + scaleFactor * 3,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 2,
  },
  patientMeta: {
    fontSize: 11 + scaleFactor * 2,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  patientDetails: {
    backgroundColor: '#F8F7FF',
    borderRadius: 12 + scaleFactor * 2,
    padding: 12 + scaleFactor * 2,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailRowLast: {
    marginBottom: 0,
  },
  detailLabel: {
    fontSize: 11 + scaleFactor * 2,
    color: COLORS.textLight,
    fontWeight: '700',
  },
  detailValue: {
    fontSize: 11 + scaleFactor * 2,
    color: COLORS.text,
    fontWeight: '600',
  },
  parentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4 + scaleFactor * 2,
  },
  parentText: {
    fontSize: 10 + scaleFactor * 2,
    color: COLORS.primary,
    fontWeight: '700',
  },
  patientActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12 + scaleFactor * 2,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.18)',
    paddingVertical: 8 + scaleFactor * 2,
    paddingHorizontal: 8 + scaleFactor * 4,
    backgroundColor: '#fff',
    marginRight: 6,
  },
  actionButtonPressed: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  deleteActionButton: {
    borderColor: COLORS.error,
    backgroundColor: '#FEF2F2',
    marginRight: 0,
  },
  deleteActionButtonPressed: {
    backgroundColor: COLORS.error,
    borderColor: COLORS.error,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 11 + scaleFactor * 2,
    fontWeight: '700',
    color: COLORS.primary,
  },
  actionTextPressed: {
    color: '#fff',
  },
  deleteActionText: {
    color: COLORS.error,
  },
  deleteActionTextPressed: {
    color: '#fff',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },

  // Modal de confirmation
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  modalWarning: {
    fontSize: 13,
    color: COLORS.error,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalConfirmButton: {
    backgroundColor: COLORS.error,
  },
  modalButtonDisabled: {
    opacity: 0.7,
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  modalConfirmText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },

  // Search and Toggle
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    width: '100%',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
    paddingVertical: 0,
  },
  toggleButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
  },
  toggleTextActive: {
    color: '#fff',
  },
});

export default S;