// src/pages/admin/DashboardScreen/DashboardScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StatusBar, Animated, Dimensions, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AdminLayout from '../../../components/Navigation/AdminNavigation';
import { COLORS, GLASS, gradients, shadow } from '../../../theme';
import S from './DashboardStyles';

const { width } = Dimensions.get('window');

// ── KPI Data ──────────────────────────────────────────────────────────────────
const KPI_DATA = [
  { label: 'Total Enfants Suivis',  val: '1,240', icon: 'users',       highlight: false, badge: '+18 ce mois', color: '#8B5CF6' },
  { label: 'Total Consultations',   val: '3,450', icon: 'activity',    highlight: false, badge: '+124',        color: '#0EA5E9' },
  { label: 'Nouveaux Cas (Mois)',    val: '+45',   icon: 'trending-up', highlight: true,  badge: '+12%',        color: '#fff'    },
  { label: 'Anciens Cas',           val: '1,195', icon: 'archive',     highlight: false, badge: null,          color: '#10B981' },
];

// ── Répartition genre ─────────────────────────────────────────────────────────
const GENRE_DATA = [
  { label: 'Garçons (52%)', pct: 52, val: '645', color: '#6D28D9' },
  { label: 'Filles (48%)',  pct: 48, val: '595', color: '#EC4899' },
];

// ── Activités récentes ────────────────────────────────────────────────────────
const RECENT = [
  { initials: 'LB', color: '#8B5CF6', name: 'Nouveau dossier créé',   sub: "Leo B. · Affecté à Dr. Dupont",      badge: 'Il y a 2h',  badgeBg: '#EDE9FE', badgeColor: '#6D28D9' },
  { initials: 'MM', color: '#0EA5E9', name: 'Bilan validé',            sub: 'Sara M. · Par Mme. Martin',          badge: 'Il y a 3h',  badgeBg: '#E0F2FE', badgeColor: '#0284C7' },
  { initials: 'KM', color: '#10B981', name: 'Séance programmée',       sub: 'Dr. Karim · Enfant Meziane',         badge: 'Hier',       badgeBg: '#D1FAE5', badgeColor: '#065F46' },
  { initials: 'YB', color: '#F59E0B', name: 'Rapport mensuel',         sub: 'Yacine B. · En attente validation',  badge: 'Il y a 2j',  badgeBg: '#FEF3C7', badgeColor: '#92400E' },
  { initials: 'SB', color: '#EF4444', name: 'Parent inscrit',          sub: 'Sara Benali · Alger',                badge: 'Il y a 3j',  badgeBg: '#FEE2E2', badgeColor: '#B91C1C' },
];

// ── Raccourcis ────────────────────────────────────────────────────────────────
const QUICK = [
  { label: '+ Médecin',  icon: 'user-plus',  color: '#4C1D95', dest: 'AdminComptes',   params: { openCreate: 'doctor'  } },
  { label: '+ Parent',   icon: 'users',      color: '#1D4ED8', dest: 'AdminComptes',   params: { openCreate: 'parent'  } },
  { label: '+ Activité', icon: 'grid',       color: '#065F46', dest: 'AdminActivites', params: { openCreate: true      } },
];

// ── MiniStat (cartes hero animées) ────────────────────────────────────────────
const MiniStat = ({ icon, title, value, sub, color, delay }) => {
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
      <View style={S.miniStatCard}>
        <View style={[S.miniStatIconWrap, { borderColor: color + '44' }]}>
          <Feather name={icon} size={18} color={color} />
        </View>
        <Text style={S.miniStatValue}>{value}</Text>
        <Text style={S.miniStatTitle}>{title}</Text>
        <Text style={S.miniStatSub}>{sub}</Text>
      </View>
    </Animated.View>
  );
};

// ── BarChart simplifié (Nouveaux vs Anciens) ──────────────────────────────────
const BarChart = () => {
  const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
  const NEW_DATA  = [28, 35, 40, 38, 45, 42];
  const OLD_DATA  = [80, 95, 110, 105, 120, 115];
  const maxVal = Math.max(...OLD_DATA);
  const barH = 80;
  const anims = useRef(NEW_DATA.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(60, anims.map(a =>
      Animated.spring(a, { toValue: 1, tension: 60, friction: 10, useNativeDriver: false })
    )).start();
  }, []);

  return (
    <View style={S.chartWrap}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: barH, paddingHorizontal: 4 }}>
        {MONTHS.map((m, i) => (
          <View key={m} style={{ alignItems: 'center', flex: 1, gap: 3 }}>
            {/* Anciens (fond) */}
            <Animated.View style={{
              width: 10, borderRadius: 5,
              backgroundColor: 'rgba(139,92,246,0.15)',
              height: anims[i].interpolate({ inputRange: [0, 1], outputRange: [0, (OLD_DATA[i] / maxVal) * barH] }),
              position: 'absolute', bottom: 0,
            }} />
            {/* Nouveaux (avant) */}
            <Animated.View style={{
              width: 10, borderRadius: 5,
              backgroundColor: '#8B5CF6',
              height: anims[i].interpolate({ inputRange: [0, 1], outputRange: [0, (NEW_DATA[i] / maxVal) * barH] }),
              position: 'absolute', bottom: 0,
            }} />
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, paddingHorizontal: 4 }}>
        {MONTHS.map(m => <Text key={m} style={S.chartLabel}>{m}</Text>)}
      </View>
    </View>
  );
};

