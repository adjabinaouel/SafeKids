// src/pages/parents/Notifications/NotificationsScreen.js
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Animated,
  StatusBar, Platform, Dimensions, ActivityIndicator,
  RefreshControl, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ParentLayout from '../../../components/Navigation/ParentNavigation';

const { width } = Dimensions.get('window');

const BASE_URL = 'https://unfailed-branden-healable.ngrok-free.dev';

const C = {
  primary: '#7C3AED', 
  primaryV: '#8B5CF6',
  primaryDark: '#4C1D95',
  blue: '#3B82F6',
  green: '#10B981', 
  amber: '#F59E0B', 
  rose: '#F43F5E',
  teal: '#06B6D4', 
  surface: '#F5F3FF', 
  white: '#FFFFFF',
  text: '#1E1B4B', 
  textSub: '#6B7280', 
  textMuted: '#9CA3AF', 
  border: '#E5E7EB',
};

const gl = (a = 0.15) => `rgba(255,255,255,${a})`;
const sh = (color, y = 6, op = 0.14, r = 16, el = 4) =>
  Platform.select({
    ios: { shadowColor: color, shadowOffset: { width: 0, height: y }, shadowOpacity: op, shadowRadius: r },
    android: { elevation: el },
  });

async function apiFetch(path, options = {}) {
  const token = await AsyncStorage.getItem('userToken');
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Erreur ${res.status}`);
  return data;
}

function getNotifConfig(type) {
  switch (type) {
    case 'rdv_accepte':
      return { icon: 'check-circle', iconColor: '#059669', iconBg: '#D1FAE5', label: 'RDV confirmé', accent: '#059669' };
    case 'rdv_annule':
      return { icon: 'x-circle', iconColor: '#DC2626', iconBg: '#FEE2E2', label: 'RDV annulé', accent: '#DC2626' };
    case 'discussion_acceptee':
      return { icon: 'message-circle', iconColor: '#7C3AED', iconBg: '#EDE9FE', label: 'Discussion acceptée', accent: '#7C3AED' };
    case 'discussion_refusee':
      return { icon: 'x-circle', iconColor: '#DC2626', iconBg: '#FEE2E2', label: 'Discussion refusée', accent: '#DC2626' };
    case 'nouveau_message':
      return { icon: 'message-square', iconColor: '#2563EB', iconBg: '#DBEAFE', label: 'Nouveau message', accent: '#2563EB' };
    case 'rdv_info':
      return { icon: 'calendar', iconColor: '#D97706', iconBg: '#FEF3C7', label: 'RDV', accent: '#D97706' };
    case 'discussion_info':
      return { icon: 'bell', iconColor: '#0891B2', iconBg: '#CFFAFE', label: 'Info', accent: '#0891B2' };
    default:
      return { icon: 'bell', iconColor: '#6B7280', iconBg: '#F3F4F6', label: 'Notification', accent: '#6B7280' };
  }
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return "À l'instant";
  if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)}min`;
  if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)}h`;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Hier';
  return d.toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

const FILTERS = [
  { key: 'all', label: 'Tout', icon: 'grid' },
  { key: 'unread', label: 'Non lus', icon: 'circle' },
  { key: 'rdv', label: 'RDV', icon: 'calendar' },
  { key: 'message', label: 'Messages', icon: 'message-circle' },
];

function matchFilter(notif, filter) {
  if (filter === 'all') return true;
  if (filter === 'unread') return !notif.lu;
  if (filter === 'rdv') return notif.type?.includes('rdv');
  if (filter === 'message') return notif.type?.includes('message') || notif.type?.includes('discussion');
  return true;
}

// Carte notification
const NotifCard = ({ notif, index, onRead, onDelete, onPress }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const heightAnim = useRef(new Animated.Value(1)).current;
  const cfg = getNotifConfig(notif.type);

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 380, delay: 40 + index * 45, useNativeDriver: true }).start();
  }, []);

  const handleDelete = () => {
    Animated.parallel([
      Animated.timing(scale, { toValue: 0.85, duration: 180, useNativeDriver: true }),
      Animated.timing(heightAnim, { toValue: 0, duration: 280, useNativeDriver: false }),
      Animated.timing(anim, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]).start(() => onDelete(notif._id));
  };

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();
    if (!notif.lu) onRead(notif._id);
    if (onPress) onPress(notif);
  };

  return (
    <Animated.View style={{
      opacity: anim,
      transform: [{ scale }, { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
      maxHeight: heightAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 300] }),
      marginBottom: 10, overflow: 'hidden',
    }}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.92}>
        <View style={{
          backgroundColor: notif.lu ? 'rgba(255,255,255,0.70)' : C.white,
          borderRadius: 22,
          borderWidth: notif.lu ? 1 : 1.5,
          borderColor: notif.lu ? 'rgba(148,163,184,0.18)' : cfg.accent + '35',
          overflow: 'hidden',
          ...sh(notif.lu ? 'rgba(30,41,59,0.06)' : cfg.accent, notif.lu ? 3 : 10, notif.lu ? 0.06 : 0.16, notif.lu ? 8 : 22, notif.lu ? 2 : 6),
        }}>
          {!notif.lu && (
            <LinearGradient colors={[cfg.accent, cfg.accent + '88']}
              style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, borderTopLeftRadius: 22, borderBottomLeftRadius: 22 }} />
          )}

          <View style={{ flexDirection: 'row', padding: 16, paddingLeft: notif.lu ? 16 : 20, gap: 13 }}>
            <View style={{
              width: 50, height: 50, borderRadius: 17, flexShrink: 0,
              backgroundColor: cfg.iconBg, borderWidth: 1.5, borderColor: cfg.iconColor + '28',
              justifyContent: 'center', alignItems: 'center',
              ...sh(cfg.iconColor, 5, 0.14, 12, 3),
            }}>
              <Feather name={cfg.icon} size={22} color={cfg.iconColor} />
            </View>

            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <Text style={{ fontSize: 14, fontWeight: notif.lu ? '600' : '800', color: notif.lu ? C.textSub : C.text, flex: 1, marginRight: 8, lineHeight: 20 }}>
                  {notif.titre}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  {!notif.lu && <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: cfg.accent, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)' }} />}
                  <TouchableOpacity onPress={handleDelete}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={{ width: 26, height: 26, borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.75)', borderWidth: 1, borderColor: 'rgba(148,163,184,0.20)', justifyContent: 'center', alignItems: 'center' }}>
                    <Feather name="x" size={12} color={C.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={{ fontSize: 13, color: C.textSub, lineHeight: 18, marginBottom: 10 }}>
                {notif.message}
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={{ backgroundColor: cfg.iconBg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Feather name={cfg.icon} size={10} color={cfg.iconColor} />
                    <Text style={{ fontSize: 10, fontWeight: '700', color: cfg.iconColor }}>{cfg.label}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 10.5, color: C.textMuted, fontWeight: '500' }}>
                  {formatTime(notif.dateCreation)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ÉCRAN PRINCIPAL PARENT NOTIFICATIONS
export default function NotificationsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const headerAnim = useRef(new Animated.Value(0)).current;
  const pollRef = useRef(null);

  useEffect(() => {
    Animated.spring(headerAnim, { toValue: 1, tension: 55, friction: 8, useNativeDriver: true }).start();
  }, []);

  const loadNotifs = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await apiFetch('/api/parent/notifications');
      setNotifs(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('loadNotifs error:', e.message);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadNotifs();
    pollRef.current = setInterval(() => loadNotifs(true), 15000);
    return () => clearInterval(pollRef.current);
  }, [loadNotifs]);

  const markRead = useCallback(async (id) => {
    try {
      await apiFetch(`/api/parent/notifications/${id}/lire`, { method: 'PATCH' });
      setNotifs(prev => prev.map(n => n._id === id ? { ...n, lu: true } : n));
    } catch (error) {
      console.error('markRead error:', error);
    }
  }, []);

  const markAll = useCallback(async () => {
    try {
      await apiFetch('/api/parent/notifications/tout-lire', { method: 'PATCH' });
      setNotifs(prev => prev.map(n => ({ ...n, lu: true })));
    } catch (error) {
      console.error('markAll error:', error);
      Alert.alert('Erreur', 'Impossible de marquer toutes les notifications comme lues');
    }
  }, []);

  const deleteNotif = useCallback((id) => {
    setNotifs(prev => prev.filter(n => n._id !== id));
  }, []);

  const handleNotifPress = useCallback((notif) => {
    if (notif.idRdv) {
      navigation?.navigate?.('MesRendezVous');
    } else if (notif.idConversation) {
      navigation?.navigate?.('Messages');
    }
  }, [navigation]);

  const filtered = notifs.filter(n => matchFilter(n, filter));
  const unread = notifs.filter(n => !n.lu).length;

  const filterCount = (key) => {
    if (key === 'all') return notifs.length;
    if (key === 'unread') return notifs.filter(n => !n.lu).length;
    if (key === 'rdv') return notifs.filter(n => n.type?.includes('rdv')).length;
    if (key === 'message') return notifs.filter(n => n.type?.includes('message') || n.type?.includes('discussion')).length;
    return 0;
  };

  return (
    <ParentLayout activeTab="notifications">
      <View style={{ flex: 1, backgroundColor: C.surface }}>
        <StatusBar barStyle="light-content" />

        {/* HEADER - Violet */}
        <LinearGradient
          colors={['#4C1D95', '#6D28D9', '#7C3AED', '#9D68F5']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ paddingTop: insets.top + 16, paddingBottom: 28, overflow: 'hidden' }}
        >
          <View style={{ position: 'absolute', right: -60, top: -40, width: 220, height: 220, borderRadius: 110, backgroundColor: '#A78BFA', opacity: 0.18 }} />
          <View style={{ position: 'absolute', left: -40, bottom: -30, width: 180, height: 180, borderRadius: 90, backgroundColor: '#06B6D4', opacity: 0.10 }} />

          <Animated.View style={{
            opacity: headerAnim,
            transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }],
            paddingHorizontal: 22,
          }}>
            <Text style={{ fontSize: 11, color: gl(0.52), fontWeight: '600', letterSpacing: 1.5, marginBottom: 6 }}>
              CENTRE D'ALERTES
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Text style={{ fontSize: 30, fontWeight: '800', color: '#fff', letterSpacing: -0.8 }}>Notifications</Text>
                  {unread > 0 && (
                    <View style={{ backgroundColor: C.rose, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1.5, borderColor: gl(0.30), ...sh(C.rose, 4, 0.40, 10, 4) }}>
                      <Text style={{ fontSize: 12, fontWeight: '900', color: '#fff' }}>{unread}</Text>
                    </View>
                  )}
                </View>
                <Text style={{ fontSize: 13, color: gl(0.58), marginTop: 4 }}>
                  {unread > 0 ? `${unread} non lu${unread > 1 ? 's' : ''}` : 'Tout est à jour ✓'}
                </Text>
              </View>

              {unread > 0 && (
                <TouchableOpacity onPress={markAll} style={{
                  backgroundColor: gl(0.14), borderRadius: 13,
                  paddingHorizontal: 14, paddingVertical: 10,
                  borderWidth: 1, borderColor: gl(0.22),
                  flexDirection: 'row', alignItems: 'center', gap: 7,
                }}>
                  <Feather name="check-circle" size={13} color={gl(0.85)} />
                  <Text style={{ fontSize: 11, fontWeight: '700', color: gl(0.85) }}>Tout lire</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Stats */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {[
                { icon: 'bell', label: 'Non lus', value: unread, color: '#FCD34D' },
                { icon: 'inbox', label: 'Total', value: notifs.length, color: '#A7F3D0' },
                { icon: 'calendar', label: 'RDV', value: notifs.filter(n => n.type?.includes('rdv')).length, color: '#FDE68A' },
              ].map((s, i) => (
                <View key={i} style={{ flex: 1, backgroundColor: gl(0.12), borderRadius: 16, paddingVertical: 13, alignItems: 'center', borderWidth: 1, borderColor: gl(0.20) }}>
                  <Feather name={s.icon} size={14} color={s.color} style={{ marginBottom: 5 }} />
                  <Text style={{ fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: -0.3 }}>{s.value}</Text>
                  <Text style={{ fontSize: 9, color: gl(0.50), textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 2 }}>{s.label}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        </LinearGradient>

        {/* FILTRES */}
        <View style={{ backgroundColor: 'rgba(255,255,255,0.94)', borderBottomWidth: 1, borderBottomColor: 'rgba(148,163,184,0.15)', ...sh('rgba(30,41,59,0.06)', 4, 1, 12, 3) }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 18, paddingVertical: 12, gap: 8 }}>
            {FILTERS.map(f => {
              const active = filter === f.key;
              const cnt = filterCount(f.key);
              return (
                <TouchableOpacity key={f.key} onPress={() => setFilter(f.key)} activeOpacity={0.80}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 6,
                    paddingHorizontal: 16, paddingVertical: 8,
                    borderRadius: 20, borderWidth: 1.5,
                    backgroundColor: active ? C.primary : 'rgba(255,255,255,0.75)',
                    borderColor: active ? C.primary : 'rgba(148,163,184,0.22)',
                    ...sh(active ? C.primary : 'transparent', active ? 5 : 0, active ? 0.25 : 0, active ? 12 : 0, active ? 4 : 0),
                  }}>
                  <Feather name={f.icon} size={12} color={active ? '#fff' : C.textSub} />
                  <Text style={{ fontSize: 12, fontWeight: '700', color: active ? '#fff' : C.textSub }}>{f.label}</Text>
                  {cnt > 0 && (
                    <View style={{ backgroundColor: active ? 'rgba(255,255,255,0.22)' : C.primary + '18', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 1 }}>
                      <Text style={{ fontSize: 10, fontWeight: '800', color: active ? '#fff' : C.primary }}>{cnt}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* LISTE */}
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={C.primary} />
            <Text style={{ fontSize: 13, color: C.textMuted, marginTop: 12 }}>Chargement des notifications...</Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => { setRefreshing(true); loadNotifs(); }}
                colors={[C.primary]}
                tintColor={C.primary}
              />
            }>
            {filtered.length === 0 ? (
              <View style={{ alignItems: 'center', paddingTop: 64 }}>
                <View style={{
                  width: 90, height: 90, borderRadius: 30,
                  backgroundColor: 'rgba(255,255,255,0.75)',
                  borderWidth: 1.5, borderColor: 'rgba(148,163,184,0.20)',
                  justifyContent: 'center', alignItems: 'center', marginBottom: 20,
                  ...sh('rgba(30,41,59,0.07)', 8, 1, 18, 4),
                }}>
                  <Feather name="bell-off" size={36} color={C.textMuted} />
                </View>
                <Text style={{ fontSize: 19, fontWeight: '700', color: C.text, marginBottom: 8 }}>
                  {filter === 'all' ? 'Aucune notification' : 'Aucun résultat'}
                </Text>
                <Text style={{ fontSize: 13, color: C.textMuted, textAlign: 'center', lineHeight: 20 }}>
                  {filter === 'all'
                    ? 'Vous êtes à jour !\nLes nouvelles alertes apparaîtront ici.'
                    : 'Aucune notification dans cette catégorie.'}
                </Text>
                {filter !== 'all' && (
                  <TouchableOpacity onPress={() => setFilter('all')} style={{ marginTop: 16 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: C.primary }}>Voir toutes les notifications</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <>
                {/* Non lus en premier */}
                {filtered.some(n => !n.lu) && (
                  <>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.primary }} />
                      <Text style={{ fontSize: 11, fontWeight: '700', color: C.primary, letterSpacing: 1.1 }}>
                        NON LUS · {filtered.filter(n => !n.lu).length}
                      </Text>
                    </View>
                    {filtered.filter(n => !n.lu).map((n, i) => (
                      <NotifCard
                        key={n._id}
                        notif={n}
                        index={i}
                        onRead={markRead}
                        onDelete={deleteNotif}
                        onPress={handleNotifPress}
                      />
                    ))}
                  </>
                )}

                {/* Déjà lues */}
                {filtered.some(n => n.lu) && (
                  <>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, marginBottom: 12 }}>
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.textMuted }} />
                      <Text style={{ fontSize: 11, fontWeight: '700', color: C.textMuted, letterSpacing: 1.1 }}>
                        DÉJÀ LUES · {filtered.filter(n => n.lu).length}
                      </Text>
                    </View>
                    {filtered.filter(n => n.lu).map((n, i) => (
                      <NotifCard
                        key={n._id}
                        notif={n}
                        index={i + 10}
                        onRead={markRead}
                        onDelete={deleteNotif}
                        onPress={handleNotifPress}
                      />
                    ))}
                  </>
                )}
              </>
            )}
          </ScrollView>
        )}
      </View>
    </ParentLayout>
  );
}