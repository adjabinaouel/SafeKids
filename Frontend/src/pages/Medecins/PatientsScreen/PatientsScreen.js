// src/pages/Medecins/PatientsScreen/PatientsScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, ScrollView,
  StatusBar, Animated, RefreshControl, ActivityIndicator, Alert,
  Modal, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import DoctorLayout from '../../../components/Navigation/DoctorNavigation';
import S, { COLORS } from './PatientsScreenStyles';

const SERVER_URL = 'https://gondola-reattach-relearn.ngrok-free.dev';

// ✅ Modal de confirmation de suppression
const DeleteConfirmModal = ({ visible, patientName, onConfirm, onCancel, isDeleting }) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={S.modalOverlay}>
      <View style={S.modalContent}>
        <View style={S.modalIconContainer}>
          <Feather name="alert-triangle" size={32} color={COLORS.error} />
        </View>
        <Text style={S.modalTitle}>Confirmer la suppression</Text>
        <Text style={S.modalMessage}>
          Voulez-vous vraiment supprimer le patient "{patientName}" ?
        </Text>
        <Text style={S.modalWarning}>Cette action est irréversible.</Text>
        
        <View style={S.modalButtons}>
          <TouchableOpacity 
            style={[S.modalButton, S.modalCancelButton]} 
            onPress={onCancel}
            disabled={isDeleting}
          >
            <Text style={S.modalCancelText}>Annuler</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[S.modalButton, S.modalConfirmButton, isDeleting && S.modalButtonDisabled]} 
            onPress={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={S.modalConfirmText}>Supprimer</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

// ✅ Carte patient avec effets de pression
const PatientCard = ({ patient, onPress, onEdit, onDelete, isDeleting }) => {
  const [editPressed, setEditPressed] = useState(false);
  const [deletePressed, setDeletePressed] = useState(false);

  return (
    <View style={S.patientCard}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={S.patientTouchArea}
      >
        <View style={S.patientHeader}>
          <View style={S.patientAvatar}>
            <Text style={S.patientInitials}>
              {patient.prenom?.[0]}{patient.nom?.[0]}
            </Text>
          </View>
          <View style={S.patientInfo}>
            <Text style={S.patientName} numberOfLines={1}>
              {patient.prenom} {patient.nom}
            </Text>
            <Text style={S.patientMeta}>
              {patient.age} ans · {patient.genre} · TSA {patient.niveau_tsa}
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color={COLORS.textLight} />
        </View>

        <View style={S.patientDetails}>
          <View style={S.detailRow}>
            <Text style={S.detailLabel}>Cognitif:</Text>
            <Text style={S.detailValue}>{patient.cognitif || '—'}</Text>
          </View>
          <View style={S.detailRow}>
            <Text style={S.detailLabel}>Motricité:</Text>
            <Text style={S.detailValue}>{patient.motricite_manuelle || '—'}</Text>
          </View>
          <View style={S.detailRow}>
            <Text style={S.detailLabel}>Langage:</Text>
            <Text style={S.detailValue}>
              {patient.age_du_langage_expressif ? `${patient.age_du_langage_expressif} ans` : '—'}
            </Text>
          </View>
        </View>

        {patient.idParent && (
          <View style={S.parentInfo}>
            <Feather name="user" size={14} color={COLORS.primary} />
            <Text style={S.parentText}>Parent associé</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={S.patientActions}>
        <TouchableOpacity 
          style={[
            S.actionButton, 
            editPressed && S.actionButtonPressed
          ]} 
          onPress={onEdit} 
          onPressIn={() => setEditPressed(true)}
          onPressOut={() => setEditPressed(false)}
          activeOpacity={0.8} 
          disabled={isDeleting}
        >
          <Feather name="edit-2" size={16} color={editPressed ? '#fff' : COLORS.primary} />
          <Text style={[
            S.actionText, 
            editPressed && S.actionTextPressed
          ]}>Modifier</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            S.actionButton, 
            S.deleteActionButton, 
            deletePressed && S.deleteActionButtonPressed,
            isDeleting && S.actionButtonDisabled
          ]} 
          onPress={onDelete}
          onPressIn={() => setDeletePressed(true)}
          onPressOut={() => setDeletePressed(false)}
          activeOpacity={0.8}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color={COLORS.error} />
          ) : (
            <>
              <Feather name="trash-2" size={16} color={deletePressed ? '#fff' : COLORS.error} />
              <Text style={[
                S.actionText, 
                S.deleteActionText,
                deletePressed && S.deleteActionTextPressed
              ]}>Supprimer</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ✅ Écran principal
export default function PatientsScreen({ navigation }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ total: 0, garcons: 0, filles: 0 });
  const [deletingId, setDeletingId] = useState(null);
  
  // Modal de confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);

  // Search and filter
  const [searchText, setSearchText] = useState('');
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [showAllPatients, setShowAllPatients] = useState(false);

  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPatients();
    }, [showAllPatients])
  );

  // Filter patients based on search
  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient =>
        `${patient.prenom} ${patient.nom}`.toLowerCase().includes(searchText.toLowerCase()) ||
        patient.age.toString().includes(searchText) ||
        patient.genre.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  }, [searchText, patients]);

  // ✅ Charger les patients du médecin ou tous les patients
  const fetchPatients = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        navigation.navigate('Login');
        return;
      }

      const endpoint = showAllPatients ? '/api/tous-les-patients' : '/api/mes-patients';
      const response = await fetch(`${SERVER_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (response.status === 401) {
        await AsyncStorage.removeItem('userToken');
        navigation.navigate('Login');
        return;
      }

      if (!response.ok) throw new Error('Erreur chargement patients');

      const data = await response.json();

      setPatients(data);
      setFilteredPatients(data); // Initially, filtered is all

      // Calculer les stats
      const total = data.length;
      const garcons = data.filter(p => p.genre === 'Masculin').length;
      const filles = total - garcons;
      setStats({ total, garcons, filles });

    } catch (error) {
      console.error('Fetch patients error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPatients();
  };

  // Ouvrir le modal de confirmation
  const handleDelete = (patient) => {
    setPatientToDelete(patient);
    setShowDeleteModal(true);
  };

  // Confirmer la suppression
  const confirmDelete = async () => {
    if (!patientToDelete) return;
    
    console.log('🗑️ Confirming delete for:', patientToDelete._id);
    setDeletingId(patientToDelete._id);
    
    // Appeler directement la suppression
    try {
      const token = await AsyncStorage.getItem('userToken');
      console.log('🗑️ Token present:', !!token);
      if (!token) {
        Alert.alert('Erreur', 'Token manquant. Veuillez vous reconnecter.');
        setDeletingId(null);
        setShowDeleteModal(false);
        setPatientToDelete(null);
        return;
      }

      const url = `${SERVER_URL}/api/enfants/${patientToDelete._id}`;
      console.log('🗑️ DELETE URL:', url);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });

      console.log('🗑️ Response status:', response.status);
      const result = await response.json();
      console.log('🗑️ Response:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Impossible de supprimer');
      }

      Alert.alert('Succès', 'Patient supprimé avec succès');
      fetchPatients();
    } catch (error) {
      console.error('🗑️ Error:', error);
      Alert.alert('Erreur', error.message || 'Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
      setShowDeleteModal(false);
      setPatientToDelete(null);
    }
  };

  // Annuler la suppression
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setPatientToDelete(null);
    setDeletingId(null);
  };

  const renderPatient = ({ item }) => (
    <PatientCard
      patient={item}
      onPress={() => navigation.navigate('ChildProfile', { childId: item._id })}
      onEdit={() => navigation.navigate('ChildProfile', { childId: item._id, startEditing: true })}
      onDelete={() => handleDelete(item)}
      isDeleting={deletingId === item._id}
    />
  );

  const renderEmpty = () => (
    <View style={S.emptyContainer}>
      <View style={S.emptyIcon}>
        <Feather name="users" size={48} color={COLORS.textMuted} />
      </View>
      <Text style={S.emptyTitle}>Aucun patient</Text>
      <Text style={S.emptySubtitle}>
        Les enfants que vous ajoutez apparaîtront ici
      </Text>
      <TouchableOpacity
        style={S.emptyButton}
        onPress={() => navigation.navigate('AddChildren')}
        activeOpacity={0.85}
      >
        <Text style={S.emptyButtonText}>Ajouter un enfant</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <DoctorLayout activeTab="children">
        <View style={S.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={S.loadingText}>Chargement des patients...</Text>
        </View>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout activeTab="children">
      <View style={S.container}>
        <StatusBar barStyle="light-content" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        >

          {/* ══ HEADER ════════════════════════════════════════════════ */}
          <LinearGradient
            colors={['#1A0938', '#3B1478', '#4C1D95', '#1E1B4B']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={S.headerGradient}
          >
            <View style={S.headerContent}>
              <Text style={S.headerTitle}>Mes Patients</Text>
              <Text style={S.headerSubtitle}>
                Gérez vos patients et suivez leur évolution
              </Text>

              <View style={S.statsRow}>
                <View style={S.statBox}>
                  <Text style={S.statNumber}>{stats.total}</Text>
                  <Text style={S.statLabel}>Total</Text>
                </View>
                <View style={S.statBox}>
                  <Text style={S.statNumber}>{stats.garcons}</Text>
                  <Text style={S.statLabel}>Garçons</Text>
                </View>
                <View style={S.statBox}>
                  <Text style={S.statNumber}>{stats.filles}</Text>
                  <Text style={S.statLabel}>Filles</Text>
                </View>
              </View>

              {/* Search and Toggle */}
              <View style={S.searchRow}>
                <View style={S.searchContainer}>
                  <Feather name="search" size={18} color={COLORS.textLight} style={S.searchIcon} />
                  <TextInput
                    style={S.searchInput}
                    placeholder="Rechercher par nom, âge, genre..."
                    placeholderTextColor={COLORS.textLight}
                    value={searchText}
                    onChangeText={setSearchText}
                  />
                </View>
                <TouchableOpacity
                  style={[S.toggleButton, showAllPatients && S.toggleButtonActive]}
                  onPress={() => setShowAllPatients(!showAllPatients)}
                  activeOpacity={0.8}
                >
                  <Text style={[S.toggleText, showAllPatients && S.toggleTextActive]}>
                    {showAllPatients ? 'Tous les patients' : 'Mes patients'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>

          {/* ══ LISTE PATIENTS ════════════════════════════════════════ */}
          <View style={S.listContainer}>
            <FlatList
              data={filteredPatients}
              keyExtractor={(item) => item._id}
              renderItem={renderPatient}
              ListEmptyComponent={renderEmpty}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={filteredPatients.length === 0 ? { flex: 1 } : {}}
            />
          </View>

        </ScrollView>

        {/* Modal de confirmation de suppression */}
        <DeleteConfirmModal
          visible={showDeleteModal}
          patientName={patientToDelete ? `${patientToDelete.prenom} ${patientToDelete.nom}` : ''}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          isDeleting={!!deletingId}
        />
      </View>
    </DoctorLayout>
  );
}