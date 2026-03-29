// src/pages/parents/Notifications/NotificationsScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Animated,
  StatusBar, Platform, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import ParentLayout from '../../../components/Navigation/ParentNavigation';

const { width } = Dimensions.get('window');

const C = {
  primary: '#6C3AED', primaryV: '#8B5CF6', blue: '#3B82F6',
  green: '#10B981', amber: '#F59E0B', rose: '#F43F5E',
  teal: '#06B6D4', surface: '#F5F3FF', white: '#FFFFFF',
  text: '#1E1B4B', textSub: '#6B7280', textMuted: '#9CA3AF', border: '#E5E7EB',
};
const gl = (a = 0.15) => `rgba(255,255,255,${a})`;
const sh = (color, y = 6, op = 0.14, r = 16, el = 4) =>
  Platform.select({
    ios: { shadowColor: color, shadowOffset: { width: 0, height: y }, shadowOpacity: op, shadowRadius: r },
    android: { elevation: el },
  });

const NOTIFS = [
  {
    id: '1', read: false, type: 'progress', time: 'Il y a 5 min',
    title: 'Nouveau record ! 🏆', child: 'Amine', childColor: '#6C3AED', childBg: '#EDE9FE',
    body: 'Amine a terminé 5 activités aujourd\'hui — son record personnel !',
    icon: 'trending-up', iconColor: '#6C3AED', iconBg: '#EDE9FE',
  },
  {
    id: '2', read: false, type: 'alert', time: 'Il y a 20 min',
    title: 'Séance non complétée ⚠️', child: 'Sara', childColor: '#0EA5E9', childBg: '#E0F2FE',
    body: 'Sara n\'a pas terminé sa séance de mathématiques prévue à 15h00.',
    icon: 'alert-circle', iconColor: '#F59E0B', iconBg: '#FEF3C7',
  },
  {
    id: '3', read: false, type: 'message', time: 'Il y a 1h',
    title: 'Message du Dr. Meziane', child: null, childColor: null, childBg: null,
    body: 'Bonjour ! J\'ai remarqué de belles améliorations chez Amine cette semaine. Continuez !',
    icon: 'message-circle', iconColor: '#06B6D4', iconBg: '#CFFAFE',
  },
  {
    id: '4', read: true, type: 'progress', time: 'Hier, 18h30',
    title: 'Objectif hebdomadaire atteint ✅', child: 'Sara', childColor: '#0EA5E9', childBg: '#E0F2FE',
    body: 'Sara a atteint son objectif de 10 activités cette semaine. Félicitations !',
    icon: 'award', iconColor: '#10B981', iconBg: '#D1FAE5',
  },
  {
    id: '5', read: true, type: 'system', time: 'Hier, 09h00',
    title: 'Rappel de planification 📅', child: null, childColor: null, childBg: null,
    body: 'N\'oubliez pas de planifier les séances de la semaine prochaine.',
    icon: 'calendar', iconColor: '#9CA3AF', iconBg: '#F3F4F6',
  },
  {
    id: '6', read: true, type: 'progress', time: 'Lundi, 09h00',
    title: 'Rapport hebdomadaire prêt 📊', child: null, childColor: null, childBg: null,
    body: 'Votre rapport de suivi pour la semaine du 17 au 23 mars est disponible.',
    icon: 'bar-chart-2', iconColor: '#6C3AED', iconBg: '#EDE9FE',
  },
];

const FILTERS = [
  { key: 'all',      label: 'Tout'     },
  { key: 'unread',   label: 'Non lus'  },
  { key: 'progress', label: 'Progrès'  },
  { key: 'alert',    label: 'Alertes'  },
  { key: 'message',  label: 'Messages' },
  { key: 'system',   label: 'Système'  },
];

