import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DoctorLayout from '../../../components/Navigation/DoctorNavigation';
import styles from './ChildProfileStyles';

const SERVER_URL = 'https://gondola-reattach-relearn.ngrok-free.dev';

const FIELD_OPTIONS = {
  genre: ['Masculin', 'Féminin'],
  niveau_tsa: ['1 : léger', '2 : modéré', '3 : sévère'],
  cognitif: ['Excellent', 'Bon', 'Moyen', 'Faible'],
  motricite: ['Acquis', 'Non acquis'],
  imitation: ['Sur demande', 'Absente', 'Spontanée', 'Écholalie'],
  comportement: ['Aucun', 'Légers', 'Sévères'],
  autonomie: ['Complète', 'Partielle'],
  structuration_visuelle: ['1', '2', '3'],
  developpement_sensoriel: ['Mixte', 'Normal', 'Hypersensible'],
  temporalite: ['Non acquis', 'En cours', 'Acquis'],
  spatialite: ['Non acquis', 'En cours', 'Acquis'],
  distingue_parties_corps: ['Oui', 'Non'],
  lateralite: ['Droitier', 'Gaucher', 'Ambidextre', 'Indéfini'],
};

const renderPicker = (label, value, setValue, options) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.pickerWrapper}>
      <Picker
        selectedValue={value}
        onValueChange={(itemValue) => setValue(itemValue)}
        style={styles.picker}
        itemStyle={styles.pickerItem}
        dropdownIconColor="#7C3AED"
        mode="dropdown"
      >
        <Picker.Item label="Sélectionnez..." value="" color="#9CA3AF" />
        {options.map((option) => (
          <Picker.Item key={option} label={option} value={option} />
        ))}
      </Picker>
    </View>
  </View>
);

const renderInput = (label, value, setValue, keyboardType = 'default') => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <View style={[styles.inputWrapper, value !== '' && styles.inputWrapperActive]}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={setValue}
        keyboardType={keyboardType}
        placeholder={label}
        placeholderTextColor="#9CA3AF"
        underlineColorAndroid="transparent"
      />
    </View>
  </View>
);

