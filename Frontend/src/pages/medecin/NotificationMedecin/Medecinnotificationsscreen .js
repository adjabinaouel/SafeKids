// src/pages/medecin/Notifications/MedecinNotificationsScreen.js
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Animated,
  StatusBar, Platform, Dimensions, ActivityIndicator,
  RefreshControl, Modal, TouchableWithoutFeedback, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MedecinLayout from '../../../components/Navigation/MedecinNavigation';

const { width, height } = Dimensions.get('window');

const BASE_URL = 'https://unfailed-branden-healable.ngrok-free.dev';

const C = {
  primary: '#7C3AED', 
  primaryV: '#8B5CF6',
  primaryDark: '#4C1D95',
  green: '#10B981', 
  rose: '#F43F5E',
  surface: '#F5F3FF', 
  white: '#FFFFFF',
  text: '#1E1B4B', 
  textSub: '#6B7280', 
  textMuted: '#9CA3AF',
  orange: '#F59E0B', 
  purple: '#7C3AED', 
  blue: '#3B82F6',
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
    case 'rdv_demande':
      return { icon: 'calendar', iconColor: '#D97706', iconBg: '#FEF3C7', label: 'RDV', accent: '#D97706' };
    case 'discussion_demande':
      return { icon: 'message-circle', iconColor: '#7C3AED', iconBg: '#EDE9FE', label: 'Discussion', accent: '#7C3AED' };
    case 'nouveau_message':
      return { icon: 'message-square', iconColor: '#2563EB', iconBg: '#DBEAFE', label: 'Message', accent: '#2563EB' };
    case 'rdv_accepte_info':
      return { icon: 'check-circle', iconColor: '#059669', iconBg: '#D1FAE5', label: 'Confirmé', accent: '#059669' };
    case 'rdv_annule_info':
      return { icon: 'x-circle', iconColor: '#DC2626', iconBg: '#FEE2E2', label: 'Annulé', accent: '#DC2626' };
    case 'discussion_info':
      return { icon: 'bell', iconColor: '#059669', iconBg: '#D1FAE5', label: 'Suivi', accent: '#059669' };
    default:
      return { icon: 'bell', iconColor: '#059669', iconBg: '#D1FAE5', label: 'Notification', accent: '#059669' };
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
  { key: 'action', label: 'À traiter', icon: 'alert-circle' },
];

function matchFilter(notif, filter) {
  if (filter === 'all') return true;
  if (filter === 'unread') return !notif.lu;
  if (filter === 'rdv') return notif.type?.includes('rdv');
  if (filter === 'message') return notif.type?.includes('message') || notif.type?.includes('discussion');
  if (filter === 'action') return notif.actionRequise && !notif.lu && !notif._repondu;
  return true;
}