// ─── CARD NOTIF ───────────────────────────────────────────────────────────────
const NotifCard = ({ notif, index, onRead, onDelete }) => {
  const anim  = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const del   = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 360, delay: 50 + index * 50, useNativeDriver: true }).start();
  }, []);

  const handleDelete = () => {
    Animated.parallel([
      Animated.timing(del,  { toValue: 0, duration: 280, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]).start(() => onDelete(notif.id));
  };

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1,    useNativeDriver: true }),
    ]).start(() => onRead(notif.id));
  };

  return (
    <Animated.View style={{
      opacity: Animated.multiply(anim, del),
      transform: [{ scale }, { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
      marginBottom: 10,
    }}>
      <TouchableOpacity onPress={handlePress} activeOpacity={1}>
        <View style={{
          backgroundColor: notif.read ? 'rgba(255,255,255,0.70)' : C.white,
          borderRadius: 22,
          borderWidth: notif.read ? 1 : 1.5,
          borderColor: notif.read ? 'rgba(148,163,184,0.18)' : notif.iconColor + '35',
          overflow: 'hidden',
          ...sh(notif.read ? 'rgba(30,41,59,0.06)' : notif.iconColor, notif.read ? 3 : 10, notif.read ? 1 : 0.16, notif.read ? 8 : 22, notif.read ? 2 : 6),
        }}>
          {/* Shimmer */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: notif.read ? 'rgba(255,255,255,0.80)' : 'rgba(255,255,255,0.95)' }} />
          {/* Barre latérale colorée si non lu */}
          {!notif.read && (
            <LinearGradient
              colors={[notif.iconColor, notif.iconColor + '88']}
              style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, borderTopLeftRadius: 22, borderBottomLeftRadius: 22 }}
            />
          )}

          <View style={{ flexDirection: 'row', padding: 16, paddingLeft: notif.read ? 16 : 20, gap: 13 }}>
            {/* Icône */}
            <View style={{
              width: 48, height: 48, borderRadius: 17, flexShrink: 0,
              backgroundColor: notif.iconBg,
              borderWidth: 1.5, borderColor: notif.iconColor + '28',
              justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
              ...sh(notif.iconColor, 5, 0.14, 12, 3),
            }}>
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.90)', borderTopLeftRadius: 17, borderTopRightRadius: 17 }} />
              <Feather name={notif.icon} size={21} color={notif.iconColor} />
            </View>

            {/* Contenu */}
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <Text style={{
                  fontSize: 14, fontWeight: notif.read ? '600' : '800',
                  color: notif.read ? C.textSub : C.text, flex: 1, marginRight: 8, lineHeight: 20,
                }}>
                  {notif.title}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  {!notif.read && (
                    <View style={{
                      width: 9, height: 9, borderRadius: 5,
                      backgroundColor: notif.iconColor,
                      borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)',
                    }} />
                  )}
                  <TouchableOpacity
                    onPress={handleDelete}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={{
                      width: 26, height: 26, borderRadius: 9,
                      backgroundColor: 'rgba(255,255,255,0.75)',
                      borderWidth: 1, borderColor: 'rgba(148,163,184,0.20)',
                      justifyContent: 'center', alignItems: 'center',
                    }}
                  >
                    <Feather name="x" size={12} color={C.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={{ fontSize: 13, color: C.textSub, lineHeight: 18, marginBottom: 10 }}>{notif.body}</Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                {notif.child ? (
                  <View style={{
                    flexDirection: 'row', alignItems: 'center', gap: 5,
                    backgroundColor: notif.childBg,
                    borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3,
                    borderWidth: 1, borderColor: notif.childColor + '25',
                  }}>
                    <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: notif.childColor }} />
                    <Text style={{ fontSize: 10, fontWeight: '700', color: notif.childColor }}>{notif.child}</Text>
                  </View>
                ) : <View />}
                <Text style={{ fontSize: 10.5, color: C.textMuted, fontWeight: '500' }}>{notif.time}</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── ÉCRAN ────────────────────────────────────────────────────────────────────
