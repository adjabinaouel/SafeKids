import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, Modal, Dimensions, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ParentLayout from '../../../components/Navigation/ParentNavigation';
import S, { COLORS } from './ActivitiesStyles';

const { width } = Dimensions.get('window');
const IS_TABLET = width >= 768;

export const ACTIVITIES = [
  {
    id: '1', nom: 'Imitation motrice fine', domaine: 'Imitation', type: 'TEACCH',
    icon: '🪞', color: '#F97316', gradient: ['#F97316', '#FB923C'],
    engagement_moyen: 3.37, succes_pct: 63, nb_enfants: 46, nb_sessions: 46,
    duree: 23, video_url: 'https://www.youtube.com/watch?v=OJoJIdvABss',
    video_duree_sec: 240, difficulte: 2, materiel: 'aucun (imitation gestuelle)',
    notes: [
      { titre: 'Objectif', texte: "Reproduire des gestes moteurs fins sur modèle.", color: '#F97316' },
      { titre: 'Conseils', texte: "Commencez par des gestes à 1 composante. Renforcez chaque imitation.", color: '#10B981' },
      { titre: '⚠️ Attention', texte: "Évitez de verbaliser l'erreur. Reprenez le geste silencieusement.", color: '#EF4444' },
      { titre: 'Durée', texte: "15 à 23 min max. Pause si l'attention diminue.", color: '#F59E0B' },
    ],
  },
  {
    id: '2', nom: 'Introduction aux PECS (Vidéo Classique)', domaine: 'Communication', type: 'PECS',
    icon: '💬', color: '#0ABFBC', gradient: ['#0ABFBC', '#4776E6'],
    engagement_moyen: 3.40, succes_pct: 74, nb_enfants: 58, nb_sessions: 58,
    duree: 30, video_url: 'https://www.youtube.com/watch?v=rsDBJyrcyh0',
    video_duree_sec: 600, difficulte: 3, materiel: 'classeur de communication, images',
    notes: [
      { titre: 'Objectif', texte: "Initier le système PECS phases 1-2.", color: '#0ABFBC' },
      { titre: 'Conseils', texte: "Deux adultes recommandés : aide-communicant + récepteur.", color: '#10B981' },
      { titre: '⚠️ Attention', texte: "Ne nommez pas l'image avant l'échange.", color: '#EF4444' },
      { titre: 'Durée', texte: "20 à 30 min. Multipliez les opportunités.", color: '#F59E0B' },
    ],
  },
  {
    id: '3', nom: 'Trier des formes géométriques', domaine: 'Cognitif', type: 'TEACCH',
    icon: '🔷', color: '#FF6584', gradient: ['#FF6584', '#FF8E53'],
    engagement_moyen: 3.18, succes_pct: 67, nb_enfants: 39, nb_sessions: 39,
    duree: 29, video_url: 'https://www.youtube.com/watch?v=NYciuct0Xy8',
    video_duree_sec: 345, difficulte: 2, materiel: 'formes géométriques, bac de tri',
    notes: [
      { titre: 'Objectif', texte: "Discrimination visuelle non-verbale par tri.", color: '#FF6584' },
      { titre: 'Conseils', texte: "Plateau TEACCH gauche → droite. 3 formes max.", color: '#10B981' },
      { titre: '⚠️ Attention', texte: "Restez silencieux pendant la tâche.", color: '#EF4444' },
      { titre: 'Durée', texte: "20 à 29 min.", color: '#F59E0B' },
    ],
  },
  {
    id: '4', nom: 'Motricité fine à la maison', domaine: 'Motricité Fine', type: 'Développement',
    icon: '✋', color: '#FFB547', gradient: ['#FFB547', '#FF6B35'],
    engagement_moyen: 3.50, succes_pct: 82, nb_enfants: 34, nb_sessions: 34,
    duree: 26, video_url: 'https://www.youtube.com/watch?v=bEH0TsjdB24',
    video_duree_sec: 300, difficulte: 2, materiel: 'pâte à modeler, perles, pinces',
    notes: [
      { titre: 'Objectif', texte: "Renforcer la préhension fine et coordination œil-main.", color: '#FFB547' },
      { titre: 'Conseils', texte: "Alternez les textures. Pâte à modeler puis perles.", color: '#10B981' },
      { titre: '⚠️ Attention', texte: "Petits objets = risque d'ingestion. Surveillez.", color: '#EF4444' },
      { titre: 'Durée', texte: "20 à 26 min. 3 rotations de 8 min.", color: '#F59E0B' },
    ],
  },
  {
    id: '5', nom: 'PECS Phases 1-3 (Protocole complet)', domaine: 'Communication', type: 'PECS',
    icon: '📋', color: '#2ECC71', gradient: ['#2ECC71', '#1A936F'],
    engagement_moyen: 3.49, succes_pct: 81, nb_enfants: 57, nb_sessions: 57,
    duree: 7, video_url: 'https://www.youtube.com/watch?v=EuYseDl2jm8',
    video_duree_sec: 480, difficulte: 4, materiel: 'classeur PECS, images scratchées',
    notes: [
      { titre: 'Objectif', texte: "Progression structurée phases 1, 2 et 3 du protocole PECS.", color: '#2ECC71' },
      { titre: 'Conseils', texte: "Respectez les critères de passage (80% sur 2 sessions).", color: '#10B981' },
      { titre: '⚠️ Attention', texte: "Ne passez pas à la phase suivante prématurément.", color: '#EF4444' },
      { titre: 'Durée', texte: "7-10 min, 3-5 fois/jour.", color: '#F59E0B' },
    ],
  },
  {
    id: '6', nom: "PECS Phase 1 : L'échange physique", domaine: 'Communication', type: 'PECS',
    icon: '🤝', color: '#A29BFE', gradient: ['#A29BFE', '#6C5CE7'],
    engagement_moyen: 3.44, succes_pct: 74, nb_enfants: 54, nb_sessions: 54,
    duree: 17, video_url: 'https://www.youtube.com/watch?v=eNbucDWEfpg',
    video_duree_sec: 1621, difficulte: 3, materiel: "image de l'objet renforcé, objet renforcé",
    notes: [
      { titre: 'Objectif', texte: "Initier un échange physique d'image pour obtenir l'objet désiré.", color: '#A29BFE' },
      { titre: 'Conseils', texte: "Guide la main de derrière. Récepteur attend l'image.", color: '#10B981' },
      { titre: '⚠️ Attention', texte: "Ne verbalisez pas 'donne-moi'. L'échange doit être spontané.", color: '#EF4444' },
      { titre: 'Durée', texte: "10 à 17 min. Visez 20 échanges réussis.", color: '#F59E0B' },
    ],
  },
  {
    id: '7', nom: 'Exercices motricité fine', domaine: 'Motricité Fine', type: 'Développement',
    icon: '🖐️', color: '#FD79A8', gradient: ['#FD79A8', '#E84393'],
    engagement_moyen: 3.16, succes_pct: 59, nb_enfants: 56, nb_sessions: 56,
    duree: 7, video_url: 'https://www.youtube.com/watch?v=FYDSBTJqDz4',
    video_duree_sec: 180, difficulte: 1, materiel: 'petits objets, contenants, pinces',
    notes: [
      { titre: 'Objectif', texte: "Améliorer la préhension et dextérité digitale.", color: '#FD79A8' },
      { titre: 'Conseils', texte: "Progressez du plus gros au plus petit.", color: '#10B981' },
      { titre: '⚠️ Attention', texte: "Petits objets = risque d'ingestion.", color: '#EF4444' },
      { titre: 'Durée', texte: "7 à 10 min. Intégrable dans la routine.", color: '#F59E0B' },
    ],
  },
  {
    id: '8', nom: 'Boîtes de tâches TEACCH', domaine: 'Cognitif', type: 'TEACCH',
    icon: '🧩', color: '#E17055', gradient: ['#E17055', '#FDCB6E'],
    engagement_moyen: 3.55, succes_pct: 70, nb_enfants: 33, nb_sessions: 33,
    duree: 25, video_url: 'https://www.youtube.com/watch?v=2mKmrl8nsEs',
    video_duree_sec: 240, difficulte: 3, materiel: "boîtes à chaussures, matériel de tri",
    notes: [
      { titre: 'Objectif', texte: "Tâches cognitives indépendantes en boîtes numérotées.", color: '#E17055' },
      { titre: 'Conseils', texte: "Préparez les 3 boîtes à l'avance. Démonstration silencieuse.", color: '#10B981' },
      { titre: '⚠️ Attention', texte: "La tâche doit être maîtrisée AVANT l'autonomie.", color: '#EF4444' },
      { titre: 'Durée', texte: "20 à 25 min. Ritualisez : même heure, même place.", color: '#F59E0B' },
    ],
  },
  {
    id: '9', nom: 'Travail autonome TEACCH', domaine: 'Autonomie', type: 'TEACCH',
    icon: '📦', color: '#00CEC9', gradient: ['#00CEC9', '#0984E3'],
    engagement_moyen: 2.78, succes_pct: 57, nb_enfants: 23, nb_sessions: 23,
    duree: 23, video_url: 'https://www.youtube.com/watch?v=peljI65qGrg',
    video_duree_sec: 420, difficulte: 4, materiel: 'étagères, bacs numérotés',
    notes: [
      { titre: 'Objectif', texte: "Travail totalement autonome via structuration TEACCH.", color: '#00CEC9' },
      { titre: 'Conseils', texte: "Commencez par 2 bacs. La zone 'terminé' est essentielle.", color: '#10B981' },
      { titre: '⚠️ Attention', texte: "Si aide verbale nécessaire, réduisez la complexité.", color: '#EF4444' },
      { titre: 'Durée', texte: "15 à 23 min. Construit sur plusieurs semaines.", color: '#F59E0B' },
    ],
  },
  {
    id: '10', nom: 'Puzzle à encastrement', domaine: 'Motricité Fine', type: 'TEACCH',
    icon: '🔲', color: '#6C5CE7', gradient: ['#6C5CE7', '#A29BFE'],
    engagement_moyen: 3.04, succes_pct: 57, nb_enfants: 28, nb_sessions: 28,
    duree: 12, video_url: 'https://www.youtube.com/watch?v=d4xH2S8dOXk',
    video_duree_sec: 120, difficulte: 1, materiel: 'puzzle à encastrement, plateau TEACCH',
    notes: [
      { titre: 'Objectif', texte: "Discrimination visuelle et motricité fine.", color: '#6C5CE7' },
      { titre: 'Conseils', texte: "Montrez le modèle complet. Guidez pour les premières pièces.", color: '#10B981' },
      { titre: '⚠️ Attention', texte: "3 succès consécutifs sans aide avant d'augmenter.", color: '#EF4444' },
      { titre: 'Durée', texte: "10 à 12 min. Idéal en début de séance.", color: '#F59E0B' },
    ],
  },
];

