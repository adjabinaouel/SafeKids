// src/pages/admin/DashboardScreen/DashboardScreen.js
import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StatusBar, Animated, Dimensions, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AdminLayout from '../../../components/Navigation/AdminNavigation';
import S from './DashboardStyles';

const { width } = Dimensions.get('window');

// ── Guide steps ───────────────────────────────────────────────────────────────
const GUIDE_STEPS = [
  {
    step: '01', icon: 'user-plus',
    title: 'Créer les comptes médecins',
    desc: "Rendez-vous dans « Comptes » pour ajouter les médecins. Saisissez nom, prénom, email et spécialité. Un mot de passe temporaire leur sera attribué.",
    action: 'Comptes', color: '#8B5CF6', bg: '#EDE9FE',
  },
  {
    step: '02', icon: 'users',
    title: 'Gérer les parents',
    desc: "Les parents créent leur propre compte. Vous pouvez valider, bloquer ou supprimer un compte parent depuis la section « Comptes ».",
    action: 'Comptes', color: '#0EA5E9', bg: '#E0F2FE',
  },
  {
    step: '03', icon: 'bar-chart-2',
    title: 'Consulter les statistiques',
    desc: "La section « Statistiques » regroupe tous les indicateurs : genre, domaines, spécialités, consultations et évolutions mensuelles.",
    action: 'Statistiques', color: '#10B981', bg: '#D1FAE5',
  },
  {
    step: '04', icon: 'grid',
    title: 'Piloter les activités',
    desc: "Créez et organisez les activités thérapeutiques. Associez-les à des domaines et suivez leur taux d'engagement.",
    action: 'Activites', color: '#F59E0B', bg: '#FEF3C7',
  },
];

// ── Floating animated particle ────────────────────────────────────────────────
const FloatingParticle = ({ x, y, size, color, duration, delay }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration, delay, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return (
    <Animated.View style={{
      position: 'absolute', left: x, top: y,
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: color,
      opacity: anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.10, 0.35, 0.10] }),
      transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -16] }) }],
    }} />
  );
};

// ── Stat card with pulse icon ─────────────────────────────────────────────────
const StatCard = ({ icon, title, value, sub, color, delay }) => {
  const anim  = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: 1, tension: 48, friction: 8, delay, useNativeDriver: true }).start();
    const t = setTimeout(() => {
      Animated.loop(Animated.sequence([
        Animated.timing(pulse, { toValue: 1.10, duration: 1600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,    duration: 1600, useNativeDriver: true }),
      ])).start();
    }, delay + 500);
    return () => clearTimeout(t);
  }, []);
  return (
    <Animated.View style={{
      opacity: anim,
      transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.84, 1] }) }],
      width: (width - 56) / 2,
    }}>
      <View style={{
        backgroundColor: 'rgba(255,255,255,0.10)',
        borderRadius: 22, padding: 18,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
        overflow: 'hidden',
      }}>
        <View style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: 50, backgroundColor: color, opacity: 0.22 }} />
        <View style={{ position: 'absolute', bottom: -20, left: -10, width: 60, height: 60, borderRadius: 30, backgroundColor: color, opacity: 0.08 }} />
        <Animated.View style={{
          transform: [{ scale: pulse }],
          width: 42, height: 42, borderRadius: 14,
          backgroundColor: 'rgba(255,255,255,0.14)',
          borderWidth: 1.5, borderColor: color + '60',
          alignItems: 'center', justifyContent: 'center', marginBottom: 14,
        }}>
          <Feather name={icon} size={18} color={color} />
        </Animated.View>
        <Text style={{ fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: -1 }}>{value}</Text>
        <Text style={{ fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.90)', marginTop: 3 }}>{title}</Text>
        <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.42)', marginTop: 3 }}>{sub}</Text>
      </View>
    </Animated.View>
  );
};

