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
  { label: '1 enfant',            value: '1'  },
  { label: '2 enfants',           value: '2'  },
  { label: '3 enfants',           value: '3'  },
  { label: '4 enfants',           value: '4'  },
  { label: '5 enfants',           value: '5'  },
  { label: '6 enfants ou plus',   value: '6+' },
];

const SERVER_IP = '10.243.127.170';

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
      const response = await fetch(`http://${SERVER_IP}:5000/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: nom.trim(),
          prenom: prenom.trim(),
          email: email.trim(),
          motDePasse: password,
          nbrEnfantsAutistes: nbEnfants,
          telephone: '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.message || "Erreur lors de l'inscription");
        return;
      }

      Alert.alert('Succès', 'Compte créé avec succès !\nVous pouvez maintenant vous connecter.');
      navigation.navigate('Login');

    } catch (error) {
      setErrorMsg(
        'Impossible de contacter le serveur.\nVérifie que le backend est lancé et que tu es sur le même WiFi.'
      );
      console.error(error);
    }
  };

  const renderInput = (label, value, onChange, iconName, type, secure, fieldKey) => {
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
            placeholderTextColor="#C4B5FD"
            keyboardType={type || 'default'}
            secureTextEntry={secure || false}
            autoCapitalize={type === 'email-address' ? 'none' : 'sentences'}
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

      {/* ✅ FIX ANDROID : pas de KeyboardAvoidingView, ScrollView direct */}
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
      >
        <View style={styles.card}>

          {/* Bouton retour */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={16} color={COLORS.primary} />
            <Text style={styles.backText}>Retour</Text>
          </TouchableOpacity>

          {/* Brand */}
          <View style={styles.brand}>
            <View style={styles.brandIcon}>
              <Ionicons name="shield-checkmark" size={20} color={COLORS.white} />
            </View>
            <Text style={styles.brandName}>
              {'Safe'}<Text style={{ color: COLORS.primary }}>{'Kids'}</Text>
            </Text>
          </View>

          {/* Titre */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {'Creer un '}<Text style={styles.titleAccent}>{'compte'}</Text>
            </Text>
            <Text style={styles.subtitle}>
              Rejoignez SafeKids pour un accompagnement securise et apaise.
            </Text>
          </View>

          {/* Alerte erreur */}
          {!!errorMsg && (
            <View style={[styles.alert, styles.alertError]}>
              <Text style={styles.alertText}>{errorMsg}</Text>
            </View>
          )}

          {/* Profil parent */}
          <Text style={styles.sectionTitle}>Votre profil</Text>
          <View style={styles.roleGrid}>
            <View style={[styles.roleCard, styles.roleCardActive]}>
              <Ionicons
                name="people-outline"
                size={22}
                color={COLORS.primary}
                style={{ marginBottom: 5 }}
              />
              <Text style={[styles.roleText, styles.roleTextActive]}>PARENT</Text>
            </View>
          </View>

          {/* Prenom + Nom côte à côte */}
          <View style={styles.row}>
            {renderInput('Prenom', prenom, setPrenom, 'person-outline', 'default', false, 'prenom')}
            <View style={{ width: 10 }} />
            {renderInput('Nom', nom, setNom, 'person-outline', 'default', false, 'nom')}
          </View>

          {/* Champs pleine largeur */}
          <View style={styles.fullField}>
            {renderInput('Adresse e-mail', email, setEmail, 'mail-outline', 'email-address', false, 'email')}
          </View>
          <View style={styles.fullField}>
            {renderInput('Mot de passe', password, setPassword, 'lock-closed-outline', 'default', true, 'pass')}
          </View>
          <View style={styles.fullField}>
            {renderInput('Confirmer le mot de passe', confirmPassword, setConfirmPassword, 'lock-closed-outline', 'default', true, 'conf')}
          </View>

          {/* Dropdown enfants autistes */}
          <View style={styles.fullField}>
            <Text style={styles.inputLabel}>{"Nombre d'enfants autistes"}</Text>
            <View style={styles.pickerWrapper}>
              <Ionicons
                name="puzzle-outline"
                size={18}
                color="#A78BFA"
                style={styles.inputIcon}
              />
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
                    color={opt.value === '' ? '#C4B5FD' : '#4C1D95'}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Switch conditions */}
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

          {/* Bouton s'inscrire */}
          <TouchableOpacity
            style={[styles.primaryButton, !accepted && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={!accepted}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>{"S'inscrire"}</Text>
            <Ionicons
              name="arrow-forward"
              size={18}
              color={COLORS.white}
              style={{ marginLeft: 7 }}
            />
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