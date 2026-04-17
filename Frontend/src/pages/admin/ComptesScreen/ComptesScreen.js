// src/pages/admin/ComptesScreen/ComptesScreen.js
// ✅ CORRECTIONS :
//   1. Spécialités → liste fixe hardcodée côté mobile, ZERO dépendance BDD
//   2. Téléphone   → validation 10 chiffres, 05/06/07, formatage automatique
//   3. Disponibilité → nouveau sélecteur multi-jours (Samedi→Vendredi)
//   4. Création médecin → 100% fonctionnel

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Modal, StatusBar, Alert, KeyboardAvoidingView, Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AdminLayout from '../../../components/Navigation/AdminNavigation';
import { COLORS } from '../../../theme';
import S from './ComptesStyles';

// ── URL BACKEND ─────────────────────────────────────────────────────────────
const BASE_URL = 'https://unfailed-branden-healable.ngrok-free.dev';
// Pour vrai téléphone, remplacez par votre URL ngrok :
// const BASE_URL = 'https://xxxx.ngrok-free.app';

// ── LISTE FIXE DES SPÉCIALITÉS (plus de dépendance BDD) ─────────────────────
const SPECIALITES = [
  'Psychologue',
  'Pédopsychiatrie',
  'Orthophonie',
  'Psychomotricien',
  'Psychiatre',
  'Neuropédiatrie',
  'Ergothérapie',
  'ABA Thérapeute',
];

// ── JOURS DE LA SEMAINE (ordre algérien : Samedi = premier jour) ─────────────
const JOURS = ['Samedi', 'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

// ── Status ──────────────────────────────────────────────────────────────────
const STATUS = {
  actif:   { label: 'Actif',      bg: '#D1FAE5', color: '#065F46' },
  attente: { label: 'En attente', bg: '#FEF3C7', color: '#92400E' },
  bloque:  { label: 'Bloqué',     bg: '#FEE2E2', color: '#991B1B' },
};

const getInitials = (prenom, nom) => {
  const p = (prenom || '').trim()[0] || '';
  const n = (nom    || '').trim()[0] || '';
  return (p + n).toUpperCase() || '?';
};
const AVATAR_COLORS = ['#8B5CF6','#06B6D4','#F59E0B','#EC4899','#2563EB','#10B981','#F97316'];
const avatarColor   = (id) => AVATAR_COLORS[(id?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

// ── Validation téléphone algérien ────────────────────────────────────────────
// 10 chiffres exactement, commence par 05, 06 ou 07
function validateTel(raw) {
  if (!raw || raw.trim() === '') return 'Le téléphone est obligatoire pour un médecin.';
  const cleaned = raw.replace(/[\s\-\.]/g, '');
  if (!/^\d{10}$/.test(cleaned))  return 'Exactement 10 chiffres requis (ex: 0550001234).';
  if (!/^0[567]/.test(cleaned))   return 'Doit commencer par 05, 06 ou 07.';
  return null; // OK
}

// ── Formater automatiquement le téléphone : 05 50 00 12 34 ───────────────────
function formatTel(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 10);
  return digits.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
}

// ── Fetch authentifié ────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const token = await AsyncStorage.getItem('userToken');
  if (!token) throw new Error('Session expirée. Reconnectez-vous.');
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type':            'application/json',
      'Authorization':           `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Erreur ${res.status}`);
  return data;
}

