// src/pages/admin/ActivitesScreen/ActivitesScreen.js
import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Modal, StatusBar, Alert, KeyboardAvoidingView, Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import AdminLayout from '../../../components/Navigation/AdminNavigation';
import { COLORS } from '../../../theme';
import S from './ActivitesStyles';

// ─── CONFIG API MongoDB ────────────────────────────────────────────────────────
// Remplacer par votre URL backend (Express + Mongoose)
const API_BASE = 'http://YOUR_BACKEND_URL/api';

const DOMAINES = ['Tous', 'Communication', 'Cognitif', 'Motricité Fine', 'Imitation', 'Autonomie'];

// ─── Données mock (utilisées si API non disponible) ───────────────────────────
const MOCK_ACTIVITES = [
  {
    _id: 'a1', nom: 'Introduction aux PECS', domaine: 'Communication', type: 'PECS',
    duree: 30, difficulte: 3, materiel: 'Classeur PECS, images scratchées',
    objectif: 'Initier le système PECS phases 1-2 pour permettre une communication fonctionnelle.',
    conseils: 'Deux adultes recommandés : un aide-communicant et un récepteur.',
    attention: "Ne nommez pas l'image avant l'échange spontané.",
    icon: '💬', color: '#0ABFBC', succes: 74, sessions: 58,
  },
  {
    _id: 'a2', nom: 'Imitation motrice fine', domaine: 'Imitation', type: 'TEACCH',
    duree: 23, difficulte: 2, materiel: 'Aucun (imitation gestuelle)',
    objectif: 'Reproduire des gestes moteurs fins sur modèle adulte.',
    conseils: 'Commencez par des gestes à 1 composante. Renforcez chaque imitation.',
    attention: "Évitez de verbaliser l'erreur. Reprenez le geste silencieusement.",
    icon: '🪞', color: '#F97316', succes: 63, sessions: 46,
  },
  {
    _id: 'a3', nom: 'Boîtes de tâches TEACCH', domaine: 'Cognitif', type: 'TEACCH',
    duree: 25, difficulte: 3, materiel: 'Boîtes à chaussures, matériel de tri',
    objectif: 'Réaliser des tâches cognitives indépendantes en boîtes numérotées.',
    conseils: "Préparez les 3 boîtes à l'avance. Démonstration silencieuse avant la tâche.",
    attention: "La tâche doit être parfaitement maîtrisée AVANT d'aller vers l'autonomie.",
    icon: '🧩', color: '#E17055', succes: 70, sessions: 33,
  },
  {
    _id: 'a4', nom: 'Motricité fine à la maison', domaine: 'Motricité Fine', type: 'Développement',
    duree: 26, difficulte: 2, materiel: 'Pâte à modeler, perles, pinces à linge',
    objectif: 'Renforcer la préhension fine et la coordination œil-main.',
    conseils: 'Alternez les textures : pâte à modeler puis perles.',
    attention: "Petits objets = risque d'ingestion. Surveillance obligatoire.",
    icon: '✋', color: '#FFB547', succes: 82, sessions: 34,
  },
];

// ─── Service API (MongoDB via backend REST) ───────────────────────────────────
const ApiService = {
  // GET /api/activites
  getAll: async () => {
    try {
      const res = await fetch(`${API_BASE}/activites`);
      if (!res.ok) throw new Error('Erreur serveur');
      return await res.json();
    } catch {
      // Fallback mock si backend non disponible
      return MOCK_ACTIVITES;
    }
  },
  // POST /api/activites
  create: async (data) => {
    try {
      const res = await fetch(`${API_BASE}/activites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Erreur création');
      return await res.json();
    } catch {
      // Mock : retourne l'objet avec un id local
      return { ...data, _id: Date.now().toString() };
    }
  },
  // PUT /api/activites/:id
  update: async (id, data) => {
    try {
      const res = await fetch(`${API_BASE}/activites/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Erreur mise à jour');
      return await res.json();
    } catch {
      return { ...data, _id: id };
    }
  },
  // DELETE /api/activites/:id
  delete: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/activites/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur suppression');
      return true;
    } catch {
      return true; // Mock OK
    }
  },
};

// ─── Formulaire vide ──────────────────────────────────────────────────────────
const EMPTY_FORM = {
  nom: '', domaine: 'Communication', type: 'TEACCH',
  duree: '20', difficulte: 3,
  materiel: '', objectif: '', conseils: '', attention: '',
  icon: '🎯', color: '#5B5BD6',
};

