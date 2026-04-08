// src/pages/admin/ProfileScreen/AdminProfileScreen.js
import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, TextInput, Image, TouchableOpacity, ScrollView,
  StatusBar, Animated, ActivityIndicator, Alert, Modal, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AdminLayout from '../../../components/Navigation/AdminNavigation';
import S, { COLORS } from './ProfileStyles';

const SERVER_URL = 'https://unfailed-branden-healable.ngrok-free.dev';

const PERMISSIONS = [
  { label: 'Gestion des comptes',     granted: true  },
  { label: 'Gestion des médecins',    granted: true  },
  { label: 'Rapports & statistiques', granted: true  },
  { label: 'Configuration système',   granted: true  },
  { label: 'Facturation',             granted: false },
];

const ACTIVITY_LOG = [
  { action: 'Compte médecin créé',         date: "Aujourd'hui 09:01", icon: 'user-plus' },
  { action: 'Rapport mensuel exporté',     date: "Hier 17:42",        icon: 'file-text' },
  { action: 'Paramètres système modifiés', date: "Hier 14:15",        icon: 'settings'  },
  { action: 'Connexion détectée',          date: "12/06 08:30",       icon: 'log-in'    },
];

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
          {value || '—'}
        </Text>
      )}
    </View>
    {locked
      ? <Feather name="lock" size={13} color="#D97706" />
      : isEditing ? <Feather name="edit-2" size={14} color={COLORS.primary} /> : null}
  </View>
);

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

const StatCard = ({ icon, label, value, color }) => (
  <View style={S.statCard}>
    <View style={[S.statIcon, { backgroundColor: color }]}>
      <Feather name={icon} size={18} color="#fff" />
    </View>
    <Text style={S.statLabel}>{label}</Text>
    <Text style={S.statValue} numberOfLines={1}>{value}</Text>
  </View>
);

