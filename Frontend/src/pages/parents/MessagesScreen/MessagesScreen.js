// src/pages/parents/Messages/MessagesScreen.js
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Animated,
  StatusBar, Platform, Dimensions, TextInput,
  PanResponder, Modal, TouchableWithoutFeedback, ActivityIndicator, Alert,
  RefreshControl, Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import io from 'socket.io-client';
import ParentLayout from '../../../components/Navigation/ParentNavigation';

const { width, height } = Dimensions.get('window');

const BASE_URL = 'https://unfailed-branden-healable.ngrok-free.dev';
let socket = null;

const C = {
  primary: '#7C3AED',
  primaryLight: '#EDE9FE',
  primaryDark: '#4C1D95',
  primarySoft: '#F5F3FF',
  gradientStart: '#4C1D95',
  gradientEnd: '#8B5CF6',
  green: '#10B981',
  rose: '#F43F5E',
  surface: '#F5F3FF',
  white: '#FFFFFF',
  text: '#1E1B4B',
  textSub: '#6B7280',
  textMuted: '#9CA3AF',
  orange: '#F59E0B',
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

function xAlert(title, msg) {
  if (Platform.OS === 'web') window.alert(msg ? `${title}\n\n${msg}` : title);
  else Alert.alert(title, msg);
}

function xConfirm(title, msg, onOk) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${msg}`)) onOk();
  } else {
    Alert.alert(title, msg, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Confirmer', style: 'destructive', onPress: onOk },
    ]);
  }
}

function formatMsgDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === now.toDateString()) return "Aujourd'hui";
  if (d.toDateString() === yesterday.toDateString()) return 'Hier';
  return d.toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short' });
}

function formatLastTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return "À l'instant";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}min`;
  if (diff < 86400000) return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  return d.toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short' });
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.replace('Dr. ', '').trim().split(' ');
  return parts.map(p => p[0] || '').join('').toUpperCase().slice(0, 2);
}

function statutConfig(statut) {
  switch (statut) {
    case 'en_attente': return { color: '#F59E0B', bg: '#FEF3C7', label: 'En attente', icon: 'clock' };
    case 'acceptee': return { color: '#7C3AED', bg: '#EDE9FE', label: 'Active', icon: 'check-circle' };
    case 'refusee': return { color: '#F43F5E', bg: '#FEE2E2', label: 'Refusée', icon: 'x-circle' };
    default: return { color: '#9CA3AF', bg: '#F3F4F6', label: '?', icon: 'help-circle' };
  }
}

