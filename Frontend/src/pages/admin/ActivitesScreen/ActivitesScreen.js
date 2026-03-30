import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Modal, StatusBar, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import AdminLayout from '../../../components/Navigation/AdminNavigation';
import { COLORS } from '../../../theme';
import S from './ActivitesStyles';

const DOMAINES = ['Tous', 'Communication', 'Cognitif', 'Motricité Fine', 'Imitation', 'Autonomie'];

// ── Données mock ──────────────────────────────────────────────────────────────
const INIT_ACTIVITES = [
  {
    id: 'a1', nom: 'Introduction aux PECS', domaine: 'Communication', type: 'PECS',
    duree: 30, difficulte: 3, materiel: 'Classeur PECS, images scratchées',
    objectif: 'Initier le système PECS phases 1-2 pour permettre une communication fonctionnelle.',
    conseils: 'Deux adultes recommandés : un aide-communicant et un récepteur.',
    attention: "Ne nommez pas l'image avant l'échange spontané.",
    icon: '💬', color: '#0ABFBC', succes: 74, sessions: 58,
  },
  {
    id: 'a2', nom: 'Imitation motrice fine', domaine: 'Imitation', type: 'TEACCH',
    duree: 23, difficulte: 2, materiel: 'Aucun (imitation gestuelle)',
    objectif: 'Reproduire des gestes moteurs fins sur modèle adulte.',
    conseils: 'Commencez par des gestes à 1 composante. Renforcez chaque imitation réussie.',
    attention: "Évitez de verbaliser l'erreur. Reprenez le geste silencieusement.",
    icon: '🪞', color: '#F97316', succes: 63, sessions: 46,
  },
  {
    id: 'a3', nom: 'Boîtes de tâches TEACCH', domaine: 'Cognitif', type: 'TEACCH',
    duree: 25, difficulte: 3, materiel: 'Boîtes à chaussures, matériel de tri',
    objectif: 'Réaliser des tâches cognitives indépendantes en boîtes numérotées.',
    conseils: "Préparez les 3 boîtes à l'avance. Démonstration silencieuse avant la tâche.",
    attention: "La tâche doit être parfaitement maîtrisée AVANT d'aller vers l'autonomie.",
    icon: '🧩', color: '#E17055', succes: 70, sessions: 33,
  },
  {
    id: 'a4', nom: 'Motricité fine à la maison', domaine: 'Motricité Fine', type: 'Développement',
    duree: 26, difficulte: 2, materiel: 'Pâte à modeler, perles, pinces à linge',
    objectif: 'Renforcer la préhension fine et la coordination œil-main.',
    conseils: 'Alternez les textures : pâte à modeler puis perles.',
    attention: "Petits objets = risque d'ingestion. Surveillance obligatoire.",
    icon: '✋', color: '#FFB547', succes: 82, sessions: 34,
  },
];

