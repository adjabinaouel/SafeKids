import React from 'react';
import {
  View, Text, TouchableOpacity, Platform, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, GLASS } from '../../theme';

const { width } = Dimensions.get('window');
export const IS_TABLET = width >= 768;

// ── Onglets admin ─────────────────────────────────────────────────────────────
const TABS = [
  { key: 'dashboard',     icon: 'home',       label: 'Accueil'    },
  { key: 'comptes',       icon: 'users',      label: 'Comptes'    },
  { key: 'activites',     icon: 'grid',       label: 'Activités'  },
  { key: 'statistiques',  icon: 'bar-chart-2',label: 'Stats'      },
  { key: 'notifications', icon: 'bell',       label: 'Notifs'     },
];

const SCREEN_MAP = {
  dashboard:     'Dashboard',
  comptes:       'Comptes',
  activites:     'Activites',
  statistiques:  'Statistiques',
  notifications: 'NotificationsAdmin',
  profil:        'ProfilAdmin',
};

// ── NavItem mobile ─────────────────────────────────────────────────────────────
const NavItem = ({ tab, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.75}
    style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
  >
    <View style={{
      width: 46, height: 34, borderRadius: 17,
      backgroundColor: active ? COLORS.primaryLight : 'transparent',
      borderWidth: active ? 1.5 : 0,
      borderColor:  active ? GLASS.light.border : 'transparent',
      justifyContent: 'center', alignItems: 'center', marginBottom: 5,
    }}>
      <Feather
        name={tab.icon} size={21}
        color={active ? COLORS.primary : COLORS.textMuted}
        strokeWidth={active ? 2.8 : 2}
      />
    </View>
    <Text style={{
      fontSize: 9.5, fontWeight: active ? '700' : '600',
      color: active ? COLORS.primary : COLORS.textMuted, letterSpacing: 0.1,
    }}>
      {tab.label}
    </Text>
  </TouchableOpacity>
);

// ── SidebarItem tablette ──────────────────────────────────────────────────────
const SidebarItem = ({ tab, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.82}
    style={{
      flexDirection: 'row', alignItems: 'center', gap: 12,
      paddingVertical: 11, paddingHorizontal: 14, borderRadius: 14, marginBottom: 4,
      backgroundColor: active ? GLASS.light.bg : 'transparent',
      borderWidth: active ? 1 : 0,
      borderColor:  active ? GLASS.light.border : 'transparent',
    }}
  >
    <View style={{
      width: 36, height: 36, borderRadius: 11,
      backgroundColor: active ? COLORS.primaryMid : COLORS.surfaceAlt,
      justifyContent: 'center', alignItems: 'center',
      borderWidth: 1,
      borderColor: active ? COLORS.primary + '28' : GLASS.light.border,
    }}>
      <Feather name={tab.icon} size={16} color={active ? COLORS.primary : COLORS.textMuted} />
    </View>
    <Text style={{
      fontSize: 14, fontWeight: active ? '700' : '500',
      color: active ? COLORS.primary : COLORS.textLight, flex: 1,
    }}>
      {tab.label}
    </Text>
    {active && (
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary }} />
    )}
  </TouchableOpacity>
);

// ── Layout principal ──────────────────────────────────────────────────────────
const AdminLayout = ({ children, activeTab }) => {
  const navigation = useNavigation();
  const insets     = useSafeAreaInsets();

  const go = (key) => navigation.navigate(SCREEN_MAP[key]);

  if (IS_TABLET) {
    return (
      <View style={{ flex: 1, flexDirection: 'row', backgroundColor: COLORS.white }}>
        {/* Sidebar */}
        <View style={{
          width: 228, backgroundColor: 'rgba(255,255,255,0.92)',
          paddingTop: 40, paddingBottom: 32, paddingHorizontal: 16,
          borderRightWidth: 1, borderRightColor: GLASS.light.border,
          ...Platform.select({
            ios:     { shadowColor: GLASS.light.shadow, shadowOffset: { width: 2, height: 0 }, shadowOpacity: 0.8, shadowRadius: 14 },
            android: { elevation: 8 },
          }),
        }}>
          {/* Logo */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <View style={{
              width: 40, height: 40, borderRadius: 12,
              backgroundColor: COLORS.primaryMid,
              borderWidth: 1, borderColor: GLASS.light.border,
              justifyContent: 'center', alignItems: 'center',
            }}>
              <Feather name="shield" size={20} color={COLORS.primary} />
            </View>
            <View>
              <Text style={{ fontSize: 18, fontWeight: '900', color: COLORS.text }}>SafeKids</Text>
              <Text style={{ fontSize: 10, color: COLORS.textMuted, fontWeight: '600' }}>Administration</Text>
            </View>
          </View>

          {/* Nav */}
          {TABS.map(tab => (
            <SidebarItem key={tab.key} tab={tab} active={activeTab === tab.key}
              onPress={() => go(tab.key)} />
          ))}

          {/* Profil en bas */}
          <View style={{ marginTop: 'auto' }}>
            <TouchableOpacity
              onPress={() => go('profil')}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 10,
                backgroundColor: GLASS.light.bg, borderRadius: 14, padding: 12,
                borderWidth: 1, borderColor: GLASS.light.border,
              }}
            >
              <View style={{
                width: 36, height: 36, borderRadius: 10,
                backgroundColor: COLORS.primaryMid, alignItems: 'center', justifyContent: 'center',
              }}>
                <Feather name="user" size={16} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.text }}>Admin</Text>
                <Text style={{ fontSize: 10, color: COLORS.textMuted }}>Super administrateur</Text>
              </View>
              <Feather name="chevron-right" size={14} color={COLORS.textMuted} />
            </TouchableOpacity>
            <Text style={{ fontSize: 10, color: COLORS.textMuted, fontWeight: '500', marginTop: 10, textAlign: 'center' }}>
              SafeKids Admin v1.0.0
            </Text>
          </View>
        </View>

        {/* Contenu */}
        <View style={{ flex: 1 }}>{children}</View>
      </View>
    );
  }

  // Mobile → bottom nav
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <View style={{ flex: 1 }}>{children}</View>

      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 9999,
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderTopWidth: 1, borderTopColor: GLASS.light.border,
        paddingTop: 10,
        paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 14,
        minHeight: Platform.OS === 'ios' ? 78 : 70,
        ...Platform.select({
          ios:     { shadowColor: GLASS.light.shadow, shadowOffset: { width: 0, height: -12 }, shadowOpacity: 0.35, shadowRadius: 22 },
          android: { elevation: 24 },
        }),
      }}>
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.7)' }} />
        {TABS.map(tab => (
          <NavItem key={tab.key} tab={tab} active={activeTab === tab.key}
            onPress={() => go(tab.key)} />
        ))}
      </View>
    </View>
  );
};

export default AdminLayout;