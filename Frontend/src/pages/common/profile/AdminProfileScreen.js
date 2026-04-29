// src/pages/admin/ProfileScreen/AdminProfileScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TextInput, Image, TouchableOpacity, ScrollView,
  StatusBar, Animated, ActivityIndicator, Alert, Modal, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import AdminLayout from '../../../components/Navigation/AdminNavigation';
import S, { COLORS } from './ProfileStyles';

const SERVER_URL = 'https://gondola-reattach-relearn.ngrok-free.dev';

const PERMISSIONS = [
  { label: 'Gestion des comptes',     granted: true  },
  { label: 'Gestion des médecins',    granted: true  },
  { label: 'Rapports & statistiques', granted: true  },
  { label: 'Configuration système',   granted: true  },
  { label: 'Facturation',             granted: false },
];

const ACTIVITY_LOG = [
  { action: 'Compte médecin créé',         date: "Aujourd'hui 09:01", icon: 'user-plus'  },
  { action: 'Rapport mensuel exporté',     date: "Hier 17:42",        icon: 'file-text'  },
  { action: 'Paramètres système modifiés', date: "Hier 14:15",        icon: 'settings'   },
  { action: 'Connexion détectée',          date: "12/06 08:30",       icon: 'log-in'     },
];

// ── Composant avatar multi-plateforme (même pattern que ProfileScreen parent) ─
const AvatarImage = ({ uri, size = 112 }) => {
  if (Platform.OS === 'web' && uri) {
    return (
      <img
        src={uri}
        style={{
          width: size, height: size,
          borderRadius: size / 2,
          objectFit: 'cover',
          display: 'block',
        }}
        onError={(e) => { e.target.style.display = 'none'; }}
      />
    );
  }
  return (
    <Image
      source={{ uri }}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      resizeMode="cover"
    />
  );
};

// ── Composants ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color }) => (
  <View style={S.statCard}>
    <View style={[S.statIcon, { backgroundColor: color }]}>
      <Feather name={icon} size={18} color="#fff" />
    </View>
    <Text style={S.statLabel}>{label}</Text>
    <Text style={S.statValue} numberOfLines={1}>{value}</Text>
  </View>
);

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
  <View style={{
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 10, paddingHorizontal: 14,
    borderBottomWidth: 0.5, borderBottomColor: COLORS.borderLight,
  }}>
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

