import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, StatusBar, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import ParentLayout from '../../../components/Navigation/ParentNavigation';

// ─── DATA ─────────────────────────────────────────────────────────────────────

const CONVERSATIONS = [
  {
    id: '1',
    nom: 'Dr. Karim Meziane',
    role: 'Médecin référent',
    initials: 'KM',
    avatarColors: ['#7C3AED', '#2563EB'],
    unread: 2,
    lastMsg: 'Le rapport de mars est disponible. Amine fait de très bons progrès...',
    time: '10h32',
    messages: [
      { id: 'm1', from: 'them', text: 'Bonjour Sara, j\'ai publié le rapport de mars pour Amine.', time: '10h28' },
      { id: 'm2', from: 'them', text: 'Les progrès en PECS Phase 2 sont excellents. Je recommande de commencer Phase 3 la semaine prochaine.', time: '10h29' },
      { id: 'm3', from: 'them', text: 'Pouvez-vous confirmer que vous avez bien reçu le classeur d\'images que j\'ai envoyé ?', time: '10h32' },
    ],
  },
  {
    id: '2',
    nom: 'Léa Petit',
    role: 'Orthophoniste',
    initials: 'LP',
    avatarColors: ['#059669', '#10B981'],
    unread: 0,
    lastMsg: 'Pour la séance de jeudi, n\'oubliez pas le classeur PECS de Lina',
    time: 'Hier',
    messages: [
      { id: 'm1', from: 'me', text: 'Bonjour Léa, Lina a bien fait ses exercices ce weekend.', time: 'Sam 14h' },
      { id: 'm2', from: 'them', text: 'Super ! Elle progresse vraiment bien. Pour la séance de jeudi, n\'oubliez pas le classeur PECS de Lina.', time: 'Sam 15h20' },
    ],
  },
  {
    id: '3',
    nom: 'Association ABA Algérie',
    role: 'Association de soutien',
    initials: 'AB',
    avatarColors: ['#D97706', '#F59E0B'],
    unread: 0,
    lastMsg: 'Atelier parents du 5 avril — inscription ouverte',
    time: 'Il y a 3j',
    messages: [
      { id: 'm1', from: 'them', text: 'Bonjour ! L\'atelier parents du 5 avril est maintenant ouvert aux inscriptions. Places limitées à 20 familles.', time: 'Lun 9h' },
    ],
  },
];

// ─── AVATAR ───────────────────────────────────────────────────────────────────

function Avatar({ initials, colors, size = 44 }) {
  return (
    <LinearGradient colors={colors} style={{ width: size, height: size, borderRadius: size * 0.3, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.32, fontWeight: '800', color: '#fff' }}>{initials}</Text>
    </LinearGradient>
  );
}

// ─── CONVERSATION VIEW ────────────────────────────────────────────────────────

