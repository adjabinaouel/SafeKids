import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import AdminLayout from '../../../components/Navigation/AdminNavigation';
import { COLORS } from '../../../theme';
import S from './NotificationAdminStyles';

const NOTIFS_INIT = [
  { id: 'n1', read: false, icon: '👨‍⚕️', iconBg: '#EDE9FE', dot: '#8B5CF6',
    titre: 'Nouveau médecin inscrit',
    texte: 'Dr. Yacine Bouzid a créé son compte. En attente de validation.',
    time: 'Il y a 2h', cat: 'medecin', pillBg: '#EDE9FE', pillColor: '#6D28D9', pillLabel: 'Médecin' },
  { id: 'n2', read: false, icon: '👨‍👩‍👧', iconBg: '#DBEAFE', dot: '#2563EB',
    titre: 'Nouveau parent rattaché',
    texte: 'Sara Benali a été rattachée au Dr. Karim Meziane avec 2 enfants.',
    time: 'Il y a 4h', cat: 'parent', pillBg: '#DBEAFE', pillColor: '#1D4ED8', pillLabel: 'Parent' },
  { id: 'n3', read: false, icon: '⚠️', iconBg: '#FEF3C7', dot: '#F59E0B',
    titre: 'Compte bloqué signalé',
    texte: 'Le compte de Dr. Omar Ferhat a été bloqué suite à 5 tentatives échouées.',
    time: 'Hier', cat: 'systeme', pillBg: '#FEF3C7', pillColor: '#92400E', pillLabel: 'Système' },
  { id: 'n4', read: false, icon: '🎯', iconBg: '#D1FAE5', dot: '#10B981',
    titre: 'Activité publiée',
    texte: 'L\'activité "PECS Phase 3" est visible par tous les médecins.',
    time: 'Il y a 2j', cat: 'activite', pillBg: '#D1FAE5', pillColor: '#065F46', pillLabel: 'Activité' },
  { id: 'n5', read: true, icon: '📊', iconBg: '#F1F5F9', dot: '#CBD5E1',
    titre: 'Rapport mensuel disponible',
    texte: 'Les statistiques de mars 2026 sont disponibles dans le tableau de bord.',
    time: 'Il y a 3j', cat: 'systeme', pillBg: '#F1F5F9', pillColor: '#64748B', pillLabel: 'Système' },
  { id: 'n6', read: true, icon: '✅', iconBg: '#D1FAE5', dot: '#CBD5E1',
    titre: 'Compte validé',
    texte: 'Le compte de Dr. Leila Hadj a été activé avec succès.',
    time: 'Il y a 5j', cat: 'medecin', pillBg: '#EDE9FE', pillColor: '#6D28D9', pillLabel: 'Médecin' },
];

const FILTERS = [
  { key: 'tout',     label: 'Tout' },
  { key: 'medecin',  label: 'Médecins' },
  { key: 'parent',   label: 'Parents' },
  { key: 'activite', label: 'Activités' },
  { key: 'systeme',  label: 'Système' },
  { key: 'nonlus',   label: 'Non lus' },
];

export default function NotificationsAdminScreen() {
  const [notifs, setNotifs] = useState(NOTIFS_INIT);
  const [filter, setFilter] = useState('tout');

  const unread = notifs.filter(n => !n.read).length;
  const markAll  = () => setNotifs(p => p.map(n => ({ ...n, read: true })));
  const markOne  = (id) => setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n));

  const list = notifs.filter(n =>
    filter === 'tout'   ? true :
    filter === 'nonlus' ? !n.read :
    n.cat === filter
  );

  return (
    <AdminLayout activeTab="notifications">
      <StatusBar barStyle="light-content" />
      <View style={S.container}>
        <LinearGradient colors={['#4C1D95', '#1E1B4B']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={S.header}>
          <View style={S.headerTopRow}>
            <View>
              <Text style={S.headerGreeting}>Panneau administrateur</Text>
              <Text style={S.headerTitle}>
                Notifications{unread > 0 && <Text style={S.headerAccent}> {unread}</Text>}
              </Text>
            </View>
            {unread > 0 && (
              <TouchableOpacity style={S.markAllBtn} onPress={markAll}>
                <Text style={S.markAllText}>Tout lire</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          style={S.chipRow} contentContainerStyle={{ paddingRight: 16 }}>
          {FILTERS.map(f => (
            <TouchableOpacity key={f.key} style={[S.chip, filter === f.key && S.chipActive]}
              onPress={() => setFilter(f.key)}>
              <Text style={[S.chipText, filter === f.key && S.chipTextActive]}>{f.label}</Text>
              {f.key === 'nonlus' && unread > 0 && (
                <View style={S.chipBadge}><Text style={S.chipBadgeText}>{unread}</Text></View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.scrollContent}>
          {list.length === 0 ? (
            <View style={S.emptyBox}>
              <Text style={S.emptyIcon}>🔔</Text>
              <Text style={S.emptyText}>Aucune notification</Text>
              <Text style={S.emptySub}>Tout est à jour !</Text>
            </View>
          ) : list.map(n => (
            <TouchableOpacity key={n.id} activeOpacity={0.85}
              style={[S.notifCard, n.read && S.notifCardRead]}
              onPress={() => markOne(n.id)}>
              <View style={[S.notifIconWrap, { backgroundColor: n.iconBg }]}>
                <Text style={{ fontSize: 20 }}>{n.icon}</Text>
              </View>
              <View style={S.notifContent}>
                <View style={S.notifTitleRow}>
                  {!n.read && <View style={[S.unreadDot, { backgroundColor: n.dot }]} />}
                  <Text style={[S.notifTitle, n.read && S.notifTitleRead]} numberOfLines={1}>
                    {n.titre}
                  </Text>
                </View>
                <Text style={S.notifText} numberOfLines={2}>{n.texte}</Text>
                <View style={S.notifBot}>
                  <Text style={S.notifTime}>{n.time}</Text>
                  <View style={[S.notifPill, { backgroundColor: n.pillBg }]}>
                    <Text style={[S.notifPillText, { color: n.pillColor }]}>{n.pillLabel}</Text>
                  </View>
                </View>
              </View>
              <Feather name="chevron-right" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </AdminLayout>
  );
}