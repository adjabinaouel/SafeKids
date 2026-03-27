// src/pages/parents/ActivityPlayerScreen/ActivityPlayerScreen.js
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  Modal, Animated, StatusBar, Dimensions,
  Platform, Alert, Linking, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';
import S, { COLORS } from './ActivityPlayerStyles';

const { width, height } = Dimensions.get('window');

const getVideoId = (url = '') => {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]{11})/);
  return m ? m[1] : null;
};

const fmtTime = (sec) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
};

// ─── Ouvrir YouTube app / navigateur ─────────────────────────
const openYouTube = async (videoId) => {
  // Essaie d'abord l'app YouTube native
  const appUrl = `youtube://watch?v=${videoId}`;
  const webUrl = `https://www.youtube.com/watch?v=${videoId}`;
  try {
    const canApp = await Linking.canOpenURL(appUrl);
    if (canApp) { await Linking.openURL(appUrl); return; }
    await Linking.openURL(webUrl);
  } catch (_) {
    await Linking.openURL(webUrl);
  }
};

// ─── TIMER ───────────────────────────────────────────────────
const Timer = ({ running }) => {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    let t;
    if (running) t = setInterval(() => setSecs(s => s + 1), 1000);
    else setSecs(0);
    return () => clearInterval(t);
  }, [running]);
  return (
    <View style={styles.timerPill}>
      <Text style={styles.timerIcon}>⏱️</Text>
      <Text style={styles.timerText}>{fmtTime(secs)}</Text>
    </View>
  );
};

// ─── MODAL NOTES ─────────────────────────────────────────────
const NotesModal = ({ notes = [], activity, visible, onClose }) => {
  const slideY = useRef(new Animated.Value(600)).current;
  useEffect(() => {
    Animated.spring(slideY, {
      toValue: visible ? 0 : 600,
      damping: 26, stiffness: 220, useNativeDriver: false,
    }).start();
  }, [visible]);

  const NOTE_ICONS = {
    'Objectif': '🎯', 'Conseils': '💡',
    'attention': '⚠️', 'Durée': '⏱️'
  };
  const getIcon = (titre) => {
    const found = Object.entries(NOTE_ICONS).find(([k]) => titre.includes(k));
    return found ? found[1] : '📌';
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <Animated.View style={[styles.notesSheet, { transform: [{ translateY: slideY }] }]}>
          <TouchableOpacity activeOpacity={1}>
            <View style={styles.modalHandle} />
            <LinearGradient
              colors={activity?.gradient || [COLORS.primary, COLORS.primaryDark]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.notesHeader}
            >
              <View style={styles.notesHeaderLeft}>
                <Text style={styles.notesHeaderIcon}>{activity?.icon || '📋'}</Text>
                <View>
                  <Text style={styles.notesHeaderTitle}>Notes du thérapeute</Text>
                  <Text style={styles.notesHeaderSub}>{notes.length} conseils</Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.notesCloseBtn}>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>✕</Text>
              </TouchableOpacity>
            </LinearGradient>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: height * 0.45 }}
              contentContainerStyle={{ padding: 20 }}
            >
              {notes.map((note, i) => (
                <View key={i} style={[styles.noteCard, { borderLeftColor: note.color }]}>
                  <View style={[styles.noteIconCircle, { backgroundColor: `${note.color}18` }]}>
                    <Text style={{ fontSize: 18 }}>{getIcon(note.titre)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.noteCardTitle, { color: note.color }]}>{note.titre}</Text>
                    <Text style={styles.noteCardText}>{note.texte}</Text>
                  </View>
                </View>
              ))}
              <View style={{ height: 8 }} />
            </ScrollView>
            <TouchableOpacity style={styles.notesCloseFullBtn} onPress={onClose}>
              <Text style={styles.notesCloseBtnText}>Fermer les notes</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

