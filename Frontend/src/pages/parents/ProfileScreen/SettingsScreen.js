// src/pages/parents/SettingsScreen/SettingsScreen.js
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Switch, StatusBar, Alert, ActivityIndicator, Modal, Linking, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as LocalAuthentication from 'expo-local-authentication';

import ParentLayout from '../../../components/Navigation/ParentNavigation';
import S, { COLORS, IS_TABLET } from '../ProfileScreen/ProfileStyles';

// ─── CLÉS ─────────────────────────────────────────────────────────────────────
const KEYS = {
  profile:       'userProfile',
  preferences:   'userPreferences',
  notifications: 'userNotifications',
};

// ─── ONGLETS ──────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'general',       icon: 'user',        label: 'Profil'        },
  { id: 'preferences',   icon: 'sliders',     label: 'Préférences'   },
  { id: 'security',      icon: 'shield',      label: 'Sécurité'      },
  { id: 'notifications', icon: 'bell',        label: 'Notifications' },
  { id: 'account',       icon: 'settings',    label: 'Compte'        },
  { id: 'billing',       icon: 'credit-card', label: 'Abonnement'    },
];

// ─── Badge sauvegardé ─────────────────────────────────────────────────────────
const SavedBadge = ({ visible }) => {
  if (!visible) return null;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4,
      backgroundColor: COLORS.successBg, paddingHorizontal: 10,
      paddingVertical: 4, borderRadius: 20 }}>
      <Feather name="check" size={12} color={COLORS.success} />
      <Text style={{ fontSize: 11, color: COLORS.successText, fontWeight: '600' }}>Sauvegardé</Text>
    </View>
  );
};

