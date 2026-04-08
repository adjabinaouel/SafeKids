// src/pages/parents/HomeScreen/HomeScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, Image, TouchableOpacity, ScrollView,
  StatusBar, Animated, Dimensions, Alert, Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ParentLayout from '../../../components/Navigation/ParentNavigation';
import GlassCard   from '../../../components/UI/GlassCard';
import GlassPill   from '../../../components/UI/GlassPill';
import GlassButton from '../../../components/UI/GlassButton';
import { COLORS, GLASS, gradients, shadow } from '../../../theme';

// ✅ Même SERVER_URL que ProfileScreen
const SERVER_URL = 'https://unfailed-branden-healable.ngrok-free.dev';

const { width } = Dimensions.get('window');

// ── Guide steps ───────────────────────────────────────────────────────────────
const GUIDE_STEPS = [
  { id: 1, done: false, icon: 'play-circle',  title: 'Découvrir les activités',  desc: 'Explorez + de 500 activités éducatives adaptées à chaque âge.',   screen: 'Activities', tag: 'COMMENCER'     },
  { id: 2, done: false, icon: 'calendar',     title: 'Planifier les séances',    desc: 'Créez un planning hebdomadaire pour des sessions régulières.',     screen: 'Schedule',   tag: 'ORGANISATION'  },
  { id: 3, done: false, icon: 'bar-chart-2',  title: 'Suivre la progression',    desc: 'Visualisez les progrès et statistiques de développement.',        screen: 'Progress',   tag: 'ANALYSE'       },
  { id: 4, done: false, icon: 'bell',         title: 'Activer les alertes',      desc: 'Notifications intelligentes sur les progrès de votre enfant.',    screen: 'Settings',   tag: 'NOTIFICATIONS' },
];

// ── MockupCard ────────────────────────────────────────────────────────────────
const MockupCard = ({ icon, title, value, sub, color, delay }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: 1, tension: 50, friction: 8, delay, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={{
      opacity: anim,
      transform: [
        { scale: anim },
        { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) },
      ],
      width: (width - 56) / 2,
    }}>
      <GlassCard variant="hero" borderRadius={20} style={{ padding: 16 }}>
        <View style={{
          width: 40, height: 40, borderRadius: 14,
          backgroundColor: GLASS.hero.bg,
          borderWidth: 1, borderColor: GLASS.hero.border,
          justifyContent: 'center', alignItems: 'center',
          marginBottom: 12,
        }}>
          <Feather name={icon} size={18} color={color} />
        </View>
        <Text style={{ fontSize: 23, fontWeight: '800', color: '#fff', letterSpacing: -0.6 }}>{value}</Text>
        <Text style={{ fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.9)', marginTop: 2 }}>{title}</Text>
        <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.52)', marginTop: 2 }}>{sub}</Text>
      </GlassCard>
    </Animated.View>
  );
};

// ── FeatureCard ───────────────────────────────────────────────────────────────
const FeatureCard = ({ icon, title, desc, color, bg }) => (
  <GlassCard variant="light" borderRadius={22} style={{ width: (width - 56) / 2, padding: 18 }}>
    <View style={{
      width: 48, height: 48, borderRadius: 16,
      backgroundColor: bg,
      borderWidth: 1, borderColor: color + '22',
      justifyContent: 'center', alignItems: 'center',
      marginBottom: 12,
    }}>
      <Feather name={icon} size={21} color={color} />
    </View>
    <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 4 }}>{title}</Text>
    <Text style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 17 }}>{desc}</Text>
  </GlassCard>
);