function ConversationView({ conv, onBack }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(conv.messages);
  const scrollRef = useRef(null);

  const send = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { id: `m${Date.now()}`, from: 'me', text: input.trim(), time: 'Maintenant' }]);
    setInput('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F0A2E' }}>
      <StatusBar barStyle="light-content" />

      {/* TOP BAR */}
      <View style={CS.topBar}>
        <TouchableOpacity onPress={onBack} style={CS.backBtn}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Avatar initials={conv.initials} colors={conv.avatarColors} size={38} />
        <View style={{ flex: 1 }}>
          <Text style={CS.convName}>{conv.nom}</Text>
          <Text style={CS.convRole}>{conv.role}</Text>
        </View>
        <TouchableOpacity style={CS.callBtn}>
          <Feather name="phone" size={18} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
      </View>

      {/* MESSAGES */}
      <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
        showsVerticalScrollIndicator={false}>
        {messages.map(msg => (
          <View key={msg.id} style={{ alignItems: msg.from === 'me' ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
            <View style={msg.from === 'me' ? CS.bubbleMe : CS.bubbleThem}>
              <Text style={msg.from === 'me' ? CS.bubbleMeText : CS.bubbleThemText}>{msg.text}</Text>
            </View>
            <Text style={CS.msgTime}>{msg.time}</Text>
          </View>
        ))}
      </ScrollView>

      {/* INPUT */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={CS.inputRow}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Écrire un message..."
            placeholderTextColor="rgba(255,255,255,0.35)"
            style={CS.input}
            multiline
            onSubmitEditing={send}
          />
          <TouchableOpacity
            onPress={send}
            style={[CS.sendBtn, !input.trim() && { opacity: 0.4 }]}
            disabled={!input.trim()}>
            <LinearGradient colors={['#7C3AED', '#2563EB']} style={CS.sendBtnGradient}>
              <Feather name="send" size={16} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────

export default function MessagesScreen() {
  const [activeConv, setActiveConv] = useState(null);
  const [search, setSearch] = useState('');

  if (activeConv) {
    return <ConversationView conv={activeConv} onBack={() => setActiveConv(null)} />;
  }

  const filtered = CONVERSATIONS.filter(c =>
    !search || c.nom.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnread = CONVERSATIONS.reduce((sum, c) => sum + c.unread, 0);

  return (
    <ParentLayout activeTab="messages">
      <View style={{ flex: 1, backgroundColor: '#0F0A2E' }}>
        <StatusBar barStyle="light-content" />

        {/* HEADER */}
        <LinearGradient colors={['#1E1B4B', '#0F0A2E']} style={S.header}>
          <Text style={S.greeting}>Messagerie sécurisée</Text>
          <Text style={S.headerTitle}>
            Messages{' '}
            {totalUnread > 0 && <Text style={{ color: '#FCD34D' }}>{totalUnread}</Text>}
          </Text>

          {/* SEARCH */}
          <View style={S.searchBar}>
            <Feather name="search" size={15} color="rgba(255,255,255,0.4)" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Rechercher une conversation..."
              placeholderTextColor="rgba(255,255,255,0.35)"
              style={S.searchInput}
            />
            {!!search && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Feather name="x" size={15} color="rgba(255,255,255,0.4)" />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 100 }}>

          <Text style={S.sectionLabel}>Conversations</Text>

          {filtered.map(conv => (
            <TouchableOpacity key={conv.id} activeOpacity={0.85}
              onPress={() => setActiveConv(conv)}
              style={[S.convCard, conv.unread > 0 && S.convCardUnread]}>

              <View style={{ position: 'relative' }}>
                <Avatar initials={conv.initials} colors={conv.avatarColors} size={46} />
                {conv.unread > 0 && (
                  <View style={S.unreadBadge}>
                    <Text style={S.unreadBadgeText}>{conv.unread}</Text>
                  </View>
                )}
              </View>

              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                  <Text style={[S.convName, conv.unread > 0 && { color: '#fff' }]} numberOfLines={1}>
                    {conv.nom}
                  </Text>
                  <Text style={S.convTime}>{conv.time}</Text>
                </View>
                <Text style={S.convRole}>{conv.role}</Text>
                <Text style={[S.convPreview, conv.unread > 0 && { color: 'rgba(255,255,255,0.7)' }]}
                  numberOfLines={1}>
                  {conv.lastMsg}
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          {filtered.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>💬</Text>
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#fff' }}>Aucune conversation</Text>
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
  greeting: { fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#fff', letterSpacing: -0.5, marginTop: 2, marginBottom: 16 },

  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14, height: 46 },
  searchInput: { flex: 1, fontSize: 14, color: '#fff', fontWeight: '500' },

  sectionLabel: { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12, marginTop: 4 },

  convCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 18, padding: 14, marginBottom: 10 },
  convCardUnread: { backgroundColor: 'rgba(124,58,237,0.12)', borderColor: 'rgba(167,139,250,0.3)' },

  unreadBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#7C3AED', borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3, borderWidth: 1.5, borderColor: '#0F0A2E' },
  unreadBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff' },

  convName: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.8)', flex: 1, marginRight: 8 },
  convTime: { fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: '600' },
  convRole: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 3 },
  convPreview: { fontSize: 12, color: 'rgba(255,255,255,0.45)' },
});

// ─── CONVERSATION STYLES ──────────────────────────────────────────────────────

const CS = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(30,27,75,0.95)' },
  backBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  convName: { fontSize: 14, fontWeight: '800', color: '#fff' },
  convRole: { fontSize: 11, color: 'rgba(255,255,255,0.5)' },
  callBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },

  bubbleMe: { backgroundColor: '#7C3AED', borderRadius: 18, borderBottomRightRadius: 5, paddingHorizontal: 14, paddingVertical: 10, maxWidth: '78%' },
  bubbleThem: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 18, borderBottomLeftRadius: 5, paddingHorizontal: 14, paddingVertical: 10, maxWidth: '78%' },
  bubbleMeText: { fontSize: 14, color: '#fff', lineHeight: 20 },
  bubbleThemText: { fontSize: 14, color: 'rgba(255,255,255,0.9)', lineHeight: 20 },
  msgTime: { fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4, marginHorizontal: 4 },

  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 16, paddingVertical: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(15,10,46,0.95)' },
  input: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: '#fff', maxHeight: 100 },
  sendBtn: { flexShrink: 0 },
  sendBtnGradient: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