export default function AdminProfileScreen({ navigation }) {
  const [userData, setUserData]           = useState(null);
  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);
  const [isEditing, setIsEditing]         = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal]   = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [ancienMdp, setAncienMdp]     = useState('');
  const [nouveauMdp, setNouveauMdp]   = useState('');
  const [confirmMdp, setConfirmMdp]   = useState('');
  const [changingPwd, setChangingPwd] = useState(false);

  const userDataRef = useRef(userData);
  useEffect(() => { userDataRef.current = userData; }, [userData]);

  const fadeAnim  = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.96))[0];

  useEffect(() => {
    const init = async () => {
      await loadAdminProfile();
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 120, friction: 8, useNativeDriver: true }),
      ]).start();
    };
    init();
  }, []);

  // ── Charger profil ──────────────────────────────────────────────────────────
  const loadAdminProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Session expirée', 'Veuillez vous reconnecter.');
        navigation.navigate('Login');
        return;
      }

      const response = await fetch(`${SERVER_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          Alert.alert('Session expirée', 'Veuillez vous reconnecter.');
          navigation.navigate('Login');
        } else {
          Alert.alert('Erreur', data.message || 'Impossible de charger le profil');
        }
        return;
      }

      setUserData({
        prenom:       data.prenom      || 'Admin',
        nom:          data.nom         || '',
        email:        data.email       || '',
        phone:        data.telephone   || '',
        departement:  data.departement || 'Direction Technique',
        role:         data.role        || 'Super Administrateur',
        niveau:       'Niveau 3 — Accès complet',
        identifiant:  'ADM-2024-001',
        dateCreation: data.dateCreation
          ? new Date(data.dateCreation).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
          : '—',
        dernierAcces: "Aujourd'hui",
        avatar: data.avatar ? `${SERVER_URL}${data.avatar}` : null,
      });

    } catch (error) {
      console.error('Erreur chargement profil admin:', error);
      Alert.alert('Erreur', 'Impossible de charger votre profil.');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => setUserData(prev => ({ ...prev, [field]: value }));

  const handleCancelEdit = () => {
    loadAdminProfile();
    setIsEditing(false);
  };

  // ── Sauvegarder ─────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('userToken');

      const response = await fetch(`${SERVER_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          prenom:      userData.prenom,
          nom:         userData.nom,
          telephone:   userData.phone,
          departement: userData.departement,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Erreur', data.message || 'Impossible de sauvegarder');
        return;
      }

      Alert.alert('Succès ✅', 'Profil mis à jour avec succès !');
      setIsEditing(false);
      await loadAdminProfile();

    } catch (error) {
      Alert.alert('Erreur', 'Impossible de contacter le serveur.');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // ── Changer mot de passe ────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!ancienMdp || !nouveauMdp || !confirmMdp) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    if (nouveauMdp.length < 8) {
      Alert.alert('Erreur', 'Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (nouveauMdp !== confirmMdp) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }

    setChangingPwd(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${SERVER_URL}/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ ancienMotDePasse: ancienMdp, nouveauMotDePasse: nouveauMdp }),
      });

      const data = await response.json();
      if (!response.ok) {
        Alert.alert('Erreur', data.message || 'Impossible de changer le mot de passe');
        return;
      }

      Alert.alert('Succès ✅', 'Mot de passe modifié avec succès !');
      setShowPasswordModal(false);
      setAncienMdp(''); setNouveauMdp(''); setConfirmMdp('');

    } catch (error) {
      Alert.alert('Erreur', 'Impossible de contacter le serveur.');
    } finally {
      setChangingPwd(false);
    }
  };

  // ── Upload avatar ───────────────────────────────────────────────────────────
  const uploadAvatar = async (uri) => {
    setUploadingAvatar(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      const mimeType = uri.endsWith('.png') ? 'image/png' : 'image/jpeg';

      const response = await fetch(`${SERVER_URL}/upload-avatar-base64`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });

      const data = await response.json();
      if (!response.ok) {
        Alert.alert('Erreur', data.message || "Impossible d'uploader l'avatar");
        return;
      }

      setUserData(prev => ({ ...prev, avatar: `${SERVER_URL}${data.avatarUrl}` }));
      Alert.alert('Succès ✅', 'Photo de profil mise à jour !');

    } catch (error) {
      Alert.alert('Erreur', "Impossible d'uploader la photo.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission refusée', "Autorisez l'accès à la caméra."); return; }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!result.canceled && result.assets?.length > 0) await uploadAvatar(result.assets[0].uri);
  };

  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission refusée', "Autorisez l'accès à la galerie."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!result.canceled && result.assets?.length > 0) await uploadAvatar(result.assets[0].uri);
  };

  const handleModalCamera = async () => { setShowAvatarModal(false); await new Promise(r => setTimeout(r, 350)); await openCamera(); };
  const handleModalGallery = async () => { setShowAvatarModal(false); await new Promise(r => setTimeout(r, 350)); await openGallery(); };

  if (loading) {
    return (
      <AdminLayout activeTab="profile">
        <View style={[S.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 10, color: COLORS.textMuted }}>Chargement du profil...</Text>
        </View>
      </AdminLayout>
    );
  }

  if (!userData) {
    return (
      <AdminLayout activeTab="profile">
        <View style={[S.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text>Impossible de charger le profil</Text>
          <TouchableOpacity onPress={loadAdminProfile} style={{ marginTop: 16, padding: 12, backgroundColor: COLORS.primary, borderRadius: 10 }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </AdminLayout>
    );
  }

  const EDITABLE_FIELDS = [
    { icon: 'user',      label: 'Prénom',      field: 'prenom',      value: userData.prenom      },
    { icon: 'user',      label: 'Nom',         field: 'nom',         value: userData.nom         },
    { icon: 'mail',      label: 'Email',       field: 'email',       value: userData.email       },
    { icon: 'phone',     label: 'Téléphone',   field: 'phone',       value: userData.phone       },
    { icon: 'briefcase', label: 'Département', field: 'departement', value: userData.departement },
  ];

  const LOCKED_FIELDS = [
    { icon: 'shield',   label: 'Rôle système',   field: 'role',         value: userData.role,         locked: true },
    { icon: 'layers',   label: "Niveau d'accès", field: 'niveau',       value: userData.niveau,       locked: true },
    { icon: 'hash',     label: 'Identifiant',    field: 'identifiant',  value: userData.identifiant,  locked: true },
    { icon: 'calendar', label: 'Créé le',        field: 'dateCreation', value: userData.dateCreation, locked: true },
    { icon: 'clock',    label: 'Dernier accès',  field: 'dernierAcces', value: userData.dernierAcces, locked: true },
  ];

  return (
    <AdminLayout activeTab="profile">
      <View style={S.container}>
        <StatusBar barStyle="light-content" />

        <LinearGradient colors={['#4C1D95', '#1E1B4B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={S.premiumHeader}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={S.backButton} activeOpacity={0.8}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={S.headerContent}>
            <Text style={S.headerTitle}>Profil Administrateur</Text>
            <Text style={S.headerSubtitle}>Accès privilégié · {userData.niveau}</Text>
          </View>
        </LinearGradient>

        <Animated.View style={[S.animatedContent, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.scrollContent} keyboardShouldPersistTaps="handled">

            {/* ── Modal Photo Plein Écran ── */}
            <Modal visible={showPhotoModal} transparent animationType="fade" onRequestClose={() => setShowPhotoModal(false)}>
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => setShowPhotoModal(false)} style={{ position: 'absolute', top: Platform.OS === 'ios' ? 56 : 24, right: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
                  <Feather name="x" size={22} color="#fff" />
                </TouchableOpacity>
                {userData.avatar
                  ? <Image source={{ uri: userData.avatar }} style={{ width: 300, height: 300, borderRadius: 150 }} resizeMode="cover" />
                  : <View style={{ width: 300, height: 300, borderRadius: 150, backgroundColor: '#4C1D95', justifyContent: 'center', alignItems: 'center' }}><Ionicons name="person" size={120} color="#fff" /></View>}
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 24 }}>{userData.prenom} {userData.nom}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginTop: 4 }}>{userData.role} · {userData.identifiant}</Text>
              </View>
            </Modal>

            {/* ── Modal Sélection Photo ── */}
            <Modal visible={showAvatarModal} transparent animationType="fade" onRequestClose={() => setShowAvatarModal(false)}>
              <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }} activeOpacity={1} onPress={() => setShowAvatarModal(false)}>
                <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 20, textAlign: 'center' }}>Photo de profil</Text>
                  <TouchableOpacity onPress={handleModalCamera} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#EDE9FE', borderRadius: 14, padding: 16, marginBottom: 10 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#4C1D95', justifyContent: 'center', alignItems: 'center' }}><Feather name="camera" size={20} color="#fff" /></View>
                    <View><Text style={{ fontSize: 15, fontWeight: '700', color: '#1E293B' }}>Prendre une photo</Text><Text style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Ouvrir la caméra</Text></View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleModalGallery} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#F1F5F9', borderRadius: 14, padding: 16, marginBottom: 16 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#64748B', justifyContent: 'center', alignItems: 'center' }}><Feather name="image" size={20} color="#fff" /></View>
                    <View><Text style={{ fontSize: 15, fontWeight: '700', color: '#1E293B' }}>Choisir depuis la galerie</Text><Text style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Accéder à vos photos</Text></View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowAvatarModal(false)} style={{ padding: 14, alignItems: 'center' }}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: '#EF4444' }}>Annuler</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </Modal>

            {/* ── Modal Changer Mot de Passe ── */}
            <Modal visible={showPasswordModal} transparent animationType="slide" onRequestClose={() => setShowPasswordModal(false)}>
              <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }} activeOpacity={1} onPress={() => setShowPasswordModal(false)}>
                <TouchableOpacity activeOpacity={1} onPress={() => {}}>
                  <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 }}>
                    <Text style={{ fontSize: 17, fontWeight: '800', color: '#1E293B', marginBottom: 20, textAlign: 'center' }}>Changer le mot de passe</Text>
                    {[
                      { label: 'Ancien mot de passe',  value: ancienMdp,  setter: setAncienMdp  },
                      { label: 'Nouveau mot de passe', value: nouveauMdp, setter: setNouveauMdp  },
                      { label: 'Confirmer le nouveau', value: confirmMdp, setter: setConfirmMdp  },
                    ].map(({ label, value, setter }) => (
                      <View key={label} style={{ marginBottom: 14 }}>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#6D28D9', marginBottom: 6 }}>{label}</Text>
                        <TextInput
                          style={{ borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 14, height: 48, fontSize: 14, color: '#1E293B' }}
                          value={value}
                          onChangeText={setter}
                          secureTextEntry
                          placeholder="••••••••"
                          placeholderTextColor="#CBD5E1"
                        />
                      </View>
                    ))}
                    <TouchableOpacity onPress={handleChangePassword} disabled={changingPwd} style={{ height: 50, borderRadius: 14, backgroundColor: '#4C1D95', justifyContent: 'center', alignItems: 'center', marginTop: 4, opacity: changingPwd ? 0.7 : 1 }}>
                      {changingPwd ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Confirmer</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowPasswordModal(false)} style={{ padding: 14, alignItems: 'center' }}>
                      <Text style={{ fontSize: 15, fontWeight: '600', color: '#EF4444' }}>Annuler</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </TouchableOpacity>
            </Modal>

            {/* ── Avatar ── */}
            <View style={S.avatarContainer}>
              <View style={{ width: 108, height: 108 }}>
                <TouchableOpacity onPress={() => setShowPhotoModal(true)} activeOpacity={0.9}>
                  <LinearGradient colors={['#4C1D95', '#1E1B4B']} style={{ width: 108, height: 108, borderRadius: 54, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                    {uploadingAvatar
                      ? <ActivityIndicator color="#fff" size="large" />
                      : userData.avatar
                        ? <Image source={{ uri: userData.avatar }} style={{ width: 108, height: 108, borderRadius: 54 }} />
                        : <Ionicons name="person" size={52} color="#fff" />}
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowAvatarModal(true)} activeOpacity={0.85} style={{ position: 'absolute', bottom: 2, right: 2, width: 32, height: 32, borderRadius: 16, backgroundColor: '#4C1D95', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' }}>
                  <Feather name="camera" size={15} color="#fff" />
                </TouchableOpacity>
              </View>
              <Text style={{ textAlign: 'center', fontSize: 12, color: '#94A3B8', marginTop: 10 }}>Appuyez sur 📷 pour modifier</Text>
            </View>

            {/* ── Nom + badge ── */}
            <Text style={[S.fullName, { marginBottom: 4 }]}>{userData.prenom} {userData.nom}</Text>
            <View style={S.badgeContainer}>
              <View style={[S.verifiedBadge, { backgroundColor: COLORS.primaryLight }]}>
                <Feather name="shield" size={13} color={COLORS.primary} />
                <Text style={[S.badgeText, { color: COLORS.primary }]}>{userData.role}</Text>
              </View>
              <Text style={S.userRole}>{userData.identifiant}</Text>
            </View>

            {/* ── Stats ── */}
            <View style={S.statsRow}>
              <StatCard icon="shield"   label="Niveau"   value="Accès 3"  color={COLORS.primary} />
              <StatCard icon="users"    label="Comptes"  value="247"      color="#3B82F6"        />
              <StatCard icon="activity" label="Activité" value="En ligne" color="#10B981"        />
            </View>

            {/* ── Informations personnelles ── */}
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

            {/* ── Informations système ── */}
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

            {/* ── Permissions ── */}
            <View style={S.infoSection}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Text style={S.sectionTitle}>Permissions & accès</Text>
                <View style={{ backgroundColor: COLORS.primaryLight, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: COLORS.primary }}>🔒 LECTURE SEULE</Text>
                </View>
              </View>
              <View style={[S.infoCard, { paddingHorizontal: 0, paddingVertical: 0 }]}>
                {PERMISSIONS.map(p => <PermissionBadge key={p.label} {...p} />)}
              </View>
            </View>

            {/* ── Journal ── */}
            <View style={S.infoSection}>
              <Text style={S.sectionTitle}>Journal d'activité récente</Text>
              <View style={S.infoCard}>
                {ACTIVITY_LOG.map((entry, index) => (
                  <LogRow key={index} {...entry} isLast={index === ACTIVITY_LOG.length - 1} />
                ))}
              </View>
            </View>

            {/* ── Boutons ── */}
            <View style={S.actionButtons}>
              <TouchableOpacity style={S.settingsButton} onPress={() => navigation?.navigate('AdminSettings')} activeOpacity={0.85}>
                <Feather name="settings" size={20} color={COLORS.primary} />
                <Text style={S.settingsButtonText}>Paramètres système</Text>
                <Feather name="chevron-right" size={18} color={COLORS.primary} />
              </TouchableOpacity>

              {isEditing ? (
                <TouchableOpacity style={[S.saveButton, saving && S.loadingButton]} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
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

              {/* Bouton changer mot de passe */}
              <TouchableOpacity
                style={[S.editButton, { marginTop: 10, borderColor: '#EF4444' }]}
                onPress={() => setShowPasswordModal(true)}
                activeOpacity={0.85}
              >
                <Feather name="lock" size={18} color="#EF4444" />
                <Text style={[S.editButtonText, { color: '#EF4444' }]}>Changer le mot de passe</Text>
              </TouchableOpacity>
            </View>

            {/* ── Footer ── */}
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