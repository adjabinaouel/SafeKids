// src/components/Navigation/ParentNavigation.js
import React from 'react';
import {
  View, Text, TouchableOpacity, SafeAreaView,
  Platform, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, GLASS } from '../../theme';

const { width } = Dimensions.get('window');
const IS_TABLET = width >= 768;

// ── Onglets ───────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'home',       icon: 'home',      label: 'Accueil'     },
  { key: 'activities', icon: 'grid',       label: 'Activités'   },
  { key: 'notifications',   icon: 'bell',label: 'Notifications'     },
  { key: 'mesEnfants',   icon: 'users',   label: 'Mes Enfantes'    },
  { key: 'profile',    icon: 'user',       label: 'Profil'      },
  { key: 'annuaire', icon: 'map-pin', label: 'Annuaire Médical' },
  { key: 'messages'           ,icon:'message-circle',                  label:'Messages'}
];

// ── Bottom Nav Item (Mobile) ──────────────────────────────────────────────────
const NavItem = ({ tab, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.75}
    style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
  >
    {/* Pill indicateur actif */}
    <View style={{
      width: 46,
      height: 34,
      borderRadius: 17,
      backgroundColor: active ? COLORS.primaryLight : 'transparent',
      borderWidth:     active ? 1.5 : 0,
      borderColor:     active ? GLASS.light.border : 'transparent',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 5,
    }}>
      <Feather
        name={tab.icon}
        size={21}
        color={active ? COLORS.primary : COLORS.textMuted}
        strokeWidth={active ? 2.8 : 2}
      />
    </View>
    <Text style={{
      fontSize:   9.5,
      fontWeight: active ? '700' : '600',
      color:      active ? COLORS.primary : COLORS.textMuted,
      letterSpacing: 0.1,
    }}>
      {tab.label}
    </Text>
  </TouchableOpacity>
);

// ── Sidebar Item (Tablet) ─────────────────────────────────────────────────────
const SidebarItem = ({ tab, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.82}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 11,
      paddingHorizontal: 14,
      borderRadius: 14,
      marginBottom: 4,
      backgroundColor: active ? GLASS.light.bg : 'transparent',
      borderWidth:     active ? 1 : 0,
      borderColor:     active ? GLASS.light.border : 'transparent',
    }}
  >
    <View style={{
      width: 36,
      height: 36,
      borderRadius: 11,
      backgroundColor: active ? COLORS.primaryMid : COLORS.surfaceAlt,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: active ? COLORS.primary + '28' : GLASS.light.border,
    }}>
      <Feather name={tab.icon} size={16} color={active ? COLORS.primary : COLORS.textMuted} />
    </View>
    <Text style={{
      fontSize: 14,
      fontWeight: active ? '700' : '500',
      color: active ? COLORS.primary : COLORS.textLight,
    }}>
      {tab.label}
    </Text>
    {active && (
      <View style={{
        marginLeft: 'auto',
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.primary,
      }} />
    )}
  </TouchableOpacity>
);

// ── Layout principal ──────────────────────────────────────────────────────────
const ParentLayout = ({ children, activeTab }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const navigateTo = (key) => {
    const screenMap = {
      home:       'Home',
      activities: 'Activities',
      progress:   'Progress',
      schedule:   'Schedule',
      profile:    'Profile',
      notifications: 'Notifications',
      mesEnfants: 'Children',
      annuaire:'Annuaire',
      messages: 'Messages',
    };
    navigation.navigate(screenMap[key]);
  };

  // ── Tablet → sidebar ──────────────────────────────────────────────────────
  if (IS_TABLET) {
    return (
      <View style={{ flex: 1, flexDirection: 'row', backgroundColor: COLORS.white }}>
        {/* Sidebar */}
        <View style={{
          width: 228,
          backgroundColor: 'rgba(255,255,255,0.90)',
          paddingTop: 40,
          paddingBottom: 32,
          paddingHorizontal: 16,
          borderRightWidth: 1,
          borderRightColor: GLASS.light.border,
          ...Platform.select({
            ios: {
              shadowColor: GLASS.light.shadow,
              shadowOffset: { width: 2, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 14,
            },
            android: { elevation: 8 },
          }),
        }}>
          {/* Logo */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: COLORS.primaryMid,
              borderWidth: 1,
              borderColor: GLASS.light.border,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Feather name="shield" size={20} color={COLORS.primary} />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '900', color: COLORS.text }}>SafeKids</Text>
          </View>

          {/* Navigation */}
          {TABS.map(tab => (
            <SidebarItem
              key={tab.key}
              tab={tab}
              active={activeTab === tab.key}
              onPress={() => navigateTo(tab.key)}
            />
          ))}

          {/* Version */}
          <View style={{
            marginTop: 'auto',
            backgroundColor: GLASS.light.bg,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderWidth: 1,
            borderColor: GLASS.light.border,
          }}>
            <Text style={{ fontSize: 10, color: COLORS.textMuted, fontWeight: '500' }}>SafeKids v2.1.0</Text>
            <Text style={{ fontSize: 9, color: COLORS.textMuted + '80', marginTop: 1 }}>© 2026 Tous droits réservés</Text>
          </View>
        </View>

        {/* Contenu principal */}
        <View style={{ flex: 1 }}>{children}</View>
      </View>
    );
  }

  // ── Mobile → bottom navigation ────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      {/* Contenu principal */}
      <View style={{ flex: 1 }}>{children}</View>

      {/* Bottom Navigation améliorée */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderTopWidth: 1,
        borderTopColor: GLASS.light.border,
        paddingTop: 10,
        paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 14,
        minHeight: Platform.OS === 'ios' ? 78 : 70,
        ...Platform.select({
          ios: {
            shadowColor: GLASS.light.shadow,
            shadowOffset: { width: 0, height: -12 },
            shadowOpacity: 0.35,
            shadowRadius: 22,
          },
          android: { elevation: 24 },
        }),
      }}>
        {/* Ligne fine en haut pour le glass effect */}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          backgroundColor: 'rgba(255,255,255,0.7)',
        }} />

        {TABS.map(tab => (
          <NavItem
            key={tab.key}
            tab={tab}
            active={activeTab === tab.key}
            onPress={() => navigateTo(tab.key)}
          />
        ))}
      </View>
    </View>
  );
};

export default ParentLayout;