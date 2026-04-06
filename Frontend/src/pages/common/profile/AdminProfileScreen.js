// src/pages/admin/ProfileScreen/AdminProfileScreen.js
import React, { useEffect } from 'react';
import {
  View, Text, TextInput, Image, TouchableOpacity, ScrollView,
  StatusBar, Animated, ActivityIndicator, Modal, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AdminLayout from '../../../components/Navigation/AdminNavigation';
import { useProfileBase } from './useProfileBase';
import S, { COLORS } from './ProfileStyles';

const STORAGE_KEY = 'adminProfile';

const DEFAULT_ADMIN = {
  prenom:        'Nassim',
  nom:           'Lounici',
  email:         'admin@safekids.app',
  phone:         '+213 555 000 001',
  role:          'Super Administrateur',
  niveau:        'Niveau 3 — Accès complet',
  departement:   'Direction Technique',
  identifiant:   'ADM-2024-001',
  dateCreation:  '12 Jan 2024',
  dernierAcces:  "Aujourd'hui à 09:14",
  avatar:        null,
};

const PERMISSIONS = [
  { label: 'Gestion des comptes',     granted: true  },
  { label: 'Gestion des médecins',    granted: true  },
  { label: 'Rapports & statistiques', granted: true  },
  { label: 'Configuration système',   granted: true  },
  { label: 'Facturation',             granted: false },
];

const ACTIVITY_LOG = [
  { action: 'Compte médecin créé',        date: "Aujourd'hui 09:01", icon: 'user-plus' },
  { action: 'Rapport mensuel exporté',    date: "Hier 17:42",        icon: 'file-text' },
  { action: 'Paramètres système modifiés',date: "Hier 14:15",        icon: 'settings'  },
  { action: 'Connexion détectée',         date: "12/06 08:30",       icon: 'log-in'    },
];

// ─── InfoRow ──────────────────────────────────────────────────────────────────
const InfoRow = ({ icon, label, value, field, isLast = false, isEditing = false, onChangeText, locked = false, isMCI = false }) => (
  <View style={[S.infoRow, isLast && { borderBottomWidth: 0 }]}>
    <View style={[S.securityIcon, { backgroundColor: locked ? '#FEF3C7' : COLORS.primaryLight }]}>
      {isMCI
        ? <MaterialCommunityIcons name={icon} size={16} color={locked ? '#D97706' : COLORS.primary} />
        : <Feather name={icon} size={16} color={locked ? '#D97706' : COLORS.primary} />}
    </View>
    <View style={S.infoContent}>
      <Text style={S.infoLabel}>{label}</Text>
      {isEditing && !locked ? (
        <TextInput
          style={[S.infoValue, S.inputEditable]}
          value={value}
          onChangeText={text => onChangeText(field, text)}
          placeholder="Modifier..."
          placeholderTextColor={COLORS.textMuted}
          autoCapitalize="none"
          returnKeyType="done"
        />
      ) : (
        <Text style={[S.infoValue, locked && { color: COLORS.textLight, fontStyle: 'italic' }]} numberOfLines={1}>
          {value}
        </Text>
      )}
    </View>
    {locked
      ? <Feather name="lock" size={13} color="#D97706" />
      : isEditing ? <Feather name="edit-2" size={14} color={COLORS.primary} /> : null}
  </View>
);

// ─── PermissionBadge ─────────────────────────────────────────────────────────
const PermissionBadge = ({ label, granted }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 14, borderBottomWidth: 0.5, borderBottomColor: COLORS.borderLight }}>
    <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: granted ? '#D1FAE5' : '#FEE2E2', justifyContent: 'center', alignItems: 'center' }}>
      <Feather name={granted ? 'check' : 'x'} size={13} color={granted ? '#059669' : '#DC2626'} />
    </View>
    <Text style={[S.infoValue, { flex: 1, color: granted ? COLORS.text : COLORS.textMuted }]}>{label}</Text>
    <Text style={{ fontSize: 11, fontWeight: '700', color: granted ? '#059669' : '#DC2626', backgroundColor: granted ? '#D1FAE5' : '#FEE2E2', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 }}>
      {granted ? 'Actif' : 'Restreint'}
    </Text>
  </View>
);