// ── Nav Card ──────────────────────────────────────────────────────────────────
const NavCard = ({ icon, title, subtitle, color, bg, delay, onPress }) => {
  const anim  = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: 1, tension: 52, friction: 8, delay, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={{
      flex: 1, opacity: anim,
      transform: [
        { translateY: anim.interpolate({ inputRange: [0,1], outputRange: [24,0] }) },
        { scale },
      ],
    }}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={() => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1,   useNativeDriver: true }).start()}
        onPress={onPress}
        style={{
          backgroundColor: '#fff', borderRadius: 20, padding: 18,
          borderWidth: 1.5, borderColor: color + '25',
          shadowColor: color, shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.13, shadowRadius: 16, elevation: 5, overflow: 'hidden',
        }}
      >
        <View style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: 40, backgroundColor: color, opacity: 0.10 }} />
        <View style={{ position: 'absolute', top: 0, left: 20, right: 20, height: 3, borderRadius: 2, backgroundColor: color, opacity: 0.55 }} />
        <View style={{
          width: 48, height: 48, borderRadius: 16, backgroundColor: bg,
          alignItems: 'center', justifyContent: 'center',
          borderWidth: 1.5, borderColor: color + '35', marginBottom: 12,
        }}>
          <Feather name={icon} size={21} color={color} />
        </View>
        <Text style={{ fontSize: 15, fontWeight: '800', color: '#1E1B4B', letterSpacing: -0.3, marginBottom: 4 }}>{title}</Text>
        <Text style={{ fontSize: 11, color: '#94A3B8', lineHeight: 15 }}>{subtitle}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 14 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color }}>Accéder</Text>
          <Feather name="arrow-right" size={12} color={color} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── Step Card ─────────────────────────────────────────────────────────────────
const StepCard = ({ item, delay, navigation }) => {
  const anim  = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: 1, tension: 44, friction: 9, delay, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={{
      opacity: anim,
      transform: [
        { translateX: anim.interpolate({ inputRange: [0,1], outputRange: [-30,0] }) },
        { scale },
      ],
      marginBottom: 12,
    }}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={() => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1,   useNativeDriver: true }).start()}
        onPress={() => navigation.navigate(item.action)}
        style={{
          backgroundColor: '#fff', borderRadius: 20, padding: 18,
          borderWidth: 1.5, borderColor: item.color + '20',
          flexDirection: 'row', alignItems: 'center', gap: 14,
          shadowColor: item.color, shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08, shadowRadius: 14, elevation: 3, overflow: 'hidden',
        }}
      >
        <View style={{ position: 'absolute', left: 0, top: 16, bottom: 16, width: 4, borderRadius: 4, backgroundColor: item.color }} />
        <View style={{ position: 'absolute', top: 12, right: 14, backgroundColor: item.bg, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 }}>
          <Text style={{ fontSize: 9, fontWeight: '900', color: item.color, letterSpacing: 1 }}>{item.step}</Text>
        </View>
        <View style={{ width: 50, height: 50, borderRadius: 16, backgroundColor: item.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: item.color + '30' }}>
          <Feather name={item.icon} size={21} color={item.color} />
        </View>
        <View style={{ flex: 1, paddingRight: 30 }}>
          <Text style={{ fontSize: 14, fontWeight: '800', color: '#1E1B4B', marginBottom: 5, letterSpacing: -0.3 }}>{item.title}</Text>
          <Text style={{ fontSize: 12, color: '#94A3B8', lineHeight: 17 }}>{item.desc}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── Section Label ─────────────────────────────────────────────────────────────
