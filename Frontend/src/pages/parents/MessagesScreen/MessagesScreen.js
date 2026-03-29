// src/pages/parents/Messages/MessagesScreen.js
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Animated,
  StatusBar, Platform, Dimensions, TextInput, KeyboardAvoidingView,
  PanResponder, Modal, TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import ParentLayout from '../../../components/Navigation/ParentNavigation';

const { width, height } = Dimensions.get('window');

const C = {
  primary: '#6C3AED', primaryV: '#8B5CF6',
  green: '#10B981', rose: '#F43F5E',
  surface: '#F5F3FF', white: '#FFFFFF',
  text: '#1E1B4B', textSub: '#6B7280', textMuted: '#9CA3AF',
};
const gl = (a = 0.15) => `rgba(255,255,255,${a})`;
const sh = (color, y = 6, op = 0.14, r = 16, el = 4) =>
  Platform.select({
    ios: { shadowColor: color, shadowOffset: { width: 0, height: y }, shadowOpacity: op, shadowRadius: r },
    android: { elevation: el },
  });

// ─── DONNÉES (remplacer par appels API MongoDB) ────────────────────────────────
const INITIAL_CONVS = [
  {
    id: '1', name: 'Dr. Karim Meziane', role: 'Coach pédagogique · TSA',
    avatar: '👨‍⚕️', color: '#6C3AED', colorBg: '#EDE9FE',
    lastMsg: 'Belles améliorations chez Amine cette semaine !', lastTime: '1h', unread: 2, online: true,
    messages: [
      { id: 'm1', from: 'other', text: "Bonjour Mme Bensalem, j'espère que vous allez bien !", time: '09:00', date: "Aujourd'hui" },
      { id: 'm2', from: 'me',    text: "Bonjour Docteur ! Très bien. Des nouvelles d'Amine ?",   time: '09:05', date: "Aujourd'hui" },
      { id: 'm3', from: 'other', text: 'Son score en maths est passé de 70% à 85% cette semaine 📈 Progression remarquable !', time: '09:12', date: "Aujourd'hui" },
      { id: 'm4', from: 'other', text: 'Je recommande de maintenir 3 séances/jour. Continuez ainsi !', time: '09:13', date: "Aujourd'hui" },
    ],
  },
  {
    id: '2', name: 'Dr. Yasmine Hamdi', role: 'Orthophoniste · Dysphasie',
    avatar: '👩‍⚕️', color: '#0EA5E9', colorBg: '#E0F2FE',
    lastMsg: "Sara a fait d'excellents progrès en lecture !", lastTime: 'Lundi', unread: 1, online: false,
    messages: [
      { id: 'm1', from: 'other', text: "Bonjour, Sara a fait d'excellents progrès en lecture ce mois-ci !", time: '14:20', date: 'Lundi' },
      { id: 'm2', from: 'other', text: 'Elle termine maintenant ses exercices bien plus rapidement 🌟', time: '14:21', date: 'Lundi' },
      { id: 'm3', from: 'me',    text: 'Merci beaucoup ! Elle travaille fort à la maison aussi.', time: '15:00', date: 'Lundi' },
    ],
  },
  {
    id: '3', name: 'Équipe SafeKids', role: 'Support & assistance',
    avatar: '🛡️', color: '#10B981', colorBg: '#D1FAE5',
    lastMsg: 'Votre rapport hebdomadaire est disponible.', lastTime: 'Hier', unread: 0, online: true,
    messages: [
      { id: 'm1', from: 'other', text: 'Bonjour ! Votre rapport hebdomadaire du 17-23 mars est disponible.', time: '18:00', date: 'Hier' },
      { id: 'm2', from: 'other', text: "N'hésitez pas si vous avez des questions 😊", time: '18:01', date: 'Hier' },
      { id: 'm3', from: 'me',    text: 'Je vais le consulter maintenant.', time: '18:30', date: 'Hier' },
    ],
  },
  {
    id: '4', name: 'Notifications auto', role: 'Système SafeKids',
    avatar: '🔔', color: '#F59E0B', colorBg: '#FEF3C7',
    lastMsg: 'Amine a complété son objectif hebdomadaire !', lastTime: 'Dim.', unread: 0, online: false,
    messages: [
      { id: 'm1', from: 'other', text: '🏆 Amine a complété son objectif de la semaine avec 10 activités !', time: '20:00', date: 'Dim.' },
    ],
  },
];

