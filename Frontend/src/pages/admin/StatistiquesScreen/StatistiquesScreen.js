import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Modal, StatusBar, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import AdminLayout from '../../../components/Navigation/AdminNavigation';
import { COLORS } from '../../../theme';
import S from './StatistiquesStyles';

const DOMAINE_STATS = [
  { nom: 'Communication', pct: 74, color: '#8B5CF6' },
  { nom: 'Motricité fine', pct: 82, color: '#10B981' },
  { nom: 'Cognitif',       pct: 63, color: '#F59E0B' },
  { nom: 'Imitation',      pct: 55, color: '#F97316' },
  { nom: 'Autonomie',      pct: 41, color: '#EC4899' },
];

const INIT_SPECS = [
  { id: 's1', nom: 'Neurologie pédiatrique', medecins: 4, color: '#8B5CF6' },
  { id: 's2', nom: 'Orthophonie',            medecins: 3, color: '#06B6D4' },
  { id: 's3', nom: 'Psychomotricité',        medecins: 2, color: '#10B981' },
  { id: 's4', nom: 'Pédiatrie',              medecins: 3, color: '#F59E0B' },
];

const SPEC_COLORS = ['#8B5CF6','#06B6D4','#10B981','#F59E0B','#EC4899','#2563EB','#F97316'];