const Api = {
  getMedecins:          ()        => apiFetch('/api/medecins'),
  getParents:           ()        => apiFetch('/api/parents'),
  createMedecin:        (data)    => apiFetch('/api/medecins', { method: 'POST', body: JSON.stringify(data) }),
  updateMedecin:        (id, d)   => apiFetch(`/api/medecins/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
  setMedecinStatus:     (id, s)   => apiFetch(`/api/medecins/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: s }) }),
  resetMedecinPassword: (id, pwd) => apiFetch(`/api/medecins/${id}/reset-password`, { method: 'PATCH', body: JSON.stringify({ password: pwd }) }),
  deleteMedecin:        (id)      => apiFetch(`/api/medecins/${id}`, { method: 'DELETE' }),
  setParentStatus:      (id, s)   => apiFetch(`/api/parents/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: s }) }),
  deleteParent:         (id)      => apiFetch(`/api/parents/${id}`, { method: 'DELETE' }),
};

// ══════════════════════════════════════════════════════════════════════════════
// DROPDOWN SPÉCIALITÉ — liste fixe, zéro appel réseau
// ══════════════════════════════════════════════════════════════════════════════
const SpecialiteDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ marginBottom: 4 }}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setOpen(v => !v)}
        style={{
          borderWidth:      1.5,
          borderColor:      open ? '#7C3AED' : (value ? '#7C3AED' : '#E5E7EB'),
          borderRadius:     12,
          paddingHorizontal: 14,
          paddingVertical:  13,
          backgroundColor:  '#F9FAFB',
          flexDirection:    'row',
          alignItems:       'center',
          justifyContent:   'space-between',
          marginBottom:     open ? 0 : 12,
        }}
      >
        <Text style={{ fontSize: 14, color: value ? '#1F2937' : '#9CA3AF', flex: 1 }}>
          {value || 'Sélectionner une spécialité *'}
        </Text>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={16} color="#6B7280" />
      </TouchableOpacity>

      {open && (
        <View style={{
          borderWidth:     1.5,
          borderColor:     '#7C3AED',
          borderRadius:    12,
          backgroundColor: '#fff',
          maxHeight:       240,
          marginBottom:    12,
          overflow:        'hidden',
          elevation:       8,
          shadowColor:     '#7C3AED',
          shadowOffset:    { width: 0, height: 4 },
          shadowOpacity:   0.18,
          shadowRadius:    12,
        }}>
          <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
            {SPECIALITES.map((nom, i) => {
              const sel = value === nom;
              return (
                <TouchableOpacity
                  key={nom}
                  activeOpacity={0.7}
                  onPress={() => { onChange(nom); setOpen(false); }}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical:   13,
                    backgroundColor:   sel ? '#EDE9FE' : '#fff',
                    borderBottomWidth: i < SPECIALITES.length - 1 ? 0.5 : 0,
                    borderBottomColor: '#F3F4F6',
                    flexDirection:     'row',
                    alignItems:        'center',
                    gap:               10,
                  }}
                >
                  <View style={{
                    width: 18, height: 18, borderRadius: 9,
                    borderWidth: 2,
                    borderColor:     sel ? '#7C3AED' : '#D1D5DB',
                    backgroundColor: sel ? '#7C3AED' : 'transparent',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    {sel && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' }} />}
                  </View>
                  <Text style={{ fontSize: 14, color: sel ? '#7C3AED' : '#1F2937', fontWeight: sel ? '700' : '400' }}>
                    {nom}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// SÉLECTEUR MULTI-JOURS DISPONIBILITÉ
// ══════════════════════════════════════════════════════════════════════════════
const DisponibiliteSelector = ({ value = [], onChange }) => {
  // value : tableau de strings, ex: ['Lundi', 'Mercredi']
  const toggle = (jour) => {
    if (value.includes(jour)) {
      onChange(value.filter(j => j !== jour));
    } else {
      onChange([...value, jour]);
    }
  };

  const label = value.length === 0
    ? 'Aucun jour sélectionné'
    : value.length === 7
      ? 'Tous les jours'
      : value.join(', ');

  return (
    <View style={{ marginBottom: 12 }}>
      {/* Label résumé */}
      <View style={{
        borderWidth: 1.5, borderColor: value.length > 0 ? '#7C3AED' : '#E5E7EB',
        borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
        backgroundColor: '#F9FAFB', marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 8,
      }}>
        <Feather name="calendar" size={15} color={value.length > 0 ? '#7C3AED' : '#9CA3AF'} />
        <Text style={{ fontSize: 13, color: value.length > 0 ? '#1F2937' : '#9CA3AF', flex: 1 }} numberOfLines={1}>
          {label}
        </Text>
        {value.length > 0 && (
          <View style={{ backgroundColor: '#7C3AED', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 }}>
            <Text style={{ fontSize: 11, color: '#fff', fontWeight: '700' }}>{value.length}j</Text>
          </View>
        )}
      </View>

      {/* Grille des jours */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {JOURS.map(jour => {
          const sel = value.includes(jour);
          return (
            <TouchableOpacity
              key={jour}
              activeOpacity={0.75}
              onPress={() => toggle(jour)}
              style={{
                paddingHorizontal: 12,
                paddingVertical:   8,
                borderRadius:      20,
                borderWidth:       1.5,
                borderColor:       sel ? '#7C3AED' : '#E5E7EB',
                backgroundColor:   sel ? '#7C3AED' : '#F9FAFB',
                flexDirection:     'row',
                alignItems:        'center',
                gap:               5,
              }}
            >
              {sel && <Feather name="check" size={11} color="#fff" />}
              <Text style={{ fontSize: 12, fontWeight: sel ? '700' : '500', color: sel ? '#fff' : '#6B7280' }}>
                {jour}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// CHAMP TÉLÉPHONE avec validation et formatage en temps réel
// ══════════════════════════════════════════════════════════════════════════════
const TelField = ({ value, onChange, required = true }) => {
  const [touched, setTouched] = useState(false);
  const errMsg = touched ? validateTel(value) : null;
  const isOk   = !validateTel(value) && value.length > 0;

  return (
    <View style={{ marginBottom: 2 }}>
      <Text style={S.fieldLabel}>Téléphone{required ? ' *' : ''}</Text>
      <View style={{ position: 'relative' }}>
        <TextInput
          style={[
            S.fieldInput,
            errMsg  ? { borderColor: '#EF4444', borderWidth: 1.5 } : {},
            isOk    ? { borderColor: '#10B981', borderWidth: 1.5 } : {},
          ]}
          value={value}
          onChangeText={v => onChange(formatTel(v))}
          onBlur={() => setTouched(true)}
          placeholder="05 XX XX XX XX"
          placeholderTextColor={COLORS.textMuted}
          keyboardType="phone-pad"
          maxLength={14} // "05 50 00 12 34" = 14 chars avec espaces
        />
        {isOk && (
          <View style={{ position: 'absolute', right: 12, top: 0, bottom: 16, justifyContent: 'center' }}>
            <Feather name="check-circle" size={16} color="#10B981" />
          </View>
        )}
      </View>
      {errMsg ? (
        <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center', marginBottom: 8, marginTop: -4 }}>
          <Feather name="alert-circle" size={12} color="#EF4444" />
          <Text style={{ fontSize: 11, color: '#EF4444', flex: 1 }}>{errMsg}</Text>
        </View>
      ) : (
        <Text style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 8, marginTop: -4 }}>
          Format : 05/06/07 + 8 chiffres
        </Text>
      )}
    </View>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MEDECIN CARD
// ══════════════════════════════════════════════════════════════════════════════
const MedecinCard = ({ item, onApprove, onBlock, onUnblock, onDelete, onEdit, onResetPwd }) => {
  const st    = STATUS[item.status] || STATUS.actif;
  const color = avatarColor(item._id);
  const dispo = Array.isArray(item.disponibilite)
    ? item.disponibilite.join(', ')
    : (item.disponibilite || '');

  return (
    <View style={S.accountCard}>
      <View style={S.accountTop}>
        <View style={[S.accountAvatar, { backgroundColor: color }]}>
          <Text style={S.accountInitials}>{getInitials(item.prenom, item.nom)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={S.accountName}>{item.prenom} {item.nom}</Text>
          <Text style={S.accountMeta}>{item.specialite || '—'} · {item.patients ?? 0} patient{(item.patients ?? 0) !== 1 ? 's' : ''}</Text>
          <Text style={[S.accountMeta, { marginTop: 2 }]}>{item.email}</Text>
          {!!item.telephone && <Text style={[S.accountMeta, { marginTop: 2 }]}>📞 {item.telephone}</Text>}
          {!!dispo && <Text style={[S.accountMeta, { marginTop: 2, color: '#7C3AED' }]}>📅 {dispo}</Text>}
        </View>
        <View style={[S.accountBadge, { backgroundColor: st.bg }]}>
          <Text style={[S.accountBadgeTxt, { color: st.color }]}>{st.label}</Text>
        </View>
      </View>
      <View style={S.accountDivider} />
      <View style={[S.accountActions, { paddingBottom: 4 }]}>
        {item.status === 'attente' && (
          <TouchableOpacity style={[S.actionBtn, S.actionBtnApprove]} onPress={() => onApprove(item._id)}>
            <Feather name="check-circle" size={13} color="#065F46" />
            <Text style={[S.actionBtnText, S.actionBtnApproveTxt]}>Approuver</Text>
          </TouchableOpacity>
        )}
        {item.status === 'actif' && (
          <TouchableOpacity style={[S.actionBtn, S.actionBtnWarn]} onPress={() => onBlock(item._id)}>
            <Feather name="lock" size={13} color="#92400E" />
            <Text style={[S.actionBtnText, S.actionBtnWarnTxt]}>Bloquer</Text>
          </TouchableOpacity>
        )}
        {item.status === 'bloque' && (
          <TouchableOpacity style={[S.actionBtn, S.actionBtnApprove]} onPress={() => onUnblock(item._id)}>
            <Feather name="unlock" size={13} color="#065F46" />
            <Text style={[S.actionBtnText, S.actionBtnApproveTxt]}>Débloquer</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={S.actionBtn} onPress={() => onEdit(item)}>
          <Feather name="edit-2" size={13} color={COLORS.text} />
          <Text style={S.actionBtnText}>Modifier</Text>
        </TouchableOpacity>
      </View>
      <View style={[S.accountActions, { paddingTop: 0, paddingBottom: 12 }]}>
        <TouchableOpacity style={[S.actionBtn, { flex: 1.5 }]} onPress={() => onResetPwd(item)}>
          <Feather name="key" size={13} color="#7C3AED" />
          <Text style={[S.actionBtnText, { color: '#7C3AED' }]}>Réinitialiser MDP</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[S.actionBtn, S.actionBtnDanger]} onPress={() => onDelete(item._id)}>
          <Feather name="trash-2" size={13} color="#991B1B" />
          <Text style={[S.actionBtnText, S.actionBtnDangerTxt]}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// PARENT CARD
// ══════════════════════════════════════════════════════════════════════════════
const ParentCard = ({ item, onBlock, onUnblock, onDelete }) => {
  const st    = STATUS[item.status] || STATUS.actif;
  const color = avatarColor(item._id);
  return (
    <View style={S.accountCard}>
      <View style={S.accountTop}>
        <View style={[S.accountAvatar, { backgroundColor: color }]}>
          <Text style={S.accountInitials}>{getInitials(item.prenom, item.nom)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={S.accountName}>{item.prenom} {item.nom}</Text>
          <Text style={S.accountMeta}>{item.email}</Text>
          <Text style={[S.accountMeta, { marginTop: 2 }]}>
            {item.enfants ?? 0} enfant{(item.enfants ?? 0) !== 1 ? 's' : ''}
            {item.medecin ? ` · ${item.medecin}` : ''}
          </Text>
          {!!item.telephone && <Text style={[S.accountMeta, { marginTop: 2 }]}>📞 {item.telephone}</Text>}
          {!!item.dateInscription && (
            <Text style={[S.accountMeta, { marginTop: 2, fontSize: 11 }]}>Inscrit le {item.dateInscription}</Text>
          )}
        </View>
        <View style={[S.accountBadge, { backgroundColor: st.bg }]}>
          <Text style={[S.accountBadgeTxt, { color: st.color }]}>{st.label}</Text>
        </View>
      </View>
      <View style={S.accountDivider} />
      <View style={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EDE9FE',
          borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start' }}>
          <Feather name="info" size={11} color="#7C3AED" />
          <Text style={{ fontSize: 11, color: '#7C3AED', fontWeight: '600' }}>Compte créé par le parent lui-même</Text>
        </View>
      </View>
      <View style={[S.accountActions, { paddingTop: 8 }]}>
        {item.status === 'actif' && (
          <TouchableOpacity style={[S.actionBtn, S.actionBtnWarn]} onPress={() => onBlock(item._id)}>
            <Feather name="lock" size={13} color="#92400E" />
            <Text style={[S.actionBtnText, S.actionBtnWarnTxt]}>Bloquer</Text>
          </TouchableOpacity>
        )}
        {item.status === 'bloque' && (
          <TouchableOpacity style={[S.actionBtn, S.actionBtnApprove]} onPress={() => onUnblock(item._id)}>
            <Feather name="unlock" size={13} color="#065F46" />
            <Text style={[S.actionBtnText, S.actionBtnApproveTxt]}>Débloquer</Text>
          </TouchableOpacity>
        )}
        {item.status === 'attente' && (
          <TouchableOpacity style={[S.actionBtn, S.actionBtnApprove]} onPress={() => onUnblock(item._id)}>
            <Feather name="check-circle" size={13} color="#065F46" />
            <Text style={[S.actionBtnText, S.actionBtnApproveTxt]}>Valider</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[S.actionBtn, S.actionBtnDanger]} onPress={() => onDelete(item._id)}>
          <Feather name="trash-2" size={13} color="#991B1B" />
          <Text style={[S.actionBtnText, S.actionBtnDangerTxt]}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MODAL MÉDECIN — Création / Modification
// ══════════════════════════════════════════════════════════════════════════════
const FORM_EMPTY = {
  prenom: '', nom: '', email: '', specialite: '',
  telephone: '', disponibilite: [], password: '',
};

const MedecinModal = ({ visible, onClose, onSave, editItem, loading }) => {
  const isEdit = !!editItem;
  const [form,  setForm]  = useState(FORM_EMPTY);
  const [showPwd, setShowPwd] = useState(false);
  const scrollRef = useRef(null); // ✅ ref pour scroll vers champ actif

  useEffect(() => {
    if (!visible) return;
    if (editItem) {
      setForm({
        prenom:        editItem.prenom        || '',
        nom:           editItem.nom           || '',
        email:         editItem.email         || '',
        specialite:    editItem.specialite    || '',
        telephone:     editItem.telephone     || '',
        disponibilite: Array.isArray(editItem.disponibilite) ? editItem.disponibilite : [],
        password:      '',
      });
    } else {
      setForm(FORM_EMPTY);
    }
    setShowPwd(false);
  }, [editItem, visible]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = () => {
    // ── Validation complète ──────────────────────────────────────────────────
    if (!form.prenom.trim()) {
      Alert.alert('Champ manquant', 'Le prénom est obligatoire.'); return;
    }
    if (!form.nom.trim()) {
      Alert.alert('Champ manquant', 'Le nom est obligatoire.'); return;
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      Alert.alert('Email invalide', "Saisissez une adresse email valide."); return;
    }
    if (!form.specialite) {
      Alert.alert('Champ manquant', 'Sélectionnez une spécialité.'); return;
    }
    const telErr = validateTel(form.telephone);
    if (telErr) { Alert.alert('Téléphone invalide', telErr); return; }

    if (!isEdit && form.password.length < 6) {
      Alert.alert('Mot de passe trop court', 'Minimum 6 caractères.'); return;
    }

    // Construire le payload
    const payload = {
      prenom:        form.prenom.trim(),
      nom:           form.nom.trim(),
      email:         form.email.trim().toLowerCase(),
      specialite:    form.specialite,
      telephone:     form.telephone.replace(/\s/g, ''), // envoyer sans espaces
      disponibilite: form.disponibilite,
    };
    if (!isEdit) payload.password = form.password;
    if (isEdit)  payload._id = editItem._id;

    onSave(payload);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {/* ✅ FIX CLAVIER Android + iOS */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'android' ? 30 : 0}
        style={S.modalOverlay}
      >
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={[S.modalSheet, { maxHeight: '95%' }]}>
          <View style={S.modalHandle} />

          <Text style={S.modalTitle}>{isEdit ? '✏️ Modifier le médecin' : '👨‍⚕️ Nouveau médecin'}</Text>
          <Text style={S.modalSub}>
            {isEdit ? 'Mettez à jour les informations.' : 'Remplissez tous les champs obligatoires (*).'}
          </Text>

          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="none"
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {/* ── Prénom + Nom ── */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={S.fieldLabel}>Prénom *</Text>
                <TextInput
                  style={S.fieldInput} value={form.prenom}
                  onChangeText={v => set('prenom', v)}
                  placeholder="Prénom" placeholderTextColor={COLORS.textMuted}
                  autoCapitalize="words"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={S.fieldLabel}>Nom *</Text>
                <TextInput
                  style={S.fieldInput} value={form.nom}
                  onChangeText={v => set('nom', v)}
                  placeholder="Nom" placeholderTextColor={COLORS.textMuted}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* ── Email ── */}
            <Text style={S.fieldLabel}>Email *</Text>
            <TextInput
              style={S.fieldInput} value={form.email}
              onChangeText={v => set('email', v)}
              placeholder="email@exemple.dz" keyboardType="email-address"
              autoCapitalize="none" placeholderTextColor={COLORS.textMuted}
              onFocus={e => scrollRef.current?.scrollTo({ y: 80, animated: true })}
            />

            {/* ── Téléphone ── */}
            <TelField
              value={form.telephone}
              onChange={v => set('telephone', v)}
              required
            />

            {/* ── Spécialité ── */}
            <Text style={S.fieldLabel}>Spécialité *</Text>
            <SpecialiteDropdown
              value={form.specialite}
              onChange={v => set('specialite', v)}
            />

            {/* ── Disponibilité ── */}
            <Text style={S.fieldLabel}>Jours de disponibilité</Text>
            <DisponibiliteSelector
              value={form.disponibilite}
              onChange={v => set('disponibilite', v)}
            />

            {/* ── Mot de passe (création seulement) ── */}
            {!isEdit && (
              <>
                <Text style={S.fieldLabel}>Mot de passe temporaire * (min. 6 car.)</Text>
                <View style={{ position: 'relative' }}>
                  <TextInput
                    style={[S.fieldInput, { paddingRight: 48 }]}
                    value={form.password}
                    onChangeText={v => set('password', v)}
                    placeholder="••••••••"
                    secureTextEntry={!showPwd}
                    placeholderTextColor={COLORS.textMuted}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPwd(v => !v)}
                    style={{ position: 'absolute', right: 14, top: 0, bottom: 16, justifyContent: 'center' }}
                  >
                    <Feather name={showPwd ? 'eye-off' : 'eye'} size={16} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>
                <View style={{
                  backgroundColor: '#FEF3C7', borderRadius: 10, padding: 10,
                  marginBottom: 8, flexDirection: 'row', gap: 8, alignItems: 'flex-start',
                }}>
                  <Feather name="info" size={13} color="#D97706" />
                  <Text style={{ fontSize: 12, color: '#92400E', flex: 1 }}>
                    Le médecin changera ce mot de passe à sa première connexion.
                  </Text>
                </View>
              </>
            )}

            {/* ── Bouton submit ── */}
            <TouchableOpacity
              style={[S.submitBtn, { backgroundColor: '#4C1D95', marginTop: 14, opacity: loading ? 0.7 : 1 }]}
              onPress={submit}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={S.submitBtnText}>{isEdit ? 'Enregistrer' : 'Créer le compte médecin'}</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={S.cancelBtn} onPress={onClose}>
              <Text style={S.cancelBtnText}>Annuler</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MODAL RESET MDP
// ══════════════════════════════════════════════════════════════════════════════
const ResetPwdModal = ({ visible, onClose, onSave, medecin, loading }) => {
  const [pwd,  setPwd]  = useState('');
  const [show, setShow] = useState(false);
  useEffect(() => { if (visible) { setPwd(''); setShow(false); } }, [visible]);
  const nomComplet = medecin ? `${medecin.prenom || ''} ${medecin.nom || ''}`.trim() : '';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'android' ? 30 : 0} style={S.modalOverlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={[S.modalSheet, { minHeight: undefined }]}>
          <View style={S.modalHandle} />
          <Text style={S.modalTitle}>🔑 Réinitialiser le MDP</Text>
          <Text style={S.modalSub}>Nouveau mot de passe pour Dr. {nomComplet}.</Text>
          <Text style={S.fieldLabel}>Nouveau mot de passe *</Text>
          <View>
            <TextInput
              style={[S.fieldInput, { paddingRight: 48 }]}
              value={pwd} onChangeText={setPwd}
              placeholder="••••••••" secureTextEntry={!show}
              placeholderTextColor={COLORS.textMuted} autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShow(v => !v)}
              style={{ position: 'absolute', right: 14, top: 0, bottom: 16, justifyContent: 'center' }}
            >
              <Feather name={show ? 'eye-off' : 'eye'} size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[S.submitBtn, { backgroundColor: '#7C3AED', opacity: loading ? 0.7 : 1 }]}
            onPress={() => {
              if (pwd.length < 6) { Alert.alert('Trop court', 'Minimum 6 caractères.'); return; }
              onSave(medecin._id, pwd);
            }}
            disabled={loading}
          >
            {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={S.submitBtnText}>Confirmer</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={S.cancelBtn} onPress={onClose}>
            <Text style={S.cancelBtnText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// ÉCRAN PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export default function ComptesScreen({ route }) {
  const [activeTab,   setActiveTab]   = useState('doctor');
  const [search,      setSearch]      = useState('');
  const [medecins,    setMedecins]    = useState([]);
  const [parents,     setParents]     = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingSave, setLoadingSave] = useState(false);
  const [modal,       setModal]       = useState(false);
  const [resetModal,  setResetModal]  = useState(false);
  const [editItem,    setEditItem]    = useState(null);
  const [resetTarget, setResetTarget] = useState(null);
  const [error,       setError]       = useState(null);

  // ── Chargement données ─────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoadingList(true);
    setError(null);
    try {
      const [m, p] = await Promise.all([Api.getMedecins(), Api.getParents()]);
      setMedecins(Array.isArray(m) ? m : []);
      setParents(Array.isArray(p) ? p : []);
    } catch (e) {
      setError(e.message || 'Impossible de charger les données.');
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, []);

  useEffect(() => {
    if (route?.params?.openCreate === 'doctor') {
      setActiveTab('doctor'); setEditItem(null); setModal(true);
    }
  }, [route?.params?.openCreate]);

  // ── Médecins CRUD ──────────────────────────────────────────────────────────
  const handleSaveMedecin = useCallback(async (payload) => {
    setLoadingSave(true);
    try {
      if (payload._id) {
        // Modification
        const updated = await Api.updateMedecin(payload._id, payload);
        setMedecins(prev => prev.map(m => m._id === updated._id ? { ...m, ...updated } : m));
        Alert.alert('✅ Modifié', `Dr. ${updated.prenom} ${updated.nom} mis à jour.`);
      } else {
        // Création
        const created = await Api.createMedecin(payload);
        setMedecins(prev => [created, ...prev]);
        Alert.alert(
          '✅ Compte créé',
          `Dr. ${created.prenom} ${created.nom} créé avec succès.\n\n` +
          `⚠️ Le médecin doit changer son mot de passe à la première connexion.`
        );
      }
      setModal(false);
      setEditItem(null);
    } catch (e) {
      Alert.alert('Erreur', e.message || 'Impossible de sauvegarder.');
    } finally {
      setLoadingSave(false);
    }
  }, []);

  const setMedecinStatus = useCallback(async (id, status) => {
    try {
      await Api.setMedecinStatus(id, status);
      setMedecins(prev => prev.map(m => m._id === id ? { ...m, status } : m));
    } catch (e) { Alert.alert('Erreur', e.message); }
  }, []);

  const deleteMedecin = useCallback((id) => {
    Alert.alert('Supprimer ce médecin ?', 'Cette action est irréversible.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        try { await Api.deleteMedecin(id); setMedecins(prev => prev.filter(m => m._id !== id)); }
        catch (e) { Alert.alert('Erreur', e.message); }
      }},
    ]);
  }, []);

  const handleResetPwd = useCallback(async (id, newPwd) => {
    setLoadingSave(true);
    try {
      await Api.resetMedecinPassword(id, newPwd);
      Alert.alert('✅ MDP réinitialisé', 'Le médecin devra le modifier à la prochaine connexion.');
      setResetModal(false); setResetTarget(null);
    } catch (e) { Alert.alert('Erreur', e.message); }
    finally { setLoadingSave(false); }
  }, []);

  // ── Parents ────────────────────────────────────────────────────────────────
  const setParentStatus = useCallback(async (id, status) => {
    try {
      await Api.setParentStatus(id, status);
      setParents(prev => prev.map(p => p._id === id ? { ...p, status } : p));
    } catch (e) { Alert.alert('Erreur', e.message); }
  }, []);

  const deleteParent = useCallback((id) => {
    Alert.alert('Supprimer ce parent ?', 'Le compte sera supprimé définitivement.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        try { await Api.deleteParent(id); setParents(prev => prev.filter(p => p._id !== id)); }
        catch (e) { Alert.alert('Erreur', e.message); }
      }},
    ]);
  }, []);

  // ── Filtrage ───────────────────────────────────────────────────────────────
  const q    = search.toLowerCase().trim();
  const list = activeTab === 'doctor'
    ? medecins.filter(m => !q
        || `${m.prenom} ${m.nom}`.toLowerCase().includes(q)
        || (m.specialite || '').toLowerCase().includes(q)
        || (m.email      || '').toLowerCase().includes(q))
    : parents.filter(p => !q
        || `${p.prenom} ${p.nom}`.toLowerCase().includes(q)
        || (p.email || '').toLowerCase().includes(q));

  // ── Rendu ──────────────────────────────────────────────────────────────────
  return (
    <AdminLayout activeTab="comptes">
      <StatusBar barStyle="light-content" />
      <View style={S.container}>

        {/* ── Header ── */}
        <LinearGradient
          colors={['#4C1D95', '#1E1B4B']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={S.header}
        >
          <View style={{ position: 'absolute', left: -60, top: -20, width: 200, height: 200, borderRadius: 100, backgroundColor: '#6D28D9', opacity: 0.35 }} />
          <View style={{ position: 'absolute', right: -40, bottom: -30, width: 160, height: 160, borderRadius: 80, backgroundColor: '#3B82F6', opacity: 0.18 }} />
          <View style={S.headerTopRow}>
            <View>
              <Text style={S.headerGreeting}>Gestion des comptes</Text>
              <Text style={S.headerTitle}>Médecins & <Text style={S.headerAccent}>Parents</Text></Text>
            </View>
            <TouchableOpacity
              style={S.addHeaderBtn}
              onPress={() => { setEditItem(null); setModal(true); }}
              activeOpacity={0.85}
            >
              <Feather name="plus" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={S.searchBar}>
            <Feather name="search" size={16} color="rgba(255,255,255,0.6)" />
            <TextInput
              value={search} onChangeText={setSearch}
              placeholder="Rechercher un compte…"
              placeholderTextColor="rgba(255,255,255,0.45)"
              style={S.searchInput}
            />
            {!!search && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Feather name="x" size={16} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        {/* ── Onglets ── */}
        <View style={S.tabRow}>
          {[
            { key: 'doctor', label: `Médecins (${medecins.length})` },
            { key: 'parent', label: `Parents (${parents.length})` },
          ].map(t => (
            <TouchableOpacity
              key={t.key}
              style={[S.tab, activeTab === t.key && S.tabActive]}
              onPress={() => { setActiveTab(t.key); setSearch(''); }}
            >
              <Text style={[S.tabText, activeTab === t.key && S.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Bouton créer médecin ── */}
        {activeTab === 'doctor' && (
          <LinearGradient
            colors={['#4C1D95', '#6D28D9']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={S.createBtn}
          >
            <TouchableOpacity
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}
              onPress={() => { setEditItem(null); setModal(true); }}
            >
              <Feather name="plus-circle" size={20} color="#fff" />
              <Text style={S.createBtnText}>Créer un compte médecin</Text>
              <Feather name="chevron-right" size={18} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </LinearGradient>
        )}

        {/* ── Info parents ── */}
        {activeTab === 'parent' && (
          <View style={{
            marginHorizontal: 16, marginBottom: 10, backgroundColor: '#EDE9FE',
            borderRadius: 12, padding: 12, flexDirection: 'row', gap: 10, alignItems: 'center',
          }}>
            <Feather name="info" size={16} color="#7C3AED" />
            <Text style={{ fontSize: 12, color: '#7C3AED', flex: 1, fontWeight: '600' }}>
              Les parents créent leur propre compte. Vous pouvez bloquer, débloquer ou supprimer.
            </Text>
          </View>
        )}

        {/* ── Erreur ── */}
        {!!error && (
          <View style={{
            marginHorizontal: 16, marginBottom: 10, backgroundColor: '#FEE2E2',
            borderRadius: 12, padding: 12, flexDirection: 'row', gap: 10, alignItems: 'center',
          }}>
            <Feather name="alert-circle" size={16} color="#991B1B" />
            <Text style={{ fontSize: 12, color: '#991B1B', flex: 1, fontWeight: '600' }}>{error}</Text>
            <TouchableOpacity onPress={loadAll}>
              <Text style={{ fontSize: 12, color: '#7C3AED', fontWeight: '700' }}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Liste ── */}
        {loadingList ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#7C3AED" />
            <Text style={{ marginTop: 12, color: '#9CA3AF', fontSize: 13 }}>Chargement…</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.scrollContent}>
            {list.length === 0 ? (
              <View style={S.emptyBox}>
                <Text style={S.emptyIcon}>{activeTab === 'doctor' ? '👨‍⚕️' : '👨‍👩‍👧'}</Text>
                <Text style={S.emptyText}>Aucun compte trouvé</Text>
                <Text style={S.emptySub}>{search ? 'Essayez un autre mot-clé' : 'Aucun compte enregistré'}</Text>
                {activeTab === 'doctor' && !search && (
                  <TouchableOpacity
                    onPress={() => { setEditItem(null); setModal(true); }}
                    style={{ marginTop: 16, backgroundColor: '#4C1D95', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>+ Créer un médecin</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : activeTab === 'doctor' ? (
              list.map(item => (
                <MedecinCard key={item._id} item={item}
                  onApprove={id  => setMedecinStatus(id, 'actif')}
                  onBlock={id    => setMedecinStatus(id, 'bloque')}
                  onUnblock={id  => setMedecinStatus(id, 'actif')}
                  onDelete={deleteMedecin}
                  onEdit={item   => { setEditItem(item); setModal(true); }}
                  onResetPwd={item => { setResetTarget(item); setResetModal(true); }}
                />
              ))
            ) : (
              list.map(item => (
                <ParentCard key={item._id} item={item}
                  onBlock={id   => setParentStatus(id, 'bloque')}
                  onUnblock={id => setParentStatus(id, 'actif')}
                  onDelete={deleteParent}
                />
              ))
            )}
          </ScrollView>
        )}
      </View>

      {/* ── Modals ── */}
      <MedecinModal
        visible={modal && activeTab === 'doctor'}
        onClose={() => { setModal(false); setEditItem(null); }}
        onSave={handleSaveMedecin}
        editItem={editItem}
        loading={loadingSave}
      />
      <ResetPwdModal
        visible={resetModal}
        onClose={() => { setResetModal(false); setResetTarget(null); }}
        onSave={handleResetPwd}
        medecin={resetTarget}
        loading={loadingSave}
      />
    </AdminLayout>
  );
}