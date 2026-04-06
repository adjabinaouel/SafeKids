// src/pages/admin/ComptesScreen/ComptesScreen.js
/**
 * LOGIQUE SELON DIAGRAMME DE CAS D'UTILISATION :
 *
 * Médecins : Créer · Bloquer · Débloquer · Modifier MDP · Supprimer
 * Parents  : Bloquer · Débloquer · Supprimer  (PAS de création — le parent crée lui-même son compte)
 *
 * MongoDB : utilise _id (ObjectId) au lieu de id
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Modal, StatusBar, Alert, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import AdminLayout from '../../../components/Navigation/AdminNavigation';
import { COLORS } from '../../../theme';
import S from './ComptesStyles';

// ─── CONFIG API MongoDB ────────────────────────────────────────────────────────
const API_BASE = 'http://YOUR_BACKEND_URL/api';

// ─── Status helpers ────────────────────────────────────────────────────────────
const STATUS = {
  actif:   { label: 'Actif',      bg: '#D1FAE5', color: '#065F46' },
  attente: { label: 'En attente', bg: '#FEF3C7', color: '#92400E' },
  bloque:  { label: 'Bloqué',     bg: '#FEE2E2', color: '#991B1B' },
};

// ─── Données mock ──────────────────────────────────────────────────────────────
const MOCK_MEDECINS = [
  { _id: 'm1', nom: 'Dr. Jean Dupont',   email: 'j.dupont@med.dz',   specialite: 'Neurologie',      telephone: '0551 00 11 22', patients: 8,  status: 'actif',   initials: 'JD', color: '#8B5CF6' },
  { _id: 'm2', nom: 'Dr. Leila Hadj',    email: 'l.hadj@med.dz',     specialite: 'Pédiatrie',       telephone: '0661 33 44 55', patients: 12, status: 'actif',   initials: 'LH', color: '#06B6D4' },
  { _id: 'm3', nom: 'Dr. Yacine Bouzid', email: 'y.bouzid@med.dz',   specialite: 'Orthophonie',     telephone: '0771 66 77 88', patients: 0,  status: 'attente', initials: 'YB', color: '#F59E0B' },
  { _id: 'm4', nom: 'Dr. Sarah Cohen',   email: 's.cohen@med.dz',    specialite: 'Psychomotricité', telephone: '0551 99 00 11', patients: 5,  status: 'actif',   initials: 'SC', color: '#EC4899' },
  { _id: 'm5', nom: 'Dr. Omar Ferhat',   email: 'o.ferhat@med.dz',   specialite: 'Neurologie',      telephone: '0661 22 33 44', patients: 3,  status: 'bloque',  initials: 'OF', color: '#64748B' },
];

const MOCK_PARENTS = [
  { _id: 'p1', nom: 'Sara Benali',    email: 'sara.b@email.dz',  telephone: '0551 23 45 67', enfants: 2, status: 'actif',   initials: 'SB', color: '#2563EB', dateInscription: '12 Jan 2024', medecin: 'Dr. Dupont' },
  { _id: 'p2', nom: 'Marie Martin',   email: 'marie.m@email.dz', telephone: '0661 34 56 78', enfants: 1, status: 'attente', initials: 'MM', color: '#F59E0B', dateInscription: '28 Fév 2024', medecin: 'Dr. Hadj' },
  { _id: 'p3', nom: 'Karim Zerhouni', email: 'k.zerh@email.dz',  telephone: '0771 45 67 89', enfants: 3, status: 'actif',   initials: 'KZ', color: '#10B981', dateInscription: '05 Mar 2024', medecin: 'Dr. Cohen' },
];

// ─── Service API ───────────────────────────────────────────────────────────────
const ApiService = {
  // ── Médecins ────────────────────────────────────────────────────
  getMedecins: async () => {
    try {
      const res = await fetch(`${API_BASE}/medecins`);
      return res.ok ? await res.json() : MOCK_MEDECINS;
    } catch { return MOCK_MEDECINS; }
  },
  createMedecin: async (data) => {
    try {
      const res = await fetch(`${API_BASE}/medecins`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      });
      return res.ok ? await res.json() : { ...data, _id: Date.now().toString() };
    } catch { return { ...data, _id: Date.now().toString() }; }
  },
  updateMedecin: async (id, data) => {
    try {
      const res = await fetch(`${API_BASE}/medecins/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      });
      return res.ok ? await res.json() : { ...data, _id: id };
    } catch { return { ...data, _id: id }; }
  },
  setMedecinStatus: async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/medecins/${id}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
      });
      return res.ok ? await res.json() : { _id: id, status };
    } catch { return { _id: id, status }; }
  },
  deleteMedecin: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/medecins/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch { return true; }
  },

  // ── Parents (pas de création) ────────────────────────────────────
  getParents: async () => {
    try {
      const res = await fetch(`${API_BASE}/parents`);
      return res.ok ? await res.json() : MOCK_PARENTS;
    } catch { return MOCK_PARENTS; }
  },
  setParentStatus: async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/parents/${id}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
      });
      return res.ok ? await res.json() : { _id: id, status };
    } catch { return { _id: id, status }; }
  },
  deleteParent: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/parents/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch { return true; }
  },
};

// ─── Carte Médecin ────────────────────────────────────────────────────────────
const MedecinCard = ({ item, onApprove, onBlock, onUnblock, onDelete, onEdit, onResetPwd }) => {
  const st = STATUS[item.status];
  return (
    <View style={S.accountCard}>
      <View style={S.accountTop}>
        <View style={[S.accountAvatar, { backgroundColor: item.color }]}>
          <Text style={S.accountInitials}>{item.initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={S.accountName}>{item.nom}</Text>
          <Text style={S.accountMeta}>{item.specialite} · {item.patients} patient{item.patients !== 1 ? 's' : ''}</Text>
          <Text style={[S.accountMeta, { marginTop: 2 }]}>{item.email}</Text>
        </View>
        <View style={[S.accountBadge, { backgroundColor: st.bg }]}>
          <Text style={[S.accountBadgeTxt, { color: st.color }]}>{st.label}</Text>
        </View>
      </View>

      <View style={S.accountDivider} />

      {/* Ligne 1 : actions de statut */}
      <View style={[S.accountActions, { paddingBottom: 4 }]}>
        {item.status === 'attente' && (
          <TouchableOpacity style={[S.actionBtn, S.actionBtnApprove]} onPress={() => onApprove(item._id)}>
            <Feather name="check-circle" size={13} color={COLORS.successText} />
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
            <Feather name="unlock" size={13} color={COLORS.successText} />
            <Text style={[S.actionBtnText, S.actionBtnApproveTxt]}>Débloquer</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={S.actionBtn} onPress={() => onEdit(item)}>
          <Feather name="edit-2" size={13} color={COLORS.text} />
          <Text style={S.actionBtnText}>Modifier</Text>
        </TouchableOpacity>
      </View>

      {/* Ligne 2 : MDP + Supprimer */}
      <View style={[S.accountActions, { paddingTop: 0, paddingBottom: 12 }]}>
        <TouchableOpacity style={[S.actionBtn, { flex: 1.5 }]} onPress={() => onResetPwd(item)}>
          <Feather name="key" size={13} color={COLORS.primary || '#7C3AED'} />
          <Text style={[S.actionBtnText, { color: COLORS.primary || '#7C3AED' }]}>Réinitialiser MDP</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[S.actionBtn, S.actionBtnDanger]} onPress={() => onDelete(item._id)}>
          <Feather name="trash-2" size={13} color="#991B1B" />
          <Text style={[S.actionBtnText, S.actionBtnDangerTxt]}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Carte Parent ─────────────────────────────────────────────────────────────
// Selon diagramme : Bloquer · Débloquer · Supprimer (PAS de création ni modification)
const ParentCard = ({ item, onBlock, onUnblock, onDelete }) => {
  const st = STATUS[item.status];
  return (
    <View style={S.accountCard}>
      <View style={S.accountTop}>
        <View style={[S.accountAvatar, { backgroundColor: item.color }]}>
          <Text style={S.accountInitials}>{item.initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={S.accountName}>{item.nom}</Text>
          <Text style={S.accountMeta}>{item.email}</Text>
          <Text style={[S.accountMeta, { marginTop: 2 }]}>
            {item.enfants} enfant{item.enfants !== 1 ? 's' : ''} · Médecin : {item.medecin}
          </Text>
          {item.dateInscription && (
            <Text style={[S.accountMeta, { marginTop: 2, fontSize: 11 }]}>
              Inscrit le {item.dateInscription}
            </Text>
          )}
        </View>
        <View style={[S.accountBadge, { backgroundColor: st.bg }]}>
          <Text style={[S.accountBadgeTxt, { color: st.color }]}>{st.label}</Text>
        </View>
      </View>

      <View style={S.accountDivider} />

      {/* Infobadge lecture seule */}
      <View style={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6,
          backgroundColor: '#EDE9FE', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
          alignSelf: 'flex-start' }}>
          <Feather name="info" size={11} color={COLORS.primary || '#7C3AED'} />
          <Text style={{ fontSize: 11, color: COLORS.primary || '#7C3AED', fontWeight: '600' }}>
            Compte créé par le parent lui-même
          </Text>
        </View>
      </View>

      {/* Actions : Bloquer / Débloquer + Supprimer */}
      <View style={[S.accountActions, { paddingTop: 8 }]}>
        {item.status === 'actif' && (
          <TouchableOpacity style={[S.actionBtn, S.actionBtnWarn]} onPress={() => onBlock(item._id)}>
            <Feather name="lock" size={13} color="#92400E" />
            <Text style={[S.actionBtnText, S.actionBtnWarnTxt]}>Bloquer</Text>
          </TouchableOpacity>
        )}
        {item.status === 'bloque' && (
          <TouchableOpacity style={[S.actionBtn, S.actionBtnApprove]} onPress={() => onUnblock(item._id)}>
            <Feather name="unlock" size={13} color={COLORS.successText} />
            <Text style={[S.actionBtnText, S.actionBtnApproveTxt]}>Débloquer</Text>
          </TouchableOpacity>
        )}
        {item.status === 'attente' && (
          <TouchableOpacity style={[S.actionBtn, S.actionBtnApprove]} onPress={() => onUnblock(item._id)}>
            <Feather name="check-circle" size={13} color={COLORS.successText} />
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

// ─── Modal Médecin (création + édition) ───────────────────────────────────────
const MedecinModal = ({ visible, onClose, onSave, editItem, loading }) => {
  const isEdit = !!editItem;
  const EMPTY = { nom: '', email: '', specialite: '', telephone: '', password: '' };
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (visible) setForm(editItem ? { ...editItem, password: '' } : EMPTY);
  }, [editItem, visible]);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.nom.trim() || !form.email.trim()) {
      Alert.alert('Champs requis', 'Le nom et l\'email sont obligatoires.');
      return;
    }
    if (!isEdit && form.password.length < 6) {
      Alert.alert('Mot de passe', 'Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    const colors = ['#8B5CF6', '#06B6D4', '#F59E0B', '#EC4899', '#2563EB', '#10B981'];
    onSave({
      ...form,
      _id:      editItem?._id || null,
      status:   editItem?.status || 'actif',
      patients: editItem?.patients || 0,
      initials: form.nom.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      color:    editItem?.color || colors[Math.floor(Math.random() * colors.length)],
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={S.modalOverlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={S.modalSheet}>
          <View style={S.modalHandle} />
          <Text style={S.modalTitle}>
            {isEdit ? '✏️ Modifier le médecin' : '👨‍⚕️ Nouveau médecin'}
          </Text>
          <Text style={S.modalSub}>
            {isEdit ? 'Modifiez les informations du compte médecin.' : 'Créez un compte pour un nouveau médecin.'}
          </Text>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={S.fieldLabel}>Nom complet *</Text>
            <TextInput style={S.fieldInput} value={form.nom} onChangeText={v => update('nom', v)}
              placeholder="Dr. Prénom Nom" placeholderTextColor={COLORS.textMuted} />

            <Text style={S.fieldLabel}>Email *</Text>
            <TextInput style={S.fieldInput} value={form.email} onChangeText={v => update('email', v)}
              placeholder="email@exemple.dz" keyboardType="email-address" autoCapitalize="none"
              placeholderTextColor={COLORS.textMuted} />

            <Text style={S.fieldLabel}>Téléphone</Text>
            <TextInput style={S.fieldInput} value={form.telephone} onChangeText={v => update('telephone', v)}
              placeholder="05XX XX XX XX" keyboardType="phone-pad" placeholderTextColor={COLORS.textMuted} />

            <Text style={S.fieldLabel}>Spécialité *</Text>
            <TextInput style={S.fieldInput} value={form.specialite} onChangeText={v => update('specialite', v)}
              placeholder="Ex: Neurologie pédiatrique" placeholderTextColor={COLORS.textMuted} />

            {!isEdit && (
              <>
                <Text style={S.fieldLabel}>Mot de passe temporaire *</Text>
                <TextInput style={S.fieldInput} value={form.password} onChangeText={v => update('password', v)}
                  placeholder="••••••••" secureTextEntry placeholderTextColor={COLORS.textMuted} />
                <View style={{ backgroundColor: '#FEF3C7', borderRadius: 10, padding: 10, marginBottom: 16, flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
                  <Feather name="info" size={13} color="#D97706" />
                  <Text style={{ fontSize: 12, color: '#92400E', flex: 1 }}>
                    Le médecin devra changer ce mot de passe à sa première connexion.
                  </Text>
                </View>
              </>
            )}

            <TouchableOpacity
              style={[S.submitBtn, { backgroundColor: '#4C1D95', opacity: loading ? 0.7 : 1 }]}
              onPress={handleSave} disabled={loading}>
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

// ─── Modal Réinitialisation MDP ───────────────────────────────────────────────
const ResetPwdModal = ({ visible, onClose, onSave, medecin, loading }) => {
  const [newPwd, setNewPwd] = useState('');
  const [show,   setShow]   = useState(false);

  useEffect(() => { if (visible) setNewPwd(''); }, [visible]);

  const handleSave = () => {
    if (newPwd.length < 6) { Alert.alert('Mot de passe trop court', 'Minimum 6 caractères.'); return; }
    onSave(medecin._id, newPwd);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={S.modalOverlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={[S.modalSheet, { minHeight: undefined }]}>
          <View style={S.modalHandle} />
          <Text style={S.modalTitle}>🔑 Réinitialiser le MDP</Text>
          <Text style={S.modalSub}>
            Définir un nouveau mot de passe pour {medecin?.nom}.
          </Text>

          <View style={{ paddingHorizontal: 0 }}>
            <Text style={S.fieldLabel}>Nouveau mot de passe *</Text>
            <View style={{ position: 'relative' }}>
              <TextInput style={[S.fieldInput, { paddingRight: 48 }]}
                value={newPwd} onChangeText={setNewPwd}
                placeholder="••••••••" secureTextEntry={!show}
                placeholderTextColor={COLORS.textMuted} autoCapitalize="none" />
              <TouchableOpacity
                onPress={() => setShow(v => !v)}
                style={{ position: 'absolute', right: 14, top: 0, bottom: 16, justifyContent: 'center' }}>
                <Feather name={show ? 'eye-off' : 'eye'} size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={{ backgroundColor: '#FEF3C7', borderRadius: 10, padding: 10, marginBottom: 16, flexDirection: 'row', gap: 8 }}>
              <Feather name="alert-triangle" size={13} color="#D97706" />
              <Text style={{ fontSize: 12, color: '#92400E', flex: 1 }}>
                Le médecin recevra un email et devra changer ce mot de passe à la prochaine connexion.
              </Text>
            </View>

            <TouchableOpacity
              style={[S.submitBtn, { backgroundColor: COLORS.primary || '#7C3AED', opacity: loading ? 0.7 : 1 }]}
              onPress={handleSave} disabled={loading}>
              {loading
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={S.submitBtnText}>Confirmer la réinitialisation</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={S.cancelBtn} onPress={onClose}>
              <Text style={S.cancelBtnText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ─── ÉCRAN PRINCIPAL ──────────────────────────────────────────────────────────
export default function ComptesScreen({ route }) {
  const [activeTab,    setActiveTab]    = useState('doctor');
  const [search,       setSearch]       = useState('');
  const [medecins,     setMedecins]     = useState([]);
  const [parents,      setParents]      = useState([]);
  const [loadingList,  setLoadingList]  = useState(true);
  const [loadingSave,  setLoadingSave]  = useState(false);
  const [modal,        setModal]        = useState(false);
  const [resetModal,   setResetModal]   = useState(false);
  const [editItem,     setEditItem]     = useState(null);
  const [resetTarget,  setResetTarget]  = useState(null);

  // Chargement initial
  useEffect(() => { loadAll(); }, []);

  useEffect(() => {
    if (route?.params?.openCreate === 'doctor') {
      setActiveTab('doctor'); setEditItem(null); setModal(true);
    }
  }, [route?.params?.openCreate]);

  const loadAll = async () => {
    setLoadingList(true);
    const [m, p] = await Promise.all([ApiService.getMedecins(), ApiService.getParents()]);
    setMedecins(m);
    setParents(p);
    setLoadingList(false);
  };

  // ── Actions Médecins ──────────────────────────────────────────────────────
  const handleSaveMedecin = useCallback(async (item) => {
    setLoadingSave(true);
    try {
      if (item._id && medecins.find(m => m._id === item._id)) {
        const updated = await ApiService.updateMedecin(item._id, item);
        setMedecins(p => p.map(m => m._id === updated._id ? updated : m));
        Alert.alert('✅ Modifié', `Le compte de ${updated.nom} a été mis à jour.`);
      } else {
        const created = await ApiService.createMedecin(item);
        setMedecins(p => [created, ...p]);
        Alert.alert('✅ Compte créé', `Le compte de ${created.nom} a été créé. Un email a été envoyé.`);
      }
      setModal(false); setEditItem(null);
    } catch { Alert.alert('Erreur', 'Impossible de sauvegarder.'); }
    finally { setLoadingSave(false); }
  }, [medecins]);

  const setMedecinStatus = useCallback(async (id, status) => {
    await ApiService.setMedecinStatus(id, status);
    setMedecins(p => p.map(m => m._id === id ? { ...m, status } : m));
  }, []);

  const deleteMedecin = useCallback((id) => {
    Alert.alert('Supprimer le médecin ?', 'Le compte sera définitivement supprimé.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        await ApiService.deleteMedecin(id);
        setMedecins(p => p.filter(m => m._id !== id));
      }},
    ]);
  }, []);

  const handleResetPwd = useCallback(async (id, newPwd) => {
    setLoadingSave(true);
    try {
      await ApiService.updateMedecin(id, { password: newPwd });
      Alert.alert('✅ MDP réinitialisé', 'Un email a été envoyé au médecin.');
      setResetModal(false); setResetTarget(null);
    } catch { Alert.alert('Erreur', 'Impossible de réinitialiser.'); }
    finally { setLoadingSave(false); }
  }, []);

  // ── Actions Parents ───────────────────────────────────────────────────────
  const setParentStatus = useCallback(async (id, status) => {
    await ApiService.setParentStatus(id, status);
    setParents(p => p.map(pr => pr._id === id ? { ...pr, status } : pr));
  }, []);

  const deleteParent = useCallback((id) => {
    Alert.alert('Supprimer le compte parent ?', 'Le compte et toutes les données associées seront supprimés.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        await ApiService.deleteParent(id);
        setParents(p => p.filter(pr => pr._id !== id));
      }},
    ]);
  }, []);

  // ── Filtrage ──────────────────────────────────────────────────────────────
  const q = search.toLowerCase();
  const list = activeTab === 'doctor'
    ? medecins.filter(m => !q || m.nom.toLowerCase().includes(q) || m.specialite?.toLowerCase().includes(q))
    : parents.filter(p => !q || p.nom.toLowerCase().includes(q) || p.email.toLowerCase().includes(q));

  return (
    <AdminLayout activeTab="comptes">
      <StatusBar barStyle="light-content" />
      <View style={S.container}>

        {/* ── Header ── */}
        <LinearGradient colors={['#4C1D95', '#1E1B4B']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={S.header}>
             {/* Blobs */}
                      <View style={{ position: 'absolute', left: -60, top: -20, width: 200, height: 200, borderRadius: 100, backgroundColor: '#6D28D9', opacity: 0.35 }} />
                      <View style={{ position: 'absolute', right: -40, bottom: -30, width: 160, height: 160, borderRadius: 80, backgroundColor: '#3B82F6', opacity: 0.18 }} />
            
          <View style={S.headerTopRow}>
            <View>
              <Text style={S.headerGreeting}>Gestion des comptes</Text>
              <Text style={S.headerTitle}>
                Médecins & <Text style={S.headerAccent}>Parents</Text>
              </Text>
            </View>
            <TouchableOpacity style={S.addHeaderBtn}
                            onPress={() => { setEditItem(null); setModal(true); }} activeOpacity={0.85}>
                            <Feather name="plus" size={20} color="#fff" />
                          </TouchableOpacity>
          </View>
          <View style={S.searchBar}>
            <Feather name="search" size={16} color="rgba(255,255,255,0.6)" />
            <TextInput value={search} onChangeText={setSearch}
              placeholder="Rechercher un compte…"
              placeholderTextColor="rgba(255,255,255,0.45)"
              style={S.searchInput} />
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
            <TouchableOpacity key={t.key}
              style={[S.tab, activeTab === t.key && S.tabActive]}
              onPress={() => { setActiveTab(t.key); setSearch(''); }}>
              <Text style={[S.tabText, activeTab === t.key && S.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Bouton créer (médecins uniquement) ── */}
        {activeTab === 'doctor' && (
          <LinearGradient colors={['#4C1D95', '#6D28D9']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={S.createBtn}>
            <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}
              onPress={() => { setEditItem(null); setModal(true); }}>
              <Feather name="plus-circle" size={20} color="#fff" />
              <Text style={S.createBtnText}>Créer un compte médecin</Text>
              <Feather name="chevron-right" size={18} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </LinearGradient>
        )}

        {/* ── Note parents ── */}
        {activeTab === 'parent' && (
          <View style={{ marginHorizontal: 16, marginBottom: 10, backgroundColor: '#EDE9FE', borderRadius: 12, padding: 12, flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <Feather name="info" size={16} color={COLORS.primary || '#7C3AED'} />
            <Text style={{ fontSize: 12, color: COLORS.primary || '#7C3AED', flex: 1, fontWeight: '600' }}>
              Les parents créent leur propre compte. Vous pouvez bloquer, débloquer ou supprimer un compte parent.
            </Text>
          </View>
        )}

        {/* ── Liste ── */}
        {loadingList ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={COLORS.primary || '#7C3AED'} />
            <Text style={{ marginTop: 12, color: COLORS.textMuted, fontSize: 13 }}>Chargement…</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.scrollContent}>
            {list.length === 0 ? (
              <View style={S.emptyBox}>
                <Text style={S.emptyIcon}>{activeTab === 'doctor' ? '👨‍⚕️' : '👨‍👩‍👧'}</Text>
                <Text style={S.emptyText}>Aucun compte trouvé</Text>
                <Text style={S.emptySub}>{search ? 'Essayez un autre mot-clé' : 'Aucun compte enregistré'}</Text>
              </View>
            ) : activeTab === 'doctor' ? (
              list.map(item => (
                <MedecinCard key={item._id} item={item}
                  onApprove={id => setMedecinStatus(id, 'actif')}
                  onBlock={id   => setMedecinStatus(id, 'bloque')}
                  onUnblock={id => setMedecinStatus(id, 'actif')}
                  onDelete={deleteMedecin}
                  onEdit={item => { setEditItem(item); setModal(true); }}
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

      {/* Modals */}
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