// ── Écran principal ───────────────────────────────────────────────────────────
export default function AdminProfileScreen({ navigation }) {
  const [userData, setUserData]               = useState(null);
  const [loading, setLoading]                 = useState(true);
  const [saving, setSaving]                   = useState(false);
  const [isEditing, setIsEditing]             = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal]   = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [ancienMdp, setAncienMdp]     = useState('');
  const [nouveauMdp, setNouveauMdp]   = useState('');
  const [confirmMdp, setConfirmMdp]   = useState('');
  const [changingPwd, setChangingPwd] = useState(false);

  // avatarUri = data:image/... base64 sur web, URL https:// sur mobile
  const [avatarUri, setAvatarUri] = useState(null);
  const [imageKey, setImageKey]   = useState(Date.now());

  const fadeAnim  = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.97))[0];

  // ── Init ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const cached = await AsyncStorage.getItem('adminCachedAvatarUri');
      if (cached) setAvatarUri(cached);
      await loadAdminProfile();
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 120, friction: 8, useNativeDriver: true }),
      ]).start();
    };
    init();
  }, []);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('adminCachedAvatarUri').then(cached => {
        if (cached) setAvatarUri(cached);
      });
    }, [])
  );

  // ── Charger profil depuis la BDD ─────────────────────────────────────────
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
        prenom:       data.prenom      || '',
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
      });

      // ✅ Avatar : priorité au cache local (base64 web ou URL mobile), sinon serveur
      const cached = await AsyncStorage.getItem('adminCachedAvatarUri');
      if (Platform.OS === 'web' && cached && cached.startsWith('data:')) {
        setAvatarUri(cached);
      } else if (!cached && data.avatar) {
        const serverUri = `${SERVER_URL}${data.avatar}?t=${Date.now()}`;
        setAvatarUri(serverUri);
        await AsyncStorage.setItem('adminCachedAvatarUri', serverUri);
        setImageKey(Date.now());
      }

    } catch (error) {
      console.error('Erreur chargement profil admin:', error);
      Alert.alert('Erreur', 'Impossible de charger votre profil.');
    } finally {
      setLoading(false);
    }
  };

  const updateField = useCallback((field, value) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleCancelEdit = async () => {
    const prevAvatar = avatarUri;
    await loadAdminProfile();
    setAvatarUri(prevAvatar);
    setIsEditing(false);
  };

  // ── Sauvegarder dans la BDD ─────────────────────────────────────────────────
  const handleSave = async () => {
    if (!userData.prenom?.trim() || !userData.nom?.trim()) {
      Alert.alert('Erreur', 'Le prénom et le nom sont obligatoires.');
      return;
    }
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
      const prevAvatar = avatarUri;
      await loadAdminProfile();
      setAvatarUri(prevAvatar);
    } catch {
      Alert.alert('Erreur', 'Impossible de contacter le serveur.');
    } finally {
      setSaving(false);
    }
  };

  // ── Changer mot de passe via la BDD ────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!ancienMdp || !nouveauMdp || !confirmMdp) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    if (nouveauMdp.length < 8) {
      Alert.alert('Erreur', 'Minimum 8 caractères.');
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
      setAncienMdp(''); setNouveauMdp(''); setConfirmMdp('');
    } catch {
      Alert.alert('Erreur', 'Impossible de contacter le serveur.');
    } finally {
      setChangingPwd(false);
    }
  };

  // ── Upload Avatar (même pattern que ProfileScreen parent) ──────────────────
  const uploadAvatar = async (uri, base64FromPicker = null) => {
    if (!uri || !base64FromPicker) {
      Alert.alert('Erreur', 'Aucune image sélectionnée');
      return;
    }
    setUploadingAvatar(true);

    // ✅ Affichage immédiat en base64 — fonctionne sur web ET mobile sans CORS
    const mimeType = uri.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
    const dataUri  = `data:${mimeType};base64,${base64FromPicker}`;
    setAvatarUri(dataUri);
    setImageKey(Date.now());

    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${SERVER_URL}/upload-avatar-base64`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ imageBase64: base64FromPicker, mimeType }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Erreur serveur lors de l'upload");
      }

      if (Platform.OS === 'web') {
        // ✅ Sur web : stocker le base64 pour éviter le blocage CORS au rechargement
        await AsyncStorage.setItem('adminCachedAvatarUri', dataUri);
      } else {
        // ✅ Sur mobile : utiliser l'URL serveur normale
        const serverUri = `${SERVER_URL}${data.avatarUrl}?t=${Date.now()}`;
        setAvatarUri(serverUri);
        await AsyncStorage.setItem('adminCachedAvatarUri', serverUri);
        setImageKey(Date.now());
      }

      Alert.alert('Succès ✅', 'Photo de profil mise à jour !');
    } catch (error) {
      console.error('❌ Upload error:', error);
      Alert.alert('Erreur Upload', error.message || "Échec de l'upload");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // ── Caméra ─────────────────────────────────────────────────────────────────
  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', "Autorisez l'accès à la caméra dans les paramètres.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.65,
      allowsEditing: false,
      base64: true,
    });
    if (!result.canceled && result.assets?.[0]) {
      await uploadAvatar(result.assets[0].uri, result.assets[0].base64);
    }
  };

  // ── Galerie ─────────────────────────────────────────────────────────────────
  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', "Autorisez l'accès à la galerie dans les paramètres.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.65,
      allowsEditing: false,
      base64: true,
    });
    if (!result.canceled && result.assets?.[0]) {
      await uploadAvatar(result.assets[0].uri, result.assets[0].base64);
    }
  };

  const handleModalCamera  = async () => { setShowAvatarModal(false); await new Promise(r => setTimeout(r, 350)); await openCamera(); };
  const handleModalGallery = async () => { setShowAvatarModal(false); await new Promise(r => setTimeout(r, 350)); await openGallery(); };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <AdminLayout activeTab="profile">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 12, color: COLORS.textMuted, fontSize: 14 }}>Chargement du profil...</Text>
        </View>
      </AdminLayout>
    );
  }

  if (!userData) {
    return (
      <AdminLayout activeTab="profile">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 24 }}>
          <Feather name="wifi-off" size={48} color={COLORS.textMuted} />
          <Text style={{ marginTop: 16, fontSize: 16, fontWeight: '700', color: COLORS.text }}>Profil introuvable</Text>
          <Text style={{ marginTop: 6, color: COLORS.textMuted, textAlign: 'center' }}>Vérifiez votre connexion et réessayez.</Text>
          <TouchableOpacity
            onPress={loadAdminProfile}
            style={{ marginTop: 20, paddingHorizontal: 28, paddingVertical: 13, backgroundColor: COLORS.primary, borderRadius: 14 }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </AdminLayout>
    );
  }

  const EDITABLE_FIELDS = [
    { icon: 'user',      label: 'Prénom',      field: 'prenom',      value: userData.prenom      },
    { icon: 'user',      label: 'Nom',         field: 'nom',         value: userData.nom         },
    { icon: 'mail',      label: 'Email',       field: 'email',       value: userData.email,       locked: true },
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
      <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
        <StatusBar barStyle="light-content" />

        {/* HEADER */}
        <LinearGradient
          colors={['#4C1D95', '#1E1B4B']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{
            paddingTop: Platform.OS === 'ios' ? 54 : 36,
            paddingBottom: 24, paddingHorizontal: 20,
            flexDirection: 'row', alignItems: 'center', gap: 14,
          }}
        >
          <TouchableOpacity
            onPress={() => navigation?.goBack()}
            style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center' }}
            activeOpacity={0.8}
          >
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: -0.4 }}>Profil Administrateur</Text>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>Accès privilégié · {userData.niveau}</Text>
          </View>
          {isEditing && (
            <TouchableOpacity
              onPress={handleCancelEdit}
              style={{ backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 }}
            >
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>Annuler</Text>
            </TouchableOpacity>
          )}
        </LinearGradient>

        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <ScrollView
            contentContainerStyle={{ paddingBottom: 110 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* AVATAR */}
            <View style={{
              backgroundColor: '#fff', alignItems: 'center',
              paddingTop: 28, paddingBottom: 24, marginBottom: 12,
              borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
              shadowColor: '#4C1D95', shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.1, shadowRadius: 20, elevation: 6,
            }}>
              <TouchableOpacity onPress={() => setShowPhotoModal(true)} activeOpacity={0.9} style={{ position: 'relative' }}>
                <LinearGradient
                  colors={['#4C1D95', '#1E1B4B']}
                  style={{
                    width: 112, height: 112, borderRadius: 56,
                    justifyContent: 'center', alignItems: 'center',
                    overflow: 'hidden', borderWidth: 4, borderColor: '#fff',
                  }}
                >
                  {uploadingAvatar ? (
                    <ActivityIndicator color="#fff" size="large" />
                  ) : avatarUri ? (
                    <AvatarImage key={imageKey} uri={avatarUri} size={112} />
                  ) : (
                    <Ionicons name="person" size={54} color="#fff" />
                  )}
                </LinearGradient>

                <TouchableOpacity
                  onPress={() => setShowAvatarModal(true)}
                  activeOpacity={0.85}
                  style={{
                    position: 'absolute', bottom: 2, right: 2,
                    width: 34, height: 34, borderRadius: 17,
                    backgroundColor: '#4C1D95',
                    justifyContent: 'center', alignItems: 'center',
                    borderWidth: 3, borderColor: '#fff',
                  }}
                >
                  <Feather name="camera" size={16} color="#fff" />
                </TouchableOpacity>
              </TouchableOpacity>

              <Text style={{ fontSize: 22, fontWeight: '800', color: '#1E293B', marginTop: 14, letterSpacing: -0.4 }}>
                {userData.prenom} {userData.nom}
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: COLORS.primaryLight, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 }}>
                  <Feather name="shield" size={13} color={COLORS.primary} />
                  <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.primary }}>{userData.role}</Text>
                </View>
                <View style={{ backgroundColor: '#F1F5F9', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748B' }}>{userData.identifiant}</Text>
                </View>
              </View>

              <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 10 }}>
                Appuyez sur 📷 pour changer la photo
              </Text>
            </View>

            {/* STATS */}
            <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 12 }}>
              <StatCard icon="shield"   label="Niveau"   value="Accès 3"  color={COLORS.primary} />
              <StatCard icon="users"    label="Comptes"  value="247"      color="#3B82F6"        />
              <StatCard icon="activity" label="Activité" value="En ligne" color="#10B981"        />
            </View>

            {/* INFORMATIONS PERSONNELLES */}
            <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#1E293B' }}>Informations personnelles</Text>
                {isEditing && (
                  <View style={{ backgroundColor: COLORS.primaryLight, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: COLORS.primary }}>✏️ MODE ÉDITION</Text>
                  </View>
                )}
              </View>
              <View style={S.infoCard}>
                {EDITABLE_FIELDS.map((item, index) => (
                  <InfoRow
                    key={item.field} {...item}
                    isLast={index === EDITABLE_FIELDS.length - 1}
                    isEditing={isEditing}
                    onChangeText={updateField}
                  />
                ))}
              </View>
            </View>

            {/* INFORMATIONS SYSTÈME */}
            <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#1E293B' }}>Informations système</Text>
                <View style={{ backgroundColor: '#FEF3C7', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: '#D97706' }}>🔒 PARTIEL</Text>
                </View>
              </View>
              <View style={S.infoCard}>
                {LOCKED_FIELDS.map((item, index) => (
                  <InfoRow
                    key={item.field} {...item}
                    isLast={index === LOCKED_FIELDS.length - 1}
                    isEditing={isEditing}
                    onChangeText={updateField}
                  />
                ))}
              </View>
            </View>

            {/* PERMISSIONS */}
            <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#1E293B' }}>Permissions & accès</Text>
                <View style={{ backgroundColor: COLORS.primaryLight, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: COLORS.primary }}>🔒 LECTURE SEULE</Text>
                </View>
              </View>
              <View style={[S.infoCard, { paddingHorizontal: 0, paddingVertical: 0 }]}>
                {PERMISSIONS.map(p => <PermissionBadge key={p.label} {...p} />)}
              </View>
            </View>

            {/* JOURNAL */}
            <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 10 }}>Journal d'activité récente</Text>
              <View style={S.infoCard}>
                {ACTIVITY_LOG.map((entry, index) => (
                  <LogRow key={index} {...entry} isLast={index === ACTIVITY_LOG.length - 1} />
                ))}
              </View>
            </View>

            {/* BOUTONS */}
            <View style={{ paddingHorizontal: 16, gap: 10, paddingBottom: 8 }}>

              <TouchableOpacity
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                  backgroundColor: '#fff', borderRadius: 16, padding: 16,
                  borderWidth: 1.5, borderColor: COLORS.primaryLight,
                  shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.1, shadowRadius: 10, elevation: 3,
                }}
                onPress={() => navigation?.navigate('AdminSettings')}
                activeOpacity={0.85}
              >
                <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' }}>
                  <Feather name="settings" size={18} color={COLORS.primary} />
                </View>
                <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: COLORS.primary }}>Paramètres système</Text>
                <Feather name="chevron-right" size={18} color={COLORS.primary} />
              </TouchableOpacity>

              {isEditing ? (
                <TouchableOpacity
                  style={{
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
                    backgroundColor: COLORS.primary, borderRadius: 16, padding: 16,
                    opacity: saving ? 0.7 : 1,
                    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.35, shadowRadius: 14, elevation: 6,
                  }}
                  onPress={handleSave}
                  disabled={saving}
                  activeOpacity={0.85}
                >
                  {saving
                    ? <><ActivityIndicator size="small" color="#fff" /><Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Sauvegarde...</Text></>
                    : <><Feather name="save" size={18} color="#fff" /><Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Sauvegarder les modifications</Text></>
                  }
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={{
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
                    backgroundColor: '#fff', borderRadius: 16, padding: 16,
                    borderWidth: 1.5, borderColor: COLORS.primary + '40',
                    shadowColor: '#64748B', shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.08, shadowRadius: 10, elevation: 3,
                  }}
                  onPress={() => setIsEditing(true)}
                  activeOpacity={0.85}
                >
                  <Feather name="edit-3" size={18} color={COLORS.primary} />
                  <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.primary }}>Modifier le profil</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={{
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
                  backgroundColor: '#fff', borderRadius: 16, padding: 16,
                  borderWidth: 1.5, borderColor: '#FCA5A5',
                  shadowColor: '#64748B', shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.08, shadowRadius: 10, elevation: 3,
                }}
                onPress={() => setShowPasswordModal(true)}
                activeOpacity={0.85}
              >
                <Feather name="lock" size={18} color="#EF4444" />
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#EF4444' }}>Changer le mot de passe</Text>
              </TouchableOpacity>
            </View>

            <View style={{ alignItems: 'center', paddingTop: 20, paddingBottom: 6 }}>
              <Text style={{ fontSize: 11, color: '#CBD5E1' }}>SafeKids v2.1.0 · Panneau Administrateur · © 2026</Text>
            </View>
          </ScrollView>
        </Animated.View>

        {/* ── MODAL PHOTO PLEIN ÉCRAN ─────────────────────────────────────── */}
        <Modal visible={showPhotoModal} transparent animationType="fade" onRequestClose={() => setShowPhotoModal(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.96)', justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => setShowPhotoModal(false)}
              style={{ position: 'absolute', top: Platform.OS === 'ios' ? 56 : 28, right: 20, width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', zIndex: 10 }}
            >
              <Feather name="x" size={22} color="#fff" />
            </TouchableOpacity>

            {avatarUri ? (
              <AvatarImage uri={avatarUri} size={280} />
            ) : (
              <View style={{ width: 280, height: 280, borderRadius: 140, backgroundColor: '#4C1D95', justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="person" size={110} color="#fff" />
              </View>
            )}

            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 24, letterSpacing: -0.4 }}>
              {userData.prenom} {userData.nom}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 5 }}>
              {userData.role} · {userData.identifiant}
            </Text>

            <TouchableOpacity
              onPress={() => { setShowPhotoModal(false); setTimeout(() => setShowAvatarModal(true), 300); }}
              style={{ marginTop: 28, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(76,29,149,0.8)', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 12 }}
            >
              <Feather name="camera" size={16} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Changer la photo</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* ── MODAL CAMÉRA / GALERIE ──────────────────────────────────────── */}
        <Modal visible={showAvatarModal} transparent animationType="slide" onRequestClose={() => setShowAvatarModal(false)}>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }}
            activeOpacity={1}
            onPress={() => setShowAvatarModal(false)}
          >
            <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: Platform.OS === 'ios' ? 42 : 28 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0', alignSelf: 'center', marginBottom: 20 }} />
              <Text style={{ fontSize: 17, fontWeight: '800', color: '#1E293B', textAlign: 'center', marginBottom: 20 }}>Photo de profil</Text>

              <TouchableOpacity onPress={handleModalCamera} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#EDE9FE', borderRadius: 16, padding: 16, marginBottom: 10 }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#4C1D95', justifyContent: 'center', alignItems: 'center' }}>
                  <Feather name="camera" size={20} color="#fff" />
                </View>
                <View>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: '#1E293B' }}>Prendre une photo</Text>
                  <Text style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Ouvrir la caméra</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleModalGallery} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#F1F5F9', borderRadius: 16, padding: 16, marginBottom: 16 }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#64748B', justifyContent: 'center', alignItems: 'center' }}>
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

        {/* ── MODAL MOT DE PASSE ──────────────────────────────────────────── */}
        <Modal visible={showPasswordModal} transparent animationType="slide" onRequestClose={() => setShowPasswordModal(false)}>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }}
            activeOpacity={1}
            onPress={() => setShowPasswordModal(false)}
          >
            <TouchableOpacity activeOpacity={1}>
              <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: Platform.OS === 'ios' ? 42 : 28 }}>
                <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0', alignSelf: 'center', marginBottom: 20 }} />
                <Text style={{ fontSize: 17, fontWeight: '800', color: '#1E293B', textAlign: 'center', marginBottom: 20 }}>Changer le mot de passe</Text>

                {[
                  { label: 'Mot de passe actuel',  value: ancienMdp,  setter: setAncienMdp  },
                  { label: 'Nouveau mot de passe', value: nouveauMdp, setter: setNouveauMdp  },
                  { label: 'Confirmer le nouveau', value: confirmMdp, setter: setConfirmMdp  },
                ].map(({ label, value, setter }) => (
                  <View key={label} style={{ marginBottom: 14 }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#6D28D9', marginBottom: 6 }}>{label}</Text>
                    <TextInput
                      style={{ borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 14, paddingHorizontal: 14, height: 50, fontSize: 15, color: '#1E293B', backgroundColor: '#F8FAFC' }}
                      value={value} onChangeText={setter} secureTextEntry
                      placeholder="••••••••" placeholderTextColor="#CBD5E1"
                    />
                  </View>
                ))}

                <TouchableOpacity
                  onPress={handleChangePassword}
                  disabled={changingPwd}
                  style={{ height: 52, borderRadius: 16, backgroundColor: '#4C1D95', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 8, marginTop: 6, opacity: changingPwd ? 0.7 : 1 }}
                >
                  {changingPwd
                    ? <ActivityIndicator color="#fff" />
                    : <><Feather name="check" size={18} color="#fff" /><Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Confirmer</Text></>
                  }
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setShowPasswordModal(false)} style={{ padding: 14, alignItems: 'center' }}>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: '#EF4444' }}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

      </View>
    </AdminLayout>
  );
}