const SLabel = ({ tag, title, sub }) => (
  <View style={{ marginBottom: 18 }}>
    <View style={{ backgroundColor: '#EDE9FE', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 8, borderWidth: 1, borderColor: 'rgba(109,40,217,0.15)' }}>
      <Text style={{ fontSize: 9, fontWeight: '800', color: '#6D28D9', letterSpacing: 1.2 }}>{tag}</Text>
    </View>
    <Text style={{ fontSize: 21, fontWeight: '900', color: '#1E1B4B', letterSpacing: -0.6, marginBottom: 4 }}>{title}</Text>
    {sub && <Text style={{ fontSize: 13, color: '#94A3B8', lineHeight: 18 }}>{sub}</Text>}
  </View>
);

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const navigation = useNavigation();

  const headerAnim  = useRef(new Animated.Value(0)).current;
  const statsAnim   = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const guideAnim   = useRef(new Animated.Value(0)).current;
  const shimmer     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(160, [
      Animated.spring(headerAnim,  { toValue: 1, tension: 50, friction: 9, useNativeDriver: true }),
      Animated.spring(statsAnim,   { toValue: 1, tension: 48, friction: 8, useNativeDriver: true }),
      Animated.timing(contentAnim, { toValue: 1, duration: 440,            useNativeDriver: true }),
      Animated.spring(guideAnim,   { toValue: 1, tension: 44, friction: 8, useNativeDriver: true }),
    ]).start();

    const loop = Animated.loop(Animated.sequence([
      Animated.timing(shimmer, { toValue: 1, duration: 2800, useNativeDriver: true }),
      Animated.timing(shimmer, { toValue: 0, duration: 2800, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, []);

  // Safe navigation helpers — tries multiple possible route names
  const goToProfil = () => {
    const routes = ['ProfilAdmin', 'Profil', 'Profile', 'MonProfil'];
    for (const r of routes) {
      try { navigation.navigate(r); return; } catch {}
    }
  };
  const goToNotifs = () => {
    const routes = ['NotificationsAdmin', 'AdminNotifications', 'Notifications', 'Notifs'];
    for (const r of routes) {
      try { navigation.navigate(r); return; } catch {}
    }
  };

  return (
    <AdminLayout activeTab="dashboard">
      <View style={{ flex: 1, backgroundColor: '#F8F7FF' }}>
        <StatusBar barStyle="light-content" />

        <ScrollView showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 100 : 90 }}>

          {/* ══ HERO HEADER ════════════════════════════════════════════════ */}
          <LinearGradient
            colors={['#1A0938', '#3B1478', '#4C1D95', '#1E1B4B']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ overflow: 'hidden', paddingBottom: 44 }}
          >
            {/* Background blobs */}
            {[
              { l: -70,     t: 20,  w: 280, h: 280, r: 140, c: '#7C3AED', o: 0.55 },
              { r: -50,     t: 50,  w: 220, h: 220, r: 110, c: '#06B6D4', o: 0.18 },
              { l: '32%',   b: -40, w: 240, h: 240, r: 120, c: '#A78BFA', o: 0.22 },
              { r: -10,     b: 30,  w: 160, h: 160, r: 80,  c: '#F59E0B', o: 0.12 },
            ].map((b, i) => (
              <View key={i} style={{
                position: 'absolute',
                left: b.l, right: b.r, top: b.t, bottom: b.b,
                width: b.w, height: b.h, borderRadius: b.r,
                backgroundColor: b.c, opacity: b.o,
              }} />
            ))}

            {/* Floating particles */}
            <FloatingParticle x={width * 0.12} y={90}  size={13} color="#FCD34D" duration={2400} delay={0}   />
            <FloatingParticle x={width * 0.72} y={55}  size={9}  color="#A78BFA" duration={3200} delay={600} />
            <FloatingParticle x={width * 0.48} y={130} size={7}  color="#6EE7B7" duration={2800} delay={300} />
            <FloatingParticle x={width * 0.86} y={170} size={11} color="#FCD34D" duration={3600} delay={900} />

            {/* ── Top bar ── */}
            <Animated.View style={{
              opacity: headerAnim,
              transform: [{ translateY: headerAnim.interpolate({ inputRange: [0,1], outputRange: [-22,0] }) }],
              paddingTop: Platform.OS === 'ios' ? 60 : 36,
              paddingHorizontal: 22,
              flexDirection: 'row',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: 36,
            }}>
              {/* Left */}
              <View style={{ flex: 1, paddingRight: 16 }}>
                {/* Animated status pill */}
                <Animated.View style={{
                  opacity: shimmer.interpolate({ inputRange: [0,0.5,1], outputRange: [0.70, 1, 0.70] }),
                  alignSelf: 'flex-start', marginBottom: 16,
                }}>
                  <View style={{
                    flexDirection: 'row', alignItems: 'center', gap: 7,
                    backgroundColor: 'rgba(52,211,153,0.18)',
                    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
                    borderWidth: 1, borderColor: 'rgba(52,211,153,0.35)',
                  }}>
                    <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#34D399' }} />
                    <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.88)', fontWeight: '600' }}>
                      Système actif · Administration
                    </Text>
                  </View>
                </Animated.View>

                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: '700', marginBottom: 8, letterSpacing: 1.5, textTransform: 'uppercase' }}>
                  Panneau administrateur
                </Text>
                <Text style={{ fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: -1.2, lineHeight: 38 }}>
                  Tableau de{'\n'}<Text style={{ color: '#FCD34D' }}>bord</Text>
                </Text>
              </View>

              {/* Right buttons */}
              <View style={{ gap: 10 }}>
                {/* Notifications button */}
                <TouchableOpacity onPress={goToNotifs} activeOpacity={0.75} style={{
                  width: 46, height: 46, borderRadius: 15,
                  backgroundColor: 'rgba(255,255,255,0.13)',
                  borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.22)',
                  justifyContent: 'center', alignItems: 'center',
                }}>
                  <Animated.View style={{ opacity: shimmer.interpolate({ inputRange: [0,0.5,1], outputRange: [0.75,1,0.75] }) }}>
                    <Feather name="bell" size={20} color="#fff" />
                  </Animated.View>
                  <View style={{
                    position: 'absolute', top: 8, right: 8,
                    width: 9, height: 9, borderRadius: 5,
                    backgroundColor: '#F87171', borderWidth: 2, borderColor: '#2D1B69',
                  }} />
                </TouchableOpacity>

                {/* Profile button — gold accent */}
                <TouchableOpacity onPress={goToProfil} activeOpacity={0.75} style={{
                  width: 46, height: 46, borderRadius: 15,
                  backgroundColor: 'rgba(252,211,77,0.22)',
                  borderWidth: 1.5, borderColor: 'rgba(252,211,77,0.45)',
                  justifyContent: 'center', alignItems: 'center',
                }}>
                  <Feather name="user" size={20} color="#FCD34D" />
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* ── Stats grid ── */}
            <Animated.View style={{
              opacity: statsAnim,
              transform: [{ translateY: statsAnim.interpolate({ inputRange: [0,1], outputRange: [22,0] }) }],
              paddingHorizontal: 22,
            }}>
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                <StatCard icon="users"       title="Enfants suivis"  value="—" sub="Données en direct"  color="#C4B5FD" delay={80}  />
                <StatCard icon="activity"    title="Consultations"   value="—" sub="Total enregistré"   color="#6EE7B7" delay={160} />
              </View>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <StatCard icon="trending-up" title="Nouveaux cas"    value="—" sub="Ce mois-ci"         color="#FCD34D" delay={240} />
                <StatCard icon="shield"      title="Médecins actifs" value="—" sub="En service"         color="#93C5FD" delay={320} />
              </View>
            </Animated.View>

          </LinearGradient>

          {/* ══ NAVIGATION ═════════════════════════════════════════════════ */}
          <Animated.View style={{
            opacity: contentAnim,
            transform: [{ translateY: contentAnim.interpolate({ inputRange: [0,1], outputRange: [28,0] }) }],
            paddingHorizontal: 22, marginTop: 30,
          }}>
            <SLabel tag="NAVIGATION" title="Sections principales" sub="Accédez directement aux modules de la plateforme" />
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
              <NavCard icon="users"      title="Comptes"        subtitle="Médecins & parents"   color="#7C3AED" bg="#EDE9FE" delay={80}  onPress={() => navigation.navigate('Comptes')} />
              <NavCard icon="bar-chart-2"title="Statistiques"   subtitle="Indicateurs & données" color="#0EA5E9" bg="#E0F2FE" delay={160} onPress={() => navigation.navigate('Statistiques')} />
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <NavCard icon="grid"       title="Activités"      subtitle="Thérapeutiques"       color="#10B981" bg="#D1FAE5" delay={240} onPress={() => navigation.navigate('Activites')} />
              <NavCard icon="bell"       title="Notifications"  subtitle="Alertes système"      color="#F59E0B" bg="#FEF3C7" delay={320} onPress={goToNotifs} />
            </View>
          </Animated.View>

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: 'rgba(139,92,246,0.08)', marginHorizontal: 22, marginTop: 30, marginBottom: 30 }} />

          {/* ══ GUIDE ══════════════════════════════════════════════════════ */}
          <Animated.View style={{
            opacity: guideAnim,
            transform: [{ translateY: guideAnim.interpolate({ inputRange: [0,1], outputRange: [24,0] }) }],
            paddingHorizontal: 22,
          }}>
            <SLabel tag="GUIDE D'UTILISATION" title="Comment démarrer ?" sub="Suivez ces étapes pour bien configurer SafeKids." />
            <View style={{ position: 'relative' }}>
              <View style={{ position: 'absolute', left: 25, top: 25, bottom: 25, width: 2, backgroundColor: 'rgba(139,92,246,0.10)' }} />
              {GUIDE_STEPS.map((item, i) => (
                <StepCard key={i} item={item} delay={i * 80} navigation={navigation} />
              ))}
            </View>
          </Animated.View>

          {/* ══ FOOTER ═════════════════════════════════════════════════════ */}
          <View style={{ alignItems: 'center', paddingHorizontal: 22, paddingTop: 4, paddingBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 18, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(139,92,246,0.10)' }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#34D399' }} />
              <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '600' }}>SafeKids Admin · v2.1.0 · © 2026</Text>
            </View>
          </View>

        </ScrollView>
      </View>
    </AdminLayout>
  );
}