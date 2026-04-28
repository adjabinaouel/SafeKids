// src/components/Navigation/MedecinNavigation.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Dimensions, Platform, StatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useNavigationState } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const IS_TABLET = width >= 768;

// Couleurs médecin (cyan/vert médical)
export const MEDECIN_COLORS = {
  primary:      '#0891B2',
  primaryDark:  '#0E7490',
  primaryLight: '#CFFAFE',
  primaryMid:   '#E0F7FA',
  gradient:     ['#0891B2', '#0E7490'],
  gradientSoft: ['#06B6D4', '#0891B2'],
  text:         '#0C4A6E',
  surface:      '#F0FDFF',
};

const NAV_ITEMS = [
  { key: 'Patients',           icon: 'users',         label: 'Patients'        },
  { key: 'MedecinNotification', icon: 'bell',         label: 'Notifications'    },
  { key: 'MessageMedecin',     icon: 'message-circle', label: 'Messages'        },
  { key: 'MedecinProfile',     icon: 'user',          label: 'Profil'           },
];

const shadow = (color = '#000', y = 4, op = 0.10, r = 12) =>
  Platform.select({
    ios:     { shadowColor: color, shadowOffset: { width: 0, height: y }, shadowOpacity: op, shadowRadius: r },
    android: { elevation: Math.round(op * 40) },
  });

// Badge notification
const NavBadge = ({ count }) => {
  if (!count || count === 0) return null;
  return (
    <View style={{
      position: 'absolute', top: -3, right: -3,
      minWidth: 16, height: 16, borderRadius: 8,
      backgroundColor: '#EF4444',
      alignItems: 'center', justifyContent: 'center',
      paddingHorizontal: 3, borderWidth: 1.5, borderColor: '#fff',
    }}>
      <Text style={{ fontSize: 8, fontWeight: '900', color: '#fff' }}>
        {count > 9 ? '9+' : count}
      </Text>
    </View>
  );
};

