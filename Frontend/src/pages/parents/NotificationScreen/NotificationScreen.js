import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StatusBar, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import ParentLayout from '../../../components/Navigation/ParentNavigation';

// ─── DATA ─────────────────────────────────────────────────────────────────────

const NOTIFICATIONS = [
  {
    id: '1', read: false,
    icon: '📋', dotColor: '#A78BFA',
    titre: 'Rapport mensuel disponible — Amine',
    texte: 'Le Dr. Meziane a publié le rapport de suivi de mars. Progrès PECS Phase 2 confirmés.',
    time: 'Il y a 2h', child: 'Amine', category: 'rapport',
  },
  {
    id: '2', read: false,
    icon: '✅', dotColor: '#10B981',
    titre: 'Objectif atteint — Motricité fine',
    texte: 'Amine a atteint l\'objectif de 80% de succès en motricité fine. Félicitations !',
    time: 'Hier', child: 'Amine', category: 'objectif',
  },
  {
    id: '3', read: false,
    icon: '📅', dotColor: '#FCD34D',
    titre: 'Rappel — Séance Lina cette semaine',
    texte: 'La prochaine séance avec le Dr. Meziane est prévue jeudi à 10h00.',
    time: 'Il y a 2j', child: 'Lina', category: 'rappel',
  },
  {
    id: '4', read: true,
    icon: '🎯', dotColor: '#38BDF8',
    titre: 'Nouvelle activité disponible',
    texte: '3 nouvelles activités PECS Phase 3 ont été ajoutées pour préparer la transition d\'Amine.',
    time: 'Il y a 4j', child: 'Amine', category: 'activite',
  },
  {
    id: '5', read: true,
    icon: '✨', dotColor: '#F472B6',
    titre: 'Lina — Analyse IA mise à jour',
    texte: 'Nouvelles recommandations IA basées sur les 14 derniers mois de suivi de Lina.',
    time: 'Il y a 1 sem', child: 'Lina', category: 'ia',
  },
  {
    id: '6', read: true,
    icon: '💬', dotColor: '#FB923C',
    titre: 'Nouveau message de Dr. Meziane',
    texte: 'Le médecin a répondu à votre question concernant le programme PECS de la semaine.',
    time: 'Il y a 1 sem', child: null, category: 'message',
  },
];

const FILTERS = ['Tout', 'Amine', 'Lina', 'Non lus'];

// ─── SCREEN ───────────────────────────────────────────────────────────────────

export default function NotificationsScreen() {
  const [filter, setFilter] = useState('Tout');
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const filtered = notifications.filter(n => {
    if (filter === 'Non lus') return !n.read;
    if (filter === 'Amine') return n.child === 'Amine';
    if (filter === 'Lina') return n.child === 'Lina';
    return true;
  });

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  return (
    <ParentLayout activeTab="notifications">
      <View style={{ flex: 1, backgroundColor: '#0F0A2E' }}>
        <StatusBar barStyle="light-content" />

        {/* HEADER */}
        <LinearGradient colors={['#1E1B4B', '#0F0A2E']} style={S.header}>
          <View style={S.headerRow}>
            <View>
              <Text style={S.greeting}>Centre de notifications</Text>
              <Text style={S.headerTitle}>
                Notifications{' '}
                {unreadCount > 0 && (
                  <Text style={{ color: '#FCD34D' }}>{unreadCount}</Text>
                )}
              </Text>
            </View>
            {unreadCount > 0 && (
              <TouchableOpacity style={S.markAllBtn} onPress={markAllRead}>
                <Text style={S.markAllText}>Tout lire</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        {/* FILTERS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingVertical: 14 }}>
          {FILTERS.map(f => (
            <TouchableOpacity key={f} onPress={() => setFilter(f)}
              style={[S.filterChip, filter === f && S.filterChipActive]}>
              <Text style={[S.filterChipText, filter === f && S.filterChipTextActive]}>{f}</Text>
              {f === 'Non lus' && unreadCount > 0 && (
                <View style={S.filterBadge}>
                  <Text style={S.filterBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 16 }}>
          {filtered.map((notif, i) => (
            <TouchableOpacity key={notif.id} activeOpacity={0.85}
              onPress={() => markRead(notif.id)}
              style={[S.notifCard, notif.read && S.notifCardRead]}>

              {/* Left icon */}
              <View style={[S.notifIconWrap, { backgroundColor: `${notif.dotColor}22` }]}>
                <Text style={{ fontSize: 20 }}>{notif.icon}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  {!notif.read && <View style={[S.unreadDot, { backgroundColor: notif.dotColor }]} />}
                  <Text style={[S.notifTitle, notif.read && S.notifTitleRead]} numberOfLines={1}>
                    {notif.titre}
                  </Text>
                </View>
                <Text style={S.notifText} numberOfLines={2}>{notif.texte}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <Text style={S.notifTime}>{notif.time}</Text>
                  {notif.child && (
                    <View style={S.childPill}>
                      <Text style={S.childPillText}>{notif.child}</Text>
                    </View>
                  )}
                </View>
              </View>

              <Feather name="chevron-right" size={16} color="rgba(255,255,255,0.2)" />
            </TouchableOpacity>
          ))}

          {filtered.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>🔔</Text>
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#fff' }}>Aucune notification</Text>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                Tout est à jour !
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </ParentLayout>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  header: { paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  greeting: { fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#fff', letterSpacing: -0.5, marginTop: 2 },

  markAllBtn: { backgroundColor: 'rgba(124,58,237,0.3)', borderWidth: 1, borderColor: 'rgba(167,139,250,0.4)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7 },
  markAllText: { fontSize: 12, fontWeight: '800', color: '#C4B5FD' },

  filterChip: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', flexDirection: 'row', alignItems: 'center', gap: 6 },
  filterChipActive: { backgroundColor: 'rgba(124,58,237,0.35)', borderColor: 'rgba(167,139,250,0.5)' },
  filterChipText: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.5)' },
  filterChipTextActive: { color: '#fff' },
  filterBadge: { backgroundColor: '#7C3AED', borderRadius: 10, width: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
  filterBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff' },

  notifCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', borderRadius: 18, padding: 14, marginBottom: 10 },
  notifCardRead: { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.07)' },

  notifIconWrap: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  unreadDot: { width: 7, height: 7, borderRadius: 4, flexShrink: 0 },

  notifTitle: { fontSize: 13, fontWeight: '800', color: '#fff', flex: 1 },
  notifTitleRead: { fontWeight: '600', color: 'rgba(255,255,255,0.6)' },
  notifText: { fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 17 },
  notifTime: { fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: '600' },

  childPill: { backgroundColor: 'rgba(167,139,250,0.2)', borderRadius: 7, paddingHorizontal: 8, paddingVertical: 2 },
  childPillText: { fontSize: 10, fontWeight: '800', color: '#C4B5FD' },
});