// Modal réponse RDV
const RdvResponseModal = ({ visible, notif, onClose, onRespond }) => {
  const [responding, setResponding] = useState(null);
  const slideY = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    Animated.spring(slideY, { toValue: visible ? 0 : height, tension: 70, friction: 14, useNativeDriver: true }).start();
  }, [visible]);

  const handleRespond = async (statut) => {
    setResponding(statut);
    await onRespond(notif, statut);
    setResponding(null);
  };

  if (!notif) return null;
  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' }}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={{ flex: 1 }} />
        </TouchableWithoutFeedback>
        <Animated.View style={{
          transform: [{ translateY: slideY }],
          backgroundColor: '#F8FAFC',
          borderTopLeftRadius: 28, borderTopRightRadius: 28,
          ...sh('#000', 8, 0.15, 20),
        }}>
          <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB' }} />
          </View>
          <View style={{ padding: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <View style={{ width: 50, height: 50, borderRadius: 16, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="calendar" size={22} color="#D97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 17, fontWeight: '900', color: '#111827' }}>Répondre au RDV</Text>
                <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{notif.titre}</Text>
              </View>
              <TouchableOpacity onPress={onClose}
                style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="x" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={{ backgroundColor: '#FEF9C3', borderRadius: 16, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: '#FDE68A' }}>
              <Text style={{ fontSize: 13, color: '#78350F', lineHeight: 20 }}>{notif.message}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity onPress={() => handleRespond('annule')} disabled={!!responding}
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 16, backgroundColor: '#FEE2E2', borderWidth: 1.5, borderColor: '#FECACA', opacity: responding ? 0.6 : 1 }}>
                {responding === 'annule' ? <ActivityIndicator size="small" color="#DC2626" />
                  : <><Feather name="x" size={16} color="#DC2626" /><Text style={{ fontSize: 14, fontWeight: '800', color: '#DC2626' }}>Refuser</Text></>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleRespond('accepte')} disabled={!!responding}
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 16, backgroundColor: '#059669', opacity: responding ? 0.6 : 1, ...sh('#059669', 6, 0.25, 12, 4) }}>
                {responding === 'accepte' ? <ActivityIndicator size="small" color="#fff" />
                  : <><Feather name="check" size={16} color="#fff" /><Text style={{ fontSize: 14, fontWeight: '800', color: '#fff' }}>Accepter</Text></>}
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Modal réponse Discussion
const DiscussionResponseModal = ({ visible, notif, onClose, onRespond }) => {
  const [responding, setResponding] = useState(null);
  const slideY = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    Animated.spring(slideY, { toValue: visible ? 0 : height, tension: 70, friction: 14, useNativeDriver: true }).start();
  }, [visible]);

  const handleRespond = async (statut) => {
    setResponding(statut);
    await onRespond(notif, statut);
    setResponding(null);
  };

  if (!notif) return null;
  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' }}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={{ flex: 1 }} />
        </TouchableWithoutFeedback>
        <Animated.View style={{
          transform: [{ translateY: slideY }],
          backgroundColor: '#F8FAFC',
          borderTopLeftRadius: 28, borderTopRightRadius: 28,
          ...sh('#000', 8, 0.15, 20),
        }}>
          <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB' }} />
          </View>
          <View style={{ padding: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <View style={{ width: 50, height: 50, borderRadius: 16, backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="message-circle" size={22} color="#7C3AED" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 17, fontWeight: '900', color: '#111827' }}>Demande de discussion</Text>
                <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>Un parent souhaite discuter avec vous</Text>
              </View>
              <TouchableOpacity onPress={onClose}
                style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="x" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={{ backgroundColor: '#F5F3FF', borderRadius: 16, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: '#DDD6FE' }}>
              <Text style={{ fontSize: 13, color: '#5B21B6', lineHeight: 20 }}>{notif.message}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity onPress={() => handleRespond('refusee')} disabled={!!responding}
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 16, backgroundColor: '#FEE2E2', borderWidth: 1.5, borderColor: '#FECACA', opacity: responding ? 0.6 : 1 }}>
                {responding === 'refusee' ? <ActivityIndicator size="small" color="#DC2626" />
                  : <><Feather name="x" size={16} color="#DC2626" /><Text style={{ fontSize: 14, fontWeight: '800', color: '#DC2626' }}>Refuser</Text></>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleRespond('acceptee')} disabled={!!responding}
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 16, backgroundColor: '#7C3AED', opacity: responding ? 0.6 : 1, ...sh('#7C3AED', 6, 0.25, 12, 4) }}>
                {responding === 'acceptee' ? <ActivityIndicator size="small" color="#fff" />
                  : <><Feather name="check" size={16} color="#fff" /><Text style={{ fontSize: 14, fontWeight: '800', color: '#fff' }}>Accepter</Text></>}
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Carte notification
const NotifCard = ({ notif, index, onRead, onDelete, onRdvPress, onDiscussionPress, navigation }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const heightAnim = useRef(new Animated.Value(1)).current;
  const cfg = getNotifConfig(notif.type);

  const isRdvAction = notif.type === 'rdv_demande' && notif.actionRequise && !notif._repondu && !notif.lu;
  const isDiscAction = notif.type === 'discussion_demande' && notif.actionRequise && !notif._repondu && !notif.lu;

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
    if (!notif.lu) onRead(notif._id);
    if (isRdvAction) { onRdvPress(notif); return; }
    if (isDiscAction) { onDiscussionPress(notif); return; }
  };

  return (
    <Animated.View style={{
      opacity: anim,
      transform: [{ scale }, { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
      maxHeight: heightAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 400] }),
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
                  {notif.actionRequise && !notif._repondu && !notif.lu && (
                    <View style={{ backgroundColor: '#FEF3C7', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: '#D97706' }}>Action requise</Text>
                    </View>
                  )}
                </View>
                <Text style={{ fontSize: 10.5, color: C.textMuted, fontWeight: '500' }}>
                  {formatTime(notif.dateCreation)}
                </Text>
              </View>

              {isRdvAction && !notif._repondu && !notif.lu && (
                <TouchableOpacity onPress={() => { if (!notif.lu) onRead(notif._id); onRdvPress(notif); }}
                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12, backgroundColor: '#059669', marginTop: 12, ...sh('#059669', 4, 0.2, 10, 3) }}>
                  <Feather name="check" size={14} color="#fff" />
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#fff' }}>Répondre au RDV</Text>
                </TouchableOpacity>
              )}

              {isDiscAction && !notif._repondu && !notif.lu && (
                <TouchableOpacity onPress={() => { if (!notif.lu) onRead(notif._id); onDiscussionPress(notif); }}
                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12, backgroundColor: '#7C3AED', marginTop: 12, ...sh('#7C3AED', 4, 0.2, 10, 3) }}>
                  <Feather name="message-circle" size={14} color="#fff" />
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#fff' }}>Voir la demande</Text>
                </TouchableOpacity>
              )}

              {notif._repondu && (
                <View style={{ 
                  flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, 
                  padding: 10, borderRadius: 12, 
                  backgroundColor: notif._repondu === 'accepte' ? '#D1FAE5' : '#FEE2E2' 
                }}>
                  <Feather 
                    name={notif._repondu === 'accepte' ? 'check-circle' : 'x-circle'} 
                    size={14} color={notif._repondu === 'accepte' ? '#059669' : '#DC2626'} 
                  />
                  <Text style={{ 
                    fontSize: 12, fontWeight: '700', 
                    color: notif._repondu === 'accepte' ? '#059669' : '#DC2626' 
                  }}>
                    {notif._repondu === 'accepte' ? 'Rendez-vous accepté ✓' : 'Rendez-vous refusé'}
                  </Text>
                  {notif._repondu === 'accepte' && notif.idRdv && (
                    <TouchableOpacity 
                      onPress={() => navigation?.navigate('MesRendezVous')}
                      style={{ marginLeft: 'auto' }}>
                      <Text style={{ fontSize: 11, fontWeight: '600', color: '#059669' }}>Voir détails →</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ÉCRAN PRINCIPAL MÉDECIN NOTIFICATIONS
export default function MedecinNotificationsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [rdvModal, setRdvModal] = useState(false);
  const [discModal, setDiscModal] = useState(false);
  const [activeNotif, setActiveNotif] = useState(null);
  const [myId, setMyId] = useState(null);
  const headerAnim = useRef(new Animated.Value(0)).current;
  const pollRef = useRef(null);

  useEffect(() => {
    Animated.spring(headerAnim, { toValue: 1, tension: 55, friction: 8, useNativeDriver: true }).start();
    
    (async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          setMyId(user._id || user.userId);
        }
      } catch (error) {
        console.error('Erreur chargement user:', error);
      }
    })();
  }, []);

  const loadNotifs = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await apiFetch('/api/notifications');
      setNotifs(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('loadNotifs error:', e.message);
    } finally {
      if (!silent) setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNotifs();
    pollRef.current = setInterval(() => loadNotifs(true), 15000);
    return () => clearInterval(pollRef.current);
  }, [loadNotifs]);

  const markRead = useCallback(async (id) => {
    try {
      await apiFetch(`/api/notifications/${id}/lire`, { method: 'PATCH' });
      setNotifs(prev => prev.map(n => n._id === id ? { ...n, lu: true } : n));
    } catch (error) {
      console.error('markRead error:', error);
    }
  }, []);

  const markAll = useCallback(async () => {
    try {
      await apiFetch('/api/notifications/tout-lire', { method: 'PATCH' });
      setNotifs(prev => prev.map(n => ({ ...n, lu: true })));
    } catch (error) {
      console.error('markAll error:', error);
    }
  }, []);

  const deleteNotif = useCallback((id) => {
    setNotifs(prev => prev.filter(n => n._id !== id));
  }, []);

  const handleRdvRespond = useCallback(async (notif, statut) => {
    try {
      await apiFetch(`/api/rendezvous/${notif.idRdv}/repondre`, {
        method: 'PATCH', 
        body: JSON.stringify({ statut }),
      });
      
      if (statut === 'accepte') {
        try {
          const token = await AsyncStorage.getItem('userToken');
          await fetch(`${BASE_URL}/profile/increment-rdv`, {
            method: 'POST',
            headers: { 
              'Authorization': `Bearer ${token}`, 
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true'
            },
          });
        } catch (incError) {
          console.error('Erreur incrément RDV:', incError);
        }
      }
      
      setNotifs(prev => prev.map(n =>
        n._id === notif._id ? { 
          ...n, 
          lu: true,
          actionRequise: false,
          _repondu: statut,
          titre: statut === 'accepte' ? 'RDV accepté ✓' : 'RDV refusé',
          message: statut === 'accepte' ? 'Vous avez accepté le rendez-vous' : 'Vous avez refusé ce rendez-vous'
        } : n
      ));
      
      setRdvModal(false);
      setActiveNotif(null);
      
      Alert.alert('Succès', statut === 'accepte' ? 'Rendez-vous accepté ✓' : 'Rendez-vous refusé');
      
      setTimeout(() => loadNotifs(true), 500);
      
    } catch (e) { 
      console.error(e);
      Alert.alert('Erreur', e.message || 'Impossible de répondre au rendez-vous');
    }
  }, [loadNotifs]);

  const handleDiscussionRespond = useCallback(async (notif, statut) => {
    try {
      await apiFetch(`/api/messages/demande/${notif.idConversation}/repondre`, {
        method: 'PATCH', 
        body: JSON.stringify({ statut }),
      });
      
      setNotifs(prev => prev.map(n =>
        n._id === notif._id ? { 
          ...n, 
          lu: true,
          actionRequise: false,
          _repondu: statut,
          titre: statut === 'acceptee' ? 'Discussion acceptée ✓' : 'Discussion refusée',
          message: statut === 'acceptee' ? 'Vous avez accepté la demande de discussion' : 'Vous avez refusé cette demande de discussion'
        } : n
      ));
      
      setDiscModal(false);
      setActiveNotif(null);
      
      Alert.alert('Succès', statut === 'acceptee' ? 'Demande de discussion acceptée ✓' : 'Demande de discussion refusée');
      
      setTimeout(() => loadNotifs(true), 500);
      
    } catch (e) { 
      console.error(e);
      Alert.alert('Erreur', e.message || 'Impossible de répondre à la demande');
    }
  }, [loadNotifs]);

  const filtered = notifs.filter(n => matchFilter(n, filter));
  const unread = notifs.filter(n => !n.lu).length;
  const actions = notifs.filter(n => n.actionRequise && !n.lu && !n._repondu).length;

  const filterCount = (key) => {
    if (key === 'all') return notifs.length;
    if (key === 'unread') return notifs.filter(n => !n.lu).length;
    if (key === 'rdv') return notifs.filter(n => n.type?.includes('rdv')).length;
    if (key === 'message') return notifs.filter(n => n.type?.includes('message') || n.type?.includes('discussion')).length;
    if (key === 'action') return notifs.filter(n => n.actionRequise && !n.lu && !n._repondu).length;
    return 0;
  };

  return (
    <MedecinLayout activeTab="notifications">
      <View style={{ flex: 1, backgroundColor: C.surface }}>
        <StatusBar barStyle="light-content" />

        <RdvResponseModal visible={rdvModal} notif={activeNotif}
          onClose={() => { setRdvModal(false); setActiveNotif(null); }}
          onRespond={handleRdvRespond} />
        <DiscussionResponseModal visible={discModal} notif={activeNotif}
          onClose={() => { setDiscModal(false); setActiveNotif(null); }}
          onRespond={handleDiscussionRespond} />

        <LinearGradient
          colors={['#4C1D95', '#6D28D9', '#7C3AED', '#9D68F5']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ paddingTop: insets.top + 16, paddingBottom: 28, overflow: 'hidden' }}
        >
          <View style={{ position: 'absolute', right: -60, top: -40, width: 220, height: 220, borderRadius: 110, backgroundColor: '#A7F3D0', opacity: 0.18 }} />
          <View style={{ position: 'absolute', left: -40, bottom: -30, width: 180, height: 180, borderRadius: 90, backgroundColor: '#059669', opacity: 0.10 }} />

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
                  <Text style={{ fontSize: 30, fontWeight: '800', color: '#fff', letterSpacing: -0.8 }}>
                    Notifications
                  </Text>
                  {unread > 0 && (
                    <View style={{ backgroundColor: '#F43F5E', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1.5, borderColor: gl(0.30), ...sh('#F43F5E', 4, 0.40, 10, 4) }}>
                      <Text style={{ fontSize: 12, fontWeight: '900', color: '#fff' }}>{unread}</Text>
                    </View>
                  )}
                </View>
                <Text style={{ fontSize: 13, color: gl(0.58), marginTop: 4 }}>
                  {actions > 0
                    ? `${actions} action${actions > 1 ? 's' : ''} requise${actions > 1 ? 's' : ''}`
                    : unread > 0
                      ? `${unread} non lu${unread > 1 ? 'es' : 'e'}`
                      : 'Tout est à jour ✓'}
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

            <View style={{ flexDirection: 'row', gap: 10 }}>
              {[
                { icon: 'bell', label: 'Non lus', value: unread, color: '#FCD34D' },
                { icon: 'inbox', label: 'Total', value: notifs.length, color: '#A7F3D0' },
                { icon: 'alert-circle', label: 'À traiter', value: actions, color: '#FCA5A5' },
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
                    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5,
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

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={C.primary} />
            <Text style={{ fontSize: 13, color: C.textMuted, marginTop: 12 }}>Chargement des notifications...</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
            refreshControl={
              <RefreshControl refreshing={refreshing}
                onRefresh={() => { setRefreshing(true); loadNotifs(); }}
                colors={[C.primary]} tintColor={C.primary} />
            }>
            {filtered.length === 0 ? (
              <View style={{ alignItems: 'center', paddingTop: 64 }}>
                <View style={{ width: 90, height: 90, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.75)', borderWidth: 1.5, borderColor: 'rgba(148,163,184,0.20)', justifyContent: 'center', alignItems: 'center', marginBottom: 20, ...sh('rgba(30,41,59,0.07)', 8, 1, 18, 4) }}>
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
                {filtered.some(n => n.actionRequise && !n.lu && !n._repondu) && (
                  <>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.orange }} />
                      <Text style={{ fontSize: 11, fontWeight: '700', color: C.orange, letterSpacing: 1.1 }}>
                        À TRAITER · {filtered.filter(n => n.actionRequise && !n.lu && !n._repondu).length}
                      </Text>
                    </View>
                    {filtered.filter(n => n.actionRequise && !n.lu && !n._repondu).map((n, i) => (
                      <NotifCard key={n._id} notif={n} index={i} onRead={markRead} onDelete={deleteNotif} navigation={navigation}
                        onRdvPress={(notif) => { setActiveNotif(notif); setRdvModal(true); }}
                        onDiscussionPress={(notif) => { setActiveNotif(notif); setDiscModal(true); }} />
                    ))}
                    <View style={{ height: 1, backgroundColor: 'rgba(148,163,184,0.15)', marginBottom: 16, marginTop: 4 }} />
                  </>
                )}

                {filtered.some(n => !n.lu && !(n.actionRequise && !n._repondu)) && (
                  <>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.primary }} />
                      <Text style={{ fontSize: 11, fontWeight: '700', color: C.primary, letterSpacing: 1.1 }}>
                        NON LUS · {filtered.filter(n => !n.lu && !(n.actionRequise && !n._repondu)).length}
                      </Text>
                    </View>
                    {filtered.filter(n => !n.lu && !(n.actionRequise && !n._repondu)).map((n, i) => (
                      <NotifCard key={n._id} notif={n} index={i} onRead={markRead} onDelete={deleteNotif} navigation={navigation}
                        onRdvPress={(notif) => { setActiveNotif(notif); setRdvModal(true); }}
                        onDiscussionPress={(notif) => { setActiveNotif(notif); setDiscModal(true); }} />
                    ))}
                  </>
                )}

                {filtered.some(n => n.lu || n._repondu) && (
                  <>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, marginBottom: 12 }}>
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.textMuted }} />
                      <Text style={{ fontSize: 11, fontWeight: '700', color: C.textMuted, letterSpacing: 1.1 }}>
                        DÉJÀ LUES · {filtered.filter(n => n.lu || n._repondu).length}
                      </Text>
                    </View>
                    {filtered.filter(n => n.lu || n._repondu).map((n, i) => (
                      <NotifCard key={n._id} notif={n} index={i + 10} onRead={markRead} onDelete={deleteNotif} navigation={navigation}
                        onRdvPress={(notif) => { setActiveNotif(notif); setRdvModal(true); }}
                        onDiscussionPress={(notif) => { setActiveNotif(notif); setDiscModal(true); }} />
                    ))}
                  </>
                )}
              </>
            )}
          </ScrollView>
        )}
      </View>
    </MedecinLayout>
  );
}