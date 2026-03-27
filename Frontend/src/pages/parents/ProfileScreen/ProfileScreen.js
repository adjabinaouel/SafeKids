// src/pages/parents/ProfileScreen/ProfileScreen.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Animated,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

import ParentLayout from '../../../components/Navigation/ParentNavigation';
import S, { COLORS } from './ProfileStyles';

const STORAGE_KEY = 'userProfile';

const DEFAULT_USER = {
  prenom: 'Sara',
  nom: 'Bensalem',
  email: 'sara.bensalem@email.com',
  phone: '+213 555 123 456',
  ville: 'Alger',
  wilaya: 'Alger',
  avatar: null,
};

// ─── Carte stat ───────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color }) => (
  <View style={S.statCard}>
    <View style={[S.statIcon, { backgroundColor: color }]}>
      <Feather name={icon} size={18} color="#fff" />
    </View>
    <Text style={S.statLabel}>{label}</Text>
    <Text style={S.statValue} numberOfLines={1}>{value}</Text>
  </View>
);

// ─── Ligne info ───────────────────────────────────────────────────────────────
const InfoRow = ({ icon, label, value, field, isLast = false, isEditing = false, onChangeText }) => (
  <View style={[S.infoRow, isLast && { borderBottomWidth: 0 }]}>
    <View style={[S.securityIcon, { backgroundColor: COLORS.primaryLight }]}>
      <Feather name={icon} size={16} color={COLORS.primary} />
    </View>
    <View style={S.infoContent}>
      <Text style={S.infoLabel}>{label}</Text>
      {isEditing ? (
        <TextInput
          style={[S.infoValue, S.inputEditable]}
          value={value}
          onChangeText={(text) => onChangeText(field, text)}
          placeholder="Modifier..."
          placeholderTextColor={COLORS.textMuted}
          autoCapitalize="none"
          returnKeyType="done"
        />
      ) : (
        <Text style={S.infoValue} numberOfLines={1}>{value}</Text>
      )}
    </View>
    {isEditing && <Feather name="edit-2" size={14} color={COLORS.primary} />}
  </View>
);

