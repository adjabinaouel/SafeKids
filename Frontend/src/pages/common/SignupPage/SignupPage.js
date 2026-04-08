import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import styles from './SignupPage.Styles.js';

const COLORS = {
  primary: '#7C3AED',
  textLight: '#8B7AA8',
  white: '#FFFFFF',
};

const NB_ENFANTS_OPTIONS = [
  { label: 'Selectionnez...', value: '' },
  { label: '1 enfant',          value: '1'  },
  { label: '2 enfants',         value: '2'  },
  { label: '3 enfants',         value: '3'  },
  { label: '4 enfants',         value: '4'  },
  { label: '5 enfants',         value: '5'  },
  { label: '6 enfants ou plus', value: '6+' },
];

// ✅ URL ngrok — change cette ligne à chaque fois que tu relances ngrok
const SERVER_URL = 'https://unfailed-branden-healable.ngrok-free.dev';

export default function SignupPage({ navigation }) {
  const [prenom, setPrenom]                   = useState('');
  const [nom, setNom]                         = useState('');
  const [email, setEmail]                     = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nbEnfants, setNbEnfants]             = useState('');
  const [accepted, setAccepted]               = useState(false);
  const [focusField, setFocusField]           = useState(null);
  const [errorMsg, setErrorMsg]               = useState('');

  const clearError = () => setErrorMsg('');

  const handleSignup = async () => {
    clearError();

    if (!prenom.trim() || !nom.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setErrorMsg('Veuillez remplir tous les champs.');
      return;
    }
    if (!nbEnfants) {
      setErrorMsg("Veuillez indiquer le nombre d'enfants autistes.");
      return;
    }
    if (password.length < 8) {
      setErrorMsg('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Les mots de passe ne correspondent pas.');
      return;
    }
    if (!accepted) {
      setErrorMsg("Veuillez accepter les conditions d'utilisation.");
      return;
    }

    try {
      const response = await fetch(`${SERVER_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          nom: nom.trim(),
          prenom: prenom.trim(),
          email: email.trim().toLowerCase(),
          motDePasse: password,
          nbrEnfantsAutistes: nbEnfants,
          telephone: '',
        }),
      });

      // ✅ FIX : vérification content-type avant parsing JSON
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Réponse non-JSON:', text);
        setErrorMsg('Erreur serveur. Vérifiez que ngrok est lancé.');
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.message || "Erreur lors de l'inscription");
        return;
      }

      Alert.alert('Succès', 'Compte créé avec succès !\nVous pouvez maintenant vous connecter.');
      navigation.navigate('Login');

    } catch (error) {
      console.error('Signup error:', error);
      if (error.message?.includes('Network request failed')) {
        setErrorMsg('Impossible de joindre le serveur. Vérifiez que ngrok est lancé.');
      } else {
        setErrorMsg(`Erreur : ${error.message}`);
      }
    }
  };

  // ✅ FIX lisibilité : autoCapitalize adapté par type de champ
  const renderInput = (label, value, onChange, iconName, type, secure, fieldKey, isName = false) => {
    const focused = focusField === fieldKey;
    return (
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, focused && { color: COLORS.primary }]}>
          {label}
        </Text>
        <View style={[styles.inputWrapper, focused && styles.inputWrapperActive]}>
          <Ionicons
            name={iconName}
            size={18}
            color={focused ? COLORS.primary : COLORS.textLight}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={(v) => { onChange(v); clearError(); }}
            placeholder={label}
            placeholderTextColor="#A78BFA"
            keyboardType={type || 'default'}
            secureTextEntry={secure || false}
            // ✅ FIX : 'words' pour les noms, 'none' pour email/password
            autoCapitalize={isName ? 'words' : 'none'}
            autoCorrect={false}
            onFocus={() => setFocusField(fieldKey)}
            onBlur={() => setFocusField(null)}
            underlineColorAndroid="transparent"
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
      >
        <View style={styles.card}>

          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={16} color={COLORS.primary} />
            <Text style={styles.backText}>Retour</Text>
          </TouchableOpacity>

          <View style={styles.brand}>
            <View style={styles.brandIcon}>
              <Ionicons name="shield-checkmark" size={20} color={COLORS.white} />
            </View>
            <Text style={styles.brandName}>
              {'Safe'}<Text style={{ color: COLORS.primary }}>{'Kids'}</Text>
            </Text>
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>
              {'Creer un '}<Text style={styles.titleAccent}>{'compte'}</Text>
            </Text>
            <Text style={styles.subtitle}>
              Rejoignez SafeKids pour un accompagnement securise et apaise.
            </Text>
          </View>

          {!!errorMsg && (
            <View style={[styles.alert, styles.alertError]}>
              <Text style={styles.alertText}>{errorMsg}</Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Votre profil</Text>
          <View style={styles.roleGrid}>
            <View style={[styles.roleCard, styles.roleCardActive]}>
              <Ionicons name="people-outline" size={22} color={COLORS.primary} style={{ marginBottom: 5 }} />
              <Text style={[styles.roleText, styles.roleTextActive]}>PARENT</Text>
            </View>
          </View>

          {/* ✅ isName=true pour prenom/nom → autoCapitalize="words" */}
          <View style={styles.row}>
            {renderInput('Prenom', prenom, setPrenom, 'person-outline', 'default', false, 'prenom', true)}
            <View style={{ width: 10 }} />
            {renderInput('Nom', nom, setNom, 'person-outline', 'default', false, 'nom', true)}
          </View>

          <View style={styles.fullField}>
            {renderInput('Adresse e-mail', email, setEmail, 'mail-outline', 'email-address', false, 'email')}
          </View>
          <View style={styles.fullField}>
            {renderInput('Mot de passe', password, setPassword, 'lock-closed-outline', 'default', true, 'pass')}
          </View>
          <View style={styles.fullField}>
            {renderInput('Confirmer le mot de passe', confirmPassword, setConfirmPassword, 'lock-closed-outline', 'default', true, 'conf')}
          </View>

          <View style={styles.fullField}>
            <Text style={styles.inputLabel}>{"Nombre d'enfants autistes"}</Text>
            <View style={styles.pickerWrapper}>
              <Ionicons name="puzzle-outline" size={18} color="#A78BFA" style={styles.inputIcon} />
              <Picker
                selectedValue={nbEnfants}
                onValueChange={(v) => { setNbEnfants(v); clearError(); }}
                style={styles.picker}
                itemStyle={styles.pickerItem}
                dropdownIconColor="#A78BFA"
                mode="dropdown"
              >
                {NB_ENFANTS_OPTIONS.map((opt) => (
                  <Picker.Item
                    key={opt.value}
                    label={opt.label}
                    value={opt.value}
                    color={opt.value === '' ? '#A78BFA' : '#1A1035'}  // ✅ FIX lisibilité
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.termsRow}>
            <Switch
              value={accepted}
              onValueChange={(v) => { setAccepted(v); clearError(); }}
              trackColor={{ false: '#E2E8F0', true: COLORS.primary }}
              thumbColor={COLORS.white}
              ios_backgroundColor="#E2E8F0"
            />
            <Text style={styles.termsText}>
              {"J'accepte les "}
              <Text style={styles.termsLink}>{"Conditions d'utilisation"}</Text>
              {" et la Politique de confidentialite de SafeKids."}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, !accepted && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={!accepted}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>{"S'inscrire"}</Text>
            <Ionicons name="arrow-forward" size={18} color={COLORS.white} style={{ marginLeft: 7 }} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>{"Deja un compte ? "}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Se connecter</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}