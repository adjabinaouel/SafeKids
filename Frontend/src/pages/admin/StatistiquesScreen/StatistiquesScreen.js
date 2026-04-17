// src/pages/admin/StatistiquesScreen/StatistiquesScreen.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Modal, StatusBar, Alert, ActivityIndicator, Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Circle } from 'react-native-svg';
import AdminLayout from '../../../components/Navigation/AdminNavigation';
import { COLORS } from '../../../theme';
import S from './StatistiquesStyles';

const { width } = Dimensions.get('window');
const API_BASE = 'http://YOUR_BACKEND_URL/api';

const SPEC_COLORS = ['#8B5CF6','#06B6D4','#10B981','#F59E0B','#EC4899','#2563EB','#F97316'];

// ── Fetch helpers ──────────────────────────────────────────────────────────────
async function fetchStats() {
  try {
    const res = await fetch(`${API_BASE}/stats/overview`);
    if (res.ok) return await res.json();
  } catch {}
  return null;
}
async function fetchSpecialites() {
  try {
    const res = await fetch(`${API_BASE}/specialites`);
    if (res.ok) return await res.json();
  } catch {}
  return [];
}
async function createSpecialite(nom) {
  const res = await fetch(`${API_BASE}/specialites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nom }),
  });
  if (res.ok) return await res.json();
  throw new Error('Erreur création');
}
async function deleteSpecialite(id) {
  const res = await fetch(`${API_BASE}/specialites/${id}`, { method: 'DELETE' });
  return res.ok;
}

// ── AnimatedBar ───────────────────────────────────────────────────────────────
const AnimatedBar = ({ pct, color, delay = 0 }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: 1, tension: 60, friction: 10, delay, useNativeDriver: false }).start();
  }, [pct]);
  return (
    <View style={{ height: 8, backgroundColor: color + '22', borderRadius: 4, overflow: 'hidden' }}>
      <Animated.View style={{
        height: '100%', borderRadius: 4, backgroundColor: color,
        width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${pct}%`] }),
      }} />
    </View>
  );
};

// ── LineChart ─────────────────────────────────────────────────────────────────
const LineChart = ({ data = [] }) => {
  if (!data || data.length === 0) return (
    <View style={{ alignItems: 'center', padding: 20 }}>
      <Text style={{ color: '#9CA3AF', fontSize: 13 }}>Aucune donnée disponible</Text>
    </View>
  );
  const chartW = width - 96;
  const chartH = 90;
  const maxV   = Math.max(...data.map(d => d.value), 1);
  const pts    = data.map((d, i) => ({
    x: (i / Math.max(data.length - 1, 1)) * chartW,
    y: chartH - (d.value / maxV) * chartH,
    label: d.label,
  }));
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaD = `${pathD} L${pts[pts.length - 1].x} ${chartH} L0 ${chartH} Z`;

  return (
    <View style={{ paddingHorizontal: 4 }}>
      <Svg width={chartW} height={chartH + 4}>
        <Defs>
          <SvgLinearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
          </SvgLinearGradient>
        </Defs>
        <Path d={areaD} fill="url(#lg)" />
        <Path d={pathD} fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => i % Math.ceil(pts.length / 4) === 0
          ? <Circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#8B5CF6" />
          : null
        )}
      </Svg>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
        {pts.filter((_, i) => i % Math.ceil(pts.length / 5) === 0).map((p, i) => (
          <Text key={i} style={S.chartLabel}>{p.label}</Text>
        ))}
      </View>
    </View>
  );
};

// ── BarChart ──────────────────────────────────────────────────────────────────
const BarChart = ({ newData = [], oldData = [], labels = [] }) => {
  const barH   = 80;
  const maxVal = Math.max(...oldData, ...newData, 1);
  const anims  = useRef(newData.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(60, anims.map(a =>
      Animated.spring(a, { toValue: 1, tension: 60, friction: 10, useNativeDriver: false })
    )).start();
  }, []);

  if (!labels.length) return (
    <View style={{ alignItems: 'center', padding: 20 }}>
      <Text style={{ color: '#9CA3AF', fontSize: 13 }}>Aucune donnée disponible</Text>
    </View>
  );

  return (
    <View style={S.chartWrap}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: barH, paddingHorizontal: 4 }}>
        {labels.map((m, i) => (
          <View key={m} style={{ alignItems: 'center', flex: 1, gap: 3 }}>
            <Animated.View style={{
              width: 10, borderRadius: 5,
              backgroundColor: 'rgba(139,92,246,0.15)',
              height: anims[i]
                ? anims[i].interpolate({ inputRange: [0,1], outputRange: [0, ((oldData[i] || 0) / maxVal) * barH] })
                : 0,
              position: 'absolute', bottom: 0,
            }} />
            <Animated.View style={{
              width: 10, borderRadius: 5,
              backgroundColor: '#8B5CF6',
              height: anims[i]
                ? anims[i].interpolate({ inputRange: [0,1], outputRange: [0, ((newData[i] || 0) / maxVal) * barH] })
                : 0,
              position: 'absolute', bottom: 0,
            }} />
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, paddingHorizontal: 4 }}>
        {labels.map(m => <Text key={m} style={S.chartLabel}>{m}</Text>)}
      </View>
    </View>
  );
};

