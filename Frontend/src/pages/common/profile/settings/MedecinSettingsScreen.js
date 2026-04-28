// src/pages/medecin/SettingsScreen/SettingsScreen.js
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Switch, StatusBar, Alert, ActivityIndicator, Modal,
  Linking, Image, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as LocalAuthentication from 'expo-local-authentication';
import MedecinLayout from '../../../../components/Navigation/MedecinNavigation';
import S, { COLORS, IS_TABLET } from '../ProfileStyles';

const SERVER_URL = 'https://unfailed-branden-healable.ngrok-free.dev';

const KEYS = {
  preferences:   'medecinPreferences',
  notifications: 'medecinNotifications',
  security:      'medecinSecurity',
};

const TABS = [
  { id: 'general',       icon: 'user',        label: 'Profil'        },
  { id: 'preferences',   icon: 'sliders',     label: 'Préférences'   },
  { id: 'security',      icon: 'shield',      label: 'Sécurité'      },
  { id: 'notifications', icon: 'bell',        label: 'Notifications' },
  { id: 'account',       icon: 'settings',    label: 'Compte'        },
  { id: 'practice',      icon: 'briefcase',   label: 'Cabinet'       },
  { id: 'patients',      icon: 'users',       label: 'Patients'      },
];

const SavedBadge = ({ visible }) => {
  if (!visible) return null;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.successBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
      <Feather name="check" size={12} color={COLORS.success} />
      <Text style={{ fontSize: 11, color: COLORS.successText, fontWeight: '600' }}>Sauvegardé</Text>
    </View>
  );
};