// ─── MODAL FIN D'ACTIVITÉ ────────────────────────────────────
const EndModal = ({ visible, onFeedback, onBack }) => {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacAnim  = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, damping: 20, stiffness: 200, useNativeDriver: true }),
        Animated.timing(opacAnim,  { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else { scaleAnim.setValue(0.85); opacAnim.setValue(0); }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.endOverlay}>
        <Animated.View style={[styles.endCard, { transform: [{ scale: scaleAnim }], opacity: opacAnim }]}>
          <Text style={{ fontSize: 64, marginBottom: 12 }}>🎉</Text>
          <Text style={styles.endTitle}>Activité terminée !</Text>
          <Text style={styles.endSub}>Évaluez la séance pour améliorer les recommandations.</Text>
          <TouchableOpacity style={styles.endBtnPrimary} onPress={onFeedback}>
            <Text style={{ fontSize: 16 }}>📝</Text>
            <Text style={styles.endBtnPrimaryText}>Évaluer la séance</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.endBtnSecondary} onPress={onBack}>
            <Text style={styles.endBtnSecondaryText}>Plus tard</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

// ─── ÉCRAN PRINCIPAL ─────────────────────────────────────────
export default function ActivityPlayerScreen({ route, navigation }) {
  const activity = route?.params?.activity || {
    id: '4', nom: 'Activités de motricité fine à la maison',
    domaine: 'Motricité Fine', type: 'Développement',
    icon: '✋', color: '#FFB547', gradient: ['#FFB547', '#FF6B35'],
    engagement_moyen: 3.50, succes_pct: 82, nb_enfants: 34,
    duree: 26, video_url: 'https://www.youtube.com/watch?v=bEH0TsjdB24',
    video_duree_sec: 300, difficulte: 2,
    materiel: 'pâte à modeler, perles, pinces à linge',
    notes: [
      { titre: 'Objectif',             texte: "Renforcer la préhension fine, coordination œil-main et force digitale.", color: '#FFB547' },
      { titre: 'Conseils séance',       texte: "Alternez les textures. Commencez par la pâte à modeler puis les perles.", color: '#10B981' },
      { titre: "⚠️ Points d'attention", texte: "Petits objets = risque d'ingestion. Surveillez en continu.", color: '#EF4444' },
      { titre: 'Durée recommandée',     texte: "20 à 26 min. 3 rotations de 8 min.", color: '#F59E0B' },
    ],
  };

  const videoId = getVideoId(activity.video_url);
  const total   = activity.video_duree_sec || activity.duree * 60;

  const [playing,   setPlaying]   = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showEnd,   setShowEnd]   = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [elapsed,   setElapsed]   = useState(0);

  // Timer de séance (indépendant de la vidéo)
  useEffect(() => {
    let t;
    if (playing) {
      t = setInterval(() => {
        setElapsed(e => e + 1);
        setProgress(p => {
          const next = p + 1 / total;
          if (next >= 1) { clearInterval(t); setPlaying(false); setShowEnd(true); return 1; }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(t);
  }, [playing]);

  const pct = Math.round(progress * 100);

  // Fallback web
  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ fontSize: 40, marginBottom: 16 }}>{activity.icon}</Text>
        <Text style={{ fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 8, textAlign: 'center' }}>{activity.nom}</Text>
        <TouchableOpacity onPress={() => window.open(activity.video_url, '_blank')}
          style={{ backgroundColor: COLORS.primary, height: 56, borderRadius: 16, paddingHorizontal: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 14 }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>▶ Ouvrir sur YouTube</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Text style={{ color: COLORS.textLight, fontSize: 14 }}>← Retour</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* ── HEADER ── */}
      <LinearGradient
        colors={activity.gradient}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
          <Text style={{ color: '#fff', fontSize: 18 }}>←</Text>
          <Text style={styles.backBtnText}>Retour</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerIcon}>{activity.icon}</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>{activity.nom}</Text>
        </View>
        <Timer running={playing} />
      </LinearGradient>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── CARTE VIDÉO ── */}
        <View style={styles.videoCard}>
          <LinearGradient
            colors={['#0f0f0f', '#1a1a2e']}
            style={styles.videoThumb}
          >
            {/* Miniature YouTube */}
            <View style={styles.thumbImgWrap}>
              <Text style={{ fontSize: 64 }}>{activity.icon}</Text>
            </View>

            {/* Bouton ouvrir YouTube */}
            <TouchableOpacity
              style={[styles.youtubeBtn, { backgroundColor: activity.color }]}
              onPress={() => {
                setPlaying(true);
                openYouTube(videoId);
              }}
            >
              <Text style={styles.youtubeBtnIcon}>▶</Text>
              <View>
                <Text style={styles.youtubeBtnText}>Lancer sur YouTube</Text>
                <Text style={styles.youtubeBtnSub}>S'ouvre dans l'app YouTube</Text>
              </View>
            </TouchableOpacity>

            {/* Badge durée */}
            <View style={styles.durationBadge}>
              <Text style={styles.durationBadgeText}>⏱️ {activity.duree} min</Text>
            </View>
          </LinearGradient>

          {/* Info under thumb */}
          <View style={styles.videoInfo}>
            <Text style={styles.videoInfoTitle}>{activity.nom}</Text>
            <Text style={styles.videoInfoSub}>{activity.domaine} · {activity.type}</Text>
          </View>
        </View>

        {/* ── CONTRÔLES SÉANCE ── */}
        <View style={styles.sessionCard}>
          <Text style={styles.sessionCardTitle}>⏱️ Chronomètre de séance</Text>
          <Text style={styles.sessionCardSub}>
            Lancez le chrono quand vous commencez l'activité avec votre enfant
          </Text>

          {/* Progression */}
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Progression estimée</Text>
            <Text style={[styles.progressPct, { color: activity.color }]}>{pct}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: activity.color }]} />
          </View>
          <Text style={styles.progressTime}>
            {fmtTime(elapsed)} écoulé · {fmtTime(Math.max(0, total - elapsed))} restant
          </Text>

          {/* Boutons Play/Pause + Terminer */}
          <View style={styles.controlBtns}>
            <TouchableOpacity
              style={[styles.playPauseBtn, { borderColor: activity.color }]}
              onPress={() => setPlaying(p => !p)}
            >
              <Text style={{ fontSize: 24 }}>{playing ? '⏸' : '▶'}</Text>
              <Text style={[styles.playPauseBtnText, { color: activity.color }]}>
                {playing ? 'Pause chrono' : elapsed > 0 ? 'Reprendre' : 'Démarrer'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.endSessionBtn, { backgroundColor: activity.color }]}
              onPress={() => {
                setPlaying(false);
                navigation?.navigate('Feedback', { activity });
              }}
            >
              <Text style={{ fontSize: 18 }}>✅</Text>
              <Text style={styles.endSessionBtnText}>Terminer</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── STATS ── */}
        <View style={styles.statsRow}>
          {[
            { icon: '✅', label: 'Taux succès', value: `${activity.succes_pct}%` },
            { icon: '⭐', label: 'Engagement',  value: `${activity.engagement_moyen}/5` },
            { icon: '👥', label: 'Enfants',     value: `${activity.nb_enfants}` },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={[styles.statValue, { color: activity.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ── MATÉRIEL ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Matériel requis</Text>
          <Text style={styles.sectionText}>{activity.materiel}</Text>
        </View>

        {/* ── NOTES PREVIEW ── */}
        <View style={styles.notesPreviewCard}>
          <View style={styles.notesPreviewHeader}>
            <Text style={styles.notesPreviewTitle}>📋 Notes du thérapeute</Text>
            <TouchableOpacity
              onPress={() => setShowNotes(true)}
              style={[styles.notesPreviewBtn, { backgroundColor: activity.color }]}
            >
              <Text style={styles.notesPreviewBtnText}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.notesChipsRow}>
            {activity.notes?.map((n, i) => (
              <TouchableOpacity key={i} onPress={() => setShowNotes(true)}
                style={[styles.noteChip, { borderColor: n.color, backgroundColor: `${n.color}10` }]}>
                <View style={[styles.noteChipDot, { backgroundColor: n.color }]} />
                <Text style={[styles.noteChipText, { color: n.color }]} numberOfLines={1}>{n.titre}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── BOUTON TERMINER ── */}
        <TouchableOpacity
          style={[styles.endBtn, { backgroundColor: activity.color }]}
          onPress={() => {
            setPlaying(false);
            navigation?.navigate('Feedback', { activity });
          }}
        >
          <Text style={{ fontSize: 20 }}>✅</Text>
          <Text style={styles.endBtnText}>Terminer et évaluer</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      <NotesModal notes={activity.notes} activity={activity} visible={showNotes} onClose={() => setShowNotes(false)} />
      <EndModal
        visible={showEnd}
        onFeedback={() => { setShowEnd(false); navigation?.navigate('Feedback', { activity }); }}
        onBack={() => { setShowEnd(false); navigation?.goBack(); }}
      />
    </SafeAreaView>
  );
}

// ─── STYLES ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.surface },
  scroll:   { flex: 1 },

  // Header gradient
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    columnGap: 12, rowGap: 12,
  },
  backBtn: {
    flexDirection: 'row', alignItems: 'center', columnGap: 6, rowGap: 6,
    backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  backBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerIcon:  { fontSize: 20 },
  headerTitle: { fontSize: 13, fontWeight: '700', color: '#fff', textAlign: 'center' },

  timerPill: {
    flexDirection: 'row', alignItems: 'center', columnGap: 4, rowGap: 4,
    backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 7,
  },
  timerIcon: { fontSize: 11 },
  timerText: { fontSize: 12, fontWeight: '800', color: '#fff', letterSpacing: 1 },

  // Carte vidéo
  videoCard: {
    margin: 16, borderRadius: 20, overflow: 'hidden',
    backgroundColor: COLORS.white,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12 },
      android: { elevation: 5 },
    }),
  },
  videoThumb: {
    height: 200, justifyContent: 'center', alignItems: 'center',
    position: 'relative',
  },
  thumbImgWrap: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center', opacity: 0.3,
  },
  youtubeBtn: {
    flexDirection: 'row', alignItems: 'center', columnGap: 12, rowGap: 12,
    paddingHorizontal: 24, paddingVertical: 16,
    borderRadius: 20, marginHorizontal: 24,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12 },
      android: { elevation: 8 },
    }),
  },
  youtubeBtnIcon: { fontSize: 28, color: '#fff' },
  youtubeBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  youtubeBtnSub:  { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 2 },
  durationBadge: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  durationBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  videoInfo: { padding: 14 },
  videoInfoTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  videoInfoSub:   { fontSize: 12, color: COLORS.textLight },

  // Carte contrôles séance
  sessionCard: {
    backgroundColor: COLORS.white, borderRadius: 20,
    marginHorizontal: 16, marginBottom: 12, padding: 18,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  sessionCardTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  sessionCardSub:   { fontSize: 12, color: COLORS.textLight, marginBottom: 16, lineHeight: 18 },

  progressRow:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel:{ fontSize: 12, fontWeight: '600', color: COLORS.textLight },
  progressPct:  { fontSize: 13, fontWeight: '800' },
  progressTrack:{ height: 8, backgroundColor: COLORS.border, borderRadius: 8, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', borderRadius: 8 },
  progressTime: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center', marginBottom: 16 },

  controlBtns:   { flexDirection: 'row', columnGap: 10, rowGap: 10 },
  playPauseBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    columnGap: 8, rowGap: 8, height: 52, borderRadius: 14,
    backgroundColor: COLORS.surface, borderWidth: 2,
  },
  playPauseBtnText: { fontSize: 14, fontWeight: '700' },
  endSessionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    columnGap: 8, rowGap: 8, height: 52, borderRadius: 14,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  endSessionBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  // Stats
  statsRow: { flexDirection: 'row', columnGap: 10, rowGap: 10, marginHorizontal: 16, marginBottom: 12 },
  statCard: {
    flex: 1, backgroundColor: COLORS.white, borderRadius: 14,
    padding: 12, alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.border,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
      android: { elevation: 2 },
    }),
  },
  statIcon:  { fontSize: 20, marginBottom: 4 },
  statValue: { fontSize: 14, fontWeight: '800', marginBottom: 2 },
  statLabel: { fontSize: 9, color: COLORS.textLight },

  // Section matériel
  section: {
    backgroundColor: COLORS.white, borderRadius: 16,
    marginHorizontal: 16, marginBottom: 12, padding: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: COLORS.text, textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 8 },
  sectionText:  { fontSize: 13, color: COLORS.textLight, lineHeight: 20 },

  // Notes preview
  notesPreviewCard: {
    backgroundColor: COLORS.white, borderRadius: 16,
    marginHorizontal: 16, marginBottom: 12, padding: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  notesPreviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  notesPreviewTitle:  { fontSize: 14, fontWeight: '700', color: COLORS.text },
  notesPreviewBtn:    { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  notesPreviewBtnText:{ color: '#fff', fontSize: 11, fontWeight: '700' },
  notesChipsRow: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 8, columnGap: 8 },
  noteChip: {
    flexDirection: 'row', alignItems: 'center', columnGap: 6, rowGap: 6,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5,
  },
  noteChipDot:  { width: 7, height: 7, borderRadius: 4 },
  noteChipText: { fontSize: 12, fontWeight: '700' },

  // Bouton terminer bas
  endBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    columnGap: 8, rowGap: 8,
    height: 58, borderRadius: 18,
    marginHorizontal: 16, marginTop: 8,
    ...Platform.select({
      ios:     { shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12 },
      android: { elevation: 8 },
    }),
  },
  endBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Modal notes
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.6)', justifyContent: 'flex-end' },
  notesSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    ...Platform.select({
      ios:     { shadowColor: '#7C3AED', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 20 },
      android: { elevation: 16 },
    }),
  },
  modalHandle:       { width: 40, height: 4, backgroundColor: COLORS.border, borderRadius: 4, alignSelf: 'center', marginVertical: 12 },
  notesHeader:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  notesHeaderLeft:   { flexDirection: 'row', alignItems: 'center', columnGap: 12, rowGap: 12, flex: 1 },
  notesHeaderIcon:   { fontSize: 32 },
  notesHeaderTitle:  { fontSize: 16, fontWeight: '800', color: '#fff' },
  notesHeaderSub:    { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  notesCloseBtn:     { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  noteCard: {
    flexDirection: 'row', columnGap: 14, rowGap: 14,
    backgroundColor: COLORS.surface, borderRadius: 14,
    padding: 14, marginBottom: 10,
    borderLeftWidth: 4, borderWidth: 1, borderColor: COLORS.border,
  },
  noteIconCircle:    { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  noteCardTitle:     { fontSize: 13, fontWeight: '800', marginBottom: 4 },
  noteCardText:      { fontSize: 13, color: COLORS.textLight, lineHeight: 19 },
  notesCloseFullBtn: {
    backgroundColor: COLORS.primary, height: 54, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', margin: 20, marginTop: 8,
    ...Platform.select({
      ios:     { shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 10 },
      android: { elevation: 6 },
    }),
  },
  notesCloseBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // Modal fin
  endOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.65)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  endCard: {
    backgroundColor: COLORS.white, borderRadius: 24, padding: 28, width: '100%', alignItems: 'center',
    ...Platform.select({
      ios:     { shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 24 },
      android: { elevation: 16 },
    }),
  },
  endTitle:           { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  endSub:             { fontSize: 13, color: COLORS.textLight, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  endBtnPrimary: {
    backgroundColor: COLORS.primary, height: 58, borderRadius: 18, width: '100%',
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    columnGap: 8, rowGap: 8, marginBottom: 10,
    ...Platform.select({
      ios:     { shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12 },
      android: { elevation: 8 },
    }),
  },
  endBtnPrimaryText:   { color: '#fff', fontSize: 15, fontWeight: '700' },
  endBtnSecondary:     { height: 48, borderRadius: 14, width: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border },
  endBtnSecondaryText: { fontSize: 14, fontWeight: '600', color: COLORS.textLight },
});