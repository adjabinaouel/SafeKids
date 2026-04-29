// ✅ MODIFICATION: Page profil pour les médecins - Permet de voir et modifier les infos professionnelles
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StatusBar, Animated, Alert, ActivityIndicator, Modal, Platform, FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import DoctorLayout from '../../../components/Navigation/DoctorNavigation';
import S, { COLORS } from './ProfilMedecinStyles';

const SERVER_URL = 'https://gondola-reattach-relearn.ngrok-free.dev';

// ✅ Composant avatar multi-plateforme
const AvatarImage = ({ uri, size = 112 }) => {
  if (Platform.OS === 'web' && uri) {
    return (
      <img
        src={uri}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          objectFit: 'cover',
          display: 'block',
        }}
        onError={(e) => { e.target.style.display = 'none'; }}
      />
    );
  }
  return null; // Mobile + local image
};

// ✅ Carte de statistique
const StatCard = ({ icon, label, value, color, isMCI = false }) => (
  <View style={S.statCard}>
    <View style={[S.statIcon, { backgroundColor: color }]}>
      {isMCI
        ? <MaterialCommunityIcons name={icon} size={18} color="#fff" />
        : <Feather name={icon} size={18} color="#fff" />}
    </View>
    <Text style={S.statLabel}>{label}</Text>
    <Text style={S.statValue} numberOfLines={1}>{value}</Text>
  </View>
);

// ✅ Ligne d'info éditable
const InfoRow = ({
  icon, label, value, field,
  isLast = false, isEditing = false,
  onChangeText, locked = false, isMCI = false,
  keyboard = 'default',
}) => (
  <View style={[S.infoRow, isLast && { borderBottomWidth: 0 }]}>
    <View style={[S.securityIcon, { backgroundColor: locked ? '#FEF3C7' : COLORS.primaryLight }]}>
      {isMCI
        ? <MaterialCommunityIcons name={icon} size={16} color={locked ? '#D97706' : COLORS.primary} />
        : <Feather name={icon} size={16} color={locked ? '#D97706' : COLORS.primary} />}
    </View>
    <View style={S.infoContent}>
      <Text style={S.infoLabel}>{label}</Text>
      {isEditing && !locked ? (
        <TextInput
          style={[S.infoValue, S.inputEditable]}
          value={value}
          onChangeText={(text) => onChangeText(field, text)}
          placeholder="Modifier..."
          placeholderTextColor={COLORS.textMuted}
          autoCapitalize="none"
          keyboardType={keyboard}
          returnKeyType="done"
        />
      ) : (
        <Text
          style={[S.infoValue, locked && { color: COLORS.textLight, fontStyle: 'italic' }]}
          numberOfLines={1}
        >
          {value || '—'}
        </Text>
      )}
    </View>
    {locked
      ? <Feather name="lock" size={13} color="#D97706" />
      : isEditing ? <Feather name="edit-2" size={14} color={COLORS.primary} /> : null}
  </View>
);

