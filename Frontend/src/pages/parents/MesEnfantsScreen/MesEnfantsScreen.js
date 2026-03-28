import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Dimensions, StatusBar, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ParentLayout from '../../../components/Navigation/ParentNavigation';

const { width } = Dimensions.get('window');

// ─── DATA ────────────────────────────────────────────────────────────────────

const CHILDREN = [
  {
    id: 'amine',
    nom: 'Amine',
    age: '5 ans · 8 mois',
    emoji: '👦',
    accentColors: ['#7C3AED', '#A78BFA'],
    ringColor: '#A78BFA',
    ringPct: 74,
    diagnostic: 'TSA niveau 2',
    tags: ['PECS Phase 2', 'TEACCH', '46 sessions'],
    stats: [
      { val: '74%', lbl: 'Taux de succès', change: '↑ +8% ce mois', up: true },
      { val: '3.4',  lbl: 'Engagement /5',  change: '↑ +0.2 pts',    up: true },
      { val: '46',   lbl: 'Sessions totales',change: '+4 ce mois',   up: false },
      { val: '23min',lbl: 'Durée moyenne',  change: 'Stable',        up: false },
    ],
    domaines: [
      { nom: 'Communication', pct: 74,  color: '#A78BFA' },
      { nom: 'Motricité fine', pct: 82, color: '#10B981' },
      { nom: 'Cognitif',       pct: 63, color: '#FCD34D' },
      { nom: 'Imitation',      pct: 55, color: '#FB923C' },
      { nom: 'Autonomie',      pct: 41, color: '#F472B6' },
    ],
    journal: [
      { emoji: '🌟', titre: '1ère demande PECS spontanée !', date: "Aujourd'hui", texte: "Amine a initié l'échange tout seul sans guidance pour demander de l'eau. Énorme progrès !", tags: [{ label: 'PECS', bg: 'rgba(167,139,250,0.25)', color: '#C4B5FD' }, { label: 'Progrès', bg: 'rgba(16,185,129,0.25)', color: '#6EE7B7' }] },
      { emoji: '📦', titre: 'Boîtes TEACCH — 25 min', date: 'Il y a 3j', texte: '3 boîtes complétées sans aide verbale. Légère agitation à 20 min, pause efficace.', tags: [{ label: 'TEACCH', bg: 'rgba(251,146,60,0.25)', color: '#FED7AA' }] },
      { emoji: '🩺', titre: 'Consultation Dr. Meziane', date: 'Il y a 5j', texte: 'Passage PECS Phase 3 recommandé le mois prochain. Maintien motricité fine.', tags: [{ label: 'Médecin', bg: 'rgba(56,189,248,0.25)', color: '#BAE6FD' }] },
      { emoji: '😤', titre: 'Refus puzzle après 17h', date: 'Il y a 7j', texte: 'Fatigue en fin de journée. Note : éviter les activités cognitives après 17h.', tags: [{ label: 'Attention', bg: 'rgba(239,68,68,0.25)', color: '#FCA5A5' }] },
    ],
    insights: [
      { border: '#10B981', texte: '💪 Point fort — Motricité fine excellente (82%), au-dessus de la moyenne pour 5 ans.' },
      { border: '#A78BFA', texte: '📈 Progression — Communication PECS +8% ce mois. Demande spontanée confirmée.' },
      { border: '#FCD34D', texte: '⚠️ À surveiller — Autonomie à 41%. Réduire à 2 bacs TEACCH avant d\'augmenter.' },
      { border: '#38BDF8', texte: '💡 Recommandation — Introduire PECS Phase 3 la semaine prochaine. Critère : 80% sur 2 sessions.' },
    ],
    objectifs: [
      { emoji: '✅', nom: 'Échange PECS Phase 2 spontané', meta: 'Atteint · 20 échanges sans guidance', prog: 100, badgeLabel: 'Terminé', badgeBg: 'rgba(16,185,129,0.2)', badgeColor: '#6EE7B7', progColor: '#10B981' },
      { emoji: '🎯', nom: 'PECS Phase 3 — Discrimination', meta: 'En cours · Début semaine prochaine', prog: 20, badgeLabel: 'En cours', badgeBg: 'rgba(124,58,237,0.25)', badgeColor: '#C4B5FD', progColor: '#A78BFA' },
      { emoji: '⏳', nom: 'Travail autonome TEACCH 3 bacs', meta: 'Planifié · Après maîtrise 80% sur 2 bacs', prog: 0, badgeLabel: 'Planifié', badgeBg: 'rgba(251,191,36,0.15)', badgeColor: '#FDE68A', progColor: '#FCD34D' },
      { emoji: '🔓', nom: 'Autonomie quotidienne — habillage', meta: 'Proposé par Dr. Meziane · Pas commencé', prog: 0, badgeLabel: 'Nouveau', badgeBg: 'rgba(239,68,68,0.15)', badgeColor: '#FCA5A5', progColor: '#EF4444' },
    ],
  },
  {
    id: 'lina',
    nom: 'Lina',
    age: '7 ans · 14 mois',
    emoji: '👧',
    accentColors: ['#2563EB', '#38BDF8'],
    ringColor: '#38BDF8',
    ringPct: 88,
    diagnostic: 'TSA niveau 1',
    tags: ['TEACCH Avancé', 'Développement', '63 sessions'],
    stats: [
      { val: '88%', lbl: 'Taux de succès', change: '↑ +5% ce mois', up: true },
      { val: '3.7',  lbl: 'Engagement /5',  change: '↑ +0.3',        up: true },
      { val: '63',   lbl: 'Sessions totales',change: '+6 ce mois',   up: false },
      { val: '28min',lbl: 'Durée moyenne',  change: '↑ +3min',       up: true },
    ],
    domaines: [
      { nom: 'Communication', pct: 88, color: '#38BDF8' },
      { nom: 'Social',         pct: 71, color: '#A78BFA' },
      { nom: 'Autonomie',      pct: 57, color: '#FCD34D' },
      { nom: 'Cognitif',       pct: 79, color: '#10B981' },
    ],
    journal: [
      { emoji: '🌟', titre: 'Progrès lecture pictogrammes', date: "Aujourd'hui", texte: 'Lina a reconnu 8 pictogrammes nouveaux en séance autonome. Record !', tags: [{ label: 'TEACCH', bg: 'rgba(56,189,248,0.25)', color: '#BAE6FD' }, { label: 'Progrès', bg: 'rgba(16,185,129,0.25)', color: '#6EE7B7' }] },
    ],
    insights: [
      { border: '#10B981', texte: '💪 Point fort — Communication très forte (88%). Lina est proche de l\'objectif niveau 1.' },
      { border: '#38BDF8', texte: '📈 Progression — Cognitif à 79%, en forte hausse sur 3 mois.' },
      { border: '#FCD34D', texte: '⚠️ À travailler — Autonomie à 57%. Renforcer les routines quotidiennes.' },
    ],
    objectifs: [
      { emoji: '✅', nom: 'Autonomie habillage le matin', meta: 'Atteint · 5 jours consécutifs', prog: 100, badgeLabel: 'Terminé', badgeBg: 'rgba(16,185,129,0.2)', badgeColor: '#6EE7B7', progColor: '#10B981' },
      { emoji: '🎯', nom: 'Interactions sociales structurées', meta: 'En cours · 3/5 étapes validées', prog: 60, badgeLabel: 'En cours', badgeBg: 'rgba(56,189,248,0.2)', badgeColor: '#BAE6FD', progColor: '#38BDF8' },
    ],
  },
];

