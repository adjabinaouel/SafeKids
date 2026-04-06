// src/pages/admin/NotificationsScreen/AdminNotificationsScreen.js
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StatusBar, Animated, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AdminLayout from '../../../components/Navigation/AdminNavigation';
import { COLORS, GLASS } from '../../../theme';
import S from './NotificationAdminStyles';

// ── Types de notifs admin (selon diagramme UML) ───────────────────────────────
const CHIPS = [
  { id: 'tous',       label: 'Toutes' },
  { id: 'compte',     label: 'Comptes' },
  { id: 'activite',   label: 'Activités' },
  { id: 'systeme',    label: 'Système' },
  { id: 'alerte',     label: 'Alertes' },
];

const INIT_NOTIFS = [
  {
    id: 'n1', type: 'compte', read: false,
    icon: 'user-plus', iconBg: '#EDE9FE', iconColor: '#7C3AED',
    title: 'Nouveau médecin inscrit',
    text: 'Dr. Yacine Bouzid (Pédiatrie) attend votre validation.',
    time: 'Il y a 5 min', pill: 'Compte', pillBg: '#EDE9FE', pillColor: '#6D28D9',
    dest: 'AdminComptes', params: { tab: 'medecins' },
  },
  {
    id: 'n2', type: 'compte', read: false,
    icon: 'users', iconBg: '#E0F2FE', iconColor: '#0284C7',
    title: 'Parent bloqué automatiquement',
    text: "Compte de Sara Benali suspendu après 3 tentatives échouées.",
    time: 'Il y a 22 min', pill: 'Compte', pillBg: '#E0F2FE', pillColor: '#0284C7',
    dest: 'AdminComptes', params: { tab: 'parents' },
  },
  {
    id: 'n3', type: 'activite', read: false,
    icon: 'grid', iconBg: '#D1FAE5', iconColor: '#059669',
    title: 'Activité PECS Phase 3 publiée',
    text: "L'activité a été ajoutée au catalogue. 86 parents notifiés.",
    time: 'Il y a 1h', pill: 'Activité', pillBg: '#D1FAE5', pillColor: '#065F46',
    dest: 'AdminActivites', params: {},
  },
  {
    id: 'n4', type: 'alerte', read: false,
    icon: 'alert-triangle', iconBg: '#FEF3C7', iconColor: '#D97706',
    title: 'Spécialité sans médecin',
    text: "Orthophonie (3 médecins) — aucun actif depuis 7 jours.",
    time: 'Il y a 3h', pill: 'Alerte', pillBg: '#FEF3C7', pillColor: '#92400E',
    dest: 'AdminSpecialites', params: {},
  },
  {
    id: 'n5', type: 'systeme', read: true,
    icon: 'settings', iconBg: '#F1F5F9', iconColor: '#64748B',
    title: 'Sauvegarde automatique réussie',
    text: "Base de données sauvegardée — 247 dossiers · 3 450 consultations.",
    time: 'Hier 23:00', pill: 'Système', pillBg: '#F1F5F9', pillColor: '#475569',
    dest: null, params: {},
  },
  {
    id: 'n6', type: 'compte', read: true,
    icon: 'user-check', iconBg: '#D1FAE5', iconColor: '#059669',
    title: 'Médecin validé',
    text: "Dr. Karim Meziane activé avec succès. Compte opérationnel.",
    time: 'Hier 14:30', pill: 'Compte', pillBg: '#D1FAE5', pillColor: '#065F46',
    dest: 'AdminComptes', params: { tab: 'medecins' },
  },
  {
    id: 'n7', type: 'activite', read: true,
    icon: 'trash-2', iconBg: '#FEE2E2', iconColor: '#DC2626',
    title: 'Activité supprimée',
    text: "\"Motricité Phase 1\" supprimée par l'administrateur.",
    time: 'Avant-hier', pill: 'Activité', pillBg: '#FEE2E2', pillColor: '#B91C1C',
    dest: 'AdminActivites', params: {},
  },
  {
    id: 'n8', type: 'systeme', read: true,
    icon: 'shield', iconBg: '#EDE9FE', iconColor: '#7C3AED',
    title: 'Mise à jour sécurité appliquée',
    text: "SafeKids v2.1.0 déployé avec succès sur tous les serveurs.",
    time: 'Il y a 3j', pill: 'Système', pillBg: '#EDE9FE', pillColor: '#6D28D9',
    dest: null, params: {},
  },
];

// ── Carte notification ─────────────────────────────────────────────────────────
const NotifCard = ({ notif, onRead, onDelete, onPress }) => (
  <TouchableOpacity
    activeOpacity={0.84}
    onPress={() => { onRead(notif.id); onPress(notif); }}
    style={[S.notifCard, notif.read && S.notifCardRead]}
  >
    {/* Icône */}
    <View style={[S.notifIconWrap, { backgroundColor: notif.iconBg }]}>
      <Feather name={notif.icon} size={18} color={notif.iconColor} />
    </View>

    {/* Contenu */}
    <View style={S.notifContent}>
      <View style={S.notifTitleRow}>
        <Text style={[S.notifTitle, notif.read && S.notifTitleRead]} numberOfLines={1}>
          {notif.title}
        </Text>
        {!notif.read && <View style={[S.unreadDot, { backgroundColor: '#7C3AED' }]} />}
      </View>
      <Text style={S.notifText} numberOfLines={2}>{notif.text}</Text>
      <View style={S.notifBot}>
        <Text style={S.notifTime}>{notif.time}</Text>
        <View style={[S.notifPill, { backgroundColor: notif.pillBg }]}>
          <Text style={[S.notifPillText, { color: notif.pillColor }]}>{notif.pill}</Text>
        </View>
      </View>
    </View>

    {/* Supprimer */}
    <TouchableOpacity
      onPress={() => onDelete(notif.id)}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={{ padding: 6 }}
    >
      <Feather name="x" size={14} color={COLORS.textMuted || '#94A3B8'} />
    </TouchableOpacity>
  </TouchableOpacity>
);