// ─── Modal création/édition ───────────────────────────────────────────────────
const ActivityModal = ({ visible, onClose, onSave, editItem, loading }) => {
  const isEdit = !!editItem;
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (visible) {
      setForm(editItem
        ? { ...editItem, duree: String(editItem.duree) }
        : EMPTY_FORM
      );
    }
  }, [editItem, visible]);

  const update = useCallback((k, v) => setForm(p => ({ ...p, [k]: v })), []);

  const handleSave = () => {
    if (!form.nom.trim()) {
      Alert.alert('Champ requis', "Le nom de l'activité est obligatoire.");
      return;
    }
    onSave({
      ...form,
      duree:    parseInt(form.duree, 10) || 20,
      _id:      editItem?._id || null,
      succes:   editItem?.succes   ?? 0,
      sessions: editItem?.sessions ?? 0,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={S.modalOverlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
          <View style={S.modalSheet}>
            <View style={S.modalHandle} />

            {/* Header */}
            <View style={S.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={S.modalTitle}>
                  {isEdit ? '✏️ Modifier l\'activité' : '🎯 Nouvelle activité'}
                </Text>
                <Text style={S.modalSub}>
                  {isEdit ? 'Modifiez les informations.' : 'Remplissez les détails de l\'activité.'}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={S.modalCloseBtn}>
                <Feather name="x" size={18} color={COLORS.textMuted || '#94A3B8'} />
              </TouchableOpacity>
            </View>

            {/* Corps scrollable */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={S.modalInner}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={S.fieldLabel}>Nom de l'activité *</Text>
              <TextInput style={S.fieldInput} value={form.nom} onChangeText={v => update('nom', v)}
                placeholder="Ex: PECS Phase 3 — Discrimination"
                placeholderTextColor={COLORS.textMuted} returnKeyType="next" />

              <View style={S.formRow}>
                <View style={{ flex: 1 }}>
                  <Text style={S.fieldLabel}>Domaine</Text>
                  <TextInput style={S.fieldInput} value={form.domaine} onChangeText={v => update('domaine', v)}
                    placeholder="Communication" placeholderTextColor={COLORS.textMuted} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={S.fieldLabel}>Type</Text>
                  <TextInput style={S.fieldInput} value={form.type} onChangeText={v => update('type', v)}
                    placeholder="PECS / TEACCH" placeholderTextColor={COLORS.textMuted} />
                </View>
              </View>

              <View style={S.formRow}>
                <View style={{ flex: 1 }}>
                  <Text style={S.fieldLabel}>Durée (min)</Text>
                  <TextInput style={S.fieldInput} value={form.duree} onChangeText={v => update('duree', v)}
                    keyboardType="number-pad" placeholder="20" placeholderTextColor={COLORS.textMuted} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={S.fieldLabel}>Icône emoji</Text>
                  <TextInput style={S.fieldInput} value={form.icon} onChangeText={v => update('icon', v)}
                    placeholder="🎯" placeholderTextColor={COLORS.textMuted} />
                </View>
              </View>

              <Text style={S.fieldLabel}>Difficulté (1 → 5)</Text>
              <View style={S.diffRow}>
                {[1, 2, 3, 4, 5].map(d => (
                  <TouchableOpacity key={d}
                    style={[S.diffBtn, form.difficulte >= d && S.diffBtnActive]}
                    onPress={() => update('difficulte', d)}>
                    <Text style={[S.diffBtnText, form.difficulte >= d && S.diffBtnTextActive]}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={S.fieldLabel}>Matériel requis</Text>
              <TextInput style={S.fieldInput} value={form.materiel} onChangeText={v => update('materiel', v)}
                placeholder="Ex: Classeur PECS, images…" placeholderTextColor={COLORS.textMuted} />

              <Text style={S.fieldLabel}>Objectif thérapeutique</Text>
              <TextInput style={S.fieldTextarea} value={form.objectif} onChangeText={v => update('objectif', v)}
                placeholder="Décrivez l'objectif de cette activité…"
                placeholderTextColor={COLORS.textMuted} multiline textAlignVertical="top" />

              <Text style={S.fieldLabel}>Conseils du thérapeute</Text>
              <TextInput style={S.fieldTextarea} value={form.conseils} onChangeText={v => update('conseils', v)}
                placeholder="Conseils pratiques pour bien réaliser la séance…"
                placeholderTextColor={COLORS.textMuted} multiline textAlignVertical="top" />

              <Text style={S.fieldLabel}>⚠️ Points d'attention</Text>
              <TextInput style={S.fieldTextarea} value={form.attention} onChangeText={v => update('attention', v)}
                placeholder="Erreurs à éviter, précautions importantes…"
                placeholderTextColor={COLORS.textMuted} multiline textAlignVertical="top" />

              <TouchableOpacity onPress={handleSave} activeOpacity={0.85} style={S.submitBtn} disabled={loading}>
                <LinearGradient colors={['#4C1D95', '#6D28D9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={S.submitBtnGradient}>
                  {loading
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Feather name={isEdit ? 'save' : 'plus-circle'} size={18} color="#fff" />}
                  <Text style={S.submitBtnText}>{loading ? 'Enregistrement...' : isEdit ? 'Enregistrer' : "Publier l'activité"}</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={S.cancelBtn} onPress={onClose}>
                <Text style={S.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

// ─── Carte activité ───────────────────────────────────────────────────────────
const ActivityCard = ({ item, onEdit, onDelete }) => (
  <View style={S.actCard}>
    {/* Barre couleur accent en haut */}
    <View style={[S.actAccentBar, { backgroundColor: item.color }]} />

    <View style={S.actBody}>
      {/* Ligne titre */}
      <View style={S.actTop}>
        <View style={[S.actIconWrap, { backgroundColor: item.color + '20' }]}>
          <Text style={S.actIcon}>{item.icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={S.actName} numberOfLines={1}>{item.nom}</Text>
          <Text style={S.actMeta}>{item.domaine} · {item.type} · {item.duree} min</Text>
        </View>
      </View>

      {/* Objectif */}
      <Text style={S.actObjectif} numberOfLines={2}>{item.objectif}</Text>

      {/* Tags */}
      <View style={S.actTags}>
        <View style={[S.actTag, { backgroundColor: item.color + '18' }]}>
          <Feather name="zap" size={10} color={item.color} />
          <Text style={[S.actTagText, { color: item.color }]}>Difficulté {item.difficulte}/5</Text>
        </View>
        {item.materiel ? (
          <View style={[S.actTag, { backgroundColor: '#F1F5F9' }]}>
            <Feather name="package" size={10} color={COLORS.textLight || '#64748B'} />
            <Text style={[S.actTagText, { color: COLORS.textLight || '#64748B' }]} numberOfLines={1}>
              {item.materiel.split(',')[0]}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Stats */}
      <View style={S.actStats}>
        <View style={S.actStatItem}>
          <Text style={[S.actStatVal, { color: item.color }]}>{item.succes}%</Text>
          <Text style={S.actStatLabel}>Succès</Text>
        </View>
        <View style={[S.actStatItem, S.actStatBorder]}>
          <Text style={S.actStatVal}>{item.sessions}</Text>
          <Text style={S.actStatLabel}>Sessions</Text>
        </View>
        <View style={S.actStatItem}>
          <Text style={S.actStatVal}>{item.duree}min</Text>
          <Text style={S.actStatLabel}>Durée</Text>
        </View>
      </View>
    </View>

    {/* Actions */}
    <View style={S.actDivider} />
    <View style={S.actActions}>
      <TouchableOpacity style={S.actBtn} onPress={() => onEdit(item)} activeOpacity={0.8}>
        <Feather name="edit-2" size={14} color={COLORS.text || '#1E293B'} />
        <Text style={S.actBtnText}>Modifier</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[S.actBtn, S.actBtnDanger]} onPress={() => onDelete(item._id)} activeOpacity={0.8}>
        <Feather name="trash-2" size={14} color="#991B1B" />
        <Text style={[S.actBtnText, S.actBtnDangerTxt]}>Supprimer</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// ─── ÉCRAN PRINCIPAL ──────────────────────────────────────────────────────────
export default function ActivitesScreen({ route }) {
  const [activites, setActivites] = useState([]);
  const [domaine,   setDomaine]   = useState('Tous');
  const [search,    setSearch]    = useState('');
  const [modal,     setModal]     = useState(false);
  const [editItem,  setEditItem]  = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingSave, setLoadingSave] = useState(false);

  // Chargement initial depuis MongoDB
  useEffect(() => {
    loadActivites();
  }, []);

  useEffect(() => {
    if (route?.params?.openCreate) {
      setEditItem(null);
      setModal(true);
    }
  }, [route?.params?.openCreate]);

  const loadActivites = async () => {
    setLoadingList(true);
    const data = await ApiService.getAll();
    setActivites(data);
    setLoadingList(false);
  };

  const filtered = activites.filter(a => {
    const matchD = domaine === 'Tous' || a.domaine === domaine;
    const q = search.toLowerCase();
    return matchD && (!q || a.nom.toLowerCase().includes(q) || a.domaine.toLowerCase().includes(q));
  });

  // Sauvegarde (création ou mise à jour) → MongoDB
  const handleSave = useCallback(async (item) => {
    setLoadingSave(true);
    try {
      if (item._id && activites.find(a => a._id === item._id)) {
        // UPDATE
        const updated = await ApiService.update(item._id, item);
        setActivites(p => p.map(a => a._id === updated._id ? updated : a));
        Alert.alert('✅ Activité modifiée', `"${updated.nom}" a été mise à jour.`);
      } else {
        // CREATE
        const created = await ApiService.create(item);
        setActivites(p => [created, ...p]);
        Alert.alert('✅ Activité créée', `"${created.nom}" a été publiée.`);
      }
      setModal(false);
      setEditItem(null);
    } catch {
      Alert.alert('Erreur', 'Impossible de sauvegarder. Réessayez.');
    } finally {
      setLoadingSave(false);
    }
  }, [activites]);

  // Suppression → MongoDB
  const handleDelete = useCallback((id) => {
    Alert.alert('Supprimer ?', "L'activité sera supprimée définitivement.", [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          await ApiService.delete(id);
          setActivites(p => p.filter(a => a._id !== id));
        },
      },
    ]);
  }, []);

  const openEdit   = useCallback((item) => { setEditItem(item); setModal(true); }, []);
  const closeModal = useCallback(() => { setModal(false); setEditItem(null); }, []);

  return (
    <View style={{ flex: 1 }}>
      <AdminLayout activeTab="activites">
        <StatusBar barStyle="light-content" />
        <View style={S.container}>

          {/* ── Header gradient ── */}
          <LinearGradient colors={['#4C1D95', '#1E1B4B']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={S.header}>
               {/* Blobs */}
                        <View style={{ position: 'absolute', left: -60, top: -20, width: 200, height: 200, borderRadius: 100, backgroundColor: '#6D28D9', opacity: 0.35 }} />
                        <View style={{ position: 'absolute', right: -40, bottom: -30, width: 160, height: 160, borderRadius: 80, backgroundColor: '#3B82F6', opacity: 0.18 }} />
              
            <View style={S.headerTopRow}>
              <View>
                <Text style={S.headerGreeting}>Gestion des activités</Text>
                <Text style={S.headerTitle}>
                  Activités <Text style={S.headerAccent}>({activites.length})</Text>
                </Text>
              </View>
              <TouchableOpacity style={S.addHeaderBtn}
                onPress={() => { setEditItem(null); setModal(true); }} activeOpacity={0.85}>
                <Feather name="plus" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Barre de recherche */}
            <View style={S.searchBar}>
              <Feather name="search" size={16} color="rgba(255,255,255,0.6)" />
              <TextInput value={search} onChangeText={setSearch}
                placeholder="Rechercher une activité…"
                placeholderTextColor="rgba(255,255,255,0.45)"
                style={S.searchInput} />
              {!!search && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Feather name="x" size={16} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>

          {/* ── Filtres domaine (horizontal, pas de décalage) ── */}
          <View style={S.filterWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={S.filterContent}
            >
              {DOMAINES.map(d => (
                <TouchableOpacity key={d}
                  style={[S.filterChip, domaine === d && S.filterChipActive]}
                  onPress={() => setDomaine(d)}>
                  <Text style={[S.filterChipText, domaine === d && S.filterChipTextActive]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* ── Bouton créer (pleine largeur, sans décalage) ── */}
          <View style={S.createBtnWrap}>
            <TouchableOpacity onPress={() => { setEditItem(null); setModal(true); }} activeOpacity={0.85}>
              <LinearGradient colors={['#4C1D95', '#6D28D9']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={S.createBtn}>
                <Feather name="plus-circle" size={20} color="#fff" />
                <Text style={S.createBtnText}>Créer une nouvelle activité</Text>
                <Feather name="chevron-right" size={18} color="rgba(255,255,255,0.7)" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* ── Liste ── */}
          {loadingList ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={COLORS.primary || '#7C3AED'} />
              <Text style={{ marginTop: 12, color: COLORS.textMuted, fontSize: 13 }}>Chargement des activités…</Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={S.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {filtered.length === 0 ? (
                <View style={S.emptyBox}>
                  <Text style={S.emptyIcon}>🎯</Text>
                  <Text style={S.emptyText}>Aucune activité trouvée</Text>
                  <Text style={S.emptySub}>
                    {search ? 'Essayez un autre mot-clé' : 'Créez la première activité'}
                  </Text>
                  <TouchableOpacity style={S.emptyBtn}
                    onPress={() => { setEditItem(null); setModal(true); }}>
                    <Text style={S.emptyBtnText}>+ Créer une activité</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                filtered.map(a => (
                  <ActivityCard key={a._id} item={a} onEdit={openEdit} onDelete={handleDelete} />
                ))
              )}
            </ScrollView>
          )}
        </View>
      </AdminLayout>

      {/* Modal HORS AdminLayout */}
      <ActivityModal
        visible={modal}
        editItem={editItem}
        onClose={closeModal}
        onSave={handleSave}
        loading={loadingSave}
      />
    </View>
  );
}