const DOMAINES = ['Tous', ...new Set(ACTIVITIES.map(a => a.domaine))];

const getDayActivities = () => {
  const day = new Date().getDate();
  const byDomain = {};
  DOMAINES.filter(d => d !== 'Tous').forEach(domaine => {
    const list = ACTIVITIES.filter(a => a.domaine === domaine);
    byDomain[domaine] = list[day % list.length];
  });
  return byDomain;
};

const DiffDots = ({ level, color }) => (
  <View style={S.diffRow}>
    {[1, 2, 3, 4, 5].map(i => (
      <View key={i} style={[S.diffDot, { backgroundColor: i <= level ? color : COLORS.border }]} />
    ))}
  </View>
);

const DetailModal = ({ activity, visible, onClose, onPlay, onFeedback }) => {
  if (!activity) return null;
  return (
    <Modal visible={visible} transparent={false} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
        <View style={S.modalTopBar}>
          <TouchableOpacity onPress={onClose} style={S.modalCloseBtn}>
            <Feather name="x" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
          <Text style={S.modalTopBarTitle} numberOfLines={1}>{activity.nom}</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 160 }}>
          <LinearGradient
            colors={activity.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={S.modalHero}
          >
            <Text style={S.modalHeroIcon}>{activity.icon}</Text>
            <Text style={S.modalHeroName}>{activity.nom}</Text>
            <View style={S.modalHeroTags}>
              {[activity.type, activity.domaine, `${activity.duree} min`].map((t, i) => (
                <View key={i} style={S.modalTag}>
                  <Text style={S.modalTagText}>{t}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>

          <View style={S.modalStatsRow}>
            {[
              { icon: '✅', label: 'Succès', value: `${activity.succes_pct}%` },
              { icon: '⭐', label: 'Engagement', value: `${activity.engagement_moyen}/5` },
              { icon: '👥', label: 'Enfants', value: `${activity.nb_enfants}` },
              { icon: '📊', label: 'Sessions', value: `${activity.nb_sessions}` },
            ].map((s, i) => (
              <View key={i} style={S.modalStatCard}>
                <Text style={S.modalStatIcon}>{s.icon}</Text>
                <Text style={[S.modalStatValue, { color: activity.color }]}>{s.value}</Text>
                <Text style={S.modalStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          <View style={S.modalSection}>
            <Text style={S.modalSectionTitle}>Difficulté</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 10, marginTop: 6 }}>
              <DiffDots level={activity.difficulte} color={activity.color} />
              <Text style={{ fontSize: 12, color: COLORS.textMuted }}>
                {activity.nb_sessions} sessions enregistrées
              </Text>
            </View>
          </View>

          <View style={S.modalSection}>
            <Text style={S.modalSectionTitle}>📦 Matériel requis</Text>
            <Text style={S.modalSectionText}>{activity.materiel}</Text>
          </View>

          {activity.notes && (
            <View style={S.modalSection}>
              <Text style={S.modalSectionTitle}>📋 Notes du thérapeute</Text>
              {activity.notes.map((n, i) => (
                <View key={i} style={[S.noteRow, { borderLeftColor: n.color }]}>
                  <Text style={[S.noteRowTitle, { color: n.color }]}>{n.titre}</Text>
                  <Text style={S.noteRowText}>{n.texte}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={S.modalActions}>
          <TouchableOpacity style={S.btnSecondary} onPress={onFeedback}>
            <Feather name="edit-3" size={16} color={COLORS.text} />
            <Text style={S.btnSecondaryText}>Évaluer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[S.btnPrimary, { backgroundColor: activity.color }]} onPress={onPlay}>
            <Feather name="play" size={16} color="#fff" />
            <Text style={S.btnPrimaryText}>Lancer l'activité</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default function ActivitiesScreen({ isPremium: isPremiumProp = false }) {
  const navigation = useNavigation();
  const [filter, setFilter] = useState('Tous');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [modalVisible, setModal] = useState(false);

  const dayActivities = getDayActivities();
  const domainesActifs = DOMAINES.filter(d => d !== 'Tous');

  const filtered = ACTIVITIES.filter(a => {
    const matchDom = filter === 'Tous' || a.domaine === filter;
    const q = search.toLowerCase();
    return matchDom && (!q || a.nom.toLowerCase().includes(q) || a.domaine.toLowerCase().includes(q));
  });

  const openDetail = useCallback((a) => { setSelected(a); setModal(true); }, []);

  const goPlayer = useCallback((a) => {
    setModal(false);
    setTimeout(() => navigation.navigate('ActivityPlayer', { activity: a }), 250);
  }, [navigation]);

  const goFeedback = useCallback((a) => {
    setModal(false);
    setTimeout(() => navigation.navigate('Feedback', { activity: a }), 250);
  }, [navigation]);

  return (
    <ParentLayout activeTab="activities">
      <View style={{ flex: 1, backgroundColor: COLORS.surface }}>
        <StatusBar barStyle="light-content" />

        <LinearGradient
          colors={['#732eec', '#844fd8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={S.header}
        >
          <View style={S.headerTopRow}>
            <View>
              <Text style={S.headerTitle}>
                Activités pour <Text style={S.headerAccent}>Amine</Text>
              </Text>
            </View>
            <View style={S.headerAvatar}>
              <Text style={{ fontSize: 20 }}>👦</Text>
            </View>
          </View>

          <View style={S.statsRow}>
            {[
              { v: ACTIVITIES.length, l: 'Activités', i: '🎯' },
              { v: '100', l: 'Enfants', i: '👥' },
              { v: '428', l: 'Sessions', i: '📊' },
            ].map((s, i) => (
              <View key={i} style={S.statPill}>
                <Text style={{ fontSize: 13 }}>{s.i}</Text>
                <Text style={S.statPillValue}>{s.v}</Text>
                <Text style={S.statPillLabel}>{s.l}</Text>
              </View>
            ))}
          </View>

          <View style={S.searchWrapper}>
            <Feather name="search" size={16} color="rgba(255,255,255,0.6)" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Rechercher une activité…"
              placeholderTextColor="rgba(255,255,255,0.5)"
              style={S.searchInput}
            />
            {!!search && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Feather name="x" size={16} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: IS_TABLET ? 40 : 100 }}
        >
          {!!search ? (
            <View style={S.sectionWrap}>
              <View style={S.sectionHeader}>
                <Text style={S.sectionTitle}>🔍 Résultats ({filtered.length})</Text>
              </View>
              {filtered.map(a => (
                <TouchableOpacity
                  key={a.id}
                  onPress={() => openDetail(a)}
                  style={[S.listCard, { borderLeftColor: a.color }]}
                >
                  <LinearGradient
                    colors={a.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={S.listIconWrap}
                  >
                    <Text style={{ fontSize: 22 }}>{a.icon}</Text>
                  </LinearGradient>
                  <View style={{ flex: 1 }}>
                    <Text style={S.listName} numberOfLines={1}>{a.nom}</Text>
                    <Text style={S.listMeta}>{a.domaine} · {a.type}</Text>
                    <Text style={[S.listStatText, { color: a.color }]}>
                      {a.succes_pct}%✓ · {a.duree}min
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
              ))}
              {filtered.length === 0 && (
                <View style={{ alignItems: 'center', paddingVertical: 48 }}>
                  <Text style={{ fontSize: 40, marginBottom: 12 }}>🔍</Text>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.text }}>Aucun résultat</Text>
                  <Text style={{ fontSize: 13, color: COLORS.textLight, marginTop: 4 }}>
                    Essayez un autre mot-clé
                  </Text>
                </View>
              )}
            </View>
          ) : filter !== 'Tous' ? (
            <View style={S.sectionWrap}>
              <View style={S.sectionHeader}>
                <Text style={S.sectionTitle}>{filter}</Text>
                <TouchableOpacity onPress={() => setFilter('Tous')}>
                  <Text style={{ fontSize: 12, color: COLORS.primary, fontWeight: '700' }}>Tout voir</Text>
                </TouchableOpacity>
              </View>
              {ACTIVITIES.filter(a => a.domaine === filter).map(a => {
                const dayA = dayActivities[filter];
                const unlocked = isPremiumProp || a.id === dayA?.id;
                return (
                  <TouchableOpacity
                    key={a.id}
                    activeOpacity={unlocked ? 0.86 : 1}
                    onPress={unlocked ? () => openDetail(a) : null}
                    style={unlocked ? [S.listCard, { borderLeftColor: a.color }] : S.listCardLocked}
                  >
                    <LinearGradient
                      colors={unlocked ? a.gradient : ['#CBD5E1', '#94A3B8']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={S.listIconWrap}
                    >
                      <Text style={{ fontSize: 22 }}>{unlocked ? a.icon : '🔒'}</Text>
                    </LinearGradient>
                    <View style={{ flex: 1 }}>
                      <View style={S.listTopRow}>
                        <Text style={unlocked ? S.listName : S.listNameLocked} numberOfLines={1}>
                          {a.nom}
                        </Text>
                        {!unlocked && (
                          <View style={S.premiumBadge}>
                            <Text style={S.premiumBadgeText}>⭐ PREMIUM</Text>
                          </View>
                        )}
                      </View>
                      <Text style={S.listMeta}>{a.type} · {a.duree}min</Text>
                      {unlocked ? (
                        <Text style={[S.listStatText, { color: a.color }]}>
                          {a.succes_pct}%✓ · {a.nb_enfants} enfants
                        </Text>
                      ) : (
                        <Text style={S.lockedHint}>Passez à Premium pour accéder</Text>
                      )}
                    </View>
                    {unlocked ? (
                      <Feather name="chevron-right" size={20} color={COLORS.textMuted} />
                    ) : (
                      <Text style={{ fontSize: 16 }}>🔒</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <>
              <View style={{ marginBottom: 4 }}>
                <View style={[S.sectionHeader, { paddingHorizontal: 16, marginTop: 14, marginBottom: 6 }]}>
                  <Text style={S.sectionTitle}>📅 Activités du jour</Text>
                  <View style={S.sectionBadge}>
                    <Text style={S.sectionBadgeText}>{domainesActifs.length} domaines</Text>
                  </View>
                </View>
                <Text style={[S.sectionSub, { paddingHorizontal: 16, marginBottom: 10 }]}>
                  1 activité recommandée par domaine · Glissez →
                </Text>

                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  decelerationRate="fast"
                  snapToInterval={width - 32}
                  snapToAlignment="start"
                  contentContainerStyle={{ paddingHorizontal: 16, columnGap: 12 }}
                >
                  {domainesActifs.map((domaine, i) => {
                    const activity = dayActivities[domaine];
                    if (!activity) return null;
                    return (
                      <TouchableOpacity
                        key={domaine}
                        activeOpacity={0.9}
                        onPress={() => openDetail(activity)}
                        style={{ width: width - 44 }}
                      >
                        <LinearGradient
                          colors={activity.gradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={S.tiktokCard}
                        >
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <View style={S.tiktokBadge}>
                              <Text style={S.tiktokBadgeText}>{domaine}</Text>
                            </View>
                            <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>
                              {i + 1}/{domainesActifs.length}
                            </Text>
                          </View>
                          <Text style={S.tiktokIcon}>{activity.icon}</Text>
                          <Text style={S.tiktokNom} numberOfLines={2}>{activity.nom}</Text>
                          <View style={S.tiktokStats}>
                            <View style={S.tiktokStat}>
                              <Text style={S.tiktokStatVal}>{activity.succes_pct}%</Text>
                              <Text style={S.tiktokStatLbl}>Succès</Text>
                            </View>
                            <View style={S.tiktokStatDivider} />
                            <View style={S.tiktokStat}>
                              <Text style={S.tiktokStatVal}>{activity.duree}min</Text>
                              <Text style={S.tiktokStatLbl}>Durée</Text>
                            </View>
                            <View style={S.tiktokStatDivider} />
                            <View style={S.tiktokStat}>
                              <Text style={S.tiktokStatVal}>{activity.nb_enfants}</Text>
                              <Text style={S.tiktokStatLbl}>Enfants</Text>
                            </View>
                          </View>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View style={S.tiktokPlayBtn}>
                              <Feather name="play" size={12} color={activity.color} />
                              <Text style={[S.tiktokPlayText, { color: activity.color }]}>
                                Voir l'activité
                              </Text>
                            </View>
                            <View style={S.tiktokPagination}>
                              {domainesActifs.map((_, j) => (
                                <View key={j} style={[S.tiktokDot, i === j && S.tiktokDotActive]} />
                              ))}
                            </View>
                          </View>
                        </LinearGradient>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {!isPremiumProp && (
                <View style={S.premiumBanner}>
                  <LinearGradient
                    colors={['#059669', '#0891B2']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={S.premiumBannerGradient}
                  >
                    <Text style={S.premiumBannerEmoji}>⭐</Text>
                    <View style={S.premiumBannerText}>
                      <Text style={S.premiumBannerTitle}>Débloquer toutes les activités</Text>
                      <Text style={S.premiumBannerSub}>
                        {ACTIVITIES.length} activités · CIB · Dahabia · Visa
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={S.premiumBannerBtn}
                      onPress={() => navigation.navigate('Premium')}
                    >
                      <Text style={S.premiumBannerBtnText}>Essayer</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              )}

              <View style={S.sectionWrap}>
                <View style={S.sectionHeader}>
                  <Text style={S.sectionTitle}>🎯 Toutes les activités</Text>
                  <View style={S.sectionBadge}>
                    <Text style={S.sectionBadgeText}>{ACTIVITIES.length} activités</Text>
                  </View>
                </View>
                {ACTIVITIES.map(a => {
                  const dayA = dayActivities[a.domaine];
                  const unlocked = isPremiumProp || a.id === dayA?.id;
                  return (
                    <TouchableOpacity
                      key={a.id}
                      activeOpacity={0.86}
                      onPress={() => unlocked ? openDetail(a) : navigation.navigate('Premium')}
                      style={unlocked ? [S.listCard, { borderLeftColor: a.color }] : S.listCardLocked}
                    >
                      <LinearGradient
                        colors={unlocked ? a.gradient : ['#CBD5E1', '#94A3B8']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={S.listIconWrap}
                      >
                        <Text style={{ fontSize: 22 }}>{unlocked ? a.icon : '🔒'}</Text>
                      </LinearGradient>
                      <View style={{ flex: 1 }}>
                        <View style={S.listTopRow}>
                          <Text style={unlocked ? S.listName : S.listNameLocked} numberOfLines={1}>
                            {a.nom}
                          </Text>
                          {!unlocked && (
                            <View style={S.premiumBadge}>
                              <Text style={S.premiumBadgeText}>⭐ PREMIUM</Text>
                            </View>
                          )}
                        </View>
                        <Text style={S.listMeta}>{a.domaine} · {a.type} · {a.duree}min</Text>
                        {unlocked ? (
                          <Text style={[S.listStatText, { color: a.color }]}>
                            {a.succes_pct}%✓ · {a.nb_enfants} enfants
                          </Text>
                        ) : (
                          <Text style={S.lockedHint}>Payer avec CIB / Dahabia / Visa pour accéder</Text>
                        )}
                      </View>
                      <Feather
                        name={unlocked ? 'chevron-right' : 'lock'}
                        size={18}
                        color={unlocked ? '#94A3B8' : '#F59E0B'}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}
        </ScrollView>

        <DetailModal
          activity={selected}
          visible={modalVisible}
          onClose={() => setModal(false)}
          onPlay={() => selected && goPlayer(selected)}
          onFeedback={() => selected && goFeedback(selected)}
        />
      </View>
    </ParentLayout>
  );
}
