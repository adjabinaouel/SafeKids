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
  KeyboardAvoidingView, 
  Platform,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './SignupPage.Styles.js';

const COLORS = {
  primary: '#7C3AED',
  white: '#FFFFFF',
  textLight: '#64748B',
};

export default function SignupPage({ navigation }) {
  const [role, setRole] = useState('parent');
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [focusField, setFocusField] = useState(null);

  
  const ROLES = [
    { id: 'admin', label: 'ADMIN', icon: '🛡️' },
    { id: 'parent', label: 'PARENT', icon: '👨‍👩‍👧' },
  ];

  const handleSignup = () => {
    if (!role) return Alert.alert('Erreur', 'Choisissez votre rôle');
    if (!prenom.trim() || !nom.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      return Alert.alert('Erreur', 'Remplissez tous les champs');
    }
    if (password !== confirmPassword) return Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
    if (!accepted) return Alert.alert('Erreur', 'Acceptez les conditions');

    Alert.alert('Succès', `Compte ${role.toUpperCase()} créé pour ${prenom} ${nom} !`);
    navigation.navigate(role === 'admin' ? 'DashboardAdmin' : 'DashboardParent');
  };

  const renderInput = (label, value, onChange, icon, type = 'default', secure = false, fieldKey) => {
    const isFocused = focusField === fieldKey;
    return (
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, isFocused && { color: COLORS.primary }]}>{label}</Text>
        <View style={[styles.inputWrapper, isFocused && styles.inputWrapperActive]}>
          <Ionicons 
            name={icon} 
            size={20} 
            color={isFocused ? COLORS.primary : COLORS.textLight} 
            style={styles.inputIcon} 
          />
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChange}
            placeholder={label}
            placeholderTextColor="#94A3B8"
            keyboardType={type}
            secureTextEntry={secure}
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
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconBg}>
              <Ionicons name="shield-checkmark" size={44} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>Créer un compte</Text>
            <Text style={styles.subtitle}>Rejoignez SafeKids pour un accompagnement sécurisé.</Text>
          </View>

          <View style={{ marginBottom: 24 }}>
            <Text style={styles.sectionTitle}>Votre Profil</Text>
            <View style={styles.roleGrid}>
              {ROLES.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.roleCard, role === item.id && styles.roleCardActive]}
                  onPress={() => setRole(item.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.roleIcon}>{item.icon}</Text>
                  <Text style={[styles.roleText, role === item.id && styles.roleTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.form}>
            <View style={styles.row}>
              {renderInput('Prénom', prenom, setPrenom, 'person-outline', 'default', false, 'prenom')}
              {renderInput('Nom', nom, setNom, 'person-outline', 'default', false, 'nom')}
            </View>

            {renderInput('E-mail', email, setEmail, 'mail-outline', 'email-address', false, 'email')}
            {renderInput('Mot de passe', password, setPassword, 'lock-closed-outline', 'default', true, 'password')}
            {renderInput('Confirmation', confirmPassword, setConfirmPassword, 'lock-closed-outline', 'default', true, 'confirm')}

            <View style={styles.termsRow}>
              <Switch
                value={accepted}
                onValueChange={setAccepted}
                trackColor={{ false: '#E2E8F0', true: COLORS.primary }}
                thumbColor={COLORS.white}
                ios_backgroundColor="#E2E8F0"
              />
              <Text style={styles.termsText}>
                J'accepte les <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Conditions</Text> et la Politique de confidentialité.
              </Text>
            </View>

            <TouchableOpacity 
              style={[styles.primaryButton, !accepted && styles.buttonDisabled]} 
              onPress={handleSignup}
              disabled={!accepted}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>S'inscrire</Text>
              <Ionicons name="arrow-forward" size={20} color={COLORS.white} style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Déjà un compte ? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}



