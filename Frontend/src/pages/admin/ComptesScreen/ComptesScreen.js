import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Modal, StatusBar, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AdminLayout from '../../../components/Navigation/AdminNavigation';
import { COLORS } from '../../../theme';
import S from './ComptesStyles';

// ── Status helpers ─────────────────────────────────────────────────────────────
const STATUS = {
  actif:   { label: 'Actif',      bg: '#D1FAE5', color: '#065F46' },
  attente: { label: 'En attente', bg: '#FEF3C7', color: '#92400E' },
  bloque:  { label: 'Bloqué',     bg: '#FEE2E2', color: '#991B1B' },
};

// ── Données mock (remplacer par appels API) ────────────────────────────────────
const INIT_MEDECINS = [
  { id: 'm1', nom: 'Dr. Jean Dupont',   email: 'j.dupont@med.dz',   specialite: 'Neurologie',      patients: 8,  status: 'actif',   initials: 'JD', color: '#8B5CF6' },
  { id: 'm2', nom: 'Dr. Leila Hadj',    email: 'l.hadj@med.dz',     specialite: 'Pédiatrie',       patients: 12, status: 'actif',   initials: 'LH', color: '#06B6D4' },
  { id: 'm3', nom: 'Dr. Yacine Bouzid', email: 'y.bouzid@med.dz',   specialite: 'Orthophonie',     patients: 0,  status: 'attente', initials: 'YB', color: '#F59E0B' },
  { id: 'm4', nom: 'Dr. Sarah Cohen',   email: 's.cohen@med.dz',    specialite: 'Psychomotricité', patients: 5,  status: 'actif',   initials: 'SC', color: '#EC4899' },
  { id: 'm5', nom: 'Dr. Omar Ferhat',   email: 'o.ferhat@med.dz',   specialite: 'Neurologie',      patients: 3,  status: 'bloque',  initials: 'OF', color: '#64748B' },
];

const INIT_PARENTS = [
  { id: 'p1', nom: 'Sara Benali',    email: 'sara.b@email.dz',  telephone: '0551 23 45 67', enfants: 2, status: 'actif',   initials: 'SB', color: '#2563EB', medecin: 'Dr. Dupont' },
  { id: 'p2', nom: 'Marie Martin',   email: 'marie.m@email.dz', telephone: '0661 34 56 78', enfants: 1, status: 'attente', initials: 'MM', color: '#F59E0B', medecin: 'Dr. Hadj' },
  { id: 'p3', nom: 'Karim Zerhouni', email: 'k.zerh@email.dz',  telephone: '0771 45 67 89', enfants: 3, status: 'actif',   initials: 'KZ', color: '#10B981', medecin: 'Dr. Cohen' },
];

