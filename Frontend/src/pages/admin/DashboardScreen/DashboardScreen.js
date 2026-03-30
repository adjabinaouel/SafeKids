import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AdminLayout from '../../../components/Navigation/AdminNavigation';
import { COLORS, GLASS } from '../../../theme';
import S from './DashboardStyles';

// ── Données mock (remplacer par appels API) ───────────────────────────────────
const KPI_DATA = [
  { label: 'Médecins actifs',     val: '12', icon: '👨‍⚕️', highlight: false, badge: '+2 ce mois' },
  { label: 'Parents inscrits',    val: '86', icon: '👨‍👩‍👧', highlight: false, badge: '+8 ce mois' },
  { label: 'Activités publiées',  val: '10', icon: '🎯',   highlight: false, badge: null },
  { label: 'Sessions ce mois',    val: '+45',icon: '📈',   highlight: true,  badge: '+12%' },
];

const RECENT = [
  { initials: 'KM', color: '#8B5CF6', name: 'Dr. Karim Meziane',  sub: 'Médecin créé · Il y a 2h',           badge: 'Médecin',  badgeBg: '#EDE9FE', badgeColor: '#6D28D9' },
  { initials: 'SB', color: '#2563EB', name: 'Sara Benali',         sub: 'Parent inscrit · Hier',               badge: 'Parent',   badgeBg: '#DBEAFE', badgeColor: '#1D4ED8' },
  { initials: 'IA', color: '#10B981', name: 'Activité PECS Ph.3',  sub: 'Publiée par Admin · Il y a 3j',       badge: 'Activité', badgeBg: '#D1FAE5', badgeColor: '#065F46' },
  { initials: 'YB', color: '#F59E0B', name: 'Dr. Yacine Bouzid',   sub: 'En attente de validation · Il y a 4j',badge: 'Attente',  badgeBg: '#FEF3C7', badgeColor: '#92400E' },
];

export default function DashboardScreen() {
  const navigation = useNavigation();

  return (
    <AdminLayout activeTab="dashboard">
      <StatusBar barStyle="light-content" />
      <ScrollView style={S.container} showsVerticalScrollIndicator={false}
        contentContainerStyle={S.scrollContent}>

        {/* ── Header gradient ── */}
        <LinearGradient colors={['#4C1D95', '#1E1B4B']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={S.header}>
          <View style={S.headerTopRow}>
            <View>
              <Text style={S.headerGreeting}>Panneau administrateur</Text>
              <Text style={S.headerTitle}>
                Tableau de <Text style={S.headerAccent}>bord</Text>
              </Text>
            </View>
            <View style={S.headerRight}>
              <TouchableOpacity style={S.headerIconBtn}
                onPress={() => navigation.navigate('AdminNotifications')}>
                <Feather name="bell" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={S.headerIconBtn}
                onPress={() => navigation.navigate('AdminProfil')}>
                <Feather name="user" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* ── KPI Grid ── */}
        <View style={S.kpiGrid}>
          {KPI_DATA.map((k, i) => (
            <View key={i} style={[S.kpiCard, k.highlight && S.kpiCardHighlight]}>
              <Text style={S.kpiIcon}>{k.icon}</Text>
              <Text style={[S.kpiVal, k.highlight && S.kpiValWhite]}>{k.val}</Text>
              <Text style={[S.kpiLabel, k.highlight && S.kpiLabelWhite]}>{k.label}</Text>
              {k.badge && (
                k.highlight
                  ? <View style={S.kpiBadgeWhite}><Text style={S.kpiBadgeWhiteText}>{k.badge}</Text></View>
                  : <View style={S.kpiBadge}><Text style={S.kpiBadgeText}>{k.badge}</Text></View>
              )}
            </View>
          ))}
        </View>

        {/* ── Raccourcis ── */}
        <View style={S.quickRow}>
          {[
            { label: '+ Médecin', icon: '👨‍⚕️', color: '#4C1D95', dest: 'AdminComptes', params: { openCreate: 'doctor' } },
            { label: '+ Parent',  icon: '👨‍👩‍👧', color: '#1D4ED8', dest: 'AdminComptes', params: { openCreate: 'parent' } },
            { label: '+ Activité',icon: '🎯',   color: '#065F46', dest: 'AdminActivites', params: { openCreate: true } },
          ].map((q, i) => (
            <TouchableOpacity key={i} style={[S.quickBtn, { backgroundColor: q.color }]}
              activeOpacity={0.85}
              onPress={() => navigation.navigate(q.dest, q.params)}>
              <Text style={S.quickBtnIcon}>{q.icon}</Text>
              <Text style={S.quickBtnLabel}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Activité récente ── */}
        <View style={S.section}>
          <View style={S.sectionRow}>
            <Text style={S.sectionTitle}>Activité récente</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AdminComptes')}>
              <Text style={S.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          {RECENT.map((a, i) => (
            <View key={i} style={S.actCard}>
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
          ))}
        </View>

      </ScrollView>
    </AdminLayout>
  );
}