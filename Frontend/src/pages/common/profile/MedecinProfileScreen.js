// src/pages/medecin/Profile/MedecinProfileScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, Image, TouchableOpacity, ScrollView,
  StatusBar, Animated, Alert, ActivityIndicator, Modal, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import MedecinLayout from '../../../components/Navigation/MedecinNavigation';
import S, { COLORS } from './ProfileStyles';

const SERVER_URL = 'https://unfailed-branden-healable.ngrok-free.dev';


const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const SPECIALITES = [
  'Psychologue', 'Pédopsychiatrie', 'Orthophonie', 'Psychomotricien',
  'Psychiatre', 'Neuropédiatrie', 'Ergothérapie', 'ABA Thérapeute',
];

// Avatar cross-platform
const AvatarImage = ({ uri, size = 112 }) => {
  if (!uri) return null;
  
  if (Platform.OS === 'web' && uri) {
    return (
      <img
        src={uri}
        style={{ width: size, height: size, borderRadius: size / 2, objectFit: 'cover', display: 'block' }}
        onError={(e) => { e.target.style.display = 'none'; }}
      />
    );
  }
  return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} resizeMode="cover" />;
};

// StatCard
const StatCard = ({ icon, label, value, color }) => (
  <View style={S.statCard}>
    <View style={[S.statIcon, { backgroundColor: color }]}>
      <Feather name={icon} size={18} color="#fff" />
    </View>
    <Text style={S.statLabel}>{label}</Text>
    <Text style={S.statValue} numberOfLines={1}>{value}</Text>
  </View>
);

// InfoRow
const InfoRow = ({ icon, label, value, field, isLast = false, isEditing = false, onChangeText, locked = false }) => (
  <View style={[S.infoRow, isLast && { borderBottomWidth: 0 }]}>
    <View style={[S.securityIcon, { backgroundColor: locked ? '#FEF3C7' : COLORS.primaryLight }]}>
      <Feather name={icon} size={16} color={locked ? '#D97706' : COLORS.primary} />
    </View>
    <View style={S.infoContent}>
      <Text style={S.infoLabel}>{label}</Text>
      {isEditing && !locked ? (
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
        <Text style={[S.infoValue, locked && { color: COLORS.textMuted, fontStyle: 'italic' }]} numberOfLines={1}>
          {value || '—'}
        </Text>
      )}
    </View>
    {locked
      ? <Feather name="lock" size={13} color="#D97706" />
      : isEditing ? <Feather name="edit-2" size={14} color={COLORS.primary} /> : null}
  </View>
);

