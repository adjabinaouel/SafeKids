// MODIFICATION: Ajout de l'import DoctorLayout et remplacement de SafeAreaView par DoctorLayout pour intégrer la navigation médecin
// MODIFICATION: Ajout d'AsyncStorage pour récupérer le token et du fetch pour envoyer au backend
import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DoctorLayout from '../../../components/Navigation/DoctorNavigation';
import GlassButton from '../../../components/UI/GlassButton';
import styles from './AddChildrenStyles';

// ✅ MODIFICATION: URL du serveur ngrok — à changer si ngrok est relancé
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

// ✅ MODIFICATION: Champs obligatoires réduits aux informations personnelles uniquement
const requiredFields = [
  'nom', 'prenom', 'age', 'genre'
];

const renderPicker = (label, value, setValue, options, isRequired = false) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>
      {label}{isRequired && <Text style={{color: '#DC2626'}}>*</Text>}
    </Text>
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

const renderInput = (label, value, setValue, keyboardType = 'default', isRequired = false) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>
      {label}{isRequired && <Text style={{color: '#DC2626'}}>*</Text>}
    </Text>
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

export default function AddChildren() {
  const navigation = useNavigation();
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
  const [errorMessage, setErrorMessage] = useState('');
  // ✅ MODIFICATION: Ajout du state loading pour gérer l'envoi
  const [loading, setLoading] = useState(false);
  const [childProfile, setChildProfile] = useState(null);
  const [showInvite, setShowInvite] = useState(false);
  const [parentEmail, setParentEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdChild, setCreatedChild] = useState(null);

  const resetForm = () => {
    setNom('');
    setPrenom('');
    setAge('');
    setGenre('');
    setNiveauTSA('');
    setCognitif('');
    setAgeLangageExpressif('');
    setAgeLangageReceptif('');
    setMotriciteManuelle('');
    setMotriciteGlobale('');
    setImitation('');
    setComportementsProblemes('');
    setAutonomiePersonnelle('');
    setNiveauStructurationVisuelle('');
    setDeveloppementSensoriel('');
    setDistingueCorps('');
    setNotionTemporalite('');
    setNotionSpatialite('');
    setLateralite('');
  };

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const sendParentInvite = async () => {
    setInviteError('');
    setInviteMessage('');

    if (!parentEmail.trim() || !validateEmail(parentEmail)) {
      setInviteError('Saisissez une adresse email parent valide.');
      return;
    }

    const childId = childProfile?._id || createdChild?._id;
    if (!childId) {
      setInviteError('Aucun enfant sélectionné pour l’invitation.');
      return;
    }

    setInviteLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        setInviteError('Token manquant. Veuillez vous reconnecter.');
        return;
      }

      const response = await fetch(`${SERVER_URL}/api/enfants/${childId}/invite-parent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ parentEmail: parentEmail.trim().toLowerCase() }),
      });

      const data = await response.json();
      if (!response.ok) {
        const message = data.message || 'Impossible d’envoyer l’invitation.';
        setInviteError(message);
        Alert.alert('Invitation échouée', message);
      } else {
        const successMessage = data.message || 'Invitation envoyée au parent avec succès.';
        setInviteMessage(successMessage);
        setInviteError('');
        setParentEmail('');
        setShowInvite(false);
        Alert.alert('Invitation envoyée', successMessage);
      }
    } catch (error) {
      console.error('Invite parent error:', error);
      const message = `Erreur réseau: ${error.message}`;
      setInviteError(message);
      Alert.alert('Invitation échouée', message);
    } finally {
      setInviteLoading(false);
    }
  };

  const validateAndSubmit = async () => {
    const values = {
      nom,
      prenom,
      age: parseInt(age, 10),
      genre,
      niveau_tsa: niveauTSA,
      cognitif,
      age_du_langage_expressif: parseInt(ageLangageExpressif, 10) || null,
      age_du_langage_receptif: parseInt(ageLangageReceptif, 10) || null,
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

    const missing = requiredFields.filter((key) => !values[key]);
    if (missing.length > 0) {
      setErrorMessage('Merci de remplir tous les champs obligatoires avant de soumettre.');
      return;
    }

    const isValidInteger = (value) => /^[0-9]+$/.test(value);
    if (!isValidInteger(age)) {
      setErrorMessage('L’âge doit être un nombre entier valide.');
      return;
    }
    if (ageLangageExpressif !== '' && !isValidInteger(ageLangageExpressif)) {
      setErrorMessage('L’âge du langage expressif doit être un nombre entier valide.');
      return;
    }
    if (ageLangageReceptif !== '' && !isValidInteger(ageLangageReceptif)) {
      setErrorMessage('L’âge du langage réceptif doit être un nombre entier valide.');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      // ✅ MODIFICATION: Récupérer le token du stockage
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        setErrorMessage('Token manquant. Veuillez vous reconnecter.');
        setLoading(false);
        return;
      }

      // ✅ MODIFICATION: Envoyer les données au backend
      const response = await fetch(`${SERVER_URL}/api/enfants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || 'Erreur lors de l\'ajout de l\'enfant.');
        setLoading(false);
        return;
      }

      setChildProfile(data);
      setCreatedChild(data);
      setShowSuccess(true);
      setErrorMessage('');
      setLoading(false);
    } catch (error) {
      console.error('Add child error:', error);
      setErrorMessage(`Erreur réseau: ${error.message}`);
      setLoading(false);
    }
  };

  // ✅ Écran de succès après création d'un enfant
  if (showSuccess && createdChild) {
    return (
      <DoctorLayout activeTab="addChild">
        <StatusBar barStyle={Platform.OS === 'ios' ? 'dark-content' : 'dark-content'} />
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.successContainer}>
            {/* Bouton Inviter Parent en haut */}
            <View style={styles.inviteButtonContainer}>
              <TouchableOpacity
                style={styles.inviteButton}
                onPress={() => setShowInvite(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="mail" size={20} color="#FFFFFF" />
                <Text style={styles.inviteButtonText}>Inviter le parent</Text>
              </TouchableOpacity>
              {inviteMessage ? <Text style={styles.inviteStatusText}>{inviteMessage}</Text> : null}
            </View>

            {/* Message de succès */}
            <View style={styles.successMessage}>
              <Ionicons name="checkmark-circle" size={60} color="#10B981" />
              <Text style={styles.successTitle}>Enfant enregistré avec succès !</Text>
              <Text style={styles.successSubtitle}>
                Le profil de {createdChild.prenom} {createdChild.nom} a été créé.
              </Text>
            </View>

            {/* Petit profil de l'enfant */}
            <View style={styles.childProfileCard}>
              <View style={styles.childAvatar}>
                <Text style={styles.childInitials}>
                  {createdChild.prenom?.[0]}{createdChild.nom?.[0]}
                </Text>
              </View>

              <View style={styles.childInfo}>
                <Text style={styles.childName}>{createdChild.prenom} {createdChild.nom}</Text>
                <Text style={styles.childDetails}>
                  {createdChild.age} ans · {createdChild.genre} · TSA {createdChild.niveau_tsa}
                </Text>
                <Text style={styles.childCognitif}>Cognitif: {createdChild.cognitif || '—'}</Text>
              </View>
            </View>

            {/* Bouton Retour */}
            <TouchableOpacity
              style={styles.backToFormButton}
              onPress={() => {
                setShowSuccess(false);
                setCreatedChild(null);
                resetForm();
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={20} color="#7C3AED" />
              <Text style={styles.backToFormText}>Retour au formulaire</Text>
            </TouchableOpacity>
          </View>

          {/* Modal d'invitation parent */}
          {showInvite && (
            <View style={styles.inviteModal}>
              <View style={styles.inviteModalContent}>
                <Text style={styles.inviteModalTitle}>Inviter le parent</Text>
                <Text style={styles.inviteModalSubtitle}>
                  Envoyez une invitation à {createdChild.prenom} {createdChild.nom}
                </Text>

                <TextInput
                  style={styles.inviteInput}
                  value={parentEmail}
                  onChangeText={setParentEmail}
                  placeholder="Email du parent"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                {inviteError ? <Text style={styles.inviteError}>{inviteError}</Text> : null}
                {inviteMessage ? <Text style={styles.inviteSuccess}>{inviteMessage}</Text> : null}

                <View style={styles.inviteButtons}>
                  <TouchableOpacity
                    style={styles.inviteCancelButton}
                    onPress={() => {
                      setShowInvite(false);
                      setParentEmail('');
                      setInviteError('');
                      setInviteMessage('');
                    }}
                  >
                    <Text style={styles.inviteCancelText}>Annuler</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.inviteSendButton, inviteLoading && styles.inviteSendButtonDisabled]}
                    onPress={sendParentInvite}
                    disabled={inviteLoading}
                  >
                    {inviteLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.inviteSendText}>Envoyer</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout activeTab="addChild">
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
            <Text style={styles.title}>Ajouter un enfant</Text>
            <Text style={styles.subtitle}>
              Complétez les informations personnelles et le profil de développement pour enregistrer un nouvel enfant.
            </Text>
          </View>

          {/* ✅ MODIFICATION: Bouton Inviter Parent toujours visible dans l'interface principale */}
          <View style={styles.inviteButtonContainer}>
            <TouchableOpacity
              style={styles.inviteButton}
              onPress={() => setShowInvite(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="mail" size={20} color="#FFFFFF" />
              <Text style={styles.inviteButtonText}>Inviter le parent</Text>
            </TouchableOpacity>
            {inviteMessage ? <Text style={styles.inviteStatusText}>{inviteMessage}</Text> : null}
          </View>

          {/* Modal d'invitation parent dans le formulaire principal */}
          {showInvite && !childProfile && !showSuccess && (
            <View style={styles.childProfileBox}>
              <Text style={styles.sectionTitle}>Inviter un parent</Text>
              <Text style={styles.inviteLabel}>Adresse e-mail du parent</Text>
              <TextInput
                style={[styles.input, styles.inviteInput]}
                value={parentEmail}
                onChangeText={(text) => { setParentEmail(text); setInviteError(''); setInviteMessage(''); }}
                placeholder="parent@example.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <View style={styles.inviteButtonsRow}>
                <TouchableOpacity
                  style={styles.inviteCancelButton}
                  onPress={() => { setShowInvite(false); setParentEmail(''); }}
                >
                  <Text style={styles.inviteCancelText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.inviteSubmitButton, inviteLoading && { opacity: 0.7 }]}
                  onPress={() => { setInviteError('Enregistrez d\'abord un enfant pour inviter un parent.'); }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.inviteSubmitText}>Envoyer</Text>
                </TouchableOpacity>
              </View>
              {inviteMessage ? <Text style={styles.successText}>{inviteMessage}</Text> : null}
              {inviteError ? <Text style={styles.errorText}>{inviteError}</Text> : null}
            </View>
          )}

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <View style={styles.fieldGroup}>
            <Text style={styles.sectionTitle}>Informations personnelles</Text>
            <View style={styles.formRow}>
              {renderInput('Prénom', prenom, setPrenom, 'default', true)}
              {renderInput('Nom', nom, setNom, 'default', true)}
            </View>
            <View style={styles.formRow}>
              {renderInput('Âge (en années)', age, setAge, 'numeric', true)}
              {renderPicker('Genre', genre, setGenre, FIELD_OPTIONS.genre, true)}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.sectionTitle}>Profil clinique</Text>
            <View style={styles.formRow}>
              {renderPicker('Niveau TSA', niveauTSA, setNiveauTSA, FIELD_OPTIONS.niveau_tsa)}
              {renderPicker('Profil cognitif', cognitif, setCognitif, FIELD_OPTIONS.cognitif)}
            </View>
            <View style={styles.formRow}>
              {renderInput('Âge langage expressif', ageLangageExpressif, setAgeLangageExpressif, 'numeric')}
              {renderInput('Âge langage réceptif', ageLangageReceptif, setAgeLangageReceptif, 'numeric')}
            </View>
            <View style={styles.formRow}>
              {renderPicker('Motricité manuelle', motriciteManuelle, setMotriciteManuelle, FIELD_OPTIONS.motricite)}
              {renderPicker('Motricité globale', motriciteGlobale, setMotriciteGlobale, FIELD_OPTIONS.motricite)}
            </View>
            <View style={styles.formRow}>
              {renderPicker('Latéralité', lateralite, setLateralite, FIELD_OPTIONS.lateralite)}
            </View>
            <View style={styles.formRow}>
              {renderPicker('Imitation', imitation, setImitation, FIELD_OPTIONS.imitation)}
              {renderPicker('Comportements problèmes', comportementsProblemes, setComportementsProblemes, FIELD_OPTIONS.comportement)}
            </View>
            <View style={styles.formRow}>
              {renderPicker('Autonomie personnelle', autonomiePersonnelle, setAutonomiePersonnelle, FIELD_OPTIONS.autonomie)}
              {renderPicker('Structuration visuelle', niveauStructurationVisuelle, setNiveauStructurationVisuelle, FIELD_OPTIONS.structuration_visuelle)}
            </View>
            <View style={styles.formRow}>
              {renderPicker('Développement sensoriel', developpementSensoriel, setDeveloppementSensoriel, FIELD_OPTIONS.developpement_sensoriel)}
              {renderPicker('Distingue parties du corps', distingueCorps, setDistingueCorps, FIELD_OPTIONS.distingue_parties_corps)}
            </View>
            <View style={styles.formRow}>
              {renderPicker('Notion de temporalité', notionTemporalite, setNotionTemporalite, FIELD_OPTIONS.temporalite)}
              {renderPicker('Notion de spatialité', notionSpatialite, setNotionSpatialite, FIELD_OPTIONS.spatialite)}
            </View>
          </View>

          <View style={styles.submitWrapper}>
            <GlassButton
              label={loading ? 'Envoi...' : 'Enregistrer l\'enfant'}
              onPress={validateAndSubmit}
              fullWidth
              variant="primary"
              disabled={loading}
            />
            {loading && (
              <ActivityIndicator
                size="small"
                color="#7C3AED"
                style={{ marginTop: 10 }}
              />
            )}
            <Text style={styles.note}>
              Les champs marqués d'une étoile rouge sont obligatoires.
            </Text>
          </View>
        </View>
      </ScrollView>
    </DoctorLayout>
  );
  

}