// ─── LogRow ───────────────────────────────────────────────────────────────────
const LogRow = ({ action, date, icon, isLast }) => (
  <View style={[S.infoRow, isLast && { borderBottomWidth: 0 }]}>
    <View style={[S.securityIcon, { backgroundColor: '#F1F5F9' }]}>
      <Feather name={icon} size={15} color={COLORS.textLight} />
    </View>
    <View style={S.infoContent}>
      <Text style={[S.infoValue, { fontSize: 13 }]}>{action}</Text>
      <Text style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{date}</Text>
    </View>
  </View>
);

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color }) {
  return (
    <View style={S.statCard}>
      <View style={[S.statIcon, { backgroundColor: color }]}>
        <Feather name={icon} size={18} color="#fff" />
      </View>
      <Text style={S.statLabel}>{label}</Text>
      <Text style={S.statValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

// ─── Écran principal ──────────────────────────────────────────────────────────
export default function AdminProfileScreen({ navigation }) {
  const {
    userData, loading, saving, isEditing, setIsEditing,
    showAvatarModal, setShowAvatarModal,
    showPhotoModal,  setShowPhotoModal,
    updateField, handleCancelEdit, handleSave,
    handlePickAvatar, handleModalCamera, handleModalGallery,
  } = useProfileBase(STORAGE_KEY, DEFAULT_ADMIN);

  const fadeAnim  = React.useState(new Animated.Value(0))[0];
  const scaleAnim = React.useState(new Animated.Value(0.96))[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 120, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const EDITABLE_FIELDS = [
    { icon: 'user',  label: 'Prénom',    field: 'prenom', value: userData.prenom },
    { icon: 'user',  label: 'Nom',       field: 'nom',    value: userData.nom    },
    { icon: 'mail',  label: 'Email',     field: 'email',  value: userData.email  },
    { icon: 'phone', label: 'Téléphone', field: 'phone',  value: userData.phone  },
  ];

  const LOCKED_FIELDS = [
    { icon: 'shield',    label: 'Rôle système',   field: 'role',         value: userData.role,         locked: true  },
    { icon: 'layers',    label: "Niveau d'accès", field: 'niveau',       value: userData.niveau,       locked: true  },
    { icon: 'briefcase', label: 'Département',    field: 'departement',  value: userData.departement,  locked: false },
    { icon: 'hash',      label: 'Identifiant',    field: 'identifiant',  value: userData.identifiant,  locked: true  },
    { icon: 'calendar',  label: 'Créé le',        field: 'dateCreation', value: userData.dateCreation, locked: true  },
    { icon: 'clock',     label: 'Dernier accès',  field: 'dernierAcces', value: userData.dernierAcces, locked: true  },
  ];

  if (loading) {
    return (
      <AdminLayout activeTab="profile">
        <View style={[S.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </AdminLayout>
    );
  }

  return (
    // ✅ AdminLayout wrappe tout comme ParentLayout dans ProfileScreen.js
    <AdminLayout activeTab="profile">
      <View style={S.container}>
        <StatusBar barStyle="light-content" />

        <LinearGradient colors={['#667eea', '#764ba2']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={S.premiumHeader}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={S.backButton} activeOpacity={0.8} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={S.headerContent}>
            <Text style={S.headerTitle}>Profil Administrateur</Text>
            <Text style={S.headerSubtitle}>Accès privilégié · {userData.niveau}</Text>
          </View>
        </LinearGradient>

        <Animated.View style={[S.animatedContent, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.scrollContent} keyboardShouldPersistTaps="handled">

            {/* Modal photo plein écran */}
            <Modal visible={showPhotoModal} transparent animationType="fade" onRequestClose={() => setShowPhotoModal(false)}>
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => setShowPhotoModal(false)} style={{ position: 'absolute', top: Platform.OS === 'ios' ? 56 : 24, right: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', zIndex: 10 }} activeOpacity={0.75}>
                  <Feather name="x" size={22} color="#fff" />
                </TouchableOpacity>
                {userData.avatar
                  ? <Image source={{ uri: userData.avatar }} style={{ width: 300, height: 300, borderRadius: 150 }} resizeMode="cover" />
                  : <View style={{ width: 300, height: 300, borderRadius: 150, backgroundColor: '#7C3AED', justifyContent: 'center', alignItems: 'center' }}><Ionicons name="person" size={120} color="#fff" /></View>}
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 24 }}>{userData.prenom} {userData.nom}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginTop: 4 }}>{userData.role} · {userData.identifiant}</Text>
                <TouchableOpacity onPress={() => { setShowPhotoModal(false); setTimeout(handlePickAvatar, 300); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#7C3AED', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14, marginTop: 32 }} activeOpacity={0.85}>
                  <Feather name="camera" size={18} color="#fff" />
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Modifier la photo</Text>
                </TouchableOpacity>
              </View>
            </Modal>

            {/* Modal sélection photo */}
            <Modal visible={showAvatarModal} transparent animationType="fade" onRequestClose={() => setShowAvatarModal(false)}>
              <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }} activeOpacity={1} onPress={() => setShowAvatarModal(false)}>
                <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 20, textAlign: 'center' }}>Photo de profil</Text>
                  <TouchableOpacity onPress={handleModalCamera} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#EDE9FE', borderRadius: 14, padding: 16, marginBottom: 10 }} activeOpacity={0.75}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#7C3AED', justifyContent: 'center', alignItems: 'center' }}><Feather name="camera" size={20} color="#fff" /></View>
                    <View><Text style={{ fontSize: 15, fontWeight: '700', color: '#1E293B' }}>Prendre une photo</Text><Text style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Ouvrir la caméra</Text></View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleModalGallery} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#F1F5F9', borderRadius: 14, padding: 16, marginBottom: 16 }} activeOpacity={0.75}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#64748B', justifyContent: 'center', alignItems: 'center' }}><Feather name="image" size={20} color="#fff" /></View>
                    <View><Text style={{ fontSize: 15, fontWeight: '700', color: '#1E293B' }}>Choisir depuis la galerie</Text><Text style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Accéder à vos photos</Text></View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowAvatarModal(false)} style={{ padding: 14, alignItems: 'center' }} activeOpacity={0.75}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: '#EF4444' }}>Annuler</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </Modal>

            {/* Avatar */}
            <View style={S.avatarContainer}>
              <View style={{ width: 108, height: 108 }}>
                <TouchableOpacity onPress={() => setShowPhotoModal(true)} activeOpacity={0.9}>
                  <LinearGradient colors={['#667eea', '#764ba2']} style={{ width: 108, height: 108, borderRadius: 54, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                    {userData.avatar
                      ? <Image source={{ uri: userData.avatar }} style={{ width: 108, height: 108, borderRadius: 54 }} />
                      : <Ionicons name="person" size={52} color="#fff" />}
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity onPress={handlePickAvatar} activeOpacity={0.85} style={{ position: 'absolute', bottom: 2, right: 2, width: 32, height: 32, borderRadius: 16, backgroundColor: '#7C3AED', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' }}>
                  <Feather name="camera" size={15} color="#fff" />
                </TouchableOpacity>
              </View>
              <Text style={{ textAlign: 'center', fontSize: 12, color: '#94A3B8', marginTop: 10 }}>Appuyez sur 📷 pour modifier</Text>
            </View>

            {/* Nom + badge */}
            <Text style={[S.fullName, { marginBottom: 4 }]}>{userData.prenom} {userData.nom}</Text>
            <View style={S.badgeContainer}>
              <View style={[S.verifiedBadge, { backgroundColor: COLORS.primaryLight }]}>
                <Feather name="shield" size={13} color={COLORS.primary} />
                <Text style={[S.badgeText, { color: COLORS.primary }]}>{userData.role}</Text>
              </View>
              <Text style={S.userRole}>{userData.identifiant}</Text>
            </View>

            {/* Stats */}
            <View style={S.statsRow}>
              <StatCard icon="shield"   label="Niveau"   value="Accès 3" color={COLORS.primary} />
              <StatCard icon="users"    label="Comptes"  value="247"      color="#3B82F6"        />
              <StatCard icon="activity" label="Activité" value="En ligne" color="#10B981"        />
            </View>

            {/* Informations personnelles */}
            <View style={S.infoSection}>
              <View style={S.sectionHeader}>
                <Text style={S.sectionTitle}>Informations personnelles</Text>
                {isEditing && <TouchableOpacity onPress={handleCancelEdit}><Text style={S.cancelEdit}>Annuler</Text></TouchableOpacity>}
              </View>
              <View style={S.infoCard}>
                {EDITABLE_FIELDS.map((item, index) => (
                  <InfoRow key={item.field} {...item} isLast={index === EDITABLE_FIELDS.length - 1} isEditing={isEditing} onChangeText={updateField} />
                ))}
              </View>
            </View>

            {/* Informations système */}
            <View style={S.infoSection}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Text style={S.sectionTitle}>Informations système</Text>
                <View style={{ backgroundColor: '#FEF3C7', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: '#D97706' }}>🔒 PARTIEL</Text>
                </View>
              </View>
              <View style={S.infoCard}>
                {LOCKED_FIELDS.map((item, index) => (
                  <InfoRow key={item.field} {...item} isLast={index === LOCKED_FIELDS.length - 1} isEditing={isEditing} onChangeText={updateField} />
                ))}
              </View>
            </View>

            {/* Permissions */}
            <View style={S.infoSection}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Text style={S.sectionTitle}>Permissions & accès</Text>
                <View style={{ backgroundColor: COLORS.primaryLight, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: COLORS.primary }}>🔒 LECTURE SEULE</Text>
                </View>
              </View>
              <View style={[S.infoCard, { paddingHorizontal: 0, paddingVertical: 0 }]}>
                {PERMISSIONS.map((p) => <PermissionBadge key={p.label} {...p} />)}
              </View>
            </View>

            {/* Journal */}
            <View style={S.infoSection}>
              <Text style={S.sectionTitle}>Journal d'activité récente</Text>
              <View style={S.infoCard}>
                {ACTIVITY_LOG.map((entry, index) => (
                  <LogRow key={index} {...entry} isLast={index === ACTIVITY_LOG.length - 1} />
                ))}
              </View>
            </View>

            {/* Boutons */}
            <View style={S.actionButtons}>
              <TouchableOpacity style={S.settingsButton} onPress={() => navigation?.navigate('AdminSettings')} activeOpacity={0.85}>
                <Feather name="settings" size={20} color={COLORS.primary} />
                <Text style={S.settingsButtonText}>Paramètres système</Text>
                <Feather name="chevron-right" size={18} color={COLORS.primary} />
              </TouchableOpacity>

              {isEditing ? (
                <TouchableOpacity style={[S.saveButton, saving && S.loadingButton]} onPress={() => handleSave()} disabled={saving} activeOpacity={0.85}>
                  {saving
                    ? <><ActivityIndicator size="small" color="#fff" /><Text style={S.saveButtonText}>Sauvegarde...</Text></>
                    : <><Feather name="save" size={18} color="#fff" /><Text style={S.saveButtonText}>Sauvegarder les modifications</Text></>}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={S.editButton} onPress={() => setIsEditing(true)} activeOpacity={0.85}>
                  <Feather name="edit-3" size={18} color={COLORS.primary} />
                  <Text style={S.editButtonText}>Modifier le profil</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Footer */}
            <View style={S.footer}>
              <Text style={S.versionText}>SafeKids v2.1.0 · Panneau Administrateur</Text>
              <TouchableOpacity style={S.supportButton} activeOpacity={0.75}>
                <Feather name="help-circle" size={15} color={COLORS.textLight} />
                <Text style={S.supportText}>Documentation admin</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </Animated.View>
      </View>
    </AdminLayout>
  );
}