const renderRadioGroup = (label, value, setValue, options) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.radioRow}>
      {options.map((option) => {
        const active = option === value;
        return (
          <TouchableOpacity
            key={option}
            style={[styles.radioOption, active && styles.radioOptionActive]}
            onPress={() => setValue(option)}
            activeOpacity={0.8}
          >
            <Text style={styles.radioLabel}>{option}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

export default function ChildProfile({ route, navigation }) {
  const { childId } = route.params || {};

  // États pour les champs
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [age, setAge] = useState('');
  const [genre, setGenre] = useState('');
  const [niveauTSA, setNiveauTSA] = useState('');
  const [cognitif, setCognitif] = useState('');
  const [ageLangageExpressif, setAgeLangageExpressif] = useState('');
  const [ageLangageReceptif, setAgeLangageReceptif] = useState('');
  const [motriciteManuelle, setMotriciteManuelle] = useState('');
  const [motriciteGlobale, setMotriciteGlobale] = useState('');
  const [imitation, setImitation] = useState('');
  const [comportementsProblemes, setComportementsProblemes] = useState('');
  const [autonomiePersonnelle, setAutonomiePersonnelle] = useState('');
  const [niveauStructurationVisuelle, setNiveauStructurationVisuelle] = useState('');
  const [developpementSensoriel, setDeveloppementSensoriel] = useState('');
  const [distingueCorps, setDistingueCorps] = useState('');
  const [notionTemporalite, setNotionTemporalite] = useState('');
  const [notionSpatialite, setNotionSpatialite] = useState('');
  const [lateralite, setLateralite] = useState('');

  // États de gestion
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (childId) {
      fetchChild();
    }
  }, [childId]);

  const fetchChild = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${SERVER_URL}/api/enfants/${childId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });

      const data = await response.json();
      if (response.ok) {
        // Remplir les champs avec les données
        setNom(data.nom || '');
        setPrenom(data.prenom || '');
        setAge(data.age?.toString() || '');
        setGenre(data.genre || '');
        setNiveauTSA(data.niveau_tsa || '');
        setCognitif(data.cognitif || '');
        setAgeLangageExpressif(data.age_du_langage_expressif?.toString() || '');
        setAgeLangageReceptif(data.age_du_langage_receptif?.toString() || '');
        setMotriciteManuelle(data.motricite_manuelle || '');
        setMotriciteGlobale(data.motricite_globale || '');
        setImitation(data.imitation || '');
        setComportementsProblemes(data.comportements_problemes || '');
        setAutonomiePersonnelle(data.autonomie_personnelle || '');
        setNiveauStructurationVisuelle(data.niveau_structuration_visuelle || '');
        setDeveloppementSensoriel(data.developpement_sensoriel || '');
        setDistingueCorps(data.distingue_parties_corps || '');
        setNotionTemporalite(data.notion_de_la_temporalite || '');
        setNotionSpatialite(data.notion_de_la_spatialite || '');
        setLateralite(data.lateralite || '');
      } else {
        setErrorMessage(data.message || 'Impossible de charger l\'enfant');
      }
    } catch (error) {
      console.error('Fetch child error:', error);
      setErrorMessage(`Erreur réseau: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    const values = {
      nom,
      prenom,
      age,
      genre,
      niveau_tsa: niveauTSA,
      cognitif,
      age_du_langage_expressif: ageLangageExpressif,
      age_du_langage_receptif: ageLangageReceptif,
      motricite_manuelle: motriciteManuelle,
      motricite_globale: motriciteGlobale,
      imitation,
      comportements_problemes: comportementsProblemes,
      autonomie_personnelle: autonomiePersonnelle,
      niveau_structuration_visuelle: niveauStructurationVisuelle,
      developpement_sensoriel: developpementSensoriel,
      distingue_parties_corps: distingueCorps,
      notion_de_la_temporalite: notionTemporalite,
      notion_de_la_spatialite: notionSpatialite,
      lateralite,
    };

    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${SERVER_URL}/api/enfants/${childId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Profil mis à jour avec succès !');
        setIsEditing(false);
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        setErrorMessage(data.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Update child error:', error);
      setErrorMessage(`Erreur réseau: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DoctorLayout activeTab="patients">
        <StatusBar barStyle={Platform.OS === 'ios' ? 'dark-content' : 'dark-content'} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.loadingText}>Chargement du profil...</Text>
        </View>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout activeTab="patients">
      <StatusBar barStyle={Platform.OS === 'ios' ? 'dark-content' : 'dark-content'} />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={18} color="#7C3AED" />
            <Text style={styles.backText}>Retour</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Modifier l'enfant</Text>
            <Text style={styles.subtitle}>
              Mettez à jour les informations personnelles et le profil de développement de {prenom} {nom}.
            </Text>
          </View>

          {/* Affichage du profil en lecture */}
          {!isEditing && (
            <View style={styles.childProfileBox}>
              <Text style={styles.sectionTitle}>Profil actuel</Text>
              <View style={styles.profileCard}>
                <View style={styles.profileHeaderBlock}>
                  <Text style={styles.profileName}>{prenom} {nom}</Text>
                  <Text style={styles.profileMeta}>{age} ans · {genre}</Text>
                </View>

                <View style={styles.profileDetailsRow}>
                  <View style={styles.profileDetail}>
                    <Text style={styles.profileLabel}>Niveau TSA</Text>
                    <Text style={styles.profileValue}>{niveauTSA || '—'}</Text>
                  </View>
                  <View style={styles.profileDetail}>
                    <Text style={styles.profileLabel}>Cognitif</Text>
                    <Text style={styles.profileValue}>{cognitif || '—'}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Messages d'erreur et de succès */}
          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {successMessage ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          ) : null}

          {/* Formulaire d'édition */}
          {isEditing && (
            <>
              <View style={styles.fieldGroup}>
                <Text style={styles.sectionTitle}>Informations personnelles</Text>
                <View style={styles.formRow}>
                  {renderInput('Prénom', prenom, setPrenom)}
                  {renderInput('Nom', nom, setNom)}
                </View>
                <View style={styles.formRow}>
                  {renderInput('Age', age, setAge, 'numeric')}
                  {renderPicker('Genre', genre, setGenre, FIELD_OPTIONS.genre)}
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.sectionTitle}>Profil de développement</Text>
                <View style={styles.formRow}>
                  {renderPicker('Niveau TSA', niveauTSA, setNiveauTSA, FIELD_OPTIONS.niveau_tsa)}
                  {renderPicker('Cognitif', cognitif, setCognitif, FIELD_OPTIONS.cognitif)}
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.sectionTitle}>Langage</Text>
                <View style={styles.formRow}>
                  {renderInput('Age du langage expressif', ageLangageExpressif, setAgeLangageExpressif, 'numeric')}
                  {renderInput('Age du langage réceptif', ageLangageReceptif, setAgeLangageReceptif, 'numeric')}
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.sectionTitle}>Motricité</Text>
                <View style={styles.formRow}>
                  {renderPicker('Motricité manuelle', motriciteManuelle, setMotriciteManuelle, FIELD_OPTIONS.motricite)}
                  {renderPicker('Motricité globale', motriciteGlobale, setMotriciteGlobale, FIELD_OPTIONS.motricite)}
                </View>
                <View style={styles.formRow}>
                  {renderPicker('Latéralité', lateralite, setLateralite, FIELD_OPTIONS.lateralite)}
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.sectionTitle}>Comportements et imitation</Text>
                <View style={styles.formRow}>
                  {renderPicker('Imitation', imitation, setImitation, FIELD_OPTIONS.imitation)}
                  {renderPicker('Comportements problèmes', comportementsProblemes, setComportementsProblemes, FIELD_OPTIONS.comportement)}
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.sectionTitle}>Autonomie et sensoriel</Text>
                <View style={styles.formRow}>
                  {renderPicker('Autonomie personnelle', autonomiePersonnelle, setAutonomiePersonnelle, FIELD_OPTIONS.autonomie)}
                  {renderPicker('Développement sensoriel', developpementSensoriel, setDeveloppementSensoriel, FIELD_OPTIONS.developpement_sensoriel)}
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.sectionTitle}>Spatialité et temporalité</Text>
                <View style={styles.formRow}>
                  {renderPicker('Niveau structuration visuelle', niveauStructurationVisuelle, setNiveauStructurationVisuelle, FIELD_OPTIONS.structuration_visuelle)}
                  {renderPicker('Distingue parties du corps', distingueCorps, setDistingueCorps, FIELD_OPTIONS.distingue_parties_corps)}
                </View>
                <View style={styles.formRow}>
                  {renderPicker('Notion de temporalité', notionTemporalite, setNotionTemporalite, FIELD_OPTIONS.temporalite)}
                  {renderPicker('Notion de spatialité', notionSpatialite, setNotionSpatialite, FIELD_OPTIONS.spatialite)}
                </View>
              </View>
            </>
          )}

          {/* Boutons d'action */}
          <View style={styles.actionsWrapper}>
            {!isEditing ? (
              <>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setIsEditing(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="pencil" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.actionButtonText}>Modifier</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButtonSecondary}
                  onPress={() => navigation.goBack()}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionButtonSecondaryText}>Retour</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, saving && { opacity: 0.7 }]}
                  onPress={handleSave}
                  disabled={saving}
                  activeOpacity={0.8}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                      <Text style={styles.actionButtonText}>Sauvegarder</Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButtonSecondary}
                  onPress={() => {
                    setIsEditing(false);
                    fetchChild(); // Réinitialiser avec les données d'origine
                  }}
                  disabled={saving}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionButtonSecondaryText}>Annuler</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </DoctorLayout>
  );
}