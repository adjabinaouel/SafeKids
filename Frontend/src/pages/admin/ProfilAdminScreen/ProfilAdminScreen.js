import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AdminLayout from '../../../components/Navigation/AdminNavigation';
import { COLORS } from '../../../theme';
import S from './ProfilAdminStyles';

const MENU = [
  {
    title: 'Mon compte',
    items: [
      { icon: 'user',     iconBg: '#EDE9FE', label: 'Informations personnelles', sub: 'Nom, email, téléphone' },
      { icon: 'lock',     iconBg: '#DBEAFE', label: 'Changer le mot de passe',   sub: 'Dernière modification il y a 30 jours' },
      { icon: 'globe',    iconBg: '#D1FAE5', label: 'Langue & région',           sub: 'Français · Algérie' },
    ],
  },
  {
    title: 'Administration',
    items: [
      { icon: 'shield',   iconBg: '#EDE9FE', label: 'Gestion des rôles',      sub: 'Super Admin · Tous les droits' },
      { icon: 'file-text',iconBg: '#FEF3C7', label: 'Journaux d\'activité',   sub: 'Consulter les logs système' },
      { icon: 'settings', iconBg: '#F1F5F9', label: 'Paramètres de l\'app',   sub: 'Configuration générale' },
    ],
  },
  {
    title: 'Notifications',
    items: [
      { icon: 'bell',     iconBg: '#FEF3C7', label: 'Préférences de notifications', sub: 'Email, push, SMS' },
      { icon: 'mail',     iconBg: '#DBEAFE', label: 'Templates d\'emails',          sub: 'Modèles automatiques' },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: 'smartphone',iconBg: '#D1FAE5', label: 'Version de l\'application', sub: 'v1.0.0 · Mise à jour disponible' },
      { icon: 'help-circle',iconBg:'#F1F5F9', label: 'Aide & documentation',       sub: 'Guide administrateur' },
    ],
  },
];

export default function ProfilAdminScreen() {
  const navigation = useNavigation();

  const logout = () =>
    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnecter', style: 'destructive',
        onPress: () => navigation.reset({ index: 0, routes: [{ name: 'AdminLogin' }] }) },
    ]);

  return (
    <AdminLayout activeTab="profil">
      <StatusBar barStyle="light-content" />
      <ScrollView style={S.container} showsVerticalScrollIndicator={false}
        contentContainerStyle={S.scrollContent}>

        {/* Hero */}
        <LinearGradient colors={['#4C1D95', '#1E1B4B']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={S.hero}>
          <View style={S.heroAvatar}><Text style={{ fontSize: 40 }}>👨‍💼</Text></View>
          <Text style={S.heroName}>Admin Principal</Text>
          <Text style={S.heroRole}>Administrateur système · admin@safekids.dz</Text>
          <View style={S.heroBadge}><Text style={S.heroBadgeText}>🛡️ Super Administrateur</Text></View>
        </LinearGradient>

        {/* Stats */}
        <View style={S.statsRow}>
          <View style={S.statCard}><Text style={S.statVal}>12</Text><Text style={S.statLabel}>Médecins créés</Text></View>
          <View style={S.statCard}><Text style={S.statVal}>86</Text><Text style={S.statLabel}>Parents gérés</Text></View>
          <View style={S.statCard}><Text style={S.statVal}>10</Text><Text style={S.statLabel}>Activités publiées</Text></View>
        </View>

        {MENU.map((sec, si) => (
          <View key={si}>
            <View style={S.section}><Text style={S.sectionTitle}>{sec.title}</Text></View>
            <View style={S.menuCard}>
              {sec.items.map((item, ii) => (
                <TouchableOpacity key={ii} activeOpacity={0.75}
                  style={[S.menuItem, ii === sec.items.length - 1 && S.menuItemLast]}>
                  <View style={[S.menuIconBox, { backgroundColor: item.iconBg }]}>
                    <Feather name={item.icon} size={17} color={COLORS.textLight} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={S.menuLabel}>{item.label}</Text>
                    <Text style={S.menuSub}>{item.sub}</Text>
                  </View>
                  <View style={S.menuArrow}>
                    <Feather name="chevron-right" size={14} color={COLORS.textMuted} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Déconnexion */}
        <TouchableOpacity style={S.dangerCard} onPress={logout} activeOpacity={0.85}>
          <View style={S.dangerIconBox}>
            <Feather name="log-out" size={18} color="#991B1B" />
          </View>
          <Text style={S.dangerText}>Se déconnecter</Text>
          <Feather name="chevron-right" size={16} color="#991B1B" />
        </TouchableOpacity>

      </ScrollView>
    </AdminLayout>
  );
}