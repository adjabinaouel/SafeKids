import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StatusBar, Animated, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import DoctorLayout from '../../../components/Navigation/DoctorNavigation';
import S from './NotificationsMedecinStyles';

const CHIPS = [
  { id: 'all',      label: 'Toutes' },
  { id: 'patient',  label: 'Patients' },
  { id: 'consult',  label: 'Consultations' },
  { id: 'message',  label: 'Messages' },
  { id: 'system',   label: 'Système' },
];

const INIT_NOTIFS = [
  {
    id: 'n1', type: 'patient', read: false,
    icon: 'user-check', iconBg: '#D1FAE5', iconColor: '#059669',
    title: 'Nouveau suivi patient',
    text: 'Le patient Amine a été ajouté à votre liste. Commencez le suivi dès maintenant.',
    time: 'Il y a 5 min', pill: 'Patient', pillBg: '#D1FAE5', pillColor: '#059669',
    dest: 'Patients', params: {},
  },
  {
    id: 'n2', type: 'consult', read: false,
    icon: 'clock', iconBg: '#E0F2FE', iconColor: '#0EA5E9',
    title: 'Consultation programmée',
    text: 'Nouvelle consultation planifiée avec Sara le 28 avril à 14h30.',
    time: 'Il y a 20 min', pill: 'Consultation', pillBg: '#E0F2FE', pillColor: '#0EA5E9',
    dest: 'Patients', params: {},
  },
  {
    id: 'n3', type: 'message', read: false,
    icon: 'message-circle', iconBg: '#CFFAFE', iconColor: '#06B6D4',
    title: 'Message urgent',
    text: 'Le parent de Lina a envoyé une question sur le suivi de son programme.',
    time: 'Il y a 1h', pill: 'Message', pillBg: '#CFFAFE', pillColor: '#0284C7',
    dest: 'Patients', params: {},
  },
  {
    id: 'n4', type: 'system', read: true,
    icon: 'settings', iconBg: '#F1F5F9', iconColor: '#64748B',
    title: 'Mise à jour de la plateforme',
    text: 'La version SafeKids v2.1.0 est maintenant disponible avec corrections de bugs.',
    time: 'Hier 18:30', pill: 'Système', pillBg: '#F1F5F9', pillColor: '#475569',
    dest: null, params: {},
  },
];

const NotifCard = ({ notif, onRead, onDelete, onPress }) => (
  <TouchableOpacity
    activeOpacity={0.84}
    onPress={() => { onRead(notif.id); onPress(notif); }}
    style={[S.notifCard, notif.read && S.notifCardRead]}
  >
    <View style={[S.notifIconWrap, { backgroundColor: notif.iconBg }]}> 
      <Feather name={notif.icon} size={18} color={notif.iconColor} />
    </View>

    <View style={S.notifContent}>
      <View style={S.notifTitleRow}>
        <Text style={[S.notifTitle, notif.read && S.notifTitleRead]} numberOfLines={1}>
          {notif.title}
        </Text>
        {!notif.read && <View style={[S.unreadDot, { backgroundColor: notif.iconColor }]} />}
      </View>
      <Text style={S.notifText} numberOfLines={2}>{notif.text}</Text>
      <View style={S.notifBot}>
        <Text style={S.notifTime}>{notif.time}</Text>
        <View style={[S.notifPill, { backgroundColor: notif.pillBg }]}> 
          <Text style={[S.notifPillText, { color: notif.pillColor }]}>{notif.pill}</Text>
        </View>
      </View>
    </View>

    <TouchableOpacity
      onPress={() => onDelete(notif.id)}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={{ padding: 6 }}
    >
      <Feather name="x" size={14} color="#94A3B8" />
    </TouchableOpacity>
  </TouchableOpacity>
);