// ─── Écran principal ──────────────────────────────────────────────────────────
export default function ProfileScreen({ navigation }) {
  const [userData, setUserData] = useState(DEFAULT_USER);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Ref pour éviter les stale closures dans les fonctions de picker
  const userDataRef = useRef(userData);
  useEffect(() => { userDataRef.current = userData; }, [userData]);

  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.96))[0];

  useEffect(() => {
    const init = async () => {
      await loadUserData();
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 120, friction: 8, useNativeDriver: true }),
      ]).start();
    };
    init();
  }, []);

  const loadUserData = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) setUserData(JSON.parse(stored));
    } catch (err) {
      console.warn('Erreur chargement profil:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateField = useCallback((field, value) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleCancelEdit = async () => {
    await loadUserData();
    setIsEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      Alert.alert('Profil mis à jour', 'Vos informations ont été sauvegardées.', [{ text: 'OK' }]);
      setIsEditing(false);
    } catch {
      Alert.alert('Erreur', 'Impossible de sauvegarder le profil.');
    } finally {
      setSaving(false);
    }
  };

  // ── Helpers picker ─────────────────────────────────────────────────────────
  const saveAvatar = async (uri) => {
    const updated = { ...userDataRef.current, avatar: uri };
    setUserData(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission refusée',
        "Autorisez l'accès à la caméra dans Réglages > SafeKids > Caméra."
      );
      return;
    }
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.length > 0) {
        await saveAvatar(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Erreur', "Impossible d'ouvrir la caméra.");
    }
  };

  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission refusée',
        "Autorisez l'accès à la galerie dans Réglages > SafeKids > Photos."
      );
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.length > 0) {
        await saveAvatar(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Erreur', "Impossible d'ouvrir la galerie.");
    }
  };

  // On utilise un Modal custom au lieu d'Alert — plus fiable sur Android + iOS
  // Alert.alert avec async callbacks est instable selon les versions d'Expo
  const handlePickAvatar = () => {
    setShowAvatarModal(true);
  };

  const handleModalCamera = async () => {
    setShowAvatarModal(false);
    // Délai pour laisser le Modal se fermer avant d'ouvrir le picker natif
    await new Promise(r => setTimeout(r, 350));
    await openCamera();
  };

  const handleModalGallery = async () => {
    setShowAvatarModal(false);
    await new Promise(r => setTimeout(r, 350));
    await openGallery();
  };

  const INFO_FIELDS = [
    { icon: 'user',    label: 'Prénom',    field: 'prenom',  value: userData.prenom },
    { icon: 'user',    label: 'Nom',       field: 'nom',     value: userData.nom    },
    { icon: 'mail',    label: 'Email',     field: 'email',   value: userData.email  },
    { icon: 'phone',   label: 'Téléphone', field: 'phone',   value: userData.phone  },
    { icon: 'map-pin', label: 'Ville',     field: 'ville',   value: userData.ville  },
    { icon: 'map',     label: 'Wilaya',    field: 'wilaya',  value: userData.wilaya },
  ];

  if (loading) {
    return (
      <View style={[S.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ParentLayout activeTab="profile">
      <View style={S.container}>
        <StatusBar barStyle="light-content" />

        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={S.premiumHeader}
        >
          <TouchableOpacity
            onPress={() => navigation?.goBack()}
            style={S.backButton}
            activeOpacity={0.8}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={S.headerContent}>
            <Text style={S.headerTitle}>Mon Profil</Text>
            <Text style={S.headerSubtitle}>Gérez vos informations personnelles</Text>
          </View>
        </LinearGradient>

        <Animated.View style={[S.animatedContent, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={S.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── Modal voir photo en plein écran ── */}
            <Modal
              visible={showPhotoModal}
              transparent
              animationType="fade"
              onRequestClose={() => setShowPhotoModal(false)}
            >
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' }}>
                {/* Bouton fermer */}
                <TouchableOpacity
                  onPress={() => setShowPhotoModal(false)}
                  style={{
                    position: 'absolute', top: Platform.OS === 'ios' ? 56 : 24, right: 20,
                    width: 40, height: 40, borderRadius: 20,
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    justifyContent: 'center', alignItems: 'center', zIndex: 10,
                  }}
                  activeOpacity={0.75}
                >
                  <Feather name="x" size={22} color="#fff" />
                </TouchableOpacity>

                {/* Photo plein écran */}
                {userData.avatar ? (
                  <Image
                    source={{ uri: userData.avatar }}
                    style={{ width: 300, height: 300, borderRadius: 150 }}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={{ width: 300, height: 300, borderRadius: 150, backgroundColor: '#7C3AED', justifyContent: 'center', alignItems: 'center' }}>
                    <Ionicons name="person" size={120} color="#fff" />
                  </View>
                )}

                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 24 }}>
                  {userData.prenom} {userData.nom}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginTop: 6 }}>
                  {userData.email}
                </Text>

                {/* Bouton modifier depuis le viewer */}
                <TouchableOpacity
                  onPress={() => { setShowPhotoModal(false); setTimeout(handlePickAvatar, 300); }}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 8,
                    backgroundColor: '#7C3AED', borderRadius: 14,
                    paddingHorizontal: 24, paddingVertical: 14, marginTop: 32,
                  }}
                  activeOpacity={0.85}
                >
                  <Feather name="camera" size={18} color="#fff" />
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Modifier la photo</Text>
                </TouchableOpacity>
              </View>
            </Modal>

            {/* ── Modal sélection photo ── */}
            <Modal
              visible={showAvatarModal}
              transparent
              animationType="fade"
              onRequestClose={() => setShowAvatarModal(false)}
            >
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
                activeOpacity={1}
                onPress={() => setShowAvatarModal(false)}
              >
                <View style={{
                  backgroundColor: '#fff',
                  borderTopLeftRadius: 24, borderTopRightRadius: 24,
                  padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24,
                }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 20, textAlign: 'center' }}>
                    Photo de profil
                  </Text>

                  <TouchableOpacity
                    onPress={handleModalCamera}
                    style={{
                      flexDirection: 'row', alignItems: 'center', gap: 14,
                      backgroundColor: '#EDE9FE', borderRadius: 14,
                      padding: 16, marginBottom: 10,
                    }}
                    activeOpacity={0.75}
                  >
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#7C3AED', justifyContent: 'center', alignItems: 'center' }}>
                      <Feather name="camera" size={20} color="#fff" />
                    </View>
                    <View>
                      <Text style={{ fontSize: 15, fontWeight: '700', color: '#1E293B' }}>Prendre une photo</Text>
                      <Text style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Ouvrir la caméra</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleModalGallery}
                    style={{
                      flexDirection: 'row', alignItems: 'center', gap: 14,
                      backgroundColor: '#F1F5F9', borderRadius: 14,
                      padding: 16, marginBottom: 16,
                    }}
                    activeOpacity={0.75}
                  >
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#64748B', justifyContent: 'center', alignItems: 'center' }}>
                      <Feather name="image" size={20} color="#fff" />
                    </View>
                    <View>
                      <Text style={{ fontSize: 15, fontWeight: '700', color: '#1E293B' }}>Choisir depuis la galerie</Text>
                      <Text style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Accéder à vos photos</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setShowAvatarModal(false)}
                    style={{ padding: 14, alignItems: 'center' }}
                    activeOpacity={0.75}
                  >
                    <Text style={{ fontSize: 15, fontWeight: '600', color: '#EF4444' }}>Annuler</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </Modal>

            {/* Avatar : tap = voir en grand / bouton caméra = modifier */}
            <View style={S.avatarContainer}>
              <View style={{ width: 108, height: 108 }}>
                {/* Tap sur la photo → plein écran */}
                <TouchableOpacity
                  onPress={() => setShowPhotoModal(true)}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={{
                      width: 108, height: 108, borderRadius: 54,
                      justifyContent: 'center', alignItems: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    {userData.avatar ? (
                      <Image source={{ uri: userData.avatar }} style={{ width: 108, height: 108, borderRadius: 54 }} />
                    ) : (
                      <Ionicons name="person" size={52} color="#fff" />
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Bouton caméra séparé → modifier la photo */}
                <TouchableOpacity
                  onPress={handlePickAvatar}
                  activeOpacity={0.85}
                  style={{
                    position: 'absolute', bottom: 2, right: 2,
                    width: 32, height: 32, borderRadius: 16,
                    backgroundColor: '#7C3AED',
                    justifyContent: 'center', alignItems: 'center',
                    borderWidth: 2, borderColor: '#fff',
                  }}
                >
                  <Feather name="camera" size={15} color="#fff" />
                </TouchableOpacity>
              </View>
              <Text style={{ textAlign: 'center', fontSize: 12, color: '#94A3B8', marginTop: 10 }}>
                Appuyez sur 📷 pour modifier
              </Text>
            </View>

            {/* Nom + badge */}
            <Text style={S.fullName}>{userData.prenom} {userData.nom}</Text>
            <View style={S.badgeContainer}>
              <View style={S.verifiedBadge}>
                <Feather name="check-circle" size={13} color={COLORS.success} />
                <Text style={S.badgeText}>Vérifié</Text>
              </View>
              <Text style={S.userRole}>{userData.wilaya}</Text>
            </View>

            {/* Stats */}
            <View style={S.statsRow}>
              <StatCard icon="mail"    label="Email"        value={userData.email.split('@')[0]} color="#10B981" />
              <StatCard icon="phone"   label="Contact"      value={userData.phone.slice(-8)}      color="#3B82F6" />
              <StatCard icon="map-pin" label="Localisation" value={userData.ville}               color="#F59E0B" />
            </View>

            {/* Informations */}
            <View style={S.infoSection}>
              <View style={S.sectionHeader}>
                <Text style={S.sectionTitle}>Détails du compte</Text>
                {isEditing && (
                  <TouchableOpacity onPress={handleCancelEdit}>
                    <Text style={S.cancelEdit}>Annuler</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={S.infoCard}>
                {INFO_FIELDS.map((item, index) => (
                  <InfoRow
                    key={item.field}
                    {...item}
                    isLast={index === INFO_FIELDS.length - 1}
                    isEditing={isEditing}
                    onChangeText={updateField}
                  />
                ))}
              </View>
            </View>

            {/* Boutons d'action */}
            <View style={S.actionButtons}>
              <TouchableOpacity
                style={S.settingsButton}
                onPress={() => navigation?.navigate('Settings')}
                activeOpacity={0.85}
              >
                <Feather name="settings" size={20} color={COLORS.primary} />
                <Text style={S.settingsButtonText}>Paramètres avancés</Text>
                <Feather name="chevron-right" size={18} color={COLORS.primary} />
              </TouchableOpacity>

              {isEditing ? (
                <TouchableOpacity
                  style={[S.saveButton, saving && S.loadingButton]}
                  onPress={handleSave}
                  disabled={saving}
                  activeOpacity={0.85}
                >
                  {saving ? (
                    <><ActivityIndicator size="small" color="#fff" /><Text style={S.saveButtonText}>Sauvegarde...</Text></>
                  ) : (
                    <><Feather name="save" size={18} color="#fff" /><Text style={S.saveButtonText}>Sauvegarder les modifications</Text></>
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={S.editButton}
                  onPress={() => setIsEditing(true)}
                  activeOpacity={0.85}
                >
                  <Feather name="edit-3" size={18} color={COLORS.primary} />
                  <Text style={S.editButtonText}>Modifier le profil</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Footer */}
            <View style={S.footer}>
              <Text style={S.versionText}>SafeKids v2.1.0</Text>
              <TouchableOpacity style={S.supportButton} activeOpacity={0.75}>
                <Feather name="help-circle" size={15} color={COLORS.textLight} />
                <Text style={S.supportText}>Centre d'aide & Support</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </ParentLayout>
  );
}