// Écran principal
export default function MedecinProfileScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDispoModal, setShowDispoModal] = useState(false);

  const [ancienMdp, setAncienMdp] = useState('');
  const [nouveauMdp, setNouveauMdp] = useState('');
  const [confirmMdp, setConfirmMdp] = useState('');
  const [changingPwd, setChangingPwd] = useState(false);

  const [avatarUri, setAvatarUri] = useState(null);
  const [imageKey, setImageKey] = useState(Date.now());
  const fadeAnim = useState(new Animated.Value(0))[0];

  const loadProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) { 
        navigation?.navigate('Login'); 
        return; 
      }

      const res = await fetch(`${SERVER_URL}/profile`, {
        headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) navigation?.navigate('Login');
        else Alert.alert('Erreur', data.message || 'Impossible de charger le profil');
        return;
      }

      setUserData({
        prenom: data.prenom || '',
        nom: data.nom || '',
        email: data.email || '',
        phone: data.telephone || '',
        specialite: data.specialite || '',
        disponibilite: Array.isArray(data.disponibilite) ? data.disponibilite : [],
        ville: data.ville || '',
        wilaya: data.wilaya || '',
        role: data.role || 'Medecin',
        nbPatients: data.nbPatients || 0,
        nbRdv: data.nbRdv || 0,
      });

      if (data.avatar) {
        const cached = await AsyncStorage.getItem('medecinAvatarUri');
        if (Platform.OS === 'web' && cached && cached.startsWith('data:')) {
          setAvatarUri(cached);
        } else if (cached && !cached.includes('undefined')) {
          setAvatarUri(cached);
        } else {
          const uri = `${SERVER_URL}${data.avatar}?t=${Date.now()}`;
          setAvatarUri(uri);
          await AsyncStorage.setItem('medecinAvatarUri', uri);
          setImageKey(Date.now());
        }
      }
    } catch (e) {
      console.error('Erreur chargement:', e);
      Alert.alert('Erreur', 'Impossible de charger votre profil.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const cached = await AsyncStorage.getItem('medecinAvatarUri');
      if (cached) setAvatarUri(cached);
      await loadProfile();
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    };
    init();
  }, []);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('medecinAvatarUri').then(c => { if (c) setAvatarUri(c); });
      loadProfile();
    }, [])
  );

  const updateField = useCallback((field, value) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  }, []);

  const toggleDispo = (jour) => {
    setUserData(prev => {
      const d = prev.disponibilite || [];
      const next = d.includes(jour) ? d.filter(j => j !== jour) : [...d, jour];
      return { ...prev, disponibilite: next };
    });
  };

  const handleCancelEdit = async () => {
    const prev = avatarUri;
    await loadProfile();
    setAvatarUri(prev);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!userData.prenom?.trim() || !userData.nom?.trim()) {
      Alert.alert('Erreur', 'Le prénom et le nom sont obligatoires.');
      return;
    }
    
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const res = await fetch(`${SERVER_URL}/profile`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json', 
          'ngrok-skip-browser-warning': 'true' 
        },
        body: JSON.stringify({
          prenom: userData.prenom,
          nom: userData.nom,
          telephone: userData.phone,
          specialite: userData.specialite,
          disponibilite: userData.disponibilite,
          ville: userData.ville,
          wilaya: userData.wilaya,
        }),
      });
      
      const data = await res.json();
      if (!res.ok) { 
        Alert.alert('Erreur', data.message || 'Impossible de sauvegarder'); 
        return; 
      }
      
      Alert.alert('Succès ✅', 'Profil mis à jour avec succès !');
      setIsEditing(false);
      const prev = avatarUri;
      await loadProfile();
      setAvatarUri(prev);
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      Alert.alert('Erreur', 'Impossible de contacter le serveur.');
    } finally {
      setSaving(false);
    }
  };

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
      const res = await fetch(`${SERVER_URL}/change-password`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json', 
          'ngrok-skip-browser-warning': 'true' 
        },
        body: JSON.stringify({ ancienMotDePasse: ancienMdp, nouveauMotDePasse: nouveauMdp }),
      });
      
      const data = await res.json();
      if (!res.ok) { 
        Alert.alert('Erreur', data.message || 'Impossible de changer le mot de passe'); 
        return; 
      }
      
      Alert.alert('Succès ✅', 'Mot de passe modifié avec succès !');
      setShowPasswordModal(false);
      setAncienMdp(''); 
      setNouveauMdp(''); 
      setConfirmMdp('');
    } catch (error) {
      console.error('Erreur changement mot de passe:', error);
      Alert.alert('Erreur', 'Impossible de contacter le serveur.');
    } finally { 
      setChangingPwd(false); 
    }
  };

  const uploadAvatar = async (uri, base64FromPicker = null) => {
    if (!uri || !base64FromPicker) { 
      Alert.alert('Erreur', 'Aucune image sélectionnée'); 
      return; 
    }
    
    setUploadingAvatar(true);
    const mimeType = uri.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
    const dataUri = `data:${mimeType};base64,${base64FromPicker}`;
    setAvatarUri(dataUri); 
    setImageKey(Date.now());
    
    try {
      const token = await AsyncStorage.getItem('userToken');
      const res = await fetch(`${SERVER_URL}/upload-avatar-base64`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json', 
          'ngrok-skip-browser-warning': 'true' 
        },
        body: JSON.stringify({ imageBase64: base64FromPicker, mimeType }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur serveur");
      
      if (Platform.OS === 'web') {
        await AsyncStorage.setItem('medecinAvatarUri', dataUri);
      } else {
        const serverUri = `${SERVER_URL}${data.avatarUrl}?t=${Date.now()}`;
        setAvatarUri(serverUri);
        await AsyncStorage.setItem('medecinAvatarUri', serverUri);
        setImageKey(Date.now());
      }
      
      Alert.alert('Succès ✅', 'Photo de profil mise à jour !');
      await loadProfile();
    } catch (e) {
      console.error('Erreur upload:', e);
      Alert.alert('Erreur Upload', e.message || "Échec de l'upload");
      await loadProfile();
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
      quality: 0.65, 
      base64: true 
    });
    if (!result.canceled && result.assets?.[0]) 
      await uploadAvatar(result.assets[0].uri, result.assets[0].base64);
  };

  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { 
      Alert.alert('Permission refusée', "Autorisez l'accès à la galerie."); 
      return; 
    }
    const result = await ImagePicker.launchImageLibraryAsync({ 
      mediaTypes: ImagePicker.MediaTypeOptions.Images, 
      quality: 0.65, 
      base64: true 
    });
    if (!result.canceled && result.assets?.[0]) 
      await uploadAvatar(result.assets[0].uri, result.assets[0].base64);
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

  if (loading) {
    return (
      <MedecinLayout activeTab="ProfilMedecin">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 12, color: COLORS.textMuted, fontSize: 14 }}>Chargement du profil...</Text>
        </View>
      </MedecinLayout>
    );
  }

  if (!userData) {
    return (
      <MedecinLayout activeTab="ProfilMedecin">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Feather name="wifi-off" size={48} color={COLORS.textMuted} />
          <Text style={{ marginTop: 16, fontSize: 16, fontWeight: '700', color: COLORS.text }}>Profil introuvable</Text>
          <TouchableOpacity onPress={loadProfile} style={{ marginTop: 20, paddingHorizontal: 28, paddingVertical: 13, backgroundColor: COLORS.primary, borderRadius: 14 }}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </MedecinLayout>
    );
  }

  const INFO_FIELDS = [
    { icon: 'user', label: 'Prénom', field: 'prenom', value: userData.prenom },
    { icon: 'user', label: 'Nom', field: 'nom', value: userData.nom },
    { icon: 'mail', label: 'Email', field: 'email', value: userData.email, locked: true },
    { icon: 'phone', label: 'Téléphone', field: 'phone', value: userData.phone },
    { icon: 'activity', label: 'Spécialité', field: 'specialite', value: userData.specialite },
    { icon: 'map-pin', label: 'Ville', field: 'ville', value: userData.ville },
    { icon: 'map', label: 'Wilaya', field: 'wilaya', value: userData.wilaya },
  ];

  return (
    <MedecinLayout activeTab="ProfilMedecin">
      <View style={{ flex: 1, backgroundColor: COLORS.surface }}>
        <StatusBar barStyle="light-content" />

        {/* HEADER gradient cyan */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }} 
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: Platform.OS === 'ios' ? 54 : 36, paddingBottom: 24, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 14 }}
        >
          <TouchableOpacity onPress={() => navigation?.goBack()}
            style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center' }}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: -0.4 }}>Mon Profil</Text>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>Gérez vos informations médicales</Text>
          </View>
          {isEditing && (
            <TouchableOpacity onPress={handleCancelEdit}
              style={{ backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 }}>
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>Annuler</Text>
            </TouchableOpacity>
          )}
        </LinearGradient>

        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <ScrollView contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            {/* AVATAR */}
            <View style={{ backgroundColor: '#fff', alignItems: 'center', paddingTop: 28, paddingBottom: 24, marginBottom: 12, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, shadowColor: '#0891B2', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 6 }}>
              <TouchableOpacity onPress={() => setShowPhotoModal(true)} activeOpacity={0.9} style={{ position: 'relative' }}>
                <LinearGradient colors={['#667eea', '#764ba2']}
                  style={{ width: 112, height: 112, borderRadius: 56, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 4, borderColor: '#fff' }}>
                  {uploadingAvatar ? (
                    <ActivityIndicator color="#fff" size="large" />
                  ) : avatarUri ? (
                    <AvatarImage key={imageKey} uri={avatarUri} size={112} />
                  ) : (
                    <Ionicons name="medkit" size={50} color="#fff" />
                  )}
                </LinearGradient>
                <TouchableOpacity onPress={() => setShowAvatarModal(true)} activeOpacity={0.85}
                  style={{ position: 'absolute', bottom: 2, right: 2, width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff' }}>
                  <Feather name="camera" size={16} color="#fff" />
                </TouchableOpacity>
              </TouchableOpacity>

              <Text style={{ fontSize: 22, fontWeight: '800', color: COLORS.text, marginTop: 14, letterSpacing: -0.4 }}>
                Dr. {userData.prenom} {userData.nom}
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: COLORS.primaryLight, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 }}>
                  <Feather name="activity" size={13} color={COLORS.primary} />
                  <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.primary }}>{userData.specialite || 'Médecin'}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: COLORS.successBg, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 }}>
                  <Feather name="check-circle" size={13} color={COLORS.success} />
                  <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.successText }}>Vérifié</Text>
                </View>
              </View>
              <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 10 }}>Appuyez sur 📷 pour changer la photo</Text>
            </View>

            {/* STATS */}
            <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 12 }}>
              <StatCard icon="users" label="Patients" value={String(userData.nbPatients || 0)} color={COLORS.primary} />
              <StatCard icon="calendar" label="RDV ce mois" value={String(userData.nbRdv || 0)} color="#10B981" />
              <StatCard icon="map-pin" label="Localisation" value={userData.ville || '—'} color="#F59E0B" />
            </View>

            {/* DISPONIBILITÉS */}
            <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
              <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 18, shadowColor: '#0891B2', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Feather name="calendar" size={16} color={COLORS.primary} />
                    <Text style={{ fontSize: 15, fontWeight: '800', color: COLORS.text }}>Disponibilités</Text>
                  </View>
                  {isEditing && (
                    <TouchableOpacity onPress={() => setShowDispoModal(true)}
                      style={{ backgroundColor: COLORS.primaryLight, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 }}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.primary }}>Modifier</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {JOURS.map(j => {
                    const actif = userData.disponibilite?.includes(j);
                    return (
                      <View key={j} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, backgroundColor: actif ? COLORS.primaryLight : '#F9FAFB', borderWidth: 1.5, borderColor: actif ? COLORS.primary + '60' : '#E5E7EB' }}>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: actif ? COLORS.primary : '#CBD5E1' }}>{j.slice(0,3)}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* INFOS */}
            <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: COLORS.text }}>Détails du compte</Text>
                {isEditing && (
                  <View style={{ backgroundColor: COLORS.primaryLight, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: COLORS.primary }}>✏️ MODE ÉDITION</Text>
                  </View>
                )}
              </View>
              <View style={{ backgroundColor: '#fff', borderRadius: 20, shadowColor: "#7C3AED", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4, overflow: 'hidden' }}>
                {INFO_FIELDS.map((item, i) => (
                  <InfoRow key={item.field} {...item} isLast={i === INFO_FIELDS.length - 1} isEditing={isEditing} onChangeText={updateField} />
                ))}
              </View>
            </View>

            {/* BOUTONS */}
            <View style={{ paddingHorizontal: 16, gap: 10, paddingBottom: 8 }}>
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: COLORS.primaryLight, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3 }}
                onPress={() => navigation?.navigate('MedecinSettings')}
                activeOpacity={0.85}
              >
                <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' }}>
                  <Feather name="settings" size={18} color={COLORS.primary} />
                </View>
                <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: COLORS.primary }}>Paramètres</Text>
                <Feather name="chevron-right" size={18} color={COLORS.primary} />
              </TouchableOpacity>

              {isEditing ? (
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: COLORS.primary, borderRadius: 16, padding: 16, opacity: saving ? 0.7 : 1, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 6 }}
                  onPress={handleSave} disabled={saving} activeOpacity={0.85}
                >
                  {saving
                    ? <><ActivityIndicator size="small" color="#fff" /><Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Sauvegarde...</Text></>
                    : <><Feather name="save" size={18} color="#fff" /><Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Sauvegarder les modifications</Text></>
                  }
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: COLORS.primary + '40', shadowColor: '#64748B', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 3 }}
                  onPress={() => setIsEditing(true)} activeOpacity={0.85}
                >
                  <Feather name="edit-3" size={18} color={COLORS.primary} />
                  <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.primary }}>Modifier le profil</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: '#FCA5A5', shadowColor: '#64748B', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 3 }}
                onPress={() => setShowPasswordModal(true)} activeOpacity={0.85}
              >
                <Feather name="lock" size={18} color="#EF4444" />
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#EF4444' }}>Changer le mot de passe</Text>
              </TouchableOpacity>
            </View>

            <View style={{ alignItems: 'center', paddingTop: 20, paddingBottom: 6 }}>
              <Text style={{ fontSize: 11, color: '#CBD5E1' }}>SafeKids v2.1.0 · © 2026 · Espace Médecin</Text>
            </View>
          </ScrollView>
        </Animated.View>

        {/* MODAL PHOTO PLEIN ÉCRAN */}
        <Modal visible={showPhotoModal} transparent animationType="fade" onRequestClose={() => setShowPhotoModal(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.96)', justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => setShowPhotoModal(false)}
              style={{ position: 'absolute', top: Platform.OS === 'ios' ? 56 : 28, right: 20, width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
              <Feather name="x" size={22} color="#fff" />
            </TouchableOpacity>
            {avatarUri ? (
              <AvatarImage uri={avatarUri} size={280} />
            ) : (
              <View style={{ width: 280, height: 280, borderRadius: 140, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="medkit" size={110} color="#fff" />
              </View>
            )}
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 24, letterSpacing: -0.4 }}>
              Dr. {userData.prenom} {userData.nom}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 5 }}>{userData.specialite}</Text>
            <TouchableOpacity onPress={() => { setShowPhotoModal(false); setTimeout(() => setShowAvatarModal(true), 300); }}
              style={{ marginTop: 28, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(129, 65, 189, 0.8)', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 12 }}>
              <Feather name="camera" size={16} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Changer la photo</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* MODAL CAMÉRA / GALERIE */}
        <Modal visible={showAvatarModal} transparent animationType="slide" onRequestClose={() => setShowAvatarModal(false)}>
          <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }} activeOpacity={1} onPress={() => setShowAvatarModal(false)}>
            <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: Platform.OS === 'ios' ? 42 : 28 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0', alignSelf: 'center', marginBottom: 20 }} />
              <Text style={{ fontSize: 17, fontWeight: '800', color: '#1E293B', textAlign: 'center', marginBottom: 20 }}>Photo de profil</Text>
              <TouchableOpacity onPress={handleModalCamera}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: COLORS.primaryLight, borderRadius: 16, padding: 16, marginBottom: 10 }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' }}>
                  <Feather name="camera" size={20} color="#fff" />
                </View>
                <View>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: '#1E293B' }}>Prendre une photo</Text>
                  <Text style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Ouvrir la caméra</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleModalGallery}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#F1F5F9', borderRadius: 16, padding: 16, marginBottom: 16 }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor:"#7C3AED", justifyContent: 'center', alignItems: 'center' }}>
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

        {/* MODAL MOT DE PASSE */}
        <Modal visible={showPasswordModal} transparent animationType="slide" onRequestClose={() => setShowPasswordModal(false)}>
          <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }} activeOpacity={1} onPress={() => setShowPasswordModal(false)}>
            <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: Platform.OS === 'ios' ? 42 : 28 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0', alignSelf: 'center', marginBottom: 20 }} />
              <Text style={{ fontSize: 17, fontWeight: '800', color: '#1E293B', textAlign: 'center', marginBottom: 20 }}>Changer le mot de passe</Text>
              {[
                { label: 'Mot de passe actuel', value: ancienMdp, setter: setAncienMdp },
                { label: 'Nouveau mot de passe', value: nouveauMdp, setter: setNouveauMdp },
                { label: 'Confirmer le mot de passe', value: confirmMdp, setter: setConfirmMdp },
              ].map((item, i) => (
                <View key={i} style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#64748B', marginBottom: 8 }}>{item.label}</Text>
                  <TextInput 
                    style={{ backgroundColor: '#F1F5F9', borderRadius: 12, padding: 14, fontSize: 15, color: '#1E293B', borderWidth: 1, borderColor: '#E2E8F0' }} 
                    value={item.value} 
                    onChangeText={item.setter} 
                    secureTextEntry 
                    placeholder="••••••••" 
                    placeholderTextColor="#94A3B8" 
                  />
                </View>
              ))}
              <TouchableOpacity 
                style={{ backgroundColor: COLORS.primary, borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 8, opacity: changingPwd ? 0.7 : 1 }} 
                onPress={handleChangePassword} 
                disabled={changingPwd}
              >
                {changingPwd ? <ActivityIndicator size="small" color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Mettre à jour le mot de passe</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)} style={{ padding: 14, alignItems: 'center', marginTop: 8 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: '#94A3B8' }}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* MODAL DISPONIBILITÉS */}
        <Modal visible={showDispoModal} transparent animationType="fade" onRequestClose={() => setShowDispoModal(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 }}>
            <View style={{ backgroundColor: '#fff', borderRadius: 28, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.2, shadowRadius: 30, elevation: 10 }}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: COLORS.text, marginBottom: 6 }}>Jours de consultation</Text>
              <Text style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 20 }}>Sélectionnez vos jours de disponibilité.</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
                {JOURS.map(j => {
                  const actif = userData.disponibilite?.includes(j);
                  return (
                    <TouchableOpacity key={j} onPress={() => toggleDispo(j)}
                      style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: actif ? COLORS.primaryLight : '#F9FAFB', borderWidth: 1.5, borderColor: actif ? COLORS.primary : '#E5E7EB' }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: actif ? COLORS.primary : '#9CA3AF' }}>{j}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <TouchableOpacity onPress={() => setShowDispoModal(false)}
                style={{ backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 14, alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </MedecinLayout>
  );
}