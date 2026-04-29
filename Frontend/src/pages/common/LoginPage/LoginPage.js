import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../hooks/useAuth';
import styles from './LoginPage.Styles.js';

const COLORS = {
  primary: '#7C3AED',
  textLight: '#8B7AA8',
  white: '#FFFFFF',
};

const ROLES = [
  { id: 'Admin',   label: 'ADMIN',   icon: 'shield'  },
  { id: 'Parent',  label: 'PARENT',  icon: 'people'  },
  { id: 'Medecin', label: 'MÉDECIN', icon: 'medkit'  },
];

export default function LoginPage({ navigation }) {
  const { signIn } = useAuth();
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [role,       setRole]       = useState('Parent');
  const [focusField, setFocusField] = useState(null);
  const [errorMsg,   setErrorMsg]   = useState('');
  const [loading,    setLoading]    = useState(false);

  const clearError = () => setErrorMsg('');

  const handleLogin = async () => {
    clearError();

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);

    try {
      // ✅ Utiliser la méthode signIn du contexte d'authentification
      const result = await signIn(email, password, role.toLowerCase());

      if (!result.success) {
        setErrorMsg(result.error || 'Connexion échouée. Vérifiez vos identifiants.');
        return;
      }

      // ✅ Navigation vers l'écran approprié selon le rôle
      // Note: La session est gérée par AuthProvider, mais on doit naviguer
      switch (role.toLowerCase()) {
        case 'admin':
          navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
          break;
        case 'medecin':
          navigation.reset({ index: 0, routes: [{ name: 'DashboardMedecin' }] });
          break;
        case 'parent':
        default:
          navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
          break;
      }

    } catch (error) {
      console.error('Login error:', error);
      if (error.message?.includes('Network request failed')) {
        setErrorMsg('Impossible de joindre le serveur. Vérifiez que ngrok est lancé.');
      } else {
        setErrorMsg(`Erreur : ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (label, value, onChange, iconName, type = 'default', secure = false, key) => {
    const focused = focusField === key;
    return (
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, focused && { color: COLORS.primary }]}>{label}</Text>
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
            keyboardType={type}
            secureTextEntry={secure}
            // ✅ FIX lisibilité : pas d'autoCapitalize sur email/password
            autoCapitalize="none"
            autoCorrect={false}
            onFocus={() => setFocusField(key)}
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

          <View style={styles.brand}>
            <View style={styles.brandIcon}>
              <Ionicons name="shield-checkmark" size={20} color={COLORS.white} />
            </View>
            <Text style={styles.brandName}>
              Safe<Text style={{ color: COLORS.primary }}>Kids</Text>
            </Text>
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>
              Ravi de vous <Text style={styles.titleAccent}>revoir</Text>
            </Text>
            <Text style={styles.subtitle}>
              Connectez-vous pour accéder à votre espace d'accompagnement apaisé.
            </Text>
          </View>

          {!!errorMsg && (
            <View style={[styles.alert, styles.alertError]}>
              <Text style={styles.alertText}>{errorMsg}</Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Sélectionnez votre rôle</Text>
          <View style={styles.roleGrid}>
            {ROLES.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.roleCard, role === item.id && styles.roleCardActive]}
                onPress={() => { setRole(item.id); clearError(); }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={role === item.id ? COLORS.primary : COLORS.textLight}
                  style={{ marginBottom: 4 }}
                />
                <Text style={[styles.roleText, role === item.id && styles.roleTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.form}>
            {renderInput('Adresse e-mail', email, setEmail, 'mail-outline', 'email-address', false, 'email')}
            {renderInput('Mot de passe', password, setPassword, 'lock-closed-outline', 'default', true, 'password')}
          </View>

          <TouchableOpacity style={{ alignSelf: 'flex-end' }}>
            <Text style={styles.forgotPassword}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.buttonText}>Se connecter</Text>
                <Ionicons name="arrow-forward" size={18} color={COLORS.white} style={{ marginLeft: 7 }} />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Pas encore de compte ? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.footerLink}>Créer un compte</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}