export default function NotificationsMedecin({ navigation }) {
  const [notifs, setNotifs] = useState(INIT_NOTIFS);
  const [activeChip, setActiveChip] = useState('all');
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(headerAnim, { toValue: 1, tension: 55, friction: 8, useNativeDriver: true }).start();
  }, []);

  const unreadCount = notifs.filter(n => !n.read).length;
  const filtered = notifs.filter(n => activeChip === 'all' || n.type === activeChip);

  const markRead = (id) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const deleteOne = (id) => setNotifs(prev => prev.filter(n => n.id !== id));
  const markAll = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const handlePress = (notif) => {
    if (notif.dest) navigation.navigate(notif.dest, notif.params || {});
  };

  return (
    <DoctorLayout activeTab="notifications">
      <View style={S.container}>
        <StatusBar barStyle="light-content" />

        <LinearGradient colors={['#4C1D95', '#1E1B4B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={S.header}>
          <View style={{ position: 'absolute', left: -60, top: -20, width: 200, height: 200, borderRadius: 100, backgroundColor: '#6D28D9', opacity: 0.35 }} />
          <View style={{ position: 'absolute', right: -40, bottom: -30, width: 160, height: 160, borderRadius: 80, backgroundColor: '#3B82F6', opacity: 0.18 }} />

          <Animated.View style={{
            opacity: headerAnim,
            transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }],
          }}>
            <View style={S.headerTopRow}>
              <View style={{ flex: 1 }}>
                <Text style={S.headerGreeting}>Centre de notifications</Text>
                <Text style={S.headerTitle}>
                  Notifications médecin{' '}
                  {unreadCount > 0 && <Text style={S.headerAccent}>({unreadCount})</Text>}
                </Text>
              </View>
              {unreadCount > 0 && (
                <TouchableOpacity style={S.markAllBtn} onPress={markAll}>
                  <Text style={S.markAllText}>Tout lire</Text>
                </TouchableOpacity>
              )}
            </View>

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
                  <View style={{ height: 5, borderRadius: 3, backgroundColor: '#A78BFA', width: `${((notifs.length - unreadCount) / notifs.length) * 100}%` }} />
                </View>
              </View>
            )}
          </Animated.View>
        </LinearGradient>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.chipRow} contentContainerStyle={{ paddingRight: 16, gap: 8 }}>
          {CHIPS.map(c => {
            const cnt = c.id === 'all' ? notifs.filter(n => !n.read).length : notifs.filter(n => n.type === c.id && !n.read).length;
            return (
              <TouchableOpacity
                key={c.id}
                style={[S.chip, activeChip === c.id && S.chipActive]}
                onPress={() => setActiveChip(c.id)}
              >
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

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: Platform.OS === 'ios' ? 100 : 90 }}>
          {filtered.some(n => !n.read) && (
            <>
              <View style={S.sectionSep}>
                <View style={S.sectionSepLine} />
                <Text style={S.sectionSepText}>Non lues</Text>
                <View style={S.sectionSepLine} />
              </View>
              {filtered.filter(n => !n.read).map(n => (
                <NotifCard key={n.id} notif={n} onRead={markRead} onDelete={deleteOne} onPress={handlePress} />
              ))}
            </>
          )}

          {filtered.some(n => n.read) && (
            <>
              <View style={S.sectionSep}>
                <View style={S.sectionSepLine} />
                <Text style={S.sectionSepText}>Lues</Text>
                <View style={S.sectionSepLine} />
              </View>
              {filtered.filter(n => n.read).map(n => (
                <NotifCard key={n.id} notif={n} onRead={markRead} onDelete={deleteOne} onPress={handlePress} />
              ))}
            </>
          )}

          {filtered.length === 0 && (
            <View style={S.emptyBox}>
              <View style={{ width: 72, height: 72, borderRadius: 24, backgroundColor: '#EDE9FE', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                <Feather name="bell-off" size={32} color="#7C3AED" />
              </View>
              <Text style={S.emptyText}>Aucune notification</Text>
              <Text style={S.emptySub}>Toutes vos alertes sont à jour pour le moment.</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </DoctorLayout>
  );
}