// Helper API (identique à l'admin)
const apiGet = async (endpoint) => {
  const token = await AsyncStorage.getItem('userToken');
  const r = await fetch(`${SERVER_URL}${endpoint}`, {
    headers: { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
  });
  return r.json();
};

const apiPut = async (endpoint, body) => {
  const token = await AsyncStorage.getItem('userToken');
  const r = await fetch(`${SERVER_URL}${endpoint}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify(body),
  });
  return r.json();
};

// ─── PANEL : PROFIL MÉDECIN (identique à l'admin dans sa logique) ───
const GeneralPanel = () => {
  const [form, setForm] = useState({ 
    prenom: '', 
    nom: '', 
    email: '', 
    phone: '', 
    specialite: '', 
    numeroOrdre: '',
    ville: '',
    wilaya: ''
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [avatarUri, setAvatarUri] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Charger depuis la BDD (identique à l'admin)
  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiGet('/profile');
        setForm({
          prenom: data.prenom || '',
          nom: data.nom || '',
          email: data.email || '',
          phone: data.telephone || '',
          specialite: data.specialite || '',
          numeroOrdre: data.numeroOrdre || '',
          ville: data.ville || '',
          wilaya: data.wilaya || '',
        });
        // Avatar : cache local prioritaire, sinon URL serveur (identique admin)
        const cached = await AsyncStorage.getItem('medecinCachedAvatarUri');
        if (cached) {
          setAvatarUri(cached);
        } else if (data.avatar) {
          const uri = `${SERVER_URL}${data.avatar}?t=${Date.now()}`;
          setAvatarUri(uri);
          await AsyncStorage.setItem('medecinCachedAvatarUri', uri);
        }
      } catch {
        const cached = await AsyncStorage.getItem('medecinCachedAvatarUri');
        if (cached) setAvatarUri(cached);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: null }));
    setSaved(false);
  };

  const validate = () => {
    const e = {};
    if (!form.prenom.trim()) e.prenom = 'Requis';
    if (!form.nom.trim()) e.nom = 'Requis';
    if (!form.specialite.trim()) e.specialite = 'Requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Sauvegarde dans la BDD (identique admin)
  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const data = await apiPut('/profile', {
        prenom: form.prenom,
        nom: form.nom,
        telephone: form.phone,
        specialite: form.specialite,
        numeroOrdre: form.numeroOrdre,
        ville: form.ville,
        wilaya: form.wilaya,
      });
      if (data.message && !data.success) {
        Alert.alert('Erreur', data.message);
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      Alert.alert('Erreur', 'Impossible de contacter le serveur.');
    } finally {
      setSaving(false);
    }
  };

  // Upload avatar (IDENTIQUE à l'admin)
  const uploadAvatar = async (uri, base64Data = null) => {
    setUploadingAvatar(true);

    const mimeType = uri.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

    let base64 = base64Data;
    if (!base64 && Platform.OS !== 'web') {
      base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
    }

    // Affichage immédiat local
    const dataUri = base64 ? `data:${mimeType};base64,${base64}` : uri;
    setAvatarUri(dataUri);

    try {
      const token = await AsyncStorage.getItem('userToken');
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
        Alert.alert('Erreur', data.message || "Impossible d'envoyer la photo");
        return;
      }
      if (Platform.OS === 'web') {
        await AsyncStorage.setItem('medecinCachedAvatarUri', dataUri);
      } else {
        const serverUri = `${SERVER_URL}${data.avatarUrl}?t=${Date.now()}`;
        setAvatarUri(serverUri);
        await AsyncStorage.setItem('medecinCachedAvatarUri', serverUri);
      }
      Alert.alert('Succès ✅', 'Photo de profil mise à jour !');
    } catch {
      Alert.alert('Erreur', "Impossible d'envoyer la photo.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handlePickAvatar = () => {
    Alert.alert('Photo de profil', 'Choisissez une option', [
      {
        text: 'Prendre une photo',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') { Alert.alert('Permission refusée', "L'accès à la caméra est nécessaire."); return; }
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, aspect: [1, 1], quality: 0.75, base64: true,
          });
          if (!result.canceled && result.assets?.length > 0) {
            await uploadAvatar(result.assets[0].uri, result.assets[0].base64);
          }
        },
      },
      {
        text: 'Choisir depuis la galerie',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') { Alert.alert('Permission refusée', "L'accès à la galerie est nécessaire."); return; }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, aspect: [1, 1], quality: 0.75, base64: true,
          });
          if (!result.canceled && result.assets?.length > 0) {
            await uploadAvatar(result.assets[0].uri, result.assets[0].base64);
          }
        },
      },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  if (loading) {
    return (
      <View style={{ alignItems: 'center', paddingVertical: 40 }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 12, color: COLORS.textMuted }}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <Text style={S.formTitle}>Mon profil - Médecin</Text>
        <SavedBadge visible={saved} />
      </View>
      <Text style={S.formSub}>Informations professionnelles et personnelles.</Text>

      {/* Avatar cliquable — upload vers BDD (identique admin) */}
      <TouchableOpacity onPress={handlePickAvatar} activeOpacity={0.85} style={{ alignItems: 'center', marginBottom: 20 }}>
        <View style={{ width: 90, height: 90, position: 'relative' }}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={{ width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}
          >
            {uploadingAvatar ? (
              <ActivityIndicator color="#fff" size="large" />
            ) : avatarUri ? (
              <Image source={{ uri: avatarUri }} style={{ width: 90, height: 90, borderRadius: 45 }} onError={() => setAvatarUri(null)} />
            ) : (
              <Ionicons name="medkit" size={40} color="#fff" />
            )}
          </LinearGradient>
          <View style={{
            position: 'absolute', bottom: 0, right: 0,
            width: 28, height: 28, borderRadius: 14,
            backgroundColor: COLORS.primary,
            justifyContent: 'center', alignItems: 'center',
            borderWidth: 2, borderColor: '#fff',
          }}>
            <Feather name="camera" size={13} color="#fff" />
          </View>
        </View>
        <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.primary, marginTop: 8 }}>
          Dr. {form.prenom} {form.nom}
        </Text>
        <Text style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>
          Appuyer pour modifier la photo
        </Text>
      </TouchableOpacity>

      {/* Badge rôle */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primaryLight, borderRadius: 10, padding: 10, marginBottom: 16 }}>
        <Feather name="heart" size={14} color={COLORS.primary} />
        <Text style={{ fontSize: 12, color: COLORS.primary, fontWeight: '700', flex: 1 }}>
          Médecin · SafeKids
        </Text>
        <View style={{ backgroundColor: '#D1FAE5', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
          <Text style={{ fontSize: 10, color: '#059669', fontWeight: '700' }}>Certifié</Text>
        </View>
      </View>

      <Text style={S.formSectionTitle}>Informations personnelles</Text>
      
      <View style={S.formRow}>
        <View style={S.formField}>
          <Text style={S.formLabel}>Prénom</Text>
          <TextInput
            style={[S.formInput, errors.prenom && { borderColor: COLORS.error, borderWidth: 1.5 }]}
            value={form.prenom}
            onChangeText={v => update('prenom', v)}
            placeholderTextColor={COLORS.textMuted}
          />
          {errors.prenom && <Text style={{ fontSize: 10, color: COLORS.error, marginTop: 2 }}>{errors.prenom}</Text>}
        </View>
        <View style={S.formField}>
          <Text style={S.formLabel}>Nom</Text>
          <TextInput
            style={[S.formInput, errors.nom && { borderColor: COLORS.error, borderWidth: 1.5 }]}
            value={form.nom}
            onChangeText={v => update('nom', v)}
            placeholderTextColor={COLORS.textMuted}
          />
          {errors.nom && <Text style={{ fontSize: 10, color: COLORS.error, marginTop: 2 }}>{errors.nom}</Text>}
        </View>
      </View>

      <View style={S.formRow}>
        <View style={S.formField}>
          <Text style={S.formLabel}>Email</Text>
          <View style={{ position: 'relative' }}>
            <TextInput
              style={[S.formInput, { backgroundColor: '#F8FAFC', color: COLORS.textMuted }]}
              value={form.email}
              editable={false}
              placeholderTextColor={COLORS.textMuted}
            />
            <View style={{ position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' }}>
              <Feather name="lock" size={13} color="#D97706" />
            </View>
          </View>
        </View>
        <View style={S.formField}>
          <Text style={S.formLabel}>Téléphone</Text>
          <TextInput
            style={S.formInput}
            value={form.phone}
            onChangeText={v => update('phone', v)}
            keyboardType="phone-pad"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>
      </View>

      <View style={S.formRow}>
        <View style={S.formField}>
          <Text style={S.formLabel}>Ville</Text>
          <TextInput
            style={S.formInput}
            value={form.ville}
            onChangeText={v => update('ville', v)}
            placeholderTextColor={COLORS.textMuted}
          />
        </View>
        <View style={S.formField}>
          <Text style={S.formLabel}>Wilaya</Text>
          <TextInput
            style={S.formInput}
            value={form.wilaya}
            onChangeText={v => update('wilaya', v)}
            placeholderTextColor={COLORS.textMuted}
          />
        </View>
      </View>

      <Text style={S.formSectionTitle}>Informations professionnelles</Text>

      <View style={S.formRow}>
        <View style={S.formField}>
          <Text style={S.formLabel}>Spécialité</Text>
          <TextInput
            style={[S.formInput, errors.specialite && { borderColor: COLORS.error, borderWidth: 1.5 }]}
            value={form.specialite}
            onChangeText={v => update('specialite', v)}
            placeholder="Ex: Pédiatrie, Psychiatrie..."
            placeholderTextColor={COLORS.textMuted}
          />
          {errors.specialite && <Text style={{ fontSize: 10, color: COLORS.error, marginTop: 2 }}>{errors.specialite}</Text>}
        </View>
        <View style={S.formField}>
          <Text style={S.formLabel}>N° Ordre des médecins</Text>
          <TextInput
            style={S.formInput}
            value={form.numeroOrdre}
            onChangeText={v => update('numeroOrdre', v)}
            placeholder="Optionnel"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>
      </View>

      <TouchableOpacity
        onPress={handleSave}
        disabled={saving}
        style={{
          backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 14,
          flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
          gap: 8, marginTop: 8, opacity: saving ? 0.7 : 1,
          shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.3, shadowRadius: 12, elevation: 5,
        }}
        activeOpacity={0.85}
      >
        {saving ? <ActivityIndicator size="small" color="#fff" /> : <Feather name="save" size={16} color="#fff" />}
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>
          {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// ─── PANEL : PRÉFÉRENCES ──────────────────────────────────────────────────────
const PreferencesPanel = () => {
  const [notifPush, setNotifPush] = useState(true);
  const [language, setLanguage] = useState('fr');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEYS.preferences).then(d => {
      if (d) { const p = JSON.parse(d); if (p.notifPush !== undefined) setNotifPush(p.notifPush); if (p.language) setLanguage(p.language); }
    }).catch(() => {});
  }, []);

  const persist = async (newNotif, newLang) => {
    try {
      await AsyncStorage.setItem(KEYS.preferences, JSON.stringify({ notifPush: newNotif, language: newLang }));
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } catch {}
  };

  const LANGUAGES = [
    { code: 'fr', name: 'Français', flag: '🇫🇷', desc: 'Langue par défaut' },
    { code: 'ar', name: 'العربية', flag: '🇩🇿', desc: 'اللغة العربية' },
    { code: 'en', name: 'English', flag: '🇺🇸', desc: 'English language' },
  ];

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <Text style={S.formTitle}>Préférences</Text>
        <SavedBadge visible={saved} />
      </View>
      <Text style={S.formSub}>Personnalisez votre expérience médicale.</Text>

      <View style={[S.toggleRow, S.toggleRowLast]}>
        <View style={[S.securityIcon, { backgroundColor: notifPush ? COLORS.successBg : '#F1F5F9', marginRight: 12 }]}>
          <Feather name="bell" size={16} color={notifPush ? COLORS.success : COLORS.textMuted} />
        </View>
        <View style={S.toggleInfo}>
          <Text style={S.toggleLabel}>Notifications push</Text>
          <Text style={S.toggleSub}>Alertes importantes en direct</Text>
        </View>
        <Switch
          value={notifPush}
          onValueChange={() => { const v = !notifPush; setNotifPush(v); persist(v, language); }}
          trackColor={{ false: '#E2E8F0', true: COLORS.successBg }}
          thumbColor={notifPush ? COLORS.success : '#fff'}
        />
      </View>

      <Text style={[S.formSectionTitle, { marginTop: 20 }]}>Langue de l'application</Text>
      {LANGUAGES.map((lang, i) => {
        const isActive = language === lang.code;
        return (
          <TouchableOpacity
            key={lang.code}
            onPress={() => { setLanguage(lang.code); persist(notifPush, lang.code); }}
            activeOpacity={0.75}
            style={[S.securityRow, i === LANGUAGES.length - 1 && S.securityRowLast, isActive && { backgroundColor: COLORS.primaryLight, borderRadius: 10 }]}
          >
            <View style={[S.securityIcon, { backgroundColor: '#F1F5F9' }]}>
              <Text style={{ fontSize: 18 }}>{lang.flag}</Text>
            </View>
            <View style={S.securityContent}>
              <Text style={[S.securityLabel, isActive && { color: COLORS.primary, fontWeight: '700' }]}>{lang.name}</Text>
              <Text style={S.securityValue}>{lang.desc}</Text>
            </View>
            <Feather name={isActive ? 'check-circle' : 'circle'} size={18} color={isActive ? COLORS.primary : COLORS.textMuted} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// ─── PANEL : NOTIFICATIONS ────────────────────────────────────────────────────
const NotificationsPanel = () => {
  const [notifs, setNotifs] = useState({
    nouveauxPatients: true,
    consultations: true,
    rappels: true,
    messages: true,
    urgences: true,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEYS.notifications).then(d => { if (d) setNotifs(JSON.parse(d)); }).catch(() => {});
  }, []);

  const saveNotifs = async (updated) => {
    setNotifs(updated);
    try { await AsyncStorage.setItem(KEYS.notifications, JSON.stringify(updated)); setSaved(true); setTimeout(() => setSaved(false), 2000); } catch {}
  };

  const ITEMS = [
    { key: 'nouveauxPatients', label: 'Nouveaux patients', sub: 'Assignations de patients', icon: 'user-plus' },
    { key: 'consultations', label: 'Consultations', sub: 'Rendez-vous et suivis', icon: 'calendar' },
    { key: 'rappels', label: 'Rappels', sub: 'Traitements et examens', icon: 'clock' },
    { key: 'messages', label: 'Messages', sub: "Messages des parents et patients", icon: 'message-circle' },
    { key: 'urgences', label: 'Alertes urgentes', sub: 'Notifications critiques', icon: 'alert-triangle' },
  ];

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <Text style={S.formTitle}>Notifications</Text>
        <SavedBadge visible={saved} />
      </View>
      <Text style={S.formSub}>Configurez vos notifications médicales.</Text>
      
      {ITEMS.map((item, i) => (
        <View key={item.key} style={[S.toggleRow, i === ITEMS.length - 1 && S.toggleRowLast]}>
          <View style={[S.securityIcon, { backgroundColor: notifs[item.key] ? COLORS.primaryLight : '#F1F5F9', marginRight: 12 }]}>
            <Feather name={item.icon} size={14} color={notifs[item.key] ? COLORS.primary : COLORS.textMuted} />
          </View>
          <View style={S.toggleInfo}>
            <Text style={[S.toggleLabel, !notifs[item.key] && { color: COLORS.textMuted }]}>{item.label}</Text>
            <Text style={S.toggleSub}>{item.sub}</Text>
          </View>
          <Switch value={notifs[item.key]} onValueChange={() => saveNotifs({ ...notifs, [item.key]: !notifs[item.key] })} trackColor={{ false: '#E2E8F0', true: COLORS.primaryGlow }} thumbColor={notifs[item.key] ? COLORS.primary : '#fff'} />
        </View>
      ))}
    </View>
  );
};

// ─── PANEL : SÉCURITÉ ─────────────────────────────────────────────────────────
const SecurityPanel = () => {
  const [showPwModal, setShowPwModal] = useState(false);
  const [twoFA, setTwoFA] = useState(false);
  const [biometrics, setBiometrics] = useState(false);
  const [bioAvailable, setBioAvailable] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, newPass: false, confirm: false });
  const [pwErrors, setPwErrors] = useState({});
  const [pwSaving, setPwSaving] = useState(false);
  const [pwStrength, setPwStrength] = useState(0);

  useEffect(() => {
    LocalAuthentication.hasHardwareAsync().then(has => {
      if (has) LocalAuthentication.isEnrolledAsync().then(e => setBioAvailable(e));
    });
    AsyncStorage.getItem(KEYS.security).then(d => {
      if (d) { const s = JSON.parse(d); setTwoFA(s.twoFA || false); setBiometrics(s.biometrics || false); }
    }).catch(() => {});
  }, []);

  const saveSecurity = async (updates) => {
    const current = { twoFA, biometrics, ...updates };
    await AsyncStorage.setItem(KEYS.security, JSON.stringify(current));
  };

  const checkStrength = (pw) => {
    let s = 0;
    if (pw.length >= 8) s++; if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++; if (/[^A-Za-z0-9]/.test(pw)) s++;
    setPwStrength(s);
  };

  const handlePwChange = async () => {
    const e = {};
    if (!passwords.current) e.current = 'Requis';
    if (passwords.newPass.length < 8) e.newPass = 'Minimum 8 caractères';
    if (passwords.newPass !== passwords.confirm) e.confirm = 'Les mots de passe ne correspondent pas';
    setPwErrors(e);
    if (Object.keys(e).length > 0) return;

    setPwSaving(true);
    try {
      const data = await apiPut('/change-password', {
        ancienMotDePasse: passwords.current,
        nouveauMotDePasse: passwords.newPass,
      });
      if (data.message && !data.success) { Alert.alert('Erreur', data.message); return; }
      setShowPwModal(false);
      setPasswords({ current: '', newPass: '', confirm: '' });
      Alert.alert('✅ Succès', 'Mot de passe modifié avec succès.');
    } catch { Alert.alert('Erreur', 'Impossible de contacter le serveur.'); }
    finally { setPwSaving(false); }
  };

  const strengthColors = ['#EF4444', '#F59E0B', '#F59E0B', '#10B981', '#10B981'];
  const strengthLabels = ['', 'Faible', 'Moyen', 'Bon', 'Fort'];
  const PW_FIELDS = [{ key: 'current', label: 'Mot de passe actuel' }, { key: 'newPass', label: 'Nouveau mot de passe' }, { key: 'confirm', label: 'Confirmer' }];

  return (
    <View>
      <Text style={S.formTitle}>Sécurité</Text>
      <Text style={S.formSub}>Protégez votre compte médical.</Text>

      <TouchableOpacity style={S.securityRow} onPress={() => setShowPwModal(true)} activeOpacity={0.75}>
        <View style={[S.securityIcon, { backgroundColor: COLORS.primaryLight }]}><Feather name="lock" size={16} color={COLORS.primary} /></View>
        <View style={S.securityContent}><Text style={S.securityLabel}>Mot de passe</Text><Text style={S.securityValue}>Appuyez pour modifier</Text></View>
        <Feather name="chevron-right" size={16} color={COLORS.textMuted} />
      </TouchableOpacity>

      <View style={S.securityRow}>
        <View style={[S.securityIcon, { backgroundColor: twoFA ? COLORS.successBg : '#FEF3C7' }]}><Feather name="smartphone" size={16} color={twoFA ? COLORS.success : '#F59E0B'} /></View>
        <View style={S.securityContent}>
          <Text style={S.securityLabel}>Double authentification (2FA)</Text>
          <Text style={[S.securityValue, { color: twoFA ? COLORS.successText : '#F59E0B' }]}>{twoFA ? '✓ Activée' : 'Non activée — recommandé'}</Text>
        </View>
        <Switch value={twoFA} onValueChange={() => { const v = !twoFA; setTwoFA(v); saveSecurity({ twoFA: v }); }} trackColor={{ false: '#E2E8F0', true: COLORS.successBg }} thumbColor={twoFA ? COLORS.success : '#fff'} />
      </View>

      <View style={[S.securityRow, S.securityRowLast]}>
        <View style={[S.securityIcon, { backgroundColor: biometrics ? COLORS.primaryLight : '#F1F5F9' }]}><Feather name="eye" size={16} color={biometrics ? COLORS.primary : COLORS.textMuted} /></View>
        <View style={S.securityContent}>
          <Text style={S.securityLabel}>Face ID / Empreinte digitale</Text>
          <Text style={[S.securityValue, { color: !bioAvailable ? COLORS.textMuted : biometrics ? COLORS.primary : COLORS.textMuted }]}>
            {!bioAvailable ? 'Non disponible' : biometrics ? '✓ Activé' : 'Non activé'}
          </Text>
        </View>
        <Switch value={biometrics} disabled={!bioAvailable} onValueChange={async () => {
          if (!biometrics) {
            const r = await LocalAuthentication.authenticateAsync({ promptMessage: 'Activez la biométrie' });
            if (r.success) { setBiometrics(true); saveSecurity({ biometrics: true }); }
          } else { setBiometrics(false); saveSecurity({ biometrics: false }); }
        }} trackColor={{ false: '#E2E8F0', true: COLORS.primaryGlow }} thumbColor={biometrics ? COLORS.primary : '#fff'} />
      </View>

      <Modal visible={showPwModal} transparent animationType="slide" onRequestClose={() => setShowPwModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: Platform.OS === 'ios' ? 42 : 28 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0', alignSelf: 'center', marginBottom: 20 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 17, fontWeight: '800', color: '#1E293B' }}>Changer le mot de passe</Text>
              <TouchableOpacity onPress={() => { setShowPwModal(false); setPasswords({ current: '', newPass: '', confirm: '' }); setPwErrors({}); setPwStrength(0); }}>
                <Feather name="x" size={22} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
            {PW_FIELDS.map(({ key, label }) => (
              <View key={key} style={{ marginBottom: 12 }}>
                <Text style={S.formLabel}>{label}</Text>
                <View style={{ position: 'relative' }}>
                  <TextInput style={[S.formInput, pwErrors[key] && { borderColor: COLORS.error, borderWidth: 1.5 }, { paddingRight: 44 }]} value={passwords[key]} onChangeText={v => { setPasswords(p => ({ ...p, [key]: v })); setPwErrors(p => ({ ...p, [key]: null })); if (key === 'newPass') checkStrength(v); }} secureTextEntry={!showPw[key]} placeholder="••••••••" placeholderTextColor={COLORS.textMuted} autoCapitalize="none" />
                  <TouchableOpacity onPress={() => setShowPw(p => ({ ...p, [key]: !p[key] }))} style={{ position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' }}>
                    <Feather name={showPw[key] ? 'eye-off' : 'eye'} size={16} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>
                {pwErrors[key] && <Text style={{ fontSize: 11, color: COLORS.error, marginTop: 2 }}>{pwErrors[key]}</Text>}
                {key === 'newPass' && passwords.newPass.length > 0 && (
                  <View style={{ marginTop: 6 }}>
                    <View style={{ flexDirection: 'row', gap: 4, marginBottom: 4 }}>
                      {[1,2,3,4].map(i => <View key={i} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: i <= pwStrength ? strengthColors[pwStrength] : '#E2E8F0' }} />)}
                    </View>
                    <Text style={{ fontSize: 10, color: strengthColors[pwStrength] || COLORS.textMuted, fontWeight: '600' }}>{strengthLabels[pwStrength]}</Text>
                  </View>
                )}
              </View>
            ))}
            <TouchableOpacity onPress={handlePwChange} disabled={pwSaving} style={{ backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4, opacity: pwSaving ? 0.7 : 1 }} activeOpacity={0.85}>
              {pwSaving ? <ActivityIndicator size="small" color="#fff" /> : <Feather name="check" size={16} color="#fff" />}
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>{pwSaving ? 'Modification...' : 'Confirmer le changement'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ─── PANEL : COMPTE ───────────────────────────────────────────────────────────
const AccountPanel = ({ onLogout, onDeleteAccount }) => {
  const [profile, setProfile] = useState({ prenom: '', nom: '', email: '', specialite: '', ville: '' });
  const [avatarUri, setAvatarUri] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiGet('/profile');
        setProfile({
          prenom: data.prenom || '',
          nom: data.nom || '',
          email: data.email || '',
          specialite: data.specialite || '',
          ville: data.ville || '',
        });
        const cached = await AsyncStorage.getItem('medecinCachedAvatarUri');
        if (cached) {
          setAvatarUri(cached);
        } else if (data.avatar) {
          const uri = `${SERVER_URL}${data.avatar}?t=${Date.now()}`;
          setAvatarUri(uri);
          await AsyncStorage.setItem('medecinCachedAvatarUri', uri);
        }
      } catch {
        const cached = await AsyncStorage.getItem('medecinCachedAvatarUri');
        if (cached) setAvatarUri(cached);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <View style={{ alignItems: 'center', paddingVertical: 40 }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View>
      <Text style={S.formTitle}>Compte</Text>
      <Text style={S.formSub}>Gérez votre compte médical.</Text>

      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, overflow: 'hidden' }}>
          <LinearGradient colors={['#667eea', '#764ba2']} style={{ width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' }}>
            {avatarUri
              ? <Image source={{ uri: avatarUri }} style={{ width: 80, height: 80, borderRadius: 40 }} onError={() => setAvatarUri(null)} />
              : <Ionicons name="medkit" size={36} color="#fff" />
            }
          </LinearGradient>
        </View>
        <Text style={{ fontSize: 16, fontWeight: '800', color: '#1E293B', marginTop: 12, letterSpacing: -0.3 }}>
          Dr. {profile.prenom} {profile.nom}
        </Text>
        <Text style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 3 }}>{profile.email}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, backgroundColor: COLORS.primaryLight, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 }}>
          <Feather name="heart" size={12} color={COLORS.primary} />
          <Text style={{ fontSize: 11, color: COLORS.primary, fontWeight: '600' }}>
            {profile.specialite || 'Médecin généraliste'} {profile.ville ? `· ${profile.ville}` : ''}
          </Text>
        </View>
      </View>

      {[
        { label: 'Contacter le support', sub: 'support@safekids.app', icon: 'mail', bg: '#EDE9FE', color: COLORS.primary, onPress: () => Linking.openURL('mailto:support@safekids.app') },
        { label: "Centre d'aide médical", sub: 'Guides et protocoles', icon: 'help-circle', bg: '#F1F5F9', color: COLORS.textLight, onPress: () => Linking.openURL('https://safekids.app/medecin/aide') },
      ].map((item, i, arr) => (
        <TouchableOpacity key={i} style={[S.securityRow, i === arr.length - 1 && S.securityRowLast]} onPress={item.onPress} activeOpacity={0.75}>
          <View style={[S.securityIcon, { backgroundColor: item.bg }]}><Feather name={item.icon} size={16} color={item.color} /></View>
          <View style={S.securityContent}><Text style={S.securityLabel}>{item.label}</Text><Text style={S.securityValue}>{item.sub}</Text></View>
          <Feather name="chevron-right" size={16} color={COLORS.textMuted} />
        </TouchableOpacity>
      ))}

      <View style={S.dangerZone}>
        <Text style={S.dangerTitle}>⚠ Zone critique</Text>
        <TouchableOpacity onPress={onLogout} style={S.dangerRow} activeOpacity={0.75}>
          <View style={S.dangerIcon}><Feather name="log-out" size={16} color={COLORS.error} /></View>
          <Text style={S.dangerLabel}>Se déconnecter</Text>
          <Feather name="chevron-right" size={16} color={COLORS.error} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDeleteAccount} style={[S.dangerRow, S.dangerRowLast]} activeOpacity={0.75}>
          <View style={S.dangerIcon}><Feather name="trash-2" size={16} color={COLORS.error} /></View>
          <Text style={S.dangerLabel}>Supprimer le compte</Text>
          <Feather name="chevron-right" size={16} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── PANEL : CABINET ─────────────────────────────────────────────────────
const PracticePanel = () => {
  const [practice, setPractice] = useState({
    nomCabinet: '',
    adresse: '',
    ville: '',
    telephoneCabinet: '',
    emailCabinet: '',
    horaires: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiGet('/medecin/practice');
        setPractice({
          nomCabinet: data.nomCabinet || '',
          adresse: data.adresse || '',
          ville: data.ville || '',
          telephoneCabinet: data.telephoneCabinet || '',
          emailCabinet: data.emailCabinet || '',
          horaires: data.horaires || '',
        });
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiPut('/medecin/practice', practice);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      Alert.alert('Succès', 'Informations du cabinet sauvegardées');
    } catch {
      Alert.alert('Erreur', 'Impossible de sauvegarder.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={{ alignItems: 'center', paddingVertical: 40 }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <Text style={S.formTitle}>Mon Cabinet</Text>
        <SavedBadge visible={saved} />
      </View>
      <Text style={S.formSub}>Informations de votre cabinet médical.</Text>

      <View style={S.formField}>
        <Text style={S.formLabel}>Nom du cabinet</Text>
        <TextInput
          style={S.formInput}
          value={practice.nomCabinet}
          onChangeText={v => setPractice(p => ({ ...p, nomCabinet: v }))}
          placeholderTextColor={COLORS.textMuted}
        />
      </View>

      <View style={S.formField}>
        <Text style={S.formLabel}>Adresse</Text>
        <TextInput
          style={S.formInput}
          value={practice.adresse}
          onChangeText={v => setPractice(p => ({ ...p, adresse: v }))}
          placeholderTextColor={COLORS.textMuted}
          multiline
        />
      </View>

      <View style={S.formRow}>
        <View style={S.formField}>
          <Text style={S.formLabel}>Ville</Text>
          <TextInput
            style={S.formInput}
            value={practice.ville}
            onChangeText={v => setPractice(p => ({ ...p, ville: v }))}
            placeholderTextColor={COLORS.textMuted}
          />
        </View>
        <View style={S.formField}>
          <Text style={S.formLabel}>Téléphone</Text>
          <TextInput
            style={S.formInput}
            value={practice.telephoneCabinet}
            onChangeText={v => setPractice(p => ({ ...p, telephoneCabinet: v }))}
            keyboardType="phone-pad"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>
      </View>

      <View style={S.formField}>
        <Text style={S.formLabel}>Email professionnel</Text>
        <TextInput
          style={S.formInput}
          value={practice.emailCabinet}
          onChangeText={v => setPractice(p => ({ ...p, emailCabinet: v }))}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={COLORS.textMuted}
        />
      </View>

      <View style={S.formField}>
        <Text style={S.formLabel}>Horaires d'ouverture</Text>
        <TextInput
          style={[S.formInput, { minHeight: 80 }]}
          value={practice.horaires}
          onChangeText={v => setPractice(p => ({ ...p, horaires: v }))}
          placeholderTextColor={COLORS.textMuted}
          multiline
          placeholder="Lun-Ven: 9h-18h\nSam: 9h-12h"
        />
      </View>

      <TouchableOpacity
        onPress={handleSave}
        disabled={saving}
        style={{
          backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 14,
          flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
          gap: 8, marginTop: 8, opacity: saving ? 0.7 : 1,
          shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.3, shadowRadius: 12, elevation: 5,
        }}
        activeOpacity={0.85}
      >
        {saving ? <ActivityIndicator size="small" color="#fff" /> : <Feather name="save" size={16} color="#fff" />}
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>
          {saving ? 'Sauvegarde...' : 'Sauvegarder les informations'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// ─── PANEL : PATIENTS ────────────────────────────────────────────────────
const PatientsPanel = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const data = await apiGet('/medecin/patients');
        setPatients(data.patients || []);
      } catch {
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };
    loadPatients();
  }, []);

  const filteredPatients = patients.filter(patient =>
    patient.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.parentName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={{ alignItems: 'center', paddingVertical: 40 }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View>
      <Text style={S.formTitle}>Mes Patients</Text>
      <Text style={S.formSub}>Suivez vos patients assignés.</Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12, paddingHorizontal: 12, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border }}>
        <Feather name="search" size={18} color={COLORS.textMuted} />
        <TextInput
          style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 8, fontSize: 14 }}
          placeholder="Rechercher un patient..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {filteredPatients.map((patient, index) => (
        <TouchableOpacity
          key={patient.id || index}
          style={[S.userCard, index === filteredPatients.length - 1 && { marginBottom: 0 }]}
          onPress={() => Alert.alert('Détails patient', `Fonctionnalité à venir pour ${patient.name}`)}
        >
          <View style={S.userCardAvatar}>
            <LinearGradient colors={['#667eea', '#764ba2']} style={{ width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>{patient.name?.charAt(0) || '?'}</Text>
            </LinearGradient>
          </View>
          <View style={S.userCardInfo}>
            <Text style={S.userCardName}>{patient.name || 'Patient'}</Text>
            <Text style={S.userCardEmail}>Parent: {patient.parentName || 'Non spécifié'}</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
              {patient.age && (
                <View style={S.userCardBadge}>
                  <Text style={S.userCardBadgeText}>{patient.age} ans</Text>
                </View>
              )}
              {patient.lastVisit && (
                <View style={[S.userCardBadge, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={[S.userCardBadgeText, { color: '#F59E0B' }]}>Dernière visite: {patient.lastVisit}</Text>
                </View>
              )}
            </View>
          </View>
          <Feather name="chevron-right" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
      ))}

      {filteredPatients.length === 0 && (
        <View style={{ alignItems: 'center', paddingVertical: 40 }}>
          <Feather name="users" size={48} color={COLORS.textMuted} />
          <Text style={{ marginTop: 12, color: COLORS.textMuted }}>Aucun patient assigné</Text>
        </View>
      )}
    </View>
  );
};

// ─── ÉCRAN PRINCIPAL MÉDECIN ──────────────────────────────────────────────────
export default function MedecinSettingsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('general');
  const tabScrollRef = useRef(null);

  
const handleLogout = useCallback(() => {
    const doLogout = async () => {
      await AsyncStorage.multiRemove([
        'userToken', 'cachedAvatarUri',
        KEYS.preferences, KEYS.notifications, KEYS.security,
      ]);
      if (Platform.OS === 'web') {
        window.location.href = '/';
      } else {
        navigation?.reset({ index: 0, routes: [{ name: 'Login' }] });
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Voulez-vous vraiment vous déconnecter ?')) {
        doLogout();
      }
    } else {
      Alert.alert('Se déconnecter', 'Voulez-vous vraiment vous déconnecter ?', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnexion', style: 'destructive', onPress: doLogout },
      ]);
    }
  }, [navigation]);

  const handleDeleteAccount = useCallback(() => {
    const doDelete = async () => {
      await AsyncStorage.multiRemove([
        'userToken', 'medecinCachedAvatarUri',
        KEYS.preferences, KEYS.notifications, KEYS.security,
      ]);
      if (Platform.OS === 'web') {
        window.location.href = '/';
      } else {
        navigation?.reset({ index: 0, routes: [{ name: 'MedecinLogin' }] });
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Supprimer définitivement votre compte ? Cette action est irréversible.')) {
        doDelete();
      }
    } else {
      Alert.alert('Supprimer le compte', 'Cette action est irréversible.', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: doDelete },
      ]);
    }
  }, [navigation]);

  const renderPanel = () => {
    switch (activeTab) {
      case 'general': return <GeneralPanel />;
      case 'preferences': return <PreferencesPanel />;
      case 'security': return <SecurityPanel />;
      case 'notifications': return <NotificationsPanel />;
      case 'account': return <AccountPanel onLogout={handleLogout} onDeleteAccount={handleDeleteAccount} />;
      case 'practice': return <PracticePanel />;
      case 'patients': return <PatientsPanel />;
      default: return <GeneralPanel />;
    }
  };

  return (
    <MedecinLayout activeTab="settings">
      <View style={S.container}>
        <StatusBar barStyle="light-content" />

        <LinearGradient colors={['#667eea', '#764ba2']} style={S.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={S.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Feather name="arrow-left" size={18} color="#fff" />
          </TouchableOpacity>
          <View style={S.headerTitleWrap}>
            <Text style={S.headerTitle}>Paramètres Médecin</Text>
            <Text style={S.headerSub}>Gestion de votre pratique médicale</Text>
          </View>
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 110 }}>
          <View style={IS_TABLET ? S.contentRow : { flex: 1 }}>
            <View style={!IS_TABLET ? { paddingVertical: 6 } : null}>
              <ScrollView ref={tabScrollRef} horizontal={!IS_TABLET} showsHorizontalScrollIndicator={false} contentContainerStyle={!IS_TABLET ? S.settingsNavScroll : S.settingsNav}>
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <TouchableOpacity key={tab.id} onPress={() => setActiveTab(tab.id)} activeOpacity={0.75} style={[S.settingsNavItem, isActive && S.settingsNavItemActive]}>
                      <Feather name={tab.icon} size={IS_TABLET ? 17 : 15} color={isActive ? COLORS.primary : COLORS.textMuted} />
                      <Text style={[S.settingsNavLabel, isActive && S.settingsNavLabelActive]}>{tab.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
            <View style={[S.formPanel, { paddingBottom: 20 }]}>
              {renderPanel()}
              <Text style={S.version}>SafeKids Médecin v2.1.0 · © 2026</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </MedecinLayout>
  );
}