// ─── RING COMPONENT ──────────────────────────────────────────────────────────

const RING_R = 23;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_R;

function ProgressRing({ pct, color }) {
  const offset = RING_CIRCUMFERENCE * (1 - pct / 100);
  return (
    <View style={{ width: 56, height: 56, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={56} height={56} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={28} cy={28} r={RING_R} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={5} />
        <Circle cx={28} cy={28} r={RING_R} fill="none" stroke={color} strokeWidth={5}
          strokeLinecap="round" strokeDasharray={RING_CIRCUMFERENCE} strokeDashoffset={offset} />
      </Svg>
      <Text style={{ fontSize: 13, fontWeight: '800', color: '#fff' }}>{pct}%</Text>
    </View>
  );
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────

export default function MesEnfantsScreen() {
  const navigation = useNavigation();
  const [selectedChild, setSelectedChild] = useState(CHILDREN[0]);
  const [activeTab, setActiveTab] = useState('apercu');

  const TABS = [
    { key: 'apercu', label: 'Aperçu' },
    { key: 'journal', label: 'Journal' },
    { key: 'ia', label: 'Analyse IA' },
    { key: 'objectifs', label: 'Objectifs' },
  ];

  return (
    <ParentLayout activeTab="enfants">
      <View style={{ flex: 1, backgroundColor: '#0F0A2E' }}>
        <StatusBar barStyle="light-content" />

        {/* HEADER */}
        <LinearGradient
          colors={['#1E1B4B', '#0F0A2E']}
          style={S.header}
        >
          <View style={S.headerRow}>
            <View>
              <Text style={S.greeting}>Bonjour, Sara 👋</Text>
              <Text style={S.headerTitle}>
                Mes <Text style={{ color: '#FCD34D' }}>Enfants</Text>
              </Text>
            </View>
            <View style={S.avatarBtn}>
              <Text style={{ fontSize: 22 }}>👩</Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

          {/* DOCTOR BANNER */}
          <View style={S.doctorBanner}>
            <LinearGradient colors={['#7C3AED', '#2563EB']} style={S.docAvatar}>
              <Text style={{ fontSize: 20 }}>🩺</Text>
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={S.docName}>Dr. Karim Meziane</Text>
              <Text style={S.docRole}>Médecin référent · Gère les profils</Text>
            </View>
            <View style={S.docBadge}>
              <Text style={S.docBadgeText}>Actif</Text>
            </View>
          </View>

          {/* SECTION LABEL */}
          <Text style={S.sectionLabel}>Enfants suivis</Text>

          {/* CHILDREN HORIZONTAL SCROLL */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
            style={{ marginBottom: 24 }}>

            {CHILDREN.map(child => (
              <TouchableOpacity
                key={child.id}
                activeOpacity={0.85}
                onPress={() => { setSelectedChild(child); setActiveTab('apercu'); }}
                style={[S.childCard, selectedChild.id === child.id && S.childCardActive]}
              >
                <LinearGradient
                  colors={child.accentColors}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={S.childCardAccent}
                />
                <Text style={{ fontSize: 36, marginBottom: 8 }}>{child.emoji}</Text>
                <Text style={S.childName}>{child.nom}</Text>
                <Text style={S.childAge}>{child.age}</Text>
                <ProgressRing pct={child.ringPct} color={child.ringColor} />
                <Text style={S.childDomain}>Communication</Text>
              </TouchableOpacity>
            ))}

            {/* ADD CARD */}
            <View style={S.addCard}>
              <Text style={{ fontSize: 28, opacity: 0.4 }}>🔒</Text>
              <Text style={S.addCardText}>Ajouté par{'\n'}le médecin</Text>
            </View>
          </ScrollView>

          {/* DETAIL PANEL */}
          <View style={S.detailCard}>

            {/* HERO */}
            <View style={S.detailHero}>
              <View style={S.detailAvatar}>
                <Text style={{ fontSize: 30 }}>{selectedChild.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={S.detailName}>{selectedChild.nom} Benali</Text>
                <Text style={S.detailMeta}>{selectedChild.age.split('·')[0].trim()} · Diagnostiqué {selectedChild.diagnostic}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {selectedChild.tags.map((t, i) => (
                    <View key={i} style={S.detailTag}>
                      <Text style={S.detailTagText}>{t}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <TouchableOpacity
                style={[S.detailAction, { backgroundColor: `${selectedChild.accentColors[0]}66` }]}
                onPress={() => navigation.navigate('Messages')}
              >
                <Text style={S.detailActionText}>💬 Dr.</Text>
              </TouchableOpacity>
            </View>

            {/* TABS */}
            <View style={S.tabs}>
              {TABS.map(tab => (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  style={[S.tabBtn, activeTab === tab.key && S.tabBtnActive]}
                >
                  <Text style={[S.tabBtnText, activeTab === tab.key && S.tabBtnTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ── APERÇU ── */}
            {activeTab === 'apercu' && (
              <View style={S.tabContent}>
                <View style={S.statsGrid}>
                  {selectedChild.stats.map((s, i) => (
                    <View key={i} style={S.statBox}>
                      <Text style={S.statVal}>{s.val}</Text>
                      <Text style={S.statLbl}>{s.lbl}</Text>
                      <Text style={[S.statChange, s.up && { color: '#10B981' }]}>{s.change}</Text>
                    </View>
                  ))}
                </View>
                <Text style={S.subLabel}>Progression par domaine</Text>
                {selectedChild.domaines.map((d, i) => (
                  <View key={i} style={S.domainRow}>
                    <Text style={S.domainLbl}>{d.nom}</Text>
                    <View style={S.domainTrack}>
                      <View style={[S.domainFill, { width: `${d.pct}%`, backgroundColor: d.color }]} />
                    </View>
                    <Text style={[S.domainPct, { color: d.color }]}>{d.pct}%</Text>
                  </View>
                ))}
              </View>
            )}

            {/* ── JOURNAL ── */}
            {activeTab === 'journal' && (
              <View style={S.tabContent}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#fff' }}>Journal de développement</Text>
                  <TouchableOpacity style={S.addEntryBtn}>
                    <Text style={S.addEntryText}>+ Entrée</Text>
                  </TouchableOpacity>
                </View>
                {selectedChild.journal.map((entry, i) => (
                  <View key={i} style={S.journalEntry}>
                    <Text style={{ fontSize: 22, width: 32, textAlign: 'center', marginTop: 2 }}>{entry.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={S.jTitle} numberOfLines={1}>{entry.titre}</Text>
                        <Text style={S.jDate}>{entry.date}</Text>
                      </View>
                      <Text style={S.jText}>{entry.texte}</Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                        {entry.tags.map((tag, j) => (
                          <View key={j} style={[S.jTag, { backgroundColor: tag.bg }]}>
                            <Text style={[S.jTagText, { color: tag.color }]}>{tag.label}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* ── ANALYSE IA ── */}
            {activeTab === 'ia' && (
              <View style={S.tabContent}>
                <View style={S.aiPanel}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <LinearGradient colors={['#7C3AED', '#2563EB']} style={S.aiGlyph}>
                      <Text style={{ fontSize: 18 }}>✨</Text>
                    </LinearGradient>
                    <View>
                      <Text style={S.aiTitle}>Analyse IA — {selectedChild.nom}</Text>
                      <Text style={S.aiSub}>{selectedChild.stats[2].val} sessions analysées · Mis à jour aujourd'hui</Text>
                    </View>
                  </View>
                  {selectedChild.insights.map((ins, i) => (
                    <View key={i} style={[S.aiInsight, { borderLeftColor: ins.border }]}>
                      <Text style={S.aiInsightText}>{ins.texte}</Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity style={S.aiCTA}
                  onPress={() => navigation.navigate('ActivityPlayer', { ia: true, child: selectedChild.nom })}>
                  <Text style={S.aiCTAText}>Générer le plan hebdomadaire IA →</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── OBJECTIFS ── */}
            {activeTab === 'objectifs' && (
              <View style={S.tabContent}>
                <Text style={S.subLabel}>Objectifs thérapeutiques</Text>
                {selectedChild.objectifs.map((obj, i) => (
                  <View key={i} style={S.objectifRow}>
                    <View style={[S.objIcon, { backgroundColor: obj.badgeBg }]}>
                      <Text style={{ fontSize: 18 }}>{obj.emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={S.objName}>{obj.nom}</Text>
                      <Text style={S.objMeta}>{obj.meta}</Text>
                      {obj.prog > 0 && obj.prog < 100 && (
                        <View style={S.objProgTrack}>
                          <View style={[S.objProgFill, { width: `${obj.prog}%`, backgroundColor: obj.progColor }]} />
                        </View>
                      )}
                    </View>
                    <View style={[S.objBadge, { backgroundColor: obj.badgeBg }]}>
                      <Text style={[S.objBadgeText, { color: obj.badgeColor }]}>{obj.badgeLabel}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

          </View>
        </ScrollView>
      </View>
    </ParentLayout>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  header: { paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  greeting: { fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#fff', letterSpacing: -0.5, marginTop: 2 },
  avatarBtn: { width: 46, height: 46, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },

  doctorBanner: { marginHorizontal: 20, marginBottom: 20, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  docAvatar: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  docName: { fontSize: 13, fontWeight: '800', color: '#fff' },
  docRole: { fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 1 },
  docBadge: { backgroundColor: 'rgba(16,185,129,0.2)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.4)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  docBadgeText: { fontSize: 10, fontWeight: '800', color: '#10B981' },

  sectionLabel: { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 1.2, paddingHorizontal: 20, marginBottom: 12 },

  childCard: { width: 160, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', borderRadius: 22, padding: 18, alignItems: 'center', position: 'relative', overflow: 'hidden' },
  childCardActive: { backgroundColor: 'rgba(255,255,255,0.14)', borderColor: 'rgba(255,255,255,0.35)' },
  childCardAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderRadius: 0 },
  childName: { fontSize: 15, fontWeight: '800', color: '#fff', marginBottom: 3 },
  childAge: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 12 },
  childDomain: { fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 8 },

  addCard: { width: 130, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)', borderStyle: 'dashed', borderRadius: 22, alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 32 },
  addCardText: { fontSize: 11, color: 'rgba(255,255,255,0.35)', textAlign: 'center', fontWeight: '700', lineHeight: 16 },

  detailCard: { marginHorizontal: 16, marginBottom: 16, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', borderRadius: 24, overflow: 'hidden' },

  detailHero: { padding: 20, flexDirection: 'row', alignItems: 'center', gap: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  detailAvatar: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)' },
  detailName: { fontSize: 18, fontWeight: '900', color: '#fff' },
  detailMeta: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 3 },
  detailTag: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  detailTagText: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.8)' },
  detailAction: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  detailActionText: { fontSize: 12, fontWeight: '800', color: '#fff' },

  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 16 },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 13, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: '#A78BFA' },
  tabBtnText: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.4)' },
  tabBtnTextActive: { color: '#fff' },

  tabContent: { padding: 18 },
  subLabel: { fontSize: 12, fontWeight: '800', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  statBox: { flex: 1, minWidth: '45%', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 14, alignItems: 'center' },
  statVal: { fontSize: 22, fontWeight: '900', color: '#fff' },
  statLbl: { fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 3, fontWeight: '600' },
  statChange: { fontSize: 10, marginTop: 4, fontWeight: '700', color: 'rgba(255,255,255,0.35)' },

  domainRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  domainLbl: { fontSize: 11, color: 'rgba(255,255,255,0.55)', width: 90, fontWeight: '600' },
  domainTrack: { flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' },
  domainFill: { height: 6, borderRadius: 3 },
  domainPct: { fontSize: 11, fontWeight: '800', width: 34, textAlign: 'right' },

  journalEntry: { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 14, marginBottom: 10, flexDirection: 'row', gap: 12 },
  jTitle: { fontSize: 13, fontWeight: '800', color: '#fff', flex: 1, marginRight: 8 },
  jDate: { fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: '700' },
  jText: { fontSize: 11, color: 'rgba(255,255,255,0.55)', lineHeight: 17, marginTop: 4 },
  jTag: { borderRadius: 7, paddingHorizontal: 9, paddingVertical: 3 },
  jTagText: { fontSize: 10, fontWeight: '700' },

  addEntryBtn: { backgroundColor: 'rgba(124,58,237,0.2)', borderWidth: 1, borderColor: 'rgba(167,139,250,0.3)', borderRadius: 9, paddingHorizontal: 12, paddingVertical: 5 },
  addEntryText: { fontSize: 10, fontWeight: '800', color: '#A78BFA' },

  aiPanel: { backgroundColor: 'rgba(124,58,237,0.15)', borderWidth: 1, borderColor: 'rgba(167,139,250,0.35)', borderRadius: 18, padding: 16, marginBottom: 12 },
  aiGlyph: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  aiTitle: { fontSize: 14, fontWeight: '800', color: '#fff' },
  aiSub: { fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 1 },
  aiInsight: { borderRadius: 12, padding: 10, marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.07)', borderLeftWidth: 3 },
  aiInsightText: { fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 18 },
  aiCTA: { backgroundColor: 'rgba(124,58,237,0.25)', borderWidth: 1, borderColor: 'rgba(167,139,250,0.4)', borderRadius: 14, padding: 14, alignItems: 'center' },
  aiCTAText: { fontSize: 13, fontWeight: '800', color: '#C4B5FD' },

  objectifRow: { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  objIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  objName: { fontSize: 13, fontWeight: '800', color: '#fff' },
  objMeta: { fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 },
  objProgTrack: { marginTop: 8, height: 4, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' },
  objProgFill: { height: 4, borderRadius: 2 },
  objBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  objBadgeText: { fontSize: 10, fontWeight: '800' },
});