// ── LineChart simplifié (Évolution) ──────────────────────────────────────────
const LineChart = () => {
  const DATA   = [20, 32, 28, 45, 38, 55, 48, 62, 58, 70, 65, 80];
  const MONTHS = ['Jan','Fév','Mar','Avr','Mai','Juin','Jul','Aoû','Sep','Oct','Nov','Déc'];
  const chartW = width - 96;
  const chartH = 90;
  const maxV   = Math.max(...DATA);
  const pts    = DATA.map((v, i) => ({
    x: (i / (DATA.length - 1)) * chartW,
    y: chartH - (v / maxV) * chartH,
  }));
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaD = `${pathD} L${pts[pts.length-1].x} ${chartH} L0 ${chartH} Z`;
  const anim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: false }).start();
  }, []);

  return (
    <View style={{ paddingHorizontal: 4 }}>
      <View style={{ height: chartH + 16 }}>
        <svg width={chartW} height={chartH + 4} style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill="url(#lg)" />
          <path d={pathD} fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {pts.map((p, i) => i % 3 === 0 && (
            <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#8B5CF6" />
          ))}
        </svg>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
        {['Jan','Mar','Mai','Juil','Sep','Nov'].map(m => (
          <Text key={m} style={S.chartLabel}>{m}</Text>
        ))}
      </View>
    </View>
  );
};