// ── StepCard ──────────────────────────────────────────────────────────────────
const StepCard = ({ step, index, onToggle, onPress }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 450, delay: 100 + index * 90, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={{
      opacity:   anim,
      transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
      marginBottom: 10,
    }}>
      <GlassCard
        variant="light"
        pressable
        onPress={() => onPress(step.screen)}
        borderRadius={20}
        style={{
          borderColor: step.done ? COLORS.primary + '38' : GLASS.light.border,
          ...Platform.select({
            ios: {
              shadowColor:   step.done ? COLORS.primary : GLASS.light.shadow,
              shadowOffset:  { width: 0, height: step.done ? 10 : 4 },
              shadowOpacity: step.done ? 0.22 : 1,
              shadowRadius:  step.done ? 24 : 14,
            },
          }),
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 }}>
          <LinearGradient
            colors={step.done ? ['#7C3AED', '#9D68F5'] : ['rgba(248,250,252,0.9)', 'rgba(241,245,249,0.9)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{
              width: 50, height: 50, borderRadius: 16,
              justifyContent: 'center', alignItems: 'center', flexShrink: 0,
              borderWidth: 1,
              borderColor: step.done ? 'rgba(255,255,255,0.3)' : GLASS.light.border,
            }}
          >
            <Feather name={step.icon} size={21} color={step.done ? '#fff' : COLORS.textMuted} />
          </LinearGradient>

          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 14, fontWeight: '700',
              color: step.done ? COLORS.primary : COLORS.text, marginBottom: 3,
            }}>
              {step.title}
            </Text>
            <Text style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 17 }}>{step.desc}</Text>
            <View style={{
              backgroundColor: step.done ? COLORS.primaryMid : GLASS.light.bg,
              borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
              alignSelf: 'flex-start', marginTop: 7,
              borderWidth: 1,
              borderColor: step.done ? COLORS.primary + '28' : GLASS.light.border,
            }}>
              <Text style={{
                fontSize: 9, fontWeight: '800',
                color: step.done ? COLORS.primary : COLORS.textMuted,
                letterSpacing: 0.7,
              }}>
                {step.done ? '✓  COMPLÉTÉ' : step.tag}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => onToggle(step.id)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={{
              width: 28, height: 28, borderRadius: 14, flexShrink: 0,
              backgroundColor: step.done ? COLORS.primary : GLASS.light.bg,
              borderWidth: 2,
              borderColor: step.done ? COLORS.primary : COLORS.border,
              justifyContent: 'center', alignItems: 'center',
            }}
          >
            {step.done && <Feather name="check" size={14} color="#fff" />}
          </TouchableOpacity>
        </View>
      </GlassCard>
    </Animated.View>
  );
};