// ── Modal activité ─────────────────────────────────────────────────────────────
const ActivityModal = ({ visible, onClose, onSave, editItem }) => {
  const isEdit = !!editItem;
  const empty = { nom: '', domaine: 'Communication', type: 'TEACCH', duree: '20', difficulte: 3,
    materiel: '', objectif: '', conseils: '', attention: '', icon: '🎯', color: '#5B5BD6' };
  const [form, setForm] = useState(empty);

  React.useEffect(() => {
    setForm(editItem ? { ...editItem, duree: String(editItem.duree) } : empty);
  }, [editItem, visible]);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.nom.trim()) { Alert.alert('Champ requis', 'Le nom de l\'activité est obligatoire.'); return; }
    onSave({
      ...form,
      duree: parseInt(form.duree, 10) || 20,
      id: editItem?.id || Date.now().toString(),
      succes: editItem?.succes ?? 0,
      sessions: editItem?.sessions ?? 0,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={S.modalOverlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={S.modalSheet}>
            <ScrollView contentContainerStyle={S.modalInner} keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              <View style={S.modalHandle} />
              <Text style={S.modalTitle}>{isEdit ? '✏️ Modifier l\'activité' : '🎯 Nouvelle activité'}</Text>
              <Text style={S.modalSub}>Remplissez les informations de l'activité thérapeutique.</Text>

              <Text style={S.fieldLabel}>Nom de l'activité *</Text>
              <TextInput style={S.fieldInput} value={form.nom} onChangeText={v => update('nom', v)}
                placeholder="Ex: PECS Phase 3 — Discrimination"
                placeholderTextColor={COLORS.textMuted} />

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
                    keyboardType="numeric" placeholder="20" placeholderTextColor={COLORS.textMuted} />
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
                placeholder="Ex: Classeur PECS, images scratchées…"
                placeholderTextColor={COLORS.textMuted} />

              <Text style={S.fieldLabel}>Objectif thérapeutique</Text>
              <TextInput style={S.fieldTextarea} value={form.objectif} onChangeText={v => update('objectif', v)}
                placeholder="Décrivez l'objectif de cette activité…"
                placeholderTextColor={COLORS.textMuted} multiline />

              <Text style={S.fieldLabel}>Conseils du thérapeute</Text>
              <TextInput style={S.fieldTextarea} value={form.conseils} onChangeText={v => update('conseils', v)}
                placeholder="Conseils pratiques pour bien réaliser la séance…"
                placeholderTextColor={COLORS.textMuted} multiline />

              <Text style={S.fieldLabel}>⚠️ Points d'attention</Text>
              <TextInput style={S.fieldTextarea} value={form.attention} onChangeText={v => update('attention', v)}
                placeholder="Erreurs à éviter, précautions importantes…"
                placeholderTextColor={COLORS.textMuted} multiline />

              <LinearGradient colors={['#4C1D95', '#6D28D9']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={S.submitBtn}>
                <TouchableOpacity style={{ paddingVertical: 16, alignItems: 'center', width: '100%' }}
                  onPress={handleSave}>
                  <Text style={S.submitBtnText}>{isEdit ? 'Enregistrer' : 'Publier l\'activité'}</Text>
                </TouchableOpacity>
              </LinearGradient>
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

// ── Carte activité ─────────────────────────────────────────────────────────────
const ActivityCard = ({ item, onEdit, onDelete }) => (
  <View style={S.actCard}>
    <View style={[S.actAccentBar, { backgroundColor: item.color }]} />
    <View style={S.actBody}>
      <View style={S.actTop}>
        <View style={[S.actIconWrap, { backgroundColor: item.color + '20' }]}>
          <Text style={S.actIcon}>{item.icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={S.actName} numberOfLines={1}>{item.nom}</Text>
          <Text style={S.actMeta}>{item.domaine} · {item.type} · {item.duree} min</Text>
        </View>
      </View>
      <View style={S.actTags}>
        <View style={[S.actTag, { backgroundColor: item.color + '18' }]}>
          <Text style={[S.actTagText, { color: item.color }]}>Difficulté {item.difficulte}/5</Text>
        </View>
        <View style={[S.actTag, { backgroundColor: '#F1F5F9' }]}>
          <Text style={[S.actTagText, { color: COLORS.textLight }]}>{item.materiel.split(',')[0]}</Text>
        </View>
      </View>
      <View style={S.actStats}>
        <View style={S.actStatItem}>
          <Text style={[S.actStatVal, { color: item.color }]}>{item.succes}%</Text>
          <Text style={S.actStatLabel}>Succès</Text>
        </View>
        <View style={S.actStatItem}>
          <Text style={S.actStatVal}>{item.sessions}</Text>
          <Text style={S.actStatLabel}>Sessions</Text>
        </View>
        <View style={S.actStatItem}>
          <Text style={S.actStatVal}>{item.duree}min</Text>
          <Text style={S.actStatLabel}>Durée</Text>
        </View>
      </View>
    </View>
    <View style={S.actDivider} />
    <View style={S.actActions}>
      <TouchableOpacity style={S.actBtn} onPress={() => onEdit(item)}>
        <Feather name="edit-2" size={14} color={COLORS.text} />
        <Text style={S.actBtnText}>Modifier</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[S.actBtn, S.actBtnDanger]} onPress={() => onDelete(item.id)}>
        <Feather name="trash-2" size={14} color="#991B1B" />
        <Text style={[S.actBtnText, S.actBtnDangerTxt]}>Supprimer</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// ── Écran principal ────────────────────────────────────────────────────────────
export default function ActivitesScreen({ route }) {
  const [activites, setActivites] = useState(INIT_ACTIVITES);
  const [domaine, setDomaine]     = useState('Tous');
  const [search, setSearch]       = useState('');
  const [modal, setModal]         = useState(false);
  const [editItem, setEditItem]   = useState(null);

  React.useEffect(() => {
    if (route?.params?.openCreate) { setEditItem(null); setModal(true); }
  }, [route?.params?.openCreate]);

  const filtered = activites.filter(a => {
    const matchD = domaine === 'Tous' || a.domaine === domaine;
    const q = search.toLowerCase();
    return matchD && (!q || a.nom.toLowerCase().includes(q) || a.domaine.toLowerCase().includes(q));
  });

  const save = (item) =>
    setActivites(p =>
      p.find(a => a.id === item.id)
        ? p.map(a => a.id === item.id ? item : a)
        : [item, ...p]
    );

  const del = (id) =>
    Alert.alert('Supprimer ?', 'L\'activité sera supprimée définitivement.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive',
        onPress: () => setActivites(p => p.filter(a => a.id !== id)) },
    ]);

  return (
    <AdminLayout activeTab="activites">
      <StatusBar barStyle="light-content" />
      <View style={S.container}>
        <LinearGradient colors={['#4C1D95', '#1E1B4B']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={S.header}>
          <View style={S.headerTopRow}>
            <View>
              <Text style={S.headerGreeting}>Gestion des activités</Text>
              <Text style={S.headerTitle}>
                Activités <Text style={S.headerAccent}>({activites.length})</Text>
              </Text>
            </View>
          </View>
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

        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          style={S.filterRow} contentContainerStyle={{ paddingRight: 16 }}>
          {DOMAINES.map(d => (
            <TouchableOpacity key={d} style={[S.filterChip, domaine === d && S.filterChipActive]}
              onPress={() => setDomaine(d)}>
              <Text style={[S.filterChipText, domaine === d && S.filterChipTextActive]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <LinearGradient colors={['#4C1D95', '#6D28D9']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={S.createBtn}>
          <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}
            onPress={() => { setEditItem(null); setModal(true); }}>
            <Feather name="plus-circle" size={20} color="#fff" />
            <Text style={S.createBtnText}>Créer une nouvelle activité</Text>
            <Feather name="chevron-right" size={18} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.scrollContent}>
          {filtered.length === 0 ? (
            <View style={S.emptyBox}>
              <Text style={S.emptyIcon}>🎯</Text>
              <Text style={S.emptyText}>Aucune activité trouvée</Text>
              <Text style={S.emptySub}>Essayez un autre mot-clé ou domaine</Text>
            </View>
          ) : (
            filtered.map(a => (
              <ActivityCard key={a.id} item={a}
                onEdit={item => { setEditItem(item); setModal(true); }}
                onDelete={del} />
            ))
          )}
        </ScrollView>
      </View>

      <ActivityModal visible={modal} editItem={editItem}
        onClose={() => { setModal(false); setEditItem(null); }} onSave={save} />
    </AdminLayout>
  );
}