// ✅ Écran principal
export default function ProfilMedecin({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDisponibiliteModal, setShowDisponibiliteModal] = useState(false);

  const [ancienMdp, setAncienMdp] = useState('');
  const [nouveauMdp, setNouveauMdp] = useState('');
  const [confirmMdp, setConfirmMdp] = useState('');
  const [changingPwd, setChangingPwd] = useState(false);

  const [tempDisponibilite, setTempDisponibilite] = useState([]);

  const fadeAnim = useState(new Animated.Value(0))[0];

  const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  // ✅ Initialisation
  useEffect(() => {
    const init = async () => {
      await loadUserProfile();
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    };
    init();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUserProfile();
    }, [])
  );

  // ✅ Charger le profil du médecin
  const loadUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Session expirée', 'Veuillez vous reconnecter.');
        navigation.navigate('Login');
        return;
      }

      const response = await fetch(`${SERVER_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (!response.ok) throw new Error('Erreur chargement profil');

      const data = await response.json();
      setUserData({
        ...data,
        disponibilite: data.disponibilite || [],
      });
      setTempDisponibilite(data.disponibilite || []);
      setLoading(false);
    } catch (error) {
      console.error('Load profile error:', error);
      Alert.alert('Erreur', 'Impossible de charger le profil');
      setLoading(false);
    }
  };

  // ✅ Modifier un champ
  const updateField = (field, value) => {
    setUserData({ ...userData, [field]: value });
  };

  // ✅ Sauvegarder les modifications
  const handleSave = async () => {
    if (!userData.nom?.trim() || !userData.prenom?.trim() || !userData.email?.trim()) {
      Alert.alert('Erreur', 'Nom, prénom et email sont obligatoires');
      return;
    }

    if (!userData.telephone?.trim()) {
      Alert.alert('Erreur', 'Le téléphone est obligatoire');
      return;
    }

    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${SERVER_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          nom: userData.nom,
          prenom: userData.prenom,
          email: userData.email,
          telephone: userData.telephone,
          specialite: userData.specialite,
          disponibilite: userData.disponibilite,
        }),
      });

      if (!response.ok) throw new Error('Erreur sauvegarde');

      Alert.alert('✅ Succès', 'Votre profil a été mis à jour');
      setIsEditing(false);
      setSaving(false);
    } catch (error) {
      console.error('Save profile error:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder');
      setSaving(false);
    }
  };

  // ✅ Changer le mot de passe
  const handleChangePassword = async () => {
    if (!ancienMdp.trim() || !nouveauMdp.trim() || !confirmMdp.trim()) {
      Alert.alert('Erreur', 'Tous les champs sont obligatoires');
      return;
    }

    if (nouveauMdp !== confirmMdp) {
      Alert.alert('Erreur', 'Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    if (nouveauMdp.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setChangingPwd(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${SERVER_URL}/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          motDePasse: ancienMdp,
          nouveauMotDePasse: nouveauMdp,
        }),
      });

      if (!response.ok) throw new Error('Erreur changement MDP');

      Alert.alert('✅ Succès', 'Votre mot de passe a été modifié');
      setAncienMdp('');
      setNouveauMdp('');
      setConfirmMdp('');
      setShowPasswordModal(false);
      setChangingPwd(false);
    } catch (error) {
      console.error('Change password error:', error);
      Alert.alert('Erreur', 'Ancien mot de passe incorrect');
      setChangingPwd(false);
    }
  };

  // ✅ Toggle disponibilité
  const toggleJour = (jour) => {
    const newDispo = tempDisponibilite.includes(jour)
      ? tempDisponibilite.filter(j => j !== jour)
      : [...tempDisponibilite, jour];
    setTempDisponibilite(newDispo);
  };

  // ✅ Sauvegarder disponibilité
  const saveDisponibilite = () => {
    setUserData({ ...userData, disponibilite: tempDisponibilite });
    setShowDisponibiliteModal(false);
  };

  if (loading) {
    return (
      <View style={[S.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={[S.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 16, color: COLORS.text }}>Erreur chargement profil</Text>
      </View>
    );
  }

  return (
    <DoctorLayout activeTab="profile">
      <View style={S.container}>
        <StatusBar barStyle="light-content" />

        {/* ✅ En-tête gradient violet médecin */}
        <LinearGradient
          colors={['#7C3AED', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={S.premiumHeader}
        >
          <TouchableOpacity
            onPress={() => navigation?.goBack()}
            style={S.backButton}
            activeOpacity={0.8}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={S.headerContent}>
            <Text style={S.headerTitle}>Mon Profil Médecin</Text>
            <Text style={S.headerSubtitle}>Informations professionnelles</Text>
          </View>
        </LinearGradient>

        <Animated.View style={[S.animatedContent, { opacity: fadeAnim }]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={S.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* ✅ Avatar */}
            <View style={S.avatarContainer}>
              <LinearGradient
                colors={['#7C3AED', '#8B5CF6']}
                style={S.avatarGradient}
              >
                <Ionicons name="person" size={56} color="#fff" />
              </LinearGradient>
              <View style={S.avatarInfo}>
                <Text style={S.avatarName}>{userData.prenom} {userData.nom}</Text>
                <Text style={S.avatarRole}>Médecin - {userData.specialite}</Text>
                <View style={S.statusBadge}>
                  <View style={[S.statusDot, { backgroundColor: userData.status === 'actif' ? '#10B981' : '#6B7280' }]} />
                  <Text style={S.statusText}>{userData.status === 'actif' ? 'Actif' : 'Inactif'}</Text>
                </View>
              </View>
            </View>

            {/* ✅ Stats */}
            <View style={S.statsContainer}>
              <StatCard
                icon="stethoscope"
                label="Spécialité"
                value={userData.specialite || '—'}
                color="#7C3AED"
                isMCI={true}
              />
              <StatCard
                icon="calendar"
                label="Disponibilités"
                value={`${userData.disponibilite?.length || 0} jours`}
                color="#8B5CF6"
                isMCI={true}
              />
            </View>

            {/* ✅ Infos personnelles */}
            <View style={S.section}>
              <View style={S.sectionHeader}>
                <Text style={S.sectionTitle}>Informations personnelles</Text>
                {!isEditing && (
                  <TouchableOpacity onPress={() => setIsEditing(true)} style={S.editButton}>
                    <Feather name="edit-2" size={16} color="#7C3AED" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={S.infoContainer}>
                <InfoRow
                  icon="user"
                  label="Prénom"
                  value={userData.prenom}
                  field="prenom"
                  isEditing={isEditing}
                  onChangeText={updateField}
                />
                <InfoRow
                  icon="user"
                  label="Nom"
                  value={userData.nom}
                  field="nom"
                  isEditing={isEditing}
                  onChangeText={updateField}
                />
                <InfoRow
                  icon="mail"
                  label="Email"
                  value={userData.email}
                  field="email"
                  isEditing={isEditing}
                  onChangeText={updateField}
                  keyboard="email-address"
                  isLast={true}
                />
              </View>
            </View>

            {/* ✅ Infos professionnelles */}
            <View style={S.section}>
              <View style={S.sectionHeader}>
                <Text style={S.sectionTitle}>Infos professionnelles</Text>
              </View>

              <View style={S.infoContainer}>
                <InfoRow
                  icon="stethoscope"
                  label="Spécialité"
                  value={userData.specialite}
                  field="specialite"
                  isEditing={isEditing}
                  onChangeText={updateField}
                  isMCI={true}
                />
                <InfoRow
                  icon="phone"
                  label="Téléphone"
                  value={userData.telephone}
                  field="telephone"
                  isEditing={isEditing}
                  onChangeText={updateField}
                  keyboard="phone-pad"
                  isLast={true}
                />
              </View>
            </View>

            {/* ✅ Disponibilités */}
            <View style={S.section}>
              <View style={S.sectionHeader}>
                <Text style={S.sectionTitle}>Disponibilités</Text>
              </View>

              <TouchableOpacity
                style={S.disponibiliteCard}
                onPress={() => setShowDisponibiliteModal(true)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="calendar-check" size={20} color="#7C3AED" />
                <View style={{ flex: 1 }}>
                  <Text style={S.disponibiliteLabel}>Jours de consultation</Text>
                  <Text style={S.disponibiliteValue}>
                    {userData.disponibilite?.length > 0
                      ? userData.disponibilite.join(', ')
                      : 'Aucun jour sélectionné'}
                  </Text>
                </View>
                {isEditing && <Feather name="edit-2" size={16} color="#7C3AED" />}
              </TouchableOpacity>
            </View>

            {/* ✅ Boutons d'action */}
            <View style={S.actionButtons}>
              {isEditing ? (
                <>
                  <TouchableOpacity
                    style={[S.button, S.buttonPrimary, saving && { opacity: 0.6 }]}
                    onPress={handleSave}
                    disabled={saving}
                    activeOpacity={0.85}
                  >
                    {saving ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Feather name="check" size={18} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={S.buttonText}>Sauvegarder</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[S.button, S.buttonSecondary]}
                    onPress={() => { setIsEditing(false); loadUserProfile(); }}
                    activeOpacity={0.85}
                  >
                    <Feather name="x" size={18} color="#7C3AED" style={{ marginRight: 8 }} />
                    <Text style={S.buttonTextSecondary}>Annuler</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={[S.button, S.buttonSecondary]}
                    onPress={() => setShowPasswordModal(true)}
                    activeOpacity={0.85}
                  >
                    <Feather name="lock" size={18} color="#7C3AED" style={{ marginRight: 8 }} />
                    <Text style={S.buttonTextSecondary}>Changer mot de passe</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </Animated.View>

        {/* ✅ Modal Mot de passe */}
        <Modal
          visible={showPasswordModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPasswordModal(false)}
        >
          <TouchableOpacity
            style={S.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowPasswordModal(false)}
          >
            <View style={S.modalContent}>
              <Text style={S.modalTitle}>Changer votre mot de passe</Text>

              <View style={S.inputGroup}>
                <Text style={S.inputLabel}>Ancien mot de passe</Text>
                <TextInput
                  style={S.input}
                  value={ancienMdp}
                  onChangeText={setAncienMdp}
                  placeholder="Entrez votre mot de passe actuel"
                  secureTextEntry
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={S.inputGroup}>
                <Text style={S.inputLabel}>Nouveau mot de passe</Text>
                <TextInput
                  style={S.input}
                  value={nouveauMdp}
                  onChangeText={setNouveauMdp}
                  placeholder="Entrez votre nouveau mot de passe"
                  secureTextEntry
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={S.inputGroup}>
                <Text style={S.inputLabel}>Confirmer mot de passe</Text>
                <TextInput
                  style={S.input}
                  value={confirmMdp}
                  onChangeText={setConfirmMdp}
                  placeholder="Confirmez votre nouveau mot de passe"
                  secureTextEntry
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <TouchableOpacity
                style={[S.button, S.buttonPrimary, changingPwd && { opacity: 0.6 }]}
                onPress={handleChangePassword}
                disabled={changingPwd}
                activeOpacity={0.85}
              >
                {changingPwd ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={S.buttonText}>Confirmer</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={S.cancelButton}
                onPress={() => setShowPasswordModal(false)}
                activeOpacity={0.75}
              >
                <Text style={S.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* ✅ Modal Disponibilités */}
        <Modal
          visible={showDisponibiliteModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDisponibiliteModal(false)}
        >
          <TouchableOpacity
            style={S.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowDisponibiliteModal(false)}
          >
            <View style={S.modalContent}>
              <Text style={S.modalTitle}>Sélectionner vos jours de consultation</Text>

              <FlatList
                data={JOURS}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={S.jourItem}
                    onPress={() => toggleJour(item)}
                    activeOpacity={0.7}
                  >
                    <View style={[S.checkbox, tempDisponibilite.includes(item) && S.checkboxActive]}>
                      {tempDisponibilite.includes(item) && (
                        <Feather name="check" size={14} color="#fff" />
                      )}
                    </View>
                    <Text style={S.jourText}>{item}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item}
              />

              <TouchableOpacity
                style={[S.button, S.buttonPrimary]}
                onPress={saveDisponibilite}
                activeOpacity={0.85}
              >
                <Text style={S.buttonText}>Confirmer</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={S.cancelButton}
                onPress={() => setShowDisponibiliteModal(false)}
                activeOpacity={0.75}
              >
                <Text style={S.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </DoctorLayout>
  );
}