// ── Carte compte ───────────────────────────────────────────────────────────────
const AccountCard = ({ item, type, onApprove, onBlock, onUnblock, onDelete, onEdit }) => {
  const st = STATUS[item.status];
  return (
    <View style={S.accountCard}>
      <View style={S.accountTop}>
        <View style={[S.accountAvatar, { backgroundColor: item.color }]}>
          <Text style={S.accountInitials}>{item.initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={S.accountName}>{item.nom}</Text>
          <Text style={S.accountMeta}>
            {type === 'doctor'
              ? `${item.specialite} · ${item.patients} patient${item.patients !== 1 ? 's' : ''}`
              : `${item.email} · ${item.enfants} enfant${item.enfants !== 1 ? 's' : ''}`}
          </Text>
        </View>
        <View style={[S.accountBadge, { backgroundColor: st.bg }]}>
          <Text style={[S.accountBadgeTxt, { color: st.color }]}>{st.label}</Text>
        </View>
      </View>
      <View style={S.accountDivider} />
      <View style={S.accountActions}>
        {item.status === 'attente' && (
          <TouchableOpacity style={[S.actionBtn, S.actionBtnApprove]} onPress={() => onApprove(item.id)}>
            <Feather name="check-circle" size={14} color={COLORS.successText} />
            <Text style={[S.actionBtnText, S.actionBtnApproveTxt]}>Approuver</Text>
          </TouchableOpacity>
        )}
        {item.status === 'actif' && (
          <TouchableOpacity style={[S.actionBtn, S.actionBtnWarn]} onPress={() => onBlock(item.id)}>
            <Feather name="lock" size={14} color="#92400E" />
            <Text style={[S.actionBtnText, S.actionBtnWarnTxt]}>Bloquer</Text>
          </TouchableOpacity>
        )}
        {item.status === 'bloque' && (
          <TouchableOpacity style={[S.actionBtn, S.actionBtnApprove]} onPress={() => onUnblock(item.id)}>
            <Feather name="unlock" size={14} color={COLORS.successText} />
            <Text style={[S.actionBtnText, S.actionBtnApproveTxt]}>Débloquer</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={S.actionBtn} onPress={() => onEdit(item)}>
          <Feather name="edit-2" size={14} color={COLORS.text} />
          <Text style={S.actionBtnText}>Modifier</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[S.actionBtn, S.actionBtnDanger]} onPress={() => onDelete(item.id)}>
          <Feather name="trash-2" size={14} color="#991B1B" />
          <Text style={[S.actionBtnText, S.actionBtnDangerTxt]}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ── Modal de création / édition ────────────────────────────────────────────────
const AccountModal = ({ visible, onClose, onSave, role, editItem }) => {
  const isEdit = !!editItem;
  const emptyDoctor = { nom: '', email: '', specialite: '', telephone: '', password: '' };
  const emptyParent = { nom: '', email: '', telephone: '', password: '' };
  const [form, setForm] = useState(emptyDoctor);

  React.useEffect(() => {
    if (editItem) {
      setForm({ ...editItem, password: '' });
    } else {
      setForm(role === 'doctor' ? emptyDoctor : emptyParent);
    }
  }, [editItem, visible, role]);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.nom.trim() || !form.email.trim()) {
      Alert.alert('Champs requis', 'Le nom et l\'email sont obligatoires.');
      return;
    }
    const colors = ['#8B5CF6','#06B6D4','#F59E0B','#EC4899','#2563EB','#10B981'];
    const newItem = {
      ...form,
      id: editItem?.id || Date.now().toString(),
      status: editItem?.status || 'actif',
      patients: editItem?.patients || 0,
      enfants:  editItem?.enfants  || 0,
      initials: form.nom.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      color: editItem?.color || colors[Math.floor(Math.random() * colors.length)],
      medecin: editItem?.medecin || 'Non assigné',
    };
    onSave(newItem);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={S.modalOverlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={S.modalSheet}>
          <View style={S.modalHandle} />
          <Text style={S.modalTitle}>
            {isEdit ? '✏️ Modifier le compte' : role === 'doctor' ? '👨‍⚕️ Nouveau médecin' : '👨‍👩‍👧 Nouveau parent'}
          </Text>
          <Text style={S.modalSub}>
            {isEdit ? 'Mettez à jour les informations du compte.' : 'Remplissez les informations pour créer le compte.'}
          </Text>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={S.fieldLabel}>Nom complet *</Text>
            <TextInput style={S.fieldInput} value={form.nom} onChangeText={v => update('nom', v)}
              placeholder={role === 'doctor' ? 'Dr. Prénom Nom' : 'Prénom Nom'}
              placeholderTextColor={COLORS.textMuted} />

            <Text style={S.fieldLabel}>Email *</Text>
            <TextInput style={S.fieldInput} value={form.email} onChangeText={v => update('email', v)}
              placeholder="email@exemple.dz" keyboardType="email-address" autoCapitalize="none"
              placeholderTextColor={COLORS.textMuted} />

            <Text style={S.fieldLabel}>Téléphone</Text>
            <TextInput style={S.fieldInput} value={form.telephone} onChangeText={v => update('telephone', v)}
              placeholder="05XX XX XX XX" keyboardType="phone-pad"
              placeholderTextColor={COLORS.textMuted} />

            {role === 'doctor' && (
              <>
                <Text style={S.fieldLabel}>Spécialité *</Text>
                <TextInput style={S.fieldInput} value={form.specialite} onChangeText={v => update('specialite', v)}
                  placeholder="Ex: Neurologie pédiatrique"
                  placeholderTextColor={COLORS.textMuted} />
              </>
            )}

            {!isEdit && (
              <>
                <Text style={S.fieldLabel}>Mot de passe temporaire *</Text>
                <TextInput style={S.fieldInput} value={form.password} onChangeText={v => update('password', v)}
                  placeholder="••••••••" secureTextEntry
                  placeholderTextColor={COLORS.textMuted} />
              </>
            )}

            <TouchableOpacity style={[S.submitBtn, { backgroundColor: role === 'doctor' ? '#4C1D95' : '#1D4ED8' }]}
              onPress={handleSave}>
              <Text style={S.submitBtnText}>{isEdit ? 'Enregistrer' : 'Créer le compte'}</Text>
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

// ── Écran principal ────────────────────────────────────────────────────────────
export default function ComptesScreen({ route }) {
  const [activeTab, setActiveTab] = useState('doctor');
  const [search, setSearch]       = useState('');
  const [medecins, setMedecins]   = useState(INIT_MEDECINS);
  const [parents, setParents]     = useState(INIT_PARENTS);
  const [modal, setModal]         = useState(false);
  const [editItem, setEditItem]   = useState(null);

  // Ouvrir modale création si params reçus du Dashboard
  React.useEffect(() => {
    if (route?.params?.openCreate) {
      setActiveTab(route.params.openCreate === 'doctor' ? 'doctor' : 'parent');
      setEditItem(null);
      setModal(true);
    }
  }, [route?.params?.openCreate]);

  const setStatus = (id, status) => {
    if (activeTab === 'doctor') setMedecins(p => p.map(x => x.id === id ? { ...x, status } : x));
    else setParents(p => p.map(x => x.id === id ? { ...x, status } : x));
  };

  const deleteItem = (id) =>
    Alert.alert('Supprimer ?', 'Cette action est irréversible.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive',
        onPress: () => {
          if (activeTab === 'doctor') setMedecins(p => p.filter(x => x.id !== id));
          else setParents(p => p.filter(x => x.id !== id));
        }},
    ]);

  const saveItem = (item) => {
    if (activeTab === 'doctor') {
      setMedecins(p => p.find(x => x.id === item.id)
        ? p.map(x => x.id === item.id ? item : x)
        : [item, ...p]);
    } else {
      setParents(p => p.find(x => x.id === item.id)
        ? p.map(x => x.id === item.id ? item : x)
        : [item, ...p]);
    }
  };

  const q = search.toLowerCase();
  const list = activeTab === 'doctor'
    ? medecins.filter(m => !q || m.nom.toLowerCase().includes(q) || m.specialite.toLowerCase().includes(q))
    : parents.filter(p => !q || p.nom.toLowerCase().includes(q) || p.email.toLowerCase().includes(q));

  return (
    <AdminLayout activeTab="comptes">
      <StatusBar barStyle="light-content" />
      <View style={S.container}>
        {/* Header */}
        <LinearGradient colors={['#4C1D95', '#1E1B4B']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={S.header}>
          <View style={S.headerTopRow}>
            <View>
              <Text style={S.headerGreeting}>Gestion des comptes</Text>
              <Text style={S.headerTitle}>
                Médecins & <Text style={S.headerAccent}>Parents</Text>
              </Text>
            </View>
          </View>
          <View style={S.searchBar}>
            <Feather name="search" size={16} color="rgba(255,255,255,0.6)" />
            <TextInput value={search} onChangeText={setSearch}
              placeholder="Rechercher un compte (Nom, Email…)"
              placeholderTextColor="rgba(255,255,255,0.45)"
              style={S.searchInput} />
            {!!search && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Feather name="x" size={16} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        {/* Onglets */}
        <View style={S.tabRow}>
          {[
            { key: 'doctor', label: `Médecins (${medecins.length})` },
            { key: 'parent', label: `Parents (${parents.length})` },
          ].map(t => (
            <TouchableOpacity key={t.key} style={[S.tab, activeTab === t.key && S.tabActive]}
              onPress={() => setActiveTab(t.key)}>
              <Text style={[S.tabText, activeTab === t.key && S.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bouton créer */}
        <LinearGradient
          colors={activeTab === 'doctor' ? ['#4C1D95', '#6D28D9'] : ['#1D4ED8', '#2563EB']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={S.createBtn}>
          <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}
            onPress={() => { setEditItem(null); setModal(true); }}>
            <Feather name="plus-circle" size={20} color="#fff" />
            <Text style={S.createBtnText}>
              {activeTab === 'doctor' ? 'Créer un compte médecin' : 'Créer un compte parent'}
            </Text>
            <Feather name="chevron-right" size={18} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Liste */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.scrollContent}>
          {list.length === 0 ? (
            <View style={S.emptyBox}>
              <Text style={S.emptyIcon}>{activeTab === 'doctor' ? '👨‍⚕️' : '👨‍👩‍👧'}</Text>
              <Text style={S.emptyText}>Aucun compte trouvé</Text>
              <Text style={S.emptySub}>Essayez un autre mot-clé</Text>
            </View>
          ) : (
            list.map(item => (
              <AccountCard key={item.id} item={item} type={activeTab}
                onApprove={id => setStatus(id, 'actif')}
                onBlock={id   => setStatus(id, 'bloque')}
                onUnblock={id => setStatus(id, 'actif')}
                onDelete={deleteItem}
                onEdit={item => { setEditItem(item); setModal(true); }} />
            ))
          )}
        </ScrollView>
      </View>

      <AccountModal visible={modal} onClose={() => { setModal(false); setEditItem(null); }}
        onSave={saveItem} role={activeTab} editItem={editItem} />
    </AdminLayout>
  );
}