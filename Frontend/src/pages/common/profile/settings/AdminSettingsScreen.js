// src/pages/admin/SettingsScreen/AdminSettingsScreen.js
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
import AdminLayout from '../../../../components/Navigation/AdminNavigation';
import S, { COLORS, IS_TABLET } from '../ProfileStyles';

const KEYS = {
  profile:       'adminProfile',
  preferences:   'adminPreferences',
  notifications: 'adminNotifications',
  security:      'adminSecurity',
  system:        'adminSystem',
};

const TABS = [
  { id: 'general',       icon: 'user',     label: 'Profil'        },
  { id: 'system',        icon: 'server',   label: 'Système'       },
  { id: 'security',      icon: 'shield',   label: 'Sécurité'      },
  { id: 'notifications', icon: 'bell',     label: 'Notifications' },
  { id: 'users',         icon: 'users',    label: 'Utilisateurs'  },
  { id: 'account',       icon: 'settings', label: 'Compte'        },
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

// ─── PANEL : PROFIL ADMIN ─────────────────────────────────────────────────────
const GeneralPanel = () => {
  const [form, setForm] = useState({ prenom: 'Nassim', nom: 'Lounici', email: 'admin@safekids.app', phone: '+213 555 000 001', departement: 'Direction Technique', avatar: null });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    AsyncStorage.getItem(KEYS.profile).then(d => { if (d) setForm(prev => ({ ...prev, ...JSON.parse(d) })); }).catch(() => {});
  }, []);

  const update = (field, value) => { setForm(prev => ({ ...prev, [field]: value })); setErrors(prev => ({ ...prev, [field]: null })); setSaved(false); };

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
    } catch { Alert.alert('Erreur', 'Impossible de sauvegarder. Réessayez.'); }
    finally { setSaving(false); }
  };

  const handlePickAvatar = () => {
    Alert.alert('Photo de profil', 'Choisissez une option', [
      { text: 'Prendre une photo', onPress: async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') { Alert.alert('Permission refusée', "L'accès à la caméra est nécessaire."); return; }
        const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
        if (!result.canceled) { const uri = result.assets[0].uri; const updated = { ...form, avatar: uri }; setForm(updated); await AsyncStorage.setItem(KEYS.profile, JSON.stringify(updated)); }
      }},
      { text: 'Choisir depuis la galerie', onPress: async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') { Alert.alert('Permission refusée', "L'accès à la galerie est nécessaire."); return; }
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
        if (!result.canceled) { const uri = result.assets[0].uri; const updated = { ...form, avatar: uri }; setForm(updated); await AsyncStorage.setItem(KEYS.profile, JSON.stringify(updated)); }
      }},
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  const FIELDS = [
    [{ field: 'prenom', label: 'Prénom',      keyboard: 'default'       }, { field: 'nom',   label: 'Nom',       keyboard: 'default'   }],
    [{ field: 'email',  label: 'Email admin', keyboard: 'email-address'  }, { field: 'phone', label: 'Téléphone', keyboard: 'phone-pad' }],
    [{ field: 'departement', label: 'Département', keyboard: 'default'   }],
  ];

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <Text style={S.formTitle}>Profil administrateur</Text>
        <SavedBadge visible={saved} />
      </View>
      <Text style={S.formSub}>Modifiez vos informations personnelles.</Text>

      <TouchableOpacity onPress={handlePickAvatar} activeOpacity={0.85} style={{ alignItems: 'center', marginBottom: 20 }}>
        <View style={{ width: 80, height: 80, position: 'relative' }}>
          <LinearGradient colors={['#667eea', '#764ba2']} style={{ width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' }}>
            {form.avatar ? <Image source={{ uri: form.avatar }} style={{ width: 80, height: 80, borderRadius: 40 }} /> : <Ionicons name="person" size={36} color="#fff" />}
          </LinearGradient>
          <View style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' }}>
            <Feather name="camera" size={13} color="#fff" />
          </View>
        </View>
        <Text style={{ fontSize: 12, color: COLORS.primary, fontWeight: '600', marginTop: 8 }}>{form.prenom} {form.nom}</Text>
        <Text style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>Appuyer pour modifier la photo</Text>
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primaryLight, borderRadius: 10, padding: 10, marginBottom: 16 }}>
        <Feather name="shield" size={14} color={COLORS.primary} />
        <Text style={{ fontSize: 12, color: COLORS.primary, fontWeight: '700' }}>Super Administrateur · ADM-2024-001</Text>
        <Feather name="lock" size={12} color={COLORS.primary} style={{ marginLeft: 'auto' }} />
      </View>

      <Text style={S.formSectionTitle}>Coordonnées</Text>
      {FIELDS.map((row, ri) => (
        <View key={ri} style={S.formRow}>
          {row.map(({ field, label, keyboard }) => (
            <View key={field} style={S.formField}>
              <Text style={S.formLabel}>{label}</Text>
              <TextInput style={[S.formInput, errors[field] && { borderColor: COLORS.error, borderWidth: 1 }]} value={form[field]} onChangeText={v => update(field, v)} keyboardType={keyboard} autoCapitalize={keyboard === 'email-address' ? 'none' : 'words'} returnKeyType="done" placeholderTextColor={COLORS.textMuted} />
              {errors[field] && <Text style={{ fontSize: 10, color: COLORS.error, marginTop: 2 }}>{errors[field]}</Text>}
            </View>
          ))}
        </View>
      ))}

      <TouchableOpacity onPress={handleSave} disabled={saving} style={{ backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8, opacity: saving ? 0.7 : 1 }} activeOpacity={0.85}>
        {saving ? <ActivityIndicator size="small" color="#fff" /> : <Feather name="save" size={16} color="#fff" />}
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</Text>
      </TouchableOpacity>
    </View>
  );
};