// ─── ÉCRAN PRINCIPAL ──────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const navigation = useNavigation();
  const heroAnim    = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  const barAnims = useRef(GENRE_DATA.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(200, [
      Animated.spring(heroAnim,    { toValue: 1, tension: 55, friction: 8, useNativeDriver: true }),
      Animated.timing(contentAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();

    Animated.stagger(120, barAnims.map(a =>
      Animated.spring(a, { toValue: 1, tension: 60, friction: 10, useNativeDriver: false })
    )).start();
  }, []);

  return (
    <AdminLayout activeTab="dashboard">
      <View style={S.root}>
        <StatusBar barStyle="light-content" />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.scrollContent}>

          {/* ══ HERO ══════════════════════════════════════════════════════════ */}
          <LinearGradient
            colors={['#4C1D95', '#1E1B4B']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1.3 }}
            style={{ overflow: 'hidden', paddingBottom: 36 }}
          >
            {/* Blobs déco — identiques au HomeScreen */}
            {[
              { left: -90,        top: 40,      w: 320, h: 320, r: 160, color: '#6D28D9', op: 0.45, sx: 1.5 },
              { right: -50,       top: 80,      w: 240, h: 240, r: 120, color: '#10B981', op: 0.13 },
              { left: 30,         bottom: -20,  w: 200, h: 200, r: 100, color: '#F59E0B', op: 0.11 },
              { right: -20,       bottom: 40,   w: 180, h: 180, r: 90,  color: '#3B82F6', op: 0.15 },
              { left: width*0.35, top: 60,      w: 220, h: 220, r: 110, color: '#A78BFA', op: 0.20 },
            ].map((b, i) => (
              <View key={i} style={{
                position: 'absolute',
                left: b.left, right: b.right,
                top: b.top, bottom: b.bottom,
                width: b.w, height: b.h, borderRadius: b.r,
                backgroundColor: b.color, opacity: b.op,
                ...(b.sx ? { transform: [{ scaleX: b.sx }] } : {}),
              }} />
            ))}

            {/* Top bar */}
            <Animated.View style={{
              opacity: heroAnim,
              transform: [{ translateY: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] }) }],
              paddingTop: Platform.OS === 'ios' ? 58 : 34,
              paddingHorizontal: 22,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 28,
            }}>
              <View style={{ flex: 1 }}>
                <Text style={S.heroGreeting}>Panneau administrateur 👋</Text>
                <Text style={S.heroTitle}>
                  Tableau de <Text style={S.heroAccent}>bord</Text>
                </Text>
                {/* Pill statut */}
                <View style={S.heroPill}>
                  <View style={S.heroPillDot} />
                  <Text style={S.heroPillText}>Administration Centrale · En ligne</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity style={S.heroIconBtn}
                  onPress={() => navigation.navigate('AdminNotifications')}>
                  <Feather name="bell" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={S.heroIconBtn}
                  onPress={() => navigation.navigate('AdminProfil')}>
                  <Feather name="user" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Mockup cards 2×2 */}
            <Animated.View style={{
              opacity: heroAnim,
              transform: [{ scale: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [0.93, 1] }) }],
              paddingHorizontal: 22,
            }}>
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                <MiniStat icon="users"       title="Enfants suivis"  value="1,240" sub="Total inscrits"   color="#C4B5FD" delay={100} />
                <MiniStat icon="activity"    title="Consultations"   value="3,450" sub="Toutes périodes"  color="#6EE7B7" delay={200} />
              </View>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <MiniStat icon="trending-up" title="Nouveaux cas"    value="+45"   sub="Ce mois · +12%"   color="#FCD34D" delay={300} />
                <MiniStat icon="archive"     title="Anciens cas"     value="1,195" sub="Actifs"           color="#93C5FD" delay={400} />
              </View>
            </Animated.View>
          </LinearGradient>

          <Animated.View style={{ opacity: contentAnim }}>

            {/* ══ KPI CARDS (flottant sur hero) ════════════════════════════ */}
            <View style={{ paddingHorizontal: 22, marginTop: -20 }}>
              <View style={S.kpiCard}>
                <LinearGradient
                  colors={['#4C1D95', '#3B0764']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={S.kpiGradient}
                >
                  {/* shimmer */}
                  <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: GLASS.dark.shimmer }} />
                  {/* orb */}
                  <View style={{ position: 'absolute', right: -18, top: -18, width: 120, height: 120, borderRadius: 60, backgroundColor: GLASS.dark.bg }} />

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                      <Text style={S.kpiSuperTitle}>Statistiques globales</Text>
                      <Text style={S.kpiTitle}>Vue d'ensemble</Text>
                    </View>
                    <View style={S.kpiBadgeWrap}>
                      <Feather name="trending-up" size={13} color="#FCD34D" />
                      <Text style={S.kpiBadgeText}>+12% ce mois</Text>
                    </View>
                  </View>

                  {/* 4 métriques inline */}
                  <View style={{ flexDirection: 'row', gap: 0, marginTop: 20 }}>
                    {KPI_DATA.map((k, i) => (
                      <View key={i} style={[S.kpiMetric, i < KPI_DATA.length - 1 && S.kpiMetricBorder]}>
                        <Feather name={k.icon} size={14} color={k.highlight ? '#FCD34D' : 'rgba(255,255,255,0.5)'} />
                        <Text style={[S.kpiMetricVal, k.highlight && { color: '#FCD34D' }]}>{k.val}</Text>
                        <Text style={S.kpiMetricLabel} numberOfLines={2}>{k.label}</Text>
                      </View>
                    ))}
                  </View>
                </LinearGradient>
              </View>
            </View>

            {/* ══ RACCOURCIS ════════════════════════════════════════════════ */}
            <View style={S.sectionWrap}>
              <Text style={S.sectionTitle}>Actions rapides</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {QUICK.map((q, i) => (
                  <TouchableOpacity key={i}
                    style={[S.quickBtn, { backgroundColor: q.color }]}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate(q.dest, q.params)}>
                    <View style={S.quickBtnIcon}>
                      <Feather name={q.icon} size={18} color="#fff" />
                    </View>
                    <Text style={S.quickBtnLabel}>{q.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* ══ RÉPARTITION PAR GENRE ════════════════════════════════════ */}
            <View style={S.sectionWrap}>
              <View style={S.sectionRow}>
                <View style={S.sectionPill}><Text style={S.sectionPillText}>STATISTIQUES</Text></View>
                <Text style={S.sectionTitle}>Répartition par genre</Text>
              </View>

              <View style={S.glassCard}>
                {/* shimmer */}
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(139,92,246,0.15)', borderTopLeftRadius: 22, borderTopRightRadius: 22 }} />

                {GENRE_DATA.map((g, i) => (
                  <View key={g.label} style={[{ marginBottom: i < GENRE_DATA.length - 1 ? 18 : 0 }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text style={S.genreLabel}>{g.label}</Text>
                      <Text style={[S.genreVal, { color: g.color }]}>{g.val}</Text>
                    </View>
                    {/* Barre de progression */}
                    <View style={S.genreBarBg}>
                      <Animated.View style={[
                        S.genreBarFill,
                        {
                          backgroundColor: g.color,
                          width: barAnims[i].interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', `${g.pct}%`],
                          }),
                        }
                      ]} />
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* ══ GRAPHIQUE NOUVEAUX VS ANCIENS ═════════════════════════════ */}
            <View style={S.sectionWrap}>
              <View style={S.sectionRow}>
                <View style={S.sectionPill}><Text style={S.sectionPillText}>ANALYSE</Text></View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={S.sectionTitle}>Nouveaux vs Anciens Cas</Text>
                  <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#8B5CF6' }} />
                      <Text style={S.legendText}>Nouveau</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(139,92,246,0.2)' }} />
                      <Text style={S.legendText}>Ancien</Text>
                    </View>
                  </View>
                </View>
              </View>
              <View style={S.glassCard}>
                <BarChart />
              </View>
            </View>

            {/* ══ ÉVOLUTION DES NOUVEAUX CAS ════════════════════════════════ */}
            <View style={S.sectionWrap}>
              <View style={S.sectionRow}>
                <View style={S.sectionPill}><Text style={S.sectionPillText}>TENDANCES</Text></View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={S.sectionTitle}>Évolution des Nouveaux Cas</Text>
                  <View style={[S.kpiBadgeWrap, { backgroundColor: '#D1FAE5' }]}>
                    <Feather name="trending-up" size={11} color="#059669" />
                    <Text style={[S.kpiBadgeText, { color: '#059669' }]}>+12%</Text>
                  </View>
                </View>
                <Text style={S.sectionSub}>Tendances sur les 6 derniers mois</Text>
              </View>
              <View style={S.glassCard}>
                <LineChart />
              </View>
            </View>

            {/* ══ ACTIVITÉS RÉCENTES ════════════════════════════════════════ */}
            <View style={S.sectionWrap}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text style={S.sectionTitle}>Activités Récentes</Text>
                <TouchableOpacity onPress={() => navigation.navigate('AdminComptes')}>
                  <Text style={S.seeAll}>Voir tout</Text>
                </TouchableOpacity>
              </View>

              {RECENT.map((a, i) => (
                <TouchableOpacity key={i} activeOpacity={0.82}>
                  <View style={[S.actCard, i < RECENT.length - 1 && { marginBottom: 9 }]}>
                    {/* Avatar initiales */}
                    <View style={[S.actAvatar, { backgroundColor: a.color }]}>
                      <Text style={S.actInitials}>{a.initials}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={S.actName}>{a.name}</Text>
                      <Text style={S.actSub}>{a.sub}</Text>
                    </View>
                    <View style={[S.actBadge, { backgroundColor: a.badgeBg }]}>
                      <Text style={[S.actBadgeText, { color: a.badgeColor }]}>{a.badge}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* ══ PREMIUM CARD ═════════════════════════════════════════════ */}
            <View style={{ paddingHorizontal: 22, marginBottom: 20 }}>
              <View style={{ borderRadius: 28, overflow: 'hidden' }}>
                <LinearGradient
                  colors={['#4C1D95', '#1E1B4B', '#0F172A']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={{ padding: 28, overflow: 'hidden' }}
                >
                  <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: GLASS.dark.shimmer }} />
                  <View style={{ position: 'absolute', right: -30, top: -30, width: 160, height: 160, borderRadius: 80, backgroundColor: GLASS.dark.bg }} />
                  <View style={{ position: 'absolute', left: -20, bottom: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.02)' }} />

                  <View style={S.premiumPill}>
                    <Feather name="shield" size={12} color="#FCD34D" />
                    <Text style={S.premiumPillText}>ADMIN · ACCÈS COMPLET</Text>
                  </View>

                  <Text style={S.premiumTitle}>{'Rapport mensuel\nprêt à exporter'}</Text>
                  <Text style={S.premiumSub}>
                    Synthèse complète de juin 2026 disponible. 247 dossiers, 3 450 consultations.
                  </Text>

                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 22 }}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={S.premiumBtn}
                      onPress={() => navigation.navigate('AdminRapports')}>
                      <Feather name="download" size={15} color="#1E1B4B" />
                      <Text style={S.premiumBtnText}>Exporter PDF</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.85} style={S.premiumBtnGhost}>
                      <Feather name="arrow-right" size={18} color="rgba(255,255,255,0.5)" />
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>
            </View>

            {/* Footer */}
            <View style={{ alignItems: 'center', paddingBottom: 12 }}>
              <View style={S.footer}>
                <Text style={S.footerText}>SafeKids v2.1.0 · Administration · © 2026</Text>
              </View>
            </View>

          </Animated.View>
        </ScrollView>
      </View>
    </AdminLayout>
  );
}