// ── KpiCard ───────────────────────────────────────────────────────────────────
const KpiCard = ({ icon, value, label, badgeText, badgeColor, badgeBg, color }) => (
  <View style={S.kpiCard}>
    <Text style={{ fontSize: 22 }}>{icon}</Text>
    <Text style={[S.kpiVal, { color }]}>{value ?? '—'}</Text>
    <Text style={S.kpiLabel}>{label}</Text>
    {badgeText ? (
      <View style={[S.kpiBadge, { backgroundColor: badgeBg }]}>
        <Text style={[S.kpiBadgeText, { color: badgeColor }]}>{badgeText}</Text>
      </View>
    ) : <View style={{ height: 22 }} />}
  </View>
);

// ─── ÉCRAN PRINCIPAL ──────────────────────────────────────────────────────────
export default function StatistiquesScreen() {
  const [stats,     setStats]     = useState(null);
  const [specs,     setSpecs]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [addModal,  setAddModal]  = useState(false);
  const [newSpec,   setNewSpec]   = useState('');
  const [savingSpec,setSavingSpec]= useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [s, sp] = await Promise.all([fetchStats(), fetchSpecialites()]);
    setStats(s);
    setSpecs(sp);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, []);

  const handleAddSpec = async () => {
    if (!newSpec.trim()) return;
    setSavingSpec(true);
    try {
      const created = await createSpecialite(newSpec.trim());
      setSpecs(p => [...p, { ...created, color: SPEC_COLORS[p.length % SPEC_COLORS.length] }]);
      setNewSpec('');
      setAddModal(false);
    } catch {
      Alert.alert('Erreur', 'Impossible de créer la spécialité.');
    } finally { setSavingSpec(false); }
  };

  const handleDelSpec = (id) =>
    Alert.alert('Supprimer ?', 'Supprimer cette spécialité ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        await deleteSpecialite(id);
        setSpecs(p => p.filter(s => s._id !== id));
      }},
    ]);

  // ── Stats dérivées ──────────────────────────────────────────────────────────
  const totalEnfants    = stats?.totalEnfants    ?? null;
  const totalConsults   = stats?.totalConsults   ?? null;
  const nouveauxCas     = stats?.nouveauxCasMois ?? null;
  const anciensCas      = stats?.anciensCas      ?? null;
  const tauxSucces      = stats?.tauxSuccesMoyen ?? null;
  const engagement      = stats?.engagementMoyen ?? null;
  const garcons         = stats?.garcons         ?? null;
  const filles          = stats?.filles          ?? null;
  const garconsPct      = (garcons && totalEnfants) ? Math.round((garcons / totalEnfants) * 100) : 52;
  const fillesPct       = 100 - garconsPct;
  const domainesStats   = stats?.domaines        ?? [];
  const evolutionData   = stats?.evolution       ?? [];
  const barNew          = stats?.barNouveaux      ?? [];
  const barOld          = stats?.barAnciens       ?? [];
  const barLabels       = stats?.barLabels        ?? [];

  return (
    <AdminLayout activeTab="statistiques">
      <StatusBar barStyle="light-content" />
      <ScrollView style={S.container} showsVerticalScrollIndicator={false}
        contentContainerStyle={S.scrollContent}>

        {/* ── Header ────────────────────────────────────────────────────── */}
        <LinearGradient colors={['#4C1D95', '#1E1B4B']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={S.header}>
          <View style={{ position: 'absolute', left: -60, top: -20, width: 200, height: 200, borderRadius: 100, backgroundColor: '#6D28D9', opacity: 0.35 }} />
          <View style={{ position: 'absolute', right: -40, bottom: -30, width: 160, height: 160, borderRadius: 80, backgroundColor: '#3B82F6', opacity: 0.18 }} />
          <Text style={S.headerGreeting}>Tableau analytique</Text>
          <Text style={S.headerTitle}>
            Statis<Text style={S.headerAccent}>tiques</Text>
          </Text>
          {/* Refresh button */}
          <TouchableOpacity
            onPress={load}
            style={{ position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 8 }}>
            <Feather name="refresh-cw" size={16} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>

        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', paddingVertical: 60 }}>
            <ActivityIndicator size="large" color={COLORS.primary || '#7C3AED'} />
            <Text style={{ marginTop: 12, color: '#9CA3AF', fontSize: 13 }}>Chargement des données…</Text>
          </View>
        ) : (
          <>
            {/* ── KPIs row 1 ──────────────────────────────────────────────── */}
            <View style={S.kpiRow}>
              <KpiCard
                icon="📊"
                value={tauxSucces !== null ? `${tauxSucces}%` : '—'}
                label="Taux de succès moyen"
                color={COLORS.primary || '#7C3AED'}
                badgeText={stats?.tauxSuccesDelta ? `${stats.tauxSuccesDelta > 0 ? '+' : ''}${stats.tauxSuccesDelta}% ce mois` : null}
                badgeBg="#D1FAE5" badgeColor="#065F46"
              />
              <KpiCard
                icon="⭐"
                value={engagement !== null ? engagement.toFixed(1) : '—'}
                label="Engagement moyen"
                color="#F59E0B"
                badgeText={stats?.engagementDelta ? `+${stats.engagementDelta} pts` : null}
                badgeBg="#FEF3C7" badgeColor="#92400E"
              />
            </View>

            {/* ── KPIs row 2 ──────────────────────────────────────────────── */}
            <View style={S.kpiRow}>
              <KpiCard
                icon="👶"
                value={totalEnfants !== null ? totalEnfants.toLocaleString() : '—'}
                label="Enfants suivis"
                color={COLORS.primary || '#7C3AED'}
              />
              <KpiCard
                icon="📋"
                value={totalConsults !== null ? totalConsults.toLocaleString() : '—'}
                label="Consultations totales"
                color="#2563EB"
              />
            </View>

            {/* ── KPIs row 3 ──────────────────────────────────────────────── */}
            <View style={S.kpiRow}>
              <KpiCard
                icon="📈"
                value={nouveauxCas !== null ? `+${nouveauxCas}` : '—'}
                label="Nouveaux cas (mois)"
                color="#10B981"
                badgeText={stats?.nouveauxPct ? `+${stats.nouveauxPct}%` : null}
                badgeBg="#D1FAE5" badgeColor="#065F46"
              />
              <KpiCard
                icon="🗂️"
                value={anciensCas !== null ? anciensCas.toLocaleString() : '—'}
                label="Anciens cas actifs"
                color="#6366F1"
              />
            </View>

            {/* ── Domaines ────────────────────────────────────────────────── */}
            <View style={[S.section, { marginTop: 6 }]}>
              {domainesStats.length > 0 && (
                <View style={S.chartCard}>
                  <Text style={S.chartTitle}>Répartition des succès par domaine</Text>
                  {domainesStats.map((d, i) => (
                    <View key={i} style={S.barRow}>
                      <Text style={S.barLabel}>{d.nom}</Text>
                      <View style={S.barTrack}>
                        <AnimatedBar pct={d.pct} color={SPEC_COLORS[i % SPEC_COLORS.length]} delay={i * 80} />
                      </View>
                      <Text style={[S.barPct, { color: SPEC_COLORS[i % SPEC_COLORS.length] }]}>{d.pct}%</Text>
                    </View>
                  ))}
                  {domainesStats.length === 0 && (
                    <Text style={{ color: '#9CA3AF', fontSize: 13, textAlign: 'center', paddingVertical: 12 }}>
                      Aucune donnée par domaine
                    </Text>
                  )}
                </View>
              )}

              {/* ── Genre ──────────────────────────────────────────────────── */}
              <View style={S.chartCard}>
                <Text style={S.chartTitle}>Répartition par genre</Text>
                {totalEnfants ? (
                  <>
                    <View style={S.barRow}>
                      <Text style={S.barLabel}>Garçons ({garconsPct}%)</Text>
                      <View style={S.barTrack}>
                        <AnimatedBar pct={garconsPct} color="#2563EB" delay={0} />
                      </View>
                      <Text style={[S.barPct, { color: '#2563EB' }]}>{garcons ?? '—'}</Text>
                    </View>
                    <View style={S.barRow}>
                      <Text style={S.barLabel}>Filles ({fillesPct}%)</Text>
                      <View style={S.barTrack}>
                        <AnimatedBar pct={fillesPct} color="#EC4899" delay={120} />
                      </View>
                      <Text style={[S.barPct, { color: '#EC4899' }]}>{filles ?? '—'}</Text>
                    </View>
                  </>
                ) : (
                  <Text style={{ color: '#9CA3AF', fontSize: 13, textAlign: 'center', paddingVertical: 12 }}>
                    Aucune donnée
                  </Text>
                )}
              </View>

              {/* ── Nouveaux vs Anciens ─────────────────────────────────────── */}
              {barLabels.length > 0 && (
                <View style={S.chartCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Text style={S.chartTitle}>Nouveaux vs Anciens cas</Text>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#8B5CF6' }} />
                        <Text style={{ fontSize: 11, color: '#6B7280' }}>Nouveau</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(139,92,246,0.2)' }} />
                        <Text style={{ fontSize: 11, color: '#6B7280' }}>Ancien</Text>
                      </View>
                    </View>
                  </View>
                  <BarChart newData={barNew} oldData={barOld} labels={barLabels} />
                </View>
              )}

              {/* ── Évolution ──────────────────────────────────────────────── */}
              {evolutionData.length > 0 && (
                <View style={S.chartCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Text style={S.chartTitle}>Évolution des nouveaux cas</Text>
                    {stats?.evolutionDelta && (
                      <View style={{ backgroundColor: '#D1FAE5', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Feather name="trending-up" size={11} color="#059669" />
                        <Text style={{ fontSize: 11, color: '#059669', fontWeight: '600' }}>{stats.evolutionDelta}</Text>
                      </View>
                    )}
                  </View>
                  <LineChart data={evolutionData} />
                </View>
              )}

              {/* ── Spécialités ─────────────────────────────────────────────── */}
              <View style={S.sectionRow}>
                <Text style={S.sectionTitle}>Spécialités ({specs.length})</Text>
                <TouchableOpacity style={S.addSpecBtn} onPress={() => setAddModal(true)}>
                  <Feather name="plus" size={14} color={COLORS.primary || '#7C3AED'} />
                  <Text style={S.addSpecBtnText}>Ajouter</Text>
                </TouchableOpacity>
              </View>

              {specs.length === 0 ? (
                <View style={{ alignItems: 'center', paddingVertical: 20, backgroundColor: '#F9FAFB', borderRadius: 14, marginTop: 8 }}>
                  <Feather name="layers" size={24} color="#D1D5DB" />
                  <Text style={{ color: '#9CA3AF', fontSize: 13, marginTop: 8 }}>Aucune spécialité enregistrée</Text>
                </View>
              ) : (
                specs.map(spec => (
                  <View key={spec._id} style={S.specItem}>
                    <View style={[S.specDot, { backgroundColor: spec.color || SPEC_COLORS[0] }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={S.specName}>{spec.nom}</Text>
                      <Text style={S.specCount}>{spec.medecins ?? 0} médecin{(spec.medecins ?? 0) !== 1 ? 's' : ''}</Text>
                    </View>
                    <TouchableOpacity style={S.specDelBtn} onPress={() => handleDelSpec(spec._id)}>
                      <Feather name="trash-2" size={14} color="#991B1B" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* ── Modal ajout spécialité ──────────────────────────────────────────── */}
      <Modal visible={addModal} transparent animationType="slide" onRequestClose={() => setAddModal(false)}>
        <View style={S.modalOverlay}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setAddModal(false)} />
          <View style={S.modalSheet}>
            <View style={S.modalHandle} />
            <Text style={S.modalTitle}>➕ Nouvelle spécialité</Text>
            <Text style={S.fieldLabel}>Nom de la spécialité *</Text>
            <TextInput
              style={S.fieldInput}
              value={newSpec}
              onChangeText={setNewSpec}
              placeholder="Ex: Neurologie pédiatrique"
              placeholderTextColor={COLORS.textMuted}
              autoFocus
            />
            <LinearGradient colors={['#4C1D95', '#6D28D9']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={S.submitBtn}>
              <TouchableOpacity
                style={{ paddingVertical: 16, alignItems: 'center', width: '100%' }}
                onPress={handleAddSpec}
                disabled={savingSpec}>
                {savingSpec
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={S.submitBtnText}>Ajouter la spécialité</Text>}
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </AdminLayout>
  );
}