const MessageContextMenu = ({ visible, msg, position, onClose, onDelete }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, tension: 220, friction: 14, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 140, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, { toValue: 0, duration: 110, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 90, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!visible || !msg) return null;
  const isMe = msg.isMe;
  const menuW = 196;
  const menuX = isMe ? width - menuW - 12 : 12;
  const rawY = (position?.y || 200) + 20;
  const menuY = Math.min(rawY, height - 260);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{ flex: 1, backgroundColor: 'rgba(76,29,149,0.52)' }}>
          <View style={{
            position: 'absolute',
            top: Math.max(menuY - 68, 60),
            left: isMe ? undefined : 16, right: isMe ? 16 : undefined,
            maxWidth: width * 0.72,
            backgroundColor: isMe ? C.primary : 'rgba(255,255,255,0.97)',
            borderRadius: 20,
            borderTopRightRadius: isMe ? 6 : 20, borderTopLeftRadius: isMe ? 20 : 6,
            paddingHorizontal: 14, paddingVertical: 11,
            ...sh(isMe ? C.primary : 'rgba(0,0,0,0.2)', 10, 0.4, 22, 8),
          }}>
            <Text style={{ fontSize: 13.5, color: isMe ? '#fff' : C.text, lineHeight: 20 }} numberOfLines={3}>
              {msg.texte}
            </Text>
          </View>

          <Animated.View style={{
            position: 'absolute', top: menuY - 2,
            left: isMe ? undefined : 12, right: isMe ? 12 : undefined,
            opacity: opacityAnim, transform: [{ scale: scaleAnim }],
          }}>
            <TouchableWithoutFeedback>
              <View style={{ backgroundColor: '#fff', borderRadius: 40, flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 8, gap: 2, ...sh('rgba(0,0,0,0.18)', 10, 1, 24, 10) }}>
                {['❤️', '😂', '😮', '😢', '👍', '🙏'].map((emoji, i) => (
                  <TouchableOpacity key={i} onPress={onClose} style={{ width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 24 }}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </Animated.View>

          <Animated.View style={{
            position: 'absolute', top: menuY + 66, left: menuX, width: menuW,
            opacity: opacityAnim, transform: [{ scale: scaleAnim }],
          }}>
            <TouchableWithoutFeedback>
              <View style={{ backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', ...sh('rgba(0,0,0,0.18)', 10, 1, 24, 10) }}>
                {[
                  { icon: 'copy', label: 'Copier', color: C.text, action: onClose },
                  ...(isMe ? [{ icon: 'trash-2', label: 'Supprimer', color: C.rose, action: () => { onDelete(msg._id); onClose(); } }] : []),
                ].map((item, i, arr) => (
                  <TouchableOpacity key={item.label} onPress={item.action}
                    style={{
                      flexDirection: 'row', alignItems: 'center', gap: 13,
                      paddingHorizontal: 16, paddingVertical: 14,
                      borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: 'rgba(148,163,184,0.12)',
                      backgroundColor: item.color === C.rose ? 'rgba(244,63,94,0.03)' : '#fff',
                    }}>
                    <View style={{ width: 32, height: 32, borderRadius: 11, backgroundColor: item.color === C.rose ? 'rgba(244,63,94,0.10)' : 'rgba(124,58,237,0.08)', justifyContent: 'center', alignItems: 'center' }}>
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

const TypingIndicator = ({ isTyping, name }) => {
  const [dots, setDots] = useState('');
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ])
      ).start();
      const interval = setInterval(() => {
        setDots(prev => prev.length >= 3 ? '' : prev + '.');
      }, 500);
      return () => clearInterval(interval);
    } else {
      anim.stopAnimation();
    }
  }, [isTyping]);

  if (!isTyping) return null;

  return (
    <Animated.View style={{
      opacity: anim,
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 16,
      marginBottom: 8,
    }}>
      <View style={{ backgroundColor: C.primaryLight, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 }}>
        <Text style={{ fontSize: 12, color: C.primary }}>
          {name} est en train d'écrire{dots}
        </Text>
      </View>
    </Animated.View>
  );
};

const MessageItem = ({ msg, prevMsg, myId, onLongPress }) => {
  const isMe = msg.idAuteur === myId;
  const prevDate = prevMsg ? formatMsgDate(prevMsg.dateCreation) : null;
  const currDate = formatMsgDate(msg.dateCreation);
  const showDate = currDate !== prevDate;
  const pressAnim = useRef(new Animated.Value(1)).current;
  const time = msg.dateCreation
    ? new Date(msg.dateCreation).toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit' })
    : '';

  const handleLongPress = (e) => {
    Animated.sequence([
      Animated.timing(pressAnim, { toValue: 0.92, duration: 70, useNativeDriver: true }),
      Animated.timing(pressAnim, { toValue: 1, duration: 70, useNativeDriver: true }),
    ]).start();
    onLongPress({ ...msg, isMe }, { y: e.nativeEvent.pageY, x: e.nativeEvent.pageX });
  };

  return (
    <View>
      {showDate && (
        <View style={{ alignItems: 'center', marginVertical: 14 }}>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, borderWidth: 1, borderColor: C.primaryLight }}>
            <Text style={{ fontSize: 11, color: C.textMuted, fontWeight: '600' }}>{currDate}</Text>
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
              backgroundColor: isMe ? C.primary : '#fff',
              borderRadius: 20,
              borderTopRightRadius: isMe ? 6 : 20, borderTopLeftRadius: isMe ? 20 : 6,
              paddingHorizontal: 13, paddingVertical: 10,
              borderWidth: 1,
              borderColor: isMe ? gl(0.20) : C.primaryLight,
              ...sh(isMe ? C.primary : 'rgba(0,0,0,0.06)', isMe ? 4 : 2, isMe ? 0.20 : 0.04, isMe ? 12 : 8, isMe ? 3 : 1),
            }}>
            <Text style={{ fontSize: 13.5, color: isMe ? '#fff' : C.text, lineHeight: 19 }}>{msg.texte}</Text>
            <View style={{ flexDirection: 'row', justifyContent: isMe ? 'flex-end' : 'flex-start', alignItems: 'center', marginTop: 4, gap: 4 }}>
              <Text style={{ fontSize: 10, color: isMe ? gl(0.55) : C.textMuted }}>
                {time}
              </Text>
              {isMe && (
                <Feather
                  name={msg.lu ? 'check-circle' : 'check'}
                  size={11}
                  color={msg.lu ? '#10B981' : gl(0.55)}
                />
              )}
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const ConvView = ({ conv, myId, myRole, onBack, onConvDeleted }) => {
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const [ctxMenu, setCtxMenu] = useState({ visible: false, msg: null, position: { x: 0, y: 0 } });
  const scrollViewRef = useRef(null);
  const inputRef = useRef(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const isParent = myRole === 'Parent';
  const otherName = isParent ? conv.nomMedecin : conv.nomParent;

  // Gestion du clavier pour Android et iOS
  useEffect(() => {
    const keyboardWillShow = (e) => {
      const height = e.endCoordinates?.height || (Platform.OS === 'android' ? 320 : 250);
      setKeyboardHeight(height + 100);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 150);
    };
    
    const keyboardWillHide = () => {
      setKeyboardHeight(0);
    };

    const showListener = Keyboard.addListener('keyboardWillShow', keyboardWillShow);
    const hideListener = Keyboard.addListener('keyboardWillHide', keyboardWillHide);
    const showListenerAndroid = Keyboard.addListener('keyboardDidShow', keyboardWillShow);
    const hideListenerAndroid = Keyboard.addListener('keyboardDidHide', keyboardWillHide);

    return () => {
      showListener.remove();
      hideListener.remove();
      showListenerAndroid?.remove();
      hideListenerAndroid?.remove();
    };
  }, []);

  useEffect(() => {
    const initSocket = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (!socket) {
        socket = io(BASE_URL, {
          auth: { token },
          transports: ['websocket', 'polling'],
        });
      }
      
      socket.emit('join-conversation', conv._id);
      
      socket.on('new-message', (newMsg) => {
        if (newMsg.idConversation === conv._id) {
          setMsgs(prev => [...prev, newMsg]);
          setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
          if (newMsg.idAuteur !== myId) {
            socket.emit('mark-read', { conversationId: conv._id });
          }
        }
      });
      
      socket.on('user-typing', (data) => {
        if (data.userId !== myId) {
          setOtherTyping(data.isTyping);
        }
      });
      
      socket.on('messages-read', (data) => {
        if (data.userId !== myId) {
          setMsgs(prev => prev.map(m => 
            m.idAuteur !== myId ? { ...m, lu: true } : m
          ));
        }
      });
    };
    
    initSocket();
    
    return () => {
      if (socket) {
        socket.emit('leave-conversation', conv._id);
        socket.off('new-message');
        socket.off('user-typing');
        socket.off('messages-read');
      }
    };
  }, [conv._id, myId]);

  const loadMsgs = useCallback(async () => {
    try {
      const data = await apiFetch(`/api/messages/${conv._id}`);
      setMsgs(Array.isArray(data) ? data : []);
      if (socket) {
        socket.emit('mark-read', { conversationId: conv._id });
      }
    } catch (error) {
      console.error('loadMsgs error:', error);
    }
    setLoading(false);
  }, [conv._id]);

  useEffect(() => {
    loadMsgs();
    const interval = setInterval(() => {
      loadMsgs();
    }, 5000);
    return () => clearInterval(interval);
  }, [loadMsgs]);

  useEffect(() => {
    if (msgs.length > 0) {
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: false }), 100);
    }
  }, [msgs.length]);

  const handleTextChange = (newText) => {
    setText(newText);
    if (!typing && newText.length > 0) {
      setTyping(true);
      socket?.emit('typing', { conversationId: conv._id, isTyping: true });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (typing) {
        setTyping(false);
        socket?.emit('typing', { conversationId: conv._id, isTyping: false });
      }
    }, 1000);
  };

  const sendMsg = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    const messageText = text.trim();
    setText('');
    
    if (typing) {
      setTyping(false);
      socket?.emit('typing', { conversationId: conv._id, isTyping: false });
    }
    
    const tempMsg = {
      _id: `temp_${Date.now()}`,
      idConversation: conv._id,
      idAuteur: myId,
      role: myRole,
      texte: messageText,
      lu: false,
      dateCreation: new Date().toISOString(),
      temp: true,
    };
    setMsgs(prev => [...prev, tempMsg]);
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 80);
    
    try {
      socket?.emit('send-message', {
        conversationId: conv._id,
        texte: messageText,
      });
      
      setTimeout(() => {
        setMsgs(prev => prev.filter(m => m._id !== tempMsg._id));
      }, 3000);
      
    } catch (e) {
      setMsgs(prev => prev.map(m => 
        m._id === tempMsg._id ? { ...m, error: true } : m
      ));
      xAlert('Erreur', e.message);
      setText(messageText);
    } finally {
      setSending(false);
    }
  };

  const deleteMsg = async (msgId) => {
    if (msgId.startsWith('temp_')) return;
    try {
      await apiFetch(`/api/messages/msg/${msgId}`, { method: 'DELETE' });
      setMsgs(prev => prev.filter(m => m._id !== msgId));
    } catch (e) {
      xAlert('Erreur', e.message);
    }
  };

  const deleteConv = () => {
    xConfirm('Supprimer', `Supprimer la conversation avec ${otherName} ?`, async () => {
      try {
        await apiFetch(`/api/messages/conv/${conv._id}`, { method: 'DELETE' });
        onConvDeleted(conv._id);
        onBack();
      } catch (e) {
        xAlert('Erreur', e.message);
      }
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.surface }}>
      <MessageContextMenu
        visible={ctxMenu.visible}
        msg={ctxMenu.msg}
        position={ctxMenu.position}
        onClose={() => setCtxMenu(s => ({ ...s, visible: false }))}
        onDelete={deleteMsg}
      />
      
      <LinearGradient
        colors={[C.gradientStart, C.gradientEnd]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ paddingTop: Platform.OS === 'ios' ? 58 : 44, paddingBottom: 16, paddingHorizontal: 16 }}>
        <View style={{ position: 'absolute', right: -50, top: -50, width: 180, height: 180, borderRadius: 90, backgroundColor: gl(0.10) }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={onBack}
            style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: gl(0.18), borderWidth: 1, borderColor: gl(0.28), justifyContent: 'center', alignItems: 'center' }}>
            <Feather name="arrow-left" size={18} color="#fff" />
          </TouchableOpacity>
          <View style={{ width: 46, height: 46, borderRadius: 16, backgroundColor: gl(0.22), borderWidth: 1.5, borderColor: gl(0.35), justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: '900', color: '#fff' }}>{getInitials(otherName)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#fff' }}>{otherName}</Text>
            {isParent && conv.specialiteMedecin && (
              <Text style={{ fontSize: 11, color: gl(0.70), marginTop: 1 }}>{conv.specialiteMedecin}</Text>
            )}
          </View>
          <TouchableOpacity onPress={deleteConv}
            style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: 'rgba(244,63,94,0.22)', borderWidth: 1, borderColor: 'rgba(244,63,94,0.38)', justifyContent: 'center', alignItems: 'center' }}>
            <Feather name="trash-2" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={{ flex: 1 }}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.surface }}>
            <ActivityIndicator size="large" color={C.primary} />
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            style={{ flex: 1, backgroundColor: C.surface }}
            contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {msgs.length === 0 ? (
              <View style={{ alignItems: 'center', paddingTop: 60 }}>
                <View style={{ width: 70, height: 70, borderRadius: 24, backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <Text style={{ fontSize: 28, fontWeight: '900', color: C.primary }}>{getInitials(otherName)}</Text>
                </View>
                <Text style={{ fontSize: 15, fontWeight: '700', color: C.text }}>💬 Commencez la discussion</Text>
                <Text style={{ fontSize: 13, color: C.textMuted, marginTop: 6, textAlign: 'center' }}>
                  Envoyez votre premier message à {otherName}
                </Text>
              </View>
            ) : (
              msgs.map((msg, i) => (
                <MessageItem
                  key={msg._id}
                  msg={msg}
                  prevMsg={i > 0 ? msgs[i - 1] : null}
                  myId={myId}
                  onLongPress={(m, pos) => setCtxMenu({ visible: true, msg: m, position: pos })}
                />
              ))
            )}
            <TypingIndicator isTyping={otherTyping} name={otherName} />
          </ScrollView>
        )}
      </View>

      {/* Zone de saisie remontée par le clavier */}
      <View style={{ 
        backgroundColor: '#fff', 
        borderTopWidth: 1, 
        borderTopColor: C.primaryLight,
        paddingBottom: Platform.OS === 'ios' ? 34 : Math.max(80, keyboardHeight),
      }}>
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'flex-end', 
          gap: 10,
          paddingTop: 12,
          paddingHorizontal: 12,
          paddingBottom: 12,
        }}>
          <View style={{ 
            flex: 1, 
            backgroundColor: '#F8FAFC', 
            borderRadius: 24, 
            borderWidth: 1.5, 
            borderColor: text.trim() ? C.primary : '#E2E8F0',
            paddingHorizontal: 16, 
            paddingVertical: Platform.OS === 'ios' ? 10 : 10,
            minHeight: 48,
          }}>
            <TextInput
              ref={inputRef}
              value={text}
              onChangeText={handleTextChange}
              placeholder="Écrivez votre message..."
              placeholderTextColor="#94A3B8"
              multiline
              style={{ 
                fontSize: 16, 
                color: '#1E293B', 
                maxHeight: 100, 
                padding: 0,
                textAlignVertical: 'center',
                minHeight: 28,
              }}
            />
          </View>
          <TouchableOpacity 
            onPress={sendMsg} 
            disabled={!text.trim() || sending}
            activeOpacity={0.7}
            style={{
              width: 48, 
              height: 48, 
              borderRadius: 24,
              backgroundColor: text.trim() ? C.primary : '#F1F5F9',
              justifyContent: 'center', 
              alignItems: 'center',
            }}>
            {sending ? (
              <ActivityIndicator size="small" color={text.trim() ? '#fff' : '#94A3B8'} />
            ) : (
              <Feather name="send" size={20} color={text.trim() ? '#fff' : '#94A3B8'} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const SWIPE_THRESHOLD = 72;
const DELETE_BTN_WIDTH = 82;

const ConvItem = ({ conv, onPress, onDelete, index, myId, myRole }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const deleteScale = useRef(new Animated.Value(0)).current;
  const entryAnim = useRef(new Animated.Value(0)).current;
  const isOpen = useRef(false);
  const sc = statutConfig(conv.statut);
  const isParent = myRole === 'Parent';
  const otherName = isParent ? conv.nomMedecin : conv.nomParent;
  const convColor = C.primary;
  const nonLus = conv.nonLus || 0;

  useEffect(() => {
    Animated.timing(entryAnim, { toValue: 1, duration: 340, delay: 40 + index * 55, useNativeDriver: true }).start();
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
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dy) < Math.abs(g.dx),
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

  const handleDelete = () => {
    Animated.timing(translateX, { toValue: -width, duration: 240, useNativeDriver: true }).start(() => onDelete(conv._id));
  };

  return (
    <Animated.View style={{
      opacity: entryAnim,
      transform: [{ translateX: entryAnim.interpolate({ inputRange: [0, 1], outputRange: [-24, 0] }) }],
      marginBottom: 10,
    }}>
      <View style={{ position: 'relative' }}>
        <Animated.View style={{
          position: 'absolute', right: 0, top: 0, bottom: 0,
          width: DELETE_BTN_WIDTH,
          transform: [{ scale: deleteScale }],
          justifyContent: 'center', alignItems: 'center',
        }}>
          <TouchableOpacity onPress={handleDelete}
            style={{
              flex: 1, width: '100%', backgroundColor: C.rose, borderRadius: 22,
              justifyContent: 'center', alignItems: 'center', gap: 4,
              ...sh(C.rose, 5, 0.35, 14, 6),
            }}>
            <Feather name="trash-2" size={21} color="#fff" />
            <Text style={{ fontSize: 11, color: '#fff', fontWeight: '700' }}>Supprimer</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={{ transform: [{ translateX }] }} {...panResponder.panHandlers}>
          <TouchableOpacity onPress={handlePress} activeOpacity={0.88}>
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 13, padding: 14,
              backgroundColor: nonLus > 0 ? C.white : 'rgba(255,255,255,0.72)',
              borderRadius: 22,
              borderWidth: nonLus > 0 ? 1.5 : 1,
              borderColor: nonLus > 0 ? C.primary + '35' : C.primaryLight,
              ...sh(nonLus > 0 ? C.primary : 'rgba(30,41,59,0.06)', nonLus > 0 ? 8 : 3, nonLus > 0 ? 0.14 : 0.06, nonLus > 0 ? 20 : 10, nonLus > 0 ? 4 : 2),
            }}>
              {nonLus > 0 && (
                <LinearGradient colors={[convColor, convColor + '88']}
                  style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, borderTopLeftRadius: 22, borderBottomLeftRadius: 22 }} />
              )}

              <View style={{ position: 'relative' }}>
                <View style={{
                  width: 52, height: 52, borderRadius: 18,
                  backgroundColor: C.primaryLight, borderWidth: 1.5, borderColor: C.primary + '40',
                  justifyContent: 'center', alignItems: 'center',
                  ...sh(convColor, 4, 0.10, 10, 3),
                }}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: C.primary }}>{getInitials(otherName)}</Text>
                </View>
                <View style={{
                  position: 'absolute', bottom: -1, right: -1,
                  width: 14, height: 14, borderRadius: 7,
                  backgroundColor: sc.color, borderWidth: 2, borderColor: C.white,
                }} />
              </View>

              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                  <Text style={{ fontSize: 14, fontWeight: nonLus > 0 ? '800' : '600', color: C.text, flex: 1, marginRight: 8 }} numberOfLines={1}>
                    {otherName}
                  </Text>
                  <Text style={{ fontSize: 10.5, color: C.textMuted }}>
                    {formatLastTime(conv.dernierMessageDate || conv.dateCreation)}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <View style={{ backgroundColor: sc.bg, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Feather name={sc.icon} size={10} color={sc.color} />
                    <Text style={{ fontSize: 10, fontWeight: '700', color: sc.color }}>{sc.label}</Text>
                  </View>
                  {isParent && conv.specialiteMedecin && (
                    <Text style={{ fontSize: 11, color: C.primary, fontWeight: '600' }} numberOfLines={1}>{conv.specialiteMedecin}</Text>
                  )}
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 12.5, color: nonLus > 0 ? C.text : C.textMuted, fontWeight: nonLus > 0 ? '500' : '400', flex: 1, marginRight: 8 }} numberOfLines={1}>
                    {conv.statut === 'en_attente'
                      ? (isParent ? '⏳ En attente de réponse du médecin…' : '⏳ Demande de discussion en attente')
                      : conv.statut === 'refusee'
                        ? '❌ Demande refusée'
                        : conv.dernierMessage || '💬 Conversation démarrée'}
                  </Text>
                  {nonLus > 0 && (
                    <View style={{ backgroundColor: C.primary, borderRadius: 10, minWidth: 22, height: 22, paddingHorizontal: 7, justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ fontSize: 10, fontWeight: '900', color: '#fff' }}>{nonLus}</Text>
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

export default function MessagesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [convs, setConvs] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [myId, setMyId] = useState(null);
  const [myRole, setMyRole] = useState(null);
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      try {
        const userStr = await AsyncStorage.getItem('userData');
        if (userStr) {
          const user = JSON.parse(userStr);
          setMyId(user._id || user.userId);
          setMyRole(user.role);
        }
      } catch {}
    })();
    Animated.spring(headerAnim, { toValue: 1, tension: 55, friction: 8, useNativeDriver: true }).start();
  }, []);

  const loadConvs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/messages/conversations');
      setConvs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('loadConvs error:', error);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    if (myId) {
      loadConvs();
      const interval = setInterval(loadConvs, 10000);
      return () => clearInterval(interval);
    }
  }, [myId, loadConvs]);

  const handleDeleteConv = useCallback(async (convId) => {
    try {
      await apiFetch(`/api/messages/conv/${convId}`, { method: 'DELETE' });
      setConvs(prev => prev.filter(c => c._id !== convId));
    } catch (error) {
      console.error('deleteConv error:', error);
    }
  }, []);

  const totalUnread = convs.reduce((a, c) => a + (c.nonLus || 0), 0);
  const actives = convs.filter(c => c.statut === 'acceptee').length;
  const enAttente = convs.filter(c => c.statut === 'en_attente').length;

  const normalize = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const filtered = convs.filter(c => {
    const name = myRole === 'Parent' ? c.nomMedecin : c.nomParent;
    return !search ||
      normalize(name).includes(normalize(search)) ||
      normalize(c.specialiteMedecin || '').includes(normalize(search)) ||
      normalize(c.dernierMessage || '').includes(normalize(search));
  });

  if (activeConv) {
    const current = convs.find(c => c._id === activeConv._id) || activeConv;
    return (
      <View style={{ flex: 1, backgroundColor: C.surface }}>
        <StatusBar barStyle="light-content" />
        <ConvView
          conv={current}
          myId={myId}
          myRole={myRole}
          onBack={() => setActiveConv(null)}
          onConvDeleted={handleDeleteConv}
        />
      </View>
    );
  }

  return (
    <ParentLayout activeTab="messages">
      <View style={{ flex: 1, backgroundColor: C.surface }}>
        <StatusBar barStyle="light-content" />

        <LinearGradient
          colors={[C.gradientStart, C.primary, C.gradientEnd]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ paddingTop: insets.top + 16, paddingBottom: 26, overflow: 'hidden' }}>
          <View style={{ position: 'absolute', right: -60, top: -40, width: 220, height: 220, borderRadius: 110, backgroundColor: '#C4B5FD', opacity: 0.15 }} />
          <View style={{ position: 'absolute', left: -40, bottom: -30, width: 180, height: 180, borderRadius: 90, backgroundColor: '#7C3AED', opacity: 0.12 }} />

          <Animated.View style={{
            opacity: headerAnim,
            transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }],
            paddingHorizontal: 22,
          }}>
            <Text style={{ fontSize: 11, color: gl(0.52), fontWeight: '600', letterSpacing: 1.5, marginBottom: 6 }}>
              MESSAGERIE MÉDICALE
            </Text>

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
                  {convs.length} conversation{convs.length !== 1 ? 's' : ''} · {actives} active{actives !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 18 }}>
              {[
                { icon: 'mail', label: 'Non lus', value: totalUnread, color: '#FCD34D' },
                { icon: 'message-circle', label: 'Total', value: convs.length, color: '#C4B5FD' },
                { icon: 'check-circle', label: 'Actives', value: actives, color: '#A78BFA' },
                { icon: 'clock', label: 'En attente', value: enAttente, color: '#FDE68A' },
              ].map((s, i) => (
                <View key={i} style={{ flex: 1, backgroundColor: gl(0.12), borderRadius: 16, paddingVertical: 13, alignItems: 'center', borderWidth: 1, borderColor: gl(0.20) }}>
                  <Feather name={s.icon} size={13} color={s.color} style={{ marginBottom: 5 }} />
                  <Text style={{ fontSize: 18, fontWeight: '800', color: '#fff' }}>{s.value}</Text>
                  <Text style={{ fontSize: 9, color: gl(0.50), textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 2 }}>{s.label}</Text>
                </View>
              ))}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: gl(0.12), borderRadius: 18, paddingHorizontal: 14, height: 46, borderWidth: 1, borderColor: gl(0.20) }}>
              <Feather name="search" size={16} color={gl(0.55)} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Rechercher un médecin…"
                placeholderTextColor={gl(0.45)}
                style={{ flex: 1, fontSize: 14, color: '#fff' }}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Feather name="x" size={15} color={gl(0.60)} />
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        </LinearGradient>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={C.primary} />
            <Text style={{ fontSize: 13, color: C.textMuted, marginTop: 12 }}>Chargement des messages...</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadConvs(); }} colors={[C.primary]} />
            }>
            {filtered.length === 0 ? (
              <View style={{ alignItems: 'center', paddingTop: 60 }}>
                <View style={{ width: 100, height: 100, borderRadius: 36, backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 20, borderWidth: 2, borderColor: C.primary }}>
                  <Feather name="message-circle" size={40} color={C.primary} />
                </View>
                <Text style={{ fontSize: 20, fontWeight: '800', color: C.text, marginBottom: 10 }}>
                  {search ? 'Aucun résultat' : 'Aucune conversation'}
                </Text>
                <Text style={{ fontSize: 14, color: C.textMuted, textAlign: 'center', lineHeight: 22, paddingHorizontal: 30 }}>
                  {search
                    ? `Aucune conversation ne correspond à "${search}"`
                    : 'Rendez-vous dans l\'annuaire médical\npour contacter un spécialiste.'}
                </Text>
                {!search && (
                  <TouchableOpacity
                    onPress={() => navigation?.navigate?.('Annuaire')}
                    style={{ marginTop: 28, borderRadius: 18, overflow: 'hidden', ...sh(C.primary, 8, 0.25, 16, 5) }}>
                    <LinearGradient colors={[C.primary, C.gradientEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 16, paddingHorizontal: 28 }}>
                      <Feather name="search" size={18} color="#fff" />
                      <Text style={{ fontSize: 15, fontWeight: '800', color: '#fff' }}>Aller à l'annuaire</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              filtered.map((conv, i) => (
                <ConvItem
                  key={conv._id}
                  conv={conv}
                  index={i}
                  myId={myId}
                  myRole={myRole}
                  onPress={() => {
                    if (conv.statut === 'acceptee') {
                      setActiveConv(conv);
                    } else if (conv.statut === 'en_attente') {
                      xAlert('En attente', 'Votre demande de discussion est en cours de traitement par le médecin.');
                    } else {
                      xAlert('Refusée', 'Cette demande de discussion a été refusée.');
                    }
                  }}
                  onDelete={handleDeleteConv}
                />
              ))
            )}
          </ScrollView>
        )}
      </View>
    </ParentLayout>
  );
}