// Sidebar tablet
const Sidebar = ({ activeKey, onNavigate, badgeCounts }) => (
  <View style={{
    width: 220, backgroundColor: 'rgba(255,255,255,0.96)',
    paddingTop: 40, paddingBottom: 32, paddingHorizontal: 14,
    borderRightWidth: 1, borderRightColor: '#E0F7FA',
    ...shadow('#0891B2', 2, 0.08, 14),
  }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 32, paddingHorizontal: 4 }}>
      <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: MEDECIN_COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' }}>
        <Feather name="activity" size={20} color={MEDECIN_COLORS.primary} />
      </View>
      <View>
        <Text style={{ fontSize: 15, fontWeight: '900', color: MEDECIN_COLORS.text, letterSpacing: -0.3 }}>SafeKids</Text>
        <Text style={{ fontSize: 10, color: MEDECIN_COLORS.primary, fontWeight: '700', letterSpacing: 0.5 }}>MÉDECIN</Text>
      </View>
    </View>

    {NAV_ITEMS.map((item) => {
      const isActive = activeKey === item.key;
      return (
        <TouchableOpacity
          key={item.key}
          onPress={() => onNavigate(item.key)}
          activeOpacity={0.75}
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 12,
            borderRadius: 13, marginBottom: 4,
            paddingVertical: 11, paddingHorizontal: 14,
            backgroundColor: isActive ? MEDECIN_COLORS.primaryLight : 'transparent',
            borderWidth: isActive ? 1 : 0,
            borderColor: isActive ? MEDECIN_COLORS.primary + '30' : 'transparent',
          }}
        >
          <View style={{ position: 'relative' }}>
            <Feather name={item.icon} size={17} color={isActive ? MEDECIN_COLORS.primary : '#94A3B8'} />
            <NavBadge count={badgeCounts[item.key]} />
          </View>
          <Text style={{
            fontSize: 14, fontWeight: isActive ? '700' : '500',
            color: isActive ? MEDECIN_COLORS.primary : '#64748B',
          }}>
            {item.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

// Bottom Nav mobile
const BottomNav = ({ activeKey, onNavigate, badgeCounts, insets }) => (
  <View style={{
    position: 'absolute', bottom: 0, left: 0, right: 0,
    zIndex: 9999, elevation: 24,
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderTopWidth: 1, borderTopColor: '#E0F7FA',
    paddingTop: 8,
    paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
    ...shadow('#0891B2', -8, 0.12, 20),
  }}>
    {NAV_ITEMS.map((item) => {
      const isActive = activeKey === item.key;
      return (
        <TouchableOpacity
          key={item.key}
          onPress={() => onNavigate(item.key)}
          activeOpacity={0.7}
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 2 }}
        >
          <View style={{
            position: 'relative',
            width: 44, height: 30,
            alignItems: 'center', justifyContent: 'center',
            borderRadius: 10,
            backgroundColor: isActive ? MEDECIN_COLORS.primaryLight : 'transparent',
          }}>
            <Feather
              name={item.icon}
              size={20}
              color={isActive ? MEDECIN_COLORS.primary : '#94A3B8'}
            />
            <NavBadge count={badgeCounts[item.key]} />
          </View>
          <Text style={{
            fontSize: 9, marginTop: 3,
            fontWeight: isActive ? '800' : '500',
            color: isActive ? MEDECIN_COLORS.primary : '#94A3B8',
            letterSpacing: 0.2,
          }}>
            {item.label}
          </Text>
          {isActive && (
            <View style={{ width: 16, height: 3, borderRadius: 2, backgroundColor: MEDECIN_COLORS.primary, marginTop: 3 }} />
          )}
        </TouchableOpacity>
      );
    })}
  </View>
);

// Layout principal
export default function MedecinLayout({ children, activeTab }) {
  const insets = useSafeAreaInsets();
  const [badgeCounts, setBadgeCounts] = useState({
    Patients: 0,
    MedecinNotification: 0,
    MessageMedecin: 0,
    MedecinProfile: 0,
  });

  let navigation;
  let currentRoute = activeTab;
  try {
    navigation = useNavigation();
    const state = useNavigationState(s => s);
    if (state) {
      const route = state.routes[state.index];
      currentRoute = route?.name || activeTab;
    }
  } catch {}

  const activeKey = currentRoute || activeTab || 'Patients';

  // IMPORTANT: Ne pas appliquer de paddingTop ici !
  // Le paddingTop sera géré par chaque écran individuellement
  // pour éviter le double padding

  // Polling badges
  useEffect(() => {
    const load = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) return;
        const BASE = 'https://unfailed-branden-healable.ngrok-free.dev';
        const headers = { 'Authorization': `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' };

        const [notifRes, messagesRes] = await Promise.allSettled([
          fetch(`${BASE}/api/notifications/count`, { headers }).then(r => r.json()),
          fetch(`${BASE}/api/messages/unread/count`, { headers }).then(r => r.json()),
        ]);

        setBadgeCounts(prev => ({
          ...prev,
          MedecinNotification: notifRes.status === 'fulfilled' ? (notifRes.value?.count || 0) : prev.MedecinNotification,
          MessageMedecin: messagesRes.status === 'fulfilled' ? (messagesRes.value?.count || 0) : prev.MessageMedecin,
        }));
      } catch (error) {
        console.error('Erreur chargement badges:', error);
      }
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleNavigate = (key) => {
    try {
      navigation?.navigate(key);
    } catch (error) {
      console.log('Navigate to:', key, error);
    }
  };

  // Mode tablette - SANS paddingTop supplémentaire
  if (IS_TABLET) {
    return (
      <View style={{ flex: 1, flexDirection: 'row', backgroundColor: MEDECIN_COLORS.surface }}>
        <StatusBar barStyle="dark-content" backgroundColor={MEDECIN_COLORS.surface} />
        <Sidebar activeKey={activeKey} onNavigate={handleNavigate} badgeCounts={badgeCounts} />
        <View style={{ flex: 1 }}>{children}</View>
      </View>
    );
  }

  // Mode mobile - SANS paddingTop ici (sera géré par les écrans)
  return (
    <View style={{ flex: 1, backgroundColor: MEDECIN_COLORS.surface }}>
      <StatusBar barStyle="dark-content" backgroundColor={MEDECIN_COLORS.surface} />
      <View style={{ flex: 1 }}>{children}</View>
      <BottomNav activeKey={activeKey} onNavigate={handleNavigate} badgeCounts={badgeCounts} insets={insets} />
    </View>
  );
}