// ─── PANEL : SYSTÈME ──────────────────────────────────────────────────────────
const SystemPanel = () => {
  const [config, setConfig] = useState({ maintenanceMode: false, debugLogs: false, autoBackup: true, maxUsers: '500', sessionTimeout: '30', appVersion: '2.1.0' });
  const [saved, setSaved] = useState(false);

  useEffect(() => { AsyncStorage.getItem(KEYS.system).then(d => { if (d) setConfig(prev => ({ ...prev, ...JSON.parse(d) })); }).catch(() => {}); }, []);

  const persist = async (updated) => { setConfig(updated); try { await AsyncStorage.setItem(KEYS.system, JSON.stringify(updated)); setSaved(true); setTimeout(() => setSaved(false), 2500); } catch {} };

  const toggleSwitch = (key) => {
    if (key === 'maintenanceMode' && !config[key]) {
      Alert.alert('Mode maintenance', "Activer le mode maintenance rendra l'application inaccessible aux utilisateurs.", [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Activer', style: 'destructive', onPress: () => persist({ ...config, [key]: true }) },
      ]);
    } else { persist({ ...config, [key]: !config[key] }); }
  };

  const TOGGLES = [
    { key: 'maintenanceMode', label: 'Mode maintenance',    sub: 'Bloquer les connexions utilisateurs', icon: 'tool',     danger: true  },
    { key: 'debugLogs',       label: 'Journaux de débogage',sub: 'Activer les logs détaillés',          icon: 'terminal', danger: false },
    { key: 'autoBackup',      label: 'Sauvegarde auto',     sub: 'Sauvegarde quotidienne à 02h00',      icon: 'database', danger: false },
  ];

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <Text style={S.formTitle}>Configuration système</Text>
        <SavedBadge visible={saved} />
      </View>
      <Text style={S.formSub}>Paramètres globaux de la plateforme SafeKids.</Text>

      <View style={{ backgroundColor: COLORS.primaryLight, borderRadius: 12, padding: 14, marginBottom: 16 }}>
        <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.primary, marginBottom: 8 }}>📊 État du système</Text>
        {[{ label: 'Version', value: `v${config.appVersion}` }, { label: 'Environnement', value: 'Production' }, { label: 'Base de données', value: 'MongoDB Atlas · OK' }, { label: 'Dernière sauvegarde', value: "Aujourd'hui 02:00" }].map((item, i) => (
          <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ fontSize: 12, color: COLORS.textMuted }}>{item.label}</Text>
            <Text style={{ fontSize: 12, fontWeight: '600', color: COLORS.text }}>{item.value}</Text>
          </View>
        ))}
      </View>

      <Text style={S.formSectionTitle}>Limites & timeouts</Text>
      <View style={S.formRow}>
        <View style={S.formField}>
          <Text style={S.formLabel}>Utilisateurs max</Text>
          <TextInput style={S.formInput} value={config.maxUsers} onChangeText={v => setConfig(p => ({ ...p, maxUsers: v }))} keyboardType="number-pad" returnKeyType="done" placeholderTextColor={COLORS.textMuted} onBlur={() => persist(config)} />
        </View>
        <View style={S.formField}>
          <Text style={S.formLabel}>Timeout session (min)</Text>
          <TextInput style={S.formInput} value={config.sessionTimeout} onChangeText={v => setConfig(p => ({ ...p, sessionTimeout: v }))} keyboardType="number-pad" returnKeyType="done" placeholderTextColor={COLORS.textMuted} onBlur={() => persist(config)} />
        </View>
      </View>

      <Text style={S.formSectionTitle}>Options avancées</Text>
      {TOGGLES.map((item, i) => (
        <View key={item.key} style={[S.toggleRow, i === TOGGLES.length - 1 && S.toggleRowLast]}>
          <View style={[S.securityIcon, { backgroundColor: item.danger && config[item.key] ? '#FEE2E2' : config[item.key] ? COLORS.primaryLight : '#F1F5F9', marginRight: 12 }]}>
            <Feather name={item.icon} size={15} color={item.danger && config[item.key] ? COLORS.error : config[item.key] ? COLORS.primary : COLORS.textMuted} />
          </View>
          <View style={S.toggleInfo}>
            <Text style={[S.toggleLabel, item.danger && config[item.key] && { color: COLORS.error }]}>{item.label}</Text>
            <Text style={S.toggleSub}>{item.sub}</Text>
          </View>
          <Switch value={config[item.key]} onValueChange={() => toggleSwitch(item.key)} trackColor={{ false: '#E2E8F0', true: item.danger ? '#FCA5A5' : COLORS.primaryGlow }} thumbColor={config[item.key] ? (item.danger ? COLORS.error : COLORS.primary) : '#fff'} />
        </View>
      ))}

      <Text style={[S.formSectionTitle, { marginTop: 20 }]}>Actions système</Text>
      {[
        { label: 'Vider le cache serveur', icon: 'refresh-cw', color: COLORS.primary, bg: COLORS.primaryLight, onPress: () => Alert.alert('Cache vidé', 'Le cache serveur a été réinitialisé avec succès.') },
        { label: 'Exporter les logs',      icon: 'download',   color: '#10B981',       bg: '#D1FAE5',           onPress: () => Alert.alert('Export', 'Les journaux ont été exportés vers votre email admin.') },
        { label: 'Lancer une sauvegarde',  icon: 'database',   color: '#3B82F6',       bg: '#DBEAFE',           onPress: () => Alert.alert('Sauvegarde', 'Sauvegarde manuelle lancée. Résultat dans 2 minutes.') },
      ].map((action, i, arr) => (
        <TouchableOpacity key={i} onPress={action.onPress} activeOpacity={0.75} style={[S.securityRow, i === arr.length - 1 && S.securityRowLast]}>
          <View style={[S.securityIcon, { backgroundColor: action.bg }]}><Feather name={action.icon} size={16} color={action.color} /></View>
          <View style={S.securityContent}><Text style={[S.securityLabel, { color: action.color }]}>{action.label}</Text></View>
          <Feather name="chevron-right" size={16} color={COLORS.textMuted} />
        </TouchableOpacity>
      ))}
    </View>
  );
};