// ─── MENU CONTEXTUEL FLOTTANT (style Messenger / iMessage) ────────────────────
const MessageContextMenu = ({ visible, msg, position, onClose, onDelete }) => {
  const scaleAnim   = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim,   { toValue: 1, tension: 220, friction: 14, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 140, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim,   { toValue: 0, duration: 110, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 90,  useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!visible || !msg) return null;

  const isMe   = msg.from === 'me';
  const menuW  = 196;
  // Placement horizontal : aligner avec la bulle
  const menuX  = isMe ? width - menuW - 12 : 12;
  // Placement vertical : sous la position du press, décalé
  const rawY   = position.y + 20;
  const menuY  = Math.min(rawY, height - 260);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{ flex: 1, backgroundColor: 'rgba(8,4,24,0.52)' }}>

          {/* Aperçu bulle du message */}
          <View style={{
            position: 'absolute',
            top: Math.max(menuY - 68, 60),
            left:  isMe ? undefined : 16,
            right: isMe ? 16 : undefined,
            maxWidth: width * 0.72,
            backgroundColor: isMe ? C.primary : 'rgba(255,255,255,0.97)',
            borderRadius: 20,
            borderTopRightRadius: isMe ? 6 : 20,
            borderTopLeftRadius:  isMe ? 20 : 6,
            paddingHorizontal: 14, paddingVertical: 11,
            ...sh(isMe ? C.primary : 'rgba(0,0,0,0.2)', 10, 0.4, 22, 8),
          }}>
            <Text style={{ fontSize: 13.5, color: isMe ? '#fff' : C.text, lineHeight: 20 }}>
              {msg.text}
            </Text>
            <Text style={{ fontSize: 10, color: isMe ? gl(0.55) : C.textMuted, marginTop: 5, textAlign: isMe ? 'right' : 'left' }}>
              {msg.time}{isMe ? ' ✓✓' : ''}
            </Text>
          </View>

          {/* Réactions rapides */}
          <Animated.View style={{
            position: 'absolute',
            top: menuY - 2,
            left: isMe ? undefined : 12,
            right: isMe ? 12 : undefined,
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          }}>
            <TouchableWithoutFeedback>
              <View style={{
                backgroundColor: '#fff', borderRadius: 40,
                flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 8, gap: 2,
                ...sh('rgba(0,0,0,0.18)', 10, 1, 24, 10),
              }}>
                {['❤️','😂','😮','😢','👍','🙏'].map((emoji, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={onClose}
                    style={{
                      width: 40, height: 40, borderRadius: 20,
                      justifyContent: 'center', alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 24 }}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </Animated.View>

          {/* Actions */}
          <Animated.View style={{
            position: 'absolute',
            top: menuY + 66,
            left:  menuX,
            width: menuW,
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          }}>
            <TouchableWithoutFeedback>
              <View style={{
                backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden',
                ...sh('rgba(0,0,0,0.18)', 10, 1, 24, 10),
              }}>
                {[
                  { icon: 'corner-up-left', label: 'Répondre',   color: C.text,  action: onClose },
                  { icon: 'copy',           label: 'Copier',      color: C.text,  action: onClose },
                  { icon: 'forward',        label: 'Transférer',  color: C.text,  action: onClose },
                  ...(isMe ? [{ icon: 'trash-2', label: 'Supprimer', color: C.rose, action: () => { onDelete(msg.id); onClose(); } }] : []),
                ].map((item, i, arr) => (
                  <TouchableOpacity
                    key={item.label}
                    onPress={item.action}
                    style={{
                      flexDirection: 'row', alignItems: 'center', gap: 13,
                      paddingHorizontal: 16, paddingVertical: 14,
                      borderBottomWidth: i < arr.length - 1 ? 1 : 0,
                      borderBottomColor: 'rgba(148,163,184,0.12)',
                      backgroundColor: item.color === C.rose ? 'rgba(244,63,94,0.03)' : '#fff',
                    }}
                  >
                    <View style={{
                      width: 32, height: 32, borderRadius: 11,
                      backgroundColor: item.color === C.rose ? 'rgba(244,63,94,0.10)' : 'rgba(108,58,237,0.08)',
                      justifyContent: 'center', alignItems: 'center',
                    }}>
                      <Feather name={item.icon} size={15} color={item.color} />
                    </View>
                    <Text style={{ fontSize: 14.5, fontWeight: '600', color: item.color }}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </Animated.View>

        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// ─── ITEM MESSAGE ──────────────────────────────────────────────────────────────
const MessageItem = ({ msg, prevDate, onLongPress }) => {
  const isMe     = msg.from === 'me';
  const showDate = !prevDate || prevDate !== msg.date;
  const pressAnim = useRef(new Animated.Value(1)).current;

  const handleLongPress = (e) => {
    Animated.sequence([
      Animated.timing(pressAnim, { toValue: 0.92, duration: 70, useNativeDriver: true }),
      Animated.timing(pressAnim, { toValue: 1,    duration: 70, useNativeDriver: true }),
    ]).start();
    onLongPress(msg, { y: e.nativeEvent.pageY, x: e.nativeEvent.pageX });
  };

  return (
    <View>
      {showDate && (
        <View style={{ alignItems: 'center', marginVertical: 14 }}>
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 20,
            paddingHorizontal: 14, paddingVertical: 5,
            borderWidth: 1, borderColor: 'rgba(148,163,184,0.20)',
          }}>
            <Text style={{ fontSize: 11, color: C.textMuted, fontWeight: '600' }}>{msg.date}</Text>
          </View>
        </View>
      )}
      <View style={{ flexDirection: isMe ? 'row-reverse' : 'row', marginBottom: 6, paddingHorizontal: 2 }}>
        <Animated.View style={{ transform: [{ scale: pressAnim }] }}>
          <TouchableOpacity
            activeOpacity={0.82}
            onLongPress={handleLongPress}
            delayLongPress={280}
            style={{
              maxWidth: width * 0.73,
              backgroundColor: isMe ? C.primary : 'rgba(255,255,255,0.88)',
              borderRadius: 20,
              borderTopRightRadius: isMe ? 6 : 20,
              borderTopLeftRadius:  isMe ? 20 : 6,
              paddingHorizontal: 14, paddingVertical: 11,
              borderWidth: 1,
              borderColor: isMe ? gl(0.20) : 'rgba(148,163,184,0.20)',
              overflow: 'hidden',
              ...sh(isMe ? C.primary : 'rgba(30,41,59,0.07)', isMe ? 6 : 3, isMe ? 0.22 : 0.07, isMe ? 14 : 10, isMe ? 4 : 2),
            }}
          >
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: isMe ? gl(0.28) : 'rgba(255,255,255,0.95)' }} />
            <Text style={{ fontSize: 13.5, color: isMe ? '#fff' : C.text, lineHeight: 20 }}>{msg.text}</Text>
            <Text style={{ fontSize: 10, color: isMe ? gl(0.55) : C.textMuted, marginTop: 5, textAlign: isMe ? 'right' : 'left' }}>
              {msg.time}{isMe ? ' ✓✓' : ''}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

// ─── VUE CONVERSATION ─────────────────────────────────────────────────────────
const ConvView = ({ conv, onBack, onUpdateConv, onDeleteConv }) => {
  const [text, setText]       = useState('');
  const [msgs, setMsgs]       = useState(conv.messages || []);
  const [ctxMenu, setCtxMenu] = useState({ visible: false, msg: null, position: { x: 0, y: 0 } });
  const scrollRef             = useRef(null);

  useEffect(() => { setMsgs(conv.messages || []); }, [conv.id]);
  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 60);
  }, [msgs.length]);

  // TODO MongoDB: POST /api/messages
  const sendMsg = () => {
    if (!text.trim()) return;
    const now    = new Date();
    const time   = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newMsg = { id: Date.now().toString(), from: 'me', text: text.trim(), time, date: "Aujourd'hui" };
    const updated = [...msgs, newMsg];
    setMsgs(updated);
    onUpdateConv(conv.id, text.trim(), updated);
    setText('');
  };

  // TODO MongoDB: DELETE /api/messages/:id
  const deleteMsg = (msgId) => {
    const updated = msgs.filter(m => m.id !== msgId);
    setMsgs(updated);
    const last = updated.length > 0 ? updated[updated.length - 1].text : '';
    onUpdateConv(conv.id, last, updated);
  };

  // TODO MongoDB: DELETE /api/conversations/:id
  const handleDeleteConv = () => {
    const { Alert } = require('react-native');
    Alert.alert(
      'Supprimer la conversation',
      `Supprimer la conversation avec ${conv.name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => { onDeleteConv(conv.id); onBack(); } },
      ]
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Menu contextuel Messenger */}
      <MessageContextMenu
        visible={ctxMenu.visible}
        msg={ctxMenu.msg}
        position={ctxMenu.position}
        onClose={() => setCtxMenu(s => ({ ...s, visible: false }))}
        onDelete={deleteMsg}
      />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Header */}
        <LinearGradient
          colors={[conv.color, conv.color + 'CC']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ paddingTop: Platform.OS === 'ios' ? 58 : 34, paddingBottom: 16, paddingHorizontal: 16 }}
        >
          <View style={{ position: 'absolute', right: -50, top: -50, width: 180, height: 180, borderRadius: 90, backgroundColor: gl(0.10) }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity
              onPress={onBack}
              style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: gl(0.18), borderWidth: 1, borderColor: gl(0.28), justifyContent: 'center', alignItems: 'center' }}
            >
              <Feather name="arrow-left" size={18} color="#fff" />
            </TouchableOpacity>

            <View style={{ width: 46, height: 46, borderRadius: 16, backgroundColor: gl(0.22), borderWidth: 1.5, borderColor: gl(0.35), justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 22 }}>{conv.avatar}</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: -0.3 }}>{conv.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 }}>
                {conv.online && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#34D399' }} />}
                <Text style={{ fontSize: 11, color: gl(0.70) }}>{conv.online ? 'En ligne' : 'Hors ligne'} · {conv.role}</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleDeleteConv}
              style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: 'rgba(244,63,94,0.22)', borderWidth: 1, borderColor: 'rgba(244,63,94,0.38)', justifyContent: 'center', alignItems: 'center' }}
            >
              <Feather name="trash-2" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1, backgroundColor: C.surface }}
          contentContainerStyle={{ padding: 16, paddingBottom: 12 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {msgs.length === 0 ? (
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>{conv.avatar}</Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.text }}>Commencez la conversation</Text>
              <Text style={{ fontSize: 13, color: C.textMuted, marginTop: 6, textAlign: 'center' }}>
                Envoyez votre premier message à {conv.name}
              </Text>
            </View>
          ) : (
            msgs.map((msg, i) => (
              <MessageItem
                key={msg.id}
                msg={msg}
                prevDate={i > 0 ? msgs[i - 1].date : null}
                onLongPress={(m, pos) => setCtxMenu({ visible: true, msg: m, position: pos })}
              />
            ))
          )}
        </ScrollView>

        {/* Saisie */}
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.97)',
          borderTopWidth: 1, borderTopColor: 'rgba(148,163,184,0.15)',
          padding: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 14,
          ...sh('rgba(30,41,59,0.08)', -4, 1, 16, 6),
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10 }}>
            <TouchableOpacity style={{
              width: 44, height: 44, borderRadius: 15,
              backgroundColor: 'rgba(255,255,255,0.75)', borderWidth: 1.5, borderColor: 'rgba(148,163,184,0.22)',
              justifyContent: 'center', alignItems: 'center',
            }}>
              <Feather name="paperclip" size={17} color={C.textMuted} />
            </TouchableOpacity>

            <View style={{
              flex: 1, backgroundColor: '#fff', borderRadius: 22,
              borderWidth: 1.5, borderColor: 'rgba(148,163,184,0.22)',
              paddingHorizontal: 16, paddingVertical: 10, minHeight: 44,
            }}>
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder="Aa"
                placeholderTextColor={C.textMuted}
                multiline
                style={{ fontSize: 14, color: C.text, maxHeight: 100, padding: 0 }}
              />
            </View>

            <TouchableOpacity
              onPress={sendMsg}
              style={{
                width: 44, height: 44, borderRadius: 22,
                backgroundColor: text.trim() ? C.primary : 'rgba(255,255,255,0.75)',
                borderWidth: 1.5, borderColor: text.trim() ? 'transparent' : 'rgba(148,163,184,0.22)',
                justifyContent: 'center', alignItems: 'center',
                ...sh(text.trim() ? C.primary : 'transparent', 6, text.trim() ? 0.28 : 0, 12, text.trim() ? 4 : 0),
              }}
            >
              <Feather name="send" size={17} color={text.trim() ? '#fff' : C.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

// ─── CONV ITEM AVEC SWIPE-TO-DELETE ───────────────────────────────────────────
const SWIPE_THRESHOLD  = 72;
const DELETE_BTN_WIDTH = 82;

const ConvItem = ({ conv, onPress, onDelete, index }) => {
  const translateX  = useRef(new Animated.Value(0)).current;
  const deleteScale = useRef(new Animated.Value(0)).current;
  const entryAnim   = useRef(new Animated.Value(0)).current;
  const isOpen      = useRef(false);

  useEffect(() => {
    Animated.timing(entryAnim, {
      toValue: 1, duration: 340, delay: 40 + index * 60, useNativeDriver: true,
    }).start();
  }, []);

  const springClose = () => {
    Animated.spring(translateX, { toValue: 0, tension: 150, friction: 14, useNativeDriver: true }).start();
    Animated.timing(deleteScale, { toValue: 0, duration: 160, useNativeDriver: true }).start();
    isOpen.current = false;
  };

  const springOpen = () => {
    Animated.spring(translateX, { toValue: -DELETE_BTN_WIDTH, tension: 150, friction: 14, useNativeDriver: true }).start();
    Animated.spring(deleteScale, { toValue: 1, tension: 180, friction: 12, useNativeDriver: true }).start();
    isOpen.current = true;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder:  (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dy) < Math.abs(g.dx),
      onPanResponderMove: (_, g) => {
        const base = isOpen.current ? -DELETE_BTN_WIDTH : 0;
        const next = Math.max(-DELETE_BTN_WIDTH - 10, Math.min(0, base + g.dx));
        translateX.setValue(next);
        deleteScale.setValue(Math.min(1, Math.abs(next) / DELETE_BTN_WIDTH));
      },
      onPanResponderRelease: (_, g) => {
        if (isOpen.current) {
          g.dx > 20 ? springClose() : springOpen();
        } else {
          g.dx < -SWIPE_THRESHOLD ? springOpen() : springClose();
        }
      },
    })
  ).current;

  const handlePress = () => {
    if (isOpen.current) { springClose(); return; }
    onPress();
  };

  // Animation de sortie (slide complet) avant suppression
  const handleDelete = () => {
    Animated.timing(translateX, { toValue: -width, duration: 240, useNativeDriver: true }).start(() => {
      onDelete(conv.id);
    });
  };

  return (
    <Animated.View style={{
      opacity: entryAnim,
      transform: [{ translateX: entryAnim.interpolate({ inputRange: [0, 1], outputRange: [-24, 0] }) }],
      marginBottom: 10,
    }}>
      <View style={{ position: 'relative' }}>

        {/* ── Bouton Supprimer (derrière) ── */}
        <Animated.View style={{
          position: 'absolute', right: 0, top: 0, bottom: 0,
          width: DELETE_BTN_WIDTH,
          transform: [{ scale: deleteScale }],
          justifyContent: 'center', alignItems: 'center',
        }}>
          <TouchableOpacity
            onPress={handleDelete}
            style={{
              flex: 1, width: '100%',
              backgroundColor: C.rose,
              borderRadius: 22,
              justifyContent: 'center', alignItems: 'center',
              gap: 4,
              ...sh(C.rose, 5, 0.35, 14, 6),
            }}
          >
            <Feather name="trash-2" size={21} color="#fff" />
            <Text style={{ fontSize: 11, color: '#fff', fontWeight: '700' }}>Supprimer</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Carte conversation (glissable) ── */}
        <Animated.View
          style={{ transform: [{ translateX }] }}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity onPress={handlePress} activeOpacity={0.88}>
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 13,
              padding: 14,
              backgroundColor: conv.unread > 0 ? C.white : 'rgba(255,255,255,0.72)',
              borderRadius: 22,
              borderWidth: conv.unread > 0 ? 1.5 : 1,
              borderColor: conv.unread > 0 ? conv.color + '35' : 'rgba(148,163,184,0.18)',
              overflow: 'hidden',
              ...sh(conv.unread > 0 ? conv.color : 'rgba(30,41,59,0.06)', conv.unread > 0 ? 8 : 3, conv.unread > 0 ? 0.14 : 0.06, conv.unread > 0 ? 20 : 10, conv.unread > 0 ? 4 : 2),
            }}>
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.88)' }} />

              {conv.unread > 0 && (
                <LinearGradient
                  colors={[conv.color, conv.color + '88']}
                  style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, borderTopLeftRadius: 22, borderBottomLeftRadius: 22 }}
                />
              )}

              {/* Avatar */}
              <View style={{ position: 'relative' }}>
                <View style={{
                  width: 52, height: 52, borderRadius: 18,
                  backgroundColor: conv.colorBg, borderWidth: 1.5, borderColor: conv.color + '28',
                  justifyContent: 'center', alignItems: 'center',
                  ...sh(conv.color, 4, 0.10, 10, 3),
                }}>
                  <Text style={{ fontSize: 24 }}>{conv.avatar}</Text>
                </View>
                {conv.online && (
                  <View style={{ position: 'absolute', bottom: -1, right: -1, width: 13, height: 13, borderRadius: 7, backgroundColor: C.green, borderWidth: 2, borderColor: C.white }} />
                )}
              </View>

              {/* Texte */}
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                  <Text style={{ fontSize: 14, fontWeight: conv.unread > 0 ? '800' : '600', color: C.text, flex: 1, marginRight: 8 }} numberOfLines={1}>
                    {conv.name}
                  </Text>
                  <Text style={{ fontSize: 10.5, color: C.textMuted, fontWeight: '500' }}>{conv.lastTime}</Text>
                </View>
                <Text style={{ fontSize: 11.5, color: conv.color, fontWeight: '600', marginBottom: 3 }}>{conv.role}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 12.5, color: conv.unread > 0 ? C.text : C.textMuted, fontWeight: conv.unread > 0 ? '500' : '400', flex: 1, marginRight: 8 }} numberOfLines={1}>
                    {conv.lastMsg}
                  </Text>
                  {conv.unread > 0 && (
                    <View style={{
                      backgroundColor: conv.color, borderRadius: 10,
                      minWidth: 22, height: 22, paddingHorizontal: 7,
                      justifyContent: 'center', alignItems: 'center',
                    }}>
                      <Text style={{ fontSize: 10, fontWeight: '900', color: '#fff' }}>{conv.unread}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

// ─── ÉCRAN PRINCIPAL ──────────────────────────────────────────────────────────
export default function MessagesScreen({ navigation }) {
  const [convs,      setConvs]      = useState(INITIAL_CONVS);
  const [activeConv, setActiveConv] = useState(null);
  const [search,     setSearch]     = useState('');
  const headerAnim = useRef(new Animated.Value(0)).current;

  const totalUnread = convs.reduce((a, c) => a + c.unread, 0);

  useEffect(() => {
    Animated.spring(headerAnim, { toValue: 1, tension: 55, friction: 8, useNativeDriver: true }).start();
  }, []);

  // TODO MongoDB: PATCH /api/conversations/:id
  const updateConv = useCallback((id, lastMsg, updatedMessages) => {
    setConvs(prev => prev.map(c =>
      c.id === id ? { ...c, lastMsg, unread: 0, lastTime: 'Maintenant', messages: updatedMessages } : c
    ));
  }, []);

  // TODO MongoDB: DELETE /api/conversations/:id
  const deleteConv = useCallback((id) => {
    setConvs(prev => prev.filter(c => c.id !== id));
    setActiveConv(null);
  }, []);

  const markAllRead = () => setConvs(prev => prev.map(c => ({ ...c, unread: 0 })));

  const normalize = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const filtered  = convs.filter(c =>
    normalize(c.name).includes(normalize(search)) ||
    normalize(c.role).includes(normalize(search)) ||
    normalize(c.lastMsg).includes(normalize(search))
  );

  // ── Vue conversation ──
  if (activeConv) {
    const currentConv = convs.find(c => c.id === activeConv.id) || activeConv;
    return (
      <View style={{ flex: 1, backgroundColor: C.surface }}>
        <StatusBar barStyle="light-content" />
        <ConvView
          conv={currentConv}
          onBack={() => setActiveConv(null)}
          onUpdateConv={updateConv}
          onDeleteConv={deleteConv}
        />
      </View>
    );
  }

  // ── Liste principale ──
  return (
    <ParentLayout activeTab="messages">
      <View style={{ flex: 1, backgroundColor: C.surface }}>
        <StatusBar barStyle="light-content" />

        {/* HEADER */}
        <LinearGradient
          colors={['#1A0A4A', '#3B1FA8', '#6C3AED', '#9D68F5']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ paddingTop: Platform.OS === 'ios' ? 58 : 34, paddingBottom: 26, overflow: 'hidden' }}
        >
          <View style={{ position: 'absolute', right: -60, top: -40, width: 220, height: 220, borderRadius: 110, backgroundColor: '#34D399', opacity: 0.18 }} />
          <View style={{ position: 'absolute', left: -40, bottom: -30, width: 180, height: 180, borderRadius: 90, backgroundColor: '#6C3AED', opacity: 0.10 }} />
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: gl(0.24) }} />

          <Animated.View style={{
            opacity: headerAnim,
            transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }],
            paddingHorizontal: 22,
          }}>
            <Text style={{ fontSize: 11, color: gl(0.52), fontWeight: '600', letterSpacing: 1.5, marginBottom: 6 }}>MESSAGERIE MÉDICALE</Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Text style={{ fontSize: 30, fontWeight: '800', color: '#fff', letterSpacing: -0.8 }}>Messages</Text>
                  {totalUnread > 0 && (
                    <View style={{ backgroundColor: C.rose, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1.5, borderColor: gl(0.30) }}>
                      <Text style={{ fontSize: 12, fontWeight: '900', color: '#fff' }}>{totalUnread}</Text>
                    </View>
                  )}
                </View>
                <Text style={{ fontSize: 13, color: gl(0.58), marginTop: 3 }}>
                  {convs.length} conversations · {convs.filter(c => c.online).length} en ligne
                </Text>
              </View>
              <TouchableOpacity style={{
                backgroundColor: gl(0.14), borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10,
                borderWidth: 1, borderColor: gl(0.22), flexDirection: 'row', alignItems: 'center', gap: 7,
              }}>
                <Feather name="edit-3" size={14} color="#fff" />
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>Nouveau</Text>
              </TouchableOpacity>
            </View>

            {/* Stats */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 18 }}>
              {[
                { icon: 'mail',           label: 'Non lus',       value: totalUnread,                         color: '#FCD34D' },
                { icon: 'message-circle', label: 'Conversations', value: convs.length,                        color: '#A7F3D0' },
                { icon: 'wifi',           label: 'En ligne',       value: convs.filter(c => c.online).length, color: '#6EE7B7' },
              ].map((s, i) => (
                <View key={i} style={{
                  flex: 1, backgroundColor: gl(0.12), borderRadius: 16,
                  paddingVertical: 13, paddingHorizontal: 8, alignItems: 'center',
                  borderWidth: 1, borderColor: gl(0.20),
                }}>
                  <Feather name={s.icon} size={14} color={s.color} style={{ marginBottom: 5 }} />
                  <Text style={{ fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: -0.3 }}>{s.value}</Text>
                  <Text style={{ fontSize: 9, color: gl(0.50), textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 2 }}>{s.label}</Text>
                </View>
              ))}
            </View>

            {/* Recherche */}
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 10,
              backgroundColor: gl(0.12), borderRadius: 18, paddingHorizontal: 14, height: 46,
              borderWidth: 1, borderColor: gl(0.20),
            }}>
              <Feather name="search" size={16} color={gl(0.55)} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Rechercher un médecin, un sujet…"
                placeholderTextColor={gl(0.45)}
                style={{ flex: 1, fontSize: 14, color: '#fff' }}
                returnKeyType="search"
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Feather name="x" size={15} color={gl(0.60)} />
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        </LinearGradient>

        {/* LISTE */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.green }} />
              <Text style={{ fontSize: 11, fontWeight: '700', color: C.green, letterSpacing: 1.1 }}>
                CONVERSATIONS · {filtered.length}
              </Text>
            </View>
            {totalUnread > 0 && (
              <TouchableOpacity onPress={markAllRead}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: C.primary }}>Tout marquer lu</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Hint swipe */}
          {filtered.length > 0 && (
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 6,
              backgroundColor: 'rgba(244,63,94,0.07)', borderRadius: 12,
              paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12,
              borderWidth: 1, borderColor: 'rgba(244,63,94,0.14)',
            }}>
              <Feather name="chevrons-left" size={13} color={C.rose} />
              <Text style={{ fontSize: 11.5, color: C.rose, fontWeight: '600' }}>
                Glissez vers la gauche pour supprimer · Appui long sur un message pour le supprimer
              </Text>
            </View>
          )}

          {filtered.map((conv, i) => (
            <ConvItem
              key={conv.id}
              conv={conv}
              index={i}
              onPress={() => setActiveConv(conv)}
              onDelete={deleteConv}
            />
          ))}

          {filtered.length === 0 && (
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <View style={{
                width: 80, height: 80, borderRadius: 28,
                backgroundColor: 'rgba(255,255,255,0.75)', borderWidth: 1.5, borderColor: 'rgba(148,163,184,0.20)',
                justifyContent: 'center', alignItems: 'center', marginBottom: 18,
              }}>
                <Feather name="message-circle" size={32} color={C.textMuted} />
              </View>
              <Text style={{ fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 8 }}>Aucun résultat</Text>
              <Text style={{ fontSize: 13, color: C.textMuted, textAlign: 'center' }}>
                Aucune conversation ne correspond à "{search}"
              </Text>
              <TouchableOpacity onPress={() => setSearch('')} style={{ marginTop: 14 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: C.primary }}>Effacer la recherche</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Nouvelle conversation */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8, marginBottom: 16 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(148,163,184,0.18)' }} />
            <Text style={{ fontSize: 11, color: C.textMuted, fontWeight: '600' }}>Actions rapides</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(148,163,184,0.18)' }} />
          </View>

          <TouchableOpacity activeOpacity={0.86} style={{
            backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 22, padding: 18,
            borderWidth: 1.5, borderColor: 'rgba(148,163,184,0.20)',
            flexDirection: 'row', alignItems: 'center', gap: 14,
            ...sh('rgba(30,41,59,0.05)', 4, 1, 12, 2),
          }}>
            <LinearGradient
              colors={[C.primary, '#9D68F5']}
              style={{ width: 50, height: 50, borderRadius: 17, justifyContent: 'center', alignItems: 'center', ...sh(C.primary, 5, 0.22, 12, 3) }}
            >
              <Feather name="plus" size={22} color="#fff" />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: C.text }}>Contacter un médecin</Text>
              <Text style={{ fontSize: 12, color: C.textMuted, marginTop: 2, lineHeight: 17 }}>
                Démarrer une nouvelle conversation avec un spécialiste SafeKids.
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={C.textMuted} />
          </TouchableOpacity>
        </ScrollView>
      </View>
    </ParentLayout>
  );
}