// ── ÉCRAN PRINCIPAL ───────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  // ✅ userData aligné sur ProfileScreen : prenom, nom, email, avatar
  const [userData, setUserData] = useState({ prenom: '', nom: '', email: '', avatar: null });
  const [steps, setSteps]       = useState(GUIDE_STEPS);
  const [greeting, setGreeting] = useState('Bonjour');
  const [loading, setLoading]   = useState(true);

  const heroAnim    = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  const doneCount   = steps.filter(s => s.done).length;
  const progressPct = (doneCount / steps.length) * 100;

  useEffect(() => {
    loadUserData();
    loadGuideSteps();

    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir');

    Animated.stagger(200, [
      Animated.spring(heroAnim,    { toValue: 1, tension: 55, friction: 8, useNativeDriver: true }),
      Animated.timing(contentAnim, { toValue: 1, duration: 600,            useNativeDriver: true }),
    ]).start();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ✅ Logique identique à ProfileScreen.loadUserProfile()
  const loadUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');

      if (!token) {
        Alert.alert("Session expirée", "Veuillez vous reconnecter.");
        navigation.navigate('Login');
        return;
      }

      const response = await fetch(`${SERVER_URL}/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          Alert.alert("Session expirée", "Veuillez vous reconnecter.");
          navigation.navigate('Login');
        } else {
          Alert.alert("Erreur", data.message || "Impossible de charger le profil");
        }
        return;
      }

      // ✅ Même mapping de champs que ProfileScreen
      setUserData({
        prenom: data.prenom || 'Parent',
        nom:    data.nom    || '',
        email:  data.email  || '',
        avatar: null, // avatar géré localement via AsyncStorage
      });

    } catch (error) {
      console.error('Erreur chargement utilisateur:', error);
      Alert.alert("Erreur", "Impossible de charger votre profil. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  const loadGuideSteps = async () => {
    try {
      const savedSteps = await AsyncStorage.getItem('guideSteps');
      if (savedSteps) setSteps(JSON.parse(savedSteps));
    } catch (e) {}
  };

  const toggleStep = async (id) => {
    const updated = steps.map(s => s.id === id ? { ...s, done: !s.done } : s);
    setSteps(updated);
    await AsyncStorage.setItem('guideSteps', JSON.stringify(updated));
  };

  const resetGuide = () => {
    Alert.alert('Réinitialiser', 'Remettre toutes les étapes à zéro ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Réinitialiser', style: 'destructive', onPress: async () => {
        const reset = GUIDE_STEPS.map(s => ({ ...s, done: false }));
        setSteps(reset);
        await AsyncStorage.setItem('guideSteps', JSON.stringify(reset));
      }},
    ]);
  };

  if (loading) {
    return (
      <ParentLayout activeTab="home">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 10, color: COLORS.textMuted }}>Chargement du profil...</Text>
        </View>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout activeTab="home">
      <View style={{ flex: 1, backgroundColor: COLORS.white }}>
        <StatusBar barStyle="light-content" />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>

          {/* ══ HERO ══════════════════════════════════════════════════════════ */}
          <LinearGradient
            colors={gradients.heroAlt}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1.3 }}
            style={{ overflow: 'hidden', paddingBottom: 36 }}
          >
            {/* Blobs décoratifs */}
            {[
              { left: -90,          top: 40,     w: 320, h: 320, r: 160, color: '#6D28D9', op: 0.45, sx: 1.5 },
              { right: -50,         top: 80,     w: 240, h: 240, r: 120, color: '#10B981', op: 0.13 },
              { left: 30,           bottom: -20, w: 200, h: 200, r: 100, color: '#F59E0B', op: 0.11 },
              { right: -20,         bottom: 40,  w: 180, h: 180, r: 90,  color: '#3B82F6', op: 0.15 },
              { left: width * 0.35, top: 60,     w: 220, h: 220, r: 110, color: '#A78BFA', op: 0.20 },
            ].map((b, i) => (
              <View key={i} style={{
                position: 'absolute',
                left: b.left, right: b.right, top: b.top, bottom: b.bottom,
                width: b.w, height: b.h, borderRadius: b.r,
                backgroundColor: b.color, opacity: b.op,
                ...(b.sx ? { transform: [{ scaleX: b.sx }] } : {}),
              }} />
            ))}

            {/* Top bar */}
            <Animated.View style={{
              opacity:   heroAnim,
              transform: [{ translateY: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] }) }],
              paddingTop: Platform.OS === 'ios' ? 58 : 34,
              paddingHorizontal: 22,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 32,
            }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.62)', fontWeight: '500' }}>
                  {greeting} 👋
                </Text>
                {/* ✅ Prénom + Nom récupérés du backend */}
                <Text style={{ fontSize: 27, fontWeight: '800', color: '#fff', marginTop: 3, letterSpacing: -0.8, lineHeight: 33 }}>
                  {userData.prenom}{'\n'}{userData.nom}
                </Text>
                <GlassPill
                  variant="hero"
                  dot
                  dotColor="#34D399"
                  label="Compte actif · Parent"
                  style={{ marginTop: 12 }}
                />
              </View>

              {/* Avatar — tappable vers Profile */}
              <TouchableOpacity
                onPress={() => navigation?.navigate('Profile')}
                activeOpacity={0.82}
                style={{
                  width: 56, height: 56, borderRadius: 28,
                  backgroundColor: GLASS.hero.bg,
                  borderWidth: 2, borderColor: GLASS.hero.border,
                  overflow: 'hidden',
                  justifyContent: 'center', alignItems: 'center',
                  ...shadow(GLASS.hero.shadow, 8, 1, 18, 6),
                }}
              >
                {userData.avatar
                  ? <Image source={{ uri: userData.avatar }} style={{ width: 56, height: 56 }} />
                  : <Ionicons name="person" size={26} color="rgba(255,255,255,0.92)" />
                }
              </TouchableOpacity>
            </Animated.View>

            {/* Mockup cards */}
            <Animated.View style={{
              opacity:   heroAnim,
              transform: [{ scale: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [0.93, 1] }) }],
              paddingHorizontal: 22,
            }}>
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                <MockupCard icon="grid"        title="Activités"   value="500+" sub="Disponibles"  color="#C4B5FD" delay={100} />
                <MockupCard icon="trending-up" title="Progression" value="98%"  sub="Satisfaction" color="#6EE7B7" delay={200} />
              </View>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <MockupCard icon="users" title="Familles" value="50k+" sub="Utilisateurs" color="#93C5FD" delay={300} />
                <MockupCard icon="star"  title="Note"     value="4.9★" sub="App Store"    color="#FCD34D" delay={400} />
              </View>
            </Animated.View>
          </LinearGradient>

          {/* ══ SECTION 1 — GUIDE PROGRESS ══════════════════════════════════ */}
          <Animated.View style={{ opacity: contentAnim }}>
            <View style={{ paddingHorizontal: 22, marginTop: -20 }}>
              <GlassCard variant="light" borderRadius={24} style={{
                ...shadow(COLORS.primary, 14, 0.16, 26, 10),
              }}>
                <LinearGradient
                  colors={gradients.card}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={{ borderRadius: 24, padding: 22, overflow: 'hidden' }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 4 }}>
                        Guide de démarrage
                      </Text>
                      <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.58)' }}>
                        {doneCount === steps.length
                          ? '🎉 Tout est configuré !'
                          : `${steps.length - doneCount} étape${steps.length - doneCount > 1 ? 's' : ''} restante${steps.length - doneCount > 1 ? 's' : ''}`}
                      </Text>
                    </View>
                    <View style={{
                      width: 52, height: 52, borderRadius: 26,
                      backgroundColor: GLASS.dark.bg,
                      borderWidth: 2,
                      borderColor: progressPct === 100 ? '#10B981' : GLASS.dark.border,
                      justifyContent: 'center', alignItems: 'center',
                    }}>
                      <Text style={{ fontSize: 12, fontWeight: '800', color: '#fff' }}>
                        {Math.round(progressPct)}%
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 18 }}>
                    {steps.map((s) => (
                      <View key={s.id} style={{
                        flex: 1, height: 5, borderRadius: 3,
                        backgroundColor: s.done
                          ? (progressPct === 100 ? '#10B981' : '#C4B5FD')
                          : GLASS.dark.bg,
                        borderWidth: s.done ? 0 : 1,
                        borderColor: GLASS.dark.border,
                      }} />
                    ))}
                  </View>
                </LinearGradient>
              </GlassCard>
            </View>

            {/* ══ SECTION 2 — POURQUOI SAFEKIDS ════════════════════════════ */}
            <View style={{ paddingTop: 52, paddingBottom: 36, backgroundColor: COLORS.white, overflow: 'hidden' }}>
              <View style={{ position: 'absolute', left: -100, top: 0,    width: 280, height: 280, borderRadius: 140, backgroundColor: '#EDE9FE', opacity: 0.5,  transform: [{ scaleX: 1.3 }] }} />
              <View style={{ position: 'absolute', right: -80, bottom: 0, width: 220, height: 220, borderRadius: 110, backgroundColor: '#DDD6FE', opacity: 0.35 }} />

              <GlassPill variant="primary" label="POURQUOI SAFEKIDS ?" style={{ alignSelf: 'center', marginBottom: 10 }} />
              <Text style={{ textAlign: 'center', fontSize: 23, fontWeight: '800', color: COLORS.text, letterSpacing: -0.6, paddingHorizontal: 24, lineHeight: 30 }}>
                Une app qui fait{'\n'}
                <Text style={{ color: COLORS.primary }}>vraiment la différence</Text>
              </Text>
              <Text style={{ textAlign: 'center', fontSize: 13, color: COLORS.textMuted, marginTop: 8, marginBottom: 30, paddingHorizontal: 32, lineHeight: 20 }}>
                Tout ce dont les parents ont besoin pour accompagner leur enfant au quotidien.
              </Text>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 22 }}>
                <FeatureCard icon="shield"      title="Sécurisé"    desc="Données protégées"  color={COLORS.primary} bg={COLORS.primaryMid}   />
                <FeatureCard icon="zap"         title="Intelligent" desc="IA adaptative"       color="#0EA5E9"        bg="#E0F2FE"             />
                <FeatureCard icon="award"       title="Certifié"    desc="Validé par experts" color={COLORS.success} bg={COLORS.successLight} />
                <FeatureCard icon="trending-up" title="Efficace"    desc="+40% de progrès"    color={COLORS.warning} bg="#FEF3C7"             />
              </View>

              <View style={{ alignItems: 'center', marginTop: 32 }}>
                <GlassButton
                  variant="primary"
                  size="md"
                  label="Explorer les activités →"
                  onPress={() => navigation?.navigate('Activities')}
                />
              </View>
            </View>

            {/* ══ SECTION 3 — GUIDE ÉTAPES ═════════════════════════════════ */}
            <View style={{ backgroundColor: COLORS.surface, paddingTop: 48, paddingHorizontal: 22, paddingBottom: 44, overflow: 'hidden' }}>
              <View style={{ position: 'absolute', right: -60, top: 60, width: 200, height: 200, borderRadius: 100, backgroundColor: '#EDE9FE', opacity: 0.4 }} />

              <GlassPill variant="primary" label="GUIDE PARENT" style={{ marginBottom: 10 }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 26 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 23, fontWeight: '800', color: COLORS.text, letterSpacing: -0.6, lineHeight: 29 }}>
                    Comment bien{'\n'}démarrer ?
                  </Text>
                  <Text style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 6, lineHeight: 19 }}>
                    Configurez SafeKids en quelques minutes.
                  </Text>
                </View>
                <GlassButton
                  variant="secondary"
                  size="sm"
                  label="Réinitialiser"
                  onPress={resetGuide}
                  style={{ paddingHorizontal: 14 }}
                />
              </View>

              {steps.map((step, i) => (
                <StepCard
                  key={step.id}
                  step={step}
                  index={i}
                  onToggle={toggleStep}
                  onPress={(screen) => navigation?.navigate(screen)}
                />
              ))}

              {progressPct === 100 && (
                <GlassCard variant="light" borderRadius={22} style={{ marginTop: 8, overflow: 'hidden' }}>
                  <LinearGradient
                    colors={gradients.success}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={{ padding: 26, alignItems: 'center' }}
                  >
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.35)' }} />
                    <Text style={{ fontSize: 32, marginBottom: 8 }}>🎉</Text>
                    <Text style={{ fontSize: 17, fontWeight: '800', color: '#fff', textAlign: 'center' }}>
                      Configuration terminée !
                    </Text>
                    <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', textAlign: 'center', marginTop: 6, lineHeight: 20 }}>
                      SafeKids est prêt. Profitez de toutes les fonctionnalités !
                    </Text>
                  </LinearGradient>
                </GlassCard>
              )}
            </View>

            {/* ══ SECTION 4 — PREMIUM ══════════════════════════════════════ */}
            <View style={{ paddingHorizontal: 22, paddingTop: 32, backgroundColor: COLORS.white }}>
              <GlassCard variant="dark" borderRadius={28} style={{ overflow: 'hidden' }}>
                <LinearGradient
                  colors={gradients.premium}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={{ padding: 28, overflow: 'hidden' }}
                >
                  <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: GLASS.dark.shimmer }} />
                  <View style={{ position: 'absolute', right: -30, top: -30, width: 160, height: 160, borderRadius: 80, backgroundColor: GLASS.dark.bg }} />
                  <View style={{ position: 'absolute', left: -20, bottom: -20, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.03)' }} />

                  <GlassPill
                    variant="gold"
                    icon={<Feather name="star" size={12} color="#FCD34D" />}
                    label="PREMIUM"
                    style={{ marginBottom: 18 }}
                  />
                  <Text style={{ fontSize: 24, fontWeight: '800', color: '#fff', letterSpacing: -0.6, lineHeight: 32, marginBottom: 10 }}>
                    Tout débloquer{'\n'}pour votre enfant
                  </Text>
                  <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.52)', lineHeight: 20, marginBottom: 22 }}>
                    Activités illimitées, rapports détaillés, suivi multi-enfants et support prioritaire.
                  </Text>

                  {['Activités illimitées', 'Rapports détaillés', 'Support prioritaire 24/7'].map((item, i) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <View style={{
                        width: 20, height: 20, borderRadius: 10,
                        backgroundColor: 'rgba(253,211,77,0.16)',
                        borderWidth: 1, borderColor: 'rgba(253,211,77,0.32)',
                        justifyContent: 'center', alignItems: 'center',
                      }}>
                        <Feather name="check" size={10} color="#FCD34D" />
                      </View>
                      <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.78)', fontWeight: '500' }}>{item}</Text>
                    </View>
                  ))}

                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
                    <GlassButton
                      variant="gold"
                      label="Passer Premium"
                      icon={<Feather name="star" size={15} color="#1E1B4B" />}
                      onPress={() => navigation?.navigate('Premium')}
                      style={{ flex: 1 }}
                      labelStyle={{ color: '#1E1B4B' }}
                    />
                    <GlassButton
                      variant="ghost"
                      bg="dark"
                      iconRight={<Feather name="arrow-right" size={18} color="rgba(255,255,255,0.55)" />}
                      style={{ paddingHorizontal: 18, height: 54 }}
                    />
                  </View>
                </LinearGradient>
              </GlassCard>
            </View>

            {/* ══ SECTION 5 — À PROPOS ═════════════════════════════════════ */}
            <View style={{ paddingHorizontal: 22, paddingTop: 32, backgroundColor: COLORS.white }}>
              <GlassCard variant="light" borderRadius={26} style={{
                ...shadow(COLORS.primary, 8, 0.08, 24, 4),
                overflow: 'hidden',
              }}>
                <LinearGradient
                  colors={[COLORS.primaryLight, 'rgba(255,255,255,0.82)']}
                  style={{ padding: 22, paddingBottom: 18 }}
                >
                  <GlassPill variant="primary" label="À PROPOS DE SAFEKIDS" style={{ marginBottom: 10 }} />
                  <Text style={{ fontSize: 20, fontWeight: '800', color: COLORS.text, letterSpacing: -0.4, lineHeight: 27 }}>
                    Design simple et{'\n'}
                    <Text style={{ color: COLORS.primary }}>interface moderne</Text>
                  </Text>
                  <Text style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 8, lineHeight: 20 }}>
                    Une plateforme pensée pour les parents, simple à utiliser au quotidien.
                  </Text>
                </LinearGradient>

                <View style={{ paddingHorizontal: 22, paddingBottom: 22 }}>
                  {[
                    { icon: 'check-circle', color: COLORS.primary, text: 'Soigneusement conçue pour les familles'    },
                    { icon: 'check-circle', color: '#0EA5E9',       text: 'Synchronisation en temps réel'            },
                    { icon: 'check-circle', color: COLORS.success,  text: "Accès aux activités depuis n'importe où" },
                    { icon: 'check-circle', color: COLORS.warning,  text: 'Support disponible 24h/24, 7j/7'         },
                  ].map((item, i) => (
                    <View key={i} style={{
                      flexDirection: 'row', alignItems: 'flex-start', gap: 12,
                      paddingVertical: 12,
                      borderBottomWidth: i < 3 ? 1 : 0,
                      borderBottomColor: GLASS.light.border,
                    }}>
                      <Feather name={item.icon} size={17} color={item.color} style={{ marginTop: 1 }} />
                      <Text style={{ fontSize: 13, color: COLORS.text, fontWeight: '500', flex: 1, lineHeight: 20 }}>{item.text}</Text>
                    </View>
                  ))}

                  <GlassButton
                    variant="secondary"
                    label="Configurer mon compte"
                    icon={<Feather name="settings" size={16} color={COLORS.primary} />}
                    onPress={() => navigation?.navigate('Settings')}
                    fullWidth
                    style={{ marginTop: 18, borderColor: COLORS.primary + '28' }}
                    labelStyle={{ color: COLORS.primary }}
                  />
                </View>
              </GlassCard>
            </View>

            {/* Footer */}
            <View style={{ alignItems: 'center', paddingTop: 32, paddingBottom: 6 }}>
              <GlassCard variant="light" borderRadius={20} style={{ paddingHorizontal: 18, paddingVertical: 10, alignItems: 'center', gap: 3 }}>
                <Text style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: '500' }}>SafeKids v2.1.0 · © 2026</Text>
                <Text style={{ fontSize: 11, color: COLORS.textMuted + '70' }}>Conçu avec ❤️ pour les familles</Text>
              </GlassCard>
            </View>

          </Animated.View>
        </ScrollView>
      </View>
    </ParentLayout>
  );
}