// ─── PANEL : SÉCURITÉ ─────────────────────────────────────────────────────────
const SecurityPanel = () => {
  const [showPwModal, setShowPwModal] = useState(false);
  const [twoFA,       setTwoFA]       = useState(true);
  const [biometrics,  setBiometrics]  = useState(false);
  const [bioAvailable,setBioAvailable]= useState(false);
  const [ipWhitelist, setIpWhitelist] = useState(true);
  const [auditLog,    setAuditLog]    = useState(true);
  const [passwords,   setPasswords]   = useState({ current: '', newPass: '', confirm: '' });
  const [showPw,      setShowPw]      = useState({ current: false, newPass: false, confirm: false });
  const [pwErrors,    setPwErrors]    = useState({});
  const [pwSaving,    setPwSaving]    = useState(false);
  const [pwStrength,  setPwStrength]  = useState(0);

  useEffect(() => {
    LocalAuthentication.hasHardwareAsync().then(has => { if (has) LocalAuthentication.isEnrolledAsync().then(enrolled => setBioAvailable(enrolled)); });
    AsyncStorage.getItem(KEYS.security).then(d => { if (d) { const s = JSON.parse(d); if (s.twoFA !== undefined) setTwoFA(s.twoFA); if (s.biometrics !== undefined) setBiometrics(s.biometrics); if (s.ipWhitelist !== undefined) setIpWhitelist(s.ipWhitelist); if (s.auditLog !== undefined) setAuditLog(s.auditLog); } }).catch(() => {});
  }, []);

  const saveSecurity = async (updates) => { const current = { twoFA, biometrics, ipWhitelist, auditLog, ...updates }; await AsyncStorage.setItem(KEYS.security, JSON.stringify(current)); };
  const checkStrength = (pw) => { let score = 0; if (pw.length >= 10) score++; if (/[A-Z]/.test(pw)) score++; if (/[0-9]/.test(pw)) score++; if (/[^A-Za-z0-9]/.test(pw)) score++; setPwStrength(score); };
  const validatePw = () => { const e = {}; if (!passwords.current) e.current = 'Requis'; if (passwords.newPass.length < 8) e.newPass = 'Minimum 8 caractères'; if (passwords.newPass !== passwords.confirm) e.confirm = 'Les mots de passe ne correspondent pas'; setPwErrors(e); return Object.keys(e).length === 0; };
  const handlePwChange = async () => { if (!validatePw()) return; setPwSaving(true); await new Promise(r => setTimeout(r, 1200)); setPwSaving(false); setShowPwModal(false); setPasswords({ current: '', newPass: '', confirm: '' }); setPwStrength(0); Alert.alert('✅ Mot de passe modifié', 'Le mot de passe administrateur a été mis à jour.'); };
  const handle2FA = () => { if (twoFA) { Alert.alert('⚠ Désactiver 2FA', "En tant qu'administrateur, la désactivation du 2FA est déconseillée.", [{ text: 'Annuler', style: 'cancel' }, { text: 'Désactiver quand même', style: 'destructive', onPress: () => { setTwoFA(false); saveSecurity({ twoFA: false }); } }]); } else { Alert.alert('Activer 2FA', 'Un code OTP vous sera demandé à chaque connexion admin.', [{ text: 'Annuler', style: 'cancel' }, { text: 'Activer', onPress: () => { setTwoFA(true); saveSecurity({ twoFA: true }); } }]); } };
  const handleBiometrics = async () => { if (!bioAvailable) { Alert.alert('Non disponible', 'Aucune biométrie configurée sur cet appareil.'); return; } if (biometrics) { Alert.alert('Désactiver biométrie', 'Désactiver Face ID / Empreinte ?', [{ text: 'Annuler', style: 'cancel' }, { text: 'Désactiver', style: 'destructive', onPress: () => { setBiometrics(false); saveSecurity({ biometrics: false }); } }]); } else { const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Authentifiez-vous pour activer cette fonctionnalité' }); if (result.success) { setBiometrics(true); saveSecurity({ biometrics: true }); Alert.alert('✅ Activé', 'Biométrie admin activée.'); } else Alert.alert('Échec', 'Authentification biométrique échouée.'); } };

  const strengthColors = ['#EF4444', '#F59E0B', '#F59E0B', '#10B981', '#10B981'];
  const strengthLabels = ['', 'Faible', 'Moyen', 'Bon', 'Fort'];
  const PW_FIELDS = [{ key: 'current', label: 'Mot de passe actuel' }, { key: 'newPass', label: 'Nouveau mot de passe' }, { key: 'confirm', label: 'Confirmer le mot de passe' }];

  return (
    <View>
      <Text style={S.formTitle}>Sécurité avancée</Text>
      <Text style={S.formSub}>Protégez le panneau d'administration SafeKids.</Text>

      <TouchableOpacity style={S.securityRow} onPress={() => setShowPwModal(true)} activeOpacity={0.75}>
        <View style={[S.securityIcon, { backgroundColor: COLORS.primaryLight }]}><Feather name="lock" size={16} color={COLORS.primary} /></View>
        <View style={S.securityContent}><Text style={S.securityLabel}>Mot de passe admin</Text><Text style={S.securityValue}>Modifié il y a 1 mois · Appuyez pour changer</Text></View>
        <Feather name="chevron-right" size={16} color={COLORS.textMuted} />
      </TouchableOpacity>

      {[
        { label: 'Double authentification (2FA)', subOn: '✓ Activée — obligatoire admin', subOff: '⚠ Non activée — risque élevé', icon: 'smartphone', value: twoFA, onToggle: handle2FA, colorOn: COLORS.success, bgOn: COLORS.successBg, trackOn: COLORS.successBg },
        { label: 'Face ID / Empreinte digitale',  subOn: '✓ Activé',                     subOff: !bioAvailable ? 'Non disponible' : 'Non activé', icon: 'eye', value: biometrics, onToggle: handleBiometrics, colorOn: COLORS.primary, bgOn: COLORS.primaryLight, trackOn: COLORS.primaryGlow, disabled: !bioAvailable },
        { label: 'Restriction IP (Whitelist)',     subOn: '✓ Actif — IPs autorisées uniquement', subOff: 'Désactivé — accès ouvert', icon: 'globe', value: ipWhitelist, onToggle: () => { setIpWhitelist(v => !v); saveSecurity({ ipWhitelist: !ipWhitelist }); }, colorOn: COLORS.primary, bgOn: COLORS.primaryLight, trackOn: COLORS.primaryGlow },
        { label: "Journal d'audit complet",        subOn: '✓ Toutes les actions sont tracées', subOff: 'Désactivé', icon: 'file-text', value: auditLog, onToggle: () => { setAuditLog(v => !v); saveSecurity({ auditLog: !auditLog }); }, colorOn: COLORS.success, bgOn: COLORS.successBg, trackOn: COLORS.successBg },
      ].map((item, i) => (
        <View key={i} style={S.securityRow}>
          <View style={[S.securityIcon, { backgroundColor: item.value ? item.bgOn : '#F1F5F9' }]}><Feather name={item.icon} size={16} color={item.value ? item.colorOn : COLORS.textMuted} /></View>
          <View style={S.securityContent}>
            <Text style={S.securityLabel}>{item.label}</Text>
            <Text style={[S.securityValue, { color: item.value ? item.colorOn : COLORS.textMuted }]}>{item.value ? item.subOn : item.subOff}</Text>
          </View>
          <Switch value={item.value} onValueChange={item.onToggle} trackColor={{ false: '#E2E8F0', true: item.trackOn }} thumbColor={item.value ? item.colorOn : '#fff'} disabled={item.disabled} />
        </View>
      ))}

      <TouchableOpacity style={[S.securityRow, S.securityRowLast]} activeOpacity={0.75} onPress={() => Alert.alert('Sessions admin actives', '1 session admin active\n\nAndroid · SafeKids Admin · Alger, DZ\nConnecté maintenant', [{ text: 'Forcer la déconnexion', style: 'destructive', onPress: () => Alert.alert('Sessions fermées', 'Toutes les sessions admin ont été terminées.') }, { text: 'Fermer' }])}>
        <View style={[S.securityIcon, { backgroundColor: '#D1FAE5' }]}><Feather name="monitor" size={16} color={COLORS.success} /></View>
        <View style={S.securityContent}><Text style={S.securityLabel}>Sessions admin actives</Text><Text style={S.securityValue}>1 session · Appuyez pour gérer</Text></View>
        <Feather name="chevron-right" size={16} color={COLORS.textMuted} />
      </TouchableOpacity>

      <Modal visible={showPwModal} transparent animationType="slide" onRequestClose={() => setShowPwModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 17, fontWeight: '800', color: COLORS.text }}>Changer le mot de passe admin</Text>
              <TouchableOpacity onPress={() => { setShowPwModal(false); setPasswords({ current: '', newPass: '', confirm: '' }); setPwStrength(0); setPwErrors({}); }}><Feather name="x" size={22} color={COLORS.textMuted} /></TouchableOpacity>
            </View>
            {PW_FIELDS.map(({ key, label }) => (
              <View key={key} style={{ marginBottom: 12 }}>
                <Text style={S.formLabel}>{label}</Text>
                <View style={{ position: 'relative' }}>
                  <TextInput style={[S.formInput, pwErrors[key] && { borderColor: COLORS.error, borderWidth: 1 }, { paddingRight: 44 }]} value={passwords[key]} onChangeText={v => { setPasswords(p => ({ ...p, [key]: v })); setPwErrors(p => ({ ...p, [key]: null })); if (key === 'newPass') checkStrength(v); }} secureTextEntry={!showPw[key]} placeholder="••••••••" placeholderTextColor={COLORS.textMuted} returnKeyType="done" autoCapitalize="none" />
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

// ─── PANEL : NOTIFICATIONS ────────────────────────────────────────────────────
const NotificationsPanel = () => {
  const [notifs, setNotifs] = useState({ nouveauxComptes: true, alertesSystem: true, rapports: true, connexionsSuspec: true, maintenance: false, backups: true });
  const [saved, setSaved] = useState(false);

  useEffect(() => { AsyncStorage.getItem(KEYS.notifications).then(d => { if (d) setNotifs(JSON.parse(d)); }).catch(() => {}); }, []);

  const saveNotifs = async (updated) => { setNotifs(updated); try { await AsyncStorage.setItem(KEYS.notifications, JSON.stringify(updated)); setSaved(true); setTimeout(() => setSaved(false), 2000); } catch {} };
  const toggle = (key) => saveNotifs({ ...notifs, [key]: !notifs[key] });
  const setAll = (val)  => saveNotifs(Object.fromEntries(Object.keys(notifs).map(k => [k, val])));

  const ITEMS = [
    { key: 'nouveauxComptes',  label: 'Nouveaux comptes',           sub: 'Inscriptions parents / médecins',      icon: 'user-plus'      },
    { key: 'alertesSystem',    label: 'Alertes système critiques',   sub: 'Erreurs serveur, pannes',              icon: 'alert-triangle' },
    { key: 'rapports',         label: 'Rapports hebdomadaires',      sub: 'Statistiques plateforme',              icon: 'bar-chart-2'    },
    { key: 'connexionsSuspec', label: 'Connexions suspectes',        sub: 'Tentatives de connexion inhabituelles',icon: 'shield'         },
    { key: 'maintenance',      label: 'Rappels de maintenance',      sub: 'Fenêtres de maintenance planifiées',   icon: 'tool'           },
    { key: 'backups',          label: 'Confirmations de sauvegarde', sub: 'Résultat des sauvegardes auto',        icon: 'database'       },
  ];

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <Text style={S.formTitle}>Notifications admin</Text>
        <SavedBadge visible={saved} />
      </View>
      <Text style={S.formSub}>Configurez les alertes du panneau d'administration.</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        <TouchableOpacity onPress={() => setAll(true)} style={{ flex: 1, backgroundColor: COLORS.primaryLight, borderRadius: 10, padding: 10, alignItems: 'center' }}><Text style={{ fontSize: 12, color: COLORS.primary, fontWeight: '700' }}>Tout activer</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setAll(false)} style={{ flex: 1, backgroundColor: '#FEE2E2', borderRadius: 10, padding: 10, alignItems: 'center' }}><Text style={{ fontSize: 12, color: COLORS.error, fontWeight: '700' }}>Tout désactiver</Text></TouchableOpacity>
      </View>
      {ITEMS.map((item, i) => (
        <View key={item.key} style={[S.toggleRow, i === ITEMS.length - 1 && S.toggleRowLast]}>
          <View style={[S.securityIcon, { backgroundColor: notifs[item.key] ? COLORS.primaryLight : '#F1F5F9', marginRight: 12 }]}><Feather name={item.icon} size={14} color={notifs[item.key] ? COLORS.primary : COLORS.textMuted} /></View>
          <View style={S.toggleInfo}><Text style={[S.toggleLabel, !notifs[item.key] && { color: COLORS.textMuted }]}>{item.label}</Text><Text style={S.toggleSub}>{item.sub}</Text></View>
          <Switch value={notifs[item.key]} onValueChange={() => toggle(item.key)} trackColor={{ false: '#E2E8F0', true: COLORS.primaryGlow }} thumbColor={notifs[item.key] ? COLORS.primary : '#fff'} />
        </View>
      ))}
    </View>
  );
};

// ─── PANEL : UTILISATEURS ─────────────────────────────────────────────────────
const UsersPanel = () => {
  const STATS = [
    { label: 'Total utilisateurs', value: '247', icon: 'users',    color: COLORS.primary, bg: COLORS.primaryLight },
    { label: 'Parents actifs',     value: '198', icon: 'heart',    color: '#10B981',       bg: '#D1FAE5'           },
    { label: 'Médecins',           value: '43',  icon: 'activity', color: '#3B82F6',       bg: '#DBEAFE'           },
    { label: 'Suspendus',          value: '6',   icon: 'slash',    color: COLORS.error,    bg: '#FEE2E2'           },
  ];
  const ACTIONS = [
    { label: 'Gérer les comptes parents', icon: 'users',    color: COLORS.primary, bg: COLORS.primaryLight },
    { label: 'Gérer les médecins',        icon: 'activity', color: '#3B82F6',       bg: '#DBEAFE'           },
    { label: 'Comptes suspendus',         icon: 'slash',    color: COLORS.error,    bg: '#FEE2E2'           },
    { label: 'Exporter la liste',         icon: 'download', color: '#10B981',       bg: '#D1FAE5'           },
  ];
  return (
    <View>
      <Text style={S.formTitle}>Gestion des utilisateurs</Text>
      <Text style={S.formSub}>Vue d'ensemble et actions sur les comptes.</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        {STATS.map((stat, i) => (
          <View key={i} style={{ flex: 1, minWidth: '45%', backgroundColor: stat.bg, borderRadius: 12, padding: 14, alignItems: 'center' }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 6 }}><Feather name={stat.icon} size={16} color={stat.color} /></View>
            <Text style={{ fontSize: 22, fontWeight: '800', color: stat.color }}>{stat.value}</Text>
            <Text style={{ fontSize: 11, color: COLORS.textMuted, textAlign: 'center', marginTop: 2 }}>{stat.label}</Text>
          </View>
        ))}
      </View>
      <Text style={S.formSectionTitle}>Actions rapides</Text>
      {ACTIONS.map((action, i) => (
        <TouchableOpacity key={i} onPress={() => Alert.alert(action.label, 'Fonctionnalité disponible dans la prochaine version.')} style={[S.securityRow, i === ACTIONS.length - 1 && S.securityRowLast]} activeOpacity={0.75}>
          <View style={[S.securityIcon, { backgroundColor: action.bg }]}><Feather name={action.icon} size={16} color={action.color} /></View>
          <View style={S.securityContent}><Text style={[S.securityLabel, { color: action.color }]}>{action.label}</Text></View>
          <Feather name="chevron-right" size={16} color={COLORS.textMuted} />
        </TouchableOpacity>
      ))}
    </View>
  );
};

// ─── PANEL : COMPTE ADMIN ─────────────────────────────────────────────────────
const AccountPanel = ({ onLogout }) => {
  const [profile, setProfile] = useState({ prenom: 'Nassim', nom: 'Lounici', email: 'admin@safekids.app', avatar: null, role: 'Super Administrateur', identifiant: 'ADM-2024-001' });
  useEffect(() => { AsyncStorage.getItem(KEYS.profile).then(d => { if (d) setProfile(prev => ({ ...prev, ...JSON.parse(d) })); }).catch(() => {}); }, []);

  return (
    <View>
      <Text style={S.formTitle}>Compte administrateur</Text>
      <Text style={S.formSub}>Informations et actions sur votre compte admin.</Text>
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <View style={{ width: 72, height: 72 }}>
          <LinearGradient colors={['#667eea', '#764ba2']} style={{ width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center' }}>
            {profile.avatar ? <Image source={{ uri: profile.avatar }} style={{ width: 72, height: 72, borderRadius: 36 }} /> : <Ionicons name="person" size={32} color="#fff" />}
          </LinearGradient>
        </View>
        <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.text, marginTop: 10 }}>{profile.prenom} {profile.nom}</Text>
        <Text style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{profile.email}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, backgroundColor: COLORS.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
          <Feather name="shield" size={12} color={COLORS.primary} />
          <Text style={{ fontSize: 11, color: COLORS.primary, fontWeight: '600' }}>{profile.role} · {profile.identifiant}</Text>
        </View>
      </View>
      {[
        { label: 'Support technique', sub: 'support@safekids.app', icon: 'mail', bg: COLORS.primaryLight, color: COLORS.primary, onPress: () => Linking.openURL('mailto:support@safekids.app') },
        { label: 'Documentation admin', sub: 'Guides techniques & API', icon: 'book', bg: '#F1F5F9', color: COLORS.textLight, onPress: () => Linking.openURL('https://safekids.app/admin/docs') },
        { label: "Exporter mon rapport d'activité", sub: 'Toutes mes actions ce mois', icon: 'file-text', bg: '#D1FAE5', color: COLORS.success, onPress: () => Alert.alert("Rapport d'activité", 'Le rapport admin a été envoyé à votre email.') },
      ].map((item, i, arr) => (
        <TouchableOpacity key={i} style={[S.securityRow, i === arr.length - 1 && S.securityRowLast]} onPress={item.onPress} activeOpacity={0.75}>
          <View style={[S.securityIcon, { backgroundColor: item.bg }]}><Feather name={item.icon} size={16} color={item.color} /></View>
          <View style={S.securityContent}><Text style={S.securityLabel}>{item.label}</Text><Text style={S.securityValue}>{item.sub}</Text></View>
          <Feather name="chevron-right" size={16} color={COLORS.textMuted} />
        </TouchableOpacity>
      ))}
      <View style={S.dangerZone}>
        <Text style={S.dangerTitle}>⚠ Zone critique</Text>
        <TouchableOpacity onPress={onLogout} style={[S.dangerRow, S.dangerRowLast]} activeOpacity={0.75}>
          <View style={S.dangerIcon}><Feather name="log-out" size={16} color={COLORS.error} /></View>
          <Text style={S.dangerLabel}>Se déconnecter</Text>
          <Feather name="chevron-right" size={16} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── ÉCRAN PRINCIPAL ──────────────────────────────────────────────────────────
export default function AdminSettingsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('general');
  const tabScrollRef = useRef(null);

  const handleLogout = useCallback(() => {
    Alert.alert('Se déconnecter', 'Voulez-vous vraiment vous déconnecter du panneau admin ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnexion', style: 'destructive', onPress: () => navigation?.replace('Login') },
    ]);
  }, [navigation]);

  const renderPanel = () => {
    switch (activeTab) {
      case 'general':       return <GeneralPanel />;
      case 'system':        return <SystemPanel />;
      case 'security':      return <SecurityPanel />;
      case 'notifications': return <NotificationsPanel />;
      case 'users':         return <UsersPanel />;
      case 'account':       return <AccountPanel onLogout={handleLogout} />;
      default:              return <GeneralPanel />;
    }
  };

  return (
    // ✅ AdminLayout wrappe tout — même pattern que SettingsScreen parent avec ParentLayout
    <AdminLayout activeTab="settings">
      <View style={S.container}>
        <StatusBar barStyle="light-content" />

        <LinearGradient colors={['#667eea', '#764ba2']} style={S.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={S.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Feather name="arrow-left" size={18} color="#fff" />
          </TouchableOpacity>
          <View style={S.headerTitleWrap}>
            <Text style={S.headerTitle}>Paramètres système</Text>
            <Text style={S.headerSub}>Panneau d'administration</Text>
          </View>
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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
            <View style={[S.formPanel, { paddingBottom: 80 }]}>
              {renderPanel()}
              <Text style={S.version}>SafeKids v2.1.0 · Panneau Admin · © 2026</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </AdminLayout>
  );
}