export default function StatistiquesScreen() {
  const [specs, setSpecs]       = useState(INIT_SPECS);
  const [addModal, setAddModal] = useState(false);
  const [newSpec, setNewSpec]   = useState('');

  const addSpec = () => {
    if (!newSpec.trim()) return;
    setSpecs(p => [...p, {
      id: Date.now().toString(),
      nom: newSpec.trim(),
      medecins: 0,
      color: SPEC_COLORS[p.length % SPEC_COLORS.length],
    }]);
    setNewSpec('');
    setAddModal(false);
  };

  const delSpec = (id) =>
    Alert.alert('Supprimer ?', 'Supprimer cette spécialité ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => setSpecs(p => p.filter(s => s.id !== id)) },
    ]);

  return (
    <AdminLayout activeTab="statistiques">
      <StatusBar barStyle="light-content" />
      <ScrollView style={S.container} showsVerticalScrollIndicator={false}
        contentContainerStyle={S.scrollContent}>

        <LinearGradient colors={['#4C1D95', '#1E1B4B']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={S.header}>
             {/* Blobs */}
                 <View style={{ position: 'absolute', left: -60, top: -20, width: 200, height: 200, borderRadius: 100, backgroundColor: '#6D28D9', opacity: 0.35 }} />
                <View style={{ position: 'absolute', right: -40, bottom: -30, width: 160, height: 160, borderRadius: 80, backgroundColor: '#3B82F6', opacity: 0.18 }} />
                        
          <Text style={S.headerGreeting}>Tableau analytique</Text>
          <Text style={S.headerTitle}>
            Statis<Text style={S.headerAccent}>tiques</Text>
          </Text>
        </LinearGradient>

        {/* KPIs haut */}
        <View style={S.kpiRow}>
          <View style={S.kpiCard}>
            <Text style={S.kpiIcon}>📊</Text>
            <Text style={[S.kpiVal, { color: COLORS.primary }]}>74%</Text>
            <Text style={S.kpiLabel}>Taux de succès moyen</Text>
            <View style={[S.kpiBadge, { backgroundColor: '#D1FAE5' }]}>
              <Text style={[S.kpiBadgeText, { color: '#065F46' }]}>+8% ce mois</Text>
            </View>
          </View>
          <View style={S.kpiCard}>
            <Text style={S.kpiIcon}>⭐</Text>
            <Text style={[S.kpiVal, { color: '#F59E0B' }]}>3.4</Text>
            <Text style={S.kpiLabel}>Engagement moyen</Text>
            <View style={[S.kpiBadge, { backgroundColor: '#FEF3C7' }]}>
              <Text style={[S.kpiBadgeText, { color: '#92400E' }]}>+0.2 pts</Text>
            </View>
          </View>
        </View>

        <View style={S.kpiRow}>
          <View style={S.kpiCard}>
            <Text style={S.kpiIcon}>👶</Text>
            <Text style={[S.kpiVal, { color: COLORS.primary }]}>1 240</Text>
            <Text style={S.kpiLabel}>Enfants suivis</Text>
          </View>
          <View style={S.kpiCard}>
            <Text style={S.kpiIcon}>📋</Text>
            <Text style={[S.kpiVal, { color: '#2563EB' }]}>3 450</Text>
            <Text style={S.kpiLabel}>Consultations totales</Text>
          </View>
        </View>

        {/* Répartition par domaine */}
        <View style={[S.section, { marginTop: 6 }]}>
          <View style={S.chartCard}>
            <Text style={S.chartTitle}>Répartition des succès par domaine</Text>
            {DOMAINE_STATS.map((d, i) => (
              <View key={i} style={S.barRow}>
                <Text style={S.barLabel}>{d.nom}</Text>
                <View style={S.barTrack}>
                  <View style={[S.barFill, { width: d.pct + '%', backgroundColor: d.color }]} />
                </View>
                <Text style={[S.barPct, { color: d.color }]}>{d.pct}%</Text>
              </View>
            ))}
          </View>

          {/* Genre */}
          <View style={S.chartCard}>
            <Text style={S.chartTitle}>Répartition par genre</Text>
            <View style={S.barRow}>
              <Text style={S.barLabel}>Garçons (52%)</Text>
              <View style={S.barTrack}>
                <View style={[S.barFill, { width: '52%', backgroundColor: '#2563EB' }]} />
              </View>
              <Text style={[S.barPct, { color: '#2563EB' }]}>645</Text>
            </View>
            <View style={S.barRow}>
              <Text style={S.barLabel}>Filles (48%)</Text>
              <View style={S.barTrack}>
                <View style={[S.barFill, { width: '48%', backgroundColor: '#EC4899' }]} />
              </View>
              <Text style={[S.barPct, { color: '#EC4899' }]}>595</Text>
            </View>
          </View>

          {/* Spécialités */}
          <View style={S.sectionRow}>
            <Text style={S.sectionTitle}>Spécialités ({specs.length})</Text>
            <TouchableOpacity style={S.addSpecBtn} onPress={() => setAddModal(true)}>
              <Feather name="plus" size={14} color={COLORS.primary} />
              <Text style={S.addSpecBtnText}>Ajouter</Text>
            </TouchableOpacity>
          </View>

          {specs.map(spec => (
            <View key={spec.id} style={S.specItem}>
              <View style={[S.specDot, { backgroundColor: spec.color }]} />
              <View style={{ flex: 1 }}>
                <Text style={S.specName}>{spec.nom}</Text>
                <Text style={S.specCount}>{spec.medecins} médecin{spec.medecins !== 1 ? 's' : ''}</Text>
              </View>
              <TouchableOpacity style={S.specDelBtn} onPress={() => delSpec(spec.id)}>
                <Feather name="trash-2" size={14} color="#991B1B" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

      </ScrollView>

      <Modal visible={addModal} transparent animationType="slide" onRequestClose={() => setAddModal(false)}>
        <View style={S.modalOverlay}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setAddModal(false)} />
          <View style={S.modalSheet}>
            <View style={S.modalHandle} />
            <Text style={S.modalTitle}>➕ Nouvelle spécialité</Text>
            <Text style={S.fieldLabel}>Nom de la spécialité *</Text>
            <TextInput style={S.fieldInput} value={newSpec} onChangeText={setNewSpec}
              placeholder="Ex: Neurologie pédiatrique" placeholderTextColor={COLORS.textMuted} autoFocus />
            <LinearGradient colors={['#4C1D95', '#6D28D9']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={S.submitBtn}>
              <TouchableOpacity style={{ paddingVertical: 16, alignItems: 'center', width: '100%' }}
                onPress={addSpec}>
                <Text style={S.submitBtnText}>Ajouter la spécialité</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </AdminLayout>
  );
}