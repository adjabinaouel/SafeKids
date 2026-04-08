// src/pages/parents/ProfileScreen/ProfileScreen.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, TextInput, Image, TouchableOpacity, ScrollView,
  StatusBar, Animated, Alert, ActivityIndicator, Modal, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

import ParentLayout from '../../../components/Navigation/ParentNavigation';
import S, { COLORS } from './ProfileStyles';

// ==================== CONFIGURATION ====================
const SERVER_URL = 'https://unfailed-branden-healable.ngrok-free.dev';

// ==================== COMPOSANTS ====================
const StatCard = ({ icon, label, value, color }) => (
  <View style={S.statCard}>
    <View style={[S.statIcon, { backgroundColor: color }]}>
      <Feather name={icon} size={18} color="#fff" />
    </View>
    <Text style={S.statLabel}>{label}</Text>
    <Text style={S.statValue} numberOfLines={1}>{value}</Text>
  </View>
);

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
        <Text style={S.infoValue} numberOfLines={1}>{value || '—'}</Text>
      )}
    </View>
    {isEditing && <Feather name="edit-2" size={14} color={COLORS.primary} />}
  </View>
);

// ==================== ÉCRAN PRINCIPAL ====================
export default function ProfileScreen({ navigation }) {
  const [userData, setUserData]           = useState(null);
  const [isEditing, setIsEditing]         = useState(false);
  const [saving, setSaving]               = useState(false);
  const [loading, setLoading]             = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal]   = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Champs mot de passe
  const [ancienMdp, setAncienMdp]       = useState('');
  const [nouveauMdp, setNouveauMdp]     = useState('');
  const [confirmMdp, setConfirmMdp]     = useState('');
  const [changingPwd, setChangingPwd]   = useState(false);

  const userDataRef = useRef(userData);
  useEffect(() => { userDataRef.current = userData; }, [userData]);

  const fadeAnim  = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.96))[0];

  useEffect(() => {
    const init = async () => {
      await loadUserProfile();
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 120, friction: 8, useNativeDriver: true }),
      ]).start();
    };
    init();
  }, []);

  // ── Charger profil ──────────────────────────────────────────────────────────
  const loadUserProfile = async () => {
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
        prenom: data.prenom   || '',
        nom:    data.nom      || '',
        email:  data.email    || '',
        phone:  data.telephone || '',
        ville:  data.ville    || '',
        wilaya: data.wilaya   || '',
        avatar: data.avatar   ? `${SERVER_URL}${data.avatar}` : null,
      });

    } catch (error) {
      console.error('Erreur chargement profil:', error);
      Alert.alert('Erreur', 'Impossible de charger votre profil.');
    } finally {
      setLoading(false);
    }
  };

  const updateField = useCallback((field, value) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleCancelEdit = () => {
    loadUserProfile();
    setIsEditing(false);
  };

  // ── Sauvegarder le profil ───────────────────────────────────────────────────
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
          prenom:    userData.prenom,
          nom:       userData.nom,
          telephone: userData.phone,
          ville:     userData.ville,
          wilaya:    userData.wilaya,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Erreur', data.message || 'Impossible de sauvegarder');
        return;
      }

      Alert.alert('Succès ✅', 'Profil mis à jour avec succès !');
      setIsEditing(false);
      await loadUserProfile();

    } catch (error) {
      Alert.alert('Erreur', 'Impossible de contacter le serveur.');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // ── Changer le mot de passe ─────────────────────────────────────────────────
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
        body: JSON.stringify({
          ancienMotDePasse:  ancienMdp,
          nouveauMotDePasse: nouveauMdp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Erreur', data.message || 'Impossible de changer le mot de passe');
        return;
      }

      Alert.alert('Succès ✅', 'Mot de passe modifié avec succès !');
      setShowPasswordModal(false);
      setAncienMdp('');
      setNouveauMdp('');
      setConfirmMdp('');

    } catch (error) {
      Alert.alert('Erreur', 'Impossible de contacter le serveur.');
      console.error(error);
    } finally {
      setChangingPwd(false);
    }
  };

  // ── Upload avatar ───────────────────────────────────────────────────────────
  const uploadAvatar = async (uri) => {
    setUploadingAvatar(true);
    try {
      const token = await AsyncStorage.getItem('userToken');

      // Lire le fichier en base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

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

      const avatarUrl = `${SERVER_URL}${data.avatarUrl}`;
      setUserData(prev => ({ ...prev, avatar: avatarUrl }));
      Alert.alert('Succès ✅', 'Photo de profil mise à jour !');

    } catch (error) {
      Alert.alert('Erreur', "Impossible d'uploader la photo.");
      console.error(error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', "Autorisez l'accès à la caméra.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.length > 0) {
      await uploadAvatar(result.assets[0].uri);
    }
  };

  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', "Autorisez l'accès à la galerie.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.length > 0) {
      await uploadAvatar(result.assets[0].uri);
    }
  };

  const handleModalCamera = async () => {
    setShowAvatarModal(false);
    await new Promise(r => setTimeout(r, 350));
    await openCamera();
  };

  const handleModalGallery = async () => {
    setShowAvatarModal(false);
    await new Promise(r => setTimeout(r, 350));
    await openGallery();
  };

  // ── Loading / Error states ──────────────────────────────────────────────────
  if (loading) {
    return (
      <ParentLayout activeTab="profile">
        <View style={[S.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 10 }}>Chargement du profil...</Text>
        </View>
      </ParentLayout>
    );
  }

  if (!userData) {
    return (
      <ParentLayout activeTab="profile">
        <View style={[S.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text>Impossible de charger le profil</Text>
          <TouchableOpacity onPress={loadUserProfile} style={{ marginTop: 16, padding: 12, backgroundColor: COLORS.primary, borderRadius: 10 }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </ParentLayout>
    );
  }

  const INFO_FIELDS = [
    { icon: 'user',    label: 'Prénom',    field: 'prenom', value: userData.prenom },
    { icon: 'user',    label: 'Nom',       field: 'nom',    value: userData.nom    },
    { icon: 'mail',    label: 'Email',     field: 'email',  value: userData.email  },
    { icon: 'phone',   label: 'Téléphone', field: 'phone',  value: userData.phone  },
    { icon: 'map-pin', label: 'Ville',     field: 'ville',  value: userData.ville  },
    { icon: 'map',     label: 'Wilaya',    field: 'wilaya', value: userData.wilaya },
  ];

  return (
    <ParentLayout activeTab="profile">
      <View style={S.container}>
        <StatusBar barStyle="light-content" />

        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={S.premiumHeader}
        >
          <TouchableOpacity onPress={() => navigation?.goBack()} style={S.backButton} activeOpacity={0.8}>
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

            {/* ── Modal Photo Plein Écran ── */}
            <Modal visible={showPhotoModal} transparent animationType="fade" onRequestClose={() => setShowPhotoModal(false)}>
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={() => setShowPhotoModal(false)}
                  style={{ position: 'absolute', top: Platform.OS === 'ios' ? 56 : 24, right: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', zIndex: 10 }}
                >
                  <Feather name="x" size={22} color="#fff" />
                </TouchableOpacity>
                {userData.avatar
                  ? <Image source={{ uri: userData.avatar }} style={{ width: 300, height: 300, borderRadius: 150 }} resizeMode="cover" />
                  : <View style={{ width: 300, height: 300, borderRadius: 150, backgroundColor: '#7C3AED', justifyContent: 'center', alignItems: 'center' }}>
                      <Ionicons name="person" size={120} color="#fff" />
                    </View>}
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 24 }}>{userData.prenom} {userData.nom}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginTop: 6 }}>{userData.email}</Text>
              </View>
            </Modal>

            {/* ── Modal Sélection Photo ── */}
            <Modal visible={showAvatarModal} transparent animationType="fade" onRequestClose={() => setShowAvatarModal(false)}>
              <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }} activeOpacity={1} onPress={() => setShowAvatarModal(false)}>
                <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 20, textAlign: 'center' }}>Photo de profil</Text>
                  <TouchableOpacity onPress={handleModalCamera} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#EDE9FE', borderRadius: 14, padding: 16, marginBottom: 10 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#7C3AED', justifyContent: 'center', alignItems: 'center' }}>
                      <Feather name="camera" size={20} color="#fff" />
                    </View>
                    <View>
                      <Text style={{ fontSize: 15, fontWeight: '700', color: '#1E293B' }}>Prendre une photo</Text>
                      <Text style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Ouvrir la caméra</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleModalGallery} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#F1F5F9', borderRadius: 14, padding: 16, marginBottom: 16 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#64748B', justifyContent: 'center', alignItems: 'center' }}>
                      <Feather name="image" size={20} color="#fff" />
                    </View>
                    <View>
                      <Text style={{ fontSize: 15, fontWeight: '700', color: '#1E293B' }}>Choisir depuis la galerie</Text>
                      <Text style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Accéder à vos photos</Text>
                    </View>
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
                      { label: 'Ancien mot de passe',   value: ancienMdp,  setter: setAncienMdp  },
                      { label: 'Nouveau mot de passe',  value: nouveauMdp, setter: setNouveauMdp  },
                      { label: 'Confirmer le nouveau',  value: confirmMdp, setter: setConfirmMdp  },
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

                    <TouchableOpacity
                      onPress={handleChangePassword}
                      disabled={changingPwd}
                      style={{ height: 50, borderRadius: 14, backgroundColor: '#7C3AED', justifyContent: 'center', alignItems: 'center', marginTop: 4, opacity: changingPwd ? 0.7 : 1 }}
                    >
                      {changingPwd
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Confirmer</Text>}
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
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={{ width: 108, height: 108, borderRadius: 54, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}
                  >
                    {uploadingAvatar
                      ? <ActivityIndicator color="#fff" size="large" />
                      : userData.avatar
                        ? <Image source={{ uri: userData.avatar }} style={{ width: 108, height: 108, borderRadius: 54 }} />
                        : <Ionicons name="person" size={52} color="#fff" />}
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowAvatarModal(true)}
                  activeOpacity={0.85}
                  style={{ position: 'absolute', bottom: 2, right: 2, width: 32, height: 32, borderRadius: 16, backgroundColor: '#7C3AED', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' }}
                >
                  <Feather name="camera" size={15} color="#fff" />
                </TouchableOpacity>
              </View>
              <Text style={{ textAlign: 'center', fontSize: 12, color: '#94A3B8', marginTop: 10 }}>
                Appuyez sur 📷 pour modifier
              </Text>
            </View>

            {/* ── Nom + Badge ── */}
            <Text style={S.fullName}>{userData.prenom} {userData.nom}</Text>
            <View style={S.badgeContainer}>
              <View style={S.verifiedBadge}>
                <Feather name="check-circle" size={13} color={COLORS.success} />
                <Text style={S.badgeText}>Vérifié</Text>
              </View>
              <Text style={S.userRole}>Parent</Text>
            </View>

            {/* ── Stats ── */}
            <View style={S.statsRow}>
              <StatCard icon="mail"    label="Email"       value={userData.email?.split('@')[0] || '—'} color="#10B981" />
              <StatCard icon="phone"   label="Contact"     value={userData.phone?.slice(-8) || '—'}    color="#3B82F6" />
              <StatCard icon="map-pin" label="Localisation" value={userData.ville || '—'}              color="#F59E0B" />
            </View>

            {/* ── Informations ── */}
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

            {/* ── Boutons ── */}
            <View style={S.actionButtons}>
              {isEditing ? (
                <TouchableOpacity
                  style={[S.saveButton, saving && S.loadingButton]}
                  onPress={handleSave}
                  disabled={saving}
                  activeOpacity={0.85}
                >
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

          </ScrollView>
        </Animated.View>
      </View>
    </ParentLayout>
  );
}