export default function NotificationsScreen({ navigation }) {
  const [notifs,  setNotifs]  = useState(NOTIFS);
  const [filter,  setFilter]  = useState('all');
  const headerAnim = useRef(new Animated.Value(0)).current;

  const unread = notifs.filter(n => !n.read).length;

  useEffect(() => {
    Animated.spring(headerAnim, { toValue: 1, tension: 55, friction: 8, useNativeDriver: true }).start();
  }, []);

  const filtered = notifs.filter(n => {
    if (filter === 'all')    return true;
    if (filter === 'unread') return !n.read;
    return n.type === filter;
  });

  const markRead    = (id) => setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  const deleteNotif = (id) => setNotifs(p => p.filter(n => n.id !== id));
  const markAll     = ()   => setNotifs(p => p.map(n => ({ ...n, read: true })));

  return (
    <ParentLayout activeTab="notifications">
      <View style={{ flex: 1, backgroundColor: C.surface }}>
        <StatusBar barStyle="light-content" />

        {/* HEADER */}
        <LinearGradient
          colors={['#1A0A4A', '#3B1FA8', '#6C3AED', '#9D68F5']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ paddingTop: Platform.OS === 'ios' ? 58 : 34, paddingBottom: 28, overflow: 'hidden' }}
        >
          <View style={{ position: 'absolute', right: -60, top: -40, width: 220, height: 220, borderRadius: 110, backgroundColor: '#A78BFA', opacity: 0.18 }} />
          <View style={{ position: 'absolute', left: -40, bottom: -30, width: 180, height: 180, borderRadius: 90, backgroundColor: '#06B6D4', opacity: 0.10 }} />
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: gl(0.22) }} />

          <Animated.View style={{
            opacity: headerAnim,
            transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }],
            paddingHorizontal: 22,
          }}>
            <Text style={{ fontSize: 11, color: gl(0.52), fontWeight: '600', letterSpacing: 1.5, marginBottom: 6 }}>CENTRE D'ALERTES</Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Text style={{ fontSize: 30, fontWeight: '800', color: '#fff', letterSpacing: -0.8 }}>Notifications</Text>
                  {unread > 0 && (
                    <View style={{
                      backgroundColor: C.rose, borderRadius: 12,
                      paddingHorizontal: 10, paddingVertical: 4,
                      borderWidth: 1.5, borderColor: gl(0.30),
                      ...sh(C.rose, 4, 0.40, 10, 4),
                    }}>
                      <Text style={{ fontSize: 12, fontWeight: '900', color: '#fff' }}>{unread}</Text>
                    </View>
                  )}
                </View>
                <Text style={{ fontSize: 13, color: gl(0.58), marginTop: 4 }}>
                  {unread > 0 ? `${unread} non lu${unread > 1 ? 's' : ''}` : 'Tout est à jour ✓'}
                </Text>
              </View>

              {/* Actions */}
              <View style={{ gap: 8 }}>
                {unread > 0 && (
                  <TouchableOpacity onPress={markAll} style={{
                    backgroundColor: gl(0.14), borderRadius: 13,
                    paddingHorizontal: 13, paddingVertical: 8,
                    borderWidth: 1, borderColor: gl(0.22),
                    flexDirection: 'row', alignItems: 'center', gap: 6, overflow: 'hidden',
                  }}>
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: gl(0.25), borderTopLeftRadius: 13, borderTopRightRadius: 13 }} />
                    <Feather name="check-circle" size={13} color={gl(0.85)} />
                    <Text style={{ fontSize: 11, fontWeight: '700', color: gl(0.85) }}>Tout lire</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Stats pills */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {[
                { icon: 'bell',     label: 'Non lus',     value: unread,                                    color: '#FCD34D' },
                { icon: 'inbox',    label: 'Total',       value: notifs.length,                             color: '#C4B5FD' },
                { icon: 'alert-circle', label: 'Alertes', value: notifs.filter(n => n.type === 'alert').length, color: '#FCA5A5' },
              ].map((s, i) => (
                <View key={i} style={{
                  flex: 1, backgroundColor: gl(0.12),
                  borderRadius: 16, paddingVertical: 13, alignItems: 'center',
                  borderWidth: 1, borderColor: gl(0.20), overflow: 'hidden',
                }}>
                  <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: gl(0.25), borderTopLeftRadius: 16, borderTopRightRadius: 16 }} />
                  <Feather name={s.icon} size={14} color={s.color} style={{ marginBottom: 5 }} />
                  <Text style={{ fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: -0.3 }}>{s.value}</Text>
                  <Text style={{ fontSize: 9, color: gl(0.50), textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 2 }}>{s.label}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        </LinearGradient>

        {/* FILTRES */}
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.94)',
          borderBottomWidth: 1, borderBottomColor: 'rgba(148,163,184,0.15)',
          ...sh('rgba(30,41,59,0.06)', 4, 1, 12, 3),
        }}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.95)' }} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 18, paddingVertical: 12, gap: 8 }}>
            {FILTERS.map(f => {
              const active = filter === f.key;
              const cnt = f.key === 'all'    ? notifs.length
                        : f.key === 'unread' ? notifs.filter(n => !n.read).length
                        : notifs.filter(n => n.type === f.key).length;
              return (
                <TouchableOpacity key={f.key} onPress={() => setFilter(f.key)} activeOpacity={0.80} style={{
                  flexDirection: 'row', alignItems: 'center', gap: 6,
                  paddingHorizontal: 16, paddingVertical: 8,
                  borderRadius: 20, borderWidth: 1.5,
                  backgroundColor: active ? C.primary : 'rgba(255,255,255,0.75)',
                  borderColor: active ? C.primary : 'rgba(148,163,184,0.22)',
                  overflow: 'hidden',
                  ...sh(active ? C.primary : 'transparent', active ? 5 : 0, active ? 0.25 : 0, active ? 12 : 0, active ? 4 : 0),
                }}>
                  {active && <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.30)', borderTopLeftRadius: 20, borderTopRightRadius: 20 }} />}
                  <Text style={{ fontSize: 12, fontWeight: '700', color: active ? '#fff' : C.textSub }}>{f.label}</Text>
                  {cnt > 0 && (
                    <View style={{
                      backgroundColor: active ? 'rgba(255,255,255,0.22)' : C.primary + '18',
                      borderRadius: 10, paddingHorizontal: 7, paddingVertical: 1,
                    }}>
                      <Text style={{ fontSize: 10, fontWeight: '800', color: active ? '#fff' : C.primary }}>{cnt}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* LISTE */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 110 }}>
          {filtered.length === 0 ? (
            <View style={{ alignItems: 'center', paddingTop: 64 }}>
              <View style={{
                width: 84, height: 84, borderRadius: 28,
                backgroundColor: 'rgba(255,255,255,0.75)',
                borderWidth: 1.5, borderColor: 'rgba(148,163,184,0.20)',
                justifyContent: 'center', alignItems: 'center', marginBottom: 20,
                overflow: 'hidden',
                ...sh('rgba(30,41,59,0.07)', 8, 1, 18, 4),
              }}>
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.95)', borderTopLeftRadius: 28, borderTopRightRadius: 28 }} />
                <Feather name="bell-off" size={34} color={C.textMuted} />
              </View>
              <Text style={{ fontSize: 19, fontWeight: '700', color: C.text, marginBottom: 8 }}>Aucune notification</Text>
              <Text style={{ fontSize: 13, color: C.textMuted, textAlign: 'center', lineHeight: 20 }}>
                Vous êtes à jour !{'\n'}Les nouvelles alertes apparaîtront ici.
              </Text>
            </View>
          ) : (
            <>
              {filtered.some(n => !n.read) && (
                <>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.primary }} />
                    <Text style={{ fontSize: 11, fontWeight: '700', color: C.primary, letterSpacing: 1.1 }}>NON LUS · {filtered.filter(n => !n.read).length}</Text>
                  </View>
                  {filtered.filter(n => !n.read).map((n, i) => (
                    <NotifCard key={n.id} notif={n} index={i} onRead={markRead} onDelete={deleteNotif} />
                  ))}
                </>
              )}
              {filtered.some(n => n.read) && (
                <>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, marginBottom: 12 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.textMuted }} />
                    <Text style={{ fontSize: 11, fontWeight: '700', color: C.textMuted, letterSpacing: 1.1 }}>DÉJÀ LUES · {filtered.filter(n => n.read).length}</Text>
                  </View>
                  {filtered.filter(n => n.read).map((n, i) => (
                    <NotifCard key={n.id} notif={n} index={i + 5} onRead={markRead} onDelete={deleteNotif} />
                  ))}
                </>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </ParentLayout>
  );
}