// ─── PANEL : PROFIL ───────────────────────────────────────────────────────────
const GeneralPanel = () => {
  const [form,   setForm]   = useState({ prenom: 'Sara', nom: 'Bensalem', email: 'sara.bensalem@email.com', phone: '+213 555 123 456', ville: 'Alger', wilaya: 'Alger', avatar: null });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    AsyncStorage.getItem(KEYS.profile)
      .then(d => { if (d) setForm(prev => ({ ...prev, ...JSON.parse(d) })); })
      .catch(() => {});
  }, []);

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: null }));
    setSaved(false);
  };

  const validate = () => {
    const e = {};
    if (!form.prenom.trim()) e.prenom = 'Requis';
    if (!form.nom.trim())    e.nom    = 'Requis';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email invalide';
    if (form.phone.trim().length < 8) e.phone = 'Numéro invalide';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const existing = await AsyncStorage.getItem(KEYS.profile);
      const merged = { ...(existing ? JSON.parse(existing) : {}), ...form };
      await AsyncStorage.setItem(KEYS.profile, JSON.stringify(merged));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      Alert.alert('Erreur', 'Impossible de sauvegarder. Réessayez.');
    } finally {
      setSaving(false);
    }
  };

  // Sélection photo (même logique que ProfileScreen)
  const handlePickAvatar = () => {
    Alert.alert('Photo de profil', 'Choisissez une option', [
      {
        text: 'Prendre une photo',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') { Alert.alert('Permission refusée', "L'accès à la caméra est nécessaire."); return; }
          const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
          if (!result.canceled) {
            const uri = result.assets[0].uri;
            const updated = { ...form, avatar: uri };
            setForm(updated);
            await AsyncStorage.setItem(KEYS.profile, JSON.stringify(updated));
          }
        },
      },
      {
        text: 'Choisir depuis la galerie',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') { Alert.alert('Permission refusée', "L'accès à la galerie est nécessaire."); return; }
          const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
          if (!result.canceled) {
            const uri = result.assets[0].uri;
            const updated = { ...form, avatar: uri };
            setForm(updated);
            await AsyncStorage.setItem(KEYS.profile, JSON.stringify(updated));
          }
        },
      },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  const FIELDS = [
    [{ field: 'prenom', label: 'Prénom',    keyboard: 'default'       }, { field: 'nom',   label: 'Nom',       keyboard: 'default'    }],
    [{ field: 'email',  label: 'Email',     keyboard: 'email-address'  }, { field: 'phone', label: 'Téléphone', keyboard: 'phone-pad'  }],
    [{ field: 'ville',  label: 'Ville',     keyboard: 'default'        }, { field: 'wilaya',label: 'Wilaya',    keyboard: 'default'    }],
  ];

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <Text style={S.formTitle}>Mon profil</Text>
        <SavedBadge visible={saved} />
      </View>
      <Text style={S.formSub}>Modifiez vos informations personnelles.</Text>

      {/* Avatar cliquable */}
      <TouchableOpacity onPress={handlePickAvatar} activeOpacity={0.85} style={{ alignItems: 'center', marginBottom: 20 }}>
        <View style={{ width: 80, height: 80, position: 'relative' }}>
          <LinearGradient colors={['#667eea', '#764ba2']} style={{ width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' }}>
            {form.avatar ? (
              <Image source={{ uri: form.avatar }} style={{ width: 80, height: 80, borderRadius: 40 }} />
            ) : (
              <Ionicons name="person" size={36} color="#fff" />
            )}
          </LinearGradient>
          <View style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13,
            backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
            borderWidth: 2, borderColor: '#fff' }}>
            <Feather name="camera" size={13} color="#fff" />
          </View>
        </View>
        <Text style={{ fontSize: 12, color: COLORS.primary, fontWeight: '600', marginTop: 8 }}>
          {form.prenom} {form.nom}
        </Text>
        <Text style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>Appuyer pour modifier la photo</Text>
      </TouchableOpacity>

      <Text style={S.formSectionTitle}>Coordonnées</Text>
      {FIELDS.map((row, ri) => (
        <View key={ri} style={S.formRow}>
          {row.map(({ field, label, keyboard }) => (
            <View key={field} style={S.formField}>
              <Text style={S.formLabel}>{label}</Text>
              <TextInput
                style={[S.formInput, errors[field] && { borderColor: COLORS.error, borderWidth: 1 }]}
                value={form[field]}
                onChangeText={v => update(field, v)}
                keyboardType={keyboard}
                autoCapitalize={keyboard === 'email-address' ? 'none' : 'words'}
                returnKeyType="done"
                placeholderTextColor={COLORS.textMuted}
              />
              {errors[field] && <Text style={{ fontSize: 10, color: COLORS.error, marginTop: 2 }}>{errors[field]}</Text>}
            </View>
          ))}
        </View>
      ))}

      <TouchableOpacity
        onPress={handleSave} disabled={saving}
        style={{ backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 13,
          flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
          gap: 8, marginTop: 8, opacity: saving ? 0.7 : 1 }}
        activeOpacity={0.85}
      >
        {saving ? <ActivityIndicator size="small" color="#fff" /> : <Feather name="save" size={16} color="#fff" />}
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// ─── PANEL : PRÉFÉRENCES (sans mode sombre) ───────────────────────────────────
const PreferencesPanel = () => {
  const [notifPush, setNotifPush] = useState(true);
  const [language,  setLanguage]  = useState('fr');
  const [saved,     setSaved]     = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEYS.preferences).then(d => {
      if (d) {
        const p = JSON.parse(d);
        if (p.notifPush !== undefined) setNotifPush(p.notifPush);
        if (p.language)  setLanguage(p.language);
      }
    }).catch(() => {});
  }, []);

  const persist = async (newNotif, newLang) => {
    try {
      await AsyncStorage.setItem(KEYS.preferences, JSON.stringify({ notifPush: newNotif, language: newLang }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {}
  };

  const toggleNotif = () => {
    const updated = !notifPush;
    setNotifPush(updated);
    persist(updated, language);
  };

  const selectLang = (code) => {
    setLanguage(code);
    persist(notifPush, code);
    const msg = { fr: 'Langue définie sur Français.', ar: 'تم تغيير اللغة إلى العربية.', en: 'Language set to English.' };
    Alert.alert('Langue modifiée', msg[code], [{ text: 'OK' }]);
  };

  const LANGUAGES = [
    { code: 'fr', name: 'Français',  flag: '🇫🇷', desc: 'Langue par défaut' },
    { code: 'ar', name: 'العربية',   flag: '🇩🇿', desc: 'اللغة العربية'    },
    { code: 'en', name: 'English',   flag: '🇺🇸', desc: 'English language'  },
  ];

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <Text style={S.formTitle}>Préférences</Text>
        <SavedBadge visible={saved} />
      </View>
      <Text style={S.formSub}>Personnalisez votre expérience.</Text>

      {/* Notifications push */}
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
          onValueChange={toggleNotif}
          trackColor={{ false: '#E2E8F0', true: COLORS.successBg }}
          thumbColor={notifPush ? COLORS.success : '#fff'}
        />
      </View>

      <Text style={[S.formSectionTitle, { marginTop: 20 }]}>Langue de l'application</Text>
      {LANGUAGES.map((lang, i) => {
        const isActive = language === lang.code;
        return (
          <TouchableOpacity key={lang.code} onPress={() => selectLang(lang.code)} activeOpacity={0.75}
            style={[S.securityRow, i === LANGUAGES.length - 1 && S.securityRowLast,
              isActive && { backgroundColor: COLORS.primaryLight, borderRadius: 10 }]}>
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
    activites: true, feedback: true, rappels: false,
    messages: true, resultats: false, urgences: true,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEYS.notifications).then(d => { if (d) setNotifs(JSON.parse(d)); }).catch(() => {});
  }, []);

  const saveNotifs = async (updated) => {
    setNotifs(updated);
    try {
      await AsyncStorage.setItem(KEYS.notifications, JSON.stringify(updated));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
  };

  const toggle   = (key) => saveNotifs({ ...notifs, [key]: !notifs[key] });
  const setAll   = (val)  => saveNotifs(Object.fromEntries(Object.keys(notifs).map(k => [k, val])));

  const ITEMS = [
    { key: 'activites', label: 'Nouvelles activités',  sub: 'Recommandations du jour',       icon: 'star'           },
    { key: 'feedback',  label: 'Feedback enfant',       sub: 'Après chaque séance',           icon: 'message-circle' },
    { key: 'rappels',   label: 'Rappels quotidiens',    sub: 'Heure programmée de la séance', icon: 'clock'          },
    { key: 'messages',  label: 'Messages',              sub: "Nouveaux messages de l'équipe", icon: 'mail'           },
    { key: 'resultats', label: 'Résultats & progrès',   sub: 'Rapports hebdomadaires',        icon: 'bar-chart-2'    },
    { key: 'urgences',  label: 'Alertes urgentes',      sub: 'Notifications critiques',       icon: 'alert-triangle' },
  ];

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <Text style={S.formTitle}>Notifications</Text>
        <SavedBadge visible={saved} />
      </View>
      <Text style={S.formSub}>Configurez vos préférences de notification.</Text>

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        <TouchableOpacity onPress={() => setAll(true)}
          style={{ flex: 1, backgroundColor: COLORS.primaryLight, borderRadius: 10, padding: 10, alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: COLORS.primary, fontWeight: '700' }}>Tout activer</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setAll(false)}
          style={{ flex: 1, backgroundColor: '#FEE2E2', borderRadius: 10, padding: 10, alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: COLORS.error, fontWeight: '700' }}>Tout désactiver</Text>
        </TouchableOpacity>
      </View>

      {ITEMS.map((item, i) => (
        <View key={item.key} style={[S.toggleRow, i === ITEMS.length - 1 && S.toggleRowLast]}>
          <View style={[S.securityIcon, { backgroundColor: notifs[item.key] ? COLORS.primaryLight : '#F1F5F9', marginRight: 12 }]}>
            <Feather name={item.icon} size={14} color={notifs[item.key] ? COLORS.primary : COLORS.textMuted} />
          </View>
          <View style={S.toggleInfo}>
            <Text style={[S.toggleLabel, !notifs[item.key] && { color: COLORS.textMuted }]}>{item.label}</Text>
            <Text style={S.toggleSub}>{item.sub}</Text>
          </View>
          <Switch
            value={notifs[item.key]}
            onValueChange={() => toggle(item.key)}
            trackColor={{ false: '#E2E8F0', true: COLORS.primaryGlow }}
            thumbColor={notifs[item.key] ? COLORS.primary : '#fff'}
          />
        </View>
      ))}
    </View>
  );
};

// ─── PANEL : SÉCURITÉ (tout fonctionnel) ──────────────────────────────────────
const SecurityPanel = () => {
  const [showPwModal,   setShowPwModal]   = useState(false);
  const [twoFA,         setTwoFA]         = useState(false);
  const [biometrics,    setBiometrics]    = useState(false);
  const [bioAvailable,  setBioAvailable]  = useState(false);
  const [passwords,     setPasswords]     = useState({ current: '', newPass: '', confirm: '' });
  const [showPw,        setShowPw]        = useState({ current: false, newPass: false, confirm: false });
  const [pwErrors,      setPwErrors]      = useState({});
  const [pwSaving,      setPwSaving]      = useState(false);
  const [pwStrength,    setPwStrength]    = useState(0); // 0-4

  // Vérifie si biométrie disponible
  useEffect(() => {
    LocalAuthentication.hasHardwareAsync().then(has => {
      if (has) LocalAuthentication.isEnrolledAsync().then(enrolled => setBioAvailable(enrolled));
    });
    AsyncStorage.getItem('security').then(d => {
      if (d) { const s = JSON.parse(d); setTwoFA(s.twoFA || false); setBiometrics(s.biometrics || false); }
    }).catch(() => {});
  }, []);

  const saveSecurity = async (newTwoFA, newBio) => {
    await AsyncStorage.setItem('security', JSON.stringify({ twoFA: newTwoFA, biometrics: newBio }));
  };

  // Force du mot de passe
  const checkStrength = (pw) => {
    let score = 0;
    if (pw.length >= 8)               score++;
    if (/[A-Z]/.test(pw))             score++;
    if (/[0-9]/.test(pw))             score++;
    if (/[^A-Za-z0-9]/.test(pw))      score++;
    setPwStrength(score);
  };

  const validatePw = () => {
    const e = {};
    if (!passwords.current)                          e.current = 'Requis';
    if (passwords.newPass.length < 6)                e.newPass = 'Minimum 6 caractères';
    if (passwords.newPass !== passwords.confirm)     e.confirm = 'Les mots de passe ne correspondent pas';
    setPwErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePwChange = async () => {
    if (!validatePw()) return;
    setPwSaving(true);
    // Simule une requête API (remplacer par votre backend)
    await new Promise(r => setTimeout(r, 1200));
    setPwSaving(false);
    setShowPwModal(false);
    setPasswords({ current: '', newPass: '', confirm: '' });
    setPwStrength(0);
    Alert.alert('✅ Mot de passe modifié', 'Votre mot de passe a été mis à jour avec succès.');
  };

  const handle2FA = () => {
    if (twoFA) {
      Alert.alert('Désactiver 2FA', 'Voulez-vous désactiver la double authentification ?', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Désactiver', style: 'destructive', onPress: () => { setTwoFA(false); saveSecurity(false, biometrics); } },
      ]);
    } else {
      Alert.alert('Activer 2FA', 'Un code SMS vous sera envoyé à chaque connexion.', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Activer', onPress: () => { setTwoFA(true); saveSecurity(true, biometrics); } },
      ]);
    }
  };

  const handleBiometrics = async () => {
    if (!bioAvailable) {
      Alert.alert('Non disponible', 'Aucune authentification biométrique configurée sur cet appareil.');
      return;
    }
    if (biometrics) {
      Alert.alert('Désactiver Face ID / Empreinte', 'Voulez-vous désactiver l\'authentification biométrique ?', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Désactiver', style: 'destructive', onPress: () => { setBiometrics(false); saveSecurity(twoFA, false); } },
      ]);
    } else {
      // Vérifie d'abord avec biométrie
      const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Authentifiez-vous pour activer cette fonctionnalité' });
      if (result.success) {
        setBiometrics(true);
        saveSecurity(twoFA, true);
        Alert.alert('✅ Activé', 'Authentification biométrique activée pour SafeKids.');
      } else {
        Alert.alert('Échec', 'Authentification biométrique échouée.');
      }
    }
  };

  const strengthColors = ['#EF4444', '#F59E0B', '#F59E0B', '#10B981', '#10B981'];
  const strengthLabels = ['', 'Faible', 'Moyen', 'Bon', 'Fort'];

  const PW_FIELDS = [
    { key: 'current', label: 'Mot de passe actuel'       },
    { key: 'newPass', label: 'Nouveau mot de passe'      },
    { key: 'confirm', label: 'Confirmer le mot de passe' },
  ];

  return (
    <View>
      <Text style={S.formTitle}>Sécurité</Text>
      <Text style={S.formSub}>Protégez votre compte SafeKids.</Text>

      {/* Mot de passe */}
      <TouchableOpacity style={S.securityRow} onPress={() => setShowPwModal(true)} activeOpacity={0.75}>
        <View style={[S.securityIcon, { backgroundColor: COLORS.primaryLight }]}>
          <Feather name="lock" size={16} color={COLORS.primary} />
        </View>
        <View style={S.securityContent}>
          <Text style={S.securityLabel}>Mot de passe</Text>
          <Text style={S.securityValue}>Modifié il y a 3 mois · Appuyez pour changer</Text>
        </View>
        <Feather name="chevron-right" size={16} color={COLORS.textMuted} />
      </TouchableOpacity>

      {/* 2FA */}
      <View style={S.securityRow}>
        <View style={[S.securityIcon, { backgroundColor: twoFA ? COLORS.successBg : '#FEF3C7' }]}>
          <Feather name="smartphone" size={16} color={twoFA ? COLORS.success : COLORS.warning} />
        </View>
        <View style={S.securityContent}>
          <Text style={S.securityLabel}>Double authentification (2FA)</Text>
          <Text style={[S.securityValue, { color: twoFA ? COLORS.successText : COLORS.warning }]}>
            {twoFA ? '✓ Activée — compte sécurisé' : 'Non activée — recommandé'}
          </Text>
        </View>
        <Switch value={twoFA} onValueChange={handle2FA}
          trackColor={{ false: '#E2E8F0', true: COLORS.successBg }}
          thumbColor={twoFA ? COLORS.success : '#fff'} />
      </View>

      {/* Biométrie */}
      <View style={S.securityRow}>
        <View style={[S.securityIcon, { backgroundColor: biometrics ? COLORS.primaryLight : '#F1F5F9' }]}>
          <Feather name="eye" size={16} color={biometrics ? COLORS.primary : COLORS.textMuted} />
        </View>
        <View style={S.securityContent}>
          <Text style={S.securityLabel}>Face ID / Empreinte digitale</Text>
          <Text style={[S.securityValue, { color: !bioAvailable ? COLORS.textMuted : biometrics ? COLORS.primary : COLORS.textMuted }]}>
            {!bioAvailable ? 'Non disponible sur cet appareil' : biometrics ? '✓ Activé' : 'Non activé'}
          </Text>
        </View>
        <Switch value={biometrics} onValueChange={handleBiometrics}
          trackColor={{ false: '#E2E8F0', true: COLORS.primaryGlow }}
          thumbColor={biometrics ? COLORS.primary : '#fff'}
          disabled={!bioAvailable} />
      </View>

      {/* Sessions actives */}
      <TouchableOpacity style={[S.securityRow, S.securityRowLast]} activeOpacity={0.75}
        onPress={() => Alert.alert('Sessions actives', '1 appareil connecté\n\nAndroid · SafeKids · Alger, DZ\nConnecté maintenant', [
          { text: 'Déconnecter tous', style: 'destructive', onPress: () => Alert.alert('Déconnecté', 'Toutes les autres sessions ont été fermées.') },
          { text: 'Fermer' },
        ])}>
        <View style={[S.securityIcon, { backgroundColor: '#D1FAE5' }]}>
          <Feather name="monitor" size={16} color={COLORS.success} />
        </View>
        <View style={S.securityContent}>
          <Text style={S.securityLabel}>Sessions actives</Text>
          <Text style={S.securityValue}>1 appareil connecté · Appuyez pour voir</Text>
        </View>
        <Feather name="chevron-right" size={16} color={COLORS.textMuted} />
      </TouchableOpacity>

      {/* Modal changement de mot de passe */}
      <Modal visible={showPwModal} transparent animationType="slide" onRequestClose={() => setShowPwModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 17, fontWeight: '800', color: COLORS.text }}>Changer le mot de passe</Text>
              <TouchableOpacity onPress={() => { setShowPwModal(false); setPasswords({ current: '', newPass: '', confirm: '' }); setPwStrength(0); setPwErrors({}); }}>
                <Feather name="x" size={22} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {PW_FIELDS.map(({ key, label }) => (
              <View key={key} style={{ marginBottom: 12 }}>
                <Text style={S.formLabel}>{label}</Text>
                <View style={{ position: 'relative' }}>
                  <TextInput
                    style={[S.formInput, pwErrors[key] && { borderColor: COLORS.error, borderWidth: 1 }, { paddingRight: 44 }]}
                    value={passwords[key]}
                    onChangeText={v => {
                      setPasswords(p => ({ ...p, [key]: v }));
                      setPwErrors(p => ({ ...p, [key]: null }));
                      if (key === 'newPass') checkStrength(v);
                    }}
                    secureTextEntry={!showPw[key]}
                    placeholder="••••••••"
                    placeholderTextColor={COLORS.textMuted}
                    returnKeyType="done"
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPw(p => ({ ...p, [key]: !p[key] }))}
                    style={{ position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' }}
                  >
                    <Feather name={showPw[key] ? 'eye-off' : 'eye'} size={16} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>
                {pwErrors[key] && <Text style={{ fontSize: 11, color: COLORS.error, marginTop: 2 }}>{pwErrors[key]}</Text>}
                {/* Indicateur de force */}
                {key === 'newPass' && passwords.newPass.length > 0 && (
                  <View style={{ marginTop: 6 }}>
                    <View style={{ flexDirection: 'row', gap: 4, marginBottom: 4 }}>
                      {[1, 2, 3, 4].map(i => (
                        <View key={i} style={{ flex: 1, height: 3, borderRadius: 2,
                          backgroundColor: i <= pwStrength ? strengthColors[pwStrength] : '#E2E8F0' }} />
                      ))}
                    </View>
                    <Text style={{ fontSize: 10, color: strengthColors[pwStrength] || COLORS.textMuted, fontWeight: '600' }}>
                      {strengthLabels[pwStrength]}
                    </Text>
                  </View>
                )}
              </View>
            ))}

            <TouchableOpacity onPress={handlePwChange} disabled={pwSaving}
              style={{ backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 14,
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                gap: 8, marginTop: 4, opacity: pwSaving ? 0.7 : 1 }}
              activeOpacity={0.85}>
              {pwSaving ? <ActivityIndicator size="small" color="#fff" /> : <Feather name="check" size={16} color="#fff" />}
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
                {pwSaving ? 'Modification...' : 'Confirmer le changement'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ─── PANEL : COMPTE ───────────────────────────────────────────────────────────
const AccountPanel = ({ onLogout, onDeleteAccount }) => {
  const [profile, setProfile] = useState({ prenom: 'Sara', nom: 'Bensalem', email: 'sara.bensalem@email.com', avatar: null, wilaya: 'Alger' });

  useEffect(() => {
    AsyncStorage.getItem(KEYS.profile).then(d => { if (d) setProfile(prev => ({ ...prev, ...JSON.parse(d) })); }).catch(() => {});
  }, []);

  return (
    <View>
      <Text style={S.formTitle}>Compte</Text>
      <Text style={S.formSub}>Gérez votre compte SafeKids.</Text>

      {/* Photo du profil (lecture seule ici, modifiable depuis "Profil") */}
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <View style={{ width: 72, height: 72, position: 'relative' }}>
          <LinearGradient colors={['#667eea', '#764ba2']} style={{ width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center' }}>
            {profile.avatar ? (
              <Image source={{ uri: profile.avatar }} style={{ width: 72, height: 72, borderRadius: 36 }} />
            ) : (
              <Ionicons name="person" size={32} color="#fff" />
            )}
          </LinearGradient>
        </View>
        <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.text, marginTop: 10 }}>{profile.prenom} {profile.nom}</Text>
        <Text style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{profile.email}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6,
          backgroundColor: COLORS.successBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
          <Feather name="check-circle" size={12} color={COLORS.success} />
          <Text style={{ fontSize: 11, color: COLORS.successText, fontWeight: '600' }}>Compte vérifié · {profile.wilaya}</Text>
        </View>
      </View>

      <TouchableOpacity style={S.securityRow} onPress={() => Linking.openURL('mailto:support@safekids.app')} activeOpacity={0.75}>
        <View style={[S.securityIcon, { backgroundColor: '#EDE9FE' }]}>
          <Feather name="mail" size={16} color={COLORS.primary} />
        </View>
        <View style={S.securityContent}>
          <Text style={S.securityLabel}>Contacter le support</Text>
          <Text style={S.securityValue}>support@safekids.app</Text>
        </View>
        <Feather name="chevron-right" size={16} color={COLORS.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity style={[S.securityRow, S.securityRowLast]} onPress={() => Linking.openURL('https://safekids.app/aide')} activeOpacity={0.75}>
        <View style={[S.securityIcon, { backgroundColor: '#F1F5F9' }]}>
          <Feather name="help-circle" size={16} color={COLORS.textLight} />
        </View>
        <View style={S.securityContent}>
          <Text style={S.securityLabel}>Centre d'aide</Text>
          <Text style={S.securityValue}>Guides & FAQ SafeKids</Text>
        </View>
        <Feather name="chevron-right" size={16} color={COLORS.textMuted} />
      </TouchableOpacity>

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

// ─── PANEL : ABONNEMENT ───────────────────────────────────────────────────────
const BillingPanel = ({ navigation }) => {
  const FEATURES = [
    { label: 'Activités illimitées',  premium: true  },
    { label: 'Rapports détaillés',    premium: true  },
    { label: 'Suivi multi-enfants',   premium: true  },
    { label: 'Support prioritaire',   premium: true  },
    { label: '3 activités par jour',  premium: false },
    { label: '1 profil enfant',       premium: false },
  ];

  return (
    <View>
      <Text style={S.formTitle}>Abonnement</Text>
      <Text style={S.formSub}>Gérez votre plan SafeKids.</Text>

      <View style={{ backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <View style={[S.securityIcon, { backgroundColor: '#FEF3C7' }]}>
            <Feather name="star" size={16} color={COLORS.warning} />
          </View>
          <View>
            <Text style={S.securityLabel}>Plan actuel</Text>
            <Text style={[S.securityValue, { color: COLORS.warning, fontWeight: '600' }]}>Gratuit</Text>
          </View>
        </View>
        {FEATURES.map((f, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Feather name={f.premium ? 'lock' : 'check'} size={13} color={f.premium ? COLORS.textMuted : COLORS.success} />
            <Text style={{ fontSize: 13, color: f.premium ? COLORS.textMuted : COLORS.text }}>{f.label}</Text>
            {f.premium && (
              <View style={{ backgroundColor: '#FEF3C7', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 }}>
                <Text style={{ fontSize: 10, color: COLORS.warning, fontWeight: '700' }}>Premium</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      <TouchableOpacity onPress={() => navigation?.navigate('Premium')} activeOpacity={0.85} style={{ borderRadius: 14, overflow: 'hidden' }}>
        <LinearGradient colors={['#7C3AED', '#4C1D95']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={{ padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <Feather name="star" size={18} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Passer à Premium</Text>
          <Feather name="arrow-right" size={18} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

// ─── ÉCRAN PRINCIPAL ──────────────────────────────────────────────────────────
export default function SettingsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('general');
  const tabScrollRef = useRef(null);

  const handleLogout = useCallback(() => {
    Alert.alert('Se déconnecter', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnexion', style: 'destructive', onPress: () => navigation?.replace('Login') },
    ]);
  }, [navigation]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert('Supprimer le compte', 'Cette action est irréversible. Toutes vos données seront définitivement supprimées.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer définitivement', style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove([KEYS.profile, KEYS.preferences, KEYS.notifications, 'security']);
          navigation?.replace('Login');
        },
      },
    ]);
  }, [navigation]);

  const renderPanel = () => {
    switch (activeTab) {
      case 'general':       return <GeneralPanel />;
      case 'preferences':   return <PreferencesPanel />;
      case 'security':      return <SecurityPanel />;
      case 'notifications': return <NotificationsPanel />;
      case 'account':       return <AccountPanel onLogout={handleLogout} onDeleteAccount={handleDeleteAccount} />;
      case 'billing':       return <BillingPanel navigation={navigation} />;
      default:              return <GeneralPanel />;
    }
  };

  return (
    <ParentLayout activeTab="settings">
      <View style={S.container}>
        <StatusBar barStyle="light-content" />

        <LinearGradient colors={['#4C1D95', '#1E1B4B']} style={S.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={S.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Feather name="arrow-left" size={18} color="#fff" />
          </TouchableOpacity>
          <View style={S.headerTitleWrap}>
            <Text style={S.headerTitle}>Paramètres</Text>
            <Text style={S.headerSub}>Configuration complète</Text>
          </View>
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={IS_TABLET ? S.contentRow : { flex: 1 }}>

            {/* Navigation onglets — scroll horizontal sur mobile, sidebar sur tablet */}
            <View style={!IS_TABLET ? { paddingVertical: 6 } : null}>
              <ScrollView
                ref={tabScrollRef}
                horizontal={!IS_TABLET}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={!IS_TABLET ? S.settingsNavScroll : S.settingsNav}
              >
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <TouchableOpacity
                      key={tab.id}
                      onPress={() => setActiveTab(tab.id)}
                      activeOpacity={0.75}
                      style={[S.settingsNavItem, isActive && S.settingsNavItemActive]}
                    >
                      <Feather name={tab.icon} size={IS_TABLET ? 17 : 15} color={isActive ? COLORS.primary : COLORS.textMuted} />
                      <Text style={[S.settingsNavLabel, isActive && S.settingsNavLabelActive]}>{tab.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={[S.formPanel, { paddingBottom: 80 }]}>
              {renderPanel()}
              <Text style={S.version}>SafeKids v2.1.0 · © 2026</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </ParentLayout>
  );
}