// ─── SCREEN ───────────────────────────────────────────────────────────────────
export default function AdminNotificationsScreen() {
  const navigation = useNavigation();
  const [notifs,      setNotifs]      = useState(INIT_NOTIFS);
  const [activeChip,  setActiveChip]  = useState('tous');

  const unreadCount = notifs.filter(n => !n.read).length;

  const filtered = notifs.filter(n =>
    activeChip === 'tous' || n.type === activeChip
  );

  const chipCount = (type) => type === 'tous'
    ? notifs.filter(n => !n.read).length
    : notifs.filter(n => n.type === type && !n.read).length;

  const markRead   = (id) => setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  const deleteOne  = (id) => setNotifs(p => p.filter(n => n.id !== id));
  const markAll    = () => setNotifs(p => p.map(n => ({ ...n, read: true })));

  const handlePress = (notif) => {
    if (notif.dest) navigation.navigate(notif.dest, notif.params || {});
  };

  return (
    <AdminLayout activeTab="notifications">
      <View style={S.container}>
        <StatusBar barStyle="light-content" />

        {/* ── Header ── */}
        <LinearGradient colors={['#4C1D95', '#1E1B4B']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={S.header}>
          {/* Blobs */}
          <View style={{ position: 'absolute', left: -60, top: -20, width: 200, height: 200, borderRadius: 100, backgroundColor: '#6D28D9', opacity: 0.35 }} />
          <View style={{ position: 'absolute', right: -40, bottom: -30, width: 160, height: 160, borderRadius: 80, backgroundColor: '#3B82F6', opacity: 0.18 }} />

          <View style={S.headerTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={S.headerGreeting}>Centre de messages</Text>
              <Text style={S.headerTitle}>
                Notifications{' '}
                {unreadCount > 0 && <Text style={S.headerAccent}>({unreadCount})</Text>}
              </Text>
            </View>
            {unreadCount > 0 && (
              <TouchableOpacity style={S.markAllBtn} onPress={markAll}>
                <Text style={S.markAllText}>Tout lire</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Barre de progression non-lus */}
          {notifs.length > 0 && (
            <View style={{ marginTop: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: '600' }}>
                  {notifs.length - unreadCount} lues sur {notifs.length}
                </Text>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: '600' }}>
                  {Math.round(((notifs.length - unreadCount) / notifs.length) * 100)}%
                </Text>
              </View>
              <View style={{ height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.12)' }}>
                <View style={{
                  height: 5, borderRadius: 3, backgroundColor: '#A78BFA',
                  width: `${((notifs.length - unreadCount) / notifs.length) * 100}%`,
                }} />
              </View>
            </View>
          )}
        </LinearGradient>

        {/* ── Chips filtre ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          style={S.chipRow} contentContainerStyle={{ paddingRight: 16, gap: 8 }}>
          {CHIPS.map(c => {
            const cnt = chipCount(c.id);
            return (
              <TouchableOpacity key={c.id}
                style={[S.chip, activeChip === c.id && S.chipActive]}
                onPress={() => setActiveChip(c.id)}>
                <Text style={[S.chipText, activeChip === c.id && S.chipTextActive]}>{c.label}</Text>
                {cnt > 0 && (
                  <View style={[S.chipBadge, activeChip === c.id && { backgroundColor: '#fff' }]}>
                    <Text style={[S.chipBadgeText, activeChip === c.id && { color: '#1E293B' }]}>{cnt}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Liste ── */}
        <ScrollView showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: Platform.OS === 'ios' ? 100 : 90 }}>

          {/* Section non-lues */}
          {filtered.some(n => !n.read) && (
            <>
              <View style={S.sectionSep}>
                <View style={S.sectionSepLine} />
                <Text style={S.sectionSepText}>Non lues</Text>
                <View style={S.sectionSepLine} />
              </View>
              {filtered.filter(n => !n.read).map(n => (
                <NotifCard key={n.id} notif={n}
                  onRead={markRead} onDelete={deleteOne} onPress={handlePress} />
              ))}
            </>
          )}

          {/* Section lues */}
          {filtered.some(n => n.read) && (
            <>
              <View style={S.sectionSep}>
                <View style={S.sectionSepLine} />
                <Text style={S.sectionSepText}>Lues</Text>
                <View style={S.sectionSepLine} />
              </View>
              {filtered.filter(n => n.read).map(n => (
                <NotifCard key={n.id} notif={n}
                  onRead={markRead} onDelete={deleteOne} onPress={handlePress} />
              ))}
            </>
          )}

          {/* Empty */}
          {filtered.length === 0 && (
            <View style={S.emptyBox}>
              <View style={{ width: 72, height: 72, borderRadius: 24, backgroundColor: '#EDE9FE', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                <Feather name="bell-off" size={32} color="#7C3AED" />
              </View>
              <Text style={S.emptyText}>Aucune notification</Text>
              <Text style={S.emptySub}>
                {activeChip === 'tous' ? 'Tout est à jour !' : `Aucune notif de type "${activeChip